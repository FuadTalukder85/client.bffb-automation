import React from "react";
import { ClipboardList, Eye } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { TbMessage2Search } from "react-icons/tb";
import StatusBadge from "@/components/ui/StatusBadge";
import {
    getProductDisplayCode,
    getProductDisplayName,
    getTaxonomyLabel,
} from "../utils/productDisplay";

// Type display mapping
const typeDisplayMap = {
    solid: "Solid",
    liquid: "Liquid",
};

export default function DesktopProductCodeTable({
    productCodes,
    selectedProductIds = [],
    onSelectChange,
    canArchive = false,
    onBulkArchiveClick,
    currentPage = 1,
    itemsPerPage = 10,
    totalPages = 1,
    onPageChange,
    onItemsPerPageChange,
    onEdit,
    onArchive,
    onRestore,
    canEditRecord,
    canArchiveRecord,
    canRestoreRecord,
    onViewDetails,
    sorting,
    onSortingChange,
    columnVisibility,
    onColumnVisibilityChange,
    columnPinning,
    onColumnPinningChange,
    columnSizing,
    onColumnSizingChange,
    noDataMessage: noDataMessageProp,
    noDataDescription: noDataDescriptionProp,
    emptyState,
}) {
    const serialOffset = (currentPage - 1) * itemsPerPage;
    const noDataMessage = noDataMessageProp || "No Records Found";
    const noDataDescription = noDataDescriptionProp ||
        "No records match your current filters. Try adjusting your search or filter criteria.";

    const columns = [
        {
            id: "serial",
            header: "SL",
            headerClassName: "text-start",
            className: " ",
            cell: ({ row }) => (
                <div className="flex items-center justify-center  size-5.5 p-2 2xl:size-6.5 2xl:p-3 3xl:size-10 3xl:p-4 bg-primary/10 rounded-full">
                    <span className="text-nav-highlight">{serialOffset + row.index + 1}</span>
                </div>
            ),
            size: getResponsiveSize({ lg: 32, xl: 43, '2xl': 48, '3xl': 60 }),
            enableSorting: false,
            enableHiding: false,
            enablePinning: true,
        },
        {
            accessorKey: "productCode",
            header: "Product Code",
            headerClassName: "",
            className: " ",
            cell: ({ row }) => (
                <span className="font-medium text-nav-highlight">
                    {getProductDisplayCode(row.original)}
                </span>
            ),
            size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
        },
        {
            accessorKey: "name",
            header: "Product Name",
            headerClassName: "",
            className: " ",
            cell: ({ row }) => (
                <span className="font-semibold">
                    {getProductDisplayName(row.original)}
                </span>
            ),
            size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
        },
        {
            accessorKey: "segment",
            header: "Product Segment",
            headerClassName: "",
            className: " ",
            cell: ({ getValue }) => (
                <span className="font-medium rounded-full bg-primary-shade-2 px-2  text-nav-highlight">
                    {getTaxonomyLabel(getValue())}
                </span>
            ),
            size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
        },
        {
            id: "status",
            header: "Status",
            headerClassName: "",
            className: " ",
            cell: ({ row }) => {
                const isCommercialized = Boolean(
                    row.original?.commercialCode || row.original?.commercializedProductCode
                );
                return (
                    <StatusBadge
                        status={isCommercialized ? "Commercialized" : "Experimental"}
                        className="items-start"
                    />
                );
            },
            size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
        },
        {
            accessorKey: "type",
            header: "Type",
            headerClassName: "",
            className: " ",
            cell: ({ getValue }) => {
                const type = getValue();
                return (
                    <span className="font-medium">
                        {typeDisplayMap[type] || type || "N/A"}
                    </span>
                );
            },
            size: getResponsiveSize({ lg: 53, xl: 71, '2xl': 80, '3xl': 100 }),
        },
        {
            accessorKey: "formattedCost",
            header: "Price",
            headerClassName: "",
            className: "  ",
            cell: ({ row }) => {
                const productCode = row.original;
                const cost = productCode.standardPrice ?? productCode.cost ?? 0;
                return (
                    <span className="font-medium">
                        ৳{cost.toLocaleString()}/kg
                    </span>
                );
            },
            size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
        },
        {
            id: "actions",
            header: "Actions",
            headerClassName: " text-center",
            className: "",
            enablePinning: true,
            cell: ({ row }) => {
                const productCode = row.original;
                const isActive = productCode.isActive;
                const canEdit = typeof onEdit === "function" && (canEditRecord ? canEditRecord(productCode) : true);
                const canArchive = typeof onArchive === "function" && (canArchiveRecord ? canArchiveRecord(productCode) : true);
                const canRestore = typeof onRestore === "function" && (canRestoreRecord ? canRestoreRecord(productCode) : true);

                return (
                    <div className="flex items-center justify-end gap-0 py-1 3xl:py-2.5">
                        {isActive ? (
                            <>
                                <button
                                    onClick={() => onViewDetails?.(productCode)}
                                    title="View Details"
                                    aria-label="View Details"
                                    className="action-button flex items-center justify-center gap-1.5 font-semibold rounded-l-md rounded-r-none text-nav-highlight hover:bg-purple-200 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                                >
                                     <Eye className="action-button-icon" />
                                </button>
                                {canEdit && (
                                    <button
                                        onClick={() => onEdit?.(productCode)}
                                        title="Edit"
                                        aria-label="Edit"
                                        className="action-button flex items-center justify-center gap-1.5 font-semibold rounded-none text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                                    >
                                        <svg className="action-button-icon"  xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
                                    </button>
                                )}
                                {canArchive && (
                                    <button
                                        onClick={() => onArchive?.(productCode)}
                                        title="Archive"
                                        aria-label="Archive"
                                        className="action-button flex items-center justify-center gap-1.5  font-semibold rounded-r-md rounded-l-none text-base-color hover:text-red-600 hover:bg-red-50 bg-background border border-nav-highlight/15 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                                    >
                                        <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                                    </button>
                                )}
                            </>
                        ) : (!isActive && canRestore ? (
                            <button
                                onClick={() => onRestore?.(productCode)}
                                title="Restore"
                                aria-label="Restore"
                                className="action-button flex items-center justify-center gap-1.5 font-semibold rounded-md text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                            >
                                <AiFillThunderbolt className="action-button-icon" />
                            </button>
                        ) : null)}
                    </div>
                );
            },
            size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0">
            <PaginatedTable
                data={productCodes}
                columns={columns}
                enableSelection={canArchive}
                selectedRowIds={selectedProductIds}
                onSelectionChange={onSelectChange}
                canSelectRow={canArchiveRecord}
                onBulkArchiveClick={onBulkArchiveClick}
                className={`scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0`}
                rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
                enableSorting={true}
                enableColumnResizing={true}
                enablePinning={true}
                enableHiding={true}
                sorting={sorting}
                onSortingChange={onSortingChange}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={onColumnVisibilityChange}
                columnPinning={columnPinning && (columnPinning.left || columnPinning.right) ? columnPinning : { left: ["serial"], right: ["actions"] }}
                onColumnPinningChange={onColumnPinningChange}
                columnSizing={columnSizing}
                onColumnSizingChange={onColumnSizingChange}
                bodyRowClassName="border-0"
                bodyCellClassName="first:pl-6 last:pr-6 py-0.5"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={onItemsPerPageChange}
                noDataMessage={noDataMessage}
                noDataDescription={noDataDescription}
                emptyState={emptyState}
            />
        </div>
    );
}


