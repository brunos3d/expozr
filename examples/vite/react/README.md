# Vite + React Example

This example demonstrates React component federation between React applications using Expozr and Vite.

## Overview

- **Remote/Expozr** (port 5001): Exposes React components
- **Host** (port 5000): Consumes and renders React components from the expozr

## Quick Start

1. **Start the Remote/Expozr**:

   ```bash
   cd remote
   npm install
   npm run dev  # Starts on http://localhost:5001
   ```

2. **Start the Host** (in a new terminal):

   ```bash
   cd host
   npm install
   npm run dev  # Starts on http://localhost:5000
   ```

3. **Open your browser** to http://localhost:5000

## What's Included

### Remote/Expozr (`./remote/`)

Exposes React components:

- **`Button`**: Reusable button component with variants and sizes

**Configuration** (`expozr.config.ts`):

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
  dependencies: {
    react: "^18.0.0",
    "react-dom": "^18.0.0",
  },
  build: {
    outDir: "dist",
    publicPath: "http://localhost:5001/",
    format: "esm",
  },
});
```

### Host (`./host/`)

React application that:

- Loads React component expozr inventory
- Dynamically imports React components at runtime
- Demonstrates component usage with props and interactions
- Provides comprehensive error handling

## Key Features

### ⚡ Vite Integration

Fast development with Vite's lightning-fast HMR:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    createWarehousePlugin(), // Automatically discovers expozr.config.ts
  ],
  server: {
    port: 5001,
    cors: true,
  },
});
```

### ⚛️ React Component Federation

```typescript
// Load React components at runtime using Navigator
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

// Use them like normal React components
<RemoteButton variant="primary" onClick={handleClick}>
  Click me!
</RemoteButton>
```

### 🔧 TypeScript Support

Full TypeScript support with proper type definitions:

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  onClick,
  children,
}) => {
  // Component implementation
};
```

### 🔍 Automatic Configuration Discovery

```typescript
// expozr.config.ts - Zero configuration webpack setup!
export default defineExpozrConfig({
  name: "vite-react-components",
  version: "1.0.0",
  expose: {
    "./Button": {
      entry: "./src/components/Button.tsx",
      exports: ["Button", "ButtonProps"],
    },
  },
});
```

## File Structure

```
vite/react/
├── remote/                      # React component expozr
│   ├── src/
│   │   ├── components/
│   │   │   └── Button.tsx      # Button component
│   │   ├── App.tsx             # Remote app (demo)
│   │   └── main.tsx            # Remote entry point
│   ├── expozr.config.ts        # Expozr configuration
│   ├── vite.config.ts          # Vite config with expozr adapter
│   ├── index.html              # HTML template
│   └── package.json
├── host/                        # React host application
│   ├── src/
│   │   ├── App.tsx             # Host app with remote loading
│   │   └── main.tsx            # Host entry point
│   ├── vite.config.ts          # Vite config
│   ├── index.html              # HTML template
│   └── package.json
└── README.md                   # This file
```

## Component Details

### Button Component

Reusable button with multiple variants and sizes:

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  onClick?: () => void;
  children: React.ReactNode;
}
```

**Features**:

- Primary and secondary variants
- Small, medium, and large sizes
- Customizable styling
- Click event handling
- Proper TypeScript definitions

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

### Testing Components

1. Check component expozr:
   http://localhost:5001/expozr.inventory.json

2. Verify components are built:
   - http://localhost:5001/Button.js

## Troubleshooting

### "Components not loading"

- Ensure the remote React app is running on port 5001
- Check browser console for React errors
- Verify component exports in the expozr

### TypeScript Issues

- Make sure both apps use compatible React versions
- Check that TypeScript definitions are properly exported
- Verify Vite TypeScript configuration

### Runtime Errors

- Check React component compatibility
- Ensure proper React context sharing
- Verify component props are correctly passed

### Development Issues

- Clear browser cache for component updates
- Restart both applications after config changes
- Check Vite output for build errors

## Advanced Usage

### Component Library Pattern

The remote can act as a complete component library:

```typescript
// Export multiple components together
export { Button, Card, Input, Modal } from "./components";
export { useCounter, useToggle, useApi } from "./hooks";
export { theme, colors } from "./design-system";
```

### Performance Optimization

Vite provides automatic optimizations:

- ES modules for faster loading
- Tree shaking for smaller bundles
- Hot module replacement for fast development

## Next Steps

- Try the [Webpack React example](../../webpack/react/) for comparison
- Explore [advanced React patterns](../../../docs/react-patterns.md)
- Learn about [performance optimization](../../../docs/performance.md)
- Check out [deployment strategies](../../../docs/deployment.md)
