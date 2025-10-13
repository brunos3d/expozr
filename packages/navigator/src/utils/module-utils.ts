/**
 * Utility functions for UMD module loading and validation
 */

/**
 * Check if a value is a valid React component
 * @param value - The value to check
 * @returns True if the value appears to be a React component
 */
export function isValidReactComponent(value: any): boolean {
  if (typeof value === "function") {
    // Check if it's a React component by looking for typical React function patterns
    const funcStr = value.toString();
    return (
      funcStr.includes("React.createElement") ||
      funcStr.includes("jsx") ||
      funcStr.includes("_jsx") ||
      value.displayName !== undefined ||
      value.propTypes !== undefined
    );
  }
  return false;
}

/**
 * Check if a value is a valid module (object with exports)
 * @param value - The value to check
 * @returns True if the value appears to be a valid module
 */
export function isValidModule(value: any): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  );
}

/**
 * Check if a global name is from webpack or other development tools
 * @param name - The global variable name to check
 * @returns True if the name appears to be a webpack-related global
 */
export function isWebpackGlobal(name: string): boolean {
  const webpackPatterns = [
    "webpackHotUpdate",
    "webpackChunk",
    "__webpack",
    "webpackJsonp",
    "__WEBPACK",
  ];

  return webpackPatterns.some((pattern) => name.includes(pattern));
}

/**
 * Normalize UMD module by extracting functions from various possible structures
 * @param cargo - The loaded cargo object
 * @returns Normalized module with accessible functions
 */
export function normalizeUMDModule(cargo: any): Record<string, any> {
  let module = cargo.module || cargo;

  // Try different access patterns for UMD modules
  if (module && typeof module === "object") {
    // 1. Direct exports
    if (hasValidFunctions(module)) {
      return module;
    }

    // 2. Default export (webpack library.export: "default")
    if (module.default && hasValidFunctions(module.default)) {
      return module.default;
    }

    // 3. Exports property
    if (module.exports && hasValidFunctions(module.exports)) {
      return module.exports;
    }

    // 4. Nested default.exports
    if (module.default?.exports && hasValidFunctions(module.default.exports)) {
      return module.default.exports;
    }
  }

  // If no valid structure found, return the module as-is
  return module || {};
}

/**
 * Check if an object has valid function exports
 * @param obj - The object to check
 * @returns True if the object contains functions
 */
export function hasValidFunctions(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false;

  const functions = Object.keys(obj).filter(
    (key) => typeof obj[key] === "function"
  );
  return functions.length > 0;
}

/**
 * Extract all functions from a module
 * @param module - The module to extract functions from
 * @returns Object containing all functions from the module
 */
export function extractFunctions(
  module: Record<string, any>
): Record<string, Function> {
  const functions: Record<string, Function> = {};

  for (const [key, value] of Object.entries(module)) {
    if (typeof value === "function") {
      functions[key] = value;
    }
  }

  return functions;
}

/**
 * Create a timeout promise that rejects after specified time
 * @param ms - Timeout in milliseconds
 * @param message - Error message for timeout
 * @returns Promise that rejects after timeout
 */
export function createTimeoutPromise(
  ms: number,
  message?: string
): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message || `Operation timed out after ${ms}ms`));
    }, ms);
  });
}

/**
 * Wait for a condition to be met with timeout
 * @param condition - Function that returns true when condition is met
 * @param maxWait - Maximum time to wait in milliseconds
 * @param checkInterval - How often to check the condition in milliseconds
 * @returns Promise that resolves when condition is met or rejects on timeout
 */
export function waitForCondition(
  condition: () => boolean,
  maxWait: number = 30000,
  checkInterval: number = 100
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkReady = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > maxWait) {
        reject(new Error(`Condition not met within ${maxWait}ms`));
      } else {
        setTimeout(checkReady, checkInterval);
      }
    };

    checkReady();
  });
}
