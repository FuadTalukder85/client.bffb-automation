import React from "react";
import { ExpandableCard } from "../../../../components/ui/ExpandableCard";
import { InfoTable } from "../../components/InfoTable";
import { Eye } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";
import { MdLockOpen, MdLockReset } from "react-icons/md";
import { Button } from "../../../../components/ui/Button";
import { format } from "date-fns";
import { useMobileSelection } from "@/hooks/useMobileSelection";
import { cn } from "@/lib/utils";

/**
 * MobileManageUserCard - Employee card for mobile view
 *
 * @param {Object} props
 * @param {Object} props.user - User data object
 * @param {number} props.initialHeight - Initial visible height in px (default: 100)
 * @param {Function} props.onEdit - Callback when edit button clicked
 * @param {Function} props.onDelete - Callback when delete button clicked
 * @param {Function} props.onReactivate - Callback when reactivate button clicked (archived users)
 * @param {Function} props.onUpdatePassword - Callback when update password clicked
 * @param {Function} props.onUnblock - Callback when unblock clicked
 */
const MobileManageUserCard = ({
  serial,
  user,
  selectedFilter,
  initialHeight = 95,
  onEdit,
  onDelete,
  onReactivate,
  onUpdatePassword,
  onUnblock,
  canUpdatePassword = false,
  canDeleteUser = false,
  canUnblockUser = false,
  selectedRowIds = [],
  onSelectChange,
}) => {
  const isArchived = user.isActive === false;

  const { isSelected, isSelectionMode, pressHandlers } = useMobileSelection({
    itemId: user._id || user.id,
    selectedIds: selectedRowIds,
    onSelectChange,
    canSelect: canDeleteUser && !isArchived,
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return "N/A";
    }
  };

  const isLocked = Boolean(
    user?.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()
  );
  const isBlockedFilter = selectedFilter === "blocked";
  const showUpdatePassword =
    !isBlockedFilter && canUpdatePassword && typeof onUpdatePassword === "function";
  const showDeleteUser =
    !isBlockedFilter && canDeleteUser && typeof onDelete === "function";
  const showUnblockUser =
    canUnblockUser &&
    typeof onUnblock === "function" &&
    isLocked &&
    (selectedFilter === "blocked" || selectedFilter === "all");
  const showEdit = !isBlockedFilter;

  const actionButtons = [];
  if (showUnblockUser) {
    actionButtons.push({
      key: "unblock",
      title: "Unblock",
      onClick: () => onUnblock?.(user),
      icon: <MdLockOpen className="action-button-icon" />,
      outlineClasses:
        "h-9 text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-background border border-nav-highlight/15 border-l-table-stroke",
      fillClasses:
        "h-9 bg-primary-shade-2 text-base-color hover:text-nav-highlight hover:bg-primary-shade-2/80 border border-nav-highlight/15 border-l-table-stroke",
    });
  }
  if (showUpdatePassword) {
    actionButtons.push({
      key: "updatePassword",
      title: "Update Password",
      onClick: () => onUpdatePassword?.(user),
      icon: <MdLockReset className="action-button-icon" />,
      outlineClasses:
        "h-9 text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-background border border-nav-highlight/15 border-l-table-stroke",
      fillClasses:
        "h-9 bg-primary-shade-2 text-base-color hover:text-nav-highlight hover:bg-primary-shade-2/80 border border-nav-highlight/15 border-l-table-stroke",
    });
  }
  if (showEdit) {
    actionButtons.push({
      key: "edit",
      title: "Edit",
      onClick: () => onEdit?.(user),
      icon: (
        <svg
          className="action-button-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="4"
          height="4"
          viewBox="0 0 16 16"
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z"
            clipRule="evenodd"
          />
        </svg>
      ),
      outlineClasses:
        "h-9 text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-background border border-nav-highlight/15 border-l-table-stroke",
      fillClasses:
        "h-9 bg-primary-shade-2 text-base-color hover:text-nav-highlight hover:bg-primary-shade-2/80 border border-nav-highlight/15 border-l-table-stroke",
    });
  }
  if (showDeleteUser) {
    actionButtons.push({
      key: "delete",
      title: "Archive",
      onClick: () => onDelete?.(user),
      icon: (
        <svg
          className="action-button-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="4"
          height="4"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"
          />
        </svg>
      ),
      outlineClasses:
        "h-9 text-base-color hover:text-red-600 hover:bg-red-50 bg-background border border-nav-highlight/15 border-l-table-stroke",
      fillClasses:
        "h-9 bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 border border-nav-highlight/15 border-l-table-stroke",
    });
  }

  const actionsWrapperWidth =
    actionButtons.length === 1
      ? "w-10"
      : actionButtons.length === 2
      ? "w-20"
      : actionButtons.length === 3
      ? "w-30"
      : actionButtons.length === 4
      ? "w-40"
      : "w-0";

  const getActionButtonClass = (index, action) => {
    const isSingle = actionButtons.length === 1;
    const isFirst = index === 0;
    const isLast = index === actionButtons.length - 1;
    const shapeClass = isSingle
      ? "rounded-l-md rounded-r-md"
      : isFirst
      ? "rounded-l-md rounded-r-none"
      : isLast
      ? "rounded-r-md rounded-l-none"
      : "rounded-none";

    const styleClass = index % 2 === 0 ? action.outlineClasses : action.fillClasses;

    return `${shapeClass} ${styleClass}`;
  };

  return (
    <div
      {...pressHandlers}
      className={cn(
        "relative w-full mb-4 select-none cursor-pointer rounded-xl transition-all duration-200",
        isSelected ? "scale-[0.99] shadow-lg" : ""
      )}
    >
      {isSelected && (
        <div className="absolute inset-0 rounded-xl pointer-events-none border border-primary bg-primary/[0.06] z-10 animate-in fade-in duration-200" />
      )}
      <ExpandableCard className="rounded-xl bg-background p-3 shadow-sm border border-border/50 w-full">
        <ExpandableCard.Content initialHeight={initialHeight}>
          <InfoTable>
            <InfoTable.Row 
              label={
                isSelectionMode ? (
                  <div className="flex items-center justify-center w-11 h-8 rounded-lg bg-primary-shade-2 text-nav-highlight shrink-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="min-w-11 min-h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <p className="text-nav-highlight text-sm font-semibold">{serial}</p>
                  </div>
                )
              }
            >
              <div className="font-semibold text-nav-highlight">{user.name || "N/A"}</div>
              <div className="text-[10px] text-lighter-text">
                {user.email || "N/A"}
              </div>
            </InfoTable.Row>

            <InfoTable.Row label="Department">
              <span className="font-semibold text-base-color">
                {user.department || "N/A"}
              </span>
            </InfoTable.Row>

            <InfoTable.Row label="Role">
              <span className="font-semibold text-base-color">
                {user.role || "N/A"}
              </span>
            </InfoTable.Row>

            <InfoTable.Row label="Join Date">
              <span className="font-semibold text-base-color">
                {formatDate(user.joinDate || user.createdAt)}
              </span>
            </InfoTable.Row>

            <InfoTable.Row label="Leave Date">
              <span className="font-semibold text-base-color">
                {user.leaveDate || "N/A"}
              </span>
            </InfoTable.Row>
          </InfoTable>
        </ExpandableCard.Content>

        {/* Footer */}
        {!isSelectionMode && (
          <ExpandableCard.Footer className="pt-2">
            <ExpandableCard.FooterLeft className="flex">
              {isArchived ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onReactivate?.(user)}
                  className="px-2 py-1 2xl:px-3 2xl:py-1.5 3xl:px-3 3xl:py-2 flex items-center justify-center font-semibold rounded-md text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                >
                  <AiFillThunderbolt className="action-button-icon" />
                </Button>
              ) : (
                <div className={`${actionsWrapperWidth} flex items-center gap-0`}>
                  {actionButtons.map((action, index) => (
                    <Button
                      key={action.key}
                      variant="ghost"
                      size="icon"
                      onClick={action.onClick}
                      title={action.title}
                      aria-label={action.title}
                      className={getActionButtonClass(index, action)}
                    >
                      {action.icon}
                    </Button>
                  ))}
                </div>
              )}
            </ExpandableCard.FooterLeft>

            {/* Right side - Toggle button with default styles */}
            <ExpandableCard.FooterRight>
              <ExpandableCard.ToggleButton />
            </ExpandableCard.FooterRight>
          </ExpandableCard.Footer>
        )}
      </ExpandableCard>
    </div>
  );
};

export default MobileManageUserCard;
