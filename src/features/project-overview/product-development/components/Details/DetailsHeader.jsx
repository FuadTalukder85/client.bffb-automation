import React from "react";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ActionButtonsGroup } from "@/components/ui/ActionButtonsGroup";
import { Button } from "@/components/ui/Button";
import { Rocket, Loader, ChevronRight } from "lucide-react";
import { CircleArrowRight } from "lucide-react";

export const DetailsHeader = ({
    projectTitle,
    handleBack,
    handleInitiate,
    handleToggleSidebar,
    isInitiating,
    actionButtons,
    searchBar,
}) => {
    const breadcrumbItems = [
        { label: "Product Development", onClick: handleBack },
        { label: projectTitle || "Project Details" },
    ];

    return (
        <>
            {/* MOBILE HEADER: Stacked Layout + Action Buttons */}
            <div className="flex items-center justify-between py-4 ms-0 md:hidden">
                <div className="flex items-start gap-3">
                    <BackButton onClick={handleBack} className="mt-1" />
                    <div className="flex flex-col">
                        <span
                            className="text-lg font-medium cursor-pointer text-base-color hover:text-primary"
                            onClick={handleBack}
                        >
                            Product Development
                        </span>
                        <div className="flex items-center text-xl font-bold text-nav-highlight -ms-1">
                            <ChevronRight size={20} />
                            <span className="truncate max-w-[130px]">
                                {projectTitle || "Project Details"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <ActionButtonsGroup actions={actionButtons} />
                </div>
            </div>

            {/* DESKTOP HEADER: Original Layout */}
            <div className="items-center justify-between hidden ms-0 lg:ms-5 md:flex ">
                <div className="flex items-center gap-3 py-4 md:p-0 md:m-0">
                    <BackButton onClick={handleBack} />
                    <Breadcrumb items={breadcrumbItems} />
                </div>

                {searchBar && <div className="hidden md:block min-w-[200px] lg:min-w-[204px] xl:min-w-[273px] 2xl:min-w-xs 3xl:min-w-sm">{searchBar}</div>}

                <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
                    {/* Desktop Action Buttons */}
                    <div className="justify-end hidden w-full gap-2 md:flex ">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="hidden gap-2 lg:p-0.5 xl:p-1 2xl:p-1.5 3xl:p-2 border cursor-pointer md:inline-flex rounded-4xl hover:bg-primary-shade-2 hover:text-primary border-primary lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-md"
                            onClick={handleInitiate}
                            disabled={isInitiating}
                        >
                            {isInitiating ? (
                                <>
                                    <Loader className="animate-spin desktop-page-btn m-0!" /> Initiating Project
                                </>
                            ) : (
                                <>
                                    <CircleArrowRight className="desktop-page-btn m-0!" /> Next Stage
                                </>
                            )}
                        </Button>
                    </div>

                    <div>
                        <ThemeToggle />
                    </div>
                </div>
            </div>


        </>
    );
};