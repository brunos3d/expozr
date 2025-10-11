# Webpack + ESM Example

This example demonstrates ES Module (ESM) federation between applications using Expozr and Webpack. It shows how to share modern JavaScript modules with native ES module syntax.

## Overview

- **Remote/Expozr** (port 3001): Exposes ES modules with modern JavaScript features
- **Host** (port 3000): Consumes ES modules from the remote expozr

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

Exposes ES modules with modern utilities:

- **`mathUtils`**: Mathematical operations (add, subtract, multiply, divide, power, sqrt)
- **`stringUtils`**: String manipulation utilities (capitalize, reverse, slugify, truncate)

**Configuration** (`expozr.config.ts`):

```typescript
export default defineExpozrConfig({
  name: "esm-utils",
  version: "1.0.0",
  expose: {
    "./mathUtils": {
      entry: "./src/math-utils.ts",
      exports: ["add", "subtract", "multiply", "divide", "power", "sqrt"],
    },
    "./stringUtils": {
      entry: "./src/string-utils.ts",
      exports: ["capitalize", "reverseString", "slugify", "truncate"],
    },
  },
  build: {
    format: "esm",
    outDir: "dist",
    publicPath: "http://localhost:3001/",
  },
});
```

### Host (`./host/`)

Modern application that:

- Loads ES modules from the remote expozr
- Demonstrates tree shaking capabilities
- Uses modern JavaScript features
- Shows interactive examples of remote utilities

## Key Features

### 📦 Native ES Modules

```typescript
// Modern ES module syntax
import { add, multiply } from "./mathUtils";
import { capitalize, slugify } from "./stringUtils";

// Tree shaking - only import what you need
const { add, subtract } = await import("./mathUtils");
```

### 🚀 Modern JavaScript Features

```typescript
// Use async/await, destructuring, and modern syntax
const navigator = new Navigator({
  expozrs: {
    "esm-utils": {
      url: "http://localhost:3001",
      version: "^1.0.0",
    },
  },
});

// Destructure only the functions you need
const mathModule = await navigator.loadCargo("esm-utils", "mathUtils");
const { add, multiply, power } = mathModule.module;

// Use with modern array methods
const numbers = [1, 2, 3, 4, 5];
const squared = numbers.map((n) => power(n, 2));
const sum = numbers.reduce((acc, n) => add(acc, n), 0);
```

### 🌳 Tree Shaking Support

ESM format enables optimal bundle sizes:

```typescript
// Only the imported functions are included in the bundle
import { add, multiply } from "esm-utils/mathUtils";
// subtract, divide, power, sqrt are NOT included

import { capitalize } from "esm-utils/stringUtils";
// reverseString, slugify, truncate are NOT included
```

### 🔧 TypeScript Integration

Full TypeScript support with ES modules:

```typescript
// Type-safe ES module exports
export const add = (a: number, b: number): number => a + b;
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// Import with full type safety
import { add, capitalize } from "./utils";
const result: number = add(5, 3);
const name: string = capitalize("expozr");
```

## File Structure

```
webpack/esm/
├── remote/                 # ESM expozr application
│   ├── src/
│   │   ├── index.ts        # Main entry point
│   │   ├── math-utils.ts   # Mathematical utilities
│   │   └── string-utils.ts # String utilities
│   ├── expozr.config.ts    # Expozr configuration
│   ├── webpack.config.js   # Webpack config with ESM output
│   ├── tsconfig.json       # TypeScript configuration
│   └── package.json
├── host/                   # Host application
│   ├── src/
│   │   └── index.ts        # Main application with ES module usage
│   ├── expozr.config.ts    # Host configuration
│   ├── webpack.config.js   # Webpack configuration
│   ├── tsconfig.json       # TypeScript configuration
│   └── package.json
└── README.md               # This file
```

## Module Details

### Math Utils

Mathematical operations with modern syntax:

```typescript
// Basic operations
export const add = (a: number, b: number): number => a + b;
export const subtract = (a: number, b: number): number => a - b;
export const multiply = (a: number, b: number): number => a * b;
export const divide = (a: number, b: number): number => {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
};

// Advanced operations
export const power = (base: number, exponent: number): number =>
  Math.pow(base, exponent);
export const sqrt = (value: number): number => {
  if (value < 0)
    throw new Error("Cannot calculate square root of negative number");
  return Math.sqrt(value);
};
```

### String Utils

String manipulation with modern approaches:

```typescript
// String transformations
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const reverseString = (str: string): string =>
  str.split("").reverse().join("");

export const slugify = (str: string): string =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const truncate = (str: string, length: number): string =>
  str.length <= length ? str : str.slice(0, length) + "...";
```

## Development

### Running in Development Mode

Both applications support hot reloading with ESM:

```bash
# Terminal 1 - Remote
cd remote && npm run dev

# Terminal 2 - Host
cd host && npm run dev
```

### Building for Production

ESM builds are optimized for modern browsers:

```bash
# Build remote first
cd remote && npm run build

# Then build host
cd host && npm run build
```

### Testing the Modules

1. Check that the expozr is accessible:
   http://localhost:3001/expozr.inventory.json

2. Verify ES modules are available:
   - http://localhost:3001/mathUtils.js
   - http://localhost:3001/stringUtils.js

## Browser Compatibility

ESM modules work in modern browsers:

- ✅ Chrome 61+
- ✅ Firefox 60+
- ✅ Safari 10.1+
- ✅ Edge 16+

For older browsers, consider the [UMD example](../umd/) instead.

## Performance Benefits

### Faster Loading

- Native browser module loading
- Parallel module fetching
- Better caching strategies

### Smaller Bundles

- Tree shaking eliminates unused code
- Shared dependencies are not duplicated
- Dynamic imports for code splitting

### Development Experience

- Faster hot module replacement
- Better debugging with source maps
- Modern JavaScript features

## Troubleshooting

### "Module not found" errors

- Ensure the remote expozr is running on port 3001
- Check that ES modules are properly built
- Verify module exports match imports

### Browser compatibility issues

- Check browser support for ES modules
- Use a module/nomodule pattern for fallbacks
- Consider transpiling for older browsers

### Performance issues

- Monitor network tab for module loading
- Check for duplicate module loading
- Optimize module sizes with tree shaking

## Advanced Usage

### Conditional Loading

Load modules based on conditions:

```typescript
// Load math utils only when needed
if (needsCalculation) {
  const mathModule = await navigator.loadCargo("esm-utils", "mathUtils");
  const { add, multiply } = mathModule.module;
  performCalculation(add, multiply);
}
```

### Module Preloading

Preload modules for better performance:

```typescript
// Preload modules in the background
navigator.preloadCargo("esm-utils", "mathUtils");
navigator.preloadCargo("esm-utils", "stringUtils");

// Use them later (already cached)
const mathModule = await navigator.loadCargo("esm-utils", "mathUtils");
```

### Error Boundaries

Handle module loading failures gracefully:

```typescript
try {
  const stringModule = await navigator.loadCargo("esm-utils", "stringUtils");
  return stringModule.module;
} catch (error) {
  console.error("Failed to load string utilities:", error);
  // Fallback to local implementations
  return getLocalStringUtils();
}
```

## Next Steps

- Try the [UMD example](../umd/) for broader browser compatibility
- Try the [React example](../react/) for component sharing
- Try the [Vite React example](../../vite/react/) for modern bundler comparison
- Explore [advanced ESM patterns](../../../docs/esm-patterns.md)
- Learn about [performance optimization](../../../docs/performance.md)
- Check out [deployment strategies](../../../docs/deployment.md)
