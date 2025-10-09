# Expozr Webpack Utilities

Clean, simple webpack configurations for the Expozr ecosystem.

## Quick Start

### For Host Applications (consuming remote modules):

```javascript
const { createHostConfig } = require("@expozr/webpack-adapter");

module.exports = {
  ...createHostConfig(), // 🎯 Automatic Expozr optimizations
  entry: "./src/index.tsx",
  // ... your custom config
};
```

### For Warehouse Applications (providing remote modules):

```javascript
const {
  createWarehousePlugin,
  createWarehouseConfig,
} = require("@expozr/webpack-adapter");

module.exports = {
  ...createWarehouseConfig(), // 🎯 Automatic Expozr optimizations
  plugins: [
    createWarehousePlugin(), // 🚀 Auto-discovers expozr.config.ts
  ],
  // ... your custom config
};
```

### Manual Warning Suppression (if needed):

```javascript
const { suppressExpozrWarnings } = require("@expozr/webpack-adapter");

module.exports = {
  // ... your config
  ignoreWarnings: suppressExpozrWarnings(),
};
```

## What's Included

### `createHostConfig()`

- ✅ Suppresses Navigator dynamic import warnings
- ✅ Optimized resolve extensions for TypeScript/JSX
- ✅ Clean development experience

### `createWarehouseConfig()`

- ✅ Suppresses Navigator dynamic import warnings
- ✅ Optimized resolve extensions for TypeScript/JSX
- ✅ Proper React externals configuration for UMD
- ✅ Clean development experience

### `suppressExpozrWarnings()`

- ✅ Suppresses all common Expozr dynamic import warnings
- ✅ Covers Navigator, Core, and all @expozr packages
- ✅ Can be used standalone if you prefer custom configs

## Benefits

🎯 **Zero Configuration** - Works out of the box  
🚀 **Clean DX** - No scary webpack warnings  
📦 **Optimized** - Best practices baked in  
🔧 **Flexible** - Use what you need, customize the rest

## Migration

### Before:

```javascript
// ❌ Manual, error-prone configuration
module.exports = {
  resolve: { extensions: [".ts", ".tsx", ".js", ".jsx"] },
  externals: { react: "React", "react-dom": "ReactDOM" },
  ignoreWarnings: [
    /* complex regex patterns */
  ],
  // ... lots of boilerplate
};
```

### After:

```javascript
// ✅ Clean, simple, optimized
module.exports = {
  ...createWarehouseConfig(),
  entry: "./src/index.tsx",
};
```

Much cleaner! 🎉
