import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { prepareMasterProjectParams, useMasterProjects } from "@/hooks/useMasterProject";
import { useDebounce } from "@/hooks/useDebounce";
import { projectService } from "@/services/projectService";
import {
    useArchiveProject,
    useRestoreProject,
    useExportProjects,
    useImportProjects,
} from "@/hooks/mutations/useProjectMutations";
import { stateOptions, masterProjectStatusFilterOptions as statusOptions } from "../constants/projectOptions";
import { purposeFilterOptions } from "../../shared/constants/projectOptions";
import { useProjectFilterOptions } from "@/hooks/useProjectFilters";

export const useMasterProjectsLogic = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    // Master Project state filter (Active / Archive / Not Feasible / All)
    const [selectedState, setSelectedState] = useState("active");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [sorting, setSorting] = useState([]);

    // New filter states
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    const [selectedSubSubcategory, setSelectedSubSubcategory] = useState("");
    const [selectedCreator, setSelectedCreator] = useState("");
    const [selectedPurpose, setSelectedPurpose] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectModalMode, setProjectModalMode] = useState("create");
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedProjectIds, setSelectedProjectIds] = useState([]);

    useEffect(() => {
        setSelectedProjectIds([]);
    }, [currentPage, searchTerm, selectedState, selectedStatus, selectedCategory, selectedSubcategory, selectedSubSubcategory, selectedCreator, selectedPurpose, dateFrom, dateTo]);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploadSuccessModalOpen, setIsUploadSuccessModalOpen] = useState(false);

    const [columnVisibility, setColumnVisibility] = useState({});
    const [columnPinning, setColumnPinning] = useState({});
    const [columnSizing, setColumnSizing] = useState({});

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const sortBy = sorting.length > 0 ? sorting[0].id : "";
    const sortOrder = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "";

    // Map high-level state to backend filters:
    // IsActive  IsFeasible   State
    //   1          0        Not Feasible
    //   1          1        Active
    //   0          1        Archive
    //   0          0        Not Feasible
    const getStateFilters = (state) => {
        switch (state) {
            case "active":
                return { isActive: "true", isFeasible: "true" };
            case "archived":
                return { isActive: "false", isFeasible: "true" };
            case "not_feasible":
                // Include both active and archived projects that are not feasible
                return { isActive: "all", isFeasible: "false" };
            case "all":
            default:
                return { isActive: "all", isFeasible: "all" };
        }
    };

    const { isActive: isActiveFilter, isFeasible: isFeasibleFilter } = getStateFilters(selectedState);
    const exportParams = prepareMasterProjectParams({
        searchTerm: debouncedSearchTerm,
        isActive: isActiveFilter,
        isFeasible: isFeasibleFilter,
        status: selectedStatus,
        page: currentPage,
        limit: itemsPerPage,
    });

    const archiveProjectMutation = useArchiveProject();
    const restoreProjectMutation = useRestoreProject();
    const exportProjectsMutation = useExportProjects();
    const importProjectsMutation = useImportProjects();

    const {
        data: projectsData,
        isLoading,
        error,
        refetch,
    } = useMasterProjects({
        searchTerm: debouncedSearchTerm,
        isActive: isActiveFilter,
        isFeasible: isFeasibleFilter,
        status: selectedStatus,
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        subSubcategory: selectedSubSubcategory,
        createdBy: selectedCreator,
        purpose: selectedPurpose,
        dateFrom,
        dateTo,
    });

    const projects = projectsData?.data ?? [];
    const pagination = projectsData?.pagination;

    const { categories, subcategories, subSubcategories, users } = useProjectFilterOptions(selectedCategory, selectedSubcategory, projectsData?.filterOptions);

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleStateChange = useCallback((value) => {
        setSelectedState(value);
        setCurrentPage(1);
    }, []);

    const handleStatusChange = useCallback((value) => {
        setSelectedStatus(value);
        setCurrentPage(1);
    }, []);

    const handleCategoryChange = useCallback((value) => {
        setSelectedCategory(value);
        setSelectedSubcategory("");
        setSelectedSubSubcategory("");
        setCurrentPage(1);
    }, []);

    const handleSubcategoryChange = useCallback((value) => {
        setSelectedSubcategory(value);
        setSelectedSubSubcategory("");
        setCurrentPage(1);
    }, []);

    const handleSubSubcategoryChange = useCallback((value) => {
        setSelectedSubSubcategory(value);
        setCurrentPage(1);
    }, []);

    const handleCreatorChange = useCallback((value) => {
        setSelectedCreator(value);
        setCurrentPage(1);
    }, []);

    const handlePurposeChange = useCallback((value) => {
        setSelectedPurpose(value);
        setCurrentPage(1);
    }, []);

    const handleDateFromChange = useCallback((value) => {
        setDateFrom(value);
        setCurrentPage(1);
    }, []);

    const handleDateToChange = useCallback((value) => {
        setDateTo(value);
        setCurrentPage(1);
    }, []);

    const handleAddProject = () => {
        setSelectedProject(null);
        setProjectModalMode("create");
        setIsProjectModalOpen(true);
    };

    const handleEditProject = (project) => {
        setSelectedProject(project);
        setProjectModalMode("update");
        setIsProjectModalOpen(true);
    };

    const handleArchiveProject = (project) => {
        setSelectedProject(project);
        setIsArchiveModalOpen(true);
    };

    const handleRestoreProject = (project) => {
        setSelectedProject(project);
        setIsRestoreModalOpen(true);
    };

    const handleViewProjectDetails = (project) => {
        navigate(`${project._id}`, {
            state: { projectCode: project.masterProject?.code },
        });
    };

    const handleExportProjects = async (pageOverride, limitOverride) => {
        await exportProjectsMutation.mutateAsync({
            ...exportParams,
            page: pageOverride ?? exportParams.page,
            limit: limitOverride ?? exportParams.limit,
        });
    };

    const handleImportProjects = async (file) => {
        const result = await importProjectsMutation.mutateAsync(file);
        await refetch();
        return result;
    };

    const handleProjectConfirm = async (data) => {
        try {
            if (projectModalMode === "create") {
                // For create mode, data contains projectData and members/memberIds
                const { projectData, memberIds, members } = data;
                
                // Use the new API endpoint that handles both project creation and member addition
                await projectService.createProjectWithMembers({
                    ...projectData,
                    memberIds: memberIds || [],
                    members: members || []
                });
                
                refetch();
            } else {
                // For update mode, data is just the form data
                await projectService.updateProject(selectedProject._id, data);
                refetch();
            }
        } catch (err) {
            console.error("Failed to save project:", err);
            throw err;
        }
    };

    const handleArchiveConfirm = async (project) => {
        try {
            if (Array.isArray(project)) {
                const results = await Promise.allSettled(
                    project.map((p) => archiveProjectMutation.mutateAsync(p._id))
                );
                const succeeded = results.filter((r) => r.status === "fulfilled").length;
                const failed = results.filter((r) => r.status === "rejected");

                if (succeeded > 0) {
                    toast.success(`${succeeded} project(s) archived successfully`);
                }
                if (failed.length > 0) {
                    console.error("Some archive operations failed:", failed);
                    const firstError = failed[0].reason?.response?.data?.message || failed[0].reason?.message || "Some projects could not be archived.";
                    toast.error(`Failed to archive ${failed.length} project(s): ${firstError}`);
                }
                setSelectedProjectIds([]);
            } else {
                await archiveProjectMutation.mutateAsync(project._id);
            }
        } catch (err) {
            console.error("Failed to archive project:", err);
            throw err;
        }
    };

    const handleRestoreConfirm = async (project) => {
        try {
            await restoreProjectMutation.mutateAsync(project._id);
        } catch (err) {
            console.error("Failed to restore project:", err);
            throw err;
        }
    };

    const filters = useMemo(
        () => {
            return [
                {
                    id: "status",
                    value: selectedStatus,
                    onChange: handleStatusChange,
                    options: statusOptions,
                    placeholder: "All Status",
                },
                {
                    id: "state",
                    value: selectedState,
                    onChange: handleStateChange,
                    options: stateOptions,
                    placeholder: "Active",
                },
                {
                    id: "category",
                    value: selectedCategory,
                    onChange: handleCategoryChange,
                    options: [{ label: "All Categories", value: "" }, ...categories],
                    placeholder: "All Categories",
                },
                {
                    id: "subcategory",
                    value: selectedSubcategory,
                    onChange: handleSubcategoryChange,
                    options: [{ label: "All Subcategories", value: "" }, ...subcategories],
                    placeholder: "All Subcategories",
                },
                {
                    id: "subSubcategory",
                    value: selectedSubSubcategory,
                    onChange: handleSubSubcategoryChange,
                    options: [{ label: "All Sub-Subcategories", value: "" }, ...subSubcategories],
                    placeholder: "All Sub-Subcategories",
                },
                {
                    id: "creator",
                    value: selectedCreator,
                    onChange: handleCreatorChange,
                    options: [{ label: "All Creators", value: "" }, ...users],
                    placeholder: "All Creators",
                },
                {
                    id: "purpose",
                    value: selectedPurpose,
                    onChange: handlePurposeChange,
                    options: purposeFilterOptions,
                    placeholder: "All Purpose",
                },
            ];
        },
        [selectedState, selectedStatus, selectedCategory, selectedSubcategory, selectedSubSubcategory, selectedCreator, selectedPurpose, handleStateChange, handleStatusChange, handleCategoryChange, handleSubcategoryChange, handleSubSubcategoryChange, handleCreatorChange, handlePurposeChange, categories, subcategories, subSubcategories, users]
    );

    return {
        searchTerm,
        setSearchTerm,
        selectedState,
        selectedStatus,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        sorting,
        setSorting,
        isProjectModalOpen,
        setIsProjectModalOpen,
        projectModalMode,
        isArchiveModalOpen,
        setIsArchiveModalOpen,
        isRestoreModalOpen,
        setIsRestoreModalOpen,
        isUploadModalOpen,
        setIsUploadModalOpen,
        isUploadSuccessModalOpen,
        setIsUploadSuccessModalOpen,
        selectedProject,
        setSelectedProject,
        selectedProjectIds,
        setSelectedProjectIds,
        columnVisibility,
        setColumnVisibility,
        columnPinning,
        setColumnPinning,
        columnSizing,
        setColumnSizing,
        projects,
        pagination,
        isLoading,
        error,
        handleSearchChange,
        handleStateChange,
        handleStatusChange,
        handleAddProject,
        handleEditProject,
        handleArchiveProject,
        handleRestoreProject,
        handleViewProjectDetails,
        handleExportProjects,
        handleImportProjects,
        handleProjectConfirm,
        handleArchiveConfirm,
        handleRestoreConfirm,
        filters,
        isExportingProjects: exportProjectsMutation.isPending,
        isImportingProjects: importProjectsMutation.isPending,
        importProjectsResult: importProjectsMutation.data || null,
        importProjectsError:
            importProjectsMutation.error?.response?.data?.error ||
            importProjectsMutation.error?.message ||
            null,
        // New filter states
        selectedCategory,
        selectedSubcategory,
        selectedSubSubcategory,
        selectedCreator,
        selectedPurpose,
        dateFrom,
        dateTo,
        handleCategoryChange,
        handleSubcategoryChange,
        handleSubSubcategoryChange,
        handleCreatorChange,
        handlePurposeChange,
        handleDateFromChange,
        handleDateToChange,
    };
};
