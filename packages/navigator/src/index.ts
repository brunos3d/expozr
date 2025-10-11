/**
 * @expozr/navigator - Universal runtime loader for the Expozr ecosystem
 */

// Enhanced navigator with module system support
export {
  Navigator,
  createNavigator,
  ExpozrNavigator,
} from "./enhanced-navigator";

// Legacy navigator (for backward compatibility)
export { Navigator as LegacyNavigator } from "./navigator";

// Cache implementations
export {
  MemoryCache,
  LocalStorageCache,
  IndexedDBCache,
  NoCache,
  createCache,
} from "./cache";

// Module loaders (legacy)
export {
  BrowserModuleLoader,
  NodeModuleLoader,
  UniversalModuleLoader,
} from "./loader";

// UMD module loader utilities
export {
  loadUMDModule,
  loadExpozrInventory,
  loadCargo as loadCargoUMD,
  type UMDLoadOptions,
  type UMDModuleInfo,
} from "./umd-loader";

// Convenience function for loading modules
export { loadCargo } from "./load-cargo";

// Auto-loader for simplified UMD module consumption
export {
  createAutoLoader,
  waitForReady,
  callRemoteFunction,
  type AutoLoaderConfig,
  type LoadedModule,
  type LoaderContext,
} from "./auto-loader";
