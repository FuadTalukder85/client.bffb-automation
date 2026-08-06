import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNavIcon } from "./BottomNavIcon";
import { Popup } from "./components/Popup";
import { PopupContent } from "./components/PopupContent";
import { Sidebar, SidebarSection, SidebarItem } from "./components/Sidebar";
import { useNavigate } from "react-router";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { hasPermission as checkPermission } from "@/lib/utils";
import { PERMISSIONS } from "@/constants/permissions";
import { getBFFProductSegmentNavItems as getBFFProductTaxonomyNavItems } from "@/constants/bffProductSegment";

export function BottomNavbar() {
  const navigate = useNavigate();
  const { permissions } = useUserPermissions();
  
  const hasPermission = useCallback(
    (perm) => checkPermission(permissions, perm),
    [permissions]
  );

  // Compute permitted popup/sidebar contents dynamically
  const permittedPopupContents = useMemo(() => {
    const contents = {};

    // 1. Access popup
    const accessItems = [
      ...(hasPermission(PERMISSIONS.INVITATION.READ) ? [{ label: "Employee Invitations", to: "/employee-invitations" }] : []),
      ...(hasPermission(PERMISSIONS.USER.READ) ? [{ label: "Employee Management", to: "/employee-management" }] : []),
      ...(hasPermission(PERMISSIONS.ROLE.READ) ? [{ label: "Access Management", to: "/access-management" }] : []),
      ...(hasPermission(PERMISSIONS.AUDIT.READ) ? [{ label: "History", to: "/access-history" }] : []),
    ];
    if (accessItems.length > 0) {
      contents.access = {
        type: "popup",
        title: "Access Management",
        items: accessItems
      };
    }

    // 2. Task popup
    const taskItems = [
      ...(hasPermission(PERMISSIONS.PROJECT_TASK.READ) ? [{ label: "Project Tasks", to: "/project-tasks" }] : []),
      ...(hasPermission(PERMISSIONS.INTERNAL_TASK.READ) ? [{ label: "Internal Tasks", to: "/internal-tasks" }] : []),
    ];
    if (taskItems.length > 0) {
      contents.task = {
        type: "popup",
        title: "Task Assignments",
        items: taskItems
      };
    }

    // 3. Team popup
    const teamItems = [
      ...(hasPermission(PERMISSIONS.TEAM.READ) ? [{ label: "Team Formation", to: "/team-formation" }] : []),
    ];
    if (teamItems.length > 0) {
      contents.team = {
        type: "popup",
        title: "Team Management",
        items: teamItems
      };
    }

    // 4. Sample popup (Sample Dispatch)
    const sampleItems = [
      ...(hasPermission(PERMISSIONS.DISPATCH.READ) ? [{ label: "Sample Dispatch", to: "/dispatch" }] : []),
    ];
    if (sampleItems.length > 0) {
      contents.sample = {
        type: "popup",
        title: "Sample Dispatch",
        items: sampleItems
      };
    }

    // 5. More sidebar (general items, profile, dashboards, master data, etc.)
    const moreSections = [
      {
        title: "General",
        items: [
          { label: "Profile", to: "/profile" },
        ],
      },
      ...(hasPermission('dashboard:read') ? [
        {
          title: "Management Overview",
          items: [
            { label: "Main Dashboard", to: "/main-dashboard" },
            { label: "Application Lab Dashboard", to: "/application-lab-dashboard" },
          ]
        }
      ] : []),
      ...(() => {
        const items = [
          ...(hasPermission('project:read:@view-master-project') ? [{ label: "Master Projects", to: "/project-overview/master-projects" }] : []),
          ...(hasPermission('project:read:@view-product-development') ? [{ label: "Product Development", to: "/project-overview/product-development" }] : []),
          ...(hasPermission('project:read:@view-application-lab') ? [{ label: "Application Lab", to: "/project-overview/application-lab" }] : []),
          ...(hasPermission('project:read:@view-sensory-lab') ? [{ label: "Sensory Testing", to: "/project-overview/sensory" }] : []),
          ...(hasPermission('project:read:@view-master-project-schedule') ? [{ label: "Master Project Schedule", to: "/project-overview/master-project-schedule" }] : []),
        ];
        return items.length > 0 ? [{ title: "Projects Overview", items }] : [];
      })(),
      ...(() => {
        const items = [
          ...(hasPermission(PERMISSIONS.PROJECT.READ_APPLICATION_LAB) ? [
            { label: "Application Lab Records", to: "/application-lab/application-lab-records" },
            { label: "Sample Prep & Packaging", to: "/application-lab/sample-preparation-and-packaging" }
          ] : []),
          ...(hasPermission(PERMISSIONS.RECIPE.READ) ? [{ label: "Application Recipes", to: "/application-lab/application-recipes" }] : []),
          ...(hasPermission(PERMISSIONS.RAW_MATERIAL.READ) ? [{ label: "Raw Materials Price List", to: "/application-lab/raw-materials-price-list" }] : []),
          ...(hasPermission(PERMISSIONS.PRODUCTION_SCHEDULE.READ) ? [{ label: "Production Schedule", to: "/application-lab/production-schedule" }] : []),
          ...(hasPermission(PERMISSIONS.PACKAGING_TYPE.READ) ? [{ label: "Packaging Types", to: "/application-lab/packaging-types" }] : []),
        ];
        return items.length > 0 ? [{ title: "Application Lab", items }] : [];
      })(),
      ...((hasPermission(PERMISSIONS.SENSORY_FORM.READ) || hasPermission(PERMISSIONS.SENSORY_TOP_SHEET.READ)) ? [{
        title: "Sensory Testing",
        items: [
          ...(hasPermission(PERMISSIONS.SENSORY_FORM.READ) ? [{ label: "Sensory Forms", to: "/sensory-testing/sensory-forms" }] : []),
          ...(hasPermission(PERMISSIONS.SENSORY_TOP_SHEET.READ) ? [{ label: "Sensory Top-Sheet", to: "/sensory-testing/sensory-top-sheet" }] : []),
        ]
      }] : []),
      ...(hasPermission(PERMISSIONS.SHELF_LIFE_TESTING.READ) ? [{
        title: "Shelf-Life Testing",
        items: [
          { label: "Test Records", to: "/shelf-life-testing/test-records" },
          { label: "Monitoring History", to: "/shelf-life-testing/monitoring-history" },
        ]
      }] : []),
      ...(hasPermission(PERMISSIONS.CLEANING.READ) ? [{
        title: "Cleaning",
        items: [
          { label: "Cleanliness Items List", to: "/cleaning/cleanliness-items-list" },
          { label: "Cleaning Status", to: "/cleaning/cleaning-status" },
        ]
      }] : []),
      ...(hasPermission(PERMISSIONS.MAINTENANCE.READ) ? [{
        title: "Maintenance",
        items: [
          { label: "Maintenance Items List", to: "/maintenance/maintenance-items-list" },
          { label: "Maintenance Calendar", to: "/maintenance/maintenance-calendar" },
        ]
      }] : []),
      ...(() => {
        const items = [
          ...(hasPermission(PERMISSIONS.RECIPE.READ) ? [{ label: "Application Recipes", to: "/application-recipes" }] : []),
          ...(hasPermission(PERMISSIONS.CATEGORY.READ) ? [{ label: "Application Categories", to: "/application-categories" }] : []),
        ];
        return items.length > 0 ? [{ title: "Master Application Recipe List", items }] : [];
      })(),
      ...(() => {
        const items = [
          ...(hasPermission(PERMISSIONS.BFF_PRODUCT.READ)
            ? [{ label: "Product List", to: "/bff-product/list" }]
            : []),
          ...(hasPermission(PERMISSIONS.BFF_PRODUCT_SEGMENT.READ)
            ? getBFFProductTaxonomyNavItems().map(({ label, path }) => ({ label, to: path }))
            : []),
        ];
        return items.length > 0 ? [{ title: "BFF Product", items }] : [];
      })(),
    ];

    contents.more = {
      type: "sidebar",
      sections: moreSections
    };

    return contents;
  }, [hasPermission]);

  // Compute dynamic NAV_ITEMS based on permitted popup/sidebar contents
  const NAV_ITEMS = useMemo(() => {
    const items = [];
    if (permittedPopupContents.access) {
      items.push({ id: "access", label: "Access", iconName: "invite-access" });
    }
    if (permittedPopupContents.task) {
      items.push({ id: "task", label: "Task", iconName: "task-management" });
    }
    if (permittedPopupContents.team) {
      items.push({ id: "team", label: "Team", iconName: "team-management" });
    }
    if (permittedPopupContents.sample) {
      items.push({ id: "sample", label: "Sample", iconName: "sample-dispatch" });
    }
    // "More" (expanded options) is always present
    items.push({ id: "more", label: "More", iconName: "more" });
    return items;
  }, [permittedPopupContents]);

  const [activeTab, setActiveTab] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 375
  );

  // Sync activeTab with dynamic NAV_ITEMS
  useEffect(() => {
    if (NAV_ITEMS.length > 0 && (!activeTab || !NAV_ITEMS.some((item) => item.id === activeTab))) {
      setActiveTab(NAV_ITEMS[0].id);
    }
  }, [NAV_ITEMS, activeTab]);

  // Track window width for dynamic SVG sizing
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate the position of the "dip" based on the active tab index
  const activeIndex = NAV_ITEMS.findIndex((item) => item.id === activeTab);

  // Dynamic item width based on current window width
  const itemWidth = windowWidth / NAV_ITEMS.length;
  const centerPos = activeIndex !== -1 ? activeIndex * itemWidth + itemWidth / 2 : 0;

  const handleTabClick = (id) => {
    const config = permittedPopupContents[id];

    if (config?.type === "sidebar") {
      // For "More" button, toggle sidebar
      if (activeTab === id) {
        setIsSidebarOpen(!isSidebarOpen);
      } else {
        setActiveTab(id);
        setIsSidebarOpen(true);
        setIsPopupOpen(false);
      }
    } else {
      // For other buttons, toggle popup
      if (activeTab === id) {
        setIsPopupOpen(!isPopupOpen);
        setIsSidebarOpen(false);
      } else {
        setActiveTab(id);
        setIsPopupOpen(true);
        setIsSidebarOpen(false);
      }
    }
  };

  // --- SVG PATHS ---
  // Symmetric Design with "Circle Edge" look.
  const curveWidth = 118;
  const curveDepth = 32;
  const cpOffset = curveWidth / 4; // Adjusted for rounder curve

  const navbarPath = `
    M 0 0
    L ${centerPos - curveWidth / 2} 0
    C ${centerPos - curveWidth / 2 + cpOffset} 0, ${
    centerPos - cpOffset
  } ${curveDepth}, ${centerPos} ${curveDepth}
    C ${centerPos + cpOffset} ${curveDepth}, ${
    centerPos + curveWidth / 2 - cpOffset
  } 0, ${centerPos + curveWidth / 2} 0
    L ${windowWidth} 0
    L ${windowWidth} 80
    L 0 80
    Z
  `;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col justify-end pointer-events-none md:hidden">
      {/* Popup Layer */}
      <AnimatePresence>
        {isPopupOpen && permittedPopupContents[activeTab]?.type === "popup" && (
          <Popup
            isOpen={isPopupOpen}
            windowWidth={windowWidth}
            centerPos={centerPos}
            curveWidth={curveWidth}
            curveDepth={curveDepth}
            height={240}
            horizontalPadding={8}
          >
            <PopupContent
              title={permittedPopupContents[activeTab].title}
              items={permittedPopupContents[activeTab].items}
            />
          </Popup>
        )}
      </AnimatePresence>

      {/* Sidebar for "More" button */}
      <AnimatePresence>
        {isSidebarOpen && permittedPopupContents[activeTab]?.type === "sidebar" && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            windowWidth={windowWidth}
            centerPos={centerPos}
            curveWidth={curveWidth}
            curveDepth={curveDepth}
          >
            {permittedPopupContents[activeTab].sections?.map((section, index) => (
              <SidebarSection key={index} title={section.title}>
                {section.items.map((item, itemIndex) => (
                  <SidebarItem
                    key={itemIndex}
                    label={item.label}
                    icon={item.icon}
                    onClick={() => {
                      if (item.to) {
                        const targetPath = item.to.startsWith("/") ? item.to : `/${item.to}`;
                        navigate(targetPath);
                      }
                      item.onClick?.();
                      setIsSidebarOpen(false);
                    }}
                  />
                ))}
              </SidebarSection>
            ))}
          </Sidebar>
        )}
      </AnimatePresence>

      {/* Navbar Layer */}
      <div className="relative w-full h-20 bg-transparent pointer-events-auto z-50">
        {/* Navbar Background SVG */}
        <div className="absolute inset-0 w-full h-full ">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${windowWidth} 80`}
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <motion.path
              d={navbarPath}
              className="fill-background"
              animate={{ d: navbarPath }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </svg>
        </div>

        {/* Floating Action Button */}
        <motion.div
          className="absolute -top-[30px] flex items-center justify-center w-14 h-14 bg-primary rounded-full text-white shadow-lg z-50"
          style={{ left: 0 }}
          animate={{ x: centerPos - 28 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {NAV_ITEMS.map((item) => {
            return activeTab === item.id ? (
              <BottomNavIcon
                key={item.id}
                name={item.iconName}
                className="w-6 h-6"
              />
            ) : null;
          })}
        </motion.div>

        {/* Navigation Items */}
        <div className="absolute inset-0 flex items-end justify-between px-0 pb-0 h-[96%]">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex flex-col items-center justify-end w-1/5 pb-4 transition-colors duration-300 z-50 ${
                  isActive ? "text-transparent" : "text-foreground"
                }`}
                style={{ height: "80px" }}
              >
                <div
                  className={`mb-1 transition-opacity duration-200 ${
                    isActive ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <BottomNavIcon name={item.iconName} className="w-6 h-6" />
                </div>
                <span
                  className={`text-[12px] font-normal transition-all duration-200 ${
                    isActive
                      ? "text-nav-highlight translate-y-1 font-bold scale-130"
                      : "text-foreground scale-100"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
