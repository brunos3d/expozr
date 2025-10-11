# UMD Calculator Example

This example demonstrates how to use Expozr to load UMD (Universal Module Definition) modules from a remote expozr. The calculator application loads mathematical functions from a remote UMD bundle and provides a complete calculator interface.

## Project Structure

```
umd/
├── host/          # Calculator application that consumes remote functions
│   ├── src/
│   │   ├── index.ts       # Main application logic
│   │   ├── index.html     # HTML template
│   │   ├── styles.css     # Calculator styling
│   │   └── types.d.ts     # Type definitions
│   ├── package.json
│   ├── webpack.config.js
│   ├── tsconfig.json
│   └── expozr.config.ts
└── remote/        # UMD modules expozr
    ├── src/
    │   ├── calculator.ts  # Basic math operations
    │   └── advanced.ts    # Advanced math operations
    ├── package.json
    ├── webpack.config.js
    ├── tsconfig.json
    └── expozr.config.ts
```

## Features

- **Basic Operations**: Addition, subtraction, multiplication, division
- **Advanced Operations**: Power, square root, factorial, percentage
- **Remote Loading**: Mathematical functions loaded dynamically from UMD expozr
- **Error Handling**: Comprehensive error handling for network and calculation errors
- **Modern UI**: Clean, responsive calculator interface
- **TypeScript**: Full type safety with remote module interfaces

## How It Works

1. **Remote Expozr**: The `remote` application exposes mathematical functions as UMD modules
2. **Host Application**: The `host` application uses Expozr Navigator to load these remote functions
3. **Dynamic Loading**: Functions are loaded on-demand from the remote expozr
4. **Type Safety**: TypeScript interfaces ensure type safety even with remote modules

## Running the Example

### 1. Start the Remote Expozr

```bash
cd examples/webpack/umd/remote
npm install
npm run dev
```

This starts the UMD expozr server on `http://localhost:3001/`

### 2. Start the Host Application

```bash
cd examples/webpack/umd/host
npm install
npm run dev
```

This starts the calculator application on `http://localhost:3000/`

### 3. Use the Calculator

- Open your browser to `http://localhost:3000/`
- The calculator will automatically load remote math functions
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

## Troubleshooting

### Connection Issues

- Ensure the remote expozr is running on port 3001
- Check browser console for network errors
- Verify CORS settings if accessing from different domains

### Module Loading Errors

- Check the browser network tab for failed requests
- Verify module paths in the expozr configuration
- Ensure UMD modules are properly built and accessible

### TypeScript Errors

- Verify type definitions match the actual remote module exports
- Check that all required dependencies are installed
- Ensure tsconfig.json includes all necessary files

## Next Steps

- Try modifying the remote modules and see hot-reloading in action
- Add new mathematical functions to the remote expozr
- Experiment with different caching strategies
- Add offline support with fallback modules
