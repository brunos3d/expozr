/**
 * Memory-based cache implementation for the Navigator package
 */

import { CacheManager, CacheError } from "@expozr/core";

/**
 * Memory-based cache implementation
 * Provides fast in-memory caching with TTL support and size limits
 */
export class MemoryCache implements CacheManager {
  private cache = new Map<string, { value: any; expires: number }>();
  private maxSize: number;

  /**
   * Create a new memory cache
   * @param maxSize - Maximum number of items to store (default: 1000)
   */
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Get a value from the cache
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  async get<T = any>(key: string): Promise<T | null> {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if item has expired
    if (item.expires > 0 && Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set a value in the cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds (optional)
   */
  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    // Evict oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const expires = ttl ? Date.now() + ttl : 0;
    this.cache.set(key, { value, expires });
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key - Cache key
   * @returns True if key exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    // Check if item has expired
    if (item.expires > 0 && Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   * @param key - Cache key to delete
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get the current number of items in the cache
   * @returns Number of cached items
   */
  async size(): Promise<number> {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   * @returns Object with cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilization: (this.cache.size / this.maxSize) * 100,
    };
  }

  /**
   * Set the maximum cache size
   * @param maxSize - New maximum size
   */
  setMaxSize(maxSize: number): void {
    this.maxSize = maxSize;

    // Evict items if cache is now over the limit
    while (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }
}
