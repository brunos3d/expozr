/**
 * Webpack plugin for Expozr remotes
 *
 * This plugin handles:
 * - Loading and validating Expozr configuration
 * - Configuring webpack for UMD output (compatible with Navigator)
 * - Generating inventory files for module discovery
 * - TypeScript configuration optimization
 * - Development and production build support
 */

import { isPromise } from "util/types";

import { ValidationUtils, InventoryGenerator } from "@expozr/core";
import { loadExpozrConfigSync, INVENTORY_FILE_NAME } from "@expozr/adapter-sdk";
import type { ExpozrConfig, Inventory, Cargo, CargoConfig } from "@expozr/core";
import type {
  Compiler,
  Compilation,
  RuleSetRule,
  EntryObject,
  EntryNormalized,
  Configuration as WebpackConfiguration,
} from "webpack";

export interface ExpozrPluginOptions {
  /** Path to expozr config file */
  configFile?: string;
  /** Direct config object (overrides configFile) */
  config?: ExpozrConfig;
  /** Custom output path (overrides config) */
  outputPath?: string;
  /** Custom public path (overrides config) */
  publicPath?: string;
  /** Whether to automatically configure webpack config.entry (default: true) */
  configureEntries?: boolean;
  /** Whether to apply UMD output configuration (default: true) */
  configureUMDOutput?: boolean;
  /** Whether to configure TypeScript compilation (default: true) */
  configureTypescript?: boolean;
  /** Whether to configure optimizations (default: true) */
  configureOptimizations?: boolean;
  /** Whether to configure development server for CORS (default: true) */
  configureDevServer?: boolean;
}
export const DEFAULT_EXPOZR_PLUGIN_OPTIONS: ExpozrPluginOptions = {
  configureEntries: true,
  configureUMDOutput: true,
  configureTypescript: true,
  configureOptimizations: true,
  configureDevServer: true,
};

/**
 * Webpack plugin for creating Expozr remotes
 */
export class ExpozrPlugin {
  private options: ExpozrPluginOptions;
  private config?: ExpozrConfig;

  constructor(options: ExpozrPluginOptions = DEFAULT_EXPOZR_PLUGIN_OPTIONS) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    const pluginName = "ExpozrPlugin";

    // Setup configuration
    const setupConfig = (compiler: Compiler) => {
      try {
        this.loadConfig(compiler);
        if (this.config) {
          this.configureWebpack(compiler);
        }
      } catch (error) {
        console.error(`[${pluginName}] Configuration error:`, error);
      }
    };

    // Load config for different compilation modes
    compiler.hooks.beforeRun.tap(pluginName, setupConfig);
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

  /**
   * Load Expozr configuration from various sources
   */
  private loadConfig(compiler: Compiler): void {
    // Use provided config directly
    if (this.options.config) {
      this.config = this.options.config;
      return;
    }

    // Load from SDK with automatic file discovery
    try {
      const result = loadExpozrConfigSync({
        configFile: this.options.configFile,
      });
      this.config = result.config;
    } catch (error) {
      throw new Error(`Failed to load Expozr configuration: ${error}`);
    }

    // Validate configuration
    if (!this.config || !ValidationUtils.validateExpozrConfig(this.config)) {
      throw new Error("Invalid Expozr configuration");
    }
  }

  /**
   * Configure webpack for Expozr builds
   */
  private configureWebpack(compiler: Compiler): void {
    if (!this.config) return;

    if (this.options.configureEntries) {
      // Create webpack entries from expose configuration
      const exposedModules = this.createWebpackEntries();
      this.mergeEntries(compiler, exposedModules);
    }
    if (this.options.configureUMDOutput) {
      // Configure UMD output for Navigator compatibility
      this.configureUMDOutput(compiler);
    }
    if (this.options.configureTypescript) {
      // Configure TypeScript compilation
      this.configureTypeScript(compiler);
    }
    if (this.options.configureOptimizations) {
      // Configure optimizations
      this.configureOptimizations(compiler);
    }
    if (this.options.configureDevServer) {
      // Configure development server
      this.configureDevServer(compiler);
    }
  }

  /**
   * Create webpack entry points from expose configuration
   */
  private createWebpackEntries(): EntryNormalized | null {
    const exposedModules: EntryNormalized = {};

    for (const [name, cargoConfig] of Object.entries(this.config!.expose)) {
      const entry =
        typeof cargoConfig === "string" ? cargoConfig : cargoConfig.entry;

      const dependOn =
        typeof cargoConfig === "string" ||
        typeof cargoConfig.dependOn === "string"
          ? undefined
          : cargoConfig.dependOn;

      // Clean name (remove ./ prefix)
      const cleanName = name.startsWith("./") ? name.slice(2) : name;
      exposedModules[cleanName] = {
        import: [entry],
        dependOn,
      };
    }

    if (!Object.keys(exposedModules).length) {
      console.warn("⚠️  No exposed modules found in Expozr configuration.");
      return null;
    }

    return exposedModules;
  }

  /**
   * Merge Expozr entries with existing webpack entries
   */
  private mergeEntries(
    compiler: Compiler,
    exposedModules: EntryNormalized | null
  ): void {
    if (!exposedModules) return;
    if (!compiler.options.entry) {
      compiler.options.entry = exposedModules;
      return;
    }

    const originalEntry = compiler.options.entry;

    if (typeof originalEntry === "function") {
      compiler.options.entry = () => {
        const entries = originalEntry();
        return {
          ...entries,
          ...exposedModules,
        };
      };
    }

    if (typeof originalEntry === "object" && !Array.isArray(originalEntry)) {
      const hasExistingEntries = Object.keys(originalEntry).length > 0;
      if (hasExistingEntries) {
        compiler.options.entry = {
          ...originalEntry,
          ...exposedModules,
        };
      } else {
        compiler.options.entry = exposedModules;
      }
      return;
    }

    if (typeof originalEntry === "string") {
      compiler.options.entry = {
        ...exposedModules,
        main: originalEntry,
      };
      return;
    }
  }

  /**
   * Configure webpack for UMD output
   */
  private configureUMDOutput(compiler: Compiler): void {
    const path = require("path");
    const { build = {} } = this.config!;

    const outputPath = this.options.outputPath || build.outDir || "dist";
    const publicPath = this.options.publicPath || build.publicPath || "/";

    // Force UMD output for Navigator compatibility
    compiler.options.mode = "none";
    compiler.options.target = "web";

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
      clean: true,
    };

    // Set UMD specific options using any for webpack 5 compatibility
    (compiler.options.output as any).umdNamedDefine = true;

    // Disable ES modules to prevent conflicts
    compiler.options.experiments = {
      ...compiler.options.experiments,
      outputModule: false,
    };

    compiler.options.output.environment = {
      ...compiler.options.output.environment,
      module: false,
      dynamicImport: false,
      arrowFunction: true,
    };
  }

  /**
   * Configure TypeScript compilation for UMD output
   */
  private configureTypeScript(compiler: Compiler): void {
    if (!compiler.options.module?.rules) return;

    // Find TypeScript rule
    const tsRule = compiler.options.module.rules.find(
      (rule: any) =>
        rule &&
        typeof rule === "object" &&
        rule.test &&
        rule.test.toString().includes("\\.ts")
    ) as RuleSetRule | undefined;

    if (!tsRule || !("use" in tsRule) || !tsRule.use) return;

    // Configure ts-loader for CommonJS output
    const uses = Array.isArray(tsRule.use) ? tsRule.use : [tsRule.use];

    for (const use of uses) {
      if (typeof use === "object" && use !== null && "loader" in use) {
        if (use.loader === "ts-loader" || use.loader?.includes("ts-loader")) {
          if (!use.options) use.options = {};
          if (typeof use.options === "object") {
            (use.options as any).compilerOptions = {
              ...(use.options as any).compilerOptions,
              module: "CommonJS",
              target: "ES5",
            };
          }
        }
      }
    }
  }

  /**
   * Configure optimizations for UMD output
   */
  private configureOptimizations(compiler: Compiler): void {
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
  }

  /**
   * Configure development server for CORS
   */
  private configureDevServer(compiler: Compiler): void {
    if (compiler.options.devServer) {
      compiler.options.devServer.headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        ...compiler.options.devServer.headers,
      };
    }
  }

  /**
   * Generate inventory file after compilation
   */
  private async generateInventory(
    compiler: Compiler,
    compilation: Compilation
  ): Promise<void> {
    if (!this.config) return;

    const path = require("path");
    const fs = require("fs");

    const outputPath =
      this.options.outputPath ||
      compiler.outputPath ||
      compilation.outputOptions.path;

    // Ensure output directory exists
    await fs.promises.mkdir(outputPath, { recursive: true });

    // Use InventoryGenerator to create the base inventory
    const baseInventory = await InventoryGenerator.generate(this.config);

    // Update the cargo entries with actual compiled asset names
    const cargo: Record<string, Cargo> = {};

    for (const [name, cargoConfig] of Object.entries(this.config.expose)) {
      const config =
        typeof cargoConfig === "string"
          ? ({ entry: cargoConfig } as CargoConfig)
          : (cargoConfig as CargoConfig);

      // Clean name (remove ./ prefix) for webpack asset lookup
      const cleanName = name.startsWith("./") ? name.slice(2) : name;
      const assetName =
        typeof this.config.expose[name] === "string"
          ? this.findCompiledAsset(compilation, cleanName)
          : this.config.expose[name]?.overrideAssetName ||
            this.findCompiledAsset(compilation, cleanName);

      if (!assetName) {
        console.warn(`⚠️  Asset not found for cargo: ${name}`);
        continue;
      }

      // Use base inventory cargo but update the entry with actual asset name
      const baseCargo = baseInventory.cargo[name];
      if (baseCargo) {
        cargo[name] = {
          ...baseCargo,
          entry: assetName, // Use actual compiled asset name
          moduleSystem: "umd", // Webpack typically outputs UMD format
        };
      }
    }

    // Create final inventory with updated cargo entries
    // Create final inventory with updated cargo entries
    const inventory: Inventory = {
      ...baseInventory,
      cargo,
      timestamp: Date.now(),
    };

    // Write inventory file
    const inventoryPath = path.join(outputPath, INVENTORY_FILE_NAME);
    const inventoryContent = JSON.stringify(inventory, null, 2);

    await fs.promises.writeFile(inventoryPath, inventoryContent, "utf8");
  }

  /**
   * Find the compiled asset for an entry point
   */
  private findCompiledAsset(
    compilation: Compilation,
    entryName: string
  ): string {
    const entrypoints = compilation.entrypoints;

    console.log("Available entrypoints keys:", Array.from(entrypoints.keys()));
    console.log(
      "Available entrypoints values:",
      Array.from(entrypoints.values())
    );

    const entrypoint = entrypoints.get(entryName);

    if (entrypoint) {
      const files = entrypoint.getFiles();
      const mainFile = files.find(
        (file: string) => file.endsWith(".js") && !file.endsWith(".map")
      );
      if (mainFile) {
        return mainFile;
      }
    }

    // Fallback to expected filename
    return `${entryName}.js`;
  }
}
