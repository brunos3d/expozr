# @expozr/core

Core abstractions, types, and utilities for the Expozr ecosystem. This package provides the foundational building blocks for dynamic module sharing and runtime loading.

## 📋 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Key Features](#key-features)
- [Configuration](#configuration)
- [Module System](#module-system)
- [Bundler Adapters](#bundler-adapters)
- [Loaders](#loaders)
- [Utilities](#utilities)
- [API Reference](#api-reference)
- [Examples](#examples)

## 🌟 Overview

The `@expozr/core` package is the foundation of the Expozr ecosystem, providing:

- **Type definitions** for all core concepts (Expozr, Cargo, Inventory, etc.)
- **Configuration utilities** for setting up expozrs and hosts
- **Module system abstractions** supporting multiple formats (ESM, UMD, CJS, etc.)
- **Bundler adapter interfaces** for creating new bundler integrations
- **Module loaders** for different environments and formats
- **Utility functions** for validation, versioning, and URL handling

## 📦 Installation

```bash
npm install @expozr/core
```

## ✨ Key Features

### 🐙 **Universal Module System**

- **Multi-Format Support**: ESM, UMD, CJS, AMD, IIFE, SystemJS
- **Smart Format Detection**: Automatically detects the best format for your environment
- **Hybrid Mode**: Load both ESM and UMD versions of the same module
- **Fallback Strategies**: Graceful degradation when preferred formats fail

### ⚙️ **Configuration System**

- **Type-Safe Configuration**: TypeScript-first configuration with full intellisense
- **Preset System**: Pre-built configurations for common scenarios
- **Validation**: JSON schema validation for configuration files
- **Environment Detection**: Automatic detection of browser vs Node.js environments

### 🔧 **Bundler Agnostic**

- **Adapter Interface**: Standardized interface for bundler integrations
- **Universal APIs**: Same API works across all supported bundlers
- **Plugin Architecture**: Extensible plugin system for custom functionality
- **Build System Integration**: Seamless integration with existing build processes

### 🚀 **Developer Experience**

- **TypeScript Support**: Full TypeScript definitions and type safety
- **Hot Reloading**: Development-time module reloading support
- **Error Handling**: Comprehensive error types and debugging information
- **Documentation**: Extensive JSDoc comments and examples

## 🔧 Configuration

### Basic Expozr Configuration

```typescript
import { defineExpozrConfig } from "@expozr/core";

export default defineExpozrConfig({
  name: "my-components",
  version: "1.0.0",
  expose: {
    "./Button": {
      entry: "./src/Button.tsx",
      exports: ["Button", "ButtonProps"],
      dependencies: {
        react: "^18.0.0",
      },
    },
    "./utils": {
      entry: "./src/utils/index.ts",
      exports: ["add", "multiply", "formatDate"],
    },
  },
  dependencies: {
    react: "^18.0.0",
    "react-dom": "^18.0.0",
  },
  build: {
    outDir: "dist",
    publicPath: "http://localhost:3001/",
    format: ["esm", "umd"],
    target: "universal",
  },
});
```

### Host Configuration

```typescript
import { defineHostConfig } from "@expozr/core";

export default defineHostConfig({
  expozrs: {
    components: {
      url: "http://localhost:3001",
      version: "^1.0.0",
    },
    utils: {
      url: "http://localhost:3002",
      version: "latest",
    },
  },
  cache: {
    strategy: "memory",
    ttl: 300000, // 5 minutes
  },
});
```

### Using Configuration Presets

```typescript
import {
  createESMExpozrConfig,
  createUMDExpozrConfig,
  createHybridExpozrConfig,
} from "@expozr/core";

// ESM-only configuration
const esmConfig = createESMExpozrConfig({
  name: "modern-components",
  version: "1.0.0",
  expose: {
    "./Button": {
      entry: "./src/Button.tsx",
    },
    "./Card": {
      entry: "./src/Card.tsx",
    },
  },
});

// UMD configuration for legacy support
const umdConfig = createUMDExpozrConfig({
  name: "legacy-components",
  version: "1.0.0",
  expose: {
    "./Button": {
      entry: "./src/Button.tsx",
    },
  },
});

// Hybrid configuration (both ESM and UMD)
const hybridConfig = createHybridExpozrConfig({
  name: "universal-components",
  version: "1.0.0",
  expose: {
    "./Button": {
      entry: "./src/Button.tsx",
    },
  },
});
```

## 🔄 Module System

### Format Support

```typescript
import { ModuleFormat, ModuleSystemConfig } from "@expozr/core";

const moduleConfig: ModuleSystemConfig = {
  primary: "esm",
  fallbacks: ["umd", "cjs"],
  strategy: "dynamic",
  hybrid: true,
  resolution: {
    extensions: [".js", ".mjs", ".ts", ".tsx"],
    alias: {
      "@components": "./src/components",
      "@utils": "./src/utils",
    },
  },
};
```

## 🔌 Bundler Adapters

### Creating a Custom Adapter

```typescript
import { AbstractBundlerAdapter } from "@expozr/core";
import type { ExpozrConfig, HostConfig } from "@expozr/core";

class CustomBundlerAdapter extends AbstractBundlerAdapter {
  readonly name = "custom-bundler";

  configureExpozr(config: ExpozrConfig, bundlerConfig: any): any {
    // Configure bundler for expozr build
    return {
      ...bundlerConfig,
      // Add your custom configuration here
    };
  }

  configureHost(config: HostConfig, bundlerConfig: any): any {
    // Configure bundler for host application
    return {
      ...bundlerConfig,
      // Add your custom configuration here
    };
  }

  getDefaultConfig(): any {
    // Return default configuration for your bundler
    return {};
  }

  isAvailable(): boolean {
    // Check if bundler is available
    return true;
  }
}

export function createCustomAdapter() {
  return new CustomBundlerAdapter();
}
```

## 📦 Loaders

### Using Module Loaders

```typescript
import {
  ESMModuleLoader,
  UMDModuleLoader,
  HybridModuleLoader,
} from "@expozr/core";

// ESM-specific loader
const esmLoader = new ESMModuleLoader();

// UMD-specific loader
const umdLoader = new UMDModuleLoader();

// Hybrid loader (tries multiple formats)
const hybridLoader = new HybridModuleLoader();

// Load a module
const module = await hybridLoader.loadModule("http://localhost:3001/button.js");
```

## 🛠️ Utilities

### Version Management

```typescript
import { VersionUtils } from "@expozr/core";

// Parse semantic version
const version = VersionUtils.parse("1.2.3-beta.1");
console.log(version); // { major: 1, minor: 2, patch: 3, prerelease: "beta.1" }

// Check version validity
const isValid = VersionUtils.isValid("1.2.5"); // true

// Compare versions
const comparison = VersionUtils.compare("1.2.5", "1.2.0"); // 1 (v1 > v2)
```

### URL Utilities

```typescript
import { UrlUtils } from "@expozr/core";

// Normalize URLs
const normalized = UrlUtils.normalize("http://localhost:3001//dist/");
console.log(normalized); // "http://localhost:3001/dist/"

// Join URL segments
const fullUrl = UrlUtils.join("http://localhost:3001", "dist", "button.js");
console.log(fullUrl); // "http://localhost:3001/dist/button.js"

// Check if URL is absolute
const isAbsolute = UrlUtils.isAbsolute("./relative/path"); // false
```

### Validation

```typescript
import { ValidationUtils } from "@expozr/core";

try {
  const config = {
    name: "my-expozr",
    version: "1.0.0",
    expose: {
      "./Button": {
        entry: "./src/Button.tsx",
        exports: ["Button"],
      },
    },
  };

  const isValid = ValidationUtils.validateExpozrConfig(config);
  console.log("Configuration is valid:", isValid);
} catch (error) {
  console.error("Validation failed:", error.message);
}
```

## 📚 API Reference

### Core Types

```typescript
// Expozr configuration
interface ExpozrConfig {
  name: string;
  version: string;
  expose: Record<string, string | CargoConfig>;
  dependencies?: Record<string, string>;
  build?: ExpozrBuildConfig;
  metadata?: ExpozrMetadata;
}

// Cargo (exposed module) configuration
interface CargoConfig {
  entry: string;
  exports?: string[];
  dependencies?: Record<string, string>;
  metadata?: CargoMetadata;
}

// Host configuration
interface HostConfig {
  expozrs: Record<string, ExpozrReference>;
  catalog?: string | CatalogConfig;
  cache?: CacheConfig;
  loading?: LoadingConfig;
}

// Expozr reference from host
interface ExpozrReference {
  url: string;
  version?: string;
  alias?: string;
  fallback?: string;
}
```

### Configuration Functions

```typescript
// Define configurations
function defineExpozrConfig(config: ExpozrConfig): ExpozrConfig;
function defineHostConfig(config: HostConfig): HostConfig;
function defineCargoConfig(config: CargoConfig): CargoConfig;
function defineModuleSystemConfig(
  config: Partial<ModuleSystemConfig>
): ModuleSystemConfig;

// Create presets
function createESMExpozrConfig(
  config: Omit<ExpozrConfig, "build"> & {
    build?: Partial<ExpozrConfig["build"]>;
  }
): ExpozrConfig;
function createUMDExpozrConfig(
  config: Omit<ExpozrConfig, "build"> & {
    build?: Partial<ExpozrConfig["build"]>;
  }
): ExpozrConfig;
function createHybridExpozrConfig(
  config: Omit<ExpozrConfig, "build"> & {
    build?: Partial<ExpozrConfig["build"]>;
  }
): ExpozrConfig;
function createModernHostConfig(config?: Partial<HostConfig>): HostConfig;
```

## 💡 Examples

### Multi-Format Module Exposure

```typescript
import { defineExpozrConfig } from "@expozr/core";

export default defineExpozrConfig({
  name: "ui-library",
  version: "2.1.0",
  expose: {
    // React component with TypeScript
    "./Button": {
      entry: "./src/components/Button.tsx",
      exports: ["Button", "ButtonProps", "ButtonVariant"],
      dependencies: {
        react: "^18.0.0",
        "@emotion/styled": "^11.0.0",
      },
    },
    // Utility functions
    "./utils": {
      entry: "./src/utils/index.ts",
      exports: ["formatCurrency", "debounce", "throttle"],
    },
    // Legacy component
    "./legacy": {
      entry: "./src/legacy/index.js",
      exports: ["LegacyComponent"],
    },
  },
  dependencies: {
    react: "^18.0.0",
    "react-dom": "^18.0.0",
  },
  build: {
    outDir: "dist",
    publicPath: "https://cdn.example.com/ui-library/",
    format: ["esm", "umd"], // Build both formats
    target: "universal",
    moduleSystem: {
      primary: "esm",
      fallbacks: ["umd"],
      strategy: "dynamic",
      hybrid: true,
    },
  },
});
```

### Complex Host Configuration

```typescript
import { defineHostConfig, createModernHostConfig } from "@expozr/core";

// Using preset
const config = createModernHostConfig({
  expozrs: {
    "ui-components": {
      url: "https://cdn.example.com/ui/",
      version: "^2.0.0",
    },
    "business-logic": {
      url: "https://api.example.com/modules/",
      version: "latest",
    },
  },
});

// Or manual configuration
export default defineHostConfig({
  expozrs: {
    "design-system": {
      url: "https://design.company.com/expozr/",
      version: "^2.0.0",
    },
    analytics: {
      url: "https://analytics.company.com/modules/",
      version: "~1.5.0",
    },
    "feature-flags": {
      url: "https://features.company.com/flags/",
      version: "latest",
    },
  },
  cache: {
    strategy: "indexedDB",
    ttl: 86400000, // 24 hours
    maxSize: 100, // 100 modules max
  },
  loading: {
    timeout: 10000, // 10 seconds
    retry: {
      attempts: 3,
      delay: 1000,
      backoff: 2,
    },
  },
});
```

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

## 📄 License

MIT - see [LICENSE](../../LICENSE) for details.
