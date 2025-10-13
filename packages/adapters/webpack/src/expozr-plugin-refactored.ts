// Dynamic imports for Node.js modules
declare const require: any;

import type {
  Compiler,
  Compilation,
  RuleSetRule,
  EntryNormalized,
} from "webpack";
import type { ExpozrConfig, Inventory, Cargo, CargoConfig } from "@expozr/core";

import { ChecksumUtils, timestamp, ValidationUtils } from "@expozr/core";

export interface ExpozrPluginOptions {
  configFile?: string;
  config?: ExpozrConfig;
  outputPath?: string;
  publicPath?: string;
}

/**
 * Webpack plugin for creating Expozr warehouses
 *
 * Features:
 * - Automatic configuration loading from standard files
 * - ESM and UMD output format support
 * - TypeScript compilation configuration
 * - Inventory generation
 * - Development and production optimizations
 */
export class ExpozrPlugin {
  private options: ExpozrPluginOptions;
  private config?: ExpozrConfig;

  constructor(options: ExpozrPluginOptions = {}) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    const pluginName = "ExpozrPlugin";

    // Setup configuration and webpack during compilation initialization
    const setupConfig = (compiler: Compiler) => {
      try {
        this.loadConfig(compiler);
        if (this.config) {
          this.configureWebpack(compiler);
        }
      } catch (error) {
        console.error(`❌ Expozr Plugin Error: ${(error as Error).message}`);
        throw error;
      }
    };

    // Load config for regular builds
    compiler.hooks.beforeRun.tap(pluginName, setupConfig);

    // Load config for watch mode
    compiler.hooks.watchRun.tap(pluginName, setupConfig);

    // Generate inventory after successful compilation
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
   * Load Expozr configuration from file system
   */
  private loadConfig(compiler: Compiler): void {
    const path = require("path");
    const fs = require("fs");

    // Use provided config
    if (this.options.config) {
      this.config = this.options.config;
      return;
    }

    // Load from specified config file
    if (this.options.configFile) {
      const configPath = path.resolve(
        compiler.context,
        this.options.configFile
      );
      this.config = this.loadConfigFile(configPath);
      return;
    }

    // Search for default config files
    const defaultConfigs = [
      "expozr.config.ts",
      "expozr.config.js",
      "expozr.config.mjs",
      "expozr.config.cjs",
    ];

    for (const configFile of defaultConfigs) {
      const configPath = path.resolve(compiler.context, configFile);
      if (fs.existsSync(configPath)) {
        try {
          this.config = this.loadConfigFile(configPath);
          console.log(`📋 Loaded Expozr config from ${configFile}`);
          break;
        } catch (error) {
          console.warn(
            `⚠️  Failed to load ${configFile}: ${(error as Error).message}`
          );
        }
      }
    }

    if (!this.config) {
      throw new Error(
        "No Expozr configuration found. Please create expozr.config.js or expozr.config.ts"
      );
    }

    if (!ValidationUtils.validateExpozrConfig(this.config)) {
      throw new Error(
        "Invalid Expozr configuration. Please check your config file."
      );
    }
  }

  /**
   * Load configuration file using require
   */
  private loadConfigFile(configPath: string): ExpozrConfig {
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

  /**
   * Configure webpack for Expozr builds
   */
  private configureWebpack(compiler: Compiler): void {
    if (!this.config) return;

    const path = require("path");

    console.log(`🔧 Configuring webpack for Expozr "${this.config.name}"`);
    console.log(
      `📦 Exposing ${Object.keys(this.config.expose).length} modules: ${Object.keys(this.config.expose).join(", ")}`
    );

    // Convert expose configuration to webpack entries
    const exposedModules = this.createWebpackEntries(compiler.context);

    // Merge with existing entries
    this.mergeEntries(compiler, exposedModules);

    // Get build configuration
    const buildConfig = this.config.build || {};
    const format = buildConfig.format || ["umd"];
    const formats = Array.isArray(format) ? format : [format];

    // Configure based on target format(s)
    if (formats.includes("esm")) {
      this.configureESMOutput(compiler);
    } else {
      this.configureUMDOutput(compiler);
    }

    // Configure output paths
    this.configureOutputPaths(compiler, buildConfig);

    // Configure TypeScript compilation
    this.configureTypeScript(compiler, formats.includes("esm"));

    // Configure optimizations
    this.configureOptimizations(compiler, formats.includes("esm"));

    // Configure warning suppressions
    this.configureWarningSuppressions(compiler);

    console.log(`✅ Webpack configured for ${formats.join(" + ")} output`);
  }

  /**
   * Create webpack entry points from expose configuration
   */
  private createWebpackEntries(context: string): EntryNormalized {
    const path = require("path");
    const exposedModules: EntryNormalized = {};

    for (const [name, cargoConfig] of Object.entries(this.config!.expose)) {
      const entryPoint =
        typeof cargoConfig === "string" ? cargoConfig : cargoConfig.entry;

      const cleanName = name.startsWith("./") ? name.slice(2) : name;
      exposedModules[cleanName] = path.resolve(context, entryPoint);
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

    if (hasExistingEntries) {
      compiler.options.entry = {
        ...exposedModules,
        ...existingEntries,
      };
      console.log(
        `🔄 Merged ${Object.keys(exposedModules).length} Expozr entries with ${Object.keys(existingEntries).length} existing entries`
      );
    }
  }

  /**
   * Configure webpack for ESM output
   */
  private configureESMOutput(compiler: Compiler): void {
    compiler.options.mode = "none";
    compiler.options.target = "web";

    compiler.options.experiments = {
      ...compiler.options.experiments,
      outputModule: true,
    };

    compiler.options.output = {
      ...compiler.options.output,
      filename: "[name].mjs",
      chunkFilename: "[name]-[contenthash].mjs",
      library: {
        type: "module",
      },
      module: true,
      environment: {
        module: true,
        dynamicImport: true,
        arrowFunction: true,
      },
    };
  }

  /**
   * Configure webpack for UMD output
   */
  private configureUMDOutput(compiler: Compiler): void {
    compiler.options.mode = "none";
    compiler.options.target = "web";

    compiler.options.output = {
      ...compiler.options.output,
      filename: "[name].umd.js",
      chunkFilename: "[name]-[contenthash].umd.js",
      library: {
        name: "[name]",
        type: "umd",
        export: "default",
      },
      globalObject: "typeof self !== 'undefined' ? self : this",
    };

    // UMD specific settings
    (compiler.options.output as any).umdNamedDefine = true;

    // Disable module experiments for UMD
    compiler.options.experiments = {
      ...compiler.options.experiments,
      outputModule: false,
    };
  }

  /**
   * Configure output paths and public path
   */
  private configureOutputPaths(compiler: Compiler, buildConfig: any): void {
    const path = require("path");

    const outputPath = this.options.outputPath || buildConfig.outDir || "dist";
    const publicPath = this.options.publicPath || buildConfig.publicPath || "/";

    compiler.options.output = {
      ...compiler.options.output,
      path: path.resolve(compiler.context, outputPath),
      publicPath,
      clean: true,
    };
  }

  /**
   * Configure TypeScript compilation
   */
  private configureTypeScript(compiler: Compiler, isESM: boolean): void {
    if (!compiler.options.module) {
      compiler.options.module = { rules: [] } as any;
    }

    const tsRule = this.findTypeScriptRule(compiler.options.module.rules);
    if (tsRule) {
      this.updateTypeScriptRule(tsRule, isESM);
      console.log(
        `📝 TypeScript configured for ${isESM ? "ESM" : "CommonJS"} compilation`
      );
    }
  }

  /**
   * Find TypeScript rule in webpack configuration
   */
  private findTypeScriptRule(rules: any[]): RuleSetRule | undefined {
    return rules.find(
      (rule: any) =>
        rule &&
        typeof rule === "object" &&
        rule !== "..." &&
        rule.test &&
        rule.test.toString().includes("\\.tsx?")
    ) as RuleSetRule | undefined;
  }

  /**
   * Update TypeScript rule for the target module format
   */
  private updateTypeScriptRule(tsRule: RuleSetRule, isESM: boolean): void {
    if (!("use" in tsRule) || !tsRule.use) return;

    const compilerOptions = isESM
      ? {
          module: "ESNext",
          target: "ES2020",
          moduleResolution: "bundler",
        }
      : {
          module: "CommonJS",
          target: "ES5",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        };

    // Handle different use configurations
    if (typeof tsRule.use === "string" && tsRule.use.includes("ts-loader")) {
      (tsRule as any).use = {
        loader: tsRule.use,
        options: { compilerOptions },
      };
    } else if (typeof tsRule.use === "object" && !Array.isArray(tsRule.use)) {
      (tsRule.use as any).options = {
        ...(tsRule.use as any).options,
        compilerOptions: {
          ...((tsRule.use as any).options?.compilerOptions || {}),
          ...compilerOptions,
        },
      };
    }
  }

  /**
   * Configure webpack optimizations
   */
  private configureOptimizations(compiler: Compiler, isESM: boolean): void {
    if (isESM) {
      // ESM optimizations
      compiler.options.optimization = {
        ...compiler.options.optimization,
        usedExports: true,
        providedExports: true,
        sideEffects: false,
      };
    } else {
      // UMD optimizations (minimal to avoid breaking UMD format)
      compiler.options.optimization = {
        ...compiler.options.optimization,
        minimize: false,
        concatenateModules: false,
        splitChunks: false,
        runtimeChunk: false,
      };
    }
  }

  /**
   * Configure warning suppressions for better developer experience
   */
  private configureWarningSuppressions(compiler: Compiler): void {
    if (!compiler.options.ignoreWarnings) {
      compiler.options.ignoreWarnings = [];
    }

    // Suppress common Expozr-related warnings
    const expozrWarnings = [
      (warning: Error) => {
        const message = warning.message;
        return (
          message.includes(
            "Critical dependency: the request of a dependency is an expression"
          ) &&
          (message.includes("navigator/dist/index.esm.js") ||
            message.includes("@expozr/"))
        );
      },
    ];

    compiler.options.ignoreWarnings.push(...expozrWarnings);
  }

  /**
   * Generate inventory file after compilation
   */
  private async generateInventory(
    compiler: Compiler,
    compilation: Compilation
  ): Promise<void> {
    if (!this.config) return;

    try {
      const path = require("path");
      const fs = require("fs").promises;

      console.log("📋 Generating Expozr inventory...");

      const outputPath = compilation.outputOptions.path || compiler.outputPath;
      const publicPath =
        (compilation.outputOptions.publicPath as string) || "/";

      // Generate cargo entries
      const cargo: Record<string, Cargo> = {};

      for (const [name, cargoConfig] of Object.entries(this.config.expose)) {
        const config =
          typeof cargoConfig === "string"
            ? { entry: cargoConfig }
            : cargoConfig;

        const cleanName = name.startsWith("./") ? name.slice(2) : name;
        const assetName = this.findCompiledAsset(compilation, cleanName);

        cargo[cleanName] = {
          name: cleanName,
          version: this.config.version,
          entry: assetName,
          exports: config.exports,
          dependencies: config.dependencies || {},
          metadata: {
            ...config.metadata,
            size: compilation.assets[assetName]?.size() || 0,
          },
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
        checksum: await ChecksumUtils.generateAsync({
          cargo,
          dependencies: this.config.dependencies,
        }),
      };

      // Write inventory file
      const inventoryPath = path.join(outputPath, "expozr.inventory.json");
      await fs.writeFile(
        inventoryPath,
        JSON.stringify(inventory, null, 2),
        "utf8"
      );

      console.log(`✅ Expozr inventory generated: ${inventoryPath}`);
      console.log(
        `🚚 Expozr "${this.config.name}" ready with ${Object.keys(cargo).length} cargo modules`
      );
    } catch (error) {
      console.error("❌ Failed to generate Expozr inventory:", error);
      throw error;
    }
  }

  /**
   * Find the compiled asset for an entry point
   */
  private findCompiledAsset(
    compilation: Compilation,
    entryName: string
  ): string {
    const entrypoint = compilation.entrypoints.get(entryName);

    if (entrypoint) {
      const files = entrypoint.getFiles();
      const mainFile = files.find(
        (file: string) =>
          (file.endsWith(".js") ||
            file.endsWith(".mjs") ||
            file.endsWith(".umd.js")) &&
          !file.endsWith(".map")
      );

      if (mainFile) {
        return mainFile;
      }
    }

    // Fallback to expected filename
    return `${entryName}.js`;
  }
}
