import { useRef, useMemo } from "react";

/**
 * A custom hook to handle mobile long-press and tap-selection logic.
 *
 * @param {Object} params
 * @param {string|number} params.itemId - Unique ID of the card item.
 * @param {Array} params.selectedIds - List of currently selected item IDs.
 * @param {Function} params.onSelectChange - State updater callback for selected IDs.
 * @param {boolean} [params.canSelect=true] - Condition whether the item is allowed to be selected.
 * @param {number} [params.longPressDelay=600] - Duration in ms for long-press trigger.
 */
export function useMobileSelection({
  itemId,
  selectedIds = [],
  onSelectChange,
  canSelect = true,
  longPressDelay = 600,
}) {
  const timerRef = useRef(null);
  const isLongPressRef = useRef(false);
  const isCancelledRef = useRef(false);
  const lastTouchTimeRef = useRef(0);
  const hasToggledRef = useRef(false);

  const isSelected = useMemo(() => selectedIds.includes(itemId), [selectedIds, itemId]);
  const isSelectionMode = selectedIds.length > 0;

  const toggleSelect = () => {
    if (!onSelectChange) return;
    onSelectChange((prev) =>
      isSelected ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handlePressStart = (e) => {
    if (!canSelect) return;

    // Do not trigger selection if clicking on interactive elements
    const target = e.target;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("textarea")
    ) {
      return;
    }

    // Ignore mousedown if it was recently preceded by touchstart
    if (e.type === "mousedown" && Date.now() - lastTouchTimeRef.current < 1000) {
      return;
    }
    if (e.type === "touchstart") {
      lastTouchTimeRef.current = Date.now();
    }

    isLongPressRef.current = false;
    isCancelledRef.current = false;
    hasToggledRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);

    if (isSelectionMode) {
      // Select instantly on press start when selection mode is active
      hasToggledRef.current = true;
      toggleSelect();
    } else {
      // Start long press timer for first selection
      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        toggleSelect();
      }, longPressDelay);
    }
  };

  const handlePressEnd = (e) => {
    // Ignore mouseup if it was recently preceded by touchend
    if (e.type === "mouseup" && Date.now() - lastTouchTimeRef.current < 1000) {
      return;
    }
    if (e.type === "touchend") {
      lastTouchTimeRef.current = Date.now();
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isCancelledRef.current) {
      isCancelledRef.current = false;
      isLongPressRef.current = false;
      hasToggledRef.current = false;
      return;
    }

    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }

    if (hasToggledRef.current) {
      hasToggledRef.current = false;
      return;
    }

    if (isSelectionMode) {
      toggleSelect();
    }
  };

  const handlePressCancel = (e) => {
    if (e.type === "touchmove") {
      lastTouchTimeRef.current = Date.now();
    }
    isCancelledRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const pressHandlers = {
    onTouchStart: handlePressStart,
    onTouchEnd: handlePressEnd,
    onTouchMove: handlePressCancel,
    onMouseDown: handlePressStart,
    onMouseUp: handlePressEnd,
    onMouseLeave: handlePressCancel,
  };

  return {
    isSelected,
    isSelectionMode,
    pressHandlers,
  };
}
