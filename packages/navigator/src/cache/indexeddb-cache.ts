/**
 * IndexedDB-based cache implementation for browser environments
 */

import { CacheManager, CacheError } from "@expozr/core";

/**
 * IndexedDB-based cache implementation (browser only)
 * Provides high-capacity persistent caching with TTL support
 */
export class IndexedDBCache implements CacheManager {
  private dbName = "expozr-cache";
  private storeName = "cache";
  private version = 1;

  /**
   * Open and initialize the IndexedDB database
   * @returns Promise that resolves to the database instance
   */
  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () =>
        reject(new CacheError("open", "Failed to open IndexedDB"));

      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: "key",
          });
          store.createIndex("expires", "expires", { unique: false });
        }
      };
    });
  }

  /**
   * Get a value from IndexedDB
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.get(key);

        request.onerror = () =>
          reject(new CacheError("get", "Failed to get item from IndexedDB"));

        request.onsuccess = () => {
          const result = request.result;

          if (!result) {
            resolve(null);
            return;
          }

          // Check if item has expired
          if (result.expires > 0 && Date.now() > result.expires) {
            this.delete(key); // Clean up expired item
            resolve(null);
            return;
          }

          resolve(result.value);
        };
      });
    } catch (error) {
      throw new CacheError("get", (error as Error).message);
    }
  }

  /**
   * Set a value in IndexedDB
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds (optional)
   */
  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      const expires = ttl ? Date.now() + ttl : 0;
      const item = { key, value, expires };

      return new Promise((resolve, reject) => {
        const request = store.put(item);

        request.onerror = () =>
          reject(new CacheError("set", "Failed to set item in IndexedDB"));
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      throw new CacheError("set", (error as Error).message);
    }
  }

  /**
   * Check if a key exists in IndexedDB and is not expired
   * @param key - Cache key
   * @returns True if key exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    try {
      const value = await this.get(key);
      return value !== null;
    } catch {
      return false;
    }
  }

  /**
   * Delete a key from IndexedDB
   * @param key - Cache key to delete
   */
  async delete(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.delete(key);

        request.onerror = () =>
          reject(
            new CacheError("delete", "Failed to delete item from IndexedDB")
          );
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      throw new CacheError("delete", (error as Error).message);
    }
  }

  /**
   * Clear all items from IndexedDB
   */
  async clear(): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.clear();

        request.onerror = () =>
          reject(new CacheError("clear", "Failed to clear IndexedDB"));
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      throw new CacheError("clear", (error as Error).message);
    }
  }

  /**
   * Get the number of items in IndexedDB
   * @returns Number of cached items
   */
  async size(): Promise<number> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.count();

        request.onerror = () =>
          reject(new CacheError("size", "Failed to count items in IndexedDB"));
        request.onsuccess = () => resolve(request.result);
      });
    } catch (error) {
      throw new CacheError("size", (error as Error).message);
    }
  }

  /**
   * Check if IndexedDB is available
   * @returns True if IndexedDB is available
   */
  isAvailable(): boolean {
    return typeof indexedDB !== "undefined";
  }

  /**
   * Clean up expired items from the cache
   * @returns Number of items cleaned up
   */
  async cleanExpired(): Promise<number> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const index = store.index("expires");

      const now = Date.now();
      let cleanedCount = 0;

      return new Promise((resolve, reject) => {
        const request = index.openCursor();

        request.onerror = () =>
          reject(new CacheError("clean", "Failed to clean expired items"));

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;

          if (cursor) {
            const item = cursor.value;

            // Delete expired items (expires > 0 means TTL was set)
            if (item.expires > 0 && now > item.expires) {
              cursor.delete();
              cleanedCount++;
            }

            cursor.continue();
          } else {
            resolve(cleanedCount);
          }
        };
      });
    } catch (error) {
      throw new CacheError("clean", (error as Error).message);
    }
  }
}
