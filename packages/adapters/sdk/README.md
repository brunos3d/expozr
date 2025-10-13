# @expozr/adapter-sdk

Shared SDK and utilities for Expozr bundler adapters.

## Overview

The Adapter SDK provides a common foundation for building bundler adapters in the Expozr ecosystem. It includes shared utilities, constants, configuration loaders, and base classes that ensure consistency across different bundler implementations.

## Features

- **Configuration Management**: Automatic loading and validation of Expozr configurations
- **Format Utilities**: Support for multiple module formats (ESM, UMD, CJS) with proper naming conventions
- **External Dependencies**: Centralized management of external dependencies and module mapping
- **Warning Suppression**: Built-in patterns to suppress common bundler warnings for better DX
- **Plugin Architecture**: Base classes for consistent plugin development
- **ESM Support**: Specialized utilities for modern ESM compilation

## Installation

```bash
npm install @expozr/adapter-sdk
```

## Usage

### Configuration Loading

```typescript
import { loadExpozrConfig, loadHostConfig } from "@expozr/adapter-sdk";

// Load Expozr configuration
const { config, error } = await loadExpozrConfig({
  baseDir: process.cwd(),
  required: true,
});

// Load Host configuration
const hostResult = await loadHostConfig({
  configFile: "custom.config.js",
});
```

### Format Utilities

```typescript
import {
  createWebpackFormatConfig,
  createViteFormatConfig,
  normalizeFormats,
} from "@expozr/adapter-sdk";

// Create webpack configuration for UMD
const webpackUMD = createWebpackFormatConfig("umd", "MyLibrary");

// Create Vite configuration for ESM
const viteESM = createViteFormatConfig("esm");

// Normalize format arrays
const formats = normalizeFormats(["esm", "umd"]); // ['esm', 'umd']
```

### External Configuration

```typescript
import {
  createWebpackExternals,
  createViteExternals,
  createWebpackHostExternals,
} from "@expozr/adapter-sdk";

// Create externals for webpack warehouse
const externals = createWebpackExternals(moduleSystem, "web", {
  includeCommonExternals: true,
  additionalExternals: ["lodash"],
});

// Create externals for Vite warehouse
const viteExternals = createViteExternals(moduleSystem, "web");
```

### Warning Suppression

```typescript
import {
  createWebpackIgnoreWarnings,
  createViteWarningFilter,
} from "@expozr/adapter-sdk";

// Webpack warning suppression
const webpackConfig = {
  ignoreWarnings: createWebpackIgnoreWarnings(),
};

// Vite warning filtering
const viteConfig = {
  build: {
    rollupOptions: {
      onwarn: createViteWarningFilter(),
    },
  },
};
```

### Plugin Base Classes

```typescript
import { BaseExpozrPlugin, BaseHostPlugin } from "@expozr/adapter-sdk";

class MyBundlerPlugin extends BaseExpozrPlugin {
  constructor(options) {
    super(options);
  }

  async initialize() {
    // Load configuration
    await this.loadConfig(context);

    // Generate inventory
    const inventory = await this.generateInventory();

    // Write to filesystem
    await this.writeInventory(inventory, outputDir);
  }
}
```

## Constants

The SDK provides numerous constants for consistent behavior:

```typescript
import {
  EXPOZR_CONFIG_FILES,
  HOST_CONFIG_FILES,
  INVENTORY_FILE_NAME,
  DEFAULT_OUTPUT_DIR,
  SUPPORTED_EXTENSIONS,
  COMMON_EXTERNALS,
} from "@expozr/adapter-sdk";
```

## ESM Utilities

For advanced ESM compilation support:

```typescript
import {
  configureWebpackESM,
  configureWebpackUMD,
  createMultiFormatWebpackConfig,
  configureESMResolve,
} from "@expozr/adapter-sdk";

// Configure webpack for ESM
const esmConfig = configureWebpackESM(baseConfig, moduleSystem, {
  enableTreeShaking: true,
  targetEnvironment: "es2020",
});
```

## Integration with Bundler Adapters

This SDK is designed to be used by:

- `@expozr/webpack-adapter`
- `@expozr/vite-adapter`
- `@expozr/rollup-adapter` (future)
- `@expozr/esbuild-adapter` (future)

## API Reference

For detailed API documentation, please refer to the TypeScript definitions included with the package.

## Contributing

When contributing to the SDK, ensure that:

1. New utilities are bundler-agnostic
2. Constants are properly typed and documented
3. Base classes provide meaningful abstractions
4. Changes maintain backward compatibility

## License

MIT
