# @expozr/vite-adapter

[![npm version](https://badge.fury.io/js/@expozr%2Fvite-adapter.svg)](https://badge.fury.io/js/@expozr%2Fvite-adapter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Vite integration for the Expozr module federation ecosystem

The Vite adapter provides seamless integration between [Vite](https://vitejs.dev/) and the [Expozr](https://github.com/brunos3d/expozr) module federation system. It enables you to build and consume federated modules with Vite's fast development experience and optimized production builds.

## Features

- 🚀 **Multiple Module Formats**: ESM, UMD, and CommonJS support
- 🔧 **Library Mode Configuration**: Optimized builds for federated modules
- 🌐 **Development Server Integration**: Hot reloading and live updates
- 📦 **Inventory Management**: Automatic generation and serving of module inventories
- 🔗 **Expozr & Host Support**: Both module producers and consumers
- ⚡ **Fast Builds**: Leverages Vite's lightning-fast bundling
- 🛡️ **Type Safety**: Full TypeScript support with proper type exports
- 🎯 **CORS Configuration**: Ready for cross-origin module federation

## Installation

```bash
npm install @expozr/vite-adapter
# or
yarn add @expozr/vite-adapter
# or
pnpm add @expozr/vite-adapter
```

## Quick Start

### Expozr (Module Producer)

Create an expozr that exposes modules to be consumed by other applications:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { expozr } from "@expozr/vite-adapter";

export default defineConfig({
  plugins: [expozr()],
});
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
    format: ["es", "umd"],
    outDir: "dist",
  },
});
```

### Host (Module Consumer)

Create a host application that consumes remote modules:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { expozrHost } from "@expozr/vite-adapter";

export default defineConfig({
  plugins: [
    expozrHost({
      hostConfig: {
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

#### `expozr(options)`

Vite plugin for expozr applications that expose federated modules.

**Options:**

- `configPath?: string` - Path to Expozr config file (default: `"expozr.config.ts"`)
- `development?: boolean` - Enable development features (default: `true`)
- `inventoryPath?: string` - Custom inventory output path (default: `"dist/inventory.json"`)

**Example:**

```typescript
import { expozr } from "@expozr/vite-adapter";

expozr({
  configPath: "./my-expozr.config.js",
  development: process.env.NODE_ENV === "development",
  inventoryPath: "public/modules.json",
});
```

#### `expozrHost(options)`

Vite plugin for host applications that consume remote federated modules.

**Options:**

- `hostConfig: HostConfig` - Host configuration object
- `development?: boolean` - Enable development features (default: `true`)

**Example:**

```typescript
import { expozrHost } from "@expozr/vite-adapter";

expozrHost({
  hostConfig: {
    expozrs: {
      "ui-components": {
        url: "http://localhost:4000",
        scope: "ui",
      },
    },
  },
  development: true,
});
```

### Adapter Class

#### `ViteAdapter`

The main adapter class implementing the Expozr bundler adapter interface.

```typescript
import { ViteAdapter } from "@expozr/vite-adapter";

const adapter = new ViteAdapter();

// Configure for expozr build
const expozrConfig = adapter.configureExpozr(expozrConfig, viteConfig);

// Configure for host build
const hostConfig = adapter.configureHost(hostConfig, viteConfig);
```

**Methods:**

- `configureExpozr(config, bundlerConfig)` - Configure Vite for expozr builds
- `configureHost(config, bundlerConfig)` - Configure Vite for host builds
- `getDefaultConfig()` - Get default Vite configuration
- `isAvailable()` - Check if Vite is available
- `configureExternals(moduleSystem, target?)` - Configure external dependencies

### Utility Functions

#### Configuration Utilities

```typescript
import {
  createEntryPoints,
  createExpozrAliases,
  createHostExternals,
  loadExpozrConfig,
} from "@expozr/vite-adapter";

// Create entry points from Expozr config
const entries = createEntryPoints(config);

// Create aliases for expozr modules
const aliases = createExpozrAliases(expozrs);

// Create externals for host builds
const externals = createHostExternals(expozrs);

// Load configuration file
const config = await loadExpozrConfig("./expozr.config.ts");
```

#### Format Utilities

```typescript
import {
  normalizeViteFormats,
  getFileNamePattern,
  createOutputConfig,
  createFormatConfig,
} from "@expozr/vite-adapter";

// Normalize module formats for Vite
const formats = normalizeViteFormats(["esm", "umd"]);

// Get filename pattern for format
const pattern = getFileNamePattern("es");

// Create output configuration
const output = createOutputConfig(["es", "umd"]);
```

#### Development Utilities

```typescript
import {
  createWarningFilter,
  configureCORS,
  configureInventoryServing,
  writeInventoryFile,
} from "@expozr/vite-adapter";

// Create Rollup warning filter
const onwarn = createWarningFilter();

// Configure CORS for dev server
configureCORS(server);

// Setup inventory serving
configureInventoryServing(server, "./dist/inventory.json");
```

## Configuration

### Expozr Configuration

Your `expozr.config.ts` file defines what modules to expose:

```typescript
import { defineConfig } from "@expozr/core";

export default defineConfig({
  name: "my-design-system",

  // Modules to expose
  expose: {
    "./Button": "./src/components/Button/index.ts",
    "./Input": "./src/components/Input/index.ts",
    "./utils/theme": "./src/utils/theme.ts",
  },

  // Build configuration
  build: {
    format: ["es", "umd"], // Module formats
    target: "universal", // Build target
    outDir: "dist", // Output directory
    sourcemap: true, // Generate sourcemaps
    minify: true, // Minify output
  },

  // Module system configuration
  moduleSystem: {
    primary: "esm",
    fallbacks: ["umd"],
    strategy: "dynamic",
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
      scope?: string; // Optional scope
      timeout?: number; // Request timeout
      retries?: number; // Retry attempts
    };
  };
}
```

### Vite Configuration

The adapter integrates seamlessly with your existing Vite configuration:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { expozr } from "@expozr/vite-adapter";

export default defineConfig({
  plugins: [
    react(),
    expozr({
      development: true,
    }),
  ],

  build: {
    // Additional Vite build options
    target: "esnext",
    sourcemap: true,
  },

  server: {
    // Development server options
    port: 3000,
    host: true,
  },
});
```

## Module Formats

The adapter supports multiple output formats:

### ESM (ES Modules)

```typescript
// Recommended for modern applications
format: ["es"];
// Output: dist/index.mjs
```

### UMD (Universal Module Definition)

```typescript
// For maximum compatibility
format: ["umd"];
// Output: dist/index.umd.js
```

### CommonJS

```typescript
// For Node.js environments
format: ["cjs"];
// Output: dist/index.cjs
```

### Multiple Formats

```typescript
// Generate all formats
format: ["es", "umd", "cjs"];
```

## Development Workflow

### 1. Start Expozr Development

```bash
# Terminal 1: Start expozr in dev mode
cd my-expozr
npm run dev
```

Your expozr will be available at `http://localhost:3000` with:

- Hot module replacement
- Inventory serving at `/inventory.json`
- Module serving with proper CORS headers

### 2. Start Host Development

```bash
# Terminal 2: Start host application
cd my-host-app
npm run dev
```

The host will automatically:

- Resolve warehouse module imports
- Proxy requests to warehouse endpoints
- Provide hot reloading for both local and remote modules

### 3. Production Build

```bash
# Build expozr for production
cd my-expozr
npm run build

# Build host for production
cd my-host-app
npm run build
```

## Advanced Usage

### Custom Plugin Configuration

```typescript
import { defineConfig } from "vite";
import { expozr } from "@expozr/vite-adapter";

export default defineConfig({
  plugins: [
    expozr({
      configPath: "./config/expozr.config.js",
      development: process.env.NODE_ENV === "development",
      inventoryPath: "public/federation/inventory.json",
    }),
  ],

  build: {
    rollupOptions: {
      // Custom external dependencies
      external: ["react", "react-dom", "lodash"],

      output: {
        // Custom output configuration
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
```

### Environment-Specific Configuration

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import { expozrHost } from "@expozr/vite-adapter";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      expozrHost({
        hostConfig: {
          expozrs: {
            "design-system": {
              url: env.DESIGN_SYSTEM_URL || "http://localhost:3001",
            },
            "api-client": {
              url: env.API_CLIENT_URL || "http://localhost:3002",
            },
          },
        },
        development: mode === "development",
      }),
    ],
  };
});
```

### TypeScript Integration

```typescript
// vite-env.d.ts
/// <reference types="vite/client" />
/// <reference types="@expozr/vite-adapter/types" />

// Module declarations for federated modules
declare module "@expozr/design-system/Button" {
  import { ComponentType } from "react";
  interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary";
  }
  const Button: ComponentType<ButtonProps>;
  export default Button;
}
```

## Troubleshooting

### Common Issues

**1. Module not found errors**

```bash
Error: Cannot resolve '@expozr/design-system/Component'
```

**Solution**: Ensure the expozr is running and accessible at the configured URL.

**2. CORS errors in development**

```bash
Access to fetch at 'http://localhost:3001' has been blocked by CORS policy
```

**Solution**: The adapter automatically configures CORS, but ensure your expozr is using the `expozr` plugin.

**3. Build errors with externals**

```bash
Unresolved dependencies: react, react-dom
```

**Solution**: Configure externals properly in your Rollup options:

```typescript
build: {
  rollupOptions: {
    external: ['react', 'react-dom'],
  },
}
```

### Debug Mode

Enable debug logging:

```typescript
expozr({
  development: true,
  // Add custom logging
});
```

Check the browser console and terminal for detailed information about module loading and resolution.

## Examples

See the [examples directory](../../examples/vite) for complete working examples:

- **[React Expozr](../../examples/vite/react/remote)** - Complete expozr setup
- **[React Host](../../examples/vite/react/host)** - Host application consuming remote modules

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../../CONTRIBUTING.md) for details.

## License

MIT License. See [LICENSE](../../../LICENSE) for details.

## Related Packages

- [@expozr/core](../core) - Core Expozr functionality
- [@expozr/webpack-adapter](../webpack) - Webpack integration
- [@expozr/cli](../cli) - Command line interface
- [@expozr/navigator](../navigator) - Runtime module navigation
