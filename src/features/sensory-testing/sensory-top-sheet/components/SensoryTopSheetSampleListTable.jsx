import React, { useMemo, useState } from "react";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Eye, MessageSquareText } from "lucide-react";
import { EvaluationCommentModal } from "./EvaluationCommentModal";
import { useSensoryTopSheetBySample } from "@/hooks/useSensoryForm";

export default function SensoryTopSheetSampleListTable({
  data,
  currentPage,
  itemsPerPage,
  totalPages,
  onPageChange,
  onItemsPerPageChange,
  sorting,
  onSortingChange,
  columnVisibility,
  onColumnVisibilityChange,
  columnPinning,
  onColumnPinningChange,
  columnSizing,
  onColumnSizingChange,
  onViewDetails,
  emptyState,
}) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedSampleForComment, setSelectedSampleForComment] = useState(null);
  const [loadingSampleId, setLoadingSampleId] = useState(null);

  // Fetch full sensory data when a sample is selected for viewing comments
  const { data: topSheetData } = useSensoryTopSheetBySample(loadingSampleId, {
    enabled: !!loadingSampleId && isCommentModalOpen
  });

  const serialOffset = (currentPage - 1) * itemsPerPage;

  const handleOpenCommentModal = (sample) => {
    setLoadingSampleId(sample._id);
    setIsCommentModalOpen(true);
    // Temporarily clear previous selection to show loading if needed
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
      
      // Use the first evaluation form as the base data (panelist info)
      // This matches the mapping in SensoryTopSheetDetailPage
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
        // Fallback if no forms but we have some row data
        setSelectedSampleForComment({
          data: { panelistName: "No evaluations found" },
          comments: [],
          remarks: []
        });
      }
    }
  }, [topSheetData, isCommentModalOpen]);

  const columns = useMemo(
    () => [
      {
        id: "serial",
        header: "SL",
        headerClassName: "table-head-cell text-center",
        cell: ({ row }) => (
          <div className="flex items-center justify-center size-5 lg:size-5 xl:size-6.5 2xl:size-8 3xl:size-10 p-1.5 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 bg-primary/10 rounded-full mx-auto">
            <span className="text-nav-highlight font-semibold">
              {serialOffset + row.index + 1}
            </span>
          </div>
        ),
        size: getResponsiveSize({ lg: 32, xl: 43, '2xl': 48, '3xl': 60 }),
        enableSorting: false,
        enableHiding: false,
        enablePinning: true,
      },
      {
        accessorKey: "recipe.recipeCode",
        header: "Recipe Code",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-medium text-nav-highlight text-center block w-full">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
      },
      {
        accessorKey: "recipe.name",
        header: "Application Recipe Name",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-semibold block text-center w-full">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 133, xl: 178, '2xl': 200, '3xl': 250 }),
      },
      {
        accessorKey: "createdAt",
        header: "Production Date",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => {
          const date = getValue();
          if (!date) return "—";
          return (
            <span className="text-center block w-full">
              {new Date(date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          );
        },
        size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
      },
      {
        id: "comment",
        header: "Comment",
        headerClassName: "table-head-cell text-center",
        size: getResponsiveSize({ lg: 53, xl: 71, '2xl': 80, '3xl': 100 }),
        enablePinning: true,
        cell: ({ row }) => {
          const hasFeedback = Boolean(
            row.original?.hasTopSheetFeedback ||
              row.original?.topSheetComment ||
              row.original?.topSheetRemark
          );

          if (!hasFeedback) {
            return (
              <div className="flex items-center justify-center gap-0">
                <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-muted-foreground">N/A</span>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-center gap-0">
              <button
                className="action-button flex items-center justify-center bg-primary-shade-2 rounded-md cursor-pointer hover:bg-primary hover:text-white transition-colors border border-transparent"
                onClick={() => handleOpenCommentModal(row.original)}
                title="View Comment"
                aria-label="View Comment"
              >
                <MessageSquareText className="action-button-icon" />
              </button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "table-head-cell text-center",
        size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
        enablePinning: true,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-0">
            <button
              className="action-button flex items-center justify-center bg-primary-shade-2 rounded-md cursor-pointer hover:bg-primary hover:text-white transition-colors border border-transparent"
              onClick={() => onViewDetails?.(row.original)}
              title="View Details"
              aria-label="View Details"
            >
              <Eye className="action-button-icon" />
            </button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [serialOffset, onViewDetails]
  );

  return (
    <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0">
      <PaginatedTable
        data={data}
        columns={columns}
        className="scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        columnPinning={
          columnPinning &&
          (columnPinning.left?.length > 0 || columnPinning.right?.length > 0)
            ? columnPinning
            : { left: ["serial"], right: ["actions"] }
        }
        onColumnPinningChange={onColumnPinningChange}
        columnSizing={columnSizing}
        onColumnSizingChange={onColumnSizingChange}
        rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
        headerRowClassName="bg-transparent"
        bodyRowClassName="border-0"
        bodyCellClassName="first:pl-6 last:pr-6 py-0.5"
        tableClassName="custom-scrollbar"
        emptyState={emptyState}
      />

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
