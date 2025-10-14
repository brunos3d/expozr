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

import type {
  Compiler,
  Compilation,
  RuleSetRule,
  EntryObject,
  EntryNormalized,
} from "webpack";
import type { ExpozrConfig, Inventory, Cargo, CargoConfig } from "@expozr/core";
import {
  ValidationUtils,
  InventoryGenerator,
  ChecksumUtils,
  timestamp,
} from "@expozr/core";
import { loadExpozrConfigSync, INVENTORY_FILE_NAME } from "@expozr/adapter-sdk";

export interface ExpozrPluginOptions {
  /** Path to expozr config file */
  configFile?: string;
  /** Direct config object (overrides configFile) */
  config?: ExpozrConfig;
  /** Custom output path (overrides config) */
  outputPath?: string;
  /** Custom public path (overrides config) */
  publicPath?: string;
}

/**
 * Webpack plugin for creating Expozr remotes
 */
export class ExpozrPlugin {
  private options: ExpozrPluginOptions;
  private config?: ExpozrConfig;

  constructor(options: ExpozrPluginOptions = {}) {
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
      console.log(`📦 Using provided Expozr config: ${this.config.name}`);
      return;
    }

    // Load from SDK with automatic file discovery
    try {
      const result = loadExpozrConfigSync({
        configFile: this.options.configFile,
      });
      this.config = result.config;
      if (this.config) {
        console.log(`📦 Loaded Expozr config: ${this.config.name}`);
      }
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

    const path = require("path");

    console.log(`🔧 Configuring webpack for Expozr "${this.config.name}"`);
    console.log(`📦 Exposing ${Object.keys(this.config.expose).join(", ")}`);

    // Create webpack entries from expose configuration
    const exposedModules = this.createWebpackEntries();
    this.mergeEntries(compiler, exposedModules);

    // Configure for UMD output (compatible with Navigator)
    this.configureUMDOutput(compiler);

    // Configure TypeScript compilation
    this.configureTypeScript(compiler);

    // Configure optimizations
    this.configureOptimizations(compiler);

    // Configure development server
    this.configureDevServer(compiler);

    console.log("✅ Webpack configured for UMD output");
  }

  /**
   * Create webpack entry points from expose configuration
   */
  private createWebpackEntries(): EntryNormalized {
    const exposedModules: EntryNormalized = {};

    for (const [name, cargoConfig] of Object.entries(this.config!.expose)) {
      const entry =
        typeof cargoConfig === "string" ? cargoConfig : cargoConfig.entry;

      // Clean name (remove ./ prefix)
      const cleanName = name.startsWith("./") ? name.slice(2) : name;
      exposedModules[cleanName] = { import: [entry] };
    }

    return exposedModules;
  }

  /**
   * Merge Expozr entries with existing webpack entries
   */
  private mergeEntries(
    compiler: Compiler,
    exposedModules: EntryNormalized
  ): void {
    const existingEntries = compiler.options.entry || {};
    const hasExistingEntries = Object.keys(existingEntries).length > 0;

    if (Object.keys(exposedModules).length > 0) {
      compiler.options.entry = exposedModules;
    }

    // Preserve existing entries if they exist
    if (hasExistingEntries) {
      compiler.options.entry = {
        ...exposedModules,
        ...existingEntries,
      };
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

    const outputPath = compilation.outputOptions.path || compiler.outputPath;
    const publicPath =
      typeof compilation.outputOptions.publicPath === "string"
        ? compilation.outputOptions.publicPath
        : "/";

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
      const assetName = this.findCompiledAsset(compilation, cleanName);

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

    console.log(`📦 Expozr inventory generated: ${inventoryPath}`);
    console.log(
      `🚚 Expozr "${this.config.name}" ready with ${Object.keys(cargo).length} cargo`
    );
  }

  /**
   * Find the compiled asset for an entry point
   */
  private findCompiledAsset(
    compilation: Compilation,
    entryName: string
  ): string {
    const entrypoints = compilation.entrypoints;
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
