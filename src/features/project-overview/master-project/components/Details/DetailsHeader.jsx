import React from "react";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ActionButtonsGroup } from "@/components/ui/ActionButtonsGroup";
import { Button } from "@/components/ui/Button";
import { Upload, Rocket, Loader, ChevronRight } from "lucide-react";

export const DetailsHeader = ({
    projectTitle,
    handleBack,
    handleExport,
    handleInitiate,
    handleToggleSidebar,
    isExporting,
    isInitiating,
    actionButtons,
    searchBar,
}) => {
    const breadcrumbItems = [
        { label: "Master Projects", onClick: handleBack },
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
                            Master Projects
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
            <div className="items-center justify-between hidden ms-0 lg:ms-1! xl:ms-3 2xl:ms-4 3xl:ms-5 md:flex md:mx-3 lg:mx-1! xl:mx-4 2xl:mx-5 3xl:mx-6!">

                <div className="flex items-center gap-3 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3 py-4 md:p-0 md:m-0 ">
                    <BackButton onClick={handleBack} />
                    <Breadcrumb items={breadcrumbItems} />
                </div>

                {searchBar && <div className="hidden md:block min-w-[200px] lg:min-w-[204px] xl:min-w-[273px] 2xl:min-w-xs 3xl:min-w-sm">{searchBar}</div>}

                <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex ">

                    {/* Desktop Action Buttons */}

                    <div className="justify-end hidden w-full gap-2  md:flex ">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="hidden gap-2 lg:p-1 xl:p-1 2xl:p-1.5 3xl:p-2 border cursor-pointer md:inline-flex rounded-4xl hover:bg-primary-shade-2 hover:text-primary border-primary text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            {isExporting ? (
                                <>
                                    <Loader className="animate-spin desktop-page-btn m-0!" /> Exporting Project
                                </>
                            ) : (
                                <>
                                    <Upload className="desktop-page-btn m-0!" /> Export Project
                                </>
                            )}
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="hidden gap-2 lg:p-1 xl:p-1 2xl:p-1.5 3xl:p-2  border cursor-pointer md:inline-flex rounded-4xl hover:bg-primary-shade-2 hover:text-primary border-primary text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
                            onClick={handleInitiate}
                            disabled={isInitiating}
                        >
                            {isInitiating ? (
                                <>
                                    <Loader className="animate-spin desktop-page-btn m-0!" /> Initiating Project
                                </>
                            ) : (
                                <>
                                    <Rocket className="desktop-page-btn m-0!" /> Initiate Project
                                </>
                            )}
                        </Button>
                    </div>


                    <div className="">
                        <ThemeToggle className="" />
                    </div>

                </div>
            </div>


        </>
    );
};
