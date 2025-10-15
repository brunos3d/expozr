/**
 * Vite plugin for Expozr remotes - Using old plugin logic with SDK utilities
 */

import type { Plugin } from "vite";
import type { ExpozrConfig } from "@expozr/core";
import { ValidationUtils, InventoryGenerator } from "@expozr/core";
import { loadExpozrConfigSync, INVENTORY_FILE_NAME } from "@expozr/adapter-sdk";
import * as path from "path";
import * as fs from "fs";

export interface ExpozrPluginOptions {
  configFile?: string;
  config?: ExpozrConfig;
}

export function expozr(options: ExpozrPluginOptions = {}): Plugin {
  let config: ExpozrConfig | undefined;
  let inventory: any = null;

  return {
    name: "expozr",

    configResolved(resolvedConfig: any) {
      // Load expozr configuration using SDK
      if (options.config) {
        config = options.config;
      } else {
        try {
          const result = loadExpozrConfigSync({
            configFile: options.configFile,
          });
          config = result.config;
        } catch (error) {
          console.warn("Could not load expozr config:", error);
          return;
        }
      }

      if (!config || !ValidationUtils.validateExpozrConfig(config)) {
        console.warn("Invalid expozr configuration");
        return;
      }
    },

    async buildStart() {
      // Generate inventory for development mode using core utility
      if (config) {
        try {
          inventory = await InventoryGenerator.generate(config);

          // Override module system for Vite development (ESM)
          if (inventory.cargo) {
            for (const cargoKey in inventory.cargo) {
              // Vite development serves ESM modules
              inventory.cargo[cargoKey].moduleSystem = "esm";
              // Update entry to .mjs for development
              if (inventory.cargo[cargoKey].entry.endsWith(".js")) {
                inventory.cargo[cargoKey].entry = inventory.cargo[
                  cargoKey
                ].entry.replace(".js", ".mjs");
              }
            }
          }
        } catch (error) {
          console.error("Failed to generate expozr inventory:", error);
        }
      }
    },

    configureServer(server: any) {
      // Serve inventory during development
      server.middlewares.use(
        `/${INVENTORY_FILE_NAME}`,
        (req: any, res: any) => {
          if (inventory) {
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(JSON.stringify(inventory, null, 2));
          } else {
            res.statusCode = 404;
            res.end("Inventory not available");
          }
        }
      );

      // Serve the actual component files for development (old plugin logic)
      if (config) {
        for (const [cargoName, cargoConfig] of Object.entries(config.expose)) {
          const entryPath =
            typeof cargoConfig === "string" ? cargoConfig : cargoConfig.entry;

          // Serve the built module file
          const moduleUrl = `/${cargoName.replace("./", "")}.mjs`;

          server.middlewares.use(moduleUrl, async (req: any, res: any) => {
            try {
              // Create a simple export module (old plugin approach)
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
        // Generate inventory after build using core utility
        const buildInventory = await InventoryGenerator.generate(config);

        // Write inventory file
        const inventoryPath = path.join(
          options.dir || "dist",
          INVENTORY_FILE_NAME
        );

        await fs.promises.writeFile(
          inventoryPath,
          JSON.stringify(buildInventory, null, 2),
          "utf-8"
        );
      } catch (error) {
        console.error("Failed to generate expozr inventory:", error);
      }
    },
  };
}

export default expozr;
