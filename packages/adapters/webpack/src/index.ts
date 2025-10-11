/**
 * @expozr/webpack-adapter - Webpack adapter for the Expozr ecosystem
 */

// Main adapter
export { WebpackAdapter, webpackAdapter } from "./adapter";

// Plugins
export { ExpozrPlugin, ExpozrHostPlugin } from "./adapter";

// Convenience functions
export { createExpozrPlugin, createHostPlugin } from "./adapter";

// Utilities for cleaner webpack configs
export { suppressExpozrWarnings } from "./utils";
