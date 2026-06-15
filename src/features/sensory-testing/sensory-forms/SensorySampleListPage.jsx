import React, { useState, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import PageHeader from "@/components/common/page-header";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Pagination } from "@/components/ui/Pagination";
import { useSensorySamplesByProject } from "@/hooks/useSensoryForm";

import { buildStatusOptions, createFilterOptions } from "@/config/statusConfig";

const statusOptions = createFilterOptions(
  buildStatusOptions([
    "Pending",
    "In Progress",
    "Completed",
  ]),
  "All"
);

export default function SensorySampleListPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnPinning, setColumnPinning] = useState({});
  const [columnSizing, setColumnSizing] = useState({});

  const project = location.state?.project;

  const {
    data: samplesResponse,
    isLoading,
    error,
  } = useSensorySamplesByProject(projectId, {
    page: currentPage,
    limit: itemsPerPage,
  });

  const errorMessage = error ? (error?.message || "Failed to load samples") : "";
  const hasError = Boolean(errorMessage);

  const samples = samplesResponse?.data ?? [];
  const pagination = samplesResponse?.pagination ?? {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
  };
  const totalPages = pagination.totalPages || 0;

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (statusKey) => {
    setSelectedStatus(statusKey);
    setCurrentPage(1);
  };

  const handleSampleClick = (sample) => {
    navigate(`/sensory-testing/sensory-forms/${projectId}/${sample._id}`, {
      state: { project, sample }
    });
  };

  const handleItemsPerPageChange = (val) => {
    setItemsPerPage(val);
    setCurrentPage(1);
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

  const filteredSamples = useMemo(() => {
    let filtered = samples;
    
    if (selectedStatus !== "all") {
      filtered = filtered.filter(sample => sample.packagingStatus === selectedStatus);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sample => 
        (sample.recipeCode && sample.recipeCode.toLowerCase().includes(term)) ||
        (sample.recipeName && sample.recipeName.toLowerCase().includes(term)) ||
        (sample.applicationRecipeName && sample.applicationRecipeName.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }, [samples, selectedStatus, searchTerm]);

  const paginatedSamples = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSamples.slice(start, start + itemsPerPage);
  }, [filteredSamples, currentPage, itemsPerPage]);

  const totalPagesDisplay = Math.ceil(filteredSamples.length / itemsPerPage);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Header & Search */}
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </button>
          <PageHeader
            title="Samples"
            className="py-4 pb-6 text-heading md:p-0 md:m-0"
          />
        </div>

        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search samples..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Project Info Banner */}
      {project && (
        <div className="mx-4 lg:mx-5 mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground uppercase">Project</span>
              <p className="font-semibold">
                {project.masterProject?.title || project.title || "Project"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground uppercase">Code</span>
              <p className="font-medium">
                {project.masterProject?.code || project.code || "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search & Filters */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        searchPlaceholder="Search samples..."
        hideOnDesktop={true}
        filters={filters}
      />

      {/* Status Filter Tabs - Desktop */}
      <div className="hidden md:flex justify-between items-center xl:my-2.5 2xl:my-3 3xl:my-4 ms-5">
        <div className="flex items-center gap-2 border-b border-border">
          {statusOptions.map((tab) => {
            const isSelected = selectedStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleStatusChange(tab.value)}
                className={`px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-1 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-body font-medium transition-colors border-b-2 -mb-px ${
                  isSelected
                    ? ""
                    : "border-transparent text-lighter-text hover:text-foreground"
                }`}
                style={{
                  color: isSelected ? tab.textColor : undefined,
                  borderBottomColor: isSelected ? tab.textColor : "transparent",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 w-full min-h-0">

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-3 mx-4 lg:mx-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredSamples.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center mx-4">
            {hasError ? (
              <div className="py-10 text-center text-red-500">
                {errorMessage}
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">No Samples Found</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  No samples match your current filters. Try adjusting your search or filter criteria.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            {!isMobile && (
              <div className="hidden px-2 md:block mx-4 lg:mx-5">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">SL</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Recipe Code</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Recipe Name</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Application Name</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Packaging Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">HOD Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Created Date</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSamples.map((sample, index) => (
                        <tr 
                          key={sample._id} 
                          className="border-t hover:bg-muted/30 cursor-pointer"
                          onClick={() => handleSampleClick(sample)}
                        >
                          <td className="p-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className="p-3 font-medium">{sample.recipeCode || "—"}</td>
                          <td className="p-3">{sample.recipeName || sample.recipe?.name || "—"}</td>
                          <td className="p-3">{sample.applicationRecipeName || "—"}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              sample.packagingStatus === "Completed" 
                                ? "bg-green-100 text-green-700"
                                : sample.packagingStatus === "In Progress"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {sample.packagingStatus || "Pending"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              sample.HODStatus === true || sample.HODStatus === "Approved"
                                ? "bg-green-100 text-green-700"
                                : sample.HODStatus === false
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {sample.HODStatus === true || sample.HODStatus === "Approved" 
                                ? "Approved" 
                                : sample.HODStatus === false 
                                ? "Rejected" 
                                : "Pending"}
                            </span>
                          </td>
                          <td className="p-3">{formatDate(sample.createdAt)}</td>
                          <td className="p-3">
                            <button className="text-primary hover:underline text-sm font-medium">
                              View Form
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Mobile Card View */}
            {isMobile && (
              <div className="md:hidden px-4">
                {filteredSamples.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {paginatedSamples.map((sample, index) => (
                        <div
                          key={sample._id}
                          onClick={() => handleSampleClick(sample)}
                          className="p-4 bg-card rounded-lg border hover:border-primary/50 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary/10 text-primary">
                              <span className="text-sm font-bold">
                                {(currentPage - 1) * itemsPerPage + (index + 1)}
                              </span>
                            </div>

                            <div className="flex flex-col flex-1 min-w-0 text-right">
                              <h3 className="text-sm font-bold text-primary truncate">
                                {sample.recipeName || sample.recipe?.name || "Sample"}
                              </h3>
                              <span className="text-[11px] font-bold text-muted-foreground mt-0.5">
                                {sample.recipeCode || "—"}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-xs text-muted-foreground">
                              Packaging Status
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              sample.packagingStatus === "Completed" 
                                ? "bg-green-100 text-green-700"
                                : sample.packagingStatus === "In Progress"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {sample.packagingStatus || "Pending"}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-2">
                            Created: {formatDate(sample.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mobile Pagination */}
                    {totalPagesDisplay > 0 && (
                      <div className="flex justify-center w-full mt-auto mb-7 lg:mb-0! md:hidden">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPagesDisplay}
                          onPageChange={setCurrentPage}
                          itemsPerPage={itemsPerPage}
                          onItemsPerPageChange={handleItemsPerPageChange}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    {hasError ? (
                      <div className="py-10 text-center text-red-500">
                        {errorMessage}
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">No Samples Found</h3>
                        <p className="max-w-sm text-sm text-muted-foreground">
                          No samples match your current filters.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Desktop Pagination */}
      {filteredSamples.length > 0 && (
        <div className="hidden md:block px-4 lg:px-5 mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPagesDisplay}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
    </section>
  );
}
