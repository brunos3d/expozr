# Expozr Webpack Utilities

Clean, simple webpack configurations for the Expozr ecosystem.

## Quick Start

### For Host Applications (consuming remote modules):

```javascript
const {
  createExpozrPlugin,
  suppressExpozrWarnings,
} = require("@expozr/webpack-adapter");

module.exports = {
  ignoreWarnings: suppressExpozrWarnings(), // 🎯 Suppress Expozr warnings
  plugins: [
    // 🚀 Auto-discovers expozr.config.ts (includes warning suppression)
    createExpozrPlugin(), // optional, you can use just in case you want to expose some module/crate
  ],
};
```

### For Expozr Applications (providing remote modules):

```javascript
const { createExpozrPlugin } = require("@expozr/webpack-adapter");

module.exports = {
  plugins: [
    createExpozrPlugin(), // 🚀 Auto-discovers expozr.config.ts (includes warning suppression)
  ],
  // ... your custom config
};
```

## What's Included

### `suppressExpozrWarnings()`

- ✅ Suppresses all common Expozr dynamic import warnings
- ✅ Covers Navigator, Core, and all @expozr packages
- ✅ Automatically included in `createExpozrPlugin()` and `createHostPlugin()`

### Webpack Plugins

- ✅ `createExpozrPlugin()` - Auto-discovers expozr.config.ts + warning suppression
- ✅ `createHostPlugin()` - Configures host applications + warning suppression

## Benefits

🎯 **Zero Configuration** - Works out of the box  
🚀 **Clean DX** - No scary webpack warnings  
📦 **Optimized** - Best practices baked in  
🔧 **Flexible** - Use what you need, customize the rest

```javascript
const { createExpozrPlugin } = require("@expozr/webpack-adapter");

module.exports = {
  entry: "./src/index.tsx",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  plugins: [createExpozrPlugin()],
};
```

Much cleaner! 🎉
