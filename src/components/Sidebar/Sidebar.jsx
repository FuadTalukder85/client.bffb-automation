import BangaLogoWhite from "@/assets/icons/BFF-Logo-White.svg?react";
import BangaLogoPurple from "@/assets/icons/BFF-Logo-Purple.svg?react";
import React, { useState, useEffect, useMemo } from "react";
import { LogOut } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { NavIcon } from "./NavIcon";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import { getBFFProductSegmentNavItems as getBFFProductTaxonomyNavItems } from "@/constants/bffProductSegment";
import { hasPermission as checkPermission } from "@/lib/utils";
import { resolveAvatarUrl } from "@/utils/avatarUrl";



export function Sidebar() {
  const { theme } = useTheme();
  const { user, logout } = useAuthStore();
  const location = useLocation(); // Hook to get current URL
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { permissions } = useUserPermissions();
  const sidebarAvatarUrl = resolveAvatarUrl(user?.avatar);
  const userId = user?.userId || user?._id || user?.id || null;

  const { data: notificationsResponse } = useQuery({
    queryKey: ["profile", "notifications", userId, 1, 1],
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
    queryFn: async () => {
      const response = await api.get("/notifications", {
        params: {
          page: 1,
          limit: 1,
        },
      });
      return response.data;
    },
  });

  const unreadNotificationCount = notificationsResponse?.data?.unreadCount ?? notificationsResponse?.unreadCount ?? 0;

  const hasPermission = React.useCallback((perm) => checkPermission(permissions, perm), [permissions]);

  const NAV_GROUPS = useMemo(() => [
    ...(hasPermission('dashboard:read') ? [
      {
        id: "management-overview",
        label: "Management Overview",
        iconName: "management-reports",
        subItems: [
          {
            id: "main-dashboard",
            label: "Main Dashboard",
            path: "/main-dashboard",
          },
          {
            id: "application-lab-dashboard",
            label: "Application Lab Dashboard",
            path: "/application-lab-dashboard",
          },
        ],
      }
    ] : []),

    ...(() => {
      const subItems = [
        ...(hasPermission('project:read:@view-master-project') ? [{ id: "master-projects", label: "Master Projects Module", path: "/project-overview/master-projects" }] : []),
        ...(hasPermission('project:read:@view-product-development') ? [{ id: "product-development", label: "Product Development", path: "/project-overview/product-development" }] : []),
        ...(hasPermission('project:read:@view-application-lab') ? [{ id: "application-lab", label: "Application Lab", path: "/project-overview/application-lab" }] : []),
        ...(hasPermission('project:read:@view-sensory-lab') ? [{ id: "sensory", label: "Sensory Testing", path: "/project-overview/sensory" }] : []),
        ...(hasPermission('project:read:@view-master-project-schedule') ? [{ id: "master-project-schedule", label: "Master Project Schedule", path: "/project-overview/master-project-schedule" }] : []),
      ];
      return subItems.length > 0 ? [{
        id: "projects-overview",
        label: "Projects Overview",
        iconName: "projects-overview",
        subItems
      }] : [];
    })(),

    ...(() => {
      const subItems = [
        ...(hasPermission(PERMISSIONS.PROJECT.READ_APPLICATION_LAB) ? [
          { id: "application-lab-records", label: "Application Lab Records", path: "/application-lab/application-lab-records" },
          { id: "sample-preparation-and-packaging", label: "Sample Preparation & Packaging", path: "/application-lab/sample-preparation-and-packaging" }
        ] : []),
        ...(hasPermission(PERMISSIONS.RECIPE.READ) ? [{ id: "application-recipes", label: "Application Recipes", path: "/application-lab/application-recipes" }] : []),
        ...(hasPermission(PERMISSIONS.RAW_MATERIAL.READ) ? [{ id: "raw-materials-price-list", label: "Raw Materials Price List", path: "/application-lab/raw-materials-price-list" }] : []),
        ...(hasPermission(PERMISSIONS.PRODUCTION_SCHEDULE.READ) ? [{ id: "production-schedule", label: "Production Schedule", path: "/application-lab/production-schedule" }] : []),
        ...(hasPermission(PERMISSIONS.PACKAGING_TYPE.READ) ? [{ id: "packaging-types", label: "Packaging Types", path: "/application-lab/packaging-types" }] : []),
      ];
      return subItems.length > 0 ? [{
        id: "application-labs",
        label: "Application Lab",
        iconName: "application-labs",
        subItems
      }] : [];
    })(),

   ...(hasPermission(PERMISSIONS.SENSORY_FORM.READ) || hasPermission(PERMISSIONS.SENSORY_TOP_SHEET.READ) ? [{
        id: "sensory-testing",
        label: "Sensory Testing",
        iconName: "sensory-testing",
        subItems: [
          ...(hasPermission(PERMISSIONS.SENSORY_FORM.READ) ? [{ id: "sensory-forms", label: "Sensory Forms", path: "/sensory-testing/sensory-forms" }] : []),
          ...(hasPermission(PERMISSIONS.SENSORY_TOP_SHEET.READ) ? [{ id: "sensory-top-sheet", label: "Sensory Top-Sheet", path: "/sensory-testing/sensory-top-sheet" }] : []),
        ]
      }] : []),

    ...(hasPermission(PERMISSIONS.SHELF_LIFE_TESTING.READ) ? [{
      id: "shelf-life-testing",
      label: "Shelf-Life Testing",
      iconName: "shelf-life-testing",
      subItems: [
        {
          id: "test-records",
          label: "Test Records",
          path: "/shelf-life-testing/test-records",
        },
        {
          id: "monitoring-history",
          label: "Monitoring History",
          path: "/shelf-life-testing/monitoring-history",
        },
      ],
    }] : []),

    ...(hasPermission(PERMISSIONS.CLEANING.READ) ? [{
      id: "cleaning",
      label: "Cleaning",
      iconName: "cleaning",
      subItems: [
        {
          id: "cleanliness-items",
          label: "Cleanliness Items List",
          path: "/cleaning/cleanliness-items-list",
        },
        {
          id: "cleaning-status",
          label: "Cleaning Status",
          path: "/cleaning/cleaning-status",
        },
      ],
    }] : []),

    ...(hasPermission(PERMISSIONS.MAINTENANCE.READ) ? [{
      id: "maintenance",
      label: "Maintenance",
      iconName: "maintenance",
      subItems: [
        {
          id: "maintenance-items",
          label: "Maintenance Items List",
          path: "/maintenance/maintenance-items-list",
        },
        {
          id: "maintenance-calendar",
          label: "Maintenance Calendar",
          path: "/maintenance/maintenance-calendar",
        },
      ],
    }] : []),

    ...(() => {
      const subItems = [
        ...(hasPermission(PERMISSIONS.RECIPE.READ) ? [{ id: "application-recipes", label: "Application Recipes", path: "/application-recipes" }] : []),
        ...(hasPermission(PERMISSIONS.CATEGORY.READ) ? [{ id: "application-categories", label: "Application Categories", path: "/application-categories" }] : []),
      ];
      return subItems.length > 0 ? [{
        id: "master-application-recipe-list",
        label: "Master Application Recipe List",
        iconName: "master-application-recipe-list",
        subItems
      }] : [];
    })(),

    ...(() => {
      const subItems = [
        ...(hasPermission(PERMISSIONS.BFF_PRODUCT.READ)
          ? [{ id: "bff-product-list", label: "Product List", path: "/bff-product/list" }]
          : []),
        ...(hasPermission(PERMISSIONS.BFF_PRODUCT_SEGMENT.READ)
          ? getBFFProductTaxonomyNavItems()
          : []),
      ];
      return subItems.length > 0
        ? [{
            id: "bff-product",
            label: "BFF Product",
            iconName: "master-application-recipe-list",
            subItems,
          }]
        : [];
    })(),

    ...(hasPermission(PERMISSIONS.DISPATCH.READ) ? [{
      id: "sample-dispatch",
      label: "Sample Dispatch",
      iconName: "sample-dispatch",
      path: "/dispatch",
      subItems: [],
    }] : []),

    ...(hasPermission(PERMISSIONS.TEAM.READ) ? [{
      id: "team",
      label: "Team Formation",
      iconName: "team-management",
      path: "/team-formation",
      subItems: [
        // {
        //   id: "team-formation",
        //   label: "Team Formation",
        //   path: "/team-formation",
        // },
      ],
    }] : []),

    ...(() => {
      const subItems = [
        ...(hasPermission(PERMISSIONS.PROJECT_TASK.READ) ? [{ id: "project-task", label: "Project Tasks", path: "/project-tasks" }] : []),
        ...(hasPermission(PERMISSIONS.INTERNAL_TASK.READ) ? [{ id: "internal-task", label: "Internal Tasks", path: "/internal-tasks" }] : []),
      ];
      return subItems.length > 0 ? [{
        id: "tasks",
        label: "Task Assignments",
        iconName: "task-management",
        subItems
      }] : [];
    })(),

    ...(() => {
      const subItems = [
        ...(hasPermission(PERMISSIONS.INVITATION.READ) ? [{ id: "emp-invites", label: "Employee Invitations", path: "/employee-invitations" }] : []),
        ...(hasPermission(PERMISSIONS.USER.READ) ? [{ id: "emp-mgmt", label: "Employee Management", path: "/employee-management" }] : []),
        ...(hasPermission(PERMISSIONS.ROLE.READ) ? [{ id: "access-mgmt", label: "Access Management", path: "/access-management" }] : []),
        // Permission Debugger menu removed per request
        ...(hasPermission(PERMISSIONS.AUDIT.READ) ? [{ id: "history", label: "History", path: "/access-history" }] : []),
      ];
      return subItems.length > 0 ? [{
        id: "invites",
        label: "Invites and Access",
        iconName: "invite-access",
        subItems
      }] : [];
    })(),
  ], [hasPermission]);

  const [activeGroup, setActiveGroup] = useState("invites");
  const [activeSubItem, setActiveSubItem] = useState("emp-invites");
  const [isExpanded, setIsExpanded] = useState(false);
  const timeoutRef = React.useRef(null);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Ignore errors, maybe token already expired
    }
    logout();
    queryClient.clear();
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 800); // 800ms delay before collapsing
  };

  // --- NEW: Sync State with URL ---
  useEffect(() => {
    const currentPath = location.pathname;

    // Loop through groups to find the matching route or path
    for (const group of NAV_GROUPS) {
      // 1. If group has a path property
      if (group.path && (currentPath === group.path || currentPath.startsWith(`${group.path}/`))) {
        setActiveGroup(group.id);
        setActiveSubItem(group.id);
        return;
      }

      // 2. Check sub-items
      const matchingSubItem = group.subItems.find(
        (subItem) =>
          currentPath === subItem.path ||
          currentPath.startsWith(`${subItem.path}/`)
      );

      if (matchingSubItem) {
        setActiveGroup(group.id);
        setActiveSubItem(matchingSubItem.id);
        return; // Match found, exit loop
      }
    }
  }, [location.pathname, NAV_GROUPS]); // Re-run whenever URL or permissions-derived nav groups change

  return (
    <nav
      className={`hidden md:flex flex-col h-full border-r shadow-lg bg-background border-table-stroke overflow-hidden transition-all duration-300 ease-in-out z-50 ${isExpanded ? "3xl:w-80 2xl:w-64 xl:w-56 lg:w-42 w-40" : "3xl:w-20 2xl:w-16 xl:w-14 lg:w-12 w-10"
        }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo */}
      <div
        className={`transition-all duration-300 border-b border-table-stroke flex items-center justify-center p-1 lg:p-2 xl:p-2.5 2xl:p-3.5 3xl:p-4 shrink-0 ${isExpanded ? "3xl:h-28 2xl:h-24 xl:h-20 lg:h-16 h-16" : "3xl:h-16 2xl:h-12 xl:h-11 lg:h-8.5 h-8"
          }`}
      >
        {theme === "dark" ? (
          <BangaLogoWhite className="w-full h-full" />
        ) : (
          <BangaLogoPurple className="w-full h-full" />
        )}
      </div>

      {/* Navigation Links */}
      <nav className="relative flex flex-col flex-1 3xl:gap-2 2xl:gap-[6px] xl:gap-[5px] lg:gap-[1px] gap-[1px] 3xl:pt-8 2xl:pt-6.5 xl:pt-5.5 lg:pt-4 pt-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {/* Group items */}
        {NAV_GROUPS.map((group) => {
          const isActive = activeGroup === group.id;
          // Only expand submenu if group is active AND sidebar is expanded
          const showSubItems =
            isActive && group.subItems.length > 0 && isExpanded;

          return (
            <div key={group.id} className="relative">
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute left-0 right-0 z-0 pointer-events-none 3xl:h-[58px] 2xl:h-[46px] xl:h-[41px] lg:h-[31px] h-[26px] top-1/2 -translate-y-1/2"
                  >
                    <div className="absolute inset-y-0 right-0 rounded-l-full left-4 bg-[#EEEBF4] dark:bg-primary-shade-2">
                        <div
                          className={`absolute -top-5 right-0 w-5 h-5 bg-transparent rounded-br-full z-10 pointer-events-none ${theme === "dark"
                            ? "shadow-[5px_5px_0_5px_#2c213d]"
                            : "shadow-[5px_5px_0_5px_#EEEBF4]"
                            }`}
                        />
                        <div
                          className={`absolute -bottom-5 right-0 w-5 h-5 bg-transparent rounded-tr-full z-10 pointer-events-none ${theme === "dark"
                            ? "shadow-[5px_-5px_0_5px_#2c213d]"
                            : "shadow-[5px_-5px_0_5px_#EEEBF4]"
                            }`}
                        />
                      </div>
                  </motion.div>
                )}
                <button
                  onClick={() => {
                  setActiveGroup(group.id);
                  if (group.path) {
                    navigate(group.path);
                    setActiveSubItem(group.id);
                  }
                }}
                className={`w-full flex items-center 3xl:gap-4 2xl:gap-3.5 xl:gap-3 lg:gap-2 gap-1 3xl:mx-8 2xl:mx-6.5 xl:mx-6 lg:mx-5.5 mx-3 3xl:py-4 2xl:py-3.2 xl:py-2.8 lg:py-2 py-1 transition-all duration-200 relative z-10 cursor-pointer ${isActive
                  ? "text-nav-highlight font-semibold"
                  : "text-gray-900 dark:text-foreground"
                  }`}
              >
                <NavIcon
                  name={group.iconName}
                  className={`3xl:w-6 2xl:w-4.5 xl:w-4.5 lg:w-3.5 w-3 3xl:h-6 2xl:h-4.5 xl:h-4.5 lg:h-3.5 h-3 transition-colors ${isActive
                    ? "text-nav-highlight"
                    : "text-gray-600 dark:text-foreground"
                    } hover:text-nav-highlight`}
                />
                <span
                  className={`3xl:text-base 2xl:text-xs xl:text-[11.5px] lg:text-[8.5px] text-[8px] font-medium tracking-tight whitespace-nowrap transition-opacity duration-200 ${isExpanded
                    ? "opacity-100 delay-100"
                    : "opacity-0 w-0 overflow-hidden"
                    }`}
                >
                  {group.label}
                </span>
              </button>
            </div>

              {/* Sub menu */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${showSubItems ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
              >
                <div
                  className={`mt-1 3xl:mb-4 2xl:mb-3.5 xl:mb-3 lg:mb-2 ml-0 space-y-1 transform transition-all duration-300 ease-in-out ${showSubItems ? "translate-y-0" : "-translate-y-2"
                    }`}
                >
                  {group.subItems.map((subItem) => {
                    const isSubActive = activeSubItem === subItem.id;
                    return (
                      <NavLink
                        to={subItem.path}
                        key={subItem.id}
                        onClick={() => setActiveSubItem(subItem.id)}
                        className={`w-full block text-left 3xl:pl-20 2xl:pl-16 xl:pl-14 lg:pl-11 pl-8 3xl:pr-4 2xl:pr-3.5 xl:pr-3 lg:pr-2 pr-1 3xl:py-2 2xl:py-1.5 xl:py-1 lg:py-0.5 py-0.5 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[7.5px] text-[6px] cursor-pointer transition-colors whitespace-nowrap ${isSubActive
                          ? "text-nav-highlight font-medium"
                          : "text-gray-600 dark:text-foreground hover:text-foreground font-normal dark:hover:text-foreground"
                          }`}
                      >
                        {subItem.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Profile at bottom */}
      <div className="3xl:p-4 2xl:p-3 xl:p-2 lg:p-2 p-1 border-t border-table-stroke">
        <div
          className={`flex items-center ${isExpanded ? "justify-between" : "justify-center"
            } 3xl:gap-3 2xl:gap-3 xl:gap-2 lg:gap-1 gap-1 3xl:transition-all 2xl:transition-all xl:transition-all lg:transition-all transition-all duration-300`}
        >
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 text-left"
          >
            <div className="relative">
              <div className="3xl:w-10 2xl:w-8 xl:w-7 lg:w-5 w-4 3xl:h-10 2xl:h-8 xl:h-7 lg:h-5 h-4 overflow-hidden rounded-full 3xl:min-w-10 2xl:min-w-8 xl:min-w-7 lg:min-w-5 min-w-4 bg-primary-shade-2">
                {sidebarAvatarUrl ? (
                  <img
                    src={sidebarAvatarUrl}
                    alt="avatar"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full 3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[8px] text-[6px] font-semibold text-nav-highlight">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              {unreadNotificationCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs w-3 h-3 lg:w-4 lg:h-4 3xl:w-5 3xl:h-5 font-bold border-2 border-background">
                  {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                </div>
              )}
            </div>
            <div
              className={`transition-opacity duration-200 ${isExpanded ? "opacity-100 block" : "opacity-0 hidden"
                }`}
            >
              <p className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[8px] text-[6px] font-semibold text-foreground whitespace-nowrap">
                {user?.name || "Guest"}
              </p>
              <p className="3xl:text-xs 2xl:text-[10px] xl:text-[8px] lg:text-[6px] text-[4px] text-gray-500 whitespace-nowrap">
                {user?.email || ""}
              </p>
            </div>
          </button>
          {isExpanded && (
            <div className="">
              <button
              onClick={handleLogout}
              className="text-center rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <LogOut className="3xl:w-6 2xl:w-5 xl:w-4 lg:w-3 3xl:h-6 2xl:h-5 xl:h-4 lg:h-3" />
            </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
