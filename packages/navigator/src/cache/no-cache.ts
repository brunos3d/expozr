/**
 * No-operation cache implementation for testing or disabled caching
 */

import { CacheManager } from "@expozr/core";

/**
 * No-op cache implementation
 * Provides a cache interface that doesn't actually cache anything
 * Useful for testing or when caching should be disabled
 */
export class NoCache implements CacheManager {
  /**
   * Always returns null (no caching)
   * @param _key - Cache key (ignored)
   * @returns Always null
   */
  async get<T = any>(_key: string): Promise<T | null> {
    return null;
  }

  /**
   * Does nothing (no caching)
   * @param _key - Cache key (ignored)
   * @param _value - Value (ignored)
   * @param _ttl - TTL (ignored)
   */
  async set<T = any>(_key: string, _value: T, _ttl?: number): Promise<void> {
    // Do nothing
  }

  /**
   * Always returns false (no caching)
   * @param _key - Cache key (ignored)
   * @returns Always false
   */
  async has(_key: string): Promise<boolean> {
    return false;
  }

  /**
   * Does nothing (no caching)
   * @param _key - Cache key (ignored)
   */
  async delete(_key: string): Promise<void> {
    // Do nothing
  }

  /**
   * Does nothing (no caching)
   */
  async clear(): Promise<void> {
    // Do nothing
  }

  /**
   * Always returns 0 (no caching)
   * @returns Always 0
   */
  async size(): Promise<number> {
    return 0;
  }

  /**
   * Check if this cache implementation is available
   * @returns Always true (no-op is always available)
   */
  isAvailable(): boolean {
    return true;
  }
}
