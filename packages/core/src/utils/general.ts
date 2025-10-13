/**
 * General utility functions
 */

import type { ExpozrConfig, HostConfig, Inventory, Cargo } from "../types";

/**
 * Generate a unique cache key for a cargo
 */
export function generateCargoKey(
  expozr: string,
  cargo: string,
  version?: string
): string {
  return `${expozr}:${cargo}${version ? `@${version}` : ""}`;
}

/**
 * Normalize URL by ensuring it ends with a slash
 */
export function normalizeUrl(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

/**
 * Join URL paths properly
 */
export function joinUrl(...parts: string[]): string {
  return parts
    .map((part, index) => {
      if (index === 0) {
        return part.replace(/\/$/, "");
      }
      return part.replace(/^\//, "").replace(/\/$/, "");
    })
    .filter(Boolean)
    .join("/");
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key] as any);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Check if value is an object
 */
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === "object" && !Array.isArray(item);
}

/**
 * Create a timeout promise
 */
export function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
  });
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  attempts: number,
  delay: number,
  backoff: number = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retry(fn, attempts - 1, delay * backoff, backoff);
  }
}

/**
 * Check if code is running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Check if code is running in Node.js environment
 */
export function isNode(): boolean {
  try {
    return (
      typeof process !== "undefined" &&
      process.versions &&
      process.versions.node !== undefined
    );
  } catch {
    return false;
  }
}

/**
 * Get current timestamp
 */
export function timestamp(): number {
  return Date.now();
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | number;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId as any);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Create a promise that resolves after a delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string" || Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * Generate a random string
 */
export function randomString(length: number = 10): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
