export const shelfLifeFieldGroups = [
    // Group 1: Recipe Info
    [
        {
            id: "recipeCode",
            label: "Recipe Code",
            type: "text",
            path: "sample.recipe?.recipeCode",
            canEdit: false,
        },
        {
            id: "recipeName",
            label: "Application Recipe Name",
            type: "text",
            path: "sample.recipe?.name",
            canEdit: false,
        },
        {
            id: "personResponsible",
            label: "Person Responsible",
            type: "text",
            path: "record.assignedTo",
            canEdit: false,
        },
    ],
    // Group 2: Dates
    [
        {
            id: "productionDate",
            label: "Production Date",
            type: "date",
            path: "sample.productionDate",
            canEdit: false,
        },
        {
            id: "testPeriodStartDate",
            label: "Test Period Start Date",
            type: "date",
            path: "record.testPeriodStartDate",
            canEdit: true,
        },
        {
            id: "testPeriodEndDate",
            label: "Test Period End Date",
            type: "date",
            path: "record.testPeriodEndDate",
            canEdit: true,
        },
    ],
];
