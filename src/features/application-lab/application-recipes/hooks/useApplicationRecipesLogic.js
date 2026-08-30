import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDebounce } from "@/hooks/useDebounce";
import { statusOptions } from "../constants/projectOptions";
import { useProjectsWithLatestRecipeDate } from "@/hooks/useRecipes";

export const useApplicationRecipesLogic = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [runToggle, setRunToggle] = useState("running");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [sorting, setSorting] = useState([]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus, runToggle]);

    const [columnVisibility, setColumnVisibility] = useState({});
    const [columnPinning, setColumnPinning] = useState({});
    const [columnSizing, setColumnSizing] = useState({});

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const sortBy = sorting.length > 0 ? sorting[0].id : "";
    const sortOrder = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "";

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
      sortBy,
      sortOrder,
    });

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

    const handleViewProjectDetails = (project) => {
        navigate(`/project-overview/application-lab/${project._id}`);
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
            label: "Run Type",
            value: runToggle,
            onChange: handleRunToggleChange,
            placeholder: "Running",
        },
    ], [selectedStatus, runToggle, handleStatusChange, handleRunToggleChange]);

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
