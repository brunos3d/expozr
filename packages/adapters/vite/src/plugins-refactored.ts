/**
 * Vite plugins for Expozr ecosystem
 *
 * These plugins provide seamless integration with Vite for both warehouse
 * and host applications, handling configuration, inventory generation,
 * and development server optimizations.
 */

import type { ExpozrConfig, HostConfig } from "@expozr/core";
import { ValidationUtils } from "@expozr/core";
import { ViteAdapter } from "./adapter-refactored";

// Import utilities from the shared SDK (will be enabled after SDK is built)
// import {
//   loadExpozrConfig,
//   loadHostConfig,
//   INVENTORY_FILE_NAME,
//   BaseExpozrPlugin,
//   BaseHostPlugin,
// } from "@expozr/adapter-sdk";

/**
 * Vite plugin for creating Expozr warehouses
 *
 * Features:
 * - Automatic configuration loading
 * - Library mode setup
 * - Inventory generation
 * - Development server integration
 */
export function expozrWarehouse(
  options: {
    configFile?: string;
    config?: ExpozrConfig;
  } = {}
): any {
  let config: ExpozrConfig | undefined;
  const adapter = new ViteAdapter();
  let inventory: any = null;

  return {
    name: "expozr-warehouse",

    configResolved(resolvedConfig: any) {
      // Load Expozr configuration
      if (options.config) {
        config = options.config;
      } else {
        try {
          config = loadConfig(options.configFile);
        } catch (error) {
          console.warn(
            "⚠️  Could not load Expozr config:",
            (error as Error).message
          );
          return;
        }
      }

      if (!config || !ValidationUtils.validateExpozrConfig(config)) {
        console.warn("⚠️  Invalid Expozr configuration");
        return;
      }

      console.log(`🔧 Configuring Vite for Expozr warehouse "${config.name}"`);

      // Configure Vite with Expozr settings
      const expozrConfig = adapter.configureExpozr(config, resolvedConfig);

      // Merge configurations carefully to avoid conflicts
      Object.assign(resolvedConfig, {
        ...expozrConfig,
        build: {
          ...resolvedConfig.build,
          ...expozrConfig.build,
        },
      });

      console.log(
        `✅ Vite configured for warehouse with ${Object.keys(config.expose).length} modules`
      );
    },

    async buildStart() {
      // Generate inventory for development mode
      if (config) {
        try {
          inventory = await adapter.generateInventory(config);
        } catch (error) {
          console.warn(
            "⚠️  Failed to generate inventory:",
            (error as Error).message
          );
        }
      }
    },

    configureServer(server: any) {
      // Serve inventory during development
      server.middlewares.use("/expozr.inventory.json", (req: any, res: any) => {
        if (inventory) {
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end(JSON.stringify(inventory, null, 2));
        } else {
          res.statusCode = 404;
          res.end("Inventory not available");
        }
      });

      // Serve the actual component files for development
      if (config) {
        for (const [cargoName, cargoConfig] of Object.entries(config.expose)) {
          const cleanName = cargoName.startsWith("./")
            ? cargoName.slice(2)
            : cargoName;

          server.middlewares.use(
            `/${cleanName}.js`,
            (req: any, res: any, next: any) => {
              // In development, modules are served by Vite's built-in dev server
              // This middleware just ensures proper CORS headers
              res.setHeader("Access-Control-Allow-Origin", "*");
              next();
            }
          );
        }
      }

      console.log("🌐 Expozr development server configured");
    },

    async writeBundle(options: any, bundle: any) {
      if (!config) return;

      try {
        console.log("📋 Generating Expozr inventory...");

        // Generate inventory after build
        const buildInventory = await adapter.generateInventory(config);

        // Write inventory file
        const fs = await import("fs/promises");
        const path = await import("path");

        const inventoryPath = path.join(
          options.dir || "dist",
          "expozr.inventory.json"
        );

        await fs.writeFile(
          inventoryPath,
          JSON.stringify(buildInventory, null, 2),
          "utf-8"
        );

        console.log(`✅ Expozr inventory generated: ${inventoryPath}`);
        console.log(
          `🚚 Warehouse "${config.name}" ready with ${Object.keys(buildInventory.cargo).length} cargo modules`
        );
      } catch (error) {
        console.error("❌ Failed to generate Expozr inventory:", error);
      }
    },
  };
}

/**
 * Vite plugin for Expozr hosts
 *
 * Features:
 * - Host configuration setup
 * - External module mapping
 * - Warehouse module aliases
 * - Development optimizations
 */
export function expozrHost(
  options: {
    config?: HostConfig;
  } = {}
): any {
  const adapter = new ViteAdapter();

  return {
    name: "expozr-host",

    configResolved(resolvedConfig: any) {
      if (!options.config) {
        console.warn("⚠️  No host configuration provided");
        return;
      }

      console.log(`🏠 Configuring Vite for Expozr host`);

      // Configure Vite for host
      const hostConfig = adapter.configureHost(options.config, resolvedConfig);

      // Merge configurations
      Object.assign(resolvedConfig, {
        ...hostConfig,
        build: {
          ...resolvedConfig.build,
          ...hostConfig.build,
        },
        resolve: {
          ...resolvedConfig.resolve,
          ...hostConfig.resolve,
        },
      });

      console.log(
        `✅ Host configured for ${Object.keys(options.config.expozrs).length} warehouses`
      );
    },

    configureServer(server: any) {
      // Setup CORS for warehouse consumption
      server.middlewares.use((req: any, res: any, next: any) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          "X-Requested-With, content-type, Authorization"
        );
        next();
      });

      console.log("🌐 Expozr host development server configured");
    },
  };
}

/**
 * Load config file (similar to webpack plugin approach)
 */
function loadConfig(configFile?: string): ExpozrConfig | undefined {
  const path = require("path");
  const fs = require("fs");

  if (configFile) {
    const configPath = path.resolve(process.cwd(), configFile);
    if (fs.existsSync(configPath)) {
      try {
        delete require.cache[configPath];
        const configModule = require(configPath);
        return configModule.default || configModule;
      } catch (error) {
        throw new Error(
          `Failed to load config file ${configPath}: ${(error as Error).message}`
        );
      }
    }
  }

  // Look for default config files
  const defaultConfigs = [
    "expozr.config.ts",
    "expozr.config.js",
    "expozr.config.mjs",
    "expozr.config.cjs",
  ];

  for (const configFileName of defaultConfigs) {
    const configPath = path.resolve(process.cwd(), configFileName);
    if (fs.existsSync(configPath)) {
      try {
        delete require.cache[configPath];
        const configModule = require(configPath);
        console.log(`📋 Loaded Expozr config from ${configFileName}`);
        return configModule.default || configModule;
      } catch (error) {
        console.warn(
          `⚠️  Failed to load ${configFileName}:`,
          (error as Error).message
        );
      }
    }
  }

  return undefined;
}

/**
 * Convenience function to create warehouse plugin with automatic config discovery
 */
export function createExpozrPlugin(
  options: {
    configFile?: string;
    config?: ExpozrConfig;
  } = {}
): any {
  return expozrWarehouse(options);
}

/**
 * Convenience function to create host plugin
 */
export function createHostPlugin(
  options: {
    config?: HostConfig;
  } = {}
): any {
  return expozrHost(options);
}
