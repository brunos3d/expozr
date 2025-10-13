/**
 * Utility functions for working with objects
 */

/**
 * Utility class for object operations
 */
export class ObjectUtils {
  /**
   * Deep merge multiple objects
   */
  static deepMerge<T extends Record<string, any>>(
    target: T,
    ...sources: Partial<T>[]
  ): T {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key] as any, source[key] as any);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.deepMerge(target, ...sources);
  }

  /**
   * Check if value is a plain object
   */
  static isObject(item: any): item is Record<string, any> {
    return item && typeof item === "object" && !Array.isArray(item);
  }

  /**
   * Deep clone an object
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }

    if (obj instanceof Array) {
      return obj.map((item) => this.deepClone(item)) as unknown as T;
    }

    if (typeof obj === "object") {
      const cloned = {} as Record<string, any>;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned as T;
    }

    return obj;
  }

  /**
   * Get nested property value safely
   */
  static get<T = any>(obj: any, path: string, defaultValue?: T): T | undefined {
    const keys = path.split(".");
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = result[key];
    }

    return result !== undefined ? result : defaultValue;
  }

  /**
   * Set nested property value
   */
  static set(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    const lastKey = keys.pop();

    if (!lastKey) return;

    let current = obj;
    for (const key of keys) {
      if (!this.isObject(current[key])) {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;
  }

  /**
   * Check if object has nested property
   */
  static has(obj: any, path: string): boolean {
    const keys = path.split(".");
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return false;
      }
      current = current[key];
    }

    return true;
  }

  /**
   * Pick specific properties from object
   */
  static pick<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  /**
   * Omit specific properties from object
   */
  static omit<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  }

  /**
   * Get all keys from nested object
   */
  static getAllKeys(obj: any, prefix = ""): string[] {
    const keys: string[] = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        keys.push(fullKey);

        if (this.isObject(obj[key])) {
          keys.push(...this.getAllKeys(obj[key], fullKey));
        }
      }
    }

    return keys;
  }

  /**
   * Flatten nested object
   */
  static flatten(obj: any, prefix = ""): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (this.isObject(obj[key])) {
          Object.assign(result, this.flatten(obj[key], fullKey));
        } else {
          result[fullKey] = obj[key];
        }
      }
    }

    return result;
  }

  /**
   * Unflatten object (reverse of flatten)
   */
  static unflatten(obj: Record<string, any>): any {
    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      this.set(result, key, value);
    }

    return result;
  }

  /**
   * Check if two objects are deeply equal
   */
  static isEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) {
      return true;
    }

    if (obj1 === null || obj2 === null) {
      return false;
    }

    if (typeof obj1 !== typeof obj2) {
      return false;
    }

    if (typeof obj1 !== "object") {
      return obj1 === obj2;
    }

    if (Array.isArray(obj1) !== Array.isArray(obj2)) {
      return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (!keys2.includes(key)) {
        return false;
      }

      if (!this.isEqual(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  }
}
