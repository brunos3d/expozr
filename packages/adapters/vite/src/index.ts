/**
 * @expozr/vite-adapter - Vite adapter for the Expozr ecosystem
 */

// Main adapter
export { ViteAdapter, viteAdapter } from "./adapter";

// Plugins
export { expozrWarehouse, expozrHost } from "./plugins";

// Convenience functions
export { createExpozrPlugin, createHostPlugin } from "./plugins";
