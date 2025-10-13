/**
 * External configuration utilities for bundler adapters
 */

import type {
  ModuleSystemConfig,
  HostConfig,
  ExpozrReference,
} from "@expozr/core";
import { COMMON_EXTERNALS } from "./constants";

/**
 * Target environment for builds
 */
export type TargetEnvironment = "web" | "node" | "universal";

/**
 * External configuration options
 */
export interface ExternalConfigOptions {
  /**
   * Additional external dependencies
   */
  additionalExternals?: string[];
  /**
   * Whether to include common externals (React, etc.)
   */
  includeCommonExternals?: boolean;
  /**
   * Custom external mapping
   */
  customExternals?: Record<string, string>;
}

/**
 * Create externals configuration for webpack
 */
export function createWebpackExternals(
  moduleSystem: ModuleSystemConfig,
  target: TargetEnvironment = "universal",
  options: ExternalConfigOptions = {}
): any {
  const {
    additionalExternals = [],
    includeCommonExternals = true,
    customExternals = {},
  } = options;

  const externals: Record<string, any> = {};

  // Add common externals based on target
  if (includeCommonExternals && (target === "web" || target === "universal")) {
    COMMON_EXTERNALS.forEach((external) => {
      externals[external] = {
        commonjs: external,
        commonjs2: external,
        amd: external,
        root: external.replace(/[@\/\-]/g, "_"),
      };
    });
  }

  // Add additional externals
  additionalExternals.forEach((external) => {
    externals[external] = {
      commonjs: external,
      commonjs2: external,
      amd: external,
      root: external.replace(/[@\/\-]/g, "_"),
    };
  });

  // Add custom externals
  Object.entries(customExternals).forEach(([key, value]) => {
    externals[key] = value;
  });

  return externals;
}

/**
 * Create externals configuration for Vite/Rollup
 */
export function createViteExternals(
  moduleSystem: ModuleSystemConfig,
  target: TargetEnvironment = "universal",
  options: ExternalConfigOptions = {}
): string[] {
  const { additionalExternals = [], includeCommonExternals = true } = options;

  const externals: string[] = [];

  // Add common externals based on target
  if (includeCommonExternals && (target === "web" || target === "universal")) {
    externals.push(...COMMON_EXTERNALS);
  }

  // Add additional externals
  externals.push(...additionalExternals);

  return externals;
}

/**
 * Create host externals for webpack
 */
export function createWebpackHostExternals(
  config: HostConfig,
  options: ExternalConfigOptions = {}
): Record<string, string> {
  const externals: Record<string, string> = {};

  // Create external entries for expozr modules
  for (const [expozrName, expozrRef] of Object.entries(config.expozrs)) {
    const ref = expozrRef as ExpozrReference;
    const alias = ref.alias || expozrName;
    externals[`@expozr/expozr/${alias}`] = `expozr-expozr-${alias}`;
  }

  // Add custom externals
  if (options.customExternals) {
    Object.assign(externals, options.customExternals);
  }

  return externals;
}

/**
 * Create host externals for Vite
 */
export function createViteHostExternals(
  config: HostConfig,
  options: ExternalConfigOptions = {}
): string[] {
  const externals: string[] = [];

  // Add expozr module patterns
  for (const [expozrName, expozrRef] of Object.entries(config.expozrs)) {
    const ref = expozrRef as ExpozrReference;
    const alias = ref.alias || expozrName;
    externals.push(`@expozr/expozr/${alias}`);
  }

  // Add common externals
  if (options.includeCommonExternals !== false) {
    externals.push(...COMMON_EXTERNALS);
  }

  // Add additional externals
  if (options.additionalExternals) {
    externals.push(...options.additionalExternals);
  }

  return externals;
}

/**
 * Get target configuration for webpack
 */
export function getWebpackTargetConfig(target: TargetEnvironment): any {
  switch (target) {
    case "web":
      return {
        target: "web",
        resolve: {
          fallback: {
            path: false,
            fs: false,
            crypto: false,
            stream: false,
            util: false,
            buffer: false,
          },
        },
      };

    case "node":
      return {
        target: "node",
        externalsPresets: { node: true },
      };

    case "universal":
    default:
      return {
        target: "web",
        resolve: {
          fallback: {
            path: false,
            fs: false,
            crypto: false,
            stream: false,
            util: false,
            buffer: false,
          },
        },
      };
  }
}

/**
 * Determine if dependency should be external based on module system and target
 */
export function shouldExternalize(
  dependency: string,
  moduleSystem: ModuleSystemConfig,
  target: TargetEnvironment
): boolean {
  // Always externalize common dependencies in web/universal targets
  if (
    (target === "web" || target === "universal") &&
    COMMON_EXTERNALS.includes(dependency as any)
  ) {
    return true;
  }

  // Node.js built-ins should be external in node target
  if (target === "node" && isNodeBuiltin(dependency)) {
    return true;
  }

  // Check if dependency matches any patterns
  return false;
}

/**
 * Check if a dependency is a Node.js built-in module
 */
function isNodeBuiltin(dependency: string): boolean {
  const nodeBuiltins = [
    "assert",
    "buffer",
    "child_process",
    "cluster",
    "crypto",
    "dgram",
    "dns",
    "domain",
    "events",
    "fs",
    "http",
    "https",
    "net",
    "os",
    "path",
    "punycode",
    "querystring",
    "readline",
    "stream",
    "string_decoder",
    "timers",
    "tls",
    "tty",
    "url",
    "util",
    "vm",
    "zlib",
  ];

  return nodeBuiltins.includes(dependency) || dependency.startsWith("node:");
}
