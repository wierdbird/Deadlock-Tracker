// The Steam IGCVersion endpoints all wrap their payload in a "result" object,
// but the exact key holding the build number can differ between
// GetClientVersion and GetServerVersion, and between apps. Rather than
// hard-coding one key, we check the common ones first and then fall back to
// a generic scan for any numeric field whose key mentions "version".

const PREFERRED_KEYS = [
  "required_version",
  "active_version",
  "min_allowed_version",
  "version",
  "server_version",
  "client_version",
];

/**
 * Recursively collect { path, value } pairs for every numeric field whose
 * key name contains "version" (case-insensitive).
 */
function collectVersionFields(obj, pathPrefix = "") {
  const found = [];
  if (obj === null || typeof obj !== "object") return found;

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    if (typeof value === "number" && /version/i.test(key)) {
      found.push({ path: currentPath, value });
    } else if (value && typeof value === "object") {
      found.push(...collectVersionFields(value, currentPath));
    }
  }
  return found;
}

/**
 * Extract the most plausible build/version number from a Steam API response.
 * Returns null if nothing usable was found.
 */
export function extractVersion(json) {
  if (!json || typeof json !== "object") return null;

  const result = json.result && typeof json.result === "object" ? json.result : json;

  for (const key of PREFERRED_KEYS) {
    if (typeof result[key] === "number") {
      return result[key];
    }
  }

  // Fallback: scan the whole payload for any "*version*" numeric field.
  const candidates = collectVersionFields(json);
  if (candidates.length === 0) return null;

  // Prefer an exact match on "version" if one turned up during the scan.
  const exact = candidates.find((c) => /(^|\.)version$/i.test(c.path));
  if (exact) return exact.value;

  // Otherwise just take the first candidate found.
  return candidates[0].value;
}
