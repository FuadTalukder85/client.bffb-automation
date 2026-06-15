export const ACTION_TASKS_MAP = {
  send_to_product_development: [
    {
      title: "Develop Product",
      responsibility: "Product Development",
      module: "project-overview",
      subModule: "product-development",
    },
  ],
  send_to_application_lab: [
    {
      title: "Create Recipe",
      responsibility: "Application Recipe",
      module: "application-lab",
      subModule: "manage-recipe",
    },
    {
      title: "Set Next Production Date",
      responsibility: "Manage Project Schedule",
      module: "project-overview",
      subModule: "master-project-schedule",
    },
  ],
};

export const SENSORY_ACTION_TASKS = {
  Approved: [
    {
      title: "Sensory Form",
      responsibility: "Sensory Form",
      module: "sensory",
      subModule: "sensory-form",
    },
    {
      title: "Sensory Topsheet",
      responsibility: "Sensory Topsheet",
      module: "sensory",
      subModule: "sensory-top-sheet",
    },
  ],
  Rework: {
    "Application Recipe": [
      {
        title: "Rework Recipe",
        responsibility: "Application Recipe",
        module: "application-lab",
        subModule: "manage-recipe",
      },
      {
        title: "Set Next Production Date",
        responsibility: "Manage Project Schedule",
        module: "project-overview",
        subModule: "master-project-schedule",
      },
    ],
    "Sample Preparation": [
      {
        title: "Rework Sample",
        responsibility: "Prepare Samples",
        module: "application-lab",
        subModule: "sample-preparation",
      },
      {
        title: "Set Daily Production Schedule",
        responsibility: "Daily Production Schedule",
        module: "application-lab",
        subModule: "production-schedule",
      },
      {
        title: "Set Next Production Date",
        responsibility: "Manage Project Schedule",
        module: "project-overview",
        subModule: "master-project-schedule",
      },
    ],
  },
};

export function getSensoryAutomationTasks(sensoryApproval, reworkTask) {
  if (sensoryApproval === "Approved") {
    return SENSORY_ACTION_TASKS.Approved;
  }
  if (sensoryApproval === "Rework") {
    return SENSORY_ACTION_TASKS.Rework[reworkTask] || SENSORY_ACTION_TASKS.Rework["Sample Preparation"];
  }
  return [];
}
