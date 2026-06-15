import React, { useRef, useState, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Popup Component
 * Renders a popup modal with curved bottom edge that aligns with the active navbar button
 *
 * @param {boolean} isOpen - Controls popup visibility
 * @param {number} windowWidth - Current window width for responsive calculations
 * @param {number} centerPos - Center position of active navbar item
 * @param {number} curveWidth - Width of the curve cutout
 * @param {number} curveDepth - Depth of the curve cutout
 * @param {number} height - Height of the popup (default: 240)
 * @param {number} horizontalPadding - Horizontal padding in pixels (default: 8)
 * @param {React.ReactNode} children - Content to render inside the popup
 */
export function Popup({
  isOpen,
  windowWidth,
  centerPos,
  curveWidth,
  curveDepth,
  height = 240,
  horizontalPadding = 8,
  children,
}) {
  const contentRef = useRef(null);
  const [dynamicHeight, setDynamicHeight] = useState(0);

  useLayoutEffect(() => {
    if (contentRef.current) {
      setDynamicHeight(contentRef.current.offsetHeight);
    }
  }, [children, windowWidth]);

  const popupHeight = dynamicHeight;
  const cornerRadius = 16;
  const paddingTotal = horizontalPadding * 2;

  // Adjust centerPos for popup to account for horizontal padding
  const popupCenterPos = centerPos - horizontalPadding;

  // Popup Path with rounded corners and bottom curve cutout
  const cpOffset = curveWidth / 4; // Adjusted for rounder curve

  const popupPath = `
    M ${cornerRadius} 0
    L ${windowWidth - paddingTotal - cornerRadius} 0
    Q ${windowWidth - paddingTotal} 0, ${
    windowWidth - paddingTotal
  } ${cornerRadius}
    L ${windowWidth - paddingTotal} ${popupHeight - cornerRadius}
    Q ${windowWidth - paddingTotal} ${popupHeight}, ${
    windowWidth - paddingTotal - cornerRadius
  } ${popupHeight}
    L ${popupCenterPos + curveWidth / 2} ${popupHeight}
    C ${popupCenterPos + curveWidth / 2 - cpOffset} ${popupHeight}, ${
    popupCenterPos + cpOffset
  } ${popupHeight - curveDepth}, ${popupCenterPos} ${popupHeight - curveDepth}
    C ${popupCenterPos - cpOffset} ${popupHeight - curveDepth}, ${
    popupCenterPos - curveWidth / 2 + cpOffset
  } ${popupHeight}, ${popupCenterPos - curveWidth / 2} ${popupHeight}
    L ${cornerRadius} ${popupHeight}
    Q 0 ${popupHeight}, 0 ${popupHeight - cornerRadius}
    L 0 ${cornerRadius}
    Q 0 0, ${cornerRadius} 0
    Z
  `;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0, height: 0 }}
      animate={{ y: 0, opacity: 1, height: dynamicHeight || "auto" }}
      exit={{ y: 20, opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative w-full mb-[3px] pointer-events-auto"
      style={{
        zIndex: 999,
        paddingLeft: `${horizontalPadding}px`,
        paddingRight: `${horizontalPadding}px`,
        overflow: "hidden", // Clip content during animation
      }}
    >
      {/* Popup Background SVG */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          paddingLeft: `${horizontalPadding}px`,
          paddingRight: `${horizontalPadding}px`,
        }}
      >
        <svg
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          className="w-full h-full"
          style={{ overflow: "visible" }}
        >
          <defs>
            <clipPath id="roundedPopup">
              <rect
                x="0"
                y="0"
                width={windowWidth - paddingTotal}
                height={popupHeight}
                rx="16"
                ry="16"
              />
            </clipPath>
          </defs>
          <motion.path
            d={popupPath}
            className="fill-background"
            clipPath="url(#roundedPopup)"
            animate={{ d: popupPath }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </svg>
      </div>

      {/* Popup Content Container */}
      <div
        ref={contentRef}
        className="relative z-50 flex flex-col justify-start px-2 pt-3 pb-10"
        // style={{ height: popupHeight }}
      >
        {children}
      </div>
    </motion.div>
  );
}
