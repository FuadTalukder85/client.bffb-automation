import React from "react";
import { Eye } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import RawMaterialTypeBadge from "./RawMaterialTypeBadge";
import { useMobileSelection } from "@/hooks/useMobileSelection";

export default function MobileRawMaterialCard({
  item,
  serialNumber,
  onEdit,
  onArchive,
  onRestore,
  isArchived = false,
  selectedRowIds = [],
  onSelectChange,
  canArchive = false,
  className,
}) {
  const canSelect = canArchive && !isArchived;

  const { isSelected, isSelectionMode, pressHandlers } = useMobileSelection({
    itemId: item._id || item.id,
    selectedIds: selectedRowIds,
    onSelectChange,
    canSelect,
  });

  const renderActionButtons = () => {
    if (isArchived) {
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRestore?.(item)}
          className="w-10 border rounded-md text-nav-highlight h-9 border-primary-shade-2 bg-primary-shade-2 hover:bg-primary-shade-2/80"
          title="Restore Raw Material"
        >
          <AiFillThunderbolt className="w-5 h-5" />
        </Button>
      );
    }

    const editButton = {
      key: "edit",
      icon: (props) => (
        <svg {...props} className={cn("action-button-icon", props.className)} xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
      ),
      onClick: () => onEdit?.(item),
      title: "Edit",
      className:
        "rounded-r-none flex-1 text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2",
      iconSize: "w-5 h-5",
    };

    const deleteButton = {
      key: "delete",
      icon: (props) => (
        <svg {...props} className={cn("action-button-icon", props.className)} xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
      ),
      onClick: () => onArchive?.(item),
      title: "Archive",
      className:
        "rounded-l-none flex-1 text-base-color hover:bg-gray-50 bg-background border border-nav-highlight/15 border-l-table-stroke",
      iconSize: "w-5 h-5",
    };

    return <ButtonGroup buttons={[editButton, deleteButton]} gap="gap-0" fullWidth />;
  };

  return (
    <div
      {...pressHandlers}
      className={cn(
        "relative w-full md:hidden my-4 select-none cursor-pointer rounded-xl transition-all duration-200",
        isSelected ? "scale-[0.99] shadow-lg" : ""
      )}
    >
      {isSelected && (
        <div className="absolute inset-0 rounded-xl pointer-events-none border border-primary bg-primary/[0.06] z-10 animate-in fade-in duration-200" />
      )}
      <ExpandableCard
        className={cn("p-3 rounded-xl bg-background w-full", className)}
      >
        <ExpandableCard.Content initialHeight={140}>
          <div className="flex items-center gap-3 mb-3">
            {isSelectionMode ? (
              <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary-shade-2 text-nav-highlight">
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary-shade-2 text-nav-highlight">
                <span className="text-sm font-semibold">{serialNumber}</span>
              </div>
            )}

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-nav-highlight line-clamp-1">
                {item.name || "—"}
              </h3>
            </div>
          </div>

          <InfoTable>
            <InfoTable.Row label="Raw Material Name">
              <div className="font-semibold text-right text-nav-highlight">
                {item.name || "—"}
              </div>
            </InfoTable.Row>

            <InfoTable.Row label="Type">
              <div className="flex justify-end">
                  <RawMaterialTypeBadge type={item.type} />
              </div>
            </InfoTable.Row>

            <InfoTable.Row label="Cost (৳/kg)">
              <div className="font-semibold text-right text-nav-highlight">
                {item.cost || "—"}
              </div>
            </InfoTable.Row>

            {isArchived && (
              <InfoTable.Row label="Status">
                <div className="font-semibold text-right text-muted-foreground">
                  <span className="italic text-xs px-2 py-0.5 bg-gray-100 rounded-full">Archived</span>
                </div>
              </InfoTable.Row>
            )}
          </InfoTable>
        </ExpandableCard.Content>

        {!isSelectionMode && (
          <ExpandableCard.Footer className="pt-2">
            <ExpandableCard.FooterLeft>
              {renderActionButtons()}
            </ExpandableCard.FooterLeft>
            <ExpandableCard.FooterRight>
              <ExpandableCard.ToggleButton />
            </ExpandableCard.FooterRight>
          </ExpandableCard.Footer>
        )}
      </ExpandableCard>
    </div>
  );
}


