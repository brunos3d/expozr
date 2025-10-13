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
});

// Load a remote module
const buttonModule = await navigator.loadCargo("components", "Button");
const { Button } = buttonModule.module;
```

## 🔀 Navigator Types

### 🚀 EnhancedNavigator (Default)

The **EnhancedNavigator** is the recommended choice for most applications. It provides advanced features and robust module loading capabilities.

#### ✨ Features

- **🎯 Smart Format Detection**: Automatically detects and loads the best available module format (ESM, UMD, CJS)
- **🔄 Multi-Format Support**: Tries multiple formats in order of preference (ESM → UMD → CJS → Auto)
- **🧠 Intelligent Fallbacks**: If one format fails, automatically tries alternatives
- **⚡ Advanced Module System**: Integration with Expozr's global module system
- **🛡️ Error Recovery**: Comprehensive error handling with detailed feedback
- **📊 Format Tracking**: Tracks which format was successfully loaded
- **🎪 Strategy Awareness**: Reports loading strategy used (enhanced/fallback)

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

## 💾 Cache Strategies

- **`memory`** - In-memory cache (default, fastest)
- **`localStorage`** - Browser localStorage (persistent)
- **`indexedDB`** - Browser IndexedDB (persistent, large data)
- **`none`** - No caching (always fetch)

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
  }
});

// Create lazy-loaded component
const RemoteButton = React.lazy(() =>
  navigator.loadCargo("ui-components", "Button")
    .then(cargo => ({ default: cargo.module.Button }))
);

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RemoteButton variant="primary">Click me!</RemoteButton>
    </Suspense>
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
- Consider SimpleNavigator for performance-critical scenarios
- Implement module preloading for critical paths

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

// EnhancedNavigator provides detailed format information
const cargo = await navigator.loadCargo("remote", "module");
console.log(`Loaded ${cargo.format} format using ${cargo.strategy} strategy`);
```

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

## 📄 License

MIT - see [LICENSE](../../LICENSE) for details.
