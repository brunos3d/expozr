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

### 🎯 **Universal Module System**

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
  },
});
```

### Host Configuration

```typescript
import { defineHostConfig } from "@expozr/core";

export default defineHostConfig({
  name: "my-host-app",
  version: "1.0.0",
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
  entries: {
    "./Button": "./src/Button.tsx",
    "./Card": "./src/Card.tsx",
  },
});

// UMD configuration for legacy support
const umdConfig = createUMDExpozrConfig({
  name: "legacy-components",
  entries: {
    "./Button": "./src/Button.tsx",
  },
  globals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
});

// Hybrid configuration (both ESM and UMD)
const hybridConfig = createHybridExpozrConfig({
  name: "universal-components",
  entries: {
    "./Button": "./src/Button.tsx",
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

### Environment Detection

```typescript
import { detectEnvironment, isNode, isBrowser } from "@expozr/core";

// Automatic environment detection
const env = detectEnvironment();
console.log(env); // "browser" | "node" | "worker"

// Manual checks
if (isBrowser()) {
  // Browser-specific code
  console.log("Running in browser");
}

if (isNode()) {
  // Node.js-specific code
  console.log("Running in Node.js");
}
```

## 🔌 Bundler Adapters

### Creating a Custom Adapter

```typescript
import { BaseBundlerAdapter, BundlerAdapterConfig } from "@expozr/core";

class CustomBundlerAdapter extends BaseBundlerAdapter {
  constructor(config: BundlerAdapterConfig) {
    super(config);
  }

  async generateInventory(): Promise<void> {
    // Generate inventory for your bundler
  }

  async buildExpozr(): Promise<void> {
    // Build logic for your bundler
  }

  getWebpackConfig() {
    // Return bundler-specific configuration
  }
}

export function createCustomAdapter(config?: BundlerAdapterConfig) {
  return new CustomBundlerAdapter(config);
}
```

## 📦 Loaders

### Using Module Loaders

```typescript
import {
  ESMLoader,
  UMDLoader,
  HybridLoader,
  createUniversalLoader,
} from "@expozr/core";

// ESM-specific loader
const esmLoader = new ESMLoader({
  baseUrl: "http://localhost:3001",
});

// UMD-specific loader
const umdLoader = new UMDLoader({
  baseUrl: "http://localhost:3001",
  globals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
});

// Universal loader (auto-detects format)
const universalLoader = createUniversalLoader({
  primary: "esm",
  fallbacks: ["umd", "cjs"],
});

// Load a module
const module = await universalLoader.load("./Button");
```

## 🛠️ Utilities

### Version Management

```typescript
import {
  parseVersion,
  satisfiesVersion,
  resolveVersion,
  VersionRange,
} from "@expozr/core";

// Parse semantic version
const version = parseVersion("1.2.3-beta.1");
console.log(version); // { major: 1, minor: 2, patch: 3, prerelease: "beta.1" }

// Check version compatibility
const isCompatible = satisfiesVersion("1.2.5", "^1.2.0"); // true

// Resolve best version from range
const bestVersion = resolveVersion(["1.1.0", "1.2.0", "1.3.0"], "^1.2.0"); // "1.3.0"
```

### URL Utilities

```typescript
import { normalizeUrl, joinUrls, parseUrl, isAbsoluteUrl } from "@expozr/core";

// Normalize URLs
const normalized = normalizeUrl("http://localhost:3001//dist/");
console.log(normalized); // "http://localhost:3001/dist/"

// Join URL segments
const fullUrl = joinUrls("http://localhost:3001", "dist", "button.js");
console.log(fullUrl); // "http://localhost:3001/dist/button.js"

// Check if URL is absolute
const isAbsolute = isAbsoluteUrl("./relative/path"); // false
```

### Validation

```typescript
import {
  validateExpozrConfig,
  validateHostConfig,
  validateCargo,
  ValidationError,
} from "@expozr/core";

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

  const validatedConfig = validateExpozrConfig(config);
  console.log("Configuration is valid:", validatedConfig);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Validation failed:", error.details);
  }
}
```

## 📚 API Reference

### Core Types

```typescript
// Expozr configuration
interface ExpozrConfig {
  name: string;
  version: string;
  expose: Record<string, CargoConfig>;
  dependencies?: Record<string, string>;
  build?: BuildConfig;
  metadata?: ExpozrMetadata;
}

// Cargo (exposed module) configuration
interface CargoConfig {
  entry: string;
  exports?: string[];
  dependencies?: Record<string, string>;
  format?: ModuleFormat;
  metadata?: CargoMetadata;
}

// Host configuration
interface HostConfig {
  name: string;
  version: string;
  expozrs: Record<string, ExpozrReference>;
  cache?: CacheConfig;
  loading?: LoadingConfig;
}
```

### Configuration Functions

```typescript
// Define configurations
function defineExpozrConfig(config: ExpozrConfig): ExpozrConfig;
function defineHostConfig(config: HostConfig): HostConfig;
function defineCargoConfig(config: CargoConfig): CargoConfig;

// Create presets
function createESMExpozrConfig(options: PresetOptions): ExpozrConfig;
function createUMDExpozrConfig(options: PresetOptions): ExpozrConfig;
function createHybridExpozrConfig(options: PresetOptions): ExpozrConfig;
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
      format: "esm", // Force ESM format
    },
    // Legacy UMD module
    "./legacy": {
      entry: "./src/legacy/index.js",
      exports: ["LegacyComponent"],
      format: "umd",
    },
  },
  dependencies: {
    react: "^18.0.0",
    "react-dom": "^18.0.0",
  },
  build: {
    outDir: "dist",
    publicPath: "https://cdn.example.com/ui-library/",
    formats: ["esm", "umd"], // Build both formats
  },
});
```

### Complex Host Configuration

```typescript
import { defineHostConfig, createModernHostConfig } from "@expozr/core";

// Using preset
const config = createModernHostConfig({
  name: "my-app",
  expozrs: {
    "ui-components": "https://cdn.example.com/ui/",
    "business-logic": "https://api.example.com/modules/",
  },
});

// Or manual configuration
export default defineHostConfig({
  name: "enterprise-app",
  version: "3.2.1",
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
    retries: 3,
    retryDelay: 1000,
  },
});
```

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

## 📄 License

MIT - see [LICENSE](../../LICENSE) for details.
