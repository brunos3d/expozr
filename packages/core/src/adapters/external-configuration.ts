/**
 * External dependency configuration manager
 */

import type { ModuleSystemConfig, ExternalDependencyConfig } from "../types";

/**
 * Manages external dependency configuration for different bundlers and module systems
 */
export class ExternalConfigurationManager {
  /**
   * Configure externals based on module system configuration
   */
  static configure(
    moduleSystem: ModuleSystemConfig,
    target: "browser" | "node" | "universal" = "universal"
  ): any {
    if (!moduleSystem.externals) {
      return {};
    }

    const { externals, strategy = "mixed" } = moduleSystem.externals;

    if (!externals) {
      return {};
    }

    if (Array.isArray(externals)) {
      return this.configureArrayExternals(externals);
    }

    return this.configureObjectExternals(externals, strategy, target);
  }

  /**
   * Configure externals from an array of dependency names
   */
  private static configureArrayExternals(
    externals: string[]
  ): Record<string, string> {
    return externals.reduce(
      (acc, dep) => {
        acc[dep] = dep;
        return acc;
      },
      {} as Record<string, string>
    );
  }

  /**
   * Configure externals from an object with complex configurations
   */
  private static configureObjectExternals(
    externals: Record<string, string | ExternalDependencyConfig>,
    strategy: string,
    target: "browser" | "node" | "universal"
  ): any {
    const result: any = {};

    for (const [dep, config] of Object.entries(externals)) {
      if (typeof config === "string") {
        result[dep] = config;
      } else {
        result[dep] = this.createExternalConfig(config, strategy, target);
      }
    }

    return result;
  }

  /**
   * Create external configuration for a specific dependency
   */
  private static createExternalConfig(
    config: ExternalDependencyConfig,
    strategy: string,
    target: "browser" | "node" | "universal"
  ): any {
    switch (strategy) {
      case "cdn":
        return this.createCdnConfig(config);
      case "global":
        return this.createGlobalConfig(config);
      case "import":
        return this.createImportConfig(config);
      case "mixed":
      default:
        return this.createMixedConfig(config);
    }
  }

  /**
   * Create CDN-based external configuration
   */
  private static createCdnConfig(config: ExternalDependencyConfig): string {
    return config.cdn || config.esm || config.global || "";
  }

  /**
   * Create global variable external configuration
   */
  private static createGlobalConfig(config: ExternalDependencyConfig): string {
    return config.global || "";
  }

  /**
   * Create import-based external configuration
   */
  private static createImportConfig(config: ExternalDependencyConfig): string {
    return config.esm || config.commonjs || "";
  }

  /**
   * Create mixed external configuration for maximum compatibility
   */
  private static createMixedConfig(config: ExternalDependencyConfig): any {
    return {
      commonjs: config.commonjs || config.global,
      commonjs2: config.commonjs2 || config.commonjs || config.global,
      amd: config.amd || config.global,
      root: config.global,
      import: config.esm || config.global,
    };
  }

  /**
   * Get default external configurations for common libraries
   */
  static getCommonExternals(): Record<string, ExternalDependencyConfig> {
    return {
      react: {
        global: "React",
        esm: "react",
        commonjs: "react",
        amd: "react",
      },
      "react-dom": {
        global: "ReactDOM",
        esm: "react-dom",
        commonjs: "react-dom",
        amd: "react-dom",
      },
      vue: {
        global: "Vue",
        esm: "vue",
        commonjs: "vue",
        amd: "vue",
      },
      lodash: {
        global: "_",
        esm: "lodash",
        commonjs: "lodash",
        amd: "lodash",
      },
      jquery: {
        global: "$",
        esm: "jquery",
        commonjs: "jquery",
        amd: "jquery",
      },
    };
  }

  /**
   * Merge external configurations with defaults
   */
  static mergeWithDefaults(
    externals: Record<string, string | ExternalDependencyConfig>
  ): Record<string, ExternalDependencyConfig> {
    const defaults = this.getCommonExternals();
    const result: Record<string, ExternalDependencyConfig> = { ...defaults };

    for (const [key, value] of Object.entries(externals)) {
      if (typeof value === "string") {
        // Convert string to ExternalDependencyConfig
        result[key] = {
          global: value,
          esm: value,
          commonjs: value,
          amd: value,
        };
      } else {
        result[key] = { ...defaults[key], ...value };
      }
    }

    return result;
  }
}
