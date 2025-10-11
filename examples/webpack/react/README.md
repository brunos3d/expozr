# Webpack + React Example

This example demonstrates React component federation between React applications using Expozr and Webpack.

## Overview

- **Remote/Expozr** (port 3001): Exposes React components and hooks
- **Host** (port 3000): Consumes and renders React components from the expozr

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

Exposes React components and utilities:

- **`Button`**: Reusable button component with variants
- **`Card`**: Card container component
- **`hooks`**: Custom React hooks (`useCounter`, `useToggle`)

**Configuration** (`expozr.config.ts`):

```typescript
export default defineExpozrConfig({
  name: "react-components",
  version: "1.0.0",
  expose: {
    "./Button": {
      entry: "./src/components/Button.tsx",
      exports: ["Button", "ButtonProps"],
    },
    "./Card": {
      entry: "./src/components/Card.tsx",
      exports: ["Card", "CardProps"],
    },
    "./hooks": {
      entry: "./src/hooks/index.ts",
      exports: ["useCounter", "useToggle"],
    },
  },
});
```

### Host (`./host/`)

React application that:

- Loads React component expozr inventory
- Dynamically imports React components at runtime
- Demonstrates component usage with props and state
- Provides comprehensive error handling

## Key Features

### ⚛️ React Component Federation

```typescript
// Load React components at runtime
const buttonModule = await import('http://localhost:3001/Button.js');
const Button = buttonModule.Button;

// Use them like normal React components
<Button variant="primary" onClick={handleClick}>
  Click me!
</Button>
```

### 🔧 TypeScript Support

Full TypeScript support with proper type definitions:

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary";
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  onClick,
  children,
}) => {
  // Component implementation
};
```

### 🎣 Hook Sharing

Share custom React hooks between applications:

```typescript
// In the expozr
export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  return { count, increment, decrement };
}

// In the host
const { count, increment, decrement } = useCounter(0);
```

### 🔍 Automatic Configuration Discovery

```javascript
// webpack.config.js - Zero configuration!
const { createExpozrPlugin } = require("@expozr/webpack-adapter");

module.exports = {
  plugins: [
    createExpozrPlugin(), // Finds expozr.config.ts automatically
  ],
};
```

## File Structure

```
webpack/react/
├── remote/                      # React component expozr
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button.tsx      # Button component
│   │   │   └── Card.tsx        # Card component
│   │   └── hooks/
│   │       └── index.ts        # Custom hooks
│   ├── expozr.config.ts        # Expozr configuration
│   ├── webpack.config.js       # Webpack config
│   └── package.json
├── host/                        # React host application
│   ├── src/
│   │   ├── index.html          # HTML template
│   │   └── index.ts            # React host app
│   ├── expozr.config.ts        # Host configuration
│   ├── webpack.config.js       # Webpack config
│   └── package.json
└── README.md                   # This file
```

## Component Details

### Button Component

Reusable button with multiple variants:

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary";
  onClick?: () => void;
  children: React.ReactNode;
}
```

**Features**:

- Primary and secondary variants
- Customizable styling
- Click event handling
- Proper TypeScript definitions

### Card Component

Container component for content:

```typescript
interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}
```

**Features**:

- Optional title
- Flexible content area
- Custom styling support
- Responsive design

### Custom Hooks

Shared React hooks for common functionality:

- **`useCounter`**: State management for counters
- **`useToggle`**: Boolean state toggle utility

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
   http://localhost:3001/expozr.inventory.json

2. Verify components are built:
   - http://localhost:3001/Button.js
   - http://localhost:3001/Card.js
   - http://localhost:3001/hooks.js

## Troubleshooting

### "Components not loading"

- Ensure the remote React app is running on port 3001
- Check browser console for React errors
- Verify component exports in the expozr

### TypeScript Issues

- Make sure both apps use compatible React versions
- Check that TypeScript definitions are properly exported
- Verify webpack TypeScript configuration

### Runtime Errors

- Check React component compatibility
- Ensure proper React context sharing
- Verify component props are correctly passed

### Development Issues

- Clear browser cache for component updates
- Restart both applications after config changes
- Check webpack output for build errors

## Advanced Usage

### Sharing React Context

For sharing React context between host and remote:

```typescript
// In the expozr
export const ThemeContext = React.createContext();

// In the host
const theme = useContext(ThemeContext);
```

### Component Library Pattern

The remote can act as a complete component library:

```typescript
// Export multiple components together
export { Button, Card, Input, Modal } from "./components";
export { useCounter, useToggle, useApi } from "./hooks";
export { theme, colors } from "./design-system";
```

## Next Steps

- Try the [Vanilla JavaScript example](../vanilla/) for simpler module sharing
- Explore [advanced React patterns](../../../docs/react-patterns.md)
- Learn about [performance optimization](../../../docs/performance.md)
- Check out [deployment strategies](../../../docs/deployment.md)
