import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
// import { useApplicationLabProjects } from "@/hooks/useMasterProject";
import { useDebounce } from "@/hooks/useDebounce";
import { statusOptions } from "../constants/projectOptions";
import { useProjectsWithLatestRecipeDate } from "@/hooks/useRecipes";
import { purposeFilterOptions } from "@/features/project-overview/shared/constants/projectOptions";
import { useProjectFilterOptions } from "@/hooks/useProjectFilters";

export const useApplicationRecipesLogic = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [runToggle, setRunToggle] = useState("running");
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
    }, [searchTerm, selectedStatus, runToggle, selectedCategory, selectedSubcategory, selectedSubSubcategory, selectedCreator, selectedPurpose, dateFrom, dateTo]);

    const [columnVisibility, setColumnVisibility] = useState({});
    const [columnPinning, setColumnPinning] = useState({});
    const [columnSizing, setColumnSizing] = useState({});

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Fetch projects (server returns master projects enriched with latest recipe info)
    const {
      data: projectsDataFromApi,
      isLoading,
      error,
    } = useProjectsWithLatestRecipeDate({
      searchTerm: debouncedSearchTerm,
      status: selectedStatus,
      statusFilter: runToggle,
      isActive: runToggle === "running" ? "true" : runToggle === "previous" ? "false" : "all",
      page: currentPage,
      limit: itemsPerPage,
      category: selectedCategory,
      subcategory: selectedSubcategory,
      subSubcategory: selectedSubSubcategory,
      createdBy: selectedCreator,
      purpose: selectedPurpose,
      dateFrom,
      dateTo,
    });

    // Fetch filter options (from API response if available)
    const { categories, subcategories, subSubcategories, users } = useProjectFilterOptions(selectedCategory, selectedSubcategory, projectsDataFromApi?.filterOptions);

    const projects = projectsDataFromApi?.data ?? [];
    const pagination = projectsDataFromApi?.pagination || { page: currentPage, limit: itemsPerPage, total: 0, totalPages: 1 };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleStatusChange = (value) => {
        setSelectedStatus(value);
        setCurrentPage(1);
    };

    const handleRunToggleChange = (value) => {
        setRunToggle(value);
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
        navigate(`/project-overview/application-lab/${project._id}`);
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
    ], [selectedStatus, selectedCategory, selectedSubcategory, selectedSubSubcategory, selectedCreator, selectedPurpose, handleStatusChange, handleCategoryChange, handleSubcategoryChange, handleSubSubcategoryChange, handleCreatorChange, handlePurposeChange, categories, subcategories, subSubcategories, users]);

    return {
        searchTerm,
        selectedStatus,
        runToggle,
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
        isLoading,
        error,
        handleSearchChange,
        handleStatusChange,
        handleRunToggleChange,
        handleViewProjectDetails,
        filters,
        filterOptions: projectsDataFromApi?.filterOptions,
    };
};
