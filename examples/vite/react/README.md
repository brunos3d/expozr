# Vite React Example - Expozr

This example demonstrates how to use Expozr with Vite and React to create a micro-frontend architecture with a host application consuming components from a remote warehouse.

## Architecture

- **Host** (port 5000): Consumes remote components
- **Remote** (port 5001): Exposes React components as a warehouse

## Components

### Remote Warehouse

- **Button**: A styled React button component with multiple variants and sizes

### Host Application

- Dynamically loads and uses the Button component from the remote warehouse

## Getting Started

### Prerequisites

Make sure you have the Expozr packages built:

```bash
# From the root of the expozr project
npm run build
```

### Installation

1. **Install dependencies for both applications:**

```bash
# Install remote dependencies
cd remote
npm install

# Install host dependencies
cd ../host
npm install
```

### Running the Example

1. **Start the remote warehouse (in one terminal):**

```bash
cd remote
npm run dev
```

This will start the remote warehouse on http://localhost:5001

2. **Start the host application (in another terminal):**

```bash
cd host
npm run dev
```

This will start the host application on http://localhost:5000

3. **Open your browser and navigate to http://localhost:5000**

You should see the host application successfully loading and using the Button component from the remote warehouse.

## How It Works

### Remote Warehouse Configuration

The remote application uses an `expozr.config.ts` file to define what components to expose:

```typescript
export default defineExpozrConfig({
  name: "vite-react-components",
  version: "1.0.0",
  expose: {
    "./Button": {
      entry: "./src/components/Button.tsx",
      exports: ["Button", "ButtonProps"],
    },
  },
  // ... other configuration
});
```

### Vite Plugin Integration

The remote's `vite.config.ts` uses the Expozr Vite adapter:

```typescript
export default defineConfig({
  plugins: [
    react(),
    createWarehousePlugin(), // Automatically discovers expozr.config.ts
  ],
  // ... other configuration
});
```

### Host Application Loading

The host application uses the Navigator to load remote components:

```typescript
const navigator = new Navigator({
  expozrs: {
    "vite-react-components": {
      url: "http://localhost:5001",
      version: "^1.0.0",
    },
  },
});

const loadedCargo = await navigator.loadCargo(
  "vite-react-components",
  "Button"
);
const RemoteButton = loadedCargo.module.Button;
```

## Key Features

- ✅ **Vite Integration**: Full integration with Vite's development server and build process
- ✅ **ESM Support**: Native ES modules support for modern browsers
- ✅ **Hot Reload**: Development server with hot module replacement
- ✅ **TypeScript**: Full TypeScript support with type safety
- ✅ **Automatic Discovery**: Expozr configuration files are automatically discovered
- ✅ **Dynamic Loading**: Components are loaded at runtime, not build time
- ✅ **Component Isolation**: Remote components maintain their own styling and behavior

## Building for Production

### Build the remote warehouse:

```bash
cd remote
npm run build
```

This generates:

- Built components in `dist/`
- `expozr.inventory.json` manifest file

### Build the host application:

```bash
cd host
npm run build
```

## Troubleshooting

1. **Make sure the remote is running first** before starting the host
2. **Check the browser console** for any loading errors
3. **Verify the ports** - remote should be on 5001, host on 5000
4. **CORS issues**: Both applications are configured with CORS enabled

## Next Steps

- Try adding more components to the remote warehouse
- Experiment with different component types (hooks, contexts, etc.)
- Add error boundaries for better error handling
- Implement component versioning and fallbacks
