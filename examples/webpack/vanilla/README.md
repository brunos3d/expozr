# Webpack + Vanilla JavaScript Example

This example demonstrates basic module federation between vanilla JavaScript applications using Expozr and Webpack.

## Overview

- **Remote/Expozr** (port 3001): Exposes utility functions
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

- **`hello`**: Greeting functions (`sayHello`, `hello`)
- **`utils`**: Math utilities (`add`, `multiply`)

**Configuration** (`expozr.config.ts`):

```typescript
export default defineExpozrConfig({
  name: "simple-expozr",
  version: "1.0.0",
  expose: {
    "./hello": "./src/hello.ts",
    "./utils": "./src/utils.ts",
  },
});
```

### Host (`./host/`)

Consumes utilities from the expozr and demonstrates:

- Loading expozr inventory
- Dynamically importing remote modules
- Error handling and connectivity testing
- DOM manipulation with loaded functions

## Key Features

### 🔍 Automatic Configuration Discovery

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

### 📦 Simple Module Sharing

```javascript
// Remote modules are loaded using Navigator:
import { createNavigator } from "@expozr/navigator";

const navigator = createNavigator({
  expozrs: {
    "simple-expozr": {
      url: "http://localhost:3001",
      version: "^1.0.0",
    },
  },
});

// Load remote modules
const helloModule = await navigator.loadCargo("simple-expozr", "hello");
const utilsModule = await navigator.loadCargo("simple-expozr", "utils");

// Use them normally:
const greeting = helloModule.module.sayHello("World");
const sum = utilsModule.module.add(5, 3);
```

### 🔧 Development Experience

- Hot reloading for both applications
- Automatic inventory generation
- Clear error messages and troubleshooting
- Console logging for debugging

## File Structure

```
webpack/vanilla/
├── remote/                 # Expozr application
│   ├── src/
│   │   ├── hello.ts       # Greeting utilities
│   │   └── utils.ts       # Math utilities
│   ├── expozr.config.ts   # Expozr configuration
│   ├── webpack.config.js  # Webpack config
│   └── package.json
├── host/                   # Host application
│   ├── src/
│   │   ├── index.html     # HTML template
│   │   └── index.ts       # Main application
│   ├── expozr.config.ts   # Host configuration
│   ├── webpack.config.js  # Webpack config
│   └── package.json
└── README.md              # This file
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
   - http://localhost:3001/hello.js
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

- Try the [React example](../react/) for component sharing
- Try the [UMD example](../umd/) for universal module format
- Try the [ESM example](../esm/) for modern ES modules
- Try the [Vite React example](../../vite/react/) for modern bundler comparison
- Explore the [Expozr core documentation](../../../packages/core/)
- Learn about [advanced configuration options](../../../docs/)
