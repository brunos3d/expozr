# @expozr/navigator

Universal runtime loader for the Expozr ecosystem, providing seamless dynamic module loading and runtime sharing capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Cache Strategies](#cache-strategies)
- [Module Loaders](#module-loaders)
- [Auto-Loader](#auto-loader)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## 🌟 Overview

The Navigator package provides the **ExpozrNavigator** - a full-featured runtime loader for the Expozr ecosystem with advanced module system support.

The **ExpozrNavigator** extends the `BaseExpozrNavigator` class that provides core functionality like caching, event handling, and inventory management.

## ✨ ExpozrNavigator Features

- **🎯 Smart Format Detection**: Automatically detects and loads the best available module format (ESM, UMD, CJS)
- **🔄 Multi-Format Support**: Tries multiple formats in order of preference (ESM → UMD → CJS → Auto)
- **🧠 Intelligent Fallbacks**: If one format fails, automatically tries alternatives
- **⚡ Advanced Module System**: Integration with Expozr's global module system
- **🛡️ Error Recovery**: Comprehensive error handling with detailed feedback
- **📊 Format Tracking**: Tracks which format was successfully loaded
- **🎪 Strategy Awareness**: Reports loading strategy used (enhanced/fallback)

## 📦 Installation

```bash
npm install @expozr/navigator
```

## 🚀 Quick Start

```typescript
import { createNavigator } from "@expozr/navigator";

const navigator = createNavigator({
  expozrs: {
    components: {
      url: "http://localhost:3001",
      version: "^1.0.0",
    },
  },
  cache: {
    strategy: "memory",
    ttl: 300000, // 5 minutes
  },
  // Module system configuration
  moduleSystem: {
    primary: "esm", // Prefer ESM modules
    fallbacks: ["umd", "cjs"], // Fall back to UMD, then CJS
    strategy: "dynamic", // Use dynamic loading strategy
    hybrid: true, // Enable hybrid mode
  },
});

// Load a remote module with default settings
const buttonModule = await navigator.loadCargo("components", "Button");
const { Button } = buttonModule.module;

// Load with per-component module preferences
const advancedModule = await navigator.loadCargo(
  "components",
  "AdvancedButton",
  {
    moduleFormat: "umd", // Prefer UMD for this specific load
    fallbackFormats: ["esm"], // Fall back to ESM if UMD fails
    strategy: "eager", // Load eagerly
  }
);
```

## 🔀 Navigator Types

### 🚀 EnhancedNavigator (Default)

The **EnhancedNavigator** is the recommended choice for most applications. It provides advanced features and robust module loading capabilities.

#### ✨ Features

- **🎯 Smart Format Detection**: Automatically detects and loads the best available module format (ESM, UMD, CJS)
- **🔄 Multi-Format Support**: Tries multiple formats in order of preference (ESM → UMD → CJS → Auto)
- **🧠 Intelligent Fallbacks**: If one format fails, automatically tries alternatives
- **⚡ Advanced Module System**: Integration with Expozr's global module system with configurable preferences
- **🛡️ Error Recovery**: Comprehensive error handling with detailed feedback
- **📊 Format Tracking**: Tracks which format was successfully loaded
- **🎪 Strategy Awareness**: Reports loading strategy used (dynamic/static/lazy/eager)
- **⚙️ Flexible Configuration**: Global and per-load module system configuration
- **🎛️ Loading Strategy Control**: Choose between dynamic, static, lazy, or eager loading strategies

## 📚 API Reference

### Factory Functions

#### `createNavigator(config?)`

Creates an ExpozrNavigator instance.

```typescript
function createNavigator(config?: NavigatorConfig): ExpozrNavigator;
```

**Parameters:**

- `config.expozrs: Record<string, ExpozrReference>` - Expozr configurations
- `config.cache?: CacheConfig` - Cache configuration
- `config.loading?: LoadingConfig` - Loading timeout and retry settings
- `config.moduleSystem?: ModuleSystemConfig` - Module system configuration

### Navigator Methods

#### `loadCargo<T>(expozr, cargo, options?)`

Load a module from a expozr.

```typescript
async loadCargo<T = any>(
  expozr: string,
  cargo: string,
  options?: LoadOptions
): Promise<LoadedCargo<T>>
```

**Returns:** `LoadedCargo<T>` with the following properties:

- `module: T` - The loaded module
- `cargo: Cargo` - Cargo metadata
- `expozr: ExpozrInfo` - Expozr information
- `loadedAt: number` - Timestamp of loading
- `fromCache: boolean` - Whether loaded from cache
- `format: ModuleFormat` - Format used
- `strategy: ModuleLoadingStrategy` - Strategy used

#### Other Methods

- `isCargoLoaded(expozr, cargo): boolean` - Check if cargo is loaded
- `getLoadedCargo(cacheKey): LoadedCargo | undefined` - Get cached cargo
- `reset(): Promise<void>` - Reset navigator and clear caches
- `getCacheStats(): object` - Get cache statistics

## ⚙️ Configuration

### Navigator Configuration

```typescript
interface NavigatorConfig {
  expozrs: Record<string, ExpozrReference>;
  cache?: CacheConfig;
  loading?: LoadingConfig;
  moduleSystem?: ModuleSystemConfig;
}
```

### Expozr Reference

```typescript
interface ExpozrReference {
  url: string; // Expozr base URL
  version?: string; // Version constraint (default: "^1.0.0")
}
```

### Cache Configuration

```typescript
interface CacheConfig {
  strategy: "memory" | "localStorage" | "indexedDB" | "none";
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
}
```

### Module System Configuration

```typescript
interface ModuleSystemConfig {
  primary?: "esm" | "umd" | "cjs"; // Primary module format to prefer
  fallbacks?: ("esm" | "umd" | "cjs")[]; // Fallback formats if primary fails
  strategy?: "dynamic" | "static" | "lazy" | "eager"; // Loading strategy
  hybrid?: boolean; // Whether to enable hybrid loading
}
```

### Load Options

```typescript
interface LoadOptions {
  timeout?: number; // Override default timeout
  retry?: RetryConfig; // Override default retry config
  cache?: boolean; // Whether to use cache
  fallback?: () => Promise<any>; // Fallback module if loading fails
  exports?: string[]; // Specific exports to extract
  cacheBusting?: boolean; // Whether to add cache busting parameters

  // Module system preferences (per-load overrides)
  moduleFormat?: "esm" | "umd" | "cjs"; // Module format preference
  fallbackFormats?: ("esm" | "umd" | "cjs")[]; // Fallback formats
  strategy?: "dynamic" | "static" | "lazy" | "eager"; // Loading strategy override
}
```

## 💾 Cache Strategies

- **`memory`** - In-memory cache (default, fastest)
- **`localStorage`** - Browser localStorage (persistent)
- **`indexedDB`** - Browser IndexedDB (persistent, large data)
- **`none`** - No caching (always fetch)

## ⚙️ Module System Configuration

The Navigator provides flexible module loading with support for different formats and strategies.

### Global Configuration

Set default preferences when creating the navigator:

```typescript
const navigator = createNavigator({
  expozrs: {
    /* ... */
  },
  moduleSystem: {
    primary: "esm", // Prefer ES modules
    fallbacks: ["umd", "cjs"], // Try UMD, then CJS if ESM fails
    strategy: "dynamic", // Use dynamic loading
    hybrid: true, // Enable hybrid mode for best compatibility
  },
});
```

### Per-Load Configuration

Override settings for specific loads:

```typescript
// Load with ESM preference
const esmModule = await navigator.loadCargo("remote", "Button", {
  moduleFormat: "esm",
  fallbackFormats: ["umd"],
  strategy: "dynamic",
});

// Load with UMD preference
const umdModule = await navigator.loadCargo("remote", "Button", {
  moduleFormat: "umd",
  fallbackFormats: ["esm", "cjs"],
  strategy: "eager",
});
```

### Module Formats

- **ESM** (`esm`) - ES Modules (modern, tree-shakeable, best performance)
- **UMD** (`umd`) - Universal Module Definition (browser + Node.js compatibility)
- **CJS** (`cjs`) - CommonJS (Node.js compatibility)

### Loading Strategies

- **Dynamic** (`dynamic`) - Load when needed (default, balances performance and memory)
- **Static** (`static`) - Load at build time (fastest runtime, larger bundles)
- **Lazy** (`lazy`) - Lazy loading with code splitting (smallest initial bundle)
- **Eager** (`eager`) - Load immediately when referenced (fastest subsequent access)

### Smart Defaults

The Navigator uses intelligent defaults:

1. **Format Preference**: ESM → UMD → CJS → Auto-detect
2. **Strategy**: Dynamic loading for best balance
3. **Fallbacks**: Automatic format fallback on failure
4. **Error Recovery**: Graceful degradation with detailed error reporting

## 🔄 Module Loaders

The package includes several module loaders:

- **UniversalModuleLoader** - Auto-detects environment (Browser/Node.js)
- **BrowserModuleLoader** - Optimized for browser environments
- **NodeModuleLoader** - Optimized for Node.js environments
- **UMDModuleLoader** - Specialized UMD module loading

## 🤖 Auto-Loader

For simplified usage, the package provides an auto-loader utility:

```typescript
import { createAutoLoader } from "@expozr/navigator";

const loader = await createAutoLoader({
  expozrs: {
    "math-utils": {
      url: "http://localhost:3001",
      modules: {
        calculator: "calculator",
        advanced: "advanced",
      },
    },
  },
  autoExpose: true, // Expose functions globally
  globalNamespace: "mathApp", // Global namespace (default: "expozr")
});

// Functions are automatically available
const result = mathApp.add(5, 3);
```

## 💡 Examples

### Loading React Components

```typescript
import React from "react";
import { createNavigator } from "@expozr/navigator";

const navigator = createNavigator({
  expozrs: {
    "ui-components": {
      url: "http://localhost:3001"
    }
  },
  // Global module system preferences
  moduleSystem: {
    primary: "esm",
    fallbacks: ["umd", "cjs"],
    strategy: "dynamic",
    hybrid: true,
  },
});

// Component with ESM preference
const RemoteButton = React.lazy(() =>
  navigator.loadCargo("ui-components", "Button", {
    moduleFormat: "esm",
    fallbackFormats: ["umd"],
    strategy: "dynamic",
  })
    .then(cargo => ({ default: cargo.module.Button }))
);

// Component with UMD preference (for legacy compatibility)
const LegacyComponent = React.lazy(() =>
  navigator.loadCargo("ui-components", "LegacyWidget", {
    moduleFormat: "umd",
    fallbackFormats: ["esm"],
    strategy: "eager",
  })
    .then(cargo => ({ default: cargo.module.LegacyWidget }))
);

function App() {
  return (
    <div>
      <React.Suspense fallback={<div>Loading ESM button...</div>}>
        <RemoteButton variant="primary">ESM Button</RemoteButton>
      </React.Suspense>

      <React.Suspense fallback={<div>Loading legacy component...</div>}>
        <LegacyComponent />
      </React.Suspense>
    </div>
  );
}
```

### Using with TypeScript

```typescript
interface MathModule {
  add(a: number, b: number): number;
  multiply(a: number, b: number): number;
}

const mathCargo = await navigator.loadCargo<MathModule>("utils", "math");
const { add, multiply } = mathCargo.module;

const sum = add(5, 3); // TypeScript knows the signature
const product = multiply(4, 7); // Full type safety
```

### Error Handling

```typescript
try {
  const module = await navigator.loadCargo("remote", "nonexistent");
} catch (error) {
  if (error instanceof CargoNotFoundError) {
    console.log(`Cargo not found: ${error.cargo}`);
  } else if (error instanceof ExpozrNotFoundError) {
    console.log(`Expozr not found: ${error.expozr}`);
  } else {
    console.log("Loading failed:", error.message);
  }
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Module Not Loading

**Problem:** Module fails to load with network errors.

**Solution:**

- Check if the expozr URL is correct and accessible
- Verify CORS settings on the remote server
- Use EnhancedNavigator for better format fallbacks

#### 2. Cache Issues

**Problem:** Modules not updating after changes.

**Solution:**

```typescript
// Clear cache and reload
await navigator.reset();
const freshModule = await navigator.loadCargo("remote", "module");
```

#### 3. Format Compatibility

**Problem:** Module loads but exports are undefined.

**Solution:**

- Use EnhancedNavigator for automatic format detection
- Check the module's export format in the expozr inventory
- Verify the module is properly built for your target environment

#### 4. Performance Issues

**Problem:** Slow loading times.

**Solution:**

- Use appropriate cache strategy (`memory` for speed, `localStorage` for persistence)
- Choose optimal loading strategy (`eager` for critical components, `lazy` for optional ones)
- Implement module preloading for critical paths
- Prefer ESM format for better tree-shaking and performance

#### 5. Module Format Issues

**Problem:** Module loads but functions/components are undefined.

**Solution:**

```typescript
// Check what format was actually loaded
const cargo = await navigator.loadCargo("remote", "Button");
console.log(
  `Loaded using ${cargo.format} format with ${cargo.strategy} strategy`
);

// Try different format preferences
const cargo = await navigator.loadCargo("remote", "Button", {
  moduleFormat: "umd", // Try UMD if ESM fails
  fallbackFormats: ["esm", "cjs"],
});
```

#### 6. Loading Strategy Problems

**Problem:** Components loading too slowly or causing bundle bloat.

**Solution:**

```typescript
// For critical components - use eager loading
const criticalCargo = await navigator.loadCargo("remote", "Header", {
  strategy: "eager",
});

// For optional components - use lazy loading
const optionalCargo = await navigator.loadCargo("remote", "Sidebar", {
  strategy: "lazy",
});
```

### Debug Mode

Enable debug logging:

```typescript
// Enable debug logs in development
if (process.env.NODE_ENV === "development") {
  // EnhancedNavigator shows detailed format attempts
  const navigator = createNavigator({ enhanced: true });
}
```

### Performance Monitoring

```typescript
const stats = navigator.getCacheStats();
console.log("Cache performance:", stats);

// Navigator provides detailed format and strategy information
const cargo = await navigator.loadCargo("remote", "module");
console.log(`Loaded ${cargo.format} format using ${cargo.strategy} strategy`);

// Monitor loading performance by format
const startTime = Date.now();
const esmCargo = await navigator.loadCargo("remote", "Button", {
  moduleFormat: "esm",
});
console.log(`ESM loading took: ${Date.now() - startTime}ms`);

// Compare different strategies
const dynamicStart = Date.now();
const dynamicCargo = await navigator.loadCargo("remote", "Component", {
  strategy: "dynamic",
});
console.log(`Dynamic loading: ${Date.now() - dynamicStart}ms`);

const eagerStart = Date.now();
const eagerCargo = await navigator.loadCargo("remote", "Component", {
  strategy: "eager",
});
console.log(`Eager loading: ${Date.now() - eagerStart}ms`);
```

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

## 📄 License

MIT - see [LICENSE](../../LICENSE) for details.
