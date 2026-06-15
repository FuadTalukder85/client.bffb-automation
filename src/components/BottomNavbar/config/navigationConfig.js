/**
 * Navigation Configuration
 * Centralized configuration for all navigation items and their popup/sidebar content
 */

export const POPUP_CONTENTS = {
  access: {
    // title: "Access Management",
    type: "popup",
    items: [
      {
        label: "Employee Invitations",
        to: "employee-invitations",
      },
      {
        label: "Employee Management",
        to: "employee-management",
      },
      {
        label: "Access Management",
        to: "access-management",
      },
      {
        label: "History",
        to: "access-history",
      },
    ],
  },
  task: {
    type: "popup",
    items: [
      {
        label: "Project Tasks",
        to: "project-tasks",
        // onClick: () => console.log("Navigate to My Tasks"),
      },
      {
        label: "Internal Tasks",
        // onClick: () => console.log("Navigate to Assigned Tasks"),
        to: "internal-tasks",
      },
    ],
  },
  team: {
    title: "Team",
    type: "popup",
    items: [
      {
        label: "Team Formation",
        to: "team-formation",
      },
    ],
  },
  sample: {
    // title: "Sample",
    type: "popup",
    items: [
      {
        label: "Sample Item 1",
        onClick: () => console.log("Navigate to Sample 1"),
      },
      // {
      //   label: "Sample Item 2",
      //   onClick: () => console.log("Navigate to Sample 2"),
      // },
      // {
      //   label: "Sample Item 3",
      //   onClick: () => console.log("Navigate to Sample 3"),
      // },
    ],
  },
  more: {
    type: "sidebar",
    sections: [
      {
        title: "General",
        items: [
          {
            label: "Settings",
            onClick: () => console.log("Navigate to Settings"),
          },
          {
            label: "Profile",
            to: "/profile",
          },
          {
            label: "Notifications",
            onClick: () => console.log("Navigate to Notifications"),
          },
        ],
      },
      {
        title: "Support",
        items: [
          {
            label: "Help Center",
            onClick: () => console.log("Navigate to Help"),
          },
          {
            label: "Contact Us",
            onClick: () => console.log("Navigate to Contact"),
          },
          {
            label: "Privacy Policy",
            onClick: () => console.log("Navigate to Privacy"),
          },
        ],
      },
    ],
  },
};
