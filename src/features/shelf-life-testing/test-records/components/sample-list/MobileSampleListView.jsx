import React from "react";
import { Eye, AlertCircle } from "lucide-react";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";

function MobileShelfLifeSampleCard({ sample, serialNumber, onOpen }) {
  const actionButton = {
    key: "view",
    icon: (props) => (
      <Eye {...props} className={cn("action-button-icon", props.className)} />
    ),
    onClick: () => onOpen?.(sample),
    title: "View Details",
    className:
      "flex-1 text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2",
    iconSize: "w-5 h-5",
  };

  return (
    <ExpandableCard className="p-3 rounded-xl bg-background border border-border/50 shadow-sm">
      <ExpandableCard.Content initialHeight={130}>
        {/* Card Header matching Sensory Mobile View */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary/10 text-primary">
            <span className="text-sm font-bold">{serialNumber}</span>
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

        {/* Card Info Rows highlighting same fields as Sensory */}
        <InfoTable>
          <InfoTable.Row label="Recipe Code">
            <div className="font-medium text-right text-nav-highlight">
              {sample.recipeCode || "—"}
            </div>
          </InfoTable.Row>
          <InfoTable.Row label="Recipe Name">
            <div className="font-medium text-right">
              {sample.recipeName || "—"}
            </div>
          </InfoTable.Row>
          <InfoTable.Row label="Production Date">
            <div className="font-medium text-right text-nav-highlight">
              {sample.raisedDate || "—"}
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
}

export default function MobileSampleListView({
  data,
  currentPage,
  itemsPerPage,
  totalPages,
  setCurrentPage,
  onOpen,
}) {
  return (
    <div className="md:hidden">
      {data.length > 0 ? (
        <div className="flex flex-col flex-1 w-full min-h-0 py-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            {data.map((sample, index) => (
              <MobileShelfLifeSampleCard
                key={sample.id || sample._id || index}
                sample={sample}
                serialNumber={(currentPage - 1) * itemsPerPage + index + 1}
                onOpen={onOpen}
              />
            ))}
          </div>

          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 pb-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                isMobile={true}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-bold mb-1">No Samples Found</h3>
          <p className="text-sm text-muted-foreground/80 max-w-[200px] mx-auto leading-tight">
            No samples match your current filters. Try adjusting your search or
            filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}
