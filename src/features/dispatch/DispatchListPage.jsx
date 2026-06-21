import React, {
  useState,
  useEffect,
} from "react";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useDispatches } from "@/hooks/useDispatches";
import { useDebounce } from "@/hooks/useDebounce";
import { dispatchService } from "@/services/dispatchService";
import { Button } from "@/components/ui/Button";
import { ActionButtonsGroup } from "@/components/ui/ActionButtonsGroup";
import { Plus } from "lucide-react";
import DesktopDispatchTable from "./components/DesktopDispatchTable";
import MobileDispatchCard from "./components/MobileDispatchCard";
import { DispatchTableSkeleton } from "./components/DispatchTableSkeleton";
import { MobileDispatchCardSkeleton } from "./components/MobileDispatchCardSkeleton";
import {
  DispatchModal,
  UpdateDispatchModal,
  ArchiveDispatchModal,
  RestoreDispatchModal,
} from "./components/DispatchModals";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS, RESOURCES } from "@/constants/permissions";
import { Pagination } from "@/components/ui/Pagination";
import { DISPATCH_TYPES, SAMPLE_DELIVERY_STATUSES } from "@/constants/dispatchConstants";
import { STATUS_COLOR_PALETTE } from "@/constants/statusColors";
import { NoData } from "@/components/ui/NoData";
import { toast } from "sonner";
import { hasPermission } from "@/lib/utils";
import MobileBulkActionBar from "@/components/ui/MobileBulkActionBar";

// storage keys for table state
const STORAGE_KEYS = {
  COLUMN_VISIBILITY: "dispatch_columnVisibility",
  COLUMN_PINNING: "dispatch_columnPinning",
  COLUMN_SIZING: "dispatch_columnSizing",
};

const getStoredValue = (key, defaultValue) => {
  try {
    const stored = sessionStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStoredValue = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // ignore storage errors
    console.debug("setStoredValue error", err);
  }
};

// Status tabs (mapped from SAMPLE_DELIVERY_STATUSES)
const statusTabs = [
  { 
    label: "All Status", 
    value: "all",
    bgColor: STATUS_COLOR_PALETTE.ALL_STATUS.bgColor,
    textColor: STATUS_COLOR_PALETTE.ALL_STATUS.textColor
  },
  { 
    label: "Not Started", 
    value: SAMPLE_DELIVERY_STATUSES.NOT_STARTED,
    bgColor: STATUS_COLOR_PALETTE.NOT_STARTED.bgColor,
    textColor: STATUS_COLOR_PALETTE.NOT_STARTED.textColor
  },
  { 
    label: "In Progress", 
    value: SAMPLE_DELIVERY_STATUSES.IN_PROGRESS,
    bgColor: STATUS_COLOR_PALETTE.IN_PROGRESS.bgColor,
    textColor: STATUS_COLOR_PALETTE.IN_PROGRESS.textColor
  },
  { 
    label: "Completed", 
    value: SAMPLE_DELIVERY_STATUSES.COMPLETED,
    bgColor: STATUS_COLOR_PALETTE.COMPLETED.bgColor,
    textColor: STATUS_COLOR_PALETTE.COMPLETED.textColor
  },
  { 
    label: "Paused", 
    value: SAMPLE_DELIVERY_STATUSES.PAUSED,
    bgColor: STATUS_COLOR_PALETTE.PAUSED.bgColor,
    textColor: STATUS_COLOR_PALETTE.PAUSED.textColor
  },
  { 
    label: "Cancelled", 
    value: SAMPLE_DELIVERY_STATUSES.CANCELLED,
    bgColor: STATUS_COLOR_PALETTE.CANCELLED.bgColor,
    textColor: STATUS_COLOR_PALETTE.CANCELLED.textColor
  },
];

// Type filter options (similar to stateOptions in BFF page)
const typeOptions = [
  { label: "Client", value: DISPATCH_TYPES.CLIENT },
  { label: "Campaign", value: DISPATCH_TYPES.CAMPAIGN },
  { label: "Internal", value: DISPATCH_TYPES.INTERNAL },
  { label: "External Testing", value: DISPATCH_TYPES.EXTERNAL_TESTING },
];

const getResponseMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

const getErrorMessage = (error) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  "Failed to load dispatches";

export default function DispatchListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedState, setSelectedState] = useState("true");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sorting, setSorting] = useState([]);
  // import/export functionality removed per request
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  useEffect(() => {
    setSelectedRowIds([]);
  }, [currentPage, searchTerm, selectedStatus, selectedType, selectedState]);

  const [isArchiveModalOpen, setArchiveModalOpen] = useState(false);
  const [isRestoreModalOpen, setRestoreModalOpen] = useState(false);

  const { permissions, loading: permsLoading } = useUserPermissions();
  const { user } = useAuthStore();
  const noDataMessage = "No Records Found";
  const noDataDescription = searchTerm
    ? `No records match "${searchTerm}". Try adjusting your search or filter criteria.`
    : "No records match your current filters. Try adjusting your search or filter criteria.";

  // table state persistence
  const [columnVisibility, setColumnVisibility] = useState(() =>
    getStoredValue(STORAGE_KEYS.COLUMN_VISIBILITY, {})
  );
  const [columnPinning, setColumnPinning] = useState(() =>
    getStoredValue(STORAGE_KEYS.COLUMN_PINNING, {})
  );
  const [columnSizing, setColumnSizing] = useState(() =>
    getStoredValue(STORAGE_KEYS.COLUMN_SIZING, {})
  );

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.COLUMN_VISIBILITY, columnVisibility);
  }, [columnVisibility]);
  useEffect(() => {
    setStoredValue(STORAGE_KEYS.COLUMN_PINNING, columnPinning);
  }, [columnPinning]);
  useEffect(() => {
    setStoredValue(STORAGE_KEYS.COLUMN_SIZING, columnSizing);
  }, [columnSizing]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, isLoading, error, refetch } = useDispatches({
    searchTerm: debouncedSearchTerm,
    sampleDeliveryStatus: selectedStatus === "all" ? undefined : selectedStatus,
    dispatchType: selectedType === "all" ? undefined : selectedType,
    isActive: selectedState === "all" ? undefined : selectedState,
    page: currentPage,
    limit: itemsPerPage,
    enabled: !permsLoading && hasPermission(permissions, PERMISSIONS.DISPATCH.READ),
  });

  const errorMessage = error ? getErrorMessage(error) : "";
  const hasError = Boolean(errorMessage);

  const handleCreateClick = () => {
    setModalMode("create");
    setSelectedRecord(null);
    setIsDispatchModalOpen(true);
  };

  // other handlers

  const handleEdit = (record) => {
    setModalMode("update");
    setSelectedRecord(record);
    setIsDispatchModalOpen(true);
  };

  const handleArchive = (record) => {
    setSelectedRecord(record);
    setArchiveModalOpen(true);
  };

  const handleRestore = (record) => {
    setSelectedRecord(record);
    setRestoreModalOpen(true);
  };

  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 h-[calc(100vh-6rem)] md:h-full overflow-hidden">
      {/* Header with search on desktop */}
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <PageHeader
          title="Client Sample Delivery"
          className="pb-0 text-heading md:p-0 md:m-0"
        />
         <div className="md:hidden flex items-center mb-2">
            <Button
              className="px-4 rounded-full h-7"
              intent="primary"
              onClick={handleCreateClick}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Desktop: status tabs + Create Button */}
      <div className="flex-none hidden md:block ms-5 my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 border-b border-border">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-1 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-body font-medium transition-colors border-b-2 -mb-px ${
                  selectedStatus === tab.value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.value === "all" ? "All" : tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center mb-2">
            <Button
              className="px-6 rounded-full"
              intent="primary"
              onClick={handleCreateClick}
            >
              <Plus className="w-3.5 h-3.5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 mr-1" /> Create Sample Delivery
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop: type pills and state pills toggle */}
      <div className="flex-none hidden md:block ms-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DesktopFilterPills
              value={selectedType}
              options={[{ label: "All", value: "all" }, ...typeOptions]}
              onChange={(val) => {
                setSelectedType(val);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex items-center">
            <DesktopFilterPills
              className="ml-4"
              value={selectedState}
              options={[
                { label: "Active", value: "true" },
                { label: "Archive", value: "false" },
                { label: "All", value: "all" },
              ]}
              onChange={(val) => {
                setSelectedState(val);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile/desktop search+filter bar (sticky) */}
      <div className="mt-4">
        <SearchFilterBar
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          filters={[
            {
              id: "status",
              options: statusTabs,
              value: selectedStatus,
              onChange: setSelectedStatus,
              placeholder: "Select status...",
              defaultValue: "all",
            },
            {
              id: "type",
              options: [{ label: "All", value: "all" }, ...typeOptions],
              value: selectedType,
              onChange: setSelectedType,
              placeholder: "Select type...",
              defaultValue: "all",
            },
            {
              id: "state",
              options: [
                { label: "Active", value: "true" },
                { label: "Archive", value: "false" },
                { label: "All", value: "all" },
              ],
              value: selectedState,
              onChange: setSelectedState,
              placeholder: "Select state...",
              defaultValue: "true",
            },
          ]}
          hideOnDesktop={true}
          rightComponents={<ThemeToggle />}
        />
      </div>

      {/* content area */}
      <div className="flex flex-col flex-1 w-full min-h-0 overflow-y-auto custom-scrollbar md:px-0 pb-20 md:pb-0">
        {isLoading ? (
          <>
            <div className="mt-6 md:hidden">
              <MobileDispatchCardSkeleton count={5} />
            </div>
            <div className="hidden px-2 border shadow-sm md:block bg-background border-border/50">
              <DispatchTableSkeleton
                rows={5}
                columnVisibility={columnVisibility}
                columnPinning={columnPinning}
                columnSizing={columnSizing}
              />
            </div>
          </>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="mt-6 md:hidden">
              {hasError && !data?.data?.length ? (
                <div className="flex items-center justify-center py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : data?.data?.length > 0 ? (
                data.data.map((record, index) => (
                  <MobileDispatchCard
                    key={record._id}
                    record={record}
                    serialNumber={(currentPage - 1) * itemsPerPage + index + 1}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                    onRestore={handleRestore}
                    permissions={permissions}
                    selectedRowIds={selectedRowIds}
                    onSelectChange={setSelectedRowIds}
                  />
                ))
              ) : (
                <NoData
                  message={noDataMessage}
                  description={noDataDescription}
                />
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0 ">
              <DesktopDispatchTable
                data={data?.data || []}
                selectedRowIds={selectedRowIds}
                onSelectionChange={setSelectedRowIds}
                onBulkArchiveClick={() => {
                  const selectedObjects = (data?.data || []).filter(r => selectedRowIds.includes(r._id || r.id));
                  setSelectedRecord(selectedObjects);
                  setArchiveModalOpen(true);
                }}
                isArchived={selectedState === "false"}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalPages={data?.pagination?.totalPages || 1}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
                onEdit={handleEdit}
                onArchive={handleArchive}
                onRestore={handleRestore}
                sorting={sorting}
                onSortingChange={setSorting}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                columnPinning={columnPinning}
                onColumnPinningChange={setColumnPinning}
                columnSizing={columnSizing}
                onColumnSizingChange={setColumnSizing}
                permissions={permissions}
                emptyState={
                  hasError ? (
                    <div className="py-10 text-center text-red-500">{errorMessage}</div>
                  ) : null
                }
                noDataMessage={noDataMessage}
                noDataDescription={noDataDescription}
              />
            </div>
          </>
        )}
      </div>

      {/* pagination similar to other pages */}
      {data?.pagination && data.pagination.totalPages > 0 && (
        <div className="flex justify-center w-full mt-auto mb-7 lg:mb-0! md:hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={data.pagination.totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Modals */}
      {modalMode === "create" ? (
        <DispatchModal
          open={isDispatchModalOpen}
          onOpenChange={setIsDispatchModalOpen}
          dispatch={selectedRecord}
          mode={modalMode}
          onConfirm={async (payload) => {
            // project field is only used for filtering recipes on the frontend
            const { project, ...data } = payload;
            try {
              const response = await dispatchService.createDispatch(data);
              refetch();
              toast.success(
                getResponseMessage(
                  response,
                  "Client sample delivery created successfully"
                )
              );
            } catch (err) {
              toast.error(
                err?.response?.data?.error ||
                  err?.response?.data?.message ||
                  err?.message ||
                  "Failed to create client sample delivery"
              );
              throw err;
            }
          }}
        />
      ) : (
        <UpdateDispatchModal
          open={isDispatchModalOpen}
          onOpenChange={setIsDispatchModalOpen}
          dispatch={selectedRecord}
          onConfirm={async (payload) => {
            try {
              const response = await dispatchService.updateDispatch(selectedRecord._id, payload);
              refetch();
              toast.success(
                getResponseMessage(
                  response,
                  "Client sample delivery updated successfully"
                )
              );
            } catch (err) {
              toast.error(
                err?.response?.data?.error ||
                  err?.response?.data?.message ||
                  err?.message ||
                  "Failed to update client sample delivery"
              );
              throw err;
            }
          }}
        />
      )}

      <ArchiveDispatchModal
        open={isArchiveModalOpen}
        onOpenChange={setArchiveModalOpen}
        item={selectedRecord}
        onConfirm={async (item) => {
          try {
            if (Array.isArray(item)) {
              const results = await Promise.allSettled(
                item.map((r) => dispatchService.archiveDispatch(r._id || r.id))
              );
              const succeeded = results.filter((res) => res.status === "fulfilled").length;
              const failed = results.filter((res) => res.status === "rejected");
              if (succeeded > 0) toast.success(`${succeeded} client sample delivery(ies) archived successfully`);
              if (failed.length > 0) toast.error(`Failed to archive ${failed.length} client sample delivery(ies)`);
              setSelectedRowIds([]);
            } else {
              const response = await dispatchService.archiveDispatch(item._id);
              toast.success(
                getResponseMessage(
                  response,
                  "Client sample delivery archived successfully"
                )
              );
            }
            refetch();
          } catch (err) {
            toast.error(
              err?.response?.data?.error ||
                err?.response?.data?.message ||
                err?.message ||
                "Failed to archive client sample delivery"
            );
            throw err;
          }
        }}
      />

      <RestoreDispatchModal
        open={isRestoreModalOpen}
        onOpenChange={setRestoreModalOpen}
        item={selectedRecord}
        onConfirm={async (item) => {
          try {
            const response = await dispatchService.restoreDispatch(item._id);
            refetch();
            toast.success(
              getResponseMessage(
                response,
                "Client sample delivery restored successfully"
              )
            );
          } catch (err) {
            toast.error(
              err?.response?.data?.error ||
                err?.response?.data?.message ||
                err?.message ||
                "Failed to restore client sample delivery"
            );
            throw err;
          }
        }}
      />
      <MobileBulkActionBar
        selectedCount={selectedRowIds.length}
        onCancel={() => setSelectedRowIds([])}
        onAction={() => {
          const selectedObjects = (data?.data || []).filter(r => selectedRowIds.includes(r._id || r.id));
          setSelectedRecord(selectedObjects);
          setArchiveModalOpen(true);
        }}
      />
    </section>
  );
}
