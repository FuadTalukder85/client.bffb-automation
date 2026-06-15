const trimTrailingSlash = (value = "") => `${value}`.replace(/\/+$/, "");

const getFallbackStorageBaseUrl = () => {
  const apiBaseUrl = `${import.meta.env.VITE_API_BASE_URL || ""}`.trim();
  if (!apiBaseUrl) return "";

  try {
    return trimTrailingSlash(new URL(apiBaseUrl).origin);
  } catch {
    return trimTrailingSlash(apiBaseUrl.replace(/\/api\/v\d+.*$/i, ""));
  }
};

const STORAGE_PUBLIC_BASE_URL = trimTrailingSlash(
  `${import.meta.env.VITE_STORAGE_PUBLIC_BASE_URL || getFallbackStorageBaseUrl()}`.trim()
);

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

export const resolveAvatarUrl = (avatarValue) => {
  if (!avatarValue) return null;

  const normalized = `${avatarValue}`.trim();
  if (!normalized) return null;

  if (normalized.startsWith("blob:") || normalized.startsWith("data:")) {
    return normalized;
  }

  if (isAbsoluteUrl(normalized) || normalized.startsWith("/")) {
    return normalized;
  }

  if (!STORAGE_PUBLIC_BASE_URL) {
    return null;
  }

  return `${STORAGE_PUBLIC_BASE_URL}/${normalized.replace(/^\/+/, "")}`;
};
