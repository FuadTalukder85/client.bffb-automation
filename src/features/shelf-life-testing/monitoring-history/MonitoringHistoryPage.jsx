import React, { useState } from "react";
import PageHeader from "@/components/common/page-header";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { DateRangePicker } from "@/components/ui/DatePicker";

import { useIsMobile } from "@/hooks/useIsMobile";
import { useMonitoringHistory } from "@/hooks/useSamples";
import { getApiErrorMessage } from "@/utils/apiError";
import { toast } from "sonner";
import { shelfLifeAPI } from "@/services/shelfLifeService";
import { toDateInputValue } from "@/utils/dateFormatter";

import DesktopMonitoringHistoryListView from "./components/monitoring-history-list/DesktopMonitoringHistoryListView";
import MobileMonitoringHistoryListView from "./components/monitoring-history-list/MobileMonitoringHistoryListView";

// data will be fetched from server using a custom hook
// each row represents a sample, checkingDates contains all active test record dates


export default function MonitoringHistoryPage() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  // start/end date range selected by user
  const [selectedRange, setSelectedRange] = useState({
    start: null,
    end: null,
  });
  const [sorting, setSorting] = useState([]);

  const startDate = selectedRange?.start ? toDateInputValue(selectedRange.start) : undefined;
  const endDate = selectedRange?.end ? toDateInputValue(selectedRange.end) : undefined;

  const { data: historyResponse, isLoading } = useMonitoringHistory({
    searchTerm,
    page: currentPage,
    limit: itemsPerPage,
    start: startDate,
    end: endDate,
    enabled: true,
  });

  const paginatedData = historyResponse?.data || [];
  const totalPages = historyResponse?.pagination?.totalPages || 1;


  const handleDownload = async () => {
    try {
      const trimmedSearch = (searchTerm || "").trim();
      const response = await shelfLifeAPI.exportMonitoringHistory({
        ...(trimmedSearch ? { search: trimmedSearch } : {}),
        ...(selectedRange?.start ? { start: toDateInputValue(selectedRange.start) } : {}),
        ...(selectedRange?.end ? { end: toDateInputValue(selectedRange.end) } : {}),
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const contentDisposition = response.headers?.["content-disposition"];
      let filename = "monitoring-history.xlsx";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, "");
      if (errorMessage) {
        toast.error(errorMessage);
      }
    }
  };

  const handlePrevDay = () => {
    setSelectedRange((prev) => {
      const baseStart = prev.start ? new Date(prev.start) : new Date();
      const baseEnd = prev.end ? new Date(prev.end) : new Date();
      baseStart.setDate(baseStart.getDate() - 1);
      baseEnd.setDate(baseEnd.getDate() - 1);
      return { start: baseStart, end: baseEnd };
    });
    setCurrentPage(1);
  };

  const handleNextDay = () => {
    setSelectedRange((prev) => {
      const baseStart = prev.start ? new Date(prev.start) : new Date();
      const baseEnd = prev.end ? new Date(prev.end) : new Date();
      baseStart.setDate(baseStart.getDate() + 1);
      baseEnd.setDate(baseEnd.getDate() + 1);
      return { start: baseStart, end: baseEnd };
    });
    setCurrentPage(1);
  };

  const handleDateChange = (e) => {
    const { start, end } = e.target.value || {};
    setSelectedRange({
      start: start ? new Date(start) : null,
      end: end ? new Date(end) : null,
    });
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (val) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };



  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <PageHeader
          title="Monitoring History"
          className="py-4 text-heading md:p-0 md:m-0"
        />

        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Search and Header Actions */}
      <div className="flex flex-col gap-4 md:hidden mb-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="flex items-center gap-2">
                <button 
                    onClick={handlePrevDay}
                    className="flex items-center justify-center w-6 h-6 bg-[#EEEBF4] dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                >
                    <RiArrowDropLeftLine className="w-4 h-4" />
                </button>
                <div className="min-w-[150px] lg:min-w-[80px] xl:min-w-[106px] 2xl:min-w-[120px] 3xl:min-w-[150px] [&_svg.lucide-calendar]:hidden [&_span]:text-center! border border-[#EEEBF4] rounded-md">
                    <DateRangePicker
                      value={{
                        start: selectedRange.start ? selectedRange.start.toISOString().split('T')[0] : "",
                        end: selectedRange.end ? selectedRange.end.toISOString().split('T')[0] : "",
                      }}
                      onChange={handleDateChange}
                      className="text-[12px] lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-[12px] font-semibold text-center text-primary dark:text-white py-0.5"
                      transparent={true}
                      position="bottom"
                    />
                </div>
                <button 
                    onClick={handleNextDay}
                    className="flex items-center justify-center w-6 h-6 bg-[#EEEBF4] dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                >
                    <RiArrowDropRightLine className="w-4 h-4" />
                </button>
             </div>
           </div>
           <Button 
              intent="primary" 
              size="sm" 
              className="rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg shadow-primary/20"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
            </Button>
        </div>

        <SearchInput
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Desktop Actions */}
      <div className="hidden md:flex justify-end items-center gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 my-4 lg:my-1 xl:my-2 2xl:my-3 3xl:my-4 mb-2 ms-5 px-4 md:px-0">
        <div className="flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2">
          <button 
              onClick={handlePrevDay}
              className="flex items-center justify-center w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 bg-[#EEEBF4] dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
              <RiArrowDropLeftLine className="w-3.5 h-3.5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4" />
          </button>
          <div className="min-w-[250px] lg:min-w-[133px] xl:min-w-[177px] 2xl:min-w-[200px] 3xl:min-w-[250px] [&_svg.lucide-calendar]:hidden [&_span]:text-center! border border-[#EEEBF4] rounded-md">
              <DateRangePicker
                  value={{
                    start: selectedRange.start ? selectedRange.start.toISOString().split('T')[0] : "",
                    end: selectedRange.end ? selectedRange.end.toISOString().split('T')[0] : "",
                  }}
                  onChange={handleDateChange}
                  className="text-[15px] lg:text-[8px] xl:text-[10px] 2xl:text-[12px]  font-semibold text-center text-primary dark:text-white py-0.5"
                  transparent={true}
                  position="bottom"
              />
          </div>
          <button 
              onClick={handleNextDay}
              className="flex items-center justify-center w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 bg-[#EEEBF4] dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
              <RiArrowDropRightLine className="w-3.5 h-3.5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 mr-1" />
          </button>
        </div>
        <Button 
          intent="primary" 
          className="px-6 rounded-full"
          onClick={handleDownload}
        >
          <Download className="w-3.5 h-3.5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 mr-1" />
          <span className="font-semibold text-[14px] lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[14px]">Download</span>
        </Button>
      </div>



      {/* Content Section */}
      <div className="flex flex-col flex-1 w-full min-h-0 overflow-hidden">
        {!isMobile ? (
          <DesktopMonitoringHistoryListView
            isLoading={isLoading}
            data={paginatedData}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={handleItemsPerPageChange}
            sorting={sorting}
            setSorting={setSorting}
            selectedRange={selectedRange}
          />
        ) : (
          <MobileMonitoringHistoryListView
            isLoading={isLoading}
            data={paginatedData}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={handleItemsPerPageChange}
            selectedRange={selectedRange}
          />
        )}
      </div>
    </section>
  );
}