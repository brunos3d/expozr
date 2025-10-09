// Dynamic imports for Node.js modules
declare const require: any;

import type {
  WarehouseConfig,
  Inventory,
  Cargo,
  CargoConfig,
} from "@expozr/core";

import {
  generateChecksum,
  timestamp,
  validateWarehouseConfig,
  joinUrl,
} from "@expozr/core";

export interface WarehousePluginOptions {
  configFile?: string;
  config?: WarehouseConfig;
  outputPath?: string;
  publicPath?: string;
}

/**
 * Webpack plugin for creating Expozr warehouses
 */
export class ExpozrWarehousePlugin {
  private options: WarehousePluginOptions;
  private config?: WarehouseConfig;

  constructor(options: WarehousePluginOptions = {}) {
    this.options = options;
  }

  apply(compiler: any): void {
    const pluginName = ExpozrWarehousePlugin.name;

    // Helper function to setup configuration
    const setupConfig = async (compiler: any, callback: any) => {
      try {
        await this.loadConfig(compiler);
        if (this.config) {
          this.configureWebpack(compiler);
        }
        callback();
      } catch (error) {
        callback(error as Error);
      }
    };

    // Load config and configure webpack for regular builds
    compiler.hooks.beforeRun.tapAsync(pluginName, setupConfig);

    // Load config and configure webpack for watch mode (--watch)
    compiler.hooks.watchRun.tapAsync(pluginName, setupConfig);

    // Generate inventory after compilation
    compiler.hooks.afterEmit.tapAsync(
      pluginName,
      async (compilation: any, callback: any) => {
        try {
          if (this.config) {
            await this.generateInventory(compiler, compilation);
          }
          callback();
        } catch (error) {
          callback(error as Error);
        }
      }
    );
  }

  private async loadConfig(compiler: any): Promise<void> {
    const path = require("path");
    const fs = require("fs");

    if (this.options.config) {
      this.config = this.options.config;
      return;
    }

    if (this.options.configFile) {
      const configPath = path.resolve(
        compiler.context,
        this.options.configFile
      );

      if (fs.existsSync(configPath)) {
        // Dynamic import for ESM/TypeScript config files
        try {
          const configModule = await import(configPath);
          this.config = configModule.default || configModule;
        } catch {
          // Fallback to require for CommonJS
          delete require.cache[configPath];
          this.config = require(configPath);
        }
      }
    }

    if (!this.config) {
      // Look for default config files (TypeScript preferred)
      const defaultConfigs = ["expozr.config.ts", "expozr.config.js"];

      for (const configFile of defaultConfigs) {
        const configPath = path.resolve(compiler.context, configFile);
        if (fs.existsSync(configPath)) {
          try {
            // For TypeScript files, try to require the compiled JS version
            // or use ts-node if available, otherwise fall back to require
            delete require.cache[configPath];
            const configModule = require(configPath);
            this.config = configModule.default || configModule;
            break;
          } catch (error) {
            console.warn(
              `Failed to load ${configFile}:`,
              (error as Error).message
            );
          }
        }
      }
    }

    if (!this.config) {
      throw new Error("No Expozr warehouse configuration found");
    }

    if (!validateWarehouseConfig(this.config)) {
      throw new Error("Invalid warehouse configuration");
    }
  }

  private configureWebpack(compiler: any): void {
    if (!this.config) return;

    const path = require("path");
    const exposedModules: Record<string, string> = {};

    // Convert expose configuration to webpack entries
    for (const [name, cargoConfig] of Object.entries(this.config.expose)) {
      const entryPoint =
        typeof cargoConfig === "string"
          ? cargoConfig
          : (cargoConfig as CargoConfig).entry;

      // Remove the ./ prefix for cleaner naming
      const cleanName = name.startsWith("./") ? name.slice(2) : name;
      exposedModules[cleanName] = path.resolve(compiler.context, entryPoint);
    }

    // Merge entries: start with exposedModules from expozr.config.ts, then override with user-defined entries
    const existingEntries = compiler.options.entry || {};
    const hasExistingEntries =
      Object.keys(existingEntries).length > 0 &&
      !Object.keys(existingEntries).every((key) => key === "");

    if (exposedModules && Object.keys(exposedModules).length > 0) {
      compiler.options.entry = exposedModules;
    }

    if (hasExistingEntries) {
      // Merge: exposedModules first, then user entries (user entries take precedence)
      compiler.options.entry = {
        ...exposedModules,
        ...existingEntries,
      };

      console.log(
        `📦 Merged entries: ${Object.keys(exposedModules).length} from expozr.config.ts + ${Object.keys(existingEntries).length} custom entries`
      );
    }

    // Force webpack mode to 'none' to prevent CLI overrides that break UMD
    compiler.options.mode = "none";
    compiler.options.target = "web";

    const outputPath =
      this.options.outputPath || this.config.build?.outDir || "dist";
    const publicPath =
      this.options.publicPath || this.config.build?.publicPath || "/";

    // Configure output for UMD (compatible with our loading approach)
    compiler.options.output = {
      ...compiler.options.output,
      path: path.resolve(compiler.context, outputPath),
      filename: "[name].js",
      library: {
        name: "[name]",
        type: "umd",
        export: "default",
      },
      umdNamedDefine: true,
      globalObject: "typeof self !== 'undefined' ? self : this",
      publicPath: publicPath,
    };

    // Ensure TypeScript compiles to CommonJS for proper UMD generation
    // This is critical when workspace has "type": "module" packages
    if (!compiler.options.module) {
      compiler.options.module = { rules: [] };
    }

    // Find and update ts-loader rule to force CommonJS output
    const tsRule = compiler.options.module.rules.find(
      (rule: any) => rule.test && rule.test.toString().includes("\\.ts")
    );

    if (tsRule && tsRule.use) {
      if (typeof tsRule.use === "string" && tsRule.use.includes("ts-loader")) {
        tsRule.use = {
          loader: tsRule.use,
          options: {
            compilerOptions: {
              module: "commonjs",
              target: "es5", // Ensure compatibility
              esModuleInterop: true,
              allowSyntheticDefaultImports: true,
            },
          },
        };
      } else if (typeof tsRule.use === "object" && !Array.isArray(tsRule.use)) {
        tsRule.use.options = {
          ...tsRule.use.options,
          compilerOptions: {
            module: "commonjs",
            target: "es5",
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            ...(tsRule.use.options?.compilerOptions || {}),
          },
        };
      }
    }

    // Disable optimizations that interfere with UMD and force CommonJS compilation
    compiler.options.optimization = {
      ...compiler.options.optimization,
      minimize: false,
      concatenateModules: false,
      usedExports: false,
      sideEffects: false,
      providedExports: false,
      splitChunks: false,
      runtimeChunk: false,
    };

    // Explicitly disable ES modules to prevent "type": "module" interference
    if (!compiler.options.experiments) {
      compiler.options.experiments = {};
    }
    compiler.options.experiments.outputModule = false;

    // Force webpack to output in a non-ES module environment
    compiler.options.output.environment = {
      ...compiler.options.output.environment,
      module: false,
      dynamicImport: false,
      arrowFunction: true,
    };

    // Configure devServer for CORS if it exists
    if (compiler.options.devServer) {
      compiler.options.devServer.headers = {
        "Access-Control-Allow-Origin": "*",
        ...compiler.options.devServer.headers,
      };
    }

    // Suppress Navigator dynamic import warnings for better DX
    // This applies to both warehouse projects and host projects using Navigator
    if (!compiler.options.ignoreWarnings) {
      compiler.options.ignoreWarnings = [];
    }

    // Add warning suppressions for common Expozr ecosystem patterns
    const expozrWarningSuppressions = [
      {
        // Navigator package dynamic imports
        module: /navigator\/dist\/index\.esm\.js/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
      {
        // Any @expozr package dynamic imports
        module: /@expozr\/.*\/dist\/.*\.js/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    compiler.options.ignoreWarnings.push(...expozrWarningSuppressions);

    console.log("✅ Webpack configured for UMD output");
  }

  private async generateInventory(
    compiler: any,
    compilation: any
  ): Promise<void> {
    if (!this.config) return;

    const path = require("path");
    const fs = require("fs");

    const outputPath = compilation.outputOptions.path || compiler.outputPath;
    const publicPath = compilation.outputOptions.publicPath || "/";

    // Generate cargo entries
    const cargo: Record<string, Cargo> = {};

    for (const [name, cargoConfig] of Object.entries(this.config.expose)) {
      const config =
        typeof cargoConfig === "string"
          ? ({ entry: cargoConfig } as CargoConfig)
          : (cargoConfig as CargoConfig);

      // Remove the ./ prefix for cleaner naming
      const cleanName = name.startsWith("./") ? name.slice(2) : name;

      // Find the compiled asset
      const assetName = this.findCompiledAsset(compilation, cleanName);

      cargo[cleanName] = {
        name: cleanName,
        version: this.config.version,
        entry: assetName, // Just the filename, publicPath is in warehouse.url
        exports: config.exports,
        dependencies: config.dependencies || {},
        metadata: config.metadata || {},
      };
    }

    // Create inventory
    const inventory: Inventory = {
      warehouse: {
        name: this.config.name,
        version: this.config.version,
        url: publicPath,
        description: this.config.metadata?.description,
        author: this.config.metadata?.author,
      },
      cargo,
      dependencies: this.config.dependencies || {},
      timestamp: timestamp(),
      checksum: await generateChecksum({
        cargo,
        dependencies: this.config.dependencies,
      }),
    };

    // Write inventory file
    const inventoryPath = path.join(outputPath, "expozr.inventory.json");
    const inventoryContent = JSON.stringify(inventory, null, 2);

    await fs.promises.writeFile(inventoryPath, inventoryContent, "utf8");

    console.log(`📦 Expozr inventory generated: ${inventoryPath}`);
    console.log(
      `🚚 Warehouse "${this.config.name}" ready with ${Object.keys(cargo).length} cargo`
    );
  }

  private findCompiledAsset(compilation: any, entryName: string): string {
    // Look for the compiled asset for this entry
    const entrypoints = compilation.entrypoints;
    const entrypoint = entrypoints.get(entryName);

    if (entrypoint) {
      const files = entrypoint.getFiles();
      // Find the main JS file (not source map)
      const mainFile = files.find(
        (file: string) => file.endsWith(".js") && !file.endsWith(".map")
      );
      if (mainFile) {
        return mainFile;
      }
    }

    // Fallback: construct expected filename
    return `${entryName}.js`;
  }
}
