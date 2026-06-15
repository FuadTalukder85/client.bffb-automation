import {
    ActiveClientProjectsIcon,
    ActivePromotionalProjectsIcon,
    ClientProjectsInPDIcon,
    PromotionalProjectsInPDIcon,
    ProjectsNotStartedIcon,
    ProjectsNotSelectedIcon,
    ProjectsInProgressIcon,
    ProjectPausedIcon,
    TotalSensoryApprovalIcon,
    TotalBDApprovalIcon,
    WaitingForPromotionIcon,
    AvgDevTimeIcon,
    TotalProductionIcon,
    TotalSensoryTastedIcon,
    TotalProductApprovalsIcon,
    TotalProjectsInReworkIcon,
    SamplesForClientsIcon,
    ApprovedCommercialIcon,
} from "./icons";

const roundDashboardValue = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return 0;
    }
    return Math.round(numericValue);
};

export function getManagementReportCards(metrics) {
    const safeMetrics = metrics ?? {};

    return [
        {
            title: "Active Client Projects",
            value: roundDashboardValue(safeMetrics.activeClientProjects),
            description: "Status NOT IN: Not Started, Paused, Lost, Adopted",
            icon: ActiveClientProjectsIcon,
            colorClass: "bg-blue-100 text-blue-600",
        },
        {
            title: "Active Promotional Projects",
            value: roundDashboardValue(safeMetrics.activePromotionalProjects),
            description: "Purpose: Campaign\nStatus NOT IN: Not Started, Paused, Lost, Adopted",
            icon: ActivePromotionalProjectsIcon,
            colorClass: "bg-amber-100 text-amber-600",
        },
        {
            title: "Client Projects in PD",
            value: roundDashboardValue(safeMetrics.clientProjectsInPD),
            description: "Status NOT IN: Not Started, Completed, Paused, Lost, Adopted, Approved",
            icon: ClientProjectsInPDIcon,
            colorClass: "bg-indigo-100 text-indigo-600",
        },
        {
            title: "Promotional Projects in PD",
            value: roundDashboardValue(safeMetrics.promotionalProjectsInPD),
            description: "Status: Adopted",
            icon: PromotionalProjectsInPDIcon,
            colorClass: "bg-emerald-100 text-emerald-600",
        },
        {
            title: "Projects Not Started",
            value: roundDashboardValue(safeMetrics.projectsNotStarted),
            description: "Count of total samples produced across all projects (within selected date range)",
            icon: ProjectsNotStartedIcon,
            colorClass: "bg-slate-100 text-slate-600",
        },
        {
            title: "Projects Not Selected",
            value: roundDashboardValue(safeMetrics.projectsNotSelected),
            description: "Count of sensory top sheets submitted across all projects (within selected date range)",
            icon: ProjectsNotSelectedIcon,
            colorClass: "bg-teal-100 text-teal-600",
        },
        {
            title: "Projects in Progress",
            value: roundDashboardValue(safeMetrics.projectsInProgress),
            description: "Selected for Promotion: Yes",
            icon: ProjectsInProgressIcon,
            colorClass: "bg-violet-100 text-violet-600",
        },
        {
            title: "Project Paused",
            value: roundDashboardValue(safeMetrics.projectPaused),
            description: "Count of projects where status is Approved",
            icon: ProjectPausedIcon,
            colorClass: "bg-emerald-100 text-emerald-600",
        },
        {
            title: "(Total) Sensory Approval",
            value: roundDashboardValue(safeMetrics.totalSensoryApproval),
            description: "From masterProject.startDate to masterProject.endDate or now",
            icon: TotalSensoryApprovalIcon,
            colorClass: "bg-cyan-100 text-cyan-600",
        },
        {
            title: "Total BD Approval",
            value: roundDashboardValue(safeMetrics.totalBdApproval),
            description: "Count of projects where status NOT IN: Not Started, Completed, Paused, Lost, Adopted, Approved",
            icon: TotalBDApprovalIcon,
            colorClass: "bg-indigo-100 text-indigo-600",
        },
        {
            title: "Waiting for Promotion",
            value: roundDashboardValue(safeMetrics.waitingForPromotion),
            description: "Purpose: Client, Sent to PD\nNOT: Sent to AL/Sensory/Schedule",
            icon: WaitingForPromotionIcon,
            colorClass: "bg-purple-100 text-purple-600",
        },
        {
            title: "Approved Commercial",
            value: roundDashboardValue(safeMetrics.approvedCommercial),
            description: "Dispatch Type: Client",
            icon: ApprovedCommercialIcon,
            colorClass: "bg-cyan-100 text-cyan-600",
        },
    ];
}

export function getApplicationLabDashboardCards(metrics) {
    const safeMetrics = metrics ?? {};

    return [
        {
            title: "Avg. Dev Time",
            value: roundDashboardValue(safeMetrics.avgDevTime),
            description: "Purpose: Campaign, Sent to PD\nNOT: Sent to AL/Sensory/Schedule",
            icon: AvgDevTimeIcon,
            colorClass: "bg-pink-100 text-pink-600",
        },
        {
            title: "Total Production",
            value: roundDashboardValue(safeMetrics.totalProduction),
            description: "Sensory Approval Date exists",
            icon: TotalProductionIcon,
            colorClass: "bg-teal-100 text-teal-600",
        },
        {
            title: "(Total) Sensory Tasted",
            value: roundDashboardValue(safeMetrics.totalSensoryTasted),
            description: "BD Approval Date exists",
            icon: TotalSensoryTastedIcon,
            colorClass: "bg-green-100 text-green-600",
        },
        {
            title: "(Total) Product Adopted",
            value: roundDashboardValue(safeMetrics.totalProductApprovals),
            description: "Status: Not Started",
            icon: TotalProductApprovalsIcon,
            colorClass: "bg-slate-100 text-slate-600",
        },
        {
            title: "(Total) Number of Projects in Rework",
            value: roundDashboardValue(safeMetrics.totalNumberOfProjectsInRework),
            description: "Status: Paused",
            icon: TotalProjectsInReworkIcon,
            colorClass: "bg-orange-100 text-orange-600",
        },
        {
            title: "Samples for Clients ",
            value: roundDashboardValue(safeMetrics.samplesForClients),
            description: "Status: Not Feasible",
            icon: SamplesForClientsIcon,
            colorClass: "bg-red-100 text-red-600",
        },
        {
            title: "(Total) Number of Sample Delivery",
            value: roundDashboardValue(safeMetrics.totalNumberOfSampleDelivery),
            description: "Status: Completed",
            icon: SamplesForClientsIcon,
            colorClass: "bg-green-100 text-green-600",
        },
        {
            title: "New Recipes",
            value: roundDashboardValue(safeMetrics.newRecipes),
            description: "Finalized Recipes which were made from scratch",
            icon: ClientProjectsInPDIcon,
            colorClass: "bg-blue-100 text-blue-600",
        },
        {
            title: "(Total) Productions with New Recipes",
            value: roundDashboardValue(safeMetrics.totalProductionsWithNewRecipes),
            description: "No. of samples produced across all projects with New Recipes",
            icon: TotalProductionIcon,
            colorClass: "bg-purple-100 text-purple-600",
        },
    ];
}