import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDebounce } from "@/hooks/useDebounce";
import { useProjectsForSamplePreparation } from "@/hooks/useSamples";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { statusOptions, periodOptions } from "../constants/projectOptions";
import { hasPermission } from "@/lib/utils";

export const useSamplePreparationLogic = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedPeriod, setSelectedPeriod] = useState("running");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [sorting, setSorting] = useState([]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus, selectedPeriod]);

    const [columnVisibility, setColumnVisibility] = useState({});
    const [columnPinning, setColumnPinning] = useState({});
    const [columnSizing, setColumnSizing] = useState({});

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Get user permissions
    const { permissions, loading: permissionsLoading } = useUserPermissions();

    // Check if user has permission to view all sample projects
    const canViewAllSampleProjects = hasPermission(permissions, "sample:view-all-sample-projects");

    // Filter period options based on permissions
    const filteredPeriodOptions = useMemo(() => {
        if (canViewAllSampleProjects) {
            return periodOptions; // Show all options including "All"
        }
        return periodOptions.filter(option => option.value !== "all"); // Hide "All" option
    }, [canViewAllSampleProjects]);

    const sortBy = sorting.length > 0 ? sorting[0].id : "";
    const sortOrder = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "";

    // Fetch projects with latest sample data from API
    const {
        data: projectsResponse,
        isLoading,
        error,
    } = useProjectsForSamplePreparation({
        filter: "sample-preparation",
        statusFilter: selectedPeriod,
        searchTerm: debouncedSearchTerm,
        status: selectedStatus,
        isActive: "true", // Only active projects
        isFeasible: "all",
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
    });

    const projects = projectsResponse?.data ?? [];
    const pagination = projectsResponse?.pagination ?? {
        total: 0,
        page: currentPage,
        limit: itemsPerPage,
        totalPages: 0,
    };

    const totalPages = pagination.totalPages || 0;
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleStatusChange = (value) => {
        setSelectedStatus(value);
        setCurrentPage(1);
    };

    const handlePeriodChange = (value) => {
        setSelectedPeriod(value);
        setCurrentPage(1);
    };

    const handleViewProjectDetails = (project) => {
        navigate(`/project-overview/sample-preparation/${project._id}`);
    };

    const filters = useMemo(() => [
        {
            id: "status-filter",
            label: "Status",
            value: selectedStatus,
            options: statusOptions,
            onChange: handleStatusChange,
            placeholder: "All Status",
        },
        {
            id: "run-toggle",
            label: "Period",
            value: selectedPeriod,
            options: filteredPeriodOptions,
            onChange: handlePeriodChange,
            placeholder: "Running",
        },
    ], [selectedStatus, selectedPeriod, filteredPeriodOptions, handleStatusChange, handlePeriodChange]);

    return {
        searchTerm,
        setSearchTerm,
        selectedStatus,
        setSelectedStatus,
        selectedPeriod,
        setSelectedPeriod,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        sorting,
        setSorting,
        columnVisibility,
        setColumnVisibility,
        columnPinning,
        setColumnPinning,
        columnSizing,
        setColumnSizing,
        projects,
        pagination,
        totalPages,
        isLoading,
        error,
        handleSearchChange,
        handleStatusChange,
        handlePeriodChange,
        handleViewProjectDetails,
        filters,
        filteredPeriodOptions,
        filterOptions: projectsResponse?.filterOptions,
    };
};
