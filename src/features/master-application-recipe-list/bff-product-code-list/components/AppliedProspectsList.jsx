import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";
import { Eye, Search, X, ChevronRight, Target } from "lucide-react";

const MAX_VISIBLE_PROSPECTS = 2;

export function AppliedProspectsList({ productCodeId, referenceProspects = [], className }) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const prospects = Array.isArray(referenceProspects) ? referenceProspects : [];

  const handleNavigateToProspect = (prospect) => {
    const prospectId = prospect.id || prospect._id;
    if (prospectId) {
      navigate(`/crm/prospects/${prospectId}`);
    }
  };

  const filteredProspects = prospects.filter(
    (prospect) =>
      prospect.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prospect.prospectCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleProspects = prospects.slice(0, MAX_VISIBLE_PROSPECTS);
  const hasMore = prospects.length > MAX_VISIBLE_PROSPECTS;

  return (
    <>
      {/* Prospects Card */}
      <div
        className={cn(
          "flex flex-col justify-between bg-[#FBFBFD] dark:bg-card/40 border border-[#ECE5F8] dark:border-border rounded-xl p-3.5 sm:p-4 min-h-[110px] transition-all",
          className
        )}
      >
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-6.5 rounded-lg bg-[#F3F0FA] dark:bg-primary/10 text-[#6B46C1] dark:text-primary">
                <Target className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs xl:text-sm font-semibold text-[#1E1B2E] dark:text-foreground">
                Prospects
              </h4>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F3F0FA] dark:bg-primary/20 text-[#6B46C1] dark:text-primary">
              {prospects.length}
            </span>
          </div>

          {/* Pill Buttons or Empty State */}
          {prospects.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {visibleProspects.map((prospect, index) => (
                <button
                  key={prospect.id || prospect._id || `prospect-${index}`}
                  type="button"
                  onClick={() => handleNavigateToProspect(prospect)}
                  title={prospect.name}
                  className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] xl:text-xs font-medium text-[#6B46C1] bg-[#F3F0FA] dark:bg-primary/10 dark:text-primary border border-[#DFD5F5] dark:border-primary/30 rounded-full hover:bg-[#E7DAF7] dark:hover:bg-primary/20 hover:border-[#B89CF5] transition-all duration-200 cursor-pointer group max-w-full"
                >
                  <span className="truncate max-w-[130px] xl:max-w-[150px]">
                    {prospect.name || prospect.prospectCode || "Prospect"}
                  </span>
                  <ChevronRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity flex-none" />
                </button>
              ))}

              {hasMore && (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] xl:text-xs font-semibold text-white bg-[#6B46C1] dark:bg-primary rounded-full hover:bg-[#5A3AAB] dark:hover:bg-primary/90 transition-all duration-200 cursor-pointer shadow-xs"
                >
                  +{prospects.length - MAX_VISIBLE_PROSPECTS} More
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic py-1">
              No prospects linked yet.
            </p>
          )}
        </div>
      </div>

      {/* All Prospects Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent
          className={cn(
            "max-w-[500px] sm:max-w-[600px] lg:max-w-[620px]! xl:max-w-[780px]! 2xl:max-w-[900px]! 3xl:max-w-[1100px]! gap-0 px-6 py-6 md:px-6 lg:px-6! xl:px-7! 2xl:px-8! 3xl:px-10! md:py-6 lg:py-5! xl:py-6! 2xl:py-7! 3xl:py-8! rounded-2xl md:rounded-lg lg:rounded-xl! xl:rounded-2xl! 2xl:rounded-2xl! 3xl:rounded-3xl!"
          )}
        >
          <button
            onClick={() => setModalOpen(false)}
            className="absolute right-4 top-4 lg:right-3 lg:top-3 xl:right-3.5 xl:top-3.5 2xl:right-4 2xl:top-4 3xl:right-5 3xl:top-5 flex items-center justify-center size-8 lg:size-5 xl:size-7 2xl:size-8 3xl:size-10 rounded-full border border-border dark:border-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 text-nav-highlight" />
          </button>

          <div className="md:mt-6 md:mx-4">
            <ModalHeader className="pb-2">
              <ModalTitle className="text-xl lg:text-sm! xl:text-base! 2xl:text-lg! 3xl:text-2xl! font-semibold text-left">
                Linked Prospects
              </ModalTitle>
              <ModalDescription className="sr-only">
                All prospects using this product code
              </ModalDescription>
            </ModalHeader>

            <p className="text-xs lg:text-[7.5px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-lighter-text mb-3 lg:mb-2 xl:mb-2.5 2xl:mb-3 3xl:mb-4">
              Showing all {prospects.length} prospect(s) linked to this product code
            </p>

            <div className="flex items-center justify-end mb-3 lg:mb-2 xl:mb-2.5 2xl:mb-3 3xl:mb-4">
              <div className="relative w-40 lg:w-28 xl:w-32 2xl:w-36 3xl:w-44">
                <input
                  type="text"
                  placeholder="Search.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full font-medium text-foreground placeholder:text-lighter-text h-8 lg:h-5 xl:h-6 2xl:h-7 3xl:h-8 rounded-md lg:rounded-xs xl:rounded-sm 2xl:rounded-md 3xl:rounded-md border border-table-stroke px-2.5 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-xs 3xl:text-sm focus-visible:outline-none pr-7 lg:pr-5 xl:pr-6 2xl:pr-6 3xl:pr-7 bg-transparent"
                />
                <Search className="absolute w-3.5 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-3.5 h-3.5 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-3.5 -translate-y-1/2 pointer-events-none right-2.5 lg:right-1.5 xl:right-2 2xl:right-2 3xl:right-2.5 top-1/2 text-nav-highlight" />
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden bg-background">
              <div className="grid grid-cols-[44px_1.5fr_1fr_64px] lg:grid-cols-[28px_1.5fr_1fr_44px] xl:grid-cols-[34px_1.5fr_1fr_52px] 2xl:grid-cols-[40px_1.5fr_1fr_58px] 3xl:grid-cols-[44px_1.5fr_1fr_64px] items-center px-4 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-2.5 lg:py-1.5 xl:py-2 2xl:py-2 3xl:py-3.5 bg-[#F9F8FD] dark:bg-primary/10">
                <span></span>
                <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-base font-semibold text-foreground">
                  Prospect Name
                </span>
                <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-base font-semibold text-foreground">
                  Prospect Code
                </span>
                <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-base font-semibold text-foreground text-center">
                  Action
                </span>
              </div>

              <div className="max-h-[280px] lg:max-h-[160px] xl:max-h-[200px] 2xl:max-h-[240px] 3xl:max-h-[320px] overflow-y-auto custom-scrollbar">
                {filteredProspects.length > 0 ? (
                  filteredProspects.map((prospect, index) => (
                    <div
                      key={prospect.id || prospect._id || `prospect-row-${index}`}
                      className="grid grid-cols-[44px_1.5fr_1fr_64px] lg:grid-cols-[28px_1.5fr_1fr_44px] xl:grid-cols-[34px_1.5fr_1fr_52px] 2xl:grid-cols-[40px_1.5fr_1fr_58px] 3xl:grid-cols-[44px_1.5fr_1fr_64px] items-center px-4 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3.5 hover:bg-[#F9F8FD]/50 dark:hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex items-center justify-center size-6 lg:size-3.5 xl:size-4.5 2xl:size-5 3xl:size-7 bg-[#F3F0FA] dark:bg-primary/10 dark:border dark:border-primary rounded-full">
                        <span className="leading-0 text-[10px] lg:text-[6px] xl:text-[8px] 2xl:text-[9px] 3xl:text-[11px] font-medium text-nav-highlight">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-base font-medium text-foreground">
                        {prospect.name || "—"}
                      </span>
                      <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-base text-foreground">
                        {prospect.prospectCode || "—"}
                      </span>
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          className="flex items-center justify-center size-7 lg:size-4 xl:size-5 2xl:size-6 3xl:size-9 rounded-lg bg-[#F3F0FA] dark:bg-primary/25 text-nav-highlight hover:bg-primary-shade-2 transition-colors cursor-pointer"
                          title="View Prospect"
                          aria-label="View Prospect"
                          onClick={() => {
                            setModalOpen(false);
                            handleNavigateToProspect(prospect);
                          }}
                        >
                          <Eye className="w-3.5 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-4.5 h-3.5 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-4.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center py-8 lg:py-4 xl:py-5 2xl:py-6 3xl:py-8">
                    <p className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground">
                      {searchQuery
                        ? "No prospects match your search."
                        : "No prospects linked to this product."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
