/**
 * React-specific utilities for UMD module loading and expozr consumption
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { loadUMDModule, loadExpozrInventory } from "@expozr/navigator";

/**
 * Automatically sets up React globals required for UMD modules
 * Call this once before loading any React UMD modules
 *
 * @example
 * ```typescript
 * import { setupReactGlobals } from '@expozr/react';
 *
 * // Call once at application start
 * setupReactGlobals();
 *
 * // Now you can load React UMD modules
 * const buttonModule = await loadUMDModule(url, { expectedGlobalName: 'Button' });
 * ```
 */
export function setupReactGlobals() {
  if (typeof window === "undefined") {
    console.warn(
      "setupReactGlobals: window is not available (SSR environment?)"
    );
    return;
  }

  const globals = window as any;

  // Standard React globals
  globals.React = React;
  globals.ReactDOM = { createRoot };

  // String-based globals for dynamic access
  globals["react"] = React;
  globals["react-dom"] = { createRoot };

  // Webpack external module references
  globals.__WEBPACK_EXTERNAL_MODULE_react__ = React;
  globals.__WEBPACK_EXTERNAL_MODULE_react_dom__ = { createRoot };

  console.log("✅ React globals configured for UMD module loading");
}

/**
 * Enhanced loadUMDModule specifically for React components
 * Automatically sets up React globals and validates React components
 *
 * @param url - URL of the UMD module to load
 * @param options - Loading options
 * @returns Promise resolving to the loaded React component
 */
export async function loadReactUMDModule(
  url: string,
  options: {
    expectedGlobalName?: string;
    timeout?: number;
    validateComponent?: boolean;
  } = {}
) {
  // Ensure React globals are set up
  setupReactGlobals();

  const { validateComponent = true, ...loadOptions } = options;

  // Load the UMD module
  const moduleInfo = await loadUMDModule(url, loadOptions);

  // Extract the component
  let component = moduleInfo.module;

  // Try different access patterns for React components
  if (component && typeof component === "object") {
    component =
      component[options.expectedGlobalName || ""] ||
      component.default ||
      component;
  }

  // Validate it's a React component if requested
  if (validateComponent && typeof component === "function") {
    const isReactComponent =
      component.prototype?.isReactComponent || // Class component
      component.$$typeof || // Function component with React elements
      component.toString().includes("React.createElement") || // JSX
      component.toString().includes("jsx") || // JSX runtime
      component.displayName || // Named component
      component.propTypes; // PropTypes defined

    if (!isReactComponent) {
      console.warn(
        "Loaded module may not be a valid React component:",
        component
      );
    }
  }

  return {
    ...moduleInfo,
    component,
  };
}

/**
 * Load a complete React expozr with multiple components
 *
 * @param expozrUrl - URL of the expozr
 * @param componentNames - Array of component names to load, or 'all' for all components
 * @returns Promise resolving to an object with all loaded components
 */
export async function loadReactExpozr(
  expozrUrl: string,
  componentNames: string[] | "all" = "all"
) {
  // Ensure React globals are set up
  setupReactGlobals();

  // Load inventory
  const inventory = await loadExpozrInventory(expozrUrl);

  // Determine which components to load
  const cargoNames =
    componentNames === "all" ? Object.keys(inventory.cargo) : componentNames;

  // Load all components in parallel
  const loadPromises = cargoNames.map(async (cargoName) => {
    const cargo = inventory.cargo[cargoName];
    if (!cargo) {
      throw new Error(`Cargo "${cargoName}" not found in expozr`);
    }

    const moduleUrl = inventory.expozr.url.endsWith("/")
      ? `${inventory.expozr.url}${cargo.entry}`
      : `${inventory.expozr.url}/${cargo.entry}`;

    const result = await loadReactUMDModule(moduleUrl, {
      expectedGlobalName: cargoName,
    });

    return { name: cargoName, component: result.component };
  });

  const loadedComponents = await Promise.all(loadPromises);

  // Return as an object keyed by component name
  return loadedComponents.reduce(
    (acc, { name, component }) => {
      acc[name] = component;
      return acc;
    },
    {} as Record<string, React.ComponentType<any>>
  );
}
