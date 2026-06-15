import React from "react";
import { Eye, AlertCircle } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { getStatusColor } from "@/constants/statusColors";
import { NoData } from "@/components/ui/NoData";

const StatusBadge = ({ label, days }) => {
  if (!label) return <span className="text-[10px] font-medium text-muted-foreground">—</span>;

  const style = getStatusColor(label || "");

  return (
    <div className="flex flex-col items-end justify-center gap-0.5">
      <span
        className="rounded-full font-bold inline-flex items-center justify-center transition-all duration-200 px-2 py-0.5 text-[9px] uppercase tracking-tight"
        style={style}
      >
        {label}
      </span>
      {days !== null && days !== undefined && (
        <span className="text-[9px] text-muted-foreground whitespace-nowrap font-medium">
          {days === 0 ? "today" : `${days} days`}
        </span>
      )}
    </div>
  );
};

export default function MobileProjectListView({
  data,
  currentPage,
  itemsPerPage,
  totalPages,
  setCurrentPage,
  onView,
  noDataMessage,
  noDataDescription,
}) {
  return (
    <div className="flex flex-col flex-1 w-full min-h-0 md:hidden">
      {data.length > 0 ? (
        <div className="flex flex-col flex-1 w-full min-h-0 py-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            {data.map((project, index) => {
              const actionButton = {
                key: "view",
                icon: (props) => (
                  <Eye
                    {...props}
                    className={cn("action-button-icon", props.className)}
                  />
                ),
                onClick: () => onView?.(project),
                title: "View Details",
                className:
                  "flex-1 text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2",
                iconSize: "w-5 h-5",
              };

              return (
                <ExpandableCard
                  key={project._id || project.id}
                  className="p-3 rounded-xl bg-background border border-border/50 shadow-sm"
                >
                  <ExpandableCard.Content initialHeight={130}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary/10 text-primary">
                        <span className="text-sm font-bold">
                          {(currentPage - 1) * itemsPerPage + (index + 1)}
                        </span>
                      </div>

                      <div className="flex flex-col flex-1 min-w-0 text-right">
                        <h3 className="text-sm font-bold text-primary truncate">
                          {project.projectCode || "—"}
                        </h3>
                        <p className="text-[10px] text-muted-foreground">
                          {project.raisedDate || "—"}
                        </p>
                      </div>
                    </div>

                    <InfoTable>
                      <InfoTable.Row label="Project Name">
                        <div className="font-bold text-right text-foreground truncate max-w-[180px]">
                          {project.projectName || "—"}
                        </div>
                      </InfoTable.Row>

                      <InfoTable.Row label="App Dev Status">
                        <StatusBadge
                          label={project.adStatus}
                          days={project.adDays}
                        />
                      </InfoTable.Row>

                      <InfoTable.Row label="Sensory Status">
                        <StatusBadge
                          label={project.sensoryStatus}
                          days={project.sensoryDays}
                        />
                      </InfoTable.Row>

                      <InfoTable.Row label="Purpose">
                        <div className="font-medium text-right text-muted-foreground truncate max-w-[180px]">
                          {project.purpose || "—"}{" "}
                          {project.purposeName ? `(${project.purposeName})` : ""}
                        </div>
                      </InfoTable.Row>

                      <InfoTable.Row label="Objective">
                        <div className="font-medium text-right text-muted-foreground truncate max-w-[180px]">
                          {project.objective || "—"}
                        </div>
                      </InfoTable.Row>

                      <InfoTable.Row label="Category">
                        <div className="font-medium text-right text-muted-foreground">
                          {project.category || "—"}
                        </div>
                      </InfoTable.Row>

                      <InfoTable.Row label="Subcategory">
                        <div className="font-medium text-right text-muted-foreground">
                          {project.subcategory || "—"}
                        </div>
                      </InfoTable.Row>

                      <InfoTable.Row label="Tags">
                        <div className="flex flex-wrap gap-1 justify-end">
                          {project.tags?.length > 0 ? (
                            project.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="bg-[#f0ebf8] text-[#7c5cc4] text-[9px] px-2 py-0.5 rounded-full border border-[#7c5cc4]/20 border-solid whitespace-nowrap uppercase font-bold tracking-tight"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
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
            })}
          </div>

          {/* Mobile Pagination */}
          {totalPages > 0 && (
            <div className="flex justify-center w-full mt-auto pt-6 mb-7 lg:mb-0! md:hidden">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      ) : (
        <NoData
          message={noDataMessage}
          description={noDataDescription}
        />
      )}
    </div>
  );
}
