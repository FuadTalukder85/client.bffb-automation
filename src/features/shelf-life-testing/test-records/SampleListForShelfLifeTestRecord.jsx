import React, { useCallback, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import PageHeader from "@/components/common/page-header";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BackButton } from "@/components/ui/BackButton";
import { buildStatusOptions, createFilterOptions } from "@/config/statusConfig";
import { useIsMobile } from "@/hooks/useIsMobile";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { useShelfLifeSamplesByProject } from "@/hooks/useSamples";
import { useDebounce } from "@/hooks/useDebounce";
import { useProject } from "@/hooks/useProjects";
import { Eye } from "lucide-react";
import DesktopSampleListView from "./components/sample-list/DesktopSampleListView";
import MobileSampleListView from "./components/sample-list/MobileSampleListView";

const statusOptions = createFilterOptions(
  buildStatusOptions(["Approved", "Pending"]),
  "All Status"
);

export default function SampleListForShelfLifeTestRecord() {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: projectFromApi } = useProject(projectId, {
    enabled: !location.state?.record,
  });
  const record = location.state?.record;
  const resolvedRecord = record || {
    projectName: projectFromApi?.masterProject?.title || projectFromApi?.title || "Samples",
    projectCode: projectFromApi?.masterProject?.code || projectFromApi?.code || "—",
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sorting, setSorting] = useState([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: samplesResponse, isLoading } = useShelfLifeSamplesByProject(projectId, {
    searchTerm: debouncedSearchTerm,
    HODStatus: selectedStatus === "all" ? undefined : selectedStatus === "approved",
    page: currentPage,
    limit: itemsPerPage,
  });

  const samples = samplesResponse?.data ?? [];
  const pagination = samplesResponse?.pagination ?? {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
  };

  const normalizedSamples = samples.map((sample) => ({
    id: sample._id,
    raisedDate: sample.createdAt ? new Date(sample.createdAt).toLocaleDateString("en-GB") : null,
    recipeCode: sample.recipe?.recipeCode || null,
    recipeName: sample.recipe?.name || null,
    applicationOfficer: sample.applicationOfficer?.name || null,
    batchSize: sample.batchSize || null,
    output: sample.output || null,
    hodStatus: sample.HODStatus ? "Approved" : "Pending",
    isSubmitted: sample.isSubmitted || false,
    raw: sample,
  }));

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleOpen = useCallback((sample) => {
    navigate(`/shelf-life-testing/test-records/${projectId}/${sample.id || sample._id}`, {
      state: { record: resolvedRecord, sample: sample.raw || sample },
    });
  }, [navigate, projectId, resolvedRecord]);

  const filters = [
    {
      id: "status-filter",
      label: "Status",
      value: selectedStatus,
      options: statusOptions,
      onChange: handleStatusChange,
    },
  ];

  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Header matching DesktopSensoryTopSheetViewPage */}
      <div className="flex items-center justify-between pb-4 flex-none ms-0 lg:ms-5 bg-background">
        <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <BackButton
            onClick={() => navigate("/shelf-life-testing/test-records")}
            className=""
          />
          <div className="flex flex-col">
            <h1 className="text-[24px] lg:text-[13px] xl:text-[17px] 2xl:text-[19px] 3xl:text-[24px] font-bold text-foreground leading-tight">
              {resolvedRecord.projectName || "Samples"}
            </h1>
            <div className="flex items-center gap-2 gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2 mt-1 mt-[1px] xl:mt-[2px] 2xl:mt-[3px] 3xl:mt-1">
              <span className="px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 lg:py-[1px] xl:py-[1px] 2xl:py-0.5 3xl:py-0.5 rounded-full border border-border text-[11px] lg:text-[6px] xl:text-[8px] 2xl:text-[8.5px] 3xl:text-[11px] font-semibold text-primary bg-primary/5">
                {resolvedRecord.projectCode || "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ThemeToggle />
        </div>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        searchPlaceholder="Search..."
        hideOnDesktop={true}
        filters={filters}
      />

      {!isMobile && (
        <DesktopSampleListView
          data={normalizedSamples}
          sorting={sorting}
          onSortingChange={setSorting}
          currentPage={currentPage}
          totalPages={pagination.totalPages || 0}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(val) => {
            setItemsPerPage(val);
            setCurrentPage(1);
          }}
          isLoading={isLoading}
          onOpen={handleOpen}
        />
      )}

      {isMobile && (
        <MobileSampleListView
          data={normalizedSamples}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={pagination.totalPages || 0}
          setCurrentPage={setCurrentPage}
          onOpen={handleOpen}
        />
      )}
    </section>
  );
}
