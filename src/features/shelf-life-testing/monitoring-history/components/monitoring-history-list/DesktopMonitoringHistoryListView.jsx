import React from "react";
import { formatDate, DATE_FORMATS } from "@/utils/dateFormatter";
import { Pagination } from "@/components/ui/Pagination";
import { ApplicationLabRecordsTableSkeleton } from "@/features/application-lab/application-lab-records/components/ApplicationLabRecordsTableSkeleton";
import { MessageSquareText } from "lucide-react";
import MonitoringEvaluationCommentModal from "./MonitoringEvaluationCommentModal";

export default function DesktopMonitoringHistoryListView({
  isLoading,
  data,
  currentPage,
  itemsPerPage,
  totalPages,
  setCurrentPage,
  setItemsPerPage,
}) {
  const [isCommentModalOpen, setIsCommentModalOpen] = React.useState(false);
  const [selectedComment, setSelectedComment] = React.useState("");

  const serialOffset = (currentPage - 1) * itemsPerPage;
  const checkingDatesCount = Math.max(16, ...data.map((row) => row.checkingDates?.length || 0));

  const handleOpenCommentModal = (row) => {
    setSelectedComment(row.comment || "");
    setIsCommentModalOpen(true);
  };


  if (isLoading) {
    return <ApplicationLabRecordsTableSkeleton rows={5} />;
  }

  return (
    <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
      <div className="bg-background rounded-xl lg:rounded-2xl xl:rounded-3xl 2xl:rounded-4xl border border-border overflow-hidden flex flex-col flex-1 min-h-0 max-h-full">
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <table className="border-separate border-spacing-0 min-w-max">
            <thead>
              <tr className="">
                <th rowSpan={2} className="sticky left-0 z-20 bg-white dark:bg-background border-b border-r border-border py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 px-1 lg:px-[1px] xl:px-[2px] 2xl:px-[3px] 3xl:px-1 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold text-foreground min-w-[60px] lg:min-w-[32px] xl:min-w-[42px] 2xl:min-w-[48px] 3xl:min-w-[60px] w-[60px] lg:w-[32px] xl:w-[42px] 2xl:w-[48px] 3xl:w-[60px]">
                  SL
                </th>
                <th rowSpan={2} className="sticky left-[60px] lg:left-[32px] xl:left-[42px] 2xl:left-[48px] 3xl:left-[60px] z-20 bg-white dark:bg-background border-b border-r border-border py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 px-1 lg:px-[1px] xl:px-[2px] 2xl:px-[3px] 3xl:px-1 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold text-foreground min-w-[190px] lg:min-w-[101px] xl:min-w-[135px] 2xl:min-w-[152px] 3xl:min-w-[190px] w-[190px] lg:w-[101px] xl:w-[135px] 2xl:w-[152px] 3xl:w-[190px]">
                  Recipe Code
                </th>
                <th rowSpan={2} className="sticky left-[250px] lg:left-[133px] xl:left-[177px] 2xl:left-[200px] 3xl:left-[250px] z-20 bg-white dark:bg-background border-b border-r border-border py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 px-1 lg:px-[1px] xl:px-[2px] 2xl:px-[3px] 3xl:px-1 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold text-foreground min-w-[224px] lg:min-w-[101px] xl:min-w-[135px] 2xl:min-w-[152px] 3xl:min-w-[224px] w-[224px] lg:w-[101px] xl:w-[135px] 2xl:w-[152px] 3xl:w-[224px]">
                  Application Recipe Name
                </th>
                <th rowSpan={2} className="sticky left-[474px] lg:left-[234px] xl:left-[312px] 2xl:left-[352px] 3xl:left-[474px] z-20 bg-white dark:bg-background border-b border-r border-border py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 px-1 lg:px-[1px] xl:px-[2px] 2xl:px-[3px] 3xl:px-1 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold text-foreground min-w-[140px] lg:min-w-[75px] xl:min-w-[100px] 2xl:min-w-[112px] 3xl:min-w-[140px] w-[140px] lg:w-[75px] xl:w-[100px] 2xl:w-[112px] 3xl:w-[140px]">
                  Production Date
                </th>
                <th rowSpan={2} className="sticky left-[614px] lg:left-[309px] xl:left-[412px] 2xl:left-[464px] 3xl:left-[614px] z-20 bg-white dark:bg-background border-b border-r border-border py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 px-1 lg:px-[1px] xl:px-[2px] 2xl:px-[3px] 3xl:px-1 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold text-foreground min-w-[100px] lg:min-w-[53px] xl:min-w-[71px] 2xl:min-w-[80px] 3xl:min-w-[100px] w-[100px] lg:w-[53px] xl:w-[71px] 2xl:w-[80px] 3xl:w-[100px]">
                  Comment
                </th>
                <th colSpan={checkingDatesCount} className="border-b border-border bg-[#F3F4F6]/50 dark:bg-primary/20 p-2 lg:p-0.5 xl:p-1 2xl:p-1.5 3xl:p-2 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold text-foreground">
                Checking Date
                </th>
              </tr>
              <tr className="bg-[#F3F4F6]/50 dark:bg-primary/20">
                {Array.from({ length: checkingDatesCount }, (_, i) => (
                  <th key={i} className="border-b border-r border-border p-2 lg:p-0.5 xl:p-1 2xl:p-1.5 3xl:p-2 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-bold text-foreground last:border-r-0 min-w-[100px] lg:min-w-[53px] xl:min-w-[71px] 2xl:min-w-[80px] 3xl:min-w-[100px]">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={row._id} className="group hover:bg-muted/30 transition-colors">
                  <td className="sticky left-0 z-10 bg-white dark:bg-background group-hover:bg-muted/40 transition-colors border-b border-r border-border py-2 px-1 text-center min-w-[60px] lg:min-w-[32px] xl:min-w-[42px] 2xl:min-w-[48px] 3xl:min-w-[60px] w-[60px] lg:w-[32px] xl:w-[42px] 2xl:w-[48px] 3xl:w-[60px]">
                    <div className="flex items-center justify-center size-5.5 p-2 2xl:size-6.5 lg:p-2 xl:p-3 2xl:p-4 3xl:p-5 bg-primary/10 rounded-full mx-auto">
                      <span className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium text-nav-highlight">
                        {serialOffset + index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="sticky left-[60px] lg:left-[32px] xl:left-[42px] 2xl:left-[48px] 3xl:left-[60px] z-10 bg-white dark:bg-background group-hover:bg-muted/40 transition-colors border-b border-r border-border py-2 px-1 text-center text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-nav-highlight min-w-[190px] lg:min-w-[101px] xl:min-w-[135px] 2xl:min-w-[152px] 3xl:min-w-[190px] w-[190px] lg:w-[101px] xl:w-[135px] 2xl:w-[152px] 3xl:w-[190px]">
                    {row.recipeCode}
                  </td>
                  <td className="sticky left-[250px] lg:left-[133px] xl:left-[177px] 2xl:left-[200px] 3xl:left-[250px] z-10 bg-white dark:bg-background group-hover:bg-muted/40 transition-colors border-b border-r border-border py-2 px-1 text-center text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-foreground min-w-[224px] lg:min-w-[101px] xl:min-w-[135px] 2xl:min-w-[152px] 3xl:min-w-[224px] w-[224px] lg:w-[101px] xl:w-[135px] 2xl:w-[152px] 3xl:w-[224px]">
                    <span className="line-clamp-2">{row.recipeName}</span>
                  </td>
                  <td className="sticky left-[474px] lg:left-[234px] xl:left-[312px] 2xl:left-[352px] 3xl:left-[474px] z-10 bg-white dark:bg-background group-hover:bg-muted/40 transition-colors border-b border-r border-border py-2 px-1 text-center text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium min-w-[140px] lg:min-w-[75px] xl:min-w-[100px] 2xl:min-w-[112px] 3xl:min-w-[140px] w-[140px] lg:w-[75px] xl:w-[100px] 2xl:w-[112px] 3xl:w-[140px]">
                    {row.productionDate
                      ? formatDate(row.productionDate, DATE_FORMATS.FULL_SHORT_MONTH)
                      : ""}
                  </td>
                  <td className="sticky left-[614px] lg:left-[309px] xl:left-[412px] 2xl:left-[464px] 3xl:left-[614px] z-10 bg-white dark:bg-background group-hover:bg-muted/40 transition-colors border-b border-r border-border py-2 px-1 text-center text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium min-w-[100px] lg:min-w-[53px] xl:min-w-[71px] 2xl:min-w-[80px] 3xl:min-w-[100px] w-[100px] lg:w-[53px] xl:w-[71px] 2xl:w-[80px] 3xl:w-[100px]">
                    <div className="flex items-center justify-center">
                      <button
                        className="py-1 lg:py-[2px] xl:py-[2px] 2xl:py-[3px] 3xl:py-1 px-2.5 lg:lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2.5 rounded-[4px] bg-primary/10 dark:bg-muted text-primary dark:text-muted-foreground hover:text-primary hover:bg-primary/70 hover:text-white transition-colors cursor-pointer"
                        title="View sensory comment"
                        onClick={() => handleOpenCommentModal(row)}
                      >
                        <MessageSquareText className="w-3.5 h-3.5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5" />
                      </button>
                    </div>
                  </td>
                  {Array.from({ length: checkingDatesCount }).map((_, i) => (
                    <td key={i} className="border-b border-r border-border py-2 px-1 text-center text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-muted-foreground/80 min-w-[100px] lg:min-w-[53px] xl:min-w-[71px] 2xl:min-w-[80px] 3xl:min-w-[100px]">
                      {row.checkingDates?.[i]
                        ? formatDate(row.checkingDates[i], DATE_FORMATS.FULL_SHORT_MONTH)
                        : ""}
                    </td>
                  ))}
                </tr>
              ))}

              {data.length === 0 && (
                <tr>
                  <td colSpan={checkingDatesCount + 5} className="p-8 text-center text-muted-foreground">No history found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


        {/* Custom Pagination Footer to match PaginatedTable look */}
        <div className="px-10 py-3 flex items-center justify-between border-t border-border">
          <div className="flex-1">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              staticPosition={true}
              className="justify-start p-0 w-auto text-sm"
            />
          </div>
        </div>
      </div>
      <MonitoringEvaluationCommentModal
        open={isCommentModalOpen}
        onOpenChange={setIsCommentModalOpen}
        comment={selectedComment}
        title="Comment"
      />
    </div>
  );
}
