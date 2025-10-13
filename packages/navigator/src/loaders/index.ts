/**
 * Module loader exports for the Navigator package
 */

// Core loader implementations
import { BrowserModuleLoader } from "./browser-loader";
import { NodeModuleLoader } from "./node-loader";
import { UniversalModuleLoader } from "./universal-loader";

export { BrowserModuleLoader, NodeModuleLoader, UniversalModuleLoader };

// UMD-specific loading utilities
export {
  loadUMDModule,
  loadExpozrInventory,
  loadCargo as loadCargoUMD,
} from "./umd-loader";

// Legacy exports for backward compatibility
export {
  BrowserModuleLoader as BrowserLoader,
  NodeModuleLoader as NodeLoader,
  UniversalModuleLoader as UniversalLoader,
};

/**
 * Create a module loader based on environment detection
 * @returns Universal module loader instance
 */
export function createModuleLoader(): UniversalModuleLoader {
  return new UniversalModuleLoader();
}

/**
 * Create a browser-specific module loader
 * @returns Browser module loader instance
 */
export function createBrowserLoader(): BrowserModuleLoader {
  return new BrowserModuleLoader();
}

/**
 * Create a Node.js-specific module loader
 * @returns Node.js module loader instance
 */
export function createNodeLoader(): NodeModuleLoader {
  return new NodeModuleLoader();
}
