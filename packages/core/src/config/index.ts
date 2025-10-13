/**
 * Configuration utilities and presets
 */

// Base configuration helpers
export {
  defineExpozrConfig,
  defineHostConfig,
  defineCargoConfig,
  defineModuleSystemConfig,
  createModuleSystemDefaults,
  defaultExpozrConfig,
  defaultHostConfig,
} from "./base-config";

// Configuration presets
export {
  createESMExpozrConfig,
  createUMDExpozrConfig,
  createHybridExpozrConfig,
  createModernHostConfig,
  createLegacyHostConfig,
  createNodeHostConfig,
  presets,
} from "./presets";

// JSON Schemas for validation
export {
  expozrConfigSchema,
  hostConfigSchema,
  inventorySchema,
  moduleSystemConfigSchema,
} from "./schemas";

// Re-export types
export type {
  ExpozrConfig,
  HostConfig,
  CargoConfig,
  ModuleSystemConfig,
  ExpozrBuildConfig,
  ExpozrMetadata,
  CacheConfig,
  LoadingConfig,
} from "../types";
