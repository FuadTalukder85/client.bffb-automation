import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
// import { useApplicationLabProjects } from "@/hooks/useMasterProject";
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
            id: "status",
            label: "Status",
            value: selectedStatus,
            options: statusOptions,
            onChange: handleStatusChange,
        },
    ], [selectedStatus]);

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
    };
};
