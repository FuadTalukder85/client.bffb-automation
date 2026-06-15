import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useApplicationLabProjects } from "@/hooks/useMasterProject";
import { useDebounce } from "@/hooks/useDebounce";
import { applicationLabStatusFilterOptions as statusOptions } from "../constants/projectOptions";

export const useApplicationLabLogic = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [sorting, setSorting] = useState([]);

    const [columnVisibility, setColumnVisibility] = useState({});
    const [columnPinning, setColumnPinning] = useState({});
    const [columnSizing, setColumnSizing] = useState({});

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const sortBy = sorting.length > 0 ? sorting[0].id : "";
    const sortOrder = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "";

    const {
        data: projectsData,
        isLoading,
        error,
    } = useApplicationLabProjects({
        searchTerm: debouncedSearchTerm,
        isActive: "true", // Always show active projects only
        status: selectedStatus,
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
    });

    const projects = projectsData?.data ?? [];
    const pagination = projectsData?.pagination;

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleStatusChange = (value) => {
        setSelectedStatus(value);
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
        handleViewProjectDetails,
        filters,
    };
};
