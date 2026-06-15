import React, { useMemo } from "react";
import { ExpandableCard } from "../../../../components/ui/ExpandableCard";
import { InfoTable } from "../../components/InfoTable";
import { Eye } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { format } from "date-fns";

// Utility Functions
const formatUserName = (user) => {
  if (!user) return "-";
  return user.name || user.email || "-";
};

const safeDisplayValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if ("from" in value || "to" in value) {
      const from = safeDisplayValue(value.from);
      const to = safeDisplayValue(value.to);
      if (from && to) return `${from} → ${to}`;
      return to || from || "";
    }
    if (value.name) return value.name;
    return "";
  }
  return String(value);
};

const formatDateTime = (isoString) => {
  if (!isoString) return { date: "-", time: "-" };
  try {
    const date = new Date(isoString);
    return {
      date: format(date, "dd/MM/yyyy"),
      time: format(date, "hh:mm a"),
    };
  } catch {
    return { date: "-", time: "-" };
  }
};

/**
 * MobileHistoryCard - History card for mobile view
 *
 * @param {Object} props
 * @param {Object} props.history - History data object
 * @param {number} props.initialHeight - Initial visible height in px (default: 95)
 * @param {Function} props.onView - Callback when view button clicked
 */
const MobileHistoryCard = ({ serial, history, initialHeight = 95, onView }) => {
  const { date, time } = formatDateTime(history?.createdAt);

  // Memoized action type checks to avoid recalculation on every render
  const actionTypes = useMemo(
    () => ({
      isInvite: history?.action?.includes("INVITE"),
      isRole:
        history?.action?.includes("ROLE") &&
        !history?.action?.includes("USER_ROLE"),
      isUserRole:
        history?.action?.includes("USER_ROLE") ||
        history?.action?.includes("USER_DEPARTMENT"),
    }),
    [history?.action]
  );

  // Get target info based on action type - memoized to avoid recalculation
  const targetInfo = useMemo(() => {
    if (actionTypes.isInvite) {
      const email = safeDisplayValue(
        history?.changes?.email || history?.targetId?.email
      );
      const dept = safeDisplayValue(
        history?.changes?.department || history?.targetId?.department
      );
      return { label: "Invite", name: email || "-", detail: dept };
    }
    if (actionTypes.isUserRole) {
      const user = history?.targetId;
      return {
        label: "Managed User",
        name: formatUserName(user),
        detail: [
          safeDisplayValue(user?.department),
          safeDisplayValue(user?.email),
        ]
          .filter(Boolean)
          .join(" | "),
      };
    }
    if (actionTypes.isRole) {
      const roleName = safeDisplayValue(
        history?.targetId?.name ||
          history?.changes?.roleName ||
          history?.changes?.name
      );
      return { label: "Role", name: roleName || "-", detail: "" };
    }
    return null;
  }, [actionTypes, history?.changes, history?.targetId]);

  // Memoized managed by details to avoid recalculation
  const managedByDetails = useMemo(
    () =>
      [
        safeDisplayValue(history?.managedBy?.department),
        safeDisplayValue(history?.managedBy?.email),
      ]
        .filter(Boolean)
        .join(" | ") || "-",
    [history?.managedBy]
  );

  // Memoized action text
  const actionText = useMemo(
    () => history?.action?.toLowerCase().replace(/_/g, " ") || "-",
    [history?.action]
  );

  return (
    <ExpandableCard className="mb-4 rounded-xl bg-background p-3">
      {/* Content - passed from here with customizable initial height */}
      <ExpandableCard.Content initialHeight={initialHeight}>
        <InfoTable>
          <InfoTable.Row
            label={
              <div className="min-w-11 min-h-8 rounded-lg bg-primary-shade-2 flex items-center justify-center">
                <p className="text-nav-highlight text-sm font-semibold">
                  {serial}
                </p>
              </div>
            }
          >
            <div className="font-semibold text-base-color">
              {formatUserName(history?.managedBy)}
            </div>
            <div className="text-[10px] text-lighter-text">
              {managedByDetails}
            </div>
          </InfoTable.Row>

          {targetInfo && (
            <InfoTable.Row label={targetInfo.label}>
              <div className="font-semibold text-base-color">
                {targetInfo.name}
              </div>
              {targetInfo.detail && (
                <div className="text-[10px] text-lighter-text">
                  {targetInfo.detail}
                </div>
              )}
            </InfoTable.Row>
          )}

          <InfoTable.Row label="Action">
            <div className="font-semibold text-base-color capitalize">
              {actionText}
            </div>
          </InfoTable.Row>

          <InfoTable.Row label="Date">
            <div className="font-semibold text-base-color">{date}</div>
          </InfoTable.Row>

          <InfoTable.Row label="Time">
            <div className="font-semibold text-base-color">{time}</div>
          </InfoTable.Row>
        </InfoTable>
      </ExpandableCard.Content>

      {/* Footer */}
      <ExpandableCard.Footer className="pt-2">
        {/* Left side - View button */}
        <ExpandableCard.FooterLeft className="flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView?.(history)}
            className="w-10 h-9 rounded-md border border-primary-shade-2 bg-white dark:bg-transparent text-nav-highlight hover:bg-gray-50"
          >
            <Eye className="action-button-icon" />
          </Button>
        </ExpandableCard.FooterLeft>

        {/* Right side - Toggle button */}
        <ExpandableCard.FooterRight>
          <ExpandableCard.ToggleButton />
        </ExpandableCard.FooterRight>
      </ExpandableCard.Footer>
    </ExpandableCard>
  );
};

export default MobileHistoryCard;
