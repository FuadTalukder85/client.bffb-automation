const GENERIC_MESSAGES = new Set([
  "Validation failed",
  "VALIDATION_ERROR",
]);

const normalizeErrorValues = (value) => {
  if (!value) return [];

  if (typeof value === "string") return [value];

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeErrorValues(item))
      .filter(Boolean);
  }

  if (typeof value === "object") {
    return Object.values(value)
      .flatMap((item) => normalizeErrorValues(item))
      .filter(Boolean);
  }

  return [];
};

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  const responseData = error?.response?.data;

  const fieldErrors =
    responseData?.errors || responseData?.error?.errors || error?.errors;

  const normalizedFieldErrors = normalizeErrorValues(fieldErrors);
  if (normalizedFieldErrors.length > 0) {
    return normalizedFieldErrors.join(" ");
  }

  const primaryMessage =
    responseData?.error?.message ||
    responseData?.error ||
    responseData?.message ||
    error?.message;

  if (primaryMessage && !GENERIC_MESSAGES.has(primaryMessage)) {
    return primaryMessage;
  }

  return fallback;
};
