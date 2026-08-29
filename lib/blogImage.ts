const IMAGEKIT_PREFIX = "hop";

export function normalizeStoredS3Key(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    const path = decodeURIComponent(url.pathname.replace(/^\/+/, ""));

    if (url.hostname.includes("imagekit.io")) {
      return path.startsWith(`${IMAGEKIT_PREFIX}/`)
        ? path.slice(IMAGEKIT_PREFIX.length + 1)
        : path;
    }

    if (url.hostname.includes("amazonaws.com")) {
      return path;
    }

    return trimmed;
  } catch {
    return trimmed.replace(/^\/+/, "");
  }
}

export function getImagePathForNextImage(value?: string | null) {
  const normalized = normalizeStoredS3Key(value);
  if (!normalized) return "";
  if (/^https?:\/\//.test(normalized)) return normalized;
  return `/${normalized}`;
}

export function getImagePreviewUrl(value?: string | null) {
  const normalized = normalizeStoredS3Key(value);
  if (!normalized) return "";
  if (/^https?:\/\//.test(normalized)) return normalized;
  return `https://ik.imagekit.io/${IMAGEKIT_PREFIX}/${normalized}`;
}
