/**
 * Shared constants for Expozr bundler adapters
 */

/**
 * Default configuration file names in order of preference
 */
export const EXPOZR_CONFIG_FILES = [
  "expozr.config.ts",
  "expozr.config.js",
  "expozr.config.mjs",
  "expozr.config.cjs",
] as const;

/**
 * Host configuration file names in order of preference
 */
export const HOST_CONFIG_FILES = [
  "expozr.host.config.ts",
  "expozr.host.config.js",
  "expozr.host.config.mjs",
  "expozr.host.config.cjs",
  ...EXPOZR_CONFIG_FILES,
] as const;

/**
 * Default output directory for built files
 */
export const DEFAULT_OUTPUT_DIR = "dist";

/**
 * Default public path for assets
 */
export const DEFAULT_PUBLIC_PATH = "/";

/**
 * Inventory file name
 */
export const INVENTORY_FILE_NAME = "expozr.inventory.json";

/**
 * Default file extensions for entry points
 */
export const SUPPORTED_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
] as const;

/**
 * Common external dependencies that should not be bundled
 */
export const COMMON_EXTERNALS = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "@types/react",
  "@types/react-dom",
] as const;

/**
 * Default module formats supported by adapters
 */
export const SUPPORTED_MODULE_FORMATS = ["esm", "umd", "cjs"] as const;

/**
 * File naming patterns for different module formats
 */
export const MODULE_FORMAT_EXTENSIONS = {
  esm: {
    extension: ".mjs",
    chunkExtension: ".mjs",
  },
  umd: {
    extension: ".umd.js",
    chunkExtension: ".umd.js",
  },
  cjs: {
    extension: ".cjs",
    chunkExtension: ".cjs",
  },
} as const;

/**
 * Default webpack externals type mapping
 */
export const WEBPACK_EXTERNAL_TYPES = {
  esm: "module",
  umd: "umd",
  cjs: "commonjs",
} as const;

/**
 * Common ignore patterns for warnings
 */
export const COMMON_WARNING_PATTERNS = [
  {
    // Dynamic imports in navigator package
    module: /navigator\/dist\/index\.esm\.js/,
    message:
      /Critical dependency: the request of a dependency is an expression/,
  },
  {
    // Dynamic imports in any @expozr package
    module: /@expozr\/.*\/dist\/.*\.js/,
    message:
      /Critical dependency: the request of a dependency is an expression/,
  },
  {
    // Dynamic imports in core package
    module: /core\/dist\/index\.esm\.js/,
    message:
      /Critical dependency: the request of a dependency is an expression/,
  },
  {
    // Dynamic imports in react package
    module: /react\/dist\/index\.esm\.js/,
    message:
      /Critical dependency: the request of a dependency is an expression/,
  },
  {
    // Broader pattern for all packages
    module: /packages\/.*\/dist\/.*\.js/,
    message:
      /Critical dependency: the request of a dependency is an expression/,
  },
] as const;
