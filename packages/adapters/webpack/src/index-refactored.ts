/**
 * @expozr/webpack-adapter - Webpack adapter for the Expozr ecosystem
 *
 * This package provides comprehensive webpack integration for Expozr warehouses and hosts,
 * with support for multiple module formats, TypeScript, and development optimizations.
 */

// Main adapter (refactored version)
export { WebpackAdapter, webpackAdapter } from "./adapter-refactored";

// Plugins (refactored versions)
export { ExpozrPlugin } from "./expozr-plugin-refactored";
export { ExpozrHostPlugin } from "./host-plugin-refactored";

// Convenience functions
export {
  createExpozrPlugin,
  createHostPlugin,
  createHostWebpackConfig,
} from "./adapter-refactored";

// Utilities for cleaner webpack configs
export { suppressExpozrWarnings } from "./utils";

// Legacy exports for backward compatibility
export { ExpozrPlugin as LegacyExpozrPlugin } from "./expozr-plugin";
export { ExpozrHostPlugin as LegacyExpozrHostPlugin } from "./host-plugin";
