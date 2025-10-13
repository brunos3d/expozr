/**
 * Validation utilities for configurations and data structures
 */

import type { ExpozrConfig, HostConfig, Inventory, Cargo } from "../types";

/**
 * Utility class for validating various data structures and configurations
 */
export class ValidationUtils {
  /**
   * Validate expozr configuration structure
   */
  static validateExpozrConfig(config: any): config is ExpozrConfig {
    if (!config || typeof config !== "object") {
      throw new Error("Configuration must be an object");
    }

    const requiredFields = ["name", "version", "expose"];
    for (const field of requiredFields) {
      if (!(field in config)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!this.isValidVersion(config.version)) {
      throw new Error(`Invalid version format: ${config.version}`);
    }

    if (typeof config.expose !== "object" || config.expose === null) {
      throw new Error("'expose' must be an object");
    }

    if (Object.keys(config.expose).length === 0) {
      throw new Error("At least one cargo must be exposed");
    }

    return true;
  }

  /**
   * Validate host configuration structure
   */
  static validateHostConfig(config: any): config is HostConfig {
    if (!config || typeof config !== "object") {
      throw new Error("Host configuration must be an object");
    }

    if (!config.expozrs || typeof config.expozrs !== "object") {
      throw new Error("'expozrs' field is required and must be an object");
    }

    return true;
  }

  /**
   * Validate inventory structure
   */
  static validateInventory(inventory: any): inventory is Inventory {
    if (!inventory || typeof inventory !== "object") {
      return false;
    }

    const requiredFields = ["expozr", "cargo", "timestamp"];
    if (!requiredFields.every((field) => field in inventory)) {
      return false;
    }

    if (
      !inventory.expozr.name ||
      !inventory.expozr.version ||
      !inventory.expozr.url
    ) {
      return false;
    }

    if (typeof inventory.cargo !== "object" || inventory.cargo === null) {
      return false;
    }

    // Validate each cargo
    for (const [name, cargo] of Object.entries(inventory.cargo)) {
      if (!this.validateCargo(cargo as any)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate cargo structure
   */
  static validateCargo(cargo: any): cargo is Cargo {
    if (!cargo || typeof cargo !== "object") {
      return false;
    }

    const requiredFields = ["name", "version", "entry"];
    if (
      !requiredFields.every(
        (field) => field in cargo && typeof cargo[field] === "string"
      )
    ) {
      return false;
    }

    if (!this.isValidVersion(cargo.version)) {
      return false;
    }

    return true;
  }

  /**
   * Validate semver version string
   */
  static isValidVersion(version: string): boolean {
    if (typeof version !== "string") {
      return false;
    }

    const semverRegex =
      /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverRegex.test(version);
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    if (typeof url !== "string") {
      return false;
    }

    try {
      new URL(url);
      return true;
    } catch {
      // Check for relative URLs
      return (
        url.startsWith("/") || url.startsWith("./") || url.startsWith("../")
      );
    }
  }

  /**
   * Validate configuration schema against JSON schema
   */
  static validateSchema(
    data: any,
    schema: any
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      this.validateObjectSchema(data, schema, "", errors);
      return { valid: errors.length === 0, errors };
    } catch (error) {
      return { valid: false, errors: [(error as Error).message] };
    }
  }

  /**
   * Recursively validate object against schema
   */
  private static validateObjectSchema(
    data: any,
    schema: any,
    path: string,
    errors: string[]
  ): void {
    if (schema.type === "object") {
      if (typeof data !== "object" || data === null) {
        errors.push(`${path}: Expected object, got ${typeof data}`);
        return;
      }

      // Check required properties
      if (schema.required) {
        for (const prop of schema.required) {
          if (!(prop in data)) {
            errors.push(`${path}: Missing required property '${prop}'`);
          }
        }
      }

      // Validate properties
      if (schema.properties) {
        for (const [prop, propSchema] of Object.entries(schema.properties)) {
          if (prop in data) {
            const propPath = path ? `${path}.${prop}` : prop;
            this.validateObjectSchema(data[prop], propSchema, propPath, errors);
          }
        }
      }
    } else if (schema.type === "array") {
      if (!Array.isArray(data)) {
        errors.push(`${path}: Expected array, got ${typeof data}`);
        return;
      }

      if (schema.items) {
        data.forEach((item, index) => {
          const itemPath = `${path}[${index}]`;
          this.validateObjectSchema(item, schema.items, itemPath, errors);
        });
      }
    } else if (schema.type === "string") {
      if (typeof data !== "string") {
        errors.push(`${path}: Expected string, got ${typeof data}`);
      } else if (schema.minLength && data.length < schema.minLength) {
        errors.push(`${path}: String too short (min: ${schema.minLength})`);
      } else if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
        errors.push(`${path}: String does not match pattern`);
      }
    } else if (schema.type === "number") {
      if (typeof data !== "number") {
        errors.push(`${path}: Expected number, got ${typeof data}`);
      } else if (schema.minimum !== undefined && data < schema.minimum) {
        errors.push(`${path}: Number below minimum (${schema.minimum})`);
      }
    } else if (schema.type === "boolean") {
      if (typeof data !== "boolean") {
        errors.push(`${path}: Expected boolean, got ${typeof data}`);
      }
    }

    // Handle enum validation
    if (schema.enum && !schema.enum.includes(data)) {
      errors.push(`${path}: Value not in allowed enum values`);
    }
  }
}
