/**
 * @expozr/navigator - Universal runtime loader for the Expozr ecosystem
 */

// === Main Navigator API ===
export { createNavigator, createExpozrNavigator } from "./navigators";
export {
  BaseExpozrNavigator,
  ExpozrNavigator,
} from "./navigators";

// === Cache System ===
export {
  MemoryCache,
  LocalStorageCache,
  IndexedDBCache,
  NoCache,
} from "./cache";
export { createCache } from "./cache";

// === Module Loaders ===
export {
  BrowserModuleLoader,
  NodeModuleLoader,
  UniversalModuleLoader,
} from "./loaders";

// === UMD Module Utilities ===
export {
  loadUMDModule,
  loadExpozrInventory,
  loadCargo as loadCargoUMD,
} from "./loaders/umd-loader";

// === Utility Functions ===
export { SimpleEventEmitter } from "./utils";
export { isValidModule, normalizeUMDModule, extractFunctions } from "./utils";
export { normalizeUrl } from "./utils";
export { waitForCondition } from "./utils";

// === Auto-Loader System ===
export {
  createAutoLoader,
  waitForReady,
  callRemoteFunction,
  getAvailableFunctions,
  getAvailableModules,
  getModule,
  hasFunction,
  createFunctionProxy,
} from "./auto-loader";

// === Type Definitions ===
export type {
  // Core types
  NavigatorConfig,
  LoaderContext,
  LoadedModule,

  // Auto-loader types
  AutoLoaderConfig,

  // UMD types
  UMDLoadOptions,
  UMDModuleInfo,

  // Loader types
  ModuleLoader,
} from "./types";
