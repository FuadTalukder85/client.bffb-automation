import {
  format,
  parseISO,
  isValid,
  parse,
  differenceInCalendarDays,
} from "date-fns";

/**
 * Centralized Date Formats
 * Keeping these here ensures consistency across the entire ERP.
 */
export const DATE_FORMATS = {
  DEFAULT: "dd MMM yy", // Output: 22 Dec 25
  FULL: "dd MMMM yyyy", // Output: 22 December 2025
  FULL_SHORT_MONTH: "dd MMM yyyy", // Output: 22 Dec 2025
  WITH_TIME: "dd MMM yy, p", // Output: 22 Dec 25, 2:57 PM
  TIME_ONLY: "p", // Output: 2:57 PM
  ISO: "yyyy-MM-dd", // Output: 2025-12-22 (for HTML inputs)
  PICKER: "MM/dd/yyyy", // Output: 12/22/2025 (internal DatePicker value)
};

const ISO_DATE_ONLY_REGEX =
  /^(\d{4}-\d{2}-\d{2})T00:00:00(?:\.\d+)?(?:Z|[+-]00:00)$/;

const SUPPORTED_INPUT_FORMATS = [
  "dd/MM/yyyy",
  "d/M/yyyy",
  DATE_FORMATS.ISO,
  DATE_FORMATS.PICKER,
  "dd MMM yyyy",
  DATE_FORMATS.DEFAULT,
];

/**
 * Format a date string or object into a human-readable string.
 * * @param {string | Date | null | undefined} dateInput - The date to format
 * @param {string} [formatStr='dd MMM yyyy'] - The format string (defaults to '22 Dec 2025' style)
 * @param {string} [fallback='N/A'] - What to return if the date is invalid/null
 * @returns {string} The formatted date string
 */
export function parseDateValue(dateInput) {
  if (!dateInput && dateInput !== 0) return null;

  if (dateInput instanceof Date) {
    return isValid(dateInput) ? dateInput : null;
  }

  if (typeof dateInput === "number") {
    const fromNumber = new Date(dateInput);
    return isValid(fromNumber) ? fromNumber : null;
  }

  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (!trimmed) return null;

    if (ISO_DATE_ONLY_REGEX.test(trimmed)) {
      const [, datePortion] = trimmed.match(ISO_DATE_ONLY_REGEX) || [];
      if (datePortion) {
        const parsed = parse(datePortion, DATE_FORMATS.ISO, new Date());
        if (isValid(parsed)) return parsed;
      }
    }

    if (trimmed.includes("T")) {
      const isoDate = parseISO(trimmed);
      if (isValid(isoDate)) return isoDate;
    }

    for (const pattern of SUPPORTED_INPUT_FORMATS) {
      try {
        const parsed = parse(trimmed, pattern, new Date());
        if (isValid(parsed)) return parsed;
      } catch (error) {
        // Continue trying other patterns
      }
    }

    const nativeDate = new Date(trimmed);
    if (isValid(nativeDate)) return nativeDate;
  }

  return null;
}

export function formatDate(
  dateInput,
  formatStr = DATE_FORMATS.DEFAULT,
  fallback = "-"
) {
  const date = parseDateValue(dateInput);
  if (!date) {
    return fallback;
  }

  try {
    return format(date, formatStr);
  } catch (error) {
    console.error(`[formatDate] Formatting error:`, error);
    return fallback;
  }
}

export function toISODateString(dateInput, { preserveTime = false } = {}) {
  const date = parseDateValue(dateInput);
  if (!date) return undefined;
  if (preserveTime) {
    return date.toISOString();
  }

  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  return utcDate.toISOString();
}

export function toDateInputValue(dateInput, fallback = "") {
  return formatDate(dateInput, DATE_FORMATS.ISO, fallback);
}

export function toPickerValue(dateInput, fallback = "") {
  return formatDate(dateInput, DATE_FORMATS.PICKER, fallback);
}

/**
 * Specific helper for formatting just the time (e.g. for your "Time" column)
 */
export function formatTime(dateInput) {
  return formatDate(dateInput, DATE_FORMATS.TIME_ONLY);
}

/**
 * Specific helper for Date + Time (e.g. for Audit Logs)
 */
export function formatDateTime(dateInput) {
  return formatDate(dateInput, DATE_FORMATS.WITH_TIME);
}

export function formatDateRange(start, end, fallback = "-") {
  const startLabel = formatDate(start, DATE_FORMATS.DEFAULT, fallback);
  const endLabel = formatDate(end, DATE_FORMATS.DEFAULT, fallback);
  if (startLabel === fallback && endLabel === fallback) return fallback;
  if (startLabel === fallback) return endLabel;
  if (endLabel === fallback) return startLabel;
  // collapse identical dates to a single value instead of repeating
  if (startLabel === endLabel) return startLabel;
  return `${startLabel} - ${endLabel}`;
}

export function getDurationInDays(start, end, fallback = "-") {
  const startDate = parseDateValue(start);
  const endDate = parseDateValue(end);
  if (!startDate || !endDate) return fallback;
  const diff = differenceInCalendarDays(endDate, startDate);
  if (Number.isNaN(diff) || diff < 0) return fallback;
  const value = diff === 0 ? 1 : diff;
  return `${value} Day${value === 1 ? "" : "s"}`;
}

export function sanitizeDatePayload(value) {
  return toISODateString(value);
}
