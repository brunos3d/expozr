# Webpack + UMD Example

This example demonstrates Universal Module Definition (UMD) module federation using Expozr and Webpack. The calculator application loads mathematical functions from a remote UMD expozr.

## Overview

- **Remote/Expozr** (port 3001): Exposes UMD mathematical functions
- **Host** (port 3000): Calculator application consuming remote UMD modules

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

Exposes mathematical functions as UMD modules:

- **`calculator`**: Basic math operations (add, subtract, multiply, divide)
- **`advanced`**: Advanced math operations (power, sqrt, factorial, percentage)

**Configuration** (`expozr.config.ts`):

```typescript
export default defineExpozrConfig({
  name: "math-functions",
  version: "1.0.0",
  expose: {
    "./calculator": {
      entry: "./src/calculator.ts",
      exports: ["add", "subtract", "multiply", "divide"],
    },
    "./advanced": {
      entry: "./src/advanced.ts",
      exports: ["power", "sqrt", "factorial", "percentage"],
    },
  },
  build: {
    format: "umd",
    outDir: "dist",
    publicPath: "http://localhost:3001/",
  },
});
```

### Host (`./host/`)

Calculator application that:

- Loads UMD modules from the remote expozr
- Provides a modern calculator interface
- Demonstrates both basic and advanced operations
- Handles errors gracefully with user feedback

## Key Features

### 🌍 UMD Module Format

Universal Module Definition provides broad compatibility:

```typescript
// UMD modules work in multiple environments
// - Browser globals
// - AMD/RequireJS
// - CommonJS/Node.js
// - ES modules

// Load UMD modules using Navigator
const navigator = new Navigator({
  expozrs: {
    "math-functions": {
      url: "http://localhost:3001",
      version: "^1.0.0",
    },
  },
});

const calculatorModule = await navigator.loadCargo(
  "math-functions",
  "calculator"
);
const { add, multiply } = calculatorModule.module;
```

### 🧮 Calculator Interface

Complete calculator with:

- Basic arithmetic operations
- Advanced mathematical functions
- Error handling and validation
- Responsive design
- Keyboard support

### 🔧 TypeScript Support

Full type safety with UMD modules:

```typescript
// Type definitions for remote modules
interface CalculatorFunctions {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
  multiply(a: number, b: number): number;
  divide(a: number, b: number): number;
}

interface AdvancedFunctions {
  power(base: number, exponent: number): number;
  sqrt(value: number): number;
  factorial(n: number): number;
  percentage(value: number, percent: number): number;
}
```

## File Structure

```
webpack/umd/
├── remote/                 # UMD modules expozr
│   ├── src/
│   │   ├── calculator.ts   # Basic math operations
│   │   └── advanced.ts     # Advanced math operations
│   ├── expozr.config.ts    # Expozr configuration
│   ├── webpack.config.js   # Webpack config with UMD output
│   ├── tsconfig.json       # TypeScript configuration
│   └── package.json
├── host/                   # Calculator application
│   ├── src/
│   │   ├── index.ts        # Main application logic
│   │   ├── index.html      # HTML template
│   │   ├── styles.css      # Calculator styling
│   │   └── types.d.ts      # Type definitions
│   ├── expozr.config.ts    # Host configuration
│   ├── webpack.config.js   # Webpack config
│   ├── tsconfig.json       # TypeScript configuration
│   └── package.json
└── README.md               # This file
```

## Calculator Features

### Basic Operations

- **Addition**: Add two numbers
- **Subtraction**: Subtract second number from first
- **Multiplication**: Multiply two numbers
- **Division**: Divide first number by second (with zero check)

### Advanced Operations

- **Power**: Raise base to exponent
- **Square Root**: Calculate square root (with negative check)
- **Factorial**: Calculate factorial (with validation)
- **Percentage**: Calculate percentage of a value

### User Interface

- Clean, modern calculator design
- Responsive layout for different screen sizes
- Error handling with user-friendly messages
- Keyboard support for number input
- Clear and reset functionality

## Development

### Running in Development Mode

Both applications support hot reloading:

```bash
# Terminal 1 - Remote
cd remote && npm run dev

# Terminal 2 - Host
cd host && npm run dev
```

- Use the calculator interface to perform calculations
- Check the browser console for detailed loading and calculation logs

## Architecture Details

### Remote Modules

The remote expozr exposes two UMD modules:

- **Calculator Module** (`./calculator`): Basic math operations (add, subtract, multiply, divide)
- **Advanced Module** (`./advanced`): Advanced operations (power, sqrt, factorial, percentage)

### Host Configuration

The host application configures the Navigator with:

```typescript
const navigator = new Navigator({
  expozrs: {
    "math-utils": {
      url: "http://localhost:3001/",
      version: "^1.0.0",
    },
  },
  cache: {
    strategy: "memory",
    ttl: 300000, // 5 minutes cache
  },
  loading: {
    timeout: 10000, // 10 seconds timeout
    retry: {
      attempts: 3,
      delay: 1000,
    },
  },
});
```

### Module Loading

Functions are loaded dynamically:

```typescript
// Load calculator module
const calculatorCargo = await navigator.loadCargo("math-utils", "./calculator");
const calculatorModule = calculatorCargo.module;

// Use remote functions
const result = calculatorModule.add(5, 3); // Returns 8
```

## Key Concepts

### UMD Format

Universal Module Definition (UMD) allows modules to work in multiple environments:

- Browser globals
- AMD (RequireJS)
- CommonJS (Node.js)
- ES Modules

### Dynamic Loading

Expozr Navigator handles:

- Module format detection
- Network requests with retry logic
- Caching strategies
- Error handling and fallbacks

### Type Safety

TypeScript interfaces define remote module contracts:

```typescript
interface CalculatorModule {
  add: (a: number, b: number) => number;
  subtract: (a: number, b: number) => number;
  multiply: (a: number, b: number) => number;
  divide: (a: number, b: number) => number;
}
```

### Building for Production

```bash
# Build remote first
cd remote && npm run build

# Then build host
cd host && npm run build
```

### Testing the Calculator

1. Check that the expozr is accessible:
   http://localhost:3001/expozr.inventory.json

2. Verify UMD modules are available:
   - http://localhost:3001/calculator.js
   - http://localhost:3001/advanced.js

## Troubleshooting

### Connection Issues

- Ensure the remote expozr is running on port 3001
- Check browser console for network errors
- Verify CORS settings if accessing from different domains

### Module Loading Errors

- Check the browser network tab for failed requests
- Verify module paths in the expozr configuration
- Ensure UMD modules are properly built and accessible

### Calculator Issues

- Check that mathematical operations return expected results
- Verify error handling for invalid inputs (divide by zero, negative sqrt)
- Test keyboard input and UI responsiveness

### TypeScript Errors

- Verify type definitions match the actual remote module exports
- Check that all required dependencies are installed
- Ensure tsconfig.json includes all necessary files

## Advanced Usage

### Custom Calculator Functions

Add new mathematical operations:

```typescript
// In remote/src/advanced.ts
export function logarithm(value: number, base: number = Math.E): number {
  return Math.log(value) / Math.log(base);
}

export function sin(angle: number): number {
  return Math.sin(angle);
}
```

### Error Boundaries

Implement graceful error handling:

```typescript
try {
  const result = await navigator.loadCargo("math-functions", "calculator");
  return result.module;
} catch (error) {
  console.error("Failed to load calculator functions:", error);
  // Fallback to local implementations
  return getLocalCalculatorFunctions();
}
```

## Next Steps

- Try the [React example](../react/) for component sharing
- Try the [ESM example](../esm/) for modern ES modules
- Try the [Vanilla example](../vanilla/) for simpler use cases
- Try the [Vite React example](../../vite/react/) for modern bundler comparison
- Experiment with different caching strategies
- Add new mathematical functions to the remote expozr
- Learn about [deployment strategies](../../../docs/deployment.md)
