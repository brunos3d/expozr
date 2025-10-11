// Dynamic imports for Node.js modules
declare const require: any;

import type {
  Compiler,
  Compilation,
  RuleSetRule,
  EntryObject,
  ModuleOptions,
  EntryNormalized,
} from "webpack";
import type { ExpozrConfig, Inventory, Cargo, CargoConfig } from "@expozr/core";

import {
  generateChecksum,
  timestamp,
  validateExpozrConfig,
  joinUrl,
} from "@expozr/core";

export interface ExpozrPluginOptions {
  configFile?: string;
  config?: ExpozrConfig;
  outputPath?: string;
  publicPath?: string;
}

/**
 * Webpack plugin for creating Expozr expozrs
 */
export class ExpozrPlugin {
  private options: ExpozrPluginOptions;
  private config?: ExpozrConfig;

  constructor(options: ExpozrPluginOptions = {}) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    const pluginName = ExpozrPlugin.name;

    // Helper function to setup configuration
    const setupConfig = (compiler: Compiler) => {
      try {
        this.loadConfig(compiler);
        if (this.config) {
          this.configureWebpack(compiler);
        }
      } catch (error) {
        // Log error and continue - webpack will handle the error appropriately
        console.error(`Expozr Plugin Error: ${(error as Error).message}`);
        throw error;
      }
    };

    // Load config and configure webpack for regular builds
    compiler.hooks.beforeRun.tap(pluginName, setupConfig);

    // Load config and configure webpack for watch mode (--watch)
    compiler.hooks.watchRun.tap(pluginName, setupConfig);

    // Generate inventory after compilation
    compiler.hooks.afterEmit.tapAsync(
      pluginName,
      async (compilation: Compilation, callback: (error?: Error) => void) => {
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

  private loadConfig(compiler: Compiler): void {
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
        // Use require for both JS and TS config files
        try {
          delete require.cache[configPath];
          const configModule = require(configPath);
          this.config = configModule.default || configModule;
        } catch (error) {
          throw new Error(
            `Failed to load config file ${configPath}: ${(error as Error).message}`
          );
        }
      }
    }

    if (!this.config) {
      // Look for default config files (JavaScript preferred for synchronous loading)
      const defaultConfigs = ["expozr.config.js", "expozr.config.ts"];

      for (const configFile of defaultConfigs) {
        const configPath = path.resolve(compiler.context, configFile);
        if (fs.existsSync(configPath)) {
          try {
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
      throw new Error("No Expozr expozr configuration found");
    }

    if (!validateExpozrConfig(this.config)) {
      throw new Error("Invalid expozr configuration");
    }
  }

  private configureWebpack(compiler: Compiler): void {
    if (!this.config) return;

    const path = require("path");
    const exposedModules: EntryNormalized = {};

    console.log(`🔧 Configuring webpack for Expozr "${this.config.name}"...`);
    console.log(`📦 Exposing ${Object.keys(this.config.expose).join(",")}`);

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
      compiler.options.entry = exposedModules as EntryNormalized;
    }

    if (hasExistingEntries) {
      // Merge: exposedModules first, then user entries (user entries take precedence)
      compiler.options.entry = {
        ...(exposedModules as EntryNormalized),
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
      globalObject: "typeof self !== 'undefined' ? self : this",
      publicPath: publicPath,
    };

    // Set UMD specific options using any for webpack 5 compatibility
    (compiler.options.output as any).umdNamedDefine = true;

    // Ensure TypeScript compiles to CommonJS for proper UMD generation
    // This is critical when workspace has "type": "module" packages
    if (!compiler.options.module) {
      compiler.options.module = { rules: [] } as any;
    }

    // Find and update ts-loader rule to force CommonJS output
    const tsRule = compiler.options.module.rules.find(
      (rule: any) =>
        rule &&
        typeof rule === "object" &&
        rule !== "..." &&
        rule.test &&
        rule.test.toString().includes("\\.ts")
    ) as RuleSetRule | undefined;

    if (tsRule && "use" in tsRule && tsRule.use) {
      if (typeof tsRule.use === "string" && tsRule.use.includes("ts-loader")) {
        (tsRule as any).use = {
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
        (tsRule.use as any).options = {
          ...(tsRule.use as any).options,
          compilerOptions: {
            module: "commonjs",
            target: "es5",
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            ...((tsRule.use as any).options?.compilerOptions || {}),
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
    // This applies to both expozr projects and host projects using Navigator
    if (!compiler.options.ignoreWarnings) {
      compiler.options.ignoreWarnings = [];
    }

    // Add warning suppressions for common Expozr ecosystem patterns
    const expozrWarningSuppressions = [
      (warning: Error, compilation: Compilation) => {
        const message = warning.message;
        return (
          // Navigator package dynamic imports
          (message.includes(
            "Critical dependency: the request of a dependency is an expression"
          ) &&
            message.includes("navigator/dist/index.esm.js")) ||
          // Any @expozr package dynamic imports
          (message.includes(
            "Critical dependency: the request of a dependency is an expression"
          ) &&
            message.includes("@expozr/"))
        );
      },
    ];

    compiler.options.ignoreWarnings.push(...expozrWarningSuppressions);

    console.log("✅ Webpack configured for UMD output");
  }

  private async generateInventory(
    compiler: Compiler,
    compilation: Compilation
  ): Promise<void> {
    if (!this.config) return;

    const path = require("path");
    const fs = require("fs");

    const outputPath = compilation.outputOptions.path || compiler.outputPath;
    const publicPath =
      typeof compilation.outputOptions.publicPath === "string"
        ? compilation.outputOptions.publicPath
        : "/";

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
        entry: assetName, // Just the filename, publicPath is in expozr.url
        exports: config.exports,
        dependencies: config.dependencies || {},
        metadata: config.metadata || {},
      };
    }

    // Create inventory
    const inventory: Inventory = {
      expozr: {
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
      `🚚 Expozr "${this.config.name}" ready with ${Object.keys(cargo).length} cargo`
    );
  }

  private findCompiledAsset(
    compilation: Compilation,
    entryName: string
  ): string {
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
