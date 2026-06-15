import React from "react";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { AlertCircle, Eye, MessageSquareText } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { EvaluationCommentModal } from "./EvaluationCommentModal";
import { useSensoryTopSheetBySample } from "@/hooks/useSensoryForm";

export default function MobileSensoryTopSheetViewPage({
  navigate,
  project,
  searchTerm,
  handleSearchChange,
  error,
  isLoading,
  samples,
  itemsPerPage,
  handleItemsPerPageChange,
  currentPage,
  totalPages,
  setCurrentPage,
  handleSampleClick,
  errorMessage,
  hasError,
}) {
  const [isCommentModalOpen, setIsCommentModalOpen] = React.useState(false);
  const [selectedSampleForComment, setSelectedSampleForComment] = React.useState(null);
  const [loadingSampleId, setLoadingSampleId] = React.useState(null);

  // Fetch full sensory data when a sample is selected for viewing comments
  const { data: topSheetData, isLoading: isTopSheetLoading } = useSensoryTopSheetBySample(loadingSampleId, {
    enabled: !!loadingSampleId && isCommentModalOpen
  });

  const handleOpenCommentModal = (sample) => {
    setLoadingSampleId(sample._id);
    setIsCommentModalOpen(true);
    setSelectedSampleForComment(null);
  };

  // Sync loaded data to modal state
  React.useEffect(() => {
    if (topSheetData && isCommentModalOpen) {
      const topSheets = topSheetData?.topSheets || [];
      const selectedTopSheet = topSheets[0];

      if (selectedTopSheet) {
        const panelistId = selectedTopSheet?.panelistID?._id || selectedTopSheet?.panelistID;
        setSelectedSampleForComment({
          data: {
            ...selectedTopSheet,
            panelistName: selectedTopSheet?.panelistID?.name || "—",
          },
          comments: panelistId
            ? [{ panelistId, comment: selectedTopSheet?.panelistComment || "" }]
            : [],
          remarks: panelistId
            ? [{ panelistId, remark: selectedTopSheet?.panelistRemarks || "" }]
            : [],
        });
        return;
      }

      const forms = topSheetData.aggregatedForms?.forms || [];
      const comments = topSheetData.aggregatedForms?.comments || [];
      const remarks = topSheetData.aggregatedForms?.remarks || [];
      
      if (forms.length > 0) {
        setSelectedSampleForComment({
          data: {
            ...forms[0],
            panelistName: forms[0].panelistID?.name || "—",
          },
          comments,
          remarks
        });
      } else {
        setSelectedSampleForComment({
          data: { panelistName: "No evaluations found" },
          comments: [],
          remarks: []
        });
      }
    }
  }, [topSheetData, isCommentModalOpen]);
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
            {project?.masterProject?.title || project?.projectName || project?.title || project?.name || "Samples"}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="px-2 py-0.5 rounded-full border border-primary/10 text-[10px] font-bold text-primary bg-primary/5 uppercase tracking-wider">
              {project?.masterProject?.code || project?.projectCode || project?.code || "—"}
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

      <div className="flex flex-col flex-1 w-full min-h-0 pt-2">

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
                    const hasTopSheetFeedback = Boolean(
                      sample?.hasTopSheetFeedback ||
                        sample?.topSheetComment ||
                        sample?.topSheetRemark
                    );

                    const actionButton = {
                      key: "view",
                      icon: (props) => (
                        <Eye {...props} className={`action-button-icon ${props.className || ""}`} />
                      ),
                      onClick: () => handleSampleClick(sample),
                      title: "View Details",
                      className: "flex-1 text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2",
                      iconSize: "w-5 h-5",
                    };

                    const commentButton = hasTopSheetFeedback
                      ? {
                          key: "comment",
                          icon: (props) => (
                            <MessageSquareText {...props} className={`action-button-icon ${props.className || ""}`} />
                          ),
                          onClick: () => handleOpenCommentModal(sample),
                          title: "View Comment",
                          className: "flex-1 text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2",
                          iconSize: "w-5 h-5",
                        }
                      : null;

                    return (
                      <ExpandableCard
                        key={sample._id || index}
                        className="p-3 rounded-xl bg-background"
                      >
                        <ExpandableCard.Content initialHeight={130}>
                          {/* Card Header */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary/10 text-primary">
                              <span className="text-sm font-bold">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </span>
                            </div>

                            <div className="flex flex-col flex-1 min-w-0 text-right">
                              <h3 className="text-sm font-bold text-primary truncate">
                                {sample.recipeName || "—"}
                              </h3>
                              <span className="text-[11px] font-bold text-muted-foreground mt-0.5">
                                {sample.recipeCode || "—"}
                              </span>
                            </div>
                          </div>

                          {/* Card Info Rows */}
                          <InfoTable>
                            <InfoTable.Row label="Recipe Code">
                              <div className="font-medium text-right text-nav-highlight">
                                {sample.recipe?.recipeCode || "—"}
                              </div>
                            </InfoTable.Row>
                            <InfoTable.Row label="Recipe Name">
                              <div className="font-medium text-right">
                                {sample.recipe?.name || "—"}
                              </div>
                            </InfoTable.Row>
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
                            {hasTopSheetFeedback ? (
                              <ButtonGroup buttons={[commentButton, actionButton]} fullWidth gap="gap-2" />
                            ) : (
                              <div className="flex items-center gap-2 w-full">
                                <div className="h-9 px-2 flex-1 rounded-md border border-border bg-muted/30 text-muted-foreground text-sm font-semibold flex items-center justify-center">
                                  N/A
                                </div>
                                <ButtonGroup buttons={[actionButton]} fullWidth className="flex-1" />
                              </div>
                            )}
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
                  <div className="flex justify-center w-full mt-auto mb-7 lg:mb-0! md:hidden">
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
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                {hasError ? (
                  <div className="text-red-500">{errorMessage}</div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">No Samples Found</h3>
                    <p className="text-sm text-muted-foreground/80 max-w-[200px] mx-auto leading-tight">
                      {searchTerm ? "No samples match your search criteria." : "No samples have been created for this project yet."}
                    </p>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {selectedSampleForComment && (
        <EvaluationCommentModal
          open={isCommentModalOpen}
          onOpenChange={setIsCommentModalOpen}
          data={selectedSampleForComment.data}
          comments={selectedSampleForComment.comments}
          remarks={selectedSampleForComment.remarks}
          hidePanelistName={true}
        />
      )}
    </div>
  );
}
