# Webpack + Express + UMD Example

This example demonstrates server-side UMD module federation between Express applications using Expozr and Webpack. It shows how to use a singleton navigator to efficiently load UMD modules across multiple API routes.

## Overview

- **Host Server** (port 5000): Express server with 5 API routes using singleton navigator
- **Remote Server** (port 5001): Express server exposing UMD modules via Webpack

## Quick Start

1. **Start the Remote Server** (port 5001):

   ```bash
   cd remote
   # npm run build && npm start
   # Starts on http://localhost:5001
   ```

2. **Start the Host Server** (in a new terminal):

   ```bash
   cd host
   npm run dev  # Starts on http://localhost:5000
   # or
   # npm run build && npm start
   # Starts on http://localhost:5000
   ```

3. **Open your browser** to http://localhost:5000

## What's Included

### Remote Server (`./remote/`) - Port 5001

Exposes UMD modules for server-side consumption:

- **`userUtils`**: User management functions (getUserData, createUser, validateUser)
- **`mathUtils`**: Mathematical operations (calculate, generateStats, formatNumber)
- **`dataProcessor`**: Data processing utilities (processData, transformData, aggregateData)

**Configuration** (`expozr.config.ts`):

```typescript
export default defineExpozrConfig({
  name: "express-remote-server",
  version: "1.0.0",
  expose: {
    "./userUtils": {
      entry: "./src/modules/user-utils.ts",
      exports: ["getUserData", "createUser", "validateUser"],
    },
    "./mathUtils": {
      entry: "./src/modules/math-utils.ts",
      exports: ["calculate", "generateStats", "formatNumber"],
    },
    "./dataProcessor": {
      entry: "./src/modules/data-processor.ts",
      exports: ["processData", "transformData", "aggregateData"],
    },
  },
});
```

### Host Server (`./host/`) - Port 5000

Express server with 5 API routes demonstrating UMD module loading:

#### Singleton Navigator

```typescript
// src/navigator.ts
export function getNavigator() {
  if (!navigatorInstance) {
    navigatorInstance = createNavigator({
      expozrs: {
        "express-remote-server": {
          url: "http://localhost:5001",
        },
      },
      cache: {
        strategy: "memory",
        ttl: 300000, // 5 minutes
      },
    });
  }
  return navigatorInstance;
}
```

#### API Routes

1. **GET `/api/health`** - Health check (no UMD loading)
2. **GET `/api/users/:id`** - User data retrieval (uses `userUtils` UMD)
3. **POST `/api/calculate`** - Math operations (uses `mathUtils` UMD)
4. **POST `/api/process-data`** - Data processing (uses `dataProcessor` UMD)
5. **POST `/api/users`** - User creation (uses `userUtils` UMD)

## Testing with cURL

### 1. Health Check

```bash
curl http://localhost:5000/api/health
```

### 2. Get User Data

```bash
curl http://localhost:5000/api/users/123
```

### 3. Math Operations

```bash
curl -X POST http://localhost:5000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation": "add", "operands": [10, 20, 30]}'
```

### 4. Process Data

```bash
curl -X POST http://localhost:5000/api/process-data \
  -H "Content-Type: application/json" \
  -d '{"data": [1, 2, 3, "test", {"key": "value"}], "type": "mixed"}'
```

### 5. Create User

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john.doe@example.com"}'
```

## Key Features

### Server-Side UMD Loading

- **Singleton Navigator**: Reused across all routes for efficient module caching
- **UMD Format**: Universal modules work in Node.js server environment
- **Memory Caching**: Fast subsequent requests using cached modules
- **Error Handling**: Comprehensive error handling for module loading failures

### API Architecture

```typescript
// Route using UMD module
app.get("/api/users/:id", async (req, res) => {
  try {
    const userUtils = await loadCargo("./userUtils");
    const userData = userUtils.getUserData(parseInt(req.params.id));
    res.json({ userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Interactive Web Interface

- **5 Test Buttons**: One for each API route
- **Real-time JSON Display**: Formatted response output
- **Error Handling**: Visual error states
- **Auto-loading**: Automatic health check on page load

## Development Workflow

1. **Start Remote**: UMD modules served from port 5001
2. **Build Host**: Webpack bundles the Express server
3. **Start Host**: Express server loads UMD modules at runtime
4. **Test APIs**: Use web interface or cURL commands
5. **Monitor Console**: Server logs show module loading activity

## Configuration Files

### Remote Webpack Config

```javascript
module.exports = {
  entry: {
    userUtils: "./src/modules/user-utils.ts",
    mathUtils: "./src/modules/math-utils.ts",
    dataProcessor: "./src/modules/data-processor.ts",
  },
  output: {
    library: {
      name: "[name]",
      type: "umd",
    },
  },
  plugins: [createExpozrPlugin()],
};
```

### Host Webpack Config

```javascript
module.exports = {
  entry: "./src/server.ts",
  target: "node", // Server-side bundle
  externals: {
    express: "commonjs express",
    cors: "commonjs cors",
  },
};
```

## UMD Module Examples

### User Utils Module

```typescript
export function getUserData(userId: number): User {
  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    age: Math.floor(Math.random() * 50) + 18,
    isActive: Math.random() > 0.3,
  };
}

// UMD compatibility
export default { getUserData, createUser, validateUser };
```

## Server Architecture Benefits

- **Modular Design**: Clear separation between host and remote servers
- **Scalable Caching**: Singleton navigator with configurable cache strategies
- **Type Safety**: Full TypeScript support for UMD modules
- **Production Ready**: Error handling, logging, and performance monitoring
- **API Documentation**: Self-documenting routes with comprehensive responses

## Troubleshooting

### Common Issues

1. **Module Loading Failures**: Ensure remote server is running on port 5001
2. **CORS Errors**: Check that remote server has proper CORS headers
3. **Cache Issues**: Restart host server to clear memory cache
4. **Build Errors**: Verify all dependencies are installed

### Debug Tips

- Check server console for module loading logs
- Test remote inventory: http://localhost:5001/expozr.inventory.json
- Use cURL for isolated API testing
- Monitor network requests in browser DevTools

## Next Steps

- Explore the [React Example](../react/) for client-side component federation
- Check the [UMD Example](../umd/) for browser-based UMD loading
- Read about [Singleton Navigator Patterns](../../docs/patterns/singleton-navigator.md)
