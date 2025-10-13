/**
 * Cache factory and exports for the Navigator package
 */

import { CacheManager, CacheError } from "@expozr/core";

// Cache implementations
import { MemoryCache } from "./memory-cache";
import { LocalStorageCache } from "./localstorage-cache";
import { IndexedDBCache } from "./indexeddb-cache";
import { NoCache } from "./no-cache";

export { MemoryCache, LocalStorageCache, IndexedDBCache, NoCache };

/**
 * Cache strategy options
 */
export type CacheStrategy = "memory" | "localStorage" | "indexedDB" | "none";

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** Maximum number of items (for memory cache) */
  maxSize?: number;
  /** Cache key prefix (for localStorage/indexedDB) */
  prefix?: string;
  /** Database name (for indexedDB) */
  dbName?: string;
}

/**
 * Factory function to create appropriate cache based on strategy
 * @param strategy - Caching strategy to use
 * @param options - Optional configuration for the cache
 * @returns Cache manager instance
 */
export function createCache(
  strategy: CacheStrategy,
  options?: CacheOptions
): CacheManager {
  switch (strategy) {
    case "memory":
      return new MemoryCache(options?.maxSize);

    case "localStorage":
      const localCache = new LocalStorageCache();
      if (options?.prefix) {
        localCache.setPrefix(options.prefix);
      }
      return localCache;

    case "indexedDB":
      return new IndexedDBCache();

    case "none":
      return new NoCache();

    default:
      throw new CacheError("create", `Unknown cache strategy: ${strategy}`);
  }
}

/**
 * Auto-detect the best available cache strategy for the current environment
 * @returns Recommended cache strategy
 */
export function detectBestCacheStrategy(): CacheStrategy {
  // In browser environment
  if (typeof window !== "undefined") {
    // Prefer IndexedDB for large storage capacity
    if (typeof indexedDB !== "undefined") {
      return "indexedDB";
    }

    // Fallback to localStorage
    if (typeof localStorage !== "undefined") {
      return "localStorage";
    }
  }

  // Fallback to memory cache (works everywhere)
  return "memory";
}

/**
 * Create cache with auto-detected strategy
 * @param options - Optional configuration for the cache
 * @returns Cache manager instance using the best available strategy
 */
export function createAutoCache(options?: CacheOptions): CacheManager {
  const strategy = detectBestCacheStrategy();
  return createCache(strategy, options);
}
