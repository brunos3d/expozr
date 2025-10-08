/**
 * @expozr/webpack-adapter - Webpack adapter for the Expozr ecosystem
 */

// Main adapter
export { WebpackAdapter, webpackAdapter } from './adapter';

// Plugins
export { ExpozrWarehousePlugin, ExpozrHostPlugin } from './adapter';

// Convenience functions
export { createWarehousePlugin, createHostPlugin } from './adapter';

// Version
export const VERSION = '0.1.0';