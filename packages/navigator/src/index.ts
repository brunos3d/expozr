/**
 * @expozr/navigator - Universal runtime loader for the Expozr ecosystem
 */

// Main navigator
export { Navigator } from "./navigator";

// Cache implementations
export {
  MemoryCache,
  LocalStorageCache,
  IndexedDBCache,
  NoCache,
  createCache,
} from "./cache";

// Module loaders
export {
  BrowserModuleLoader,
  NodeModuleLoader,
  UniversalModuleLoader,
} from "./loader";

// UMD module loader utilities
export {
  loadUMDModule,
  loadWarehouseInventory,
  loadCargo as loadCargoUMD,
  type UMDLoadOptions,
  type UMDModuleInfo,
} from "./umd-loader";

// Convenience function for loading modules
export { loadCargo } from "./load-cargo";
