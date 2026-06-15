import React, { useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSensorySamplesByProject } from "@/hooks/useSensoryForm";
import { useProject } from "@/hooks/useProjects";
import DesktopSensoryFormSampleListPage from "./components/DesktopSensoryFormSampleListPage";
import MobileSensoryFormSampleListPage from "./components/MobileSensoryFormSampleListPage";

export default function SensoryFormSampleListPage() {
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
    searchTerm,
    page: currentPage,
    limit: itemsPerPage,
  });

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
    navigate(`/sensory-testing/sensory-forms/${projectId}/${sample._id}`, {
      state: { project, sample }
    });
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
    samples,
    currentPage,
    totalPages,
    itemsPerPage,
    handleItemsPerPageChange,
    setCurrentPage,
    handleSampleClick,
    noDataMessage: "No Samples Found",
    noDataDescription: searchTerm
      ? `No samples match "${searchTerm}". Try adjusting your search.`
      : "No samples available for this project.",
  };

  if (isMobile) {
    return (
      <section className="flex flex-col min-h-[calc(100vh-6rem)]">
        <MobileSensoryFormSampleListPage
          {...commonProps}
          filters={filters}
        />
      </section>
    );
  }

  return (
    <DesktopSensoryFormSampleListPage
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
