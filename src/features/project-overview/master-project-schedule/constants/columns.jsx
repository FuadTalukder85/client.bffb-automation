import { format } from "date-fns";

export const getColumns = (onViewDetails) => [
    {
        accessorKey: "sl",
        header: "SL",
        cell: (info) => info.row.index + 1,
    },
    {
        accessorKey: "masterProject.code",
        header: "Project Code",
    },
    {
        accessorKey: "masterProject.title",
        header: "Project Name",
    },
    {
        accessorKey: "masterProject.raisedDate",
        header: "Raised Date",
        cell: (info) => info.getValue() ? format(new Date(info.getValue()), "dd-MM-yyyy") : "-",
    },
    {
        accessorKey: "masterProject.startDate",
        header: "Project Start Date",
        cell: (info) => info.getValue() ? format(new Date(info.getValue()), "dd-MM-yyyy") : "-",
    },
    {
        accessorKey: "masterProject.endDate",
        header: "End Date",
        cell: (info) => info.getValue() ? format(new Date(info.getValue()), "dd-MM-yyyy") : "-",
    },
    {
        accessorKey: "applicationLab.nextProductionDate",
        header: "Next Production Date",
        cell: (info) => info.getValue() ? format(new Date(info.getValue()), "dd-MM-yyyy") : "-",
    },
    {
        accessorKey: "applicationLab.lastProductionDate",
        header: "Last Production Date",
        cell: (info) => info.getValue() ? format(new Date(info.getValue()), "dd-MM-yyyy") : "-",
    },
    {
        accessorKey: "sensoryLab.latestDate",
        header: "Latest Sensory Date",
        cell: (info) => info.getValue() ? format(new Date(info.getValue()), "dd-MM-yyyy") : "-",
    },
    {
        accessorKey: "sensoryLab.nextDate",
        header: "Next Sensory Date",
        cell: (info) => info.getValue() ? format(new Date(info.getValue()), "dd-MM-yyyy") : "-",
    },
    {
        accessorKey: "businessDevelopment.approvalDate",
        header: "BD Approval Date",
        cell: (info) => info.getValue() ? format(new Date(info.getValue()), "dd-MM-yyyy") : "-",
    },
    {
        accessorKey: "businessDevelopment.clientSampleDeliveryDate",
        header: "Sample Delivery Date",
        cell: (info) => info.getValue() ? format(new Date(info.getValue()), "dd-MM-yyyy") : "-",
    },
    {
        accessorKey: "productDevelopment.status",
        header: "PD Status",
    },
    {
        accessorKey: "applicationLab.developmentStatus",
        header: "AD Status",
    },
    {
        accessorKey: "sensoryLab.status",
        header: "Sensory Status",
    },
    {
        accessorKey: "businessDevelopment.status",
        header: "BD Status",
    },
    {
        accessorKey: "masterProject.status",
        header: "Project Status",
    },
    {
        id: "actions",
        header: "Action",
        cell: (info) => (
            <button
                onClick={() => onViewDetails(info.row.original)}
                className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
                View Details
            </button>
        ),
    },
];
