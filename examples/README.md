# Expozr Examples

This directory contains example applications demonstrating how to use Expozr for runtime module federation across different bundlers and frameworks.

## Structure

```
examples/
├── webpack/
│   ├── vanilla/
│   │   ├── host/     # Vanilla JS host application (port 3000)
│   │   └── remote/   # Vanilla JS warehouse (port 3001)
│   └── react/
│       ├── host/     # React host application (port 3000)
│       └── remote/   # React component warehouse (port 3001)
└── README.md         # This file
```

## Quick Start

Each example consists of two applications:

- **Remote/Warehouse**: Exposes modules/components for sharing
- **Host**: Consumes modules/components from the warehouse

### Running an Example

1. **Start the Remote/Warehouse** (always run this first):

   ```bash
   cd examples/webpack/vanilla/remote  # or react/remote
   npm install
   npm run dev  # Starts on port 3001
   ```

2. **Start the Host** (in a new terminal):

   ```bash
   cd examples/webpack/vanilla/host   # or react/host
   npm install
   npm run dev  # Starts on port 3000
   ```

3. **Open your browser** to http://localhost:3000

## Examples

### 🔧 Webpack + Vanilla JavaScript

**Location**: `examples/webpack/vanilla/`

Demonstrates basic module sharing between vanilla JavaScript applications:

- **Remote** (port 3001): Exposes utility functions (`hello`, `utils`)
- **Host** (port 3000): Loads and uses the remote utilities

**Features**:

- Simple utility function sharing
- Basic runtime module loading
- Automatic config discovery

### ⚛️ Webpack + React

**Location**: `examples/webpack/react/`

Demonstrates React component sharing between React applications:

- **Remote** (port 3001): Exposes React components (`Button`, `Card`, `hooks`)
- **Host** (port 3000): Loads and uses React components from warehouse

**Features**:

- React component federation
- TypeScript support
- Component library sharing
- React hooks sharing

## Key Features Demonstrated

### 🔍 Automatic Configuration Discovery

All examples use Expozr's automatic configuration discovery:

```javascript
// webpack.config.js - No configuration needed!
const { createWarehousePlugin } = require("@expozr/webpack-adapter");

module.exports = {
  plugins: [
    createWarehousePlugin(), // Automatically finds expozr.config.ts
  ],
};
```

### 📋 TypeScript Configuration

Examples use TypeScript configuration files with automatic discovery:

```typescript
// expozr.config.ts
import { defineWarehouseConfig } from "@expozr/core";

export default defineWarehouseConfig({
  name: "my-warehouse",
  version: "1.0.0",
  expose: {
    "./Component": {
      entry: "./src/Component.tsx",
      exports: ["Component"],
    },
  },
});
```

### 🚀 Zero-Config Development

- Automatic config file discovery (TypeScript preferred)
- Hot reloading in development mode
- Automatic inventory generation
- Module federation with minimal setup

## Port Configuration

All examples follow a consistent port structure:

- **Host applications**: Port `3000`
- **Remote/Warehouse applications**: Port `3001`

This makes it easy to switch between examples while keeping the same URLs and workflow.

**Note**: Only run one example at a time since they share the same ports.

## Troubleshooting

### Common Issues

1. **"Warehouse not accessible"**
   - Make sure the remote/warehouse is running first
   - Check that it's accessible at http://localhost:3001/

2. **"Module not found"**
   - Ensure both applications are built (`npm run build`)
   - Check the inventory at http://localhost:3001/expozr.inventory.json

3. **CORS errors**
   - Make sure both applications are running on the correct ports
   - Check webpack dev server configuration

### Development Workflow

1. Start remote/warehouse first (`npm run dev` on port 3001)
2. Start host application (`npm run dev` on port 3000)
3. Open browser to http://localhost:3000
4. Check browser console for loading progress
5. Check network tab for module loading

## Learn More

- [Expozr Documentation](../docs/)
- [Webpack Adapter](../packages/adapters/webpack/)
- [Core API](../packages/core/)

## Contributing

To add a new example:

1. Create the appropriate directory structure
2. Follow the port conventions (host: 3000, remote: 3001)
3. Use automatic config discovery with `expozr.config.ts`
4. Add comprehensive logging for debugging
5. Update this README with your example
