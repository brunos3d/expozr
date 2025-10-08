/**
 * Cache manager implementations for different environments
 */

import type { CacheManager } from '@expozr/core';
import { CacheError } from '@expozr/core';

/**
 * Memory-based cache implementation
 */
export class MemoryCache implements CacheManager {
  private cache = new Map<string, { value: any; expires: number }>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  async get<T = any>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (item.expires > 0 && Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

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

  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    if (item.expires > 0 && Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async size(): Promise<number> {
    return this.cache.size;
  }
}

/**
 * LocalStorage-based cache implementation (browser only)
 */
export class LocalStorageCache implements CacheManager {
  private prefix = 'expozr:';

  async get<T = any>(key: string): Promise<T | null> {
    if (typeof localStorage === 'undefined') {
      throw new CacheError('get', 'localStorage not available');
    }

    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) {
        return null;
      }

      const parsed = JSON.parse(item);
      
      if (parsed.expires > 0 && Date.now() > parsed.expires) {
        await this.delete(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      throw new CacheError('get', (error as Error).message);
    }
  }

  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    if (typeof localStorage === 'undefined') {
      throw new CacheError('set', 'localStorage not available');
    }

    try {
      const expires = ttl ? Date.now() + ttl : 0;
      const item = { value, expires };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      throw new CacheError('set', (error as Error).message);
    }
  }

  async has(key: string): Promise<boolean> {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    const item = localStorage.getItem(this.prefix + key);
    
    if (!item) {
      return false;
    }

    try {
      const parsed = JSON.parse(item);
      
      if (parsed.expires > 0 && Date.now() > parsed.expires) {
        await this.delete(key);
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.prefix + key);
    }
  }

  async clear(): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
    keys.forEach(key => localStorage.removeItem(key));
  }

  async size(): Promise<number> {
    if (typeof localStorage === 'undefined') {
      return 0;
    }

    return Object.keys(localStorage).filter(key => key.startsWith(this.prefix)).length;
  }
}

/**
 * IndexedDB-based cache implementation (browser only)
 */
export class IndexedDBCache implements CacheManager {
  private dbName = 'expozr-cache';
  private storeName = 'cache';
  private version = 1;

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new CacheError('getDB', 'IndexedDB not available'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(new CacheError('getDB', 'Failed to open database'));
      
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        
        request.onerror = () => reject(new CacheError('get', 'Failed to get item'));
        
        request.onsuccess = () => {
          const result = request.result;
          
          if (!result) {
            resolve(null);
            return;
          }

          if (result.expires > 0 && Date.now() > result.expires) {
            this.delete(key);
            resolve(null);
            return;
          }

          resolve(result.value);
        };
      });
    } catch (error) {
      throw new CacheError('get', (error as Error).message);
    }
  }

  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const expires = ttl ? Date.now() + ttl : 0;
      const item = { key, value, expires };

      return new Promise((resolve, reject) => {
        const request = store.put(item);
        
        request.onerror = () => reject(new CacheError('set', 'Failed to set item'));
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      throw new CacheError('set', (error as Error).message);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const value = await this.get(key);
      return value !== null;
    } catch {
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        
        request.onerror = () => reject(new CacheError('delete', 'Failed to delete item'));
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      throw new CacheError('delete', (error as Error).message);
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.clear();
        
        request.onerror = () => reject(new CacheError('clear', 'Failed to clear cache'));
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      throw new CacheError('clear', (error as Error).message);
    }
  }

  async size(): Promise<number> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.count();
        
        request.onerror = () => reject(new CacheError('size', 'Failed to get cache size'));
        request.onsuccess = () => resolve(request.result);
      });
    } catch (error) {
      throw new CacheError('size', (error as Error).message);
    }
  }
}

/**
 * No-op cache implementation
 */
export class NoCache implements CacheManager {
  async get<T = any>(_key: string): Promise<T | null> {
    return null;
  }

  async set<T = any>(_key: string, _value: T, _ttl?: number): Promise<void> {
    // Do nothing
  }

  async has(_key: string): Promise<boolean> {
    return false;
  }

  async delete(_key: string): Promise<void> {
    // Do nothing
  }

  async clear(): Promise<void> {
    // Do nothing
  }

  async size(): Promise<number> {
    return 0;
  }
}

/**
 * Factory function to create appropriate cache based on strategy
 */
export function createCache(strategy: 'memory' | 'localStorage' | 'indexedDB' | 'none', options?: any): CacheManager {
  switch (strategy) {
    case 'memory':
      return new MemoryCache(options?.maxSize);
    case 'localStorage':
      return new LocalStorageCache();
    case 'indexedDB':
      return new IndexedDBCache();
    case 'none':
      return new NoCache();
    default:
      throw new CacheError('create', `Unknown cache strategy: ${strategy}`);
  }
}