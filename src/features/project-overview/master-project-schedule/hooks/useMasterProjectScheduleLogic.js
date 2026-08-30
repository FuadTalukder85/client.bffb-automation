import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { useMasterProjectSchedule } from "@/hooks/useMasterProject";
import { useDebounce } from "@/hooks/useDebounce";
import { applicationLabStatusFilterOptions } from "../constants/projectOptions";

export const useMasterProjectScheduleLogic = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [sorting, setSorting] = useState([]);

    useEffect(() => {
        setSelectedProjectIds([]);
    }, [currentPage, searchTerm, selectedStatus]);

    const [columnVisibility, setColumnVisibility] = useState({});
    const [columnPinning, setColumnPinning] = useState({});
    const [columnSizing, setColumnSizing] = useState({});
    const [selectedProjectIds, setSelectedProjectIds] = useState([]);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const sortBy = sorting.length > 0 ? sorting[0].id : "";
    const sortOrder = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "";

    const {
        data: projectsData,
        isLoading,
        error,
        refetch,
    } = useMasterProjectSchedule({
        searchTerm: debouncedSearchTerm,
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

    const handleStatusChange = useCallback((value) => {
        setSelectedStatus(value);
        setCurrentPage(1);
    }, []);

    const handleViewProjectDetails = (project) => {
        navigate(`${project._id}`, {
            state: { projectCode: project.masterProject?.code },
        });
    };

    const filters = useMemo(
        () => [
            {
                id: "status",
                value: selectedStatus,
                onChange: handleStatusChange,
                options: applicationLabStatusFilterOptions,
                placeholder: "All Status",
            },
        ],
        [selectedStatus, handleStatusChange]
    );

    return {
        searchTerm,
        setSearchTerm,
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
