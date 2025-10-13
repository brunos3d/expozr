# @expozr/navigator

Universal runtime loader for the Expozr ecosystem, providing seamless module federation and dynamic loading capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Navigator Types](#navigator-types)
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

The Navigator package provides two main implementations for loading remote modules:

- **🚀 EnhancedNavigator** - Full-featured navigator with advanced module system support
- **⚡ SimpleNavigator** - Lightweight navigator for basic use cases

Both navigators extend a common `BaseNavigator` class that provides shared functionality like caching, event handling, and inventory management.

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

#### 🔧 How it Works

```typescript
import { createNavigator } from "@expozr/navigator";

// Creates an EnhancedNavigator by default
const navigator = createNavigator({
  expozrs: {
    "my-remote": {
      url: "http://localhost:3001",
      version: "^1.0.0",
    },
  },
});

// Automatically tries multiple formats:
// 1. http://localhost:3001/my-module.mjs (ESM)
// 2. http://localhost:3001/my-module.esm.js (ESM)
// 3. http://localhost:3001/my-module.umd.js (UMD)
// 4. http://localhost:3001/my-module.js (UMD fallback)
// 5. http://localhost:3001/my-module.cjs (CommonJS)
// 6. Original entry path (Auto-detect)
const module = await navigator.loadCargo("my-remote", "my-module");
```

#### 📈 Benefits

- **🎯 Maximum Compatibility**: Works with all module formats
- **🚀 Optimal Performance**: Loads the most efficient format available
- **🛡️ Robust Error Handling**: Graceful degradation when formats fail
- **🔮 Future-Proof**: Supports emerging module standards
- **📊 Detailed Feedback**: Provides information about what was loaded and how

#### 🎨 Best For

- Production applications
- Complex module federation scenarios
- When you need maximum compatibility
- Applications that consume various module formats
- When detailed loading information is required

---

### ⚡ SimpleNavigator

The **SimpleNavigator** is a lightweight alternative focused on simplicity and minimal overhead.

#### ✨ Features

- **🪶 Lightweight**: Minimal dependencies and smaller bundle size
- **⚡ Fast**: Direct loading without format detection overhead
- **🎯 Single Format**: Uses UniversalModuleLoader for straightforward loading
- **🧩 Simple API**: Easy to understand and debug
- **💾 Basic Caching**: Standard inventory and module caching
- **📊 Essential Stats**: Basic cache statistics

#### 🔧 How it Works

```typescript
import { createNavigator } from "@expozr/navigator";

// Explicitly create a SimpleNavigator
const navigator = createNavigator({
  enhanced: false, // Use SimpleNavigator
  expozrs: {
    "my-remote": {
      url: "http://localhost:3001",
      version: "^1.0.0",
    },
  },
});

// Loads modules using UniversalModuleLoader
// Attempts to load the exact URL specified in the inventory
const module = await navigator.loadCargo("my-remote", "my-module");
```

#### 📈 Benefits

- **🪶 Smaller Bundle**: Reduced JavaScript payload
- **⚡ Faster Startup**: No module system initialization overhead
- **🎯 Predictable**: Direct loading behavior
- **🧩 Simple Debugging**: Easier to trace and understand
- **💡 Clear Errors**: Straightforward error messages

#### 🎨 Best For

- Simple applications with known module formats
- Performance-critical scenarios where bundle size matters
- Development and testing environments
- When you need predictable, direct loading behavior
- Applications with homogeneous module formats

---

## 🔍 Key Differences Comparison

| Feature                       | EnhancedNavigator               | SimpleNavigator              |
| ----------------------------- | ------------------------------- | ---------------------------- |
| **Bundle Size**               | Larger (full features)          | Smaller (lightweight)        |
| **Format Detection**          | ✅ Smart auto-detection         | ❌ Uses provided URL         |
| **Multi-Format Support**      | ✅ ESM, UMD, CJS + fallbacks    | ❌ Single format attempt     |
| **Error Recovery**            | ✅ Multiple fallback strategies | ❌ Fails on first error      |
| **Loading Strategy**          | Enhanced module system          | Universal loader             |
| **Format Tracking**           | ✅ Reports format used          | ❌ Generic "auto" format     |
| **Module System Integration** | ✅ Full integration             | ❌ Basic loading             |
| **Startup Time**              | Slower (initialization)         | Faster (direct)              |
| **Use Case**                  | Production, complex scenarios   | Simple, performance-critical |

---

## 📦 Installation

```bash
npm install @expozr/navigator
```

## 🚀 Quick Start

### Using Enhanced Navigator (Recommended)

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

### Using Simple Navigator

```typescript
import { createNavigator } from "@expozr/navigator";

const navigator = createNavigator({
  enhanced: false, // Use SimpleNavigator
  expozrs: {
    utils: {
      url: "http://localhost:3001",
    },
  },
});

// Direct module loading
const mathModule = await navigator.loadCargo("utils", "math");
const { add, multiply } = mathModule.module;
```

## 📚 API Reference

### Factory Functions

#### `createNavigator(config?)`

Creates a navigator instance (EnhancedNavigator by default).

```typescript
function createNavigator(config?: NavigatorConfig): INavigator;
```

**Parameters:**

- `config.enhanced?: boolean` - Use EnhancedNavigator (default: `true`)
- `config.expozrs: Record<string, ExpozrReference>` - Expozr configurations
- `config.cache?: CacheConfig` - Cache configuration
- `config.loading?: LoadingConfig` - Loading timeout and retry settings

#### `createSimpleNavigator(config?)`

Creates a SimpleNavigator instance directly.

```typescript
function createSimpleNavigator(config?: any): SimpleNavigator;
```

#### `createEnhancedNavigator(config?)`

Creates an EnhancedNavigator instance directly.

```typescript
function createEnhancedNavigator(config?: any): EnhancedNavigator;
```

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
- `format: ModuleFormat` - Format used (EnhancedNavigator only)
- `strategy: ModuleLoadingStrategy` - Strategy used (EnhancedNavigator only)

#### Other Methods

- `isCargoLoaded(expozr, cargo): boolean` - Check if cargo is loaded
- `getLoadedCargo(cacheKey): LoadedCargo | undefined` - Get cached cargo
- `reset(): Promise<void>` - Reset navigator and clear caches
- `getCacheStats(): object` - Get cache statistics

## ⚙️ Configuration

### Navigator Configuration

```typescript
interface NavigatorConfig {
  enhanced?: boolean; // Use EnhancedNavigator (default: true)
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
