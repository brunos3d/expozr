/**
 * @expozr/vite-adapter - Vite adapter for the Expozr ecosystem
 *
 * This package provides comprehensive Vite integration for Expozr warehouses and hosts,
 * with support for multiple module formats and development optimizations.
 */

// Main adapter (refactored version)
export { ViteAdapter, viteAdapter } from "./adapter-refactored";

// Plugins (refactored versions)
export { expozrWarehouse, expozrHost } from "./plugins-refactored";

// Convenience functions
export { createExpozrPlugin, createHostPlugin } from "./plugins-refactored";

// Legacy exports for backward compatibility
export { ViteAdapter as LegacyViteAdapter } from "./adapter";
export {
  expozrWarehouse as legacyExpozrWarehouse,
  expozrHost as legacyExpozrHost,
} from "./plugins";
