import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
    useMaintenanceItems,
    useCreateMaintenanceItem,
    useUpdateMaintenanceItem,
    useArchiveMaintenanceItem,
    useRestoreMaintenanceItem,
    useExportMaintenanceItems,
} from "@/hooks/useMaintenance";
import { useDebounce } from "@/hooks/useDebounce";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import { hasPermission } from "@/lib/utils";
import { maintenanceItemStateOptions as stateOptions, INITIAL_PAGINATION } from "../constants/maintenanceItemsOptions";

export const useMaintenanceItemsLogic = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedState, setSelectedState] = useState("active");
    const [currentPage, setCurrentPage] = useState(INITIAL_PAGINATION.currentPage);
    const [itemsPerPage, setItemsPerPage] = useState(INITIAL_PAGINATION.itemsPerPage);
    const [sorting, setSorting] = useState([]);

    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [itemModalMode, setItemModalMode] = useState("create");
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedRowIds, setSelectedRowIds] = useState([]);

    useEffect(() => {
        setSelectedRowIds([]);
    }, [currentPage, searchTerm, selectedState]);

    const { permissions = [] } = useUserPermissions();
    const canExport = hasPermission(permissions, PERMISSIONS.MAINTENANCE.EXPORT);
    const canManage = hasPermission(permissions, PERMISSIONS.MAINTENANCE.MANAGE) || 
                      hasPermission(permissions, PERMISSIONS.MAINTENANCE.UPDATE);
    const canCreate = hasPermission(permissions, PERMISSIONS.MAINTENANCE.CREATE);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const sortBy = sorting.length > 0 ? sorting[0].id : "createdAt";
    const sortOrder = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "desc";

    const {
        data: itemsData,
        isLoading,
        error,
    } = useMaintenanceItems({
        searchTerm: debouncedSearchTerm,
        isActive: selectedState === "all" ? "all" : selectedState === "active" ? "true" : "false",
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
    });

    const createMutation = useCreateMaintenanceItem();
    const updateMutation = useUpdateMaintenanceItem();
    const archiveMutation = useArchiveMaintenanceItem();
    const restoreMutation = useRestoreMaintenanceItem();
    const exportMutation = useExportMaintenanceItems();

    const maintenanceItems = itemsData?.data ?? [];
    const pagination = itemsData?.pagination;

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleStateChange = useCallback((value) => {
        setSelectedState(value);
        setCurrentPage(1);
    }, []);

    const handleAddItem = () => {
        setSelectedItem(null);
        setItemModalMode("create");
        setIsItemModalOpen(true);
    };

    const handleEditItem = (item) => {
        setSelectedItem(item);
        setItemModalMode("update");
        setIsItemModalOpen(true);
    };

    const handleArchiveItem = (item) => {
        setSelectedItem(item);
        setIsArchiveModalOpen(true);
    };

    const handleRestoreItem = (item) => {
        setSelectedItem(item);
        setIsRestoreModalOpen(true);
    };

    const handleItemConfirm = async (data) => {
        try {
            if (itemModalMode === "create") {
                await createMutation.mutateAsync(data);
            } else {
                await updateMutation.mutateAsync({ id: selectedItem._id, data });
            }
            setIsItemModalOpen(false);
        } catch (err) {
            console.error("Failed to save maintenance item:", err);
            throw err;
        }
    };

    const handleArchiveConfirm = async (item) => {
        try {
            const itemToArchive = item || selectedItem;
            if (Array.isArray(itemToArchive)) {
                const results = await Promise.allSettled(
                    itemToArchive.map((r) => archiveMutation.mutateAsync(r._id || r.id))
                );
                const succeeded = results.filter((res) => res.status === "fulfilled").length;
                const failed = results.filter((res) => res.status === "rejected");
                if (succeeded > 0) toast.success(`${succeeded} maintenance item(s) archived successfully`);
                if (failed.length > 0) toast.error(`Failed to archive ${failed.length} maintenance item(s)`);
                setSelectedRowIds([]);
            } else {
                await archiveMutation.mutateAsync(itemToArchive._id || itemToArchive.id);
            }
            setIsArchiveModalOpen(false);
        } catch (err) {
            console.error("Failed to archive maintenance item:", err);
        }
    };

    const handleRestoreConfirm = async () => {
        try {
            await restoreMutation.mutateAsync(selectedItem._id);
            setIsRestoreModalOpen(false);
        } catch (err) {
            console.error("Failed to restore maintenance item:", err);
        }
    };

    const handleExport = () => {
        return exportMutation.mutateAsync(
            {
                searchTerm: debouncedSearchTerm,
                isActive: selectedState === "all" ? "all" : selectedState === "active" ? "true" : "false",
            },
            {
                meta: { skipGlobalErrorToast: true },
            }
        );
    };

    const filters = [
        {
            key: "state",
            label: "Status",
            options: stateOptions,
            value: selectedState,
            onChange: handleStateChange,
        },
    ];

    return {
        searchTerm,
        selectedState,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        sorting,
        setSorting,
        maintenanceItems,
        pagination,
        isLoading,
        error,
        handleSearchChange,
        handleStateChange,
        handleAddItem,
        handleEditItem,
        handleArchiveItem,
        handleRestoreItem,
        handleItemConfirm,
        handleArchiveConfirm,
        handleRestoreConfirm,
        handleExport,
        filters,
        isItemModalOpen,
        setIsItemModalOpen,
        isArchiveModalOpen,
        setIsArchiveModalOpen,
        isRestoreModalOpen,
        setIsRestoreModalOpen,
        selectedItem,
        setSelectedItem,
        selectedRowIds,
        setSelectedRowIds,
        itemModalMode,
        canExport,
        canManage,
        canCreate,
    };
};
