import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDebounce } from "@/hooks/useDebounce";
import { useProjectsForSamplePreparation } from "@/hooks/useSamples";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { statusOptions, periodOptions } from "../constants/projectOptions";
import { hasPermission } from "@/lib/utils";
import { purposeFilterOptions } from "@/features/project-overview/shared/constants/projectOptions";
import { useProjectFilterOptions } from "@/hooks/useProjectFilters";

export const useSamplePreparationLogic = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedPeriod, setSelectedPeriod] = useState("running");
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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus, selectedPeriod, selectedCategory, selectedSubcategory, selectedSubSubcategory, selectedCreator, selectedPurpose, dateFrom, dateTo]);

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
        category: selectedCategory,
        subcategory: selectedSubcategory,
        subSubcategory: selectedSubSubcategory,
        createdBy: selectedCreator,
        purpose: selectedPurpose,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
    });

    // Fetch filter options (from API response if available)
    const { categories, subcategories, subSubcategories, users } = useProjectFilterOptions(selectedCategory, selectedSubcategory, projectsResponse?.filterOptions);

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

    const handleViewProjectDetails = (project) => {
        navigate(`/project-overview/sample-preparation/${project._id}`);
    };

    const filters = useMemo(() => [
        {
            id: "status",
            label: "Status",
            value: selectedStatus,
            options: statusOptions,
            onChange: handleStatusChange,
        },
        {
            id: "period",
            label: "Period",
            value: selectedPeriod,
            options: filteredPeriodOptions,
            onChange: handlePeriodChange,
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
    ], [selectedStatus, selectedPeriod, selectedCategory, selectedSubcategory, selectedSubSubcategory, selectedCreator, selectedPurpose, filteredPeriodOptions, handleStatusChange, handlePeriodChange, handleCategoryChange, handleSubcategoryChange, handleSubSubcategoryChange, handleCreatorChange, handlePurposeChange, categories, subcategories, subSubcategories, users]);

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
