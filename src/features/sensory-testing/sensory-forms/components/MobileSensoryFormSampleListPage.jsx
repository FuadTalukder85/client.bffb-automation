import React from "react";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { AlertCircle, Eye, Pencil } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { NoData } from "@/components/ui/NoData";

export default function MobileSensoryFormSampleListPage({
  navigate,
  project,
  searchTerm,
  handleSearchChange,
  filters,
  error,
  isLoading,
  samples,
  currentPage,
  totalPages,
  itemsPerPage,
  handleItemsPerPageChange,
  setCurrentPage,
  handleSampleClick,
  noDataMessage,
  noDataDescription,
}) {
  return (
    <div className="flex flex-col flex-1 w-full min-h-0 text-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 bg-background">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-muted rounded-xl bg-[#F0EBF8] text-primary transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div className="flex flex-col min-w-0">
          <h1 className="text-lg font-bold truncate leading-tight">
            {project?.masterProject?.title || project?.title || "Samples"}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="px-2 py-0.5 rounded-full border border-primary/10 text-[10px] font-bold text-primary bg-primary/5 uppercase tracking-wider">
              {project?.masterProject?.code || project?.code || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Search & Filters */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        searchPlaceholder="Search samples..."
        hideOnDesktop={true}
        filters={false}
      />

      <div className="flex flex-col flex-1 w-full min-h-0 pt-2 pb-5">
        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 p-4 mb-4 rounded-xl text-sm border border-destructive/20 bg-destructive/5 text-destructive">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error?.message || JSON.stringify(error)}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 opacity-60 font-medium text-sm">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4">Fetching samples...</p>
          </div>
        ) : (
          <>
            {samples.length > 0 ? (
              <>
                <div className="space-y-4">
                  {samples.map((sample, index) => {
                    const needsForm = !sample.hasSensoryFormOfCurrentUser;
                    const actionButton = {
                      key: "view",
                      icon: (props) => {
                        const IconComp = needsForm ? Pencil : Eye;
                        return <IconComp {...props} className={cn("action-button-icon", props.className)} />;
                      },
                      onClick: () => handleSampleClick(sample),
                      title: needsForm ? "Fill Evaluation" : "View Evaluation",
                      className: "flex-1 text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2",
                      iconSize: "w-5 h-5",
                    };

                    return (
                      <ExpandableCard
                        key={sample._id}
                        className="p-3 rounded-xl bg-background"
                      >
                        <ExpandableCard.Content initialHeight={130}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary/10 text-primary">
                              <span className="text-sm font-bold">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </span>
                            </div>

                            <div className="flex flex-col flex-1 min-w-0 text-right">
                              <h3 className="text-sm font-bold text-primary truncate">
                                {sample.recipeName || sample.recipe?.name || sample.project?.masterProject?.title || sample.project?.title || "Sample"}
                              </h3>
                              <span className="text-[11px] font-bold text-muted-foreground mt-0.5">
                                {sample.recipeCode || sample.recipe?.recipeCode || sample.project?.masterProject?.code || sample.project?.code || "—"}
                              </span>
                            </div>
                          </div>

                          <InfoTable>
                            <InfoTable.Row label="Production Date">
                              <div className="font-medium text-right text-nav-highlight">
                                {sample.createdAt
                                  ? new Date(sample.createdAt).toLocaleDateString(
                                      "en-GB",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )
                                  : "—"}
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
                  <div className="flex justify-center w-full my-7 md:hidden">
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
