/**
 * Status Color Palette
 * 
 * Centralized design tokens for status colors across the application.
 * These are pure values and should be used via StatusConfigBuilder.
 */

export const STATUS_COLOR_PALETTE = {
  ALL_STATUS: {
    bgColor: "#F3D5FF",
    textColor: "#935CE3"
  },
  NOT_STARTED: {
    bgColor: "#FFD2E5",
    textColor: "#D6005A"
  },
  IN_PROGRESS: {
    bgColor: "#D4DEFF",
    textColor: "#0039FF"
  },
  COMPLETED: {
    bgColor: "#A5E3FF",
    textColor: "#006797"
  },
  REWORK: {
    bgColor: "#FEEDBB",
    textColor: "#896700"
  },
  APPROVED: {
    bgColor: "#C6EACA",
    textColor: "#096812"
  },
  PAUSED: {
    bgColor: "#FFD7C9",
    textColor: "#E33A00"
  },
  CANCELLED: {
    bgColor: "#FFD5D5",
    textColor: "#E80000"
  },
  ADOPTED: {
    bgColor: "#AAFFB3",
    textColor: "#006209"
  },
  READY_TO_PROMOTE: {
    bgColor: "#E6E6FA",
    textColor: "#4B0082"
  },
  GOOD_ENOUGH: {
    bgColor: "#AFEEEE",
    textColor: "#008B8B"
  },
  ACCESS_DENIED: {
    bgColor: "#fef9c3", // bg-yellow-100
    textColor: "#854d0e", // text-yellow-800
    borderColor: "#fde047" // border-yellow-300
  },
  COMMERCIALIZED: {
    bgColor: "#D1FAE5",
    textColor: "#065F46"
  },
  EXPERIMENTAL: {
    bgColor: "#E0E7FF",
    textColor: "#3730A3"
  },
  // New aliases for convenience
  LOST: {
    bgColor: "#FFD5D5",
    textColor: "#E80000"
  },
  DROPPED: {
    bgColor: "#FFD5D5",
    textColor: "#E80000"
  }
};

/**
 * Legacy Color Helper (Keep for absolute fallback but avoid using)
 */
export const getStatusColor = (status) => {
  if (!status) return {};

  const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_');

  // Try to find in palette
  const entry = STATUS_COLOR_PALETTE[normalizedStatus];
  if (entry) {
    return {
      backgroundColor: entry.bgColor,
      color: entry.textColor,
      ...(entry.borderColor ? { border: `1px solid ${entry.borderColor}` } : {})
    };
  }

  // Handle dynamic Rework statuses (Rework 2, Rework 3, etc.)
  if (normalizedStatus.startsWith('REWORK')) {
    const reworkEntry = STATUS_COLOR_PALETTE.REWORK;
    return {
      backgroundColor: reworkEntry.bgColor,
      color: reworkEntry.textColor,
      ...(reworkEntry.borderColor ? { border: `1px solid ${reworkEntry.borderColor}` } : {})
    };
  }

  // Fallback map for common variations
  const fallbackMap = {
    'CANCELED': STATUS_COLOR_PALETTE.CANCELLED,
    'PENDING': STATUS_COLOR_PALETTE.REWORK,
    'ALL': STATUS_COLOR_PALETTE.ALL_STATUS,
    'SENSORY_LAB': STATUS_COLOR_PALETTE.IN_PROGRESS,
    'BUSINESS_DEVELOPMENT': STATUS_COLOR_PALETTE.IN_PROGRESS,
  };

  const fallback = fallbackMap[normalizedStatus];
  if (fallback) {
    return {
      backgroundColor: fallback.bgColor,
      color: fallback.textColor
    };
  }

  return {
    backgroundColor: STATUS_COLOR_PALETTE.NOT_STARTED.bgColor,
    color: STATUS_COLOR_PALETTE.NOT_STARTED.textColor
  };
};

export default STATUS_COLOR_PALETTE;