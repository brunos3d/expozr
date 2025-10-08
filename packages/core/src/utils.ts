/**
 * Utility functions for the Expozr ecosystem
 */

import type { Cargo, Inventory, WarehouseConfig } from './types';

/**
 * Validate semver version string
 */
export function isValidVersion(version: string): boolean {
  const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
  return semverRegex.test(version);
}

/**
 * Check if a version satisfies a version constraint
 */
export function satisfiesVersion(version: string, constraint: string): boolean {
  // Simple implementation - in production you'd want to use a proper semver library
  if (constraint.startsWith('^')) {
    const [major] = constraint.slice(1).split('.');
    const [vMajor] = version.split('.');
    return vMajor === major;
  }
  
  if (constraint.startsWith('~')) {
    const [major, minor] = constraint.slice(1).split('.');
    const [vMajor, vMinor] = version.split('.');
    return vMajor === major && vMinor === minor;
  }
  
  return version === constraint;
}

/**
 * Generate a unique cache key for a cargo
 */
export function generateCargoKey(warehouse: string, cargo: string, version?: string): string {
  return `${warehouse}:${cargo}${version ? `@${version}` : ''}`;
}

/**
 * Generate a checksum for data integrity
 */
export async function generateChecksum(data: any): Promise<string> {
  const jsonString = JSON.stringify(data, Object.keys(data).sort());
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // Browser environment
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js environment - fallback to simple hash
    let hash = 0;
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

/**
 * Validate inventory structure
 */
export function validateInventory(inventory: any): inventory is Inventory {
  if (!inventory || typeof inventory !== 'object') {
    return false;
  }

  const requiredFields = ['warehouse', 'cargo', 'timestamp'];
  if (!requiredFields.every(field => field in inventory)) {
    return false;
  }

  if (!inventory.warehouse.name || !inventory.warehouse.version || !inventory.warehouse.url) {
    return false;
  }

  if (typeof inventory.cargo !== 'object' || inventory.cargo === null) {
    return false;
  }

  // Validate each cargo
  for (const [name, cargo] of Object.entries(inventory.cargo)) {
    if (!validateCargo(cargo as any)) {
      return false;
    }
  }

  return true;
}

/**
 * Validate cargo structure
 */
export function validateCargo(cargo: any): cargo is Cargo {
  if (!cargo || typeof cargo !== 'object') {
    return false;
  }

  const requiredFields = ['name', 'version', 'entry'];
  if (!requiredFields.every(field => field in cargo && typeof cargo[field] === 'string')) {
    return false;
  }

  if (!isValidVersion(cargo.version)) {
    return false;
  }

  return true;
}

/**
 * Validate warehouse configuration
 */
export function validateWarehouseConfig(config: any): config is WarehouseConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }

  const requiredFields = ['name', 'version', 'expose'];
  if (!requiredFields.every(field => field in config)) {
    return false;
  }

  if (!isValidVersion(config.version)) {
    return false;
  }

  if (typeof config.expose !== 'object' || config.expose === null) {
    return false;
  }

  return true;
}

/**
 * Normalize URL by ensuring it ends with a slash
 */
export function normalizeUrl(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

/**
 * Join URL paths properly
 */
export function joinUrl(...parts: string[]): string {
  return parts
    .map((part, index) => {
      if (index === 0) {
        return part.replace(/\/$/, '');
      }
      return part.replace(/^\//, '').replace(/\/$/, '');
    })
    .filter(Boolean)
    .join('/');
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key] as any, source[key] as any);
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
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Create a timeout promise
 */
export function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
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
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, attempts - 1, delay * backoff, backoff);
  }
}

/**
 * Check if code is running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if code is running in Node.js environment
 */
export function isNode(): boolean {
  try {
    return typeof globalThis !== 'undefined' && 
           'process' in globalThis && 
           (globalThis as any).process && 
           'versions' in (globalThis as any).process &&
           'node' in (globalThis as any).process.versions;
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
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}