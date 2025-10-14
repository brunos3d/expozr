# Webpack + Get Started Example

This is the simplest possible example to get started with Expozr. It demonstrates basic module federation between TypeScript applications using Expozr and Webpack.

## Overview

- **Remote/Expozr** (port 3001): Exposes simple utility functions
- **Host** (port 3000): Consumes and uses the remote utilities

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

Exposes simple utility functions:

- **`greet`**: Simple greeting function
- **`add`**: Addition function
- **`multiply`**: Multiplication function

**Configuration** (`expozr.config.ts`):

```typescript
export default defineExpozrConfig({
  name: "get-started-remote",
  version: "1.0.0",
  expose: {
    "./utils": {
      entry: "./src/index.ts",
      exports: ["greet", "add", "multiply"],
    },
  },
});
```

### Host (`./host/`)

Simple application that:

- Loads utilities from the remote expozr
- Demonstrates usage of remote functions
- Shows basic error handling

## Key Features

### 🔍 Minimal Configuration

```javascript
// webpack.config.js - Zero configuration!
const { createExpozrPlugin } = require("@expozr/webpack-adapter");

module.exports = {
  plugins: [
    createExpozrPlugin(), // Finds expozr.config.ts automatically
  ],
  // ... other webpack config
};
```

### 📦 Simple Module Loading

```typescript
// Load remote modules using Navigator
import { createNavigator } from "@expozr/navigator";

const navigator = createNavigator({
  expozrs: {
    "get-started-remote": {
      url: "http://localhost:3001",
      version: "^1.0.0",
    },
  },
});

// Load and use remote functions
const utilsModule = await navigator.loadCargo("get-started-remote", "utils");
const { greet, add, multiply } = utilsModule.module;

// Use them normally:
const greeting = greet("World");
const sum = add(2, 3);
const product = multiply(4, 5);
```

### 🔧 TypeScript Support

Full TypeScript support with proper type definitions:

```typescript
// Type-safe remote function usage
const result: number = add(5, 3);
const message: string = greet("Expozr");
```

## File Structure

```
webpack/get-started/
├── remote/                 # Expozr application
│   ├── src/
│   │   └── index.ts        # Utility functions
│   ├── expozr.config.ts    # Expozr configuration
│   ├── webpack.config.js   # Webpack configuration
│   ├── tsconfig.json       # TypeScript configuration
│   └── package.json
├── host/                   # Host application
│   ├── src/
│   │   └── index.ts        # Main application
│   ├── expozr.config.ts    # Host configuration
│   ├── webpack.config.js   # Webpack configuration
│   ├── tsconfig.json       # TypeScript configuration
│   └── package.json
└── README.md               # This file
```

## Development

### Running in Development Mode

Both applications support hot reloading:

```bash
# Terminal 1 - Remote
cd remote && npm run dev

# Terminal 2 - Host
cd host && npm run dev
```

### Building for Production

```bash
# Build remote first
cd remote && npm run build

# Then build host
cd host && npm run build
```

### Testing the Connection

1. Check that the expozr is accessible:
   http://localhost:3001/expozr.inventory.json

2. Verify modules are available:
   - http://localhost:3001/utils.js

## Troubleshooting

### "Expozr not accessible"

- Ensure the remote is running on port 3001
- Check for CORS issues in browser console

### "Module loading failed"

- Verify the remote is built and running
- Check the inventory JSON for module availability
- Inspect network tab for failed requests

### Development Issues

- Clear browser cache if modules seem stale
- Restart both applications after configuration changes
- Check webpack dev server output for build errors

## Next Steps

- Try the [Vanilla example](../vanilla/) for more detailed implementation
- Try the [React example](../react/) for component sharing
- Try the [UMD example](../umd/) for universal module format
- Try the [ESM example](../esm/) for modern ES modules
- Try the [Vite React example](../../vite/react/) for modern bundler comparison
- Explore the [Expozr core documentation](../../../packages/core/)
- Learn about [advanced configuration options](../../../docs/)
