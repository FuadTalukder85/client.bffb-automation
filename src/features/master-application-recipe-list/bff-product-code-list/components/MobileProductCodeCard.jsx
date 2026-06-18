import React from "react";
import { Trash2, Pencil, Eye } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import StatusBadge from "@/components/ui/StatusBadge";

// Segment display mapping
const segmentDisplayMap = {
    flavours: "Flavours",
    colours: "Colours",
    ingredients: "Ingredients",
    seasonings: "Seasonings",
};

// Type display mapping
const typeDisplayMap = {
    solid: "Solid",
    liquid: "Liquid",
};

export default function MobileProductCodeCard({
    productCode,
    serialNumber,
    onEdit,
    onArchive,
    onRestore,
    onViewDetails,
    selectedProductIds = [],
    onSelectChange,
    canArchive = false,
    canArchiveRecord,
    className,
}) {
    const isActive = productCode.isActive;
    const cost = productCode.cost || 0;
    const displayCode =
        productCode.commercializedProductCode || productCode.displayProductCode || productCode.productCode;

    const timerRef = React.useRef(null);
    const isLongPressRef = React.useRef(false);
    const isCancelledRef = React.useRef(false);
    const lastTouchTimeRef = React.useRef(0);
    const hasToggledRef = React.useRef(false);
    const isSelected = selectedProductIds.includes(productCode._id);
    const isSelectionMode = selectedProductIds.length > 0;
    const isArchivable = isActive && (canArchiveRecord ? canArchiveRecord(productCode) : true);
    const canSelect = canArchive && isArchivable;

    const toggleSelect = () => {
        onSelectChange?.(prev =>
            isSelected
                ? prev.filter(id => id !== productCode._id)
                : [...prev, productCode._id]
        );
    };

    const handlePressStart = (e) => {
        if (!canSelect) return;

        // Ignore mousedown if it was recently preceded by touchstart
        if (e.type === 'mousedown' && Date.now() - lastTouchTimeRef.current < 1000) {
            return;
        }
        if (e.type === 'touchstart') {
            lastTouchTimeRef.current = Date.now();
        }

        isLongPressRef.current = false;
        isCancelledRef.current = false;
        hasToggledRef.current = false;
        if (timerRef.current) clearTimeout(timerRef.current);

        if (isSelectionMode) {
            // Select instantly on press start when selection mode is active
            hasToggledRef.current = true;
            toggleSelect();
        } else {
            // Start long press timer for first selection
            timerRef.current = setTimeout(() => {
                isLongPressRef.current = true;
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
                toggleSelect();
            }, 600); // 600ms long press threshold
        }
    };

    const handlePressEnd = (e) => {
        // Ignore mouseup if it was recently preceded by touchend
        if (e.type === 'mouseup' && Date.now() - lastTouchTimeRef.current < 1000) {
            return;
        }
        if (e.type === 'touchend') {
            lastTouchTimeRef.current = Date.now();
        }

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (isCancelledRef.current) {
            isCancelledRef.current = false;
            isLongPressRef.current = false;
            hasToggledRef.current = false;
            return;
        }

        if (isLongPressRef.current) {
            isLongPressRef.current = false;
            return;
        }

        if (hasToggledRef.current) {
            hasToggledRef.current = false;
            return;
        }

        if (isSelectionMode) {
            toggleSelect();
        }
    };

    const handlePressCancel = (e) => {
        if (e.type === 'touchmove') {
            lastTouchTimeRef.current = Date.now();
        }
        isCancelledRef.current = true;
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    // Define button configurations for active product codes
    const activeProductCodeButtons = [
        {
            key: "viewDetails",
            icon: (props) => <Eye {...props} className={cn("action-button-icon", props.className)} />,
            onClick: () => onViewDetails?.(productCode),
            title: "Details",
            className:
                "rounded-r-none flex-1 text-[#552e8e] dark:text-white bg-background border border-primary-shade-2",
        },
        ...(typeof onEdit === "function"
            ? [
                {
                    key: "edit",
                    icon: (props) => <svg {...props} className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd" /></svg>,
                    onClick: () => onEdit?.(productCode),
                    title: "Edit",
                    className:
                        "rounded-none flex-1 dark:text-nav-highlight text-lighter-text hover:bg-primary/10 bg-primary-shade-2",
                },
            ]
            : []),
        ...(typeof onArchive === "function"
            ? [
                {
                    key: "archive",
                    icon: (props) => <svg {...props} className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z" /></svg>,
                    onClick: () => onArchive?.(productCode),
                    title: "Delete",
                    className:
                        "rounded-l-none flex-1 text-[#552e8e] dark:text-white bg-background border border-primary-shade-2",
                },
            ]
            : []),
    ];

    return (
        <div
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            onTouchMove={handlePressCancel}
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressCancel}
            className={cn(
                "relative flex md:hidden w-full flex-col rounded-xl bg-background border border-table-stroke transition-all duration-200 mb-4 select-none cursor-pointer",
                isSelected ? "border-primary bg-primary/[0.04] shadow-lg scale-[0.99]" : "hover:border-primary/50",
                className
            )}
        >
            {/* Overlay to focus on selected card */}
            {isSelected && (
                <div className="absolute inset-0 rounded-xl pointer-events-none border-primary bg-primary/[0.06] z-10 animate-in fade-in duration-200" />
            )}
            {/* Header - Serial Number and Product Code */}
            <div className="flex items-center justify-between p-4 pb-2">
                {/* Left side - Serial */}
                <div className="flex items-center gap-3">
                    {isSelectionMode ? (
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-shade-2 text-nav-highlight shrink-0">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-shade-2 text-nav-highlight shrink-0">
                            <span className="text-sm font-semibold">{serialNumber}</span>
                        </div>
                    )}
                </div>

                {/* Right side - Product Code */}
                <span
                    className="text-sm font-semibold text-foreground"
                    title={displayCode}
                >
                    {displayCode?.length > 25 ? `${displayCode.slice(0, 25)}...` : displayCode}
                </span>
            </div>

            {/* Product Name, Status and Segment */}
            <div className="px-4 py-2 space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <span
                        className="text-base font-semibold text-foreground"
                        title={productCode.name}
                    >
                        {productCode.name?.length > 20 ? `${productCode.name.slice(0, 20)}...` : productCode.name}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary-shade-2 text-nav-highlight">
                        {segmentDisplayMap[productCode.segment] || productCode.segment}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <StatusBadge
                        status={productCode.commercializedProductCode ? "Commercialized" : "Experimental"}
                        className="px-3! py-1!"
                    />
                </div>
            </div>

            {/* Type and Cost */}
            <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm text-muted-foreground">
                    {typeDisplayMap[productCode.type] || productCode.type}
                </span>
                <span className="text-sm font-semibold text-nav-highlight">
                    ৳{cost.toLocaleString()}/kg
                </span>
            </div>

            {/* Footer with action buttons - for active product codes */}
            {!isSelectionMode && (
                <>
                    {isActive && <div className="h-[0.1px] bg-table-stroke mx-4 mb-2 mt-1"></div>}
                    {isActive ? (
                        <ButtonGroup
                            buttons={activeProductCodeButtons}
                            className="px-4 pt-2 pb-4 w-30"
                            fullWidth
                            gap="gap-0"
                        />
                    ) : (typeof onRestore === "function" ? (
                        /* Restore button for archived items */
                        <div className="px-4 pb-4">
                            <Button
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRestore?.(productCode);
                                }}
                                className="w-full border rounded-md text-nav-highlight h-9 border-primary-shade-2 bg-primary-shade-2 hover:bg-primary-shade-2/80"
                                title="Restore Product Code"
                            >
                                <AiFillThunderbolt className="action-button-icon mr-2" />
                                Restore
                            </Button>
                        </div>
                    ) : null)}
                </>
            )}
        </div>
    );
}


