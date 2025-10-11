# Expozr Examples

This directory contains example applications demonstrating how to use Expozr for runtime module federation across different bundlers and frameworks.

## Structure

```
examples/
├── vite/
│   └── react/
│       ├── host/     # React host application (port 5000)
│       └── remote/   # React component expozr (port 5001)
├── webpack/
│   ├── get-started/
│   │   ├── host/     # Basic host application (port 3000)
│   │   └── remote/   # Basic expozr (port 3001)
│   ├── vanilla/
│   │   ├── host/     # Vanilla JS host application (port 3000)
│   │   └── remote/   # Vanilla JS expozr (port 3001)
│   ├── react/
│   │   ├── host/     # React host application (port 3000)
│   │   └── remote/   # React component expozr (port 3001)
│   ├── esm/
│   │   ├── host/     # ESM host application (port 3000)
│   │   └── remote/   # ESM expozr (port 3001)
│   └── umd/
│       ├── host/     # UMD host application (port 3000)
│       └── remote/   # UMD expozr (port 3001)
└── README.md         # This file
```

## Quick Start

Each example consists of two applications:

- **Remote/Expozr**: Exposes modules/components for sharing
- **Host**: Consumes modules/components from the expozr

### Running an Example

1. **Start the Remote/Expozr** (always run this first):

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

### 🔧 Webpack + Get Started

**Location**: `examples/webpack/get-started/`

The simplest possible example to get started with Expozr:

- **Remote** (port 3001): Exposes basic utility functions
- **Host** (port 3000): Loads and uses the remote utilities

**Features**:

- Minimal configuration
- Basic module sharing
- Perfect for learning Expozr basics

### 🔧 Webpack + Vanilla JavaScript

**Location**: `examples/webpack/vanilla/`

Demonstrates basic module sharing between vanilla JavaScript applications:

- **Remote** (port 3001): Exposes utility functions (`hello`, `utils`)
- **Host** (port 3000): Loads and uses the remote utilities

**Features**:

- Simple utility function sharing
- Runtime module loading
- Automatic config discovery

### ⚛️ Webpack + React

**Location**: `examples/webpack/react/`

Demonstrates React component sharing between React applications:

- **Remote** (port 3001): Exposes React components (`Button`, `Card`, `hooks`)
- **Host** (port 3000): Loads and uses React components from expozr

**Features**:

- React component federation
- TypeScript support
- Component library sharing
- React hooks sharing

### 📦 Webpack + ESM

**Location**: `examples/webpack/esm/`

Demonstrates ES module sharing with modern JavaScript:

- **Remote** (port 3001): Exposes ES modules with modern syntax
- **Host** (port 3000): Loads and uses ES modules at runtime

**Features**:

- Native ES module support
- Tree shaking capabilities
- Modern JavaScript features

### 🌍 Webpack + UMD

**Location**: `examples/webpack/umd/`

Demonstrates Universal Module Definition (UMD) module sharing:

- **Remote** (port 3001): Exposes UMD modules for broad compatibility
- **Host** (port 3000): Calculator app using remote math functions

**Features**:

- Universal module format
- Calculator example application
- Cross-platform compatibility

### ⚡ Vite + React

**Location**: `examples/vite/react/`

Demonstrates React component sharing using Vite bundler:

- **Remote** (port 5001): Exposes React components using Vite
- **Host** (port 5000): Loads and uses React components from Vite expozr

**Features**:

- Vite integration with fast HMR
- React component federation
- ESM-first approach
- Modern development experience

## Key Features Demonstrated

### 🔍 Automatic Configuration Discovery

All examples use Expozr's automatic configuration discovery:

```javascript
// webpack.config.js - No configuration needed!
const { createExpozrPlugin } = require("@expozr/webpack-adapter");

module.exports = {
  plugins: [
    createExpozrPlugin(), // Automatically finds expozr.config.ts
  ],
};
```

### 📋 TypeScript Configuration

Examples use TypeScript configuration files with automatic discovery:

```typescript
// expozr.config.ts
import { defineExpozrConfig } from "@expozr/core";

export default defineExpozrConfig({
  name: "my-expozr",
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

Examples follow consistent port structures by bundler:

### Webpack Examples

- **Host applications**: Port `3000`
- **Remote/Expozr applications**: Port `3001`

### Vite Examples

- **Host applications**: Port `5000`
- **Remote/Expozr applications**: Port `5001`

This makes it easy to switch between examples while keeping the same workflow.

**Note**: Only run one example per bundler at a time since they share the same ports.

## Troubleshooting

### Common Issues

1. **"Expozr not accessible"**
   - Make sure the remote/expozr is running first
   - Check that it's accessible at the correct URL:
     - Webpack examples: http://localhost:3001/
     - Vite examples: http://localhost:5001/

2. **"Module not found"**
   - Ensure both applications are built (`npm run build`)
   - Check the inventory file:
     - Webpack: http://localhost:3001/expozr.inventory.json
     - Vite: http://localhost:5001/expozr.inventory.json

3. **CORS errors**
   - Make sure both applications are running on the correct ports
   - Check dev server configuration in webpack.config.js or vite.config.ts

### Development Workflow

1. Start remote/expozr first (`npm run dev`)
2. Start host application (`npm run dev` in a new terminal)
3. Open browser to the host URL:
   - Webpack examples: http://localhost:3000
   - Vite examples: http://localhost:5000
4. Check browser console for loading progress
5. Check network tab for module loading

## Learn More

- [Expozr Documentation](../docs/)
- [Webpack Adapter](../packages/adapters/webpack/)
- [Vite Adapter](../packages/adapters/vite/)
- [Core API](../packages/core/)

## Contributing

To add a new example:

1. Create the appropriate directory structure
2. Follow the port conventions (host: 3000, remote: 3001)
3. Use automatic config discovery with `expozr.config.ts`
4. Add comprehensive logging for debugging
5. Update this README with your example
