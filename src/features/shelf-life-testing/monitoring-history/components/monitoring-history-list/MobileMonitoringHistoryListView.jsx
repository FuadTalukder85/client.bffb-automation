import React from "react";
import { formatDate, DATE_FORMATS } from "@/utils/dateFormatter";
import { MessageSquareText, AlertCircle } from "lucide-react";
import MonitoringEvaluationCommentModal from "./MonitoringEvaluationCommentModal";
import { Pagination } from "@/components/ui/Pagination";

export default function MobileMonitoringHistoryListView({
  isLoading,
  data,
  currentPage,
  itemsPerPage,
  totalPages,
  setCurrentPage,
  setItemsPerPage,
}) {
  const serialOffset = (currentPage - 1) * itemsPerPage;
  const checkingDatesCount = Math.max(8, ...data.map((row) => row.checkingDates?.length || 0));

  const [isCommentModalOpen, setIsCommentModalOpen] = React.useState(false);
  const [selectedComment, setSelectedComment] = React.useState("");
  
  const handleOpenCommentModal = (row) => {
    setSelectedComment(row.comment || "");
    setIsCommentModalOpen(true);
  };

  if (!isLoading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
        <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-muted">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-lg font-bold">No Records Found</h3>
      </div>
    );
  }

  return (
    <div className="md:hidden flex flex-col flex-1 min-h-0 bg-background dark:bg-background">
      <div className="bg-background dark:bg-background rounded-2xl border border-border overflow-hidden flex flex-col mb-4">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full border-collapse table-fixed min-w-[1000px]">
            <thead>
              <tr className="bg-white dark:bg-background">
                <th rowSpan={2} className="border-b border-r border-border dark:border-border p-2 text-[10px] font-bold text-foreground w-12">SL</th>
                <th rowSpan={2} className="border-b border-r border-border dark:border-border p-2 text-[10px] font-bold text-foreground w-28">Recipe Code</th>
                <th rowSpan={2} className="border-b border-r border-border dark:border-border p-2 text-[10px] font-bold text-foreground w-32">Recipe Name</th>
                <th rowSpan={2} className="border-b border-r border-border dark:border-border p-2 text-[10px] font-bold text-foreground w-36">Prod Date</th>
                <th rowSpan={2} className="border-b border-r border-border dark:border-border p-2 text-[10px] font-bold text-foreground w-24">Comment</th>
                <th colSpan={checkingDatesCount} className="border-b border-border dark:border-border bg-[#F3F4F6]/50 dark:bg-primary/20 p-1 text-[10px] font-bold text-foreground text-center">Checking Date</th>
              </tr>
              <tr className="bg-[#F3F4F6]/50 dark:bg-primary/20">
                {Array.from({ length: checkingDatesCount }, (_, i) => (
                  <th key={i} className="border-b border-r border-border dark:border-border p-1 text-[9px] font-bold text-foreground last:border-r-0 w-[100px]">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={row._id} className="bg-white dark:bg-background hover:bg-muted/30 dark:hover:bg-muted/30 transition-colors">
                  <td className="border-b border-r border-border dark:border-border p-2 text-center">
                    <div className="flex items-center justify-center size-6 bg-primary/10 rounded-full mx-auto">
                      <span className="text-nav-highlight text-[9px] font-bold">
                        {serialOffset + index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="border-b border-r border-border p-2 text-center text-[10px] font-medium text-nav-highlight truncate">
                    {row.recipeCode}
                  </td>
                  <td className="border-b border-r border-border p-2 text-center text-[10px] font-bold text-foreground truncate">
                    {row.recipeName}
                  </td>
                  <td className="border-b border-r border-border p-2 text-center text-[9px] font-medium">
                    {row.productionDate ? formatDate(row.productionDate, DATE_FORMATS.FULL_SHORT_MONTH) : ""}
                  </td>
                  <td className="border-b border-r border-border dark:border-border p-2 text-center text-[9px] font-medium">
                    <button
                      className="p-1.5 rounded-[4px] bg-primary/10 dark:bg-muted text-primary dark:text-muted-foreground hover:text-primary hover:bg-primary/70 hover:text-white transition-colors mx-auto flex items-center justify-center"
                      onClick={() => handleOpenCommentModal(row)}
                    >
                      <MessageSquareText size={16} />
                    </button>
                  </td>
                  {Array.from({ length: checkingDatesCount }).map((_, i) => (
                    <td key={i} className="border-b border-r border-border p-2 text-center text-[9px] font-medium text-muted-foreground/80 last:border-r-0">
                      {row.checkingDates?.[i] ? formatDate(row.checkingDates[i], DATE_FORMATS.FULL_SHORT_MONTH) : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>

      <MonitoringEvaluationCommentModal
        open={isCommentModalOpen}
        onOpenChange={setIsCommentModalOpen}
        comment={selectedComment}
        title="Comment"
      />

      {totalPages > 0 && (
        <div className="flex justify-center w-full mt-auto mb-7 lg:mb-0! md:hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage?.(val);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
