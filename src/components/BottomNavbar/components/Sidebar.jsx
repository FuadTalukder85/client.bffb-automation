import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut, ChevronDown, Users, ClipboardList, UserPlus } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/context/ThemeContext";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import { getBFFProductTaxonomyNavItems } from "@/constants/bffProductTaxonomy";
import { resolveAvatarUrl } from "@/utils/avatarUrl";
import { NavIcon } from "@/components/Sidebar/NavIcon";
import { hasPermission as checkPermission } from "@/lib/utils";

// Import Icons (Normal)
import ProjectOverviewIcon from "@/assets/icons/sidebar/02. Project Overview.svg?react";
import ApplicationLabIcon from "@/assets/icons/sidebar/03. Application Lab.svg?react";
import SensoryTestingIcon from "@/assets/icons/sidebar/04. Sensory Testing.svg?react";
import ShelfLifeTestingIcon from "@/assets/icons/sidebar/05. Shelf-Life Testing.svg?react";
import CleaningIcon from "@/assets/icons/sidebar/06. Cleaning.svg?react";
import MaintenanceIcon from "@/assets/icons/sidebar/07. Maintenance.svg?react";
import MasterRecipesIcon from "@/assets/icons/sidebar/08. Master Application Recipes List.svg?react";
import ManagementReportsIcon from "@/assets/icons/sidebar/01. Management Reports.svg?react";

// Import Icons (White/Dark Mode)
import ProjectOverviewIconWhite from "@/assets/icons/sidebar/02. Project Overview white.svg?react";
import ApplicationLabIconWhite from "@/assets/icons/sidebar/03. Application Lab white.svg?react";
import SensoryTestingIconWhite from "@/assets/icons/sidebar/04. Sensory Testing white.svg?react";
import ShelfLifeTestingIconWhite from "@/assets/icons/sidebar/05. Shelf-Life Testing white.svg?react";
import CleaningIconWhite from "@/assets/icons/sidebar/06. Cleaning white.svg?react";
import MaintenanceIconWhite from "@/assets/icons/sidebar/07. Maintenance white.svg?react";
import MasterRecipesIconWhite from "@/assets/icons/sidebar/08. Master Application Recipes List white.svg?react";
import ManagementReportsIconWhite from "@/assets/icons/sidebar/01. Management Reports white.svg?react";
import { useNavigate } from "react-router";

/**
 * Sidebar Component
 * Full-height sidebar that slides from right to left
 * Has curved bottom edge that aligns with the active navbar button
 */
export function Sidebar({
  isOpen,
  onClose,
  windowWidth,
  centerPos,
  curveWidth,
  curveDepth,
}) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const { permissions } = useUserPermissions();
  const sidebarAvatarUrl = resolveAvatarUrl(user?.avatar);

  const hasPermission = (perm) => checkPermission(permissions, perm);

  const NAV_ITEMS = [
    ...(hasPermission('dashboard:read') ? [{
      id: "management-overview",
      label: "Management Overview",
      icon: ManagementReportsIcon,
      iconDark: ManagementReportsIconWhite,
      subItems: [
        { id: "main-dashboard", label: "Main Dashboard", path: "/main-dashboard" },
        { id: "application-lab-dashboard", label: "Application Lab Dashboard", path: "/application-lab-dashboard" },
      ],
    }] : []),
    ...(() => {
      const subItems = [
        ...(hasPermission('project:read:@view-master-project') ? [{ id: "master-projects", label: "Master Projects Module", path: "/project-overview/master-projects" }] : []),
        ...(hasPermission('project:read:@view-product-development') ? [{ id: "product-development", label: "Product Development", path: "/project-overview/product-development" }] : []),
        ...(hasPermission('project:read:@view-application-lab') ? [{ id: "application-lab", label: "Application Lab", path: "/project-overview/application-lab" }] : []),
        ...(hasPermission('project:read:@view-sensory-lab') ? [{ id: "sensory", label: "Sensory Testing", path: "/project-overview/sensory" }] : []),
        ...(hasPermission('project:read:@view-master-project-schedule') ? [{ id: "master-project-schedule", label: "Master Project Schedule", path: "/project-overview/master-project-schedule" }] : []),
      ];
      return subItems.length > 0 ? [{
        id: "project-overview",
        label: "Projects Overview",
        icon: ProjectOverviewIcon,
        iconDark: ProjectOverviewIconWhite,
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
        id: "application-lab-main",
        label: "Application Lab",
        icon: ApplicationLabIcon,
        iconDark: ApplicationLabIconWhite,
        subItems
      }] : [];
    })(),
    ...(hasPermission(PERMISSIONS.SENSORY_FORM.READ) || hasPermission(PERMISSIONS.SENSORY_TOP_SHEET.READ) ? [{
      id: "sensory-testing",
      label: "Sensory Testing",
      icon: SensoryTestingIcon,
      iconDark: SensoryTestingIconWhite,
      subItems: [
        ...(hasPermission(PERMISSIONS.SENSORY_FORM.READ) ? [{ id: "sensory-forms", label: "Sensory Forms", path: "/sensory-testing/sensory-forms" }] : []),
        ...(hasPermission(PERMISSIONS.SENSORY_TOP_SHEET.READ) ? [{ id: "sensory-top-sheet", label: "Sensory Top-Sheet", path: "/sensory-testing/sensory-top-sheet" }] : []),
      ]
    }] : []),
    ...(hasPermission(PERMISSIONS.SHELF_LIFE_TESTING.READ) ? [{
      id: "shelf-life-testing",
      label: "Shelf-Life Testing",
      icon: ShelfLifeTestingIcon,
      iconDark: ShelfLifeTestingIconWhite,
      subItems: [
        { id: "shelf-life-test-records", label: "Test Records", path: "/shelf-life-testing/test-records" },
        { id: "shelf-life-monitoring-history", label: "Monitoring History", path: "/shelf-life-testing/monitoring-history" },
      ],
    }] : []),
    ...(hasPermission(PERMISSIONS.CLEANING.READ) ? [{
      id: "cleaning",
      label: "Cleaning",
      icon: CleaningIcon,
      iconDark: CleaningIconWhite,
      subItems: [
        { id: "cleanliness-items", label: "Cleanliness Items List", path: "/cleaning/cleanliness-items-list" },
        { id: "cleaning-status", label: "Cleaning Status", path: "/cleaning/cleaning-status" },
      ],
    }] : []),
    ...(hasPermission(PERMISSIONS.MAINTENANCE.READ) ? [{
      id: "maintenance",
      label: "Maintenance",
      icon: MaintenanceIcon,
      iconDark: MaintenanceIconWhite,
      subItems: [
        { id: "maintenance-items", label: "Maintenance Items List", path: "/maintenance/maintenance-items-list" },
        { id: "maintenance-calendar", label: "Maintenance Calendar", path: "/maintenance/maintenance-calendar" },
      ],
    }] : []),
    ...(() => {
      const subItems = [
        ...(hasPermission(PERMISSIONS.RECIPE.READ) ? [{ id: "application-recipes", label: "Application Recipes", path: "/application-recipes" }] : []),
        ...(hasPermission(PERMISSIONS.CATEGORY.READ) ? [{ id: "application-categories", label: "Application Categories", path: "/application-categories" }] : []),
      ];
      return subItems.length > 0 ? [{
        id: "master-recipes",
        label: "Master Application Recipe List",
        icon: MasterRecipesIcon,
        iconDark: MasterRecipesIconWhite,
        subItems
      }] : [];
    })(),
    ...(() => {
      const subItems = [
        ...(hasPermission(PERMISSIONS.BFF_PRODUCT.READ)
          ? [{ id: "bff-product-list", label: "Product List", path: "/bff-product/list" }]
          : []),
        ...(hasPermission(PERMISSIONS.BFF_PRODUCT_TAXONOMY.READ)
          ? getBFFProductTaxonomyNavItems()
          : []),
      ];
      return subItems.length > 0
        ? [{
            id: "bff-product",
            label: "BFF Product",
            icon: MasterRecipesIcon,
            iconDark: MasterRecipesIconWhite,
            subItems,
          }]
        : [];
    })(),
    ...(hasPermission(PERMISSIONS.DISPATCH.READ) ? [{
      id: "sample-dispatch",
      label: "Sample Dispatch",
      icon: (props) => <NavIcon name="sample-dispatch" {...props} />,
      iconDark: (props) => <NavIcon name="sample-dispatch" {...props} />,
      path: "/dispatch",
      subItems: [],
    }] : []),
    ...(hasPermission(PERMISSIONS.TEAM.READ) ? [{
      id: "team",
      label: "Team Formation",
      icon: (props) => <NavIcon name="team-management" {...props} />,
      iconDark: (props) => <NavIcon name="team-management" {...props} />,
      path: "/team-formation",
      subItems: [
        // { id: "team-formation", label: "Team Formation", path: "/team-formation" },
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
        icon: (props) => <NavIcon name="task-management" {...props} />,
        iconDark: (props) => <NavIcon name="task-management" {...props} />,
        subItems
      }] : [];
    })(),
    ...(() => {
      const subItems = [
        ...(hasPermission(PERMISSIONS.INVITATION.READ) ? [{ id: "emp-invites", label: "Employee Invitations", path: "/employee-invitations" }] : []),
        ...(hasPermission(PERMISSIONS.USER.READ) ? [{ id: "emp-mgmt", label: "Employee Management", path: "/employee-management" }] : []),
        ...(hasPermission(PERMISSIONS.ROLE.READ) ? [{ id: "access-mgmt", label: "Access Management", path: "/access-management" }] : []),
        ...(hasPermission(PERMISSIONS.AUDIT.READ) ? [{ id: "history", label: "History", path: "/access-history" }] : []),
      ];
      return subItems.length > 0 ? [{
        id: "invites",
        label: "Invites and Access",
        icon: (props) => <NavIcon name="invite-access" {...props} />,
        iconDark: (props) => <NavIcon name="invite-access" {...props} />,
        subItems
      }] : [];
    })(),
  ];
  const cornerRadius = 16;
  const sidebarWidthPercent = 0.95;
  const sidebarWidth = windowWidth * sidebarWidthPercent;
  const navbarHeight = 83;
  // Use a ref to track actual rendered height
  const [sidebarHeight, setSidebarHeight] = React.useState(
    window.innerHeight - navbarHeight,
  );

  React.useEffect(() => {
    const updateHeight = () => {
      setSidebarHeight(window.innerHeight - navbarHeight);
    };
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Ignore
    }
    logout();
    queryClient.clear();
    onClose();
  };

  // Calculate where the More button is relative to the sidebar's left edge
  const sidebarLeftPosition = windowWidth - sidebarWidth;
  const curvePositionInSidebar = centerPos - sidebarLeftPosition;

  // Sidebar Path with curve cutout at bottom
  const sidebarPath = `
    M ${cornerRadius} 0
    L ${sidebarWidth} 0
    L ${sidebarWidth} ${sidebarHeight - cornerRadius}
    Q ${sidebarWidth} ${sidebarHeight}, ${
      sidebarWidth - cornerRadius
    } ${sidebarHeight}
    L ${curvePositionInSidebar + curveWidth / 2} ${sidebarHeight}
    C ${curvePositionInSidebar + curveWidth / 4} ${sidebarHeight},
      ${curvePositionInSidebar + curveWidth / 4} ${sidebarHeight - curveDepth},
      ${curvePositionInSidebar} ${sidebarHeight - curveDepth}
    C ${curvePositionInSidebar - curveWidth / 4} ${sidebarHeight - curveDepth},
      ${curvePositionInSidebar - curveWidth / 4} ${sidebarHeight},
      ${curvePositionInSidebar - curveWidth / 2} ${sidebarHeight}
    L ${cornerRadius} ${sidebarHeight}
    Q 0 ${sidebarHeight}, 0 ${sidebarHeight - cornerRadius}
    L 0 ${cornerRadius}
    Q 0 0, ${cornerRadius} 0
    Z
  `;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 z-50 pointer-events-auto md:hidden"
        style={{
          width: `${sidebarWidthPercent * 100}%`,
          height: `calc(100dvh - ${navbarHeight}px)`,
          bottom: `${navbarHeight}px`,
          top: 0,
        }}
      >
        {/* Sidebar Background SVG */}
        <div className="absolute inset-0 w-full h-full pointer-events-none ">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${sidebarWidth} ${sidebarHeight}`}
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <defs>
              <clipPath id="customSidebarClip">
                <path
                  d={`
                    M 16 0
                    L ${sidebarWidth} 0
                    L ${sidebarWidth} ${sidebarHeight - 16}
                    Q ${sidebarWidth} ${sidebarHeight} ${
                      sidebarWidth - 16
                    } ${sidebarHeight}
                    L 16 ${sidebarHeight}
                    Q 0 ${sidebarHeight} 0 ${sidebarHeight - 16}
                    L 0 16
                    Q 0 0 16 0
                    Z
                  `}
                />
              </clipPath>
            </defs>
            <motion.path
              d={sidebarPath}
              className="fill-background "
              clipPath="url(#customSidebarClip)"
              animate={{ d: sidebarPath }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </svg>
        </div>

        {/* Sidebar Content Container */}
        <div className="relative z-50 flex flex-col h-full pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            {/* Empty header or Logo could go here if needed, but design shows list starting high */}
            <div />
            <button
              onClick={onClose}
              className="p-2 transition-colors rounded-full hover:bg-primary-shade-2"
              aria-label="Close menu"
            >
              <X size={24} className="text-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 px-4 py-2 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <SidebarItem
                key={item.id}
                label={item.label}
                icon={item.icon}
                iconDark={item.iconDark}
                href={item.path}
                subItems={item.subItems}
                theme={theme}
                onClose={onClose}
              />
            ))}
          </div>

          {/* User Profile & Logout Section */}
          <div className="px-6 pt-4 pb-12">
            <div
              onClick={() => {
                navigate("/profile");
                onClose?.();
              }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFC107] overflow-hidden flex items-center justify-center">
                  {sidebarAvatarUrl ? (
                    <img
                      src={sidebarAvatarUrl}
                      alt="avatar"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-sm font-bold text-black">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {user?.name || "Abu Zafar"}
                  </p>
                  <p className="text-xs text-foreground/70">
                    {user?.email || "zafar.ikbal@bangaflavour.com"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 transition-colors rounded-lg hover:bg-primary-shade-2"
                aria-label="Logout"
              >
                <LogOut size={20} className="text-nav-highlight" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/**
 * SidebarSection Component
 * Kept for compatibility if imported elsewhere, but not used in this new design
 */
export function SidebarSection({ title, children }) {
  return (
    <div className="px-4 py-3">
      {title && (
        <h3 className="mb-3 text-sm font-semibold uppercase text-foreground/60">
          {title}
        </h3>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

/**
 * SidebarItem Component
 * Individual item within the sidebar - supports sub-items with expand/collapse
 */
export function SidebarItem({
  label,
  icon: Icon,
  iconDark: IconDark,
  onClick,
  href,
  subItems,
  active = false,
  theme,
  onClose,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubItems = subItems && subItems.length > 0;

  const handleClick = () => {
    if (hasSubItems) {
      setIsExpanded(!isExpanded);
    } else if (onClick) {
      onClick();
    } else if (href) {
      window.location.href = href;
      onClose?.();
    }
  };

  const handleSubItemClick = (path) => {
    window.location.href = path;
    onClose?.();
  };

  // Choose icon based on theme
  const DisplayIcon = theme === "dark" && IconDark ? IconDark : Icon;

  return (
    <div>
      <button
        onClick={handleClick}
        className={`flex items-center w-full gap-4 px-3 py-3 text-left transition-colors rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-800`}
      >
        {DisplayIcon && (
          <div className="flex items-center justify-center w-6 h-6">
            <DisplayIcon
              className={`w-6 h-6 ${
                theme === "dark" ? "text-white" : "text-[#2c213d]"
              }`}
            />
          </div>
        )}
        <span
          className={`text-lg font-semibold flex-1 ${
            theme === "dark" ? "text-white" : "text-[#2c213d]"
          }`}
        >
          {label}
        </span>
        {hasSubItems && (
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            } ${theme === "dark" ? "text-white" : "text-[#2c213d]"}`}
          />
        )}
      </button>

      {/* Sub-items */}
      {hasSubItems && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pl-12 pr-3 space-y-1">
            {subItems.map((subItem) => (
              <button
                key={subItem.id}
                onClick={() => handleSubItemClick(subItem.path)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  theme === "dark" ? "text-white/80" : "text-[#2c213d]/80"
                }`}
              >
                {subItem.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

