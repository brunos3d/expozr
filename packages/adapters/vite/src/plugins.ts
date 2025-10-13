/**
 * Vite plugins for Expozr ecosystem
 */

import {
  ValidationUtils,
  type ExpozrConfig,
  type HostConfig,
} from "@expozr/core";
import { ViteAdapter } from "./adapter";

/**
 * Vite plugin for creating Expozr warehouses
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
      // Load expozr configuration
      if (options.config) {
        config = options.config;
      } else {
        try {
          config = loadConfig(options.configFile);
        } catch (error) {
          console.warn("Could not load expozr config:", error);
          return;
        }
      }

      if (!config || !ValidationUtils.validateExpozrConfig(config)) {
        console.warn("Invalid expozr configuration");
        return;
      }

      // Configure Vite with expozr settings
      const expozrConfig = adapter.configureExpozr(config, resolvedConfig);

      // Merge configurations
      Object.assign(resolvedConfig, expozrConfig);
    },

    async buildStart() {
      // Generate inventory for development mode
      if (config) {
        try {
          inventory = await adapter.generateInventory(config);
          console.log(`📦 Expozr inventory prepared for development`);
        } catch (error) {
          console.error("Failed to generate expozr inventory:", error);
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
          const entryPath =
            typeof cargoConfig === "string" ? cargoConfig : cargoConfig.entry;

          // Serve the built module file
          const moduleUrl = `/${cargoName.replace("./", "")}.mjs`;

          server.middlewares.use(moduleUrl, async (req: any, res: any) => {
            try {
              // Create a simple export module
              const moduleContent = `export * from '${entryPath}';`;

              res.setHeader("Content-Type", "application/javascript");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(moduleContent);
            } catch (error) {
              console.error("Error serving module:", error);
              res.statusCode = 500;
              res.end(`Error loading module: ${error}`);
            }
          });
        }
      }
    },

    async writeBundle(options: any, bundle: any) {
      if (!config) return;

      try {
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

        console.log(`📦 Expozr inventory generated: ${inventoryPath}`);
      } catch (error) {
        console.error("Failed to generate expozr inventory:", error);
      }
    },
  };
}

/**
 * Vite plugin for Expozr hosts
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
      if (!options.config) return;

      // Configure Vite for host
      const hostConfig = adapter.configureHost(options.config, resolvedConfig);

      // Merge configurations
      Object.assign(resolvedConfig, hostConfig);
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
  const defaultConfigs = ["expozr.config.ts", "expozr.config.js"];

  for (const configFileName of defaultConfigs) {
    const configPath = path.resolve(process.cwd(), configFileName);
    if (fs.existsSync(configPath)) {
      try {
        delete require.cache[configPath];
        const configModule = require(configPath);
        return configModule.default || configModule;
      } catch (error) {
        console.warn(
          `Failed to load ${configFileName}:`,
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
