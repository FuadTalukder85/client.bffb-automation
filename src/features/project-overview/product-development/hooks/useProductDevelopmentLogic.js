import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { useProductDevelopmentProjects } from "@/hooks/useMasterProject";
import { useDebounce } from "@/hooks/useDebounce";
import { productDevelopmentStatusFilterOptions as statusOptions } from "../constants/projectOptions";
import { purposeFilterOptions } from "../../shared/constants/projectOptions";
import { useProjectFilterOptions } from "@/hooks/useProjectFilters";

export const useProductDevelopmentLogic = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [sorting, setSorting] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    const [selectedSubSubcategory, setSelectedSubSubcategory] = useState("");
    const [selectedCreator, setSelectedCreator] = useState("");
    const [selectedPurpose, setSelectedPurpose] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    useEffect(() => {
        setSelectedProjectIds([]);
    }, [currentPage, searchTerm, selectedStatus, selectedCategory, selectedSubcategory, selectedSubSubcategory, selectedCreator, selectedPurpose, dateFrom, dateTo]);

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
    } = useProductDevelopmentProjects({
        searchTerm: debouncedSearchTerm,
        isActive: "true",
        status: selectedStatus,
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        subSubcategory: selectedSubSubcategory,
        createdBy: selectedCreator,
        purpose: selectedPurpose,
        dateFrom,
        dateTo,
    });

    const { categories, subcategories, subSubcategories, users } = useProjectFilterOptions(selectedCategory, selectedSubcategory, projectsData?.filterOptions);

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
        navigate(`/project-overview/product-development/${project._id}`);
    };

    const filters = useMemo(
        () => [
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
        ],
        [selectedStatus, selectedCategory, selectedSubcategory, selectedSubSubcategory, selectedCreator, selectedPurpose, handleStatusChange, handleCategoryChange, handleSubcategoryChange, handleSubSubcategoryChange, handleCreatorChange, handlePurposeChange, categories, subcategories, subSubcategories, users]
    );

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
        selectedCategory,
        selectedSubcategory,
        selectedSubSubcategory,
        selectedCreator,
        selectedPurpose,
        dateFrom,
        dateTo,
        handleCategoryChange,
        handleSubcategoryChange,
        handleSubSubcategoryChange,
        handleCreatorChange,
        handlePurposeChange,
        handleDateFromChange,
        handleDateToChange,
    };
};
