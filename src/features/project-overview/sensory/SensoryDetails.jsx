import React from "react";
import { Bug, Grip } from "lucide-react";
import { DetailsHeader } from "./components/Details/DetailsHeader";
import { DetailsFieldGroups } from "./components/Details/DetailsFieldGroups";
import { DetailsSkeleton } from "./components/Details/DetailsSkeleton";
import { DebugPanel } from "./components/Details/DebugPanel";
import { FieldSearchBar } from "@/components/common/FieldSearchBar";
import { useFieldSearchIntegration } from "@/components/common/withFieldSearch";
import { useSensoryDetailsLogic } from "./hooks/useSensoryDetailsLogic";
import { projectFieldGroups } from "./constants/projectFieldGroups";
import ProjectActivitySidebar from "../project-activity-sidebar/ProjectActivitySidebar";

export default function SensoryDetails() {
    const {
        projectId,
        projectResponseData,
        isLoading,
        queryError,
        permissionsLoading,
        user,
        permissions,
        allowedReadSections,
        allowedUpdateSections,
        selectedFieldsForHistory,
        setSelectedFieldsForHistory,
        showDebugPanel,
        setShowDebugPanel,
        updatingFields,
        sidebarExpanded,
        handleBack,
        handleToggleSidebar,
        handleSave,
        fieldPermissionChecks,
        getUserDisplayName,
        permissionWarnings,
        canReadField,
        canUpdateField,
    } = useSensoryDetailsLogic();

    // Field search and navigation using the integrated hook
    const {
        query,
        results,
        isOpen,
        selectedIndex,
        handleQueryChange,
        clearSearch,
        moveSelection,
        setSelectedIndex,
        setIsOpen,
        registerField,
        jumpToField,
        handleSelectSearchResult,
    } = useFieldSearchIntegration(projectFieldGroups, {
        searchOptions: {
            debounceMs: 200,
            maxResults: 10,
        },
        jumpOptions: {
            highlightDuration: 2000,
            scrollBehavior: 'smooth',
        },
    });

    if (isLoading || permissionsLoading) {
        return (
            <DetailsSkeleton
                showDebugPanel={showDebugPanel}
                setShowDebugPanel={setShowDebugPanel}
                projectFieldGroups={projectFieldGroups}
            />
        );
    }

    if (queryError || !projectResponseData) {
        return (
            <div className=" flex flex-col items-center justify-center px-4 pb-20 mx-auto min-h-[60vh]">
                <div className="text-center">
                    <h2 className="mb-2 text-2xl font-bold text-red-500">Error Loading Project</h2>
                    <p className="text-gray-500">
                        {queryError?.response?.data?.error || queryError?.message || "Project not found"}
                    </p>
                    <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 mt-4 text-white rounded bg-primary"
                    >
                        Back to Projects
                    </button>
                </div>
            </div>
        );
    }

    const actionButtons = [
        {
            icon: <Grip className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />,
            onClick: handleToggleSidebar,
            label: "Toggle Sidebar",
        },
    ];

    return (
        <section className=" flex flex-col px-0 md:pb-20  page-section-spacing min-h-[calc(100vh-6rem)]">
            <DetailsHeader
                projectTitle={projectResponseData?.masterProject?.title || "Loading..."}
                handleBack={handleBack}
                handleToggleSidebar={handleToggleSidebar}
                actionButtons={actionButtons}
                searchBar={
                    <FieldSearchBar
                        query={query}
                        results={results}
                        isOpen={isOpen}
                        selectedIndex={selectedIndex}
                        onQueryChange={handleQueryChange}
                        onClear={clearSearch}
                        onMoveSelection={moveSelection}
                        onSelect={handleSelectSearchResult}
                        setSelectedIndex={setSelectedIndex}
                        setIsOpen={setIsOpen}
                    />
                }
            />

            {/* Field Search Bar - Mobile only */}
            <div className="px-6 pb-2 md:hidden">
                <FieldSearchBar
                    query={query}
                    results={results}
                    isOpen={isOpen}
                    selectedIndex={selectedIndex}
                    onQueryChange={handleQueryChange}
                    onClear={clearSearch}
                    onMoveSelection={moveSelection}
                    onSelect={handleSelectSearchResult}
                    setSelectedIndex={setSelectedIndex}
                    setIsOpen={setIsOpen}
                />
            </div>

            {/* Debug Panel Toggle Button - Floating */}
            {/* <button
                type="button"
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="fixed z-50 flex items-center gap-2 px-2 py-2 text-xs font-medium text-white transition-all rounded-full shadow-md opacity-50 group bottom-6 right-6 bg-purple-600/50 hover:bg-purple-600/80 backdrop-blur-sm hover:opacity-100"
                title={showDebugPanel ? "Hide Debug Console" : "Show Debug Console"}
            >
                <Bug size={12} />
                <span className="overflow-hidden transition-all duration-200 max-w-0 whitespace-nowrap group-hover:max-w-xs group-hover:ml-1">
                    {showDebugPanel ? "Hide" : "Show"} Debug
                </span>
            </button> */}

            {/* <DebugPanel
                showDebugPanel={showDebugPanel}
                setShowDebugPanel={setShowDebugPanel}
                user={user}
                permissions={permissions}
                allowedReadSections={allowedReadSections}
                allowedUpdateSections={allowedUpdateSections}
                fieldPermissionChecks={fieldPermissionChecks}
            /> */}

            <div className="flex justify-between w-full gap-6 pt-2">
                <DetailsFieldGroups
                    fieldGroups={projectFieldGroups}
                    projectResponseData={projectResponseData}
                    updatingFields={updatingFields}
                    selectedFieldsForHistory={selectedFieldsForHistory}
                    setSelectedFieldsForHistory={setSelectedFieldsForHistory}
                    handleSave={handleSave}
                    getUserDisplayName={getUserDisplayName}
                    canReadField={canReadField}
                    canUpdateField={canUpdateField}
                    permissionWarnings={permissionWarnings}
                    registerField={registerField}
                />

                {/* collapsible sticky sidebar with chat and history tab */}
                <div className="hidden lg:block lg:me-5 max-h-[90dvh] 3xl:max-h-[90dvh]">
                     <ProjectActivitySidebar
                         projectId={projectId}
                         selectedFields={selectedFieldsForHistory}
                         onClearField={() => setSelectedFieldsForHistory([])}
                         isExpanded={sidebarExpanded}
                         onToggle={handleToggleSidebar}
                         view="sensory"
                     />
                </div>
            </div>

            {/* Mobile sidebar overlay */}
            <div className="lg:hidden">
                 <ProjectActivitySidebar
                     projectId={projectId}
                         selectedFields={selectedFieldsForHistory}
                         onClearField={() => setSelectedFieldsForHistory([])}
                     isExpanded={sidebarExpanded}
                     onToggle={handleToggleSidebar}
                     view="sensory"
                 />
            </div>
        </section>
    );
}