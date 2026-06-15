import React from "react";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { AlertCircle, Eye } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { getStatusColor } from "@/constants/statusColors";
import { NoData } from "@/components/ui/NoData";

export default function MobileSensoryFormProjectListPage({
  searchTerm,
  handleSearchChange,
  filters,
  error,
  errorMessage,
  hasError,
  isLoading,
  normalizedProjects,
  currentPage,
  totalPages,
  setCurrentPage,
  itemsPerPage,
  handleItemsPerPageChange,
  handleViewProjectDetails,
  noDataMessage,
  noDataDescription,
}) {
  const renderStatusBadge = (status) => {
    if (!status) return <span className="text-muted-foreground">—</span>;
    
    return (
      <span
        className="px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-tight"
        style={getStatusColor(status)}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col flex-1 w-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between py-3">
        <h1 className="text-xl font-bold">Sensory Forms</h1>
      </div>

      {/* Mobile Search & Filters */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        searchPlaceholder="Search projects..."
        hideOnDesktop={true}
        filters={filters}
      />

      <div className="flex flex-col flex-1 w-full min-h-0 py-4">

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 opacity-60">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm font-medium">Loading projects...</p>
          </div>
        ) : (
          <>
            {normalizedProjects.length > 0 ? (
              <>
                <div className="space-y-4">
                  {normalizedProjects.map((project, index) => {
                    const actionButton = {
                      key: "view",
                      icon: (props) => <Eye {...props} className={cn("action-button-icon", props.className)} />,
                      onClick: () => handleViewProjectDetails(project),
                      title: "View Samples",
                      className: "flex-1 text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2",
                      iconSize: "w-5 h-5",
                    };

                    return (
                      <ExpandableCard
                        key={project._id}
                        className="p-3 rounded-xl bg-background"
                      >
                        <ExpandableCard.Content initialHeight={130}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary/10 text-primary">
                              <span className="text-sm font-bold">
                                {(currentPage - 1) * itemsPerPage + (index + 1)}
                              </span>
                            </div>

                            <div className="flex flex-col flex-1 min-w-0 text-right">
                              <h3 className="text-sm font-bold text-primary truncate">
                                {project.projectCode || "—"}
                              </h3>
                            </div>
                          </div>

                          <InfoTable>
                            <InfoTable.Row label="Project Name">
                              <div className="font-bold text-right text-foreground truncate max-w-[180px]">
                                {project.projectName || "—"}
                              </div>
                            </InfoTable.Row>

                            <InfoTable.Row label="Raised Date">
                              <div className="font-medium text-right text-nav-highlight">
                                {project.raisedDate ? new Date(project.raisedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                              </div>
                            </InfoTable.Row>

                            <InfoTable.Row label="Purpose">
                              <div className="font-medium text-right text-muted-foreground">
                                {project.purpose || "—"}
                              </div>
                            </InfoTable.Row>

                            <InfoTable.Row label="Purpose Name">
                              <div className="font-medium text-right text-muted-foreground">
                                {project.purposeName || "—"}
                              </div>
                            </InfoTable.Row>

                            <InfoTable.Row label="Objective">
                              <div className="font-medium text-right text-muted-foreground">
                                {project.objective || "—"}
                              </div>
                            </InfoTable.Row>

                            <InfoTable.Row label="Objective Details">
                              <div className="font-medium text-right text-muted-foreground truncate max-w-[180px]">
                                {project.objectiveDetails || "—"}
                              </div>
                            </InfoTable.Row>

                            <InfoTable.Row label="Application Category">
                              <div className="font-medium text-right text-muted-foreground">
                                {project.applicationCategory || "—"}
                              </div>
                            </InfoTable.Row>

                            <InfoTable.Row label="Application Subcategory">
                              <div className="font-medium text-right text-muted-foreground">
                                {project.applicationSubcategory || "—"}
                              </div>
                            </InfoTable.Row>

                            <InfoTable.Row label="Application Sub-subcategory">
                              <div className="font-medium text-right text-muted-foreground">
                                {project.applicationSubSubcategory || "—"}
                              </div>
                            </InfoTable.Row>

                            <InfoTable.Row label="Application Tags">
                              <div className="flex flex-wrap gap-1 justify-end">
                                {project.applicationTags?.length > 0 ? (
                                  project.applicationTags.map((tag, idx) => (
                                    <span key={idx} className="bg-[#f0ebf8] text-[#7c5cc4] text-[10px] px-2 py-0.5 rounded-full border border-[#7c5cc4]/20 border-solid whitespace-nowrap">
                                      {tag}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground">N/A</span>
                                )}
                              </div>
                            </InfoTable.Row>
                          </InfoTable>
                        </ExpandableCard.Content>

                        <ExpandableCard.Footer className="pt-2">
                          <ExpandableCard.FooterLeft>
                            <ButtonGroup buttons={[actionButton]} fullWidth />
                          </ExpandableCard.FooterLeft>
                          <ExpandableCard.FooterRight>
                            <ExpandableCard.ToggleButton />
                          </ExpandableCard.FooterRight>
                        </ExpandableCard.Footer>
                      </ExpandableCard>
                    );
                  })}
                </div>

                {/* Mobile Pagination */}
                {totalPages > 0 && (
                  <div className="flex justify-center w-full mt-auto pt-6 mb-7 lg:mb-0! md:hidden">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      itemsPerPage={itemsPerPage}
                      onItemsPerPageChange={handleItemsPerPageChange}
                    />
                  </div>
                )}
              </>
            ) : hasError && normalizedProjects.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-center text-red-500">
                {errorMessage}
              </div>
            ) : (
              <NoData
                message={noDataMessage}
                description={noDataDescription}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
