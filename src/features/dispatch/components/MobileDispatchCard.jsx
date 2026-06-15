import React from "react";
import { Trash2, Pencil } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";
import { cn, hasPermission } from "@/lib/utils";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { PERMISSIONS } from "@/constants/permissions";
import { getStatusColor } from "@/constants/statusColors";
import { getDaysSince } from "@/lib/utils";

const StatusBadge = ({ status, days, className, style }) => {
  if (!status) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full",
          className
        )}
        style={style || getStatusColor(status)}
      >
        {status}
      </span>
      {days != null && (
        <span className="text-[8px] text-nav-highlight">
          {days} Day(s)
        </span>
      )}
    </div>
  );
};

const DataRow = ({ label, value, isStatus }) => (
  <div className="flex items-start justify-between py-1.5 border-b border-table-stroke/50 last:border-0 border-dashed">
    <span className="text-xs font-medium text-lighter-text shrink-0">{label}</span>
    {isStatus ? (
      <StatusBadge status={value} />
    ) : (
      <span className="text-xs font-semibold text-foreground text-right max-w-[65%] leading-relaxed">
        {value || "—"}
      </span>
    )}
  </div>
);

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function MobileDispatchCard({
  record,
  serialNumber,
  onEdit,
  onArchive,
  onRestore,
  className,
  permissions = [],
}) {
  const days = getDaysSince(record.requisitionDate);
  const isActive = record.isActive;

  const projectCode =
    record.recipe?.project?.masterProject?.code || record.recipe?.project?.code;
  const projectName =
    record.recipe?.project?.masterProject?.title || record.recipe?.project?.title;

  return (
    <ExpandableCard
      className={cn(
        "bg-background rounded-2xl border border-table-stroke/30 shadow-sm overflow-hidden mb-4",
        className
      )}
    >
      <ExpandableCard.Header className="flex items-center justify-between p-4 pb-3 border-b border-table-stroke/50 sticky top-0 z-10 bg-background">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-nav-highlight font-bold text-sm">
            {serialNumber}
          </div>
          <span className="text-sm font-bold text-nav-highlight">
            {projectCode || "—"}
          </span>
        </div>
        <StatusBadge
          status={record.dispatchType}
          days={days}
          style={{ backgroundColor: '#D4DEFF', color: '#1E40AF' }}
        />
      </ExpandableCard.Header>

      <div className="p-4 py-3">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-foreground line-clamp-2">
            {projectName || "—"}
          </h3>
        </div>

        <DataRow label="Recipe Code" value={record.recipe?.recipeCode} />
        <DataRow
          label="Requisition Date"
          value={formatDate(record.requisitionDate)}
        />

        <ExpandableCard.Content initialHeight={0}>
          <div className="pt-2 space-y-0.5">
            <DataRow
              label="Application Recipe Name"
              value={record.recipe?.name}
            />
            <DataRow
              label="Purpose Name"
              value={
                record.recipe?.project?.masterProject?.purposeDetails ||
                record.recipe?.project?.productDevelopment?.brief ||
                record.recipe?.project?.masterProject?.purpose
              }
            />
            <DataRow
              label="Project Status"
              value={
                <StatusBadge
                  status={
                    record.recipe?.project?.masterProject?.status ||
                    record.recipe?.project?.projectStatus
                  }
                  days={days}
                />
              }
            />
            <DataRow label="Requisition By" value={record.requisitionBy?.name} />
            <DataRow label="Send To" value={record.sendTo} />
            <DataRow
              label="Production Date"
              value={formatDate(record.productionDate)}
            />
            <DataRow label="Quantity" value={record.quantity} />
            <DataRow label="Pieces" value={record.pieces} />
            <DataRow
              label="Delivery Date"
              value={formatDate(record.deliveryDate)}
            />
            <DataRow
              label="Objective Details"
              value={
                record.recipe?.project?.masterProject?.objectiveDetails ||
                record.recipe?.project?.masterProject?.objective ||
                record.recipe?.project?.productDevelopment?.objective
              }
            />
            <DataRow label="Remark" value={record.remark} />
            <DataRow
              label="Client Feedback"
              value={record.clientFeedback}
            />
          </div>
        </ExpandableCard.Content>
      </div>

      <ExpandableCard.Footer className="p-4 pt-2 bg-muted/20 border-t border-table-stroke/50 flex items-center justify-between gap-3">
        <ExpandableCard.FooterLeft className="flex-1 flex items-center border border-table-stroke/50 rounded-[6px] overflow-hidden max-w-[100px]">
          {isActive ? (
            <>
              {hasPermission(permissions, PERMISSIONS.DISPATCH.UPDATE) && (
                <button
                  onClick={() => onEdit?.(record)}
                  className="action-button py-2 flex-1 flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors border-r border-table-stroke/50"
                  title="Edit"
                >
                  <svg
                    className="action-button-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
              {hasPermission(permissions, PERMISSIONS.DISPATCH.DELETE) && (
                <button
                  onClick={() => onArchive?.(record)}
                  className="action-button flex-1 flex items-center justify-center bg-background text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                  title="Archive"
                >
                  <svg
                    className="action-button-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </>
          ) : (
            hasPermission(permissions, PERMISSIONS.DISPATCH.UPDATE) && (
              <button
                onClick={() => onRestore?.(record)}
                className="action-button flex-1 h-9 flex items-center justify-center bg-primary-shade-2 text-nav-highlight hover:bg-purple-200 border border-primary-shade-2 transition-colors font-medium text-xs gap-2 rounded-md"
              >
                <AiFillThunderbolt className="action-button-icon w-4 h-4" />
                Restore
              </button>
            )
          )}
        </ExpandableCard.FooterLeft>
        <ExpandableCard.FooterRight>
          <ExpandableCard.ToggleButton className="h-9 rounded-[8px] border border-primary/20" />
        </ExpandableCard.FooterRight>
      </ExpandableCard.Footer>
    </ExpandableCard>
  );
}
