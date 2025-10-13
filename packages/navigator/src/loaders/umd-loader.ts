/**
 * UMD module loader specifically for UMD format modules
 */

import type { LoadOptions } from "@expozr/core";
import type { UMDLoadOptions, UMDModuleInfo } from "../types";
import {
  isValidReactComponent,
  isValidModule,
  isWebpackGlobal,
  createTimeoutPromise,
} from "../utils";

/**
 * Load a UMD module from a URL and return the exported module
 * Handles UMD-specific loading patterns and global variable detection
 *
 * @param url - URL of the UMD module to load
 * @param options - UMD-specific loading options
 * @returns Promise resolving to UMD module information
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
            if (existingGlobals.has(key)) {
              const obj = (window as any)[key];
              if (obj && typeof obj === "object" && obj[expectedGlobalName]) {
                const potential = obj[expectedGlobalName];
                if (
                  isValidReactComponent(potential) ||
                  isValidModule(potential)
                ) {
                  foundModule = potential;
                  foundGlobalName = `${key}.${expectedGlobalName}`;
                  console.log(
                    `✅ UMD loader: Found module as window.${key}.${expectedGlobalName}`
                  );
                  break;
                }
              }
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
 * Load an Expozr inventory from a URL
 * @param expozrUrl - Base URL of the expozr
 * @returns Promise resolving to the inventory data
 */
export async function loadExpozrInventory(expozrUrl: string): Promise<any> {
  const inventoryUrl = expozrUrl.endsWith("/")
    ? `${expozrUrl}expozr.inventory.json`
    : `${expozrUrl}/expozr.inventory.json`;

  const response = await fetch(inventoryUrl);
  if (!response.ok) {
    throw new Error(`Failed to load expozr inventory: ${response.status}`);
  }

  return response.json();
}

/**
 * Load a specific cargo from an expozr using UMD loading
 * @param expozrUrl - Base URL of the expozr
 * @param cargoName - Name of the cargo to load
 * @param options - UMD loading options
 * @returns Promise resolving to the loaded cargo module
 */
export async function loadCargo(
  expozrUrl: string,
  cargoName: string,
  options: UMDLoadOptions = {}
): Promise<any> {
  // Load inventory
  const inventory = await loadExpozrInventory(expozrUrl);

  // Find cargo
  const cargo = inventory.cargo[cargoName];
  if (!cargo) {
    throw new Error(`Cargo "${cargoName}" not found in expozr`);
  }

  // Construct module URL
  const moduleUrl = expozrUrl.endsWith("/")
    ? `${expozrUrl}${cargo.entry}`
    : `${expozrUrl}/${cargo.entry}`;

  // Load the UMD module
  const moduleInfo = await loadUMDModule(moduleUrl, {
    ...options,
    expectedGlobalName: cargoName,
  });

  // Return the module content
  return moduleInfo.module;
}
