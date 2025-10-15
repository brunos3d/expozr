# @expozr/webpack-adapter

[![npm version](https://badge.fury.io/js/@expozr%2Fwebpack-adapter.svg)](https://badge.fury.io/js/@expozr%2Fwebpack-adapter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Webpack integration for the Expozr module federation ecosystem

The Webpack adapter provides seamless integration between [Webpack](https://webpack.js.org/) and the [Expozr](https://github.com/brunos3d/expozr) module federation system. It enables you to build and consume federated modules with Webpack's mature ecosystem, robust optimization features, and extensive plugin architecture.

## Features

- 🎯 **UMD-First Architecture**: Optimized UMD builds for maximum Navigator compatibility
- 🔧 **Automatic Configuration**: Zero-config setup with intelligent defaults
- 🌐 **Development Server Integration**: Hot reloading with CORS support
- 📦 **Inventory Management**: Automatic generation and serving of module inventories
- 🔗 **Expozr & Host Support**: Both module producers and consumers
- ⚡ **Production Optimized**: Tree-shaking and code-splitting ready
- 🛡️ **Type Safety**: Full TypeScript support with optimized configurations
- 🎨 **Developer Experience**: Warning suppression and clear error messages
- 🌍 **Cross-Origin Ready**: Built-in CORS configuration for distributed deployments

## Installation

```bash
npm install @expozr/webpack-adapter
# or
yarn add @expozr/webpack-adapter
# or
pnpm add @expozr/webpack-adapter
```

## Quick Start

### Expozr (Module Producer)

Create an expozr that exposes modules to be consumed by other applications:

```javascript
// webpack.config.js
const { createExpozrPlugin } = require("@expozr/webpack-adapter");

module.exports = {
  entry: "./src/index.ts",
  mode: "development",
  plugins: [
    createExpozrPlugin(), // Auto-discovers expozr.config.ts
  ],
  devServer: {
    port: 3001,
  },
};
```

```typescript
// expozr.config.ts
import { defineConfig } from "@expozr/core";

export default defineConfig({
  name: "my-expozr",
  expose: {
    "./Button": "./src/components/Button.tsx",
    "./utils": "./src/utils/index.ts",
  },
  build: {
    format: ["umd"], // UMD for optimal Navigator compatibility
    outDir: "dist",
  },
});
```

### Host (Module Consumer)

Create a host application that consumes remote modules:

```javascript
// webpack.config.js
const {
  createHostPlugin,
  createHostWebpackConfig,
} = require("@expozr/webpack-adapter");

module.exports = createHostWebpackConfig({
  entry: "./src/index.ts",
  plugins: [
    createHostPlugin({
      config: {
        expozrs: {
          "design-system": {
            url: "http://localhost:3001",
          },
          "shared-utils": {
            url: "https://cdn.example.com/utils",
          },
        },
      },
    }),
  ],
});
```

## API Reference

### Plugins

#### `createExpozrPlugin(options)`

Creates a webpack plugin for expozr applications that expose federated modules.

**Options:**

- `configFile?: string` - Path to Expozr config file (default: auto-discovery)
- `config?: ExpozrConfig` - Direct config object (overrides configFile)
- `outputPath?: string` - Custom output path (overrides config)
- `publicPath?: string` - Custom public path (overrides config)

**Example:**

```javascript
const { createExpozrPlugin } = require("@expozr/webpack-adapter");

// Basic usage - auto-discovers expozr.config.ts
createExpozrPlugin();

// Custom config file
createExpozrPlugin({
  configFile: "./my-expozr.config.js",
});

// Direct configuration
createExpozrPlugin({
  config: {
    name: "my-expozr",
    expose: {
      "./Component": "./src/Component.tsx",
    },
  },
});
```

#### `createHostPlugin(options)`

Creates a webpack plugin for host applications that consume remote federated modules.

**Options:**

- `configFile?: string` - Path to host config file
- `config?: HostConfig` - Direct config object (overrides configFile)

**Example:**

```javascript
const { createHostPlugin } = require("@expozr/webpack-adapter");

createHostPlugin({
  config: {
    expozrs: {
      "ui-components": {
        url: "http://localhost:4000",
      },
      "business-logic": {
        url: "https://api.example.com/modules",
      },
    },
  },
});
```

### Adapter Class

#### `WebpackAdapter`

The main adapter class implementing the Expozr bundler adapter interface.

```javascript
const { WebpackAdapter } = require("@expozr/webpack-adapter");

const adapter = new WebpackAdapter();

// Configure for expozr build
const expozrWebpackConfig = adapter.configureExpozr(
  expozrConfig,
  baseWebpackConfig
);

// Configure for host build
const hostWebpackConfig = adapter.configureHost(hostConfig, baseWebpackConfig);

// Check if webpack is available
console.log("Webpack available:", adapter.isAvailable());
```

**Methods:**

- `configureExpozr(config, bundlerConfig)` - Configure webpack for expozr builds
- `configureHost(config, bundlerConfig)` - Configure webpack for host builds
- `getDefaultConfig()` - Get default webpack configuration
- `isAvailable()` - Check if webpack is available
- `createExpozrPlugin(config)` - Create ExpozrPlugin instance
- `createHostPlugin(config)` - Create ExpozrHostPlugin instance
- `getIgnoreWarnings()` - Get warning suppressions for better DX

### Utility Functions

#### `createHostWebpackConfig(customConfig)`

Creates a webpack configuration optimized for Expozr host applications with sensible defaults.

```javascript
const { createHostWebpackConfig } = require("@expozr/webpack-adapter");

module.exports = createHostWebpackConfig({
  entry: "./src/app.tsx",
  plugins: [
    // your plugins
  ],
  devServer: {
    port: 3000,
  },
});
```

**Features:**

- Pre-configured TypeScript support
- CORS headers for development
- Dynamic import support
- Warning suppression
- Optimized resolve configuration

#### `suppressExpozrWarnings()`

Returns `ignoreWarnings` configuration to suppress common Expozr-related webpack warnings.

```javascript
const { suppressExpozrWarnings } = require("@expozr/webpack-adapter");

module.exports = {
  // ... your webpack config
  ignoreWarnings: [
    ...suppressExpozrWarnings(),
    // your custom warning filters
  ],
};
```

## Configuration

### Expozr Configuration

Your `expozr.config.ts` file defines what modules to expose and how to build them:

```typescript
import { defineConfig } from "@expozr/core";

export default defineConfig({
  name: "my-design-system",

  // Modules to expose
  expose: {
    "./Button": "./src/components/Button/index.tsx",
    "./Input": "./src/components/Input/index.tsx",
    "./Theme": "./src/theme/index.ts",
    "./utils/validators": "./src/utils/validators.ts",
  },

  // Build configuration
  build: {
    format: ["umd"], // UMD recommended for webpack + Navigator
    target: "web", // Target environment
    outDir: "dist", // Output directory
    publicPath: "/", // Public path for assets
    sourcemap: true, // Generate sourcemaps
    minify: false, // Minification (use webpack optimization instead)
  },

  // Module system configuration
  moduleSystem: {
    primary: "umd",
    fallbacks: ["esm"],
    strategy: "dynamic",
  },

  // Dependencies configuration
  dependencies: {
    react: "^18.0.0",
    "react-dom": "^18.0.0",
  },
});
```

### Host Configuration

Configure which expozrs your host application consumes:

```typescript
interface HostConfig {
  expozrs: {
    [expozrName: string]: {
      url: string; // Expozr URL
      scope?: string; // Optional scope for name resolution
      timeout?: number; // Request timeout in ms
      retries?: number; // Number of retry attempts
      version?: string; // Version constraint (semver)
      fallback?: string; // Fallback URL
    };
  };

  // Optional catalog configuration
  catalog?: {
    url: string;
    refreshInterval?: number;
  };

  // Cache configuration
  cache?: {
    strategy: "memory" | "localStorage" | "indexedDB";
    ttl?: number;
  };
}
```

### Webpack Configuration

The adapter integrates seamlessly with your existing webpack configuration:

```javascript
// webpack.config.js
const path = require("path");
const {
  createExpozrPlugin,
  suppressExpozrWarnings,
} = require("@expozr/webpack-adapter");

module.exports = {
  entry: "./src/index.ts",
  mode: "development",

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  plugins: [
    createExpozrPlugin({
      configFile: "./expozr.config.ts",
    }),
  ],

  // Suppress Expozr-related warnings for cleaner output
  ignoreWarnings: suppressExpozrWarnings(),

  // UMD-optimized output
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    library: {
      name: "[name]",
      type: "umd",
    },
    globalObject: "typeof self !== 'undefined' ? self : this",
    clean: true,
  },

  // Development server with CORS
  devServer: {
    port: 3001,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
    },
    static: {
      directory: path.join(__dirname, "dist"),
    },
  },

  // Production optimizations
  optimization: {
    // Disable optimizations that break UMD
    concatenateModules: false,
    usedExports: false,
    sideEffects: false,
    splitChunks: false,
    runtimeChunk: false,
  },
};
```

## Advanced Configuration

### Multiple Output Formats

While UMD is recommended for maximum compatibility, you can configure multiple formats:

```typescript
// expozr.config.ts
export default defineConfig({
  name: "multi-format-expozr",
  expose: {
    "./utils": "./src/utils.ts",
  },
  build: {
    format: ["umd", "esm"], // Multiple formats
    outDir: "dist",
  },
});
```

The webpack adapter will generate:

- `dist/utils.js` (UMD format)
- `dist/utils.mjs` (ESM format)

### TypeScript Integration

The adapter automatically configures TypeScript for optimal expozr builds:

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              // The adapter optimizes these settings
              compilerOptions: {
                target: "es2018",
                module: "esnext",
                moduleResolution: "node",
                declaration: true,
                declarationMap: true,
              },
            },
          },
        ],
      },
    ],
  },
};
```

### External Dependencies

Configure external dependencies to avoid bundling common libraries:

```javascript
// webpack.config.js
module.exports = {
  externals: {
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "react",
      root: "React", // Global variable name
    },
    "react-dom": {
      commonjs: "react-dom",
      commonjs2: "react-dom",
      amd: "react-dom",
      root: "ReactDOM",
    },
  },
};
```

### Production Optimization

For production builds, enable webpack's optimization features:

```javascript
// webpack.config.js
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.log
          },
          format: {
            comments: false, // Remove comments
          },
        },
        extractComments: false,
      }),
    ],

    // Enable these optimizations carefully with UMD
    usedExports: true,
    sideEffects: false,
  },
};
```

## Development Workflow

### Local Development

1. **Start the expozr development server:**

   ```bash
   cd packages/my-expozr
   npm run dev  # webpack serve
   ```

2. **Start the host application:**

   ```bash
   cd apps/host-app
   npm run dev
   ```

3. **Access inventory endpoint:**
   ```
   http://localhost:3001/inventory.json
   ```

### Production Deployment

1. **Build the expozr:**

   ```bash
   npm run build  # webpack --mode=production
   ```

2. **Deploy static files:**

   ```bash
   # Deploy dist/ folder to CDN or static hosting
   aws s3 sync dist/ s3://my-expozr-bucket/
   ```

3. **Update host configuration:**
   ```typescript
   const config = {
     expozrs: {
       "my-expozr": {
         url: "https://cdn.example.com/my-expozr",
       },
     },
   };
   ```

## Troubleshooting

### Common Issues

#### 1. Module Not Found Errors

**Problem:** `Module not found: Error: Can't resolve 'my-expozr/Button'`

**Solution:** Ensure the expozr is running and the inventory is accessible:

```bash
# Check if inventory is available
curl http://localhost:3001/inventory.json

# Verify the expose configuration
cat expozr.config.ts
```

#### 2. CORS Errors

**Problem:** `Access to fetch at 'http://localhost:3001' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution:** The adapter automatically configures CORS headers, but verify your setup:

```javascript
// webpack.config.js
module.exports = {
  devServer: {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
  },
};
```

#### 3. UMD Global Issues

**Problem:** `Cannot read property 'Button' of undefined` when accessing UMD exports

**Solution:** Verify your library configuration:

```javascript
// webpack.config.js
module.exports = {
  output: {
    library: {
      name: "MyExpozr", // Must match what host expects
      type: "umd",
    },
    globalObject: "typeof self !== 'undefined' ? self : this",
  },
};
```

#### 4. TypeScript Declaration Issues

**Problem:** Missing or incorrect TypeScript declarations

**Solution:** Enable declaration generation:

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            compilerOptions: {
              declaration: true,
              declarationMap: true,
              outDir: "dist/types",
            },
          },
        },
      },
    ],
  },
};
```

### Performance Tips

1. **Use webpack-bundle-analyzer** to understand bundle size:

   ```bash
   npm install --save-dev webpack-bundle-analyzer
   ```

2. **Enable tree-shaking** for smaller bundles:

   ```javascript
   module.exports = {
     optimization: {
       usedExports: true,
       sideEffects: false, // or array of files with side effects
     },
   };
   ```

3. **Use dynamic imports** for code splitting:

   ```typescript
   // Instead of static imports
   import { heavyUtility } from "./heavy-utils";

   // Use dynamic imports
   const loadHeavyUtility = () => import("./heavy-utils");
   ```

## Comparison with Other Bundlers

| Feature                      | Webpack      | Vite         | Rollup       |
| ---------------------------- | ------------ | ------------ | ------------ |
| **UMD Support**              | ✅ Excellent | ⚠️ Limited   | ✅ Good      |
| **Development Speed**        | ⚠️ Moderate  | ✅ Very Fast | ⚠️ Moderate  |
| **Production Optimization**  | ✅ Excellent | ✅ Good      | ✅ Excellent |
| **Plugin Ecosystem**         | ✅ Massive   | ✅ Growing   | ✅ Good      |
| **Configuration Complexity** | ⚠️ High      | ✅ Low       | ⚠️ Moderate  |
| **Navigator Compatibility**  | ✅ Perfect   | ✅ Good      | ✅ Good      |

### When to Choose Webpack

**Choose webpack when you:**

- Need maximum UMD compatibility
- Have complex build requirements
- Use advanced webpack features (federation, workers, etc.)
- Require extensive plugin ecosystem
- Need mature production optimizations
- Have existing webpack expertise in your team

**Consider alternatives when you:**

- Want the fastest development experience (→ Vite)
- Need the smallest bundle sizes (→ Rollup)
- Prefer minimal configuration (→ Vite)

## Examples

Check out the [examples directory](https://github.com/brunos3d/expozr/tree/main/examples/webpack) for complete working examples:

- **[Get Started](https://github.com/brunos3d/expozr/tree/main/examples/webpack/get-started)** - Basic setup
- **[React Components](https://github.com/brunos3d/expozr/tree/main/examples/webpack/react)** - React component federation
- **[UMD Library](https://github.com/brunos3d/expozr/tree/main/examples/webpack/umd)** - UMD library federation
- **[Vanilla JS](https://github.com/brunos3d/expozr/tree/main/examples/webpack/vanilla)** - Pure JavaScript modules
- **[ESM Support](https://github.com/brunos3d/expozr/tree/main/examples/webpack/esm)** - Modern ESM builds

## Migration Guide

### From Webpack Module Federation

If you're migrating from webpack's native Module Federation:

```javascript
// Before: webpack.config.js with ModuleFederationPlugin
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "myExpozr",
      filename: "remoteEntry.js",
      exposes: {
        "./Button": "./src/Button.tsx",
      },
    }),
  ],
};

// After: webpack.config.js with Expozr
module.exports = {
  plugins: [
    createExpozrPlugin(), // Uses expozr.config.ts
  ],
};
```

```typescript
// Create: expozr.config.ts
export default defineConfig({
  name: "myExpozr",
  expose: {
    "./Button": "./src/Button.tsx",
  },
});
```

### From Other Bundlers

See the [migration guide](https://github.com/brunos3d/expozr/blob/main/docs/migration.md) for detailed instructions on migrating from other bundlers.

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

### Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/brunos3d/expozr.git
   cd expozr
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the webpack adapter:

   ```bash
   cd packages/adapters/webpack
   npm run build
   ```

4. Run tests:
   ```bash
   npm test
   ```

## License

MIT © [Bruno Silva](https://github.com/brunos3d)

## Related

- [@expozr/core](../core) - Core Expozr functionality
- [@expozr/navigator](../navigator) - Module loading and navigation
- [@expozr/vite-adapter](../vite) - Vite integration
- [@expozr/adapter-sdk](../sdk) - Shared adapter utilities
