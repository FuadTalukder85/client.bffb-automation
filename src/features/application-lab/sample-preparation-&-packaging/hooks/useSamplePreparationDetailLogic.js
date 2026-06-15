import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useDebounce } from "@/hooks/useDebounce";
import { useSamplesByProject, useSample } from "@/hooks/useSamples";
import { useProject } from "@/hooks/useProjects";
import { statusOptions } from "../constants/projectOptions";

export const useSamplePreparationDetailLogic = (projectId) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedPeriod, setSelectedPeriod] = useState("active");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [sorting, setSorting] = useState([]);

    const [columnVisibility, setColumnVisibility] = useState({});
    const [columnPinning, setColumnPinning] = useState({});
    const [columnSizing, setColumnSizing] = useState({});

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Fetch project details
    const { data: projectData, isLoading: projectLoading } = useProject(projectId);

    // Determine active filter value based on period selection
    const isActiveFilter =
        selectedPeriod === "active"
            ? true
            : selectedPeriod === "archived"
            ? false
            : "all";

    // Fetch samples for this project from API; searchTerm and isActive are handled server-side
    const {
        data: samplesResponse,
        isLoading,
        error,
    } = useSamplesByProject(projectId, {
        page: currentPage,
        limit: itemsPerPage,
        searchTerm: debouncedSearchTerm,
        isActive: isActiveFilter,
    });

    const allSamples = samplesResponse?.data ?? [];
    const pagination = samplesResponse?.pagination ?? {
        total: 0,
        page: currentPage,
        limit: itemsPerPage,
        totalPages: 0,
    };

    // Get project info from API response
    const projectTitle = projectData?.masterProject?.title || "Unknown Project";
    const projectCode = projectData?.masterProject?.code || "—";

    let filteredSamples = [...allSamples];

    // Apply status filter (checks packagingStatus, hodStatus, approvalForSensory)
    if (selectedStatus !== "all") {
        filteredSamples = filteredSamples.filter((sample) => {
            const packagingStatus = sample.packagingStatus?.toLowerCase() || "";
            const hodStatus = sample.HODStatus?.toLowerCase() || "";
            const approvalForSensory = sample.approvalForSensory ? "approved" : "pending";

            return (
                packagingStatus === selectedStatus.toLowerCase() ||
                hodStatus === selectedStatus.toLowerCase() ||
                approvalForSensory === selectedStatus.toLowerCase()
            );
        });
    }


    // Apply sorting
    const sortBy = sorting.length > 0 ? sorting[0].id : "";
    const sortOrder = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "";

    if (sortBy && sortOrder) {
        filteredSamples.sort((a, b) => {
            const getNestedValue = (obj, path) => {
                return path.split(".").reduce((acc, part) => acc?.[part], obj);
            };

            const aValue = getNestedValue(a, sortBy);
            const bValue = getNestedValue(b, sortBy);

            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return sortOrder === "asc" ? 1 : -1;
            if (bValue == null) return sortOrder === "asc" ? -1 : 1;

            if (typeof aValue === "string") {
                return sortOrder === "asc"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return sortOrder === "asc"
                ? aValue > bValue ? 1 : -1
                : bValue > aValue ? 1 : -1;
        });
    }

    // Calculate pagination for filtered samples
    const totalItems = filteredSamples.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSamples = filteredSamples.slice(startIndex, endIndex);

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

    const handleGoBack = () => {
        navigate("/application-lab/sample-preparation-and-packaging");
    };

    return {
        projectTitle,
        projectCode,
        samples: paginatedSamples,
        allSamplesCount: allSamples.length,
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
        totalPages,
        sorting,
        setSorting,
        columnVisibility,
        setColumnVisibility,
        columnPinning,
        setColumnPinning,
        columnSizing,
        setColumnSizing,
        isLoading: isLoading || projectLoading,
        error,
        handleSearchChange,
        handleStatusChange,
        handlePeriodChange,
        handleGoBack,
    };
};
