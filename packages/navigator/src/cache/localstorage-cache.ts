/**
 * LocalStorage-based cache implementation for browser environments
 */

import { CacheManager, CacheError } from "@expozr/core";

/**
 * LocalStorage-based cache implementation (browser only)
 * Provides persistent caching across browser sessions with TTL support
 */
export class LocalStorageCache implements CacheManager {
  private prefix = "expozr:";

  /**
   * Get a value from localStorage
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (typeof localStorage === "undefined") {
      throw new CacheError("get", "localStorage not available");
    }

    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) {
        return null;
      }

      const parsed = JSON.parse(item);

      // Check if item has expired
      if (parsed.expires > 0 && Date.now() > parsed.expires) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      throw new CacheError("get", (error as Error).message);
    }
  }

  /**
   * Set a value in localStorage
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds (optional)
   */
  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    if (typeof localStorage === "undefined") {
      throw new CacheError("set", "localStorage not available");
    }

    try {
      const expires = ttl ? Date.now() + ttl : 0;
      const item = { value, expires };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      throw new CacheError("set", (error as Error).message);
    }
  }

  /**
   * Check if a key exists in localStorage and is not expired
   * @param key - Cache key
   * @returns True if key exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    if (typeof localStorage === "undefined") {
      return false;
    }

    const item = localStorage.getItem(this.prefix + key);

    if (!item) {
      return false;
    }

    try {
      const parsed = JSON.parse(item);

      // Check if item has expired
      if (parsed.expires > 0 && Date.now() > parsed.expires) {
        localStorage.removeItem(this.prefix + key);
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete a key from localStorage
   * @param key - Cache key to delete
   */
  async delete(key: string): Promise<void> {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(this.prefix + key);
    }
  }

  /**
   * Clear all cache items from localStorage
   */
  async clear(): Promise<void> {
    if (typeof localStorage === "undefined") {
      return;
    }

    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(this.prefix)
    );
    keys.forEach((key) => localStorage.removeItem(key));
  }

  /**
   * Get the number of cache items in localStorage
   * @returns Number of cached items
   */
  async size(): Promise<number> {
    if (typeof localStorage === "undefined") {
      return 0;
    }

    return Object.keys(localStorage).filter((key) =>
      key.startsWith(this.prefix)
    ).length;
  }

  /**
   * Check if localStorage is available
   * @returns True if localStorage is available
   */
  isAvailable(): boolean {
    return typeof localStorage !== "undefined";
  }

  /**
   * Get all cache keys
   * @returns Array of cache keys (without prefix)
   */
  async getKeys(): Promise<string[]> {
    if (typeof localStorage === "undefined") {
      return [];
    }

    return Object.keys(localStorage)
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => key.slice(this.prefix.length));
  }

  /**
   * Set the cache prefix
   * @param prefix - New prefix for cache keys
   */
  setPrefix(prefix: string): void {
    this.prefix = prefix.endsWith(":") ? prefix : `${prefix}:`;
  }
}
