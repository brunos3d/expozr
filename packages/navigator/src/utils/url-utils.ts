/**
 * Utility functions for URL handling and cargo resolution
 */

/**
 * Normalize a URL by ensuring it has the correct format
 * @param url - The URL to normalize
 * @returns Normalized URL
 */
export function normalizeUrl(url: string): string {
  // Remove trailing slash if present
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Join URL parts safely
 * @param base - Base URL
 * @param path - Path to join
 * @returns Joined URL
 */
export function joinUrlParts(base: string, path: string): string {
  const normalizedBase = normalizeUrl(base);
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${normalizedBase}/${normalizedPath}`;
}

/**
 * Generate a unique cache key for a cargo
 * @param expozr - Expozr name
 * @param cargo - Cargo name
 * @returns Unique cache key
 */
export function generateCargoKey(expozr: string, cargo: string): string {
  return `${expozr}:${cargo}`;
}

/**
 * Check if a URL appears to be valid
 * @param url - URL to validate
 * @returns True if URL appears valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Construct inventory URL from expozr base URL
 * @param expozrUrl - Base URL of the expozr
 * @returns URL to the inventory JSON file
 */
export function getInventoryUrl(expozrUrl: string): string {
  const baseUrl = normalizeUrl(expozrUrl);
  return `${baseUrl}/expozr.inventory.json`;
}

/**
 * Construct module URL from expozr base URL and cargo entry
 * @param expozrUrl - Base URL of the expozr
 * @param cargoEntry - Entry path from cargo metadata
 * @returns Full URL to the module
 */
export function getModuleUrl(expozrUrl: string, cargoEntry: string): string {
  return joinUrlParts(expozrUrl, cargoEntry);
}

/**
 * Extract file extension from URL or file path
 * @param url - URL or file path
 * @returns File extension (without dot) or empty string
 */
export function getFileExtension(url: string): string {
  const urlWithoutQuery = url.split("?")[0];
  const parts = urlWithoutQuery.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Check if URL points to a JavaScript module file
 * @param url - URL to check
 * @returns True if URL appears to be a JavaScript module
 */
export function isJavaScriptModule(url: string): boolean {
  const extension = getFileExtension(url);
  return ["js", "mjs", "esm", "umd", "cjs"].includes(extension);
}

/**
 * Generate format-specific URLs for a module
 * @param baseUrl - Base URL for the module
 * @param entry - Original entry path
 * @returns Array of URLs for different module formats
 */
export function generateFormatUrls(
  baseUrl: string,
  entry: string
): { format: string; url: string }[] {
  const urls: { format: string; url: string }[] = [];
  const baseName = entry.replace(/\.[^.]+$/, ""); // Remove extension

  // ESM variants
  urls.push(
    { format: "esm", url: getModuleUrl(baseUrl, `${baseName}.mjs`) },
    { format: "esm", url: getModuleUrl(baseUrl, `${baseName}.esm.js`) },
    { format: "esm", url: getModuleUrl(baseUrl, `${baseName}.module.js`) }
  );

  // UMD variants
  urls.push(
    { format: "umd", url: getModuleUrl(baseUrl, `${baseName}.umd.js`) },
    { format: "umd", url: getModuleUrl(baseUrl, `${baseName}.js`) }
  );

  // CommonJS variants
  urls.push(
    { format: "cjs", url: getModuleUrl(baseUrl, `${baseName}.cjs`) },
    { format: "cjs", url: getModuleUrl(baseUrl, `${baseName}.common.js`) }
  );

  // Original entry as fallback
  urls.push({ format: "auto", url: getModuleUrl(baseUrl, entry) });

  return urls;
}
