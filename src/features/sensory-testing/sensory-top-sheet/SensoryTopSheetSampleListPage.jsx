import React, { useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSensorySamplesByProject } from "@/hooks/useSensoryForm";
import { useProject } from "@/hooks/useProjects";
import DesktopSensoryTopSheetViewPage from "./components/DesktopSensoryTopSheetViewPage";
import MobileSensoryTopSheetViewPage from "./components/MobileSensoryTopSheetViewPage";

export default function SensoryTopSheetSampleListPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnPinning, setColumnPinning] = useState({});
  const [columnSizing, setColumnSizing] = useState({});

  const projectFromState = location.state?.project;
  const { data: projectFromApi } = useProject(projectId, {
    enabled: !projectFromState,
  });

  const {
    data: samplesResponse,
    isLoading,
    error,
  } = useSensorySamplesByProject(projectId, {
    page: currentPage,
    limit: itemsPerPage,
  });

  const getErrorMessage = (error) =>
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load samples";

  const errorMessage = error ? getErrorMessage(error) : "";
  const hasError = Boolean(errorMessage);

  const samples = samplesResponse?.data ?? [];
  const fallbackProject = useMemo(() => {
    if (samplesResponse?.project) return samplesResponse.project;
    const sampleProject = samples.find((sample) => sample?.project && typeof sample.project === "object")?.project;
    return sampleProject || null;
  }, [samplesResponse, samples]);
  const project = projectFromState || projectFromApi || fallbackProject;
  const pagination = samplesResponse?.pagination ?? {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
  };
  const totalPages = pagination.totalPages || 0;

  const handleSampleClick = (sample) => {
    navigate(
      `/sensory-testing/sensory-top-sheet/${projectId}/${sample._id}`,
      { state: { project } }
    );
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (val) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  const filters = [
    {
      id: "search",
      label: "Search",
      value: searchTerm,
      options: [],
      onChange: handleSearchChange,
    },
  ];

  const commonProps = {
    navigate,
    project,
    searchTerm,
    handleSearchChange,
    isLoading,
    error,
    errorMessage,
    hasError,
    samples,
    currentPage,
    totalPages,
    itemsPerPage,
    handleItemsPerPageChange,
    setCurrentPage,
    handleSampleClick,
  };

  if (isMobile) {
    return (
      <section className="flex flex-col min-h-[calc(100vh-6rem)]">
        <MobileSensoryTopSheetViewPage
          {...commonProps}
          filters={filters}
        />
      </section>
    );
  }

  return (
    <DesktopSensoryTopSheetViewPage
      {...commonProps}
      handleItemsPerPageChange={handleItemsPerPageChange}
      sorting={sorting}
      setSorting={setSorting}
      columnVisibility={columnVisibility}
      setColumnVisibility={setColumnVisibility}
      columnPinning={columnPinning}
      setColumnPinning={setColumnPinning}
      columnSizing={columnSizing}
      setColumnSizing={setColumnSizing}
    />
  );
}
