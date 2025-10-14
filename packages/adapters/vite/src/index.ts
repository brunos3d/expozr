/**
 * @expozr/vite-adapter
 *
 * Vite integration for the Expozr module federation ecosystem.
 *
 * This adapter provides comprehensive support for:
 * - Expozr builds with multiple module formats
 * - Host application configuration for remote consumption
 * - Development server integration with hot reloading
 * - Inventory generation and serving
 * - CORS and security configuration
 *
 * @example Expozr Usage
 * ```typescript
 * import { defineConfig } from 'vite';
 * import { expozr } from '@expozr/vite-adapter';
 *
 * export default defineConfig({
 *   plugins: [
 *     expozr({
 *       configPath: './expozr.config.ts', // (optional, defaults to './expozr.config.ts')
 *       development: true,
 *     }),
 *   ],
 * });
 * ```
 *
 * @example Host Usage
 * ```typescript
 * import { defineConfig } from 'vite';
 * import { expozrHost } from '@expozr/vite-adapter';
 *
 * export default defineConfig({
 *   plugins: [
 *     expozrHost({
 *       hostConfig: {
 *         expozrs: {
 *           'my-expozr': {
 *             url: 'http://localhost:3001',
 *           },
 *         },
 *       },
 *     }),
 *   ],
 * });
 * ```
 */

// Vite plugins
export { expozr, type ExpozrPluginOptions } from "./plugins";
export { expozrHost, type HostPluginOptions } from "./plugins";

// Re-export useful SDK utilities
export {
  loadExpozrConfigSync,
  loadHostConfigSync,
  INVENTORY_FILE_NAME,
  createViteExternals,
  createViteHostExternals,
} from "@expozr/adapter-sdk";

// Type exports for TypeScript users
export type {
  ExpozrConfig,
  HostConfig,
  ModuleFormat,
  ModuleSystemConfig,
} from "@expozr/core";
