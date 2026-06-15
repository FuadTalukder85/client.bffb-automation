import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import PageHeader from "@/components/common/page-header";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { BackButton } from "@/components/ui/BackButton";
import RecordDetailsTable from "./components/RecordDetailsTable";
import MobileRecordDetailsCard from "./components/MobileRecordDetailsCard";
import { NoData } from "@/components/ui/NoData";
import { EditRecordModal } from "./components/Modals/EditRecordModal";
import { buildStatusOptions, createFilterOptions } from "@/config/statusConfig";
import { useIsMobile } from "@/hooks/useIsMobile";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { Pagination } from "@/components/ui/Pagination";
import { useSamplesByProject, useUpdateSample } from "@/hooks/useSamples";
import { useDebounce } from "@/hooks/useDebounce";
import { useProjectMembers } from "@/hooks/useProjectMembers";

const statusOptions = createFilterOptions(
  buildStatusOptions([
    "Not Started",
    "In Progress",
    "Completed",
    "Rework",
    "Approved",
    "Paused",
    "Cancelled",
  ]),
  "All Status",
);

export default function RecordDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { record } = location.state || {};

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeToggle, setActiveToggle] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sorting, setSorting] = useState([]);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch samples for the selected project
  const {
    data: samplesResponse,
    isLoading,
    error,
  } = useSamplesByProject(record?._id, {
    searchTerm: debouncedSearchTerm,
    HODStatus: selectedStatus === "all" ? undefined : selectedStatus,
    page: currentPage,
    limit: itemsPerPage,
  });

  const { data: projectMembers = [] } = useProjectMembers(record?._id);

  const samples = samplesResponse?.data ?? [];
  const pagination = samplesResponse?.pagination ?? {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
  };

  // Normalize samples data to match column expectations
  const normalizedSamples = samples.map((sample) => ({
    id: sample._id,
    raisedDate: sample.createdAt
      ? new Date(sample.createdAt).toLocaleDateString("en-GB")
      : null,
    projectStartDate: null, // Not available in sample
    lastProductionDate: null, // Not available in sample
    nextProductionDate: null, // Not available in sample
    productionDate: null, // Not available in sample
    recipeCode: sample.recipe?.recipeCode || null,
    recipeName: sample.recipe?.name || null,
    applicationOfficer: sample.applicationOfficer?.name || null,
    batchSize: sample.batchSize || null,
    output: sample.output || null,
    suggestions: sample.applicationSuggestion || null,
    hodStatus: sample.HODStatus ? "Approved" : "Not Approved",
    hodStatusDays: null, // Would need calculation
    hodEvaluation: sample.HODEvaluation || null,
    sensoryApproval: sample.approvalForSensory ? "Approved" : "Not Approved",
    sensoryApprovalDays: null, // Would need calculation
    status: sample.isActive ? "Active" : "Archived",
    // Keep original data for updates
    ...sample,
  }));

  const updateSampleMutation = useUpdateSample();

  const errorMessage = error ? (error?.response?.data?.error || error?.response?.data?.message || error?.message || "Failed to load samples") : "";
  const hasError = Boolean(errorMessage);


  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleActiveToggleChange = (value) => {
    setActiveToggle(value);
    setCurrentPage(1);
  };

  const handleEditClick = (data) => {
    setSelectedRecord(data);
    setIsEditModalOpen(true);
  };

  const handleEditConfirm = async (updatedData) => {
    try {
      await updateSampleMutation.mutateAsync({
        id: updatedData.id,
        data: {
          applicationSuggestion: updatedData.suggestions,
          HODStatus: updatedData.hodStatus === "Approved",
          HODEvaluation: updatedData.hodEvaluation,
          approvalForSensory: updatedData.sensoryApproval === "Approved",
          reworkTask: updatedData.reworkTask,
          sensoryApproval: updatedData.sensoryApproval,
        },
      });
    } catch (error) {
      throw error;
    }
  };

  const activeOptions = [
    { label: "Active", value: "active" },
    { label: "Archive", value: "archived" },
    { label: "All", value: "all" },
  ];

  const filters = [
    {
      id: "active-toggle",
      label: "Toggle",
      value: activeToggle,
      options: activeOptions,
      onChange: handleActiveToggleChange,
    },
    {
      id: "status-filter",
      label: "Status",
      value: selectedStatus,
      options: statusOptions,
      onChange: handleStatusChange,
    },
  ];

  // Filter logic for active/archived (client-side since API doesn't have this filter)
  const filteredData = normalizedSamples.filter((item) => {
    const matchesActive =
      activeToggle === "all" ||
      (activeToggle === "active" && item.status === "Active") ||
      (activeToggle === "archived" && item.status === "Archived");
    return matchesActive;
  });

  const totalPages = pagination.totalPages || 0;

  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Header Section */}
      <div className="flex justify-between ms-0 lg:ms-5">
        <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <BackButton
            onClick={() => navigate("/application-lab/application-lab-records")}
            className="flex"
          />
          <PageHeader
            title={record?.projectName || "Record Details"}
            subTitle={record?.projectCode || ""}
            className="text-heading"
          />
        </div>

        <div className="flex items-start hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Search & Filters */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        searchPlaceholder="Search..."
        hideOnDesktop={true}
        filters={filters}
      />

      {/* Filters Section */}
      <div className="flex-none hidden mb-2 lg:mb-2 xl:mb-3.5 2xl:mb-3.5 3xl:mb-4 md:block ms-5">
        <div className="flex items-center justify-end">
          <DesktopFilterPills
            value={activeToggle}
            options={activeOptions}
            onChange={handleActiveToggleChange}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="flex flex-col flex-1 w-full min-h-0">
        {!isMobile && (
          <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
            <RecordDetailsTable
              data={filteredData}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
              onEdit={handleEditClick}
              sorting={sorting}
              onSortingChange={setSorting}
              noDataMessage="No Records Found"
              noDataDescription={searchTerm
                ? `No records match "${searchTerm}". Try adjusting your search.`
                : "No records match your current filters. Try adjusting your search or filter criteria."}
              emptyState={
                hasError ? (
                  <div className="py-10 text-center text-red-500">{errorMessage}</div>
                ) : !record ? (
                  <div className="py-10 text-center text-muted-foreground">No record found.</div>
                ) : null
              }
            />
          </div>
        )}

        {isMobile && (
          <>
            <div className="mt-6 md:hidden">
              {filteredData.length > 0 ? (
                <div className="space-y-3">
                  {filteredData
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage,
                    )
                    .map((item, index) => (
                      <MobileRecordDetailsCard
                        key={item.id}
                        record={item}
                        serialNumber={
                          (currentPage - 1) * itemsPerPage + (index + 1)
                        }
                        onEdit={handleEditClick}
                      />
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  {hasError ? (
                    <div className="text-red-500">{errorMessage}</div>
                  ) : !record ? (
                    <div className="text-muted-foreground">No record found.</div>
                  ) : (
                    <>
                      <NoData
                        message="No Records Found"
                        description={searchTerm
                          ? `No records match "${searchTerm}". Try adjusting your search.`
                          : "No records match your current filters. Try adjusting your search or filter criteria."}
                      />
                    </>
                  )}
                </div>
              )}
            </div>

            {filteredData.length > 0 && (
              <div className="flex justify-center w-full mt-auto mb-7 md:hidden">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  isMobile={true}
                />
              </div>
            )}
          </>
        )}
      </div>

      <EditRecordModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        item={selectedRecord}
        projectMembers={projectMembers}
        projectId={record?._id}
        onEdit={handleEditConfirm}
      />
    </section>
  );
}
