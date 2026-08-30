import PageHeader from '@/components/common/page-header';
import { ThemeToggle } from '@/components/ThemeToggle';
import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Download, Loader2 } from 'lucide-react';
import { GrRotateRight } from 'react-icons/gr';
import { CiCircleCheck } from 'react-icons/ci';
import { DatePicker } from '@/components/ui/DatePicker/DatePicker';
import { DesktopFilterPills } from '@/components/ui/FilterInput/DesktopFilterInput';
import { FilterInput } from '@/components/ui/FilterInput/FilterInput';
import ProductionScheduleTable from './components/ProductionScheduleTable';
import MobileProductionScheduleTable from './components/MobileProductionScheduleCard';
import { useIsMobile } from '@/hooks/useIsMobile';
import { RiArrowDropLeftLine, RiArrowDropRightLine } from 'react-icons/ri';
import { 
    useProductionSchedulesByDate, 
    useUpsertProductionSchedule,
    useUpdateTimeSlot, 
    useRemoveTimeSlot,
    useArchiveProductionSchedule,
    useRestoreProductionSchedule,
    useExportProductionSchedules, 
    TIME_SLOTS 
} from '@/hooks/useProductionSchedules';
import { useProjects } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';
import { useRecipes } from '@/hooks/useRecipes';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { hasPermission } from '@/lib/utils';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/apiError';

const getResponseMessage = (response, fallback) =>
    response?.message || response?.data?.message || fallback;

const ProductionSchedulePage = () => {
    const isMobile = useIsMobile();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [editingProject, setEditingProject] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedState, setSelectedState] = useState('active');
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadComplete, setDownloadComplete] = useState(false);
    
    // User permissions
    const { permissions = [] } = useUserPermissions();
    const canCreateSchedule = hasPermission(permissions, PERMISSIONS.PRODUCTION_SCHEDULE.CREATE);

    // Fetch all active users for responsible person selection
    const { data: allUsers = [] } = useUsers({ activeOnly: true });

    // Fetch recipes for recipe code selection
    const { data: recipesData } = useRecipes({ limit: 1000, isActive: 'true' });
    const allRecipes = useMemo(() => recipesData?.data || recipesData?.items || [], [recipesData]);

    // New row state for adding projects
    const [newRow, setNewRow] = useState(null);

    // Fetch production schedules for the selected date
    const {
        data: schedulesData,
        isLoading: isLoadingSchedules,
        error: schedulesError,
        refetch: refetchSchedules,
    } = useProductionSchedulesByDate({
        date: selectedDate,
        page: 1,
        limit: 100,
        isActive: selectedState === 'active' ? 'true' : selectedState === 'archived' ? 'false' : 'all',
    });

    // Fetch projects for dropdown
    const {
        data: projectsData,
        isLoading: isLoadingProjects,
    } = useProjects({
        page: 1,
        limit: 100,
    });

    // Mutations
    const upsertScheduleMutation = useUpsertProductionSchedule();
    const updateTimeSlotMutation = useUpdateTimeSlot();
    const removeTimeSlotMutation = useRemoveTimeSlot();
    const archiveMutation = useArchiveProductionSchedule();
    const restoreMutation = useRestoreProductionSchedule();
    const exportScheduleMutation = useExportProductionSchedules();

    const activityOptions = [
        { value: 'w', label: 'w', fullName: 'Weighing' },
        { value: 'm', label: 'm', fullName: 'Mixing' },
        { value: 'pr', label: 'pr', fullName: 'Preparation' },
        { value: 'pk', label: 'pk', fullName: 'Packaging' },
    ];

    // State options for All/Active/Archive filter
    const stateOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Archive', value: 'archived' },
        { label: 'All', value: 'all' },
    ];

    const handleStateChange = (value) => {
        setSelectedState(value);
    };



    // Transform API data to component format
    const scheduleData = useMemo(() => {
        const existingData = schedulesData?.data || [];
        return newRow ? [...existingData, newRow] : existingData;
    }, [schedulesData, newRow]);

    // Get projects list for dropdown
    const projectsList = useMemo(() => {
        if (!projectsData?.data) return [];
        return projectsData.data.map(project => ({
            id: project._id,
            code: project.masterProject?.code || project.code || 'Unknown',
            name: project.masterProject?.title || project.title || '',
            purposeName: project.masterProject?.purposeDetails || project.masterProject?.purposeName || project.masterProject?.purpose || project.purposeDetails || project.purposeName || project.applicationLab?.purposeName || '',
            recipeCode: project.applicationLab?.recipeCode || '',
            recipeName: project.applicationLab?.recipeName || '',
        }));
    }, [projectsData]);

    // Get available projects (excluding those already in schedule for this date)
    const availableProjectsList = useMemo(() => {
        const existingProjectIds = new Set(
            scheduleData
                .filter(row => !row.isNewRow)
                .map(row => row.projectId)
        );
        return projectsList.filter(project => !existingProjectIds.has(project.id));
    }, [projectsList, scheduleData]);

    const handlePrevDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
        setNewRow(null);
    };

    const handleNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate);
        setNewRow(null);
    };

    const handleDateChange = (e) => {
        const newDate = new Date(e.target.value);
        setSelectedDate(newDate);
        setNewRow(null);
    };

    const handleActivityChange = useCallback((rowId, timeSlot, value) => {
        const row = scheduleData.find(r => r.id === rowId);
        if (!row) return;

        const formattedDate = selectedDate.toISOString().split('T')[0];

        if (row.isNewRow) {
            // Handle new row locally first
            if (value === '' || value === null) {
                // Remove the entry from the schedule
                setNewRow(prev => {
                    if (!prev) return null;
                    const newSchedule = { ...prev.schedule };
                    delete newSchedule[timeSlot];
                    const newEntries = prev.scheduleEntries?.filter(e => e.timeSlot !== timeSlot) || [];
                    return { ...prev, schedule: newSchedule, scheduleEntries: newEntries };
                });
            } else {
                // Add/update the entry locally
                setNewRow(prev => {
                    if (!prev) return null;
                    const newSchedule = { ...prev.schedule, [timeSlot]: value };
                    const existingIndex = prev.scheduleEntries?.findIndex(e => e.timeSlot === timeSlot);
                    let newEntries = [...(prev.scheduleEntries || [])];
                    if (existingIndex >= 0) {
                        newEntries[existingIndex] = { ...newEntries[existingIndex], action: value };
                    } else {
                        newEntries.push({ timeSlot, action: value });
                    }
                    return { ...prev, schedule: newSchedule, scheduleEntries: newEntries };
                });
                
                // If project is selected, save to server
                if (row.projectId && row.projectId !== 'new') {
                    updateTimeSlotMutation.mutate({
                        projectId: row.projectId,
                        date: formattedDate,
                        timeSlot: timeSlot,
                        action: value,
                    }, {
                        onSuccess: () => {
                            refetchSchedules();
                            setNewRow(null); // Clear new row since it's now on server
                        }
                    });
                }
            }
        } else {
            // Handle existing server row
            const existingEntry = row.scheduleEntries?.find(entry => entry.timeSlot === timeSlot);
            
            if (existingEntry) {
                if (value === '' || value === null) {
                    removeTimeSlotMutation.mutate({
                        projectId: row.projectId,
                        date: formattedDate,
                        timeSlot: timeSlot,
                    }, { onSuccess: () => refetchSchedules() });
                } else {
                    updateTimeSlotMutation.mutate({
                        projectId: row.projectId,
                        date: formattedDate,
                        timeSlot: timeSlot,
                        action: value,
                    }, { onSuccess: () => refetchSchedules() });
                }
            } else if (value) {
                updateTimeSlotMutation.mutate({
                    projectId: row.projectId,
                    date: formattedDate,
                    timeSlot: timeSlot,
                    action: value,
                }, { onSuccess: () => refetchSchedules() });
            }
        }
    }, [scheduleData, selectedDate, updateTimeSlotMutation, removeTimeSlotMutation, refetchSchedules]);

    // Save or update an entire schedule row (metadata + slots)
    const handleSaveScheduleRow = useCallback(async (rowId, payload = {}) => {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const row = scheduleData.find(r => r.id === rowId);
        const projectId = payload.projectId || row?.projectId;

        if (!projectId || projectId === 'new') {
            toast.error('Please select a project');
            return;
        }

        // Convert schedule object map to schedule array items if needed
        let scheduleArray = [];
        if (Array.isArray(payload.schedule)) {
            scheduleArray = payload.schedule;
        } else if (payload.schedule && typeof payload.schedule === 'object') {
            scheduleArray = Object.entries(payload.schedule)
                .filter(([_, action]) => Boolean(action))
                .map(([timeSlot, action]) => ({ timeSlot, action }));
        } else if (row?.schedule && typeof row.schedule === 'object') {
            scheduleArray = Object.entries(row.schedule)
                .filter(([_, action]) => Boolean(action))
                .map(([timeSlot, action]) => ({ timeSlot, action }));
        }

        // Convert responsiblePersons to string IDs if objects
        const responsiblePersonIds = Array.isArray(payload.responsiblePersons)
            ? payload.responsiblePersons.map(u => (typeof u === 'object' ? (u._id || u.id) : u)).filter(Boolean)
            : Array.isArray(row?.responsiblePersons)
                ? row.responsiblePersons.map(u => (typeof u === 'object' ? (u._id || u.id) : u)).filter(Boolean)
                : [];

        upsertScheduleMutation.mutate({
            projectId,
            date: formattedDate,
            schedule: scheduleArray,
            recipeId: payload.recipeId !== undefined ? payload.recipeId : (row?.recipeId || null),
            recipeCode: payload.recipeCode !== undefined ? payload.recipeCode : (row?.recipeCode || null),
            responsiblePersons: responsiblePersonIds,
        }, {
            onSuccess: () => {
                setNewRow(null);
                setEditingProject(null);
                refetchSchedules();
                toast.success('Schedule saved successfully');
            },
            onError: (err) => {
                toast.error(getApiErrorMessage(err, 'Failed to save schedule'));
            }
        });
    }, [scheduleData, selectedDate, upsertScheduleMutation, refetchSchedules]);

    // Handle project selection for new row
    const handleProjectCodeChange = useCallback((rowId, projectCode) => {
        const project = projectsList.find(p => p.code === projectCode);
        if (!project) return;

        const row = scheduleData.find(r => r.id === rowId);
        if (!row || !row.isNewRow) {
            setEditingProject(null);
            return;
        }

        // Find default recipe for project if any from allRecipes or project
        const projectRecipes = (allRecipes || []).filter(r => r.project?._id === project.id || r.project === project.id);
        const defaultRecipe = projectRecipes[0];
        const defaultRecipeCode = defaultRecipe?.recipeCode || project.recipeCode || '';
        const defaultRecipeName = defaultRecipe?.recipeName || defaultRecipe?.name || project.recipeName || '';
        const defaultRecipeId = defaultRecipe?._id || null;

        setNewRow(prev => {
            if (!prev) return null;
            return {
                ...prev,
                projectId: project.id,
                projectCode: project.code,
                projectName: project.name,
                purposeName: project.purposeName,
                recipeCode: defaultRecipeCode,
                recipeName: defaultRecipeName,
                recipeId: defaultRecipeId,
            };
        });
        setEditingProject(null);
    }, [projectsList, scheduleData, allRecipes]);

    const handleProjectClick = (rowId) => {
        const row = scheduleData.find(r => r.id === rowId);
        if (row?.isNewRow) {
            setEditingProject(rowId);
        }
    };

    // Handle deleting/archiving a row
    const handleDeleteRow = useCallback(async (rowId) => {
        const row = scheduleData.find(r => r.id === rowId);
        if (!row) return;

        if (row.isNewRow) {
            // Just clear the new row
            setNewRow(null);
            toast.success('Row removed');
            return;
        }

        // Archive the entire schedule for this project
        archiveMutation.mutate(rowId, {
            onSuccess: (response) => {
                refetchSchedules();
                // toast.success(getResponseMessage(response, 'Schedule archived successfully'));
            },
            onError: (error) => {
                toast.error(getApiErrorMessage(error, 'Failed to archive schedule'));
            },
        });
    }, [scheduleData, archiveMutation, refetchSchedules]);

    const handleRestoreRow = useCallback(async (rowId) => {
        const row = scheduleData.find(r => r.id === rowId);
        if (!row) return;

        restoreMutation.mutate(rowId, {
            onSuccess: (response) => {
                refetchSchedules();
                // toast.success(getResponseMessage(response, 'Schedule restored successfully'));
            },
            onError: (error) => {
                toast.error(getApiErrorMessage(error, 'Failed to restore schedule'));
            },
        });
    }, [scheduleData, restoreMutation, refetchSchedules]);

    // Handle adding a new row
    const handleAddRow = useCallback(() => {
        if (projectsList.length === 0) {
            toast.error('No projects available. Please create a project first.');
            return;
        }

        if (availableProjectsList.length === 0) {
            toast.warning('All projects already have schedule entries for this date.');
            return;
        }

        const newRowId = `new-${Date.now()}`;
        
        // Create a new local row
        setNewRow({
            id: newRowId,
            projectId: 'new',
            projectCode: '',
            projectName: '',
            purposeName: '',
            recipeCode: '',
            recipeName: '',
            schedule: {},
            scheduleEntries: [],
            isNewRow: true,
        });
        
        // Automatically start editing the project for this new row
        setEditingProject(newRowId);
        toast.info('Select a project for the new row');
    }, [projectsList, availableProjectsList]);

    const handleToggleExpand = () => {
        setIsExpanded(prev => !prev);
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        setDownloadComplete(false);

        try {
const response = await exportScheduleMutation.mutateAsync(
            {
                date: selectedDate,
                isActive: selectedState === 'active' ? 'true' : selectedState === 'archived' ? 'false' : 'all',
            },
            {
                meta: { skipGlobalErrorToast: true },
            }
        );

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            const contentDisposition = response.headers['content-disposition'];
            let filename = 'production-schedule.xlsx';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setDownloadComplete(true);
            toast.success(getResponseMessage(response, 'Schedule downloaded successfully'));

            setTimeout(() => {
                setDownloadComplete(false);
            }, 2000);
        } catch (error) {
            const errorMessage = getApiErrorMessage(error, "");
            if (errorMessage) {
                toast.error(errorMessage);
            }
        } finally {
            setIsDownloading(false);
        }
    };

    // Filtered schedule data (search removed; server-side filter via `selectedState` remains)
    const filteredScheduleData = useMemo(() => scheduleData, [scheduleData]);

    // Loading state
    const isLoading = isLoadingSchedules || isLoadingProjects ||
                      upsertScheduleMutation.isPending ||
                      updateTimeSlotMutation.isPending ||
                      removeTimeSlotMutation.isPending ||
                      archiveMutation.isPending ||
                      restoreMutation.isPending ||
                      exportScheduleMutation.isPending;

    return (
        <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
            {/* Header Section */}
            <div className="flex items-center justify-between flex-none ms-0 lg:mx-5">
                <PageHeader
                    title="Production Schedule"
                    className="py-4 text-heading md:p-0 md:m-0"
                />         
                <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4 md:hidden">
                    <button 
                        onClick={handleDownload}
                        disabled={isDownloading || downloadComplete || isLoading}
                        className="flex items-center justify-center w-11 h-7.5 bg-primary text-white rounded-[26px] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? (
                            <GrRotateRight className="w-4 h-4 animate-spin" />
                        ) : downloadComplete ? (
                            <CiCircleCheck className="w-5 h-5" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                    </button>
                </div>
                <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
                    <ThemeToggle />
                </div>
            </div>

            {/* Date Navigation */}
            <div className="flex flex-col gap-3 md:mx-5 md:flex-row md:items-center md:justify-between  my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4">
                {/* Date Selector and Search */}
                <div className="flex items-center justify-between gap-4 md:justify-start">
                    <div className="flex items-center">
                        <button 
                            onClick={handlePrevDay}
                            disabled={isLoading}
                            className="flex items-center justify-center h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 bg-[#EEEBF4] dark:bg-primary-shade-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                        >
                            <RiArrowDropLeftLine className="w-5 h-5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5" />
                        </button>
                        <div className="min-w-[150px] lg:min-w-[80px] xl:min-w-[106px] 2xl:min-w-[120px] 3xl:min-w-[150px] [&_svg.lucide-calendar]:hidden [&_span]:text-center! border border-[#EEEBF4] dark:border-primary rounded-md">
                            <DatePicker
                                value={selectedDate.toISOString().split('T')[0]}
                                onChange={handleDateChange}
                                className="text-[15px] font-semibold text-center text-primary dark:text-white py-0.5"
                                transparent={true}
                                position="bottom"
                            />
                        </div>
                        <button 
                            onClick={handleNextDay}
                            disabled={isLoading}
                            className="flex items-center justify-center h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 bg-[#EEEBF4] dark:bg-primary-shade-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                        >
                            <RiArrowDropRightLine className="w-5 h-5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5" />
                        </button>
                    </div>

                    {/* Mobile: show state filter (mobile dropdown) next to date selector */}
                    <div className="md:hidden ml-3 shrink-0 w-24">
                        <FilterInput
                            config={{
                                options: stateOptions,
                                value: selectedState,
                                onValueChange: handleStateChange,
                                placeholder: 'Active',
                                defaultValue: 'active',
                            }}
                        />
                    </div>
                </div>

                {/* Filter Pills - Desktop */}
                <div className="items-center hidden md:flex">
                    <DesktopFilterPills
                        value={selectedState}
                        options={stateOptions}
                        onChange={handleStateChange}
                    />
                </div>

                {/* Legend - Desktop */}
                <div className="hidden md:flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 border border-[#EEEBF4] dark:border-primary p-1.5 lg:p-0.5 xl:p-0.5 2xl:p-1 3xl:p-1.5 rounded-full bg-[#F9F8FA] dark:bg-primary-shade-2">
                    <div className="flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 bg-white dark:bg-background px-3 lg:px-2 xl:px-2 2xl:px-2.5 3xl:px-3 py-1 rounded-full border border-[#EEEBF480]">
                        <div className="w-3 lg:w-1.5 xl:w-2 2xl:w-2.5 3xl:w-3 h-3 lg:h-1.5 xl:h-2 2xl:h-2.5 3xl:h-3 rounded-full bg-[#FFD0A5]"></div>
                        <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-gray-700 dark:text-gray-300">Weighing</span>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 bg-white dark:bg-background px-3 lg:px-2 xl:px-2 2xl:px-2.5 3xl:px-3 py-1 rounded-full border border-[#EEEBF480]">
                        <div className="w-3 lg:w-1.5 xl:w-2 2xl:w-2.5 3xl:w-3 h-3 lg:h-1.5 xl:h-2 2xl:h-2.5 3xl:h-3 rounded-full bg-[#CDF3E6]"></div>
                        <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-gray-700 dark:text-gray-300">Mixing</span>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 bg-white dark:bg-background px-3 lg:px-2 xl:px-2 2xl:px-2.5 3xl:px-3 py-1 rounded-full border border-[#EEEBF480]">
                        <div className="w-3 lg:w-1.5 xl:w-2 2xl:w-2.5 3xl:w-3 h-3 lg:h-1.5 xl:h-2 2xl:h-2.5 3xl:h-3 rounded-full bg-[#3FE5FF]"></div>
                        <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-gray-700 dark:text-gray-300">Preparation</span>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 bg-white dark:bg-background px-3 lg:px-2 xl:px-2 2xl:px-2.5 3xl:px-3 py-1 rounded-full border border-[#EEEBF480]">
                        <div className="w-3 lg:w-1.5 xl:w-2 2xl:w-2.5 3xl:w-3 h-3 lg:h-1.5 xl:h-2 2xl:h-2.5 3xl:h-3 rounded-full bg-[#FFE2F4]"></div>
                        <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-gray-700 dark:text-gray-300">Packaging</span>
                    </div>
                </div>

                <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex"> 
                    <button 
                        onClick={handleDownload}
                        disabled={isDownloading || downloadComplete || isLoading}
                        className="flex items-center gap-2 px-6 lg:px-3.5 xl:px-4 2xl:px-4.5 3xl:px-6 py-2.5 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? (
                            <GrRotateRight className="w-5 h-5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 animate-spin" />
                        ) : downloadComplete ? (
                            <CiCircleCheck className="w-5 h-5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5" />
                        ) : (
                            <Download className="w-5 h-5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5" />
                        )}
                        <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium">Download</span>
                    </button>
                </div>

                {/* Legend - Mobile */}
                <div className="md:hidden bg-[#F9F8FA] dark:bg-gray-800 border border-[#EEEBF4] py-1 rounded-full flex items-center justify-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FFD0A5]"></div>
                        <span className="text-[9px] text-gray-[#0D111A] font-semibold dark:text-gray-300">Weighing</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#CDF3E6]"></div>
                        <span className="text-[9px] text-gray-[#0D111A] font-semibold dark:text-gray-300">Mixing</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#3FE5FF]"></div>
                        <span className="text-[9px] text-gray-[#0D111A] font-semibold dark:text-gray-300">Preparation</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FFE2F4]"></div>
                        <span className="text-[9px] text-gray-[#0D111A] font-semibold dark:text-gray-300">Packaging</span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {schedulesError && (
                <div className="p-4 mx-5 mb-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400">
                        Error loading schedules: {schedulesError.message}
                    </p>
                </div>
            )}

            {/* Schedule Table */}
            <div className="flex flex-col flex-1 w-full min-h-0">
                {/* Desktop Table */}
                {!isMobile && (
                    <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
                        <ProductionScheduleTable
                            scheduleData={filteredScheduleData}
                            timeSlots={TIME_SLOTS}
                            activityOptions={activityOptions}
                            projectsList={availableProjectsList}
                            editingProject={editingProject}
                            isExpanded={isExpanded}
                            isLoading={isLoading}
                            canCreateSchedule={canCreateSchedule}
                            allUsers={allUsers}
                            allRecipes={allRecipes}
                            onActivityChange={handleActivityChange}
                            onProjectCodeChange={handleProjectCodeChange}
                            onSaveRow={handleSaveScheduleRow}
                            onProjectClick={handleProjectClick}
                            onDeleteRow={handleDeleteRow}
                            onRestoreRow={handleRestoreRow}
                            onToggleExpand={handleToggleExpand}
                            isArchived={selectedState === 'archived'}
                            setEditingProject={setEditingProject}
                            onAddRow={handleAddRow}
                        />
                    </div>
                )}

                {/* Mobile View */}
                {isMobile && (
                    <div className="md:hidden">
                        <MobileProductionScheduleTable
                            scheduleData={filteredScheduleData}
                            timeSlots={TIME_SLOTS}
                            activityOptions={activityOptions}
                            projectsList={availableProjectsList}
                            editingProject={editingProject}
                            canCreateSchedule={canCreateSchedule}
                            allUsers={allUsers}
                            allRecipes={allRecipes}
                            onActivityChange={handleActivityChange}
                            onSaveRow={handleSaveScheduleRow}
                            onDeleteRow={handleDeleteRow}
                            onRestoreRow={handleRestoreRow}
                            isArchived={selectedState === 'archived'}
                            onAddRow={handleAddRow}
                            onProjectCodeChange={handleProjectCodeChange}
                            onProjectClick={handleProjectClick}
                            setEditingProject={setEditingProject}
                            isExpanded={isExpanded}
                            onToggleExpand={handleToggleExpand}
                            isLoading={isLoading}
                        />
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductionSchedulePage;
