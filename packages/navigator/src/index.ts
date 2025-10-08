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

// Convenience function for loading modules
export { loadCargo } from "./load-cargo";

// Version
export const VERSION = "0.1.0";
