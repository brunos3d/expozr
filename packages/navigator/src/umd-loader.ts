/**
 * UMD Module Loader for browser environments
 * Handles loading and accessing UMD modules with proper global discovery
 */

export interface UMDLoadOptions {
  timeout?: number;
  retries?: number;
  expectedGlobalName?: string;
}

export interface UMDModuleInfo {
  module: any;
  globalName: string;
  url: string;
}

/**
 * Load a UMD module from a URL and return the exported module
 */
export async function loadUMDModule(
  url: string,
  options: UMDLoadOptions = {}
): Promise<UMDModuleInfo> {
  const { timeout = 30000, retries = 3, expectedGlobalName } = options;

  return new Promise((resolve, reject) => {
    // Remember what globals existed before loading
    const existingGlobals = new Set(Object.keys(window));

    const script = document.createElement("script");
    script.src = url;
    script.crossOrigin = "anonymous";

    let timeoutId: NodeJS.Timeout;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    const handleSuccess = (module: any, globalName: string) => {
      cleanup();
      resolve({ module, globalName, url });
    };

    const handleError = (error: Error) => {
      cleanup();
      reject(error);
    };

    // Set up timeout
    timeoutId = setTimeout(() => {
      handleError(
        new Error(`UMD module loading timed out after ${timeout}ms: ${url}`)
      );
    }, timeout);

    script.onload = () => {
      try {
        // Find what new globals were added
        const currentGlobals = Object.keys(window);
        const newGlobals = currentGlobals.filter(
          (key) => !existingGlobals.has(key)
        );

        console.log(`🔍 UMD loader: New globals after loading:`, newGlobals);

        let foundModule = null;
        let foundGlobalName = "";

        // Strategy 1: Check if expected global name exists
        if (expectedGlobalName && (window as any)[expectedGlobalName]) {
          const potential = (window as any)[expectedGlobalName];
          if (isValidReactComponent(potential) || isValidModule(potential)) {
            foundModule = potential;
            foundGlobalName = expectedGlobalName;
            console.log(
              `✅ UMD loader: Found expected module as window.${expectedGlobalName}`
            );
          }
        }

        // Strategy 2: Check new globals for React components or valid modules
        if (!foundModule) {
          for (const globalName of newGlobals) {
            // Skip webpack HMR and other development globals
            if (isWebpackGlobal(globalName)) {
              continue;
            }

            const potential = (window as any)[globalName];
            if (isValidReactComponent(potential) || isValidModule(potential)) {
              foundModule = potential;
              foundGlobalName = globalName;
              console.log(
                `✅ UMD loader: Found module as window.${globalName}`
              );
              break;
            }
          }
        }

        // Strategy 3: Check if any existing globals got new properties
        if (!foundModule && expectedGlobalName) {
          const windowKeys = Object.keys(window);
          for (const key of windowKeys) {
            try {
              const obj = (window as any)[key];
              if (obj && typeof obj === "object" && obj[expectedGlobalName]) {
                const potential = obj[expectedGlobalName];
                if (
                  isValidReactComponent(potential) ||
                  isValidModule(potential)
                ) {
                  foundModule = potential;
                  foundGlobalName = key;
                  console.log(
                    `✅ UMD loader: Found module in window.${key}.${expectedGlobalName}`
                  );
                  break;
                }
              }
            } catch (e) {
              // Skip inaccessible globals
            }
          }
        }

        if (foundModule) {
          handleSuccess(foundModule, foundGlobalName);
        } else {
          console.error(
            `❌ UMD loader: No valid module found. New globals:`,
            newGlobals
          );
          handleError(new Error(`UMD module not found after loading: ${url}`));
        }
      } catch (error) {
        handleError(error as Error);
      }
    };

    script.onerror = (event) => {
      handleError(new Error(`Failed to load UMD module: ${url}`));
    };

    // Add script to document
    document.head.appendChild(script);
  });
}

/**
 * Check if a value is a valid React component
 */
function isValidReactComponent(value: any): boolean {
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
 */
function isValidModule(value: any): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  );
}

/**
 * Check if a global name is from webpack or other development tools
 */
function isWebpackGlobal(name: string): boolean {
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
 * Simple function to load an Expozr warehouse inventory
 */
export async function loadWarehouseInventory(
  warehouseUrl: string
): Promise<any> {
  const inventoryUrl = warehouseUrl.endsWith("/")
    ? `${warehouseUrl}expozr.inventory.json`
    : `${warehouseUrl}/expozr.inventory.json`;

  const response = await fetch(inventoryUrl);
  if (!response.ok) {
    throw new Error(`Failed to load warehouse inventory: ${response.status}`);
  }

  return response.json();
}

/**
 * Simple function to load a cargo from a warehouse
 */
export async function loadCargo(
  warehouseUrl: string,
  cargoName: string,
  options: UMDLoadOptions = {}
): Promise<any> {
  // Load inventory
  const inventory = await loadWarehouseInventory(warehouseUrl);

  // Find cargo
  const cargo = inventory.cargo[cargoName];
  if (!cargo) {
    throw new Error(`Cargo "${cargoName}" not found in warehouse`);
  }

  // Construct module URL
  const moduleUrl = warehouseUrl.endsWith("/")
    ? `${warehouseUrl}${cargo.entry}`
    : `${warehouseUrl}/${cargo.entry}`;

  // Load the UMD module
  const moduleInfo = await loadUMDModule(moduleUrl, {
    ...options,
    expectedGlobalName: cargoName,
  });

  // Return the module content
  return moduleInfo.module;
}
