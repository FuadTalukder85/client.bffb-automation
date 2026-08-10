import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
    useCleanlinessItems,
    useCreateCleanlinessItem,
    useUpdateCleanlinessItem,
    useArchiveCleanlinessItem,
    useRestoreCleanlinessItem,
    useExportCleanlinessItems,
} from "@/hooks/useCleaning";
import { useDebounce } from "@/hooks/useDebounce";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import { hasPermission } from "@/lib/utils";
import { cleanlinessItemStateOptions as stateOptions, INITIAL_PAGINATION } from "../constants/cleanlinessItemsOptions";

export const useCleanlinessItemsLogic = () => {
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

    const [columnVisibility, setColumnVisibility] = useState({});
    const [columnPinning, setColumnPinning] = useState({});
    const [columnSizing, setColumnSizing] = useState({});

    const { permissions = [] } = useUserPermissions();
    const canExport = hasPermission(permissions, PERMISSIONS.CLEANING.EXPORT);
    const canManage = hasPermission(permissions, PERMISSIONS.CLEANING.MANAGE) || 
                      hasPermission(permissions, PERMISSIONS.CLEANING.UPDATE);
    const canCreate = hasPermission(permissions, PERMISSIONS.CLEANING.CREATE);
    const hasCleaningPermission = hasPermission(permissions, PERMISSIONS.CLEANING.READ) ||
                                  hasPermission(permissions, PERMISSIONS.CLEANING.MANAGE) ||
                                  hasPermission(permissions, "*") ||
                                  Boolean(itemsData?.permissionMessage);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const sortBy = sorting.length > 0 ? sorting[0].id : "";
    const sortOrder = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "";

    const {
        data: itemsData,
        isLoading,
        error,
    } = useCleanlinessItems({
        searchTerm: debouncedSearchTerm,
        isActive: selectedState === "all" ? "all" : selectedState === "active" ? "true" : "false",
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
    });

    const createMutation = useCreateCleanlinessItem();
    const updateMutation = useUpdateCleanlinessItem();
    const archiveMutation = useArchiveCleanlinessItem();
    const restoreMutation = useRestoreCleanlinessItem();
    const exportMutation = useExportCleanlinessItems();

    const cleanlinessItems = itemsData?.data ?? [];
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
            console.error("Failed to save cleanliness item:", err);
            throw err;
        }
    };

    const handleArchiveConfirm = async (item) => {
        try {
            if (Array.isArray(item)) {
                const results = await Promise.allSettled(
                    item.map((r) => archiveMutation.mutateAsync(r._id || r.id))
                );
                const succeeded = results.filter((res) => res.status === "fulfilled").length;
                const failed = results.filter((res) => res.status === "rejected");
                if (succeeded > 0) toast.success(`${succeeded} cleanliness item(s) archived successfully`);
                if (failed.length > 0) toast.error(`Failed to archive ${failed.length} cleanliness item(s)`);
                setSelectedRowIds([]);
            } else {
                await archiveMutation.mutateAsync(item._id || item.id);
            }
            setIsArchiveModalOpen(false);
        } catch (err) {
            console.error("Failed to archive item:", err);
            throw err;
        }
    };

    const handleRestoreConfirm = async (item) => {
        try {
            await restoreMutation.mutateAsync(item._id);
            setIsRestoreModalOpen(false);
        } catch (err) {
            console.error("Failed to restore item:", err);
            throw err;
        }
    };

    const handleExport = async () => {
        try {
            const response = await exportMutation.mutateAsync(
                {
                    searchTerm: debouncedSearchTerm,
                    isActive: selectedState === "all" ? "all" : selectedState === "active" ? "true" : "false",
                },
                {
                    meta: { skipGlobalErrorToast: true },
                }
            );

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            // Generate filename with date
            const now = new Date();
            const d = String(now.getDate()).padStart(2, "0");
            const m = String(now.getMonth() + 1).padStart(2, "0");
            const yy = String(now.getFullYear()).slice(-2);
            const filename = `cleanliness-items-${d}-${m}-${yy}.xlsx`;

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to export items:", err);
            throw err;
        }
    };

    const filters = useMemo(
        () => [
            {
                id: "state",
                value: selectedState,
                onChange: handleStateChange,
                options: stateOptions,
                placeholder: "Active",
            },
        ],
        [selectedState, handleStateChange]
    );

    return {
        searchTerm,
        selectedState,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        sorting,
        setSorting,
        isItemModalOpen,
        setIsItemModalOpen,
        itemModalMode,
        isArchiveModalOpen,
        setIsArchiveModalOpen,
        isRestoreModalOpen,
        setIsRestoreModalOpen,
        selectedItem,
        setSelectedItem,
        selectedRowIds,
        setSelectedRowIds,
        columnVisibility,
        setColumnVisibility,
        columnPinning,
        setColumnPinning,
        columnSizing,
        setColumnSizing,
        cleanlinessItems,
        pagination,
        isLoading,
        error,
        handleSearchChange,
        handleStateChange,
        handleAddItem,
        handleEditItem,
        handleArchiveItem,
        handleRestoreItem,
        confirmAddItem: handleItemConfirm,
        confirmUpdateItem: handleItemConfirm,
        confirmArchiveItem: handleArchiveConfirm,
        confirmRestoreItem: handleRestoreConfirm,
        handleExport,
        filters,
        canExport,
        canManage,
        canCreate,
        hasCleaningPermission,
        permissionMessage: itemsData?.permissionMessage || "Permission available",
    };
};
