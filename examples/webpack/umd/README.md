# Webpack + UMD Example

This example demonstrates Universal Module Definition (UMD) federation between applications using Expozr and Webpack. UMD modules work in any environment - browsers, Node.js, AMD, and CommonJS.

## Overview

- **Remote/Expozr** (port 3001): Exposes UMD modules with utility functions
- **Host** (port 3000): Consumes UMD modules from the remote expozr

## Quick Start

1. **Start the Remote/Expozr**:

   ```bash
   cd remote
   npm install
   npm run dev  # Starts on http://localhost:3001
   ```

2. **Start the Host** (in a new terminal):

   ```bash
   cd host
   npm install
   npm run dev  # Starts on http://localhost:3000
   ```

3. **Open your browser** to http://localhost:3000

## What's Included

### Remote/Expozr (`./remote/`)

Exposes UMD modules with utility functions:

- **`greet`**: Greeting function with custom message
- **`add`**: Addition function for two numbers
- **`multiply`**: Multiplication function for two numbers
- **`getCurrentTime`**: Returns current timestamp

**Configuration** (`expozr.config.ts`):

```typescript
export default defineExpozrConfig({
  name: "umd-remote-app",
  version: "1.0.0",
  expose: {
    "./utils": {
      entry: "./src/index.ts",
      exports: ["greet", "add", "multiply", "getCurrentTime"],
    },
  },
  build: {
    outDir: "dist",
    publicPath: "http://localhost:3001/",
  },
});
```

**Exposed Module** (`./src/index.ts`):

```typescript
export function greet(name: string): string {
  return `Hello, ${name}! This is from the remote application.`;
}

export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function getCurrentTime(): string {
  return new Date().toLocaleTimeString();
}

// Default export for UMD compatibility
const RemoteUtils = {
  greet,
  add,
  multiply,
  getCurrentTime,
};

export default RemoteUtils;
```

### Host (`./host/`)

Consumes the UMD modules from the remote expozr:

```typescript
import { createNavigator } from "@expozr/navigator";

const navigator = createNavigator({
  expozrs: {
    "umd-remote-app": {
      url: "http://localhost:3001",
    },
  },
});

// Load UMD module with auto-detection
const { module } = await navigator.loadCargo("umd-remote-app", "./utils", {
  moduleFormat: "umd", // Explicit UMD format
  exports: ["add", "greet", "multiply", "getCurrentTime"],
});

// Use the loaded functions
console.log(module.add(200, 300)); // 500
console.log(module.multiply(400, 500)); // 200000
console.log(module.greet("Host User")); // Hello, Host User! This is from the remote application.
console.log(module.getCurrentTime()); // Current timestamp
```

## Key Features

### UMD Module Format

- **Universal Compatibility**: Works in browsers, Node.js, AMD, and CommonJS environments
- **Protected Global Storage**: Modules are stored in `globalThis.__EXPOZR__` for secure access
- **Automatic Detection**: Expozr automatically detects UMD format when `moduleFormat` is not specified
- **Default Export Support**: UMD modules can expose both named exports and default exports

### Module Loading Options

```typescript
// Option 1: Auto-detection (recommended)
const { module } = await navigator.loadCargo("umd-remote-app", "./utils");

// Option 2: Explicit UMD format
const { module } = await navigator.loadCargo("umd-remote-app", "./utils", {
  moduleFormat: "umd",
});

// Option 3: With specific exports
const { module } = await navigator.loadCargo("umd-remote-app", "./utils", {
  moduleFormat: "umd",
  exports: ["greet", "add", "multiply", "getCurrentTime"],
});
```

## Configuration Files

### Remote Webpack Config

The remote uses Webpack to build UMD modules:

```javascript
// webpack.config.js
module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    library: "UmdRemoteApp",
    libraryTarget: "umd",
    globalObject: "this",
  },
  // ... other webpack configuration
};
```

### Host Webpack Config

The host consumes UMD modules:

```javascript
// webpack.config.js
module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  // ... standard webpack configuration for consuming apps
};
```

## Development Workflow

1. **Start Remote**: The remote expozr builds and serves UMD modules
2. **Start Host**: The host application loads and uses the remote modules
3. **Hot Reload**: Both applications support hot reload for development
4. **Testing**: Console logs show successful module loading and function calls

## UMD Module System Benefits

- **Browser Native**: Works directly in browsers without module bundlers
- **Legacy Support**: Compatible with older JavaScript environments
- **Global Access**: Modules are available globally for debugging
- **Flexible Loading**: Supports both synchronous and asynchronous loading
- **Production Ready**: UMD is a stable, well-tested module format

## Troubleshooting

### Common Issues

1. **Empty Module Object**: Ensure your UMD module has proper exports and default export
2. **Loading Failures**: Check that the remote expozr is running on the correct port
3. **CORS Issues**: Ensure both applications are running on allowed origins
4. **Missing Functions**: Verify the exports array matches your module's actual exports

### Debug Tips

- Check browser console for module loading messages
- Inspect `globalThis.__EXPOZR__` to see stored modules
- Use `moduleFormat: "umd"` explicitly if auto-detection fails
- Verify remote expozr is accessible at the configured URL

## Next Steps

- Explore the [ESM Example](../esm/) for modern ES module federation
- Check the [React Example](../react/) for React component federation
- Read the [Get Started Example](../get-started/) for simpler use cases
