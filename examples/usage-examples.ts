/**
 * Examples of using the universal module system
 */

import {
  createHybridExpozrConfig,
  createESMExpozrConfig,
  createUMDExpozrConfig,
  createModernHostConfig,
  createNavigator,
  webpackAdapter,
  getGlobalModuleSystem,
  presets,
} from "@expozr/core";
import { WebpackAdapter } from "@expozr/webpack";

/**
 * Example 1: Create a React component expozr with hybrid ESM/UMD support
 */
export function createReactExpozr() {
  const expozrConfig = presets.reactExpozr({
    name: "my-react-components",
    version: "1.0.0",
    expose: {
      Button: "./src/components/Button.tsx",
      Card: "./src/components/Card.tsx",
      Modal: "./src/components/Modal.tsx",
    },
    dependencies: {
      react: "^18.0.0",
      "react-dom": "^18.0.0",
    },
    metadata: {
      description: "Reusable React components",
      author: "Your Team",
      license: "MIT",
    },
  });

  return expozrConfig;
}

/**
 * Example 2: Create ESM-only expozr for modern environments
 */
export function createModernExpozr() {
  const expozrConfig = createESMExpozrConfig({
    name: "modern-utils",
    version: "2.0.0",
    expose: {
      "date-utils": "./src/utils/date.ts",
      "string-utils": "./src/utils/string.ts",
      "async-utils": "./src/utils/async.ts",
    },
    build: {
      target: "browser",
      minify: true,
      sourcemap: true,
    },
  });

  return expozrConfig;
}

/**
 * Example 3: Create UMD-only expozr for legacy compatibility
 */
export function createLegacyExpozr() {
  const expozrConfig = createUMDExpozrConfig({
    name: "legacy-widgets",
    version: "1.5.0",
    expose: {
      Widget: "./src/Widget.js",
      Sidebar: "./src/Sidebar.js",
    },
    build: {
      target: "browser",
      minify: true,
    },
  });

  return expozrConfig;
}

/**
 * Example 4: Configure Webpack with the new adapter
 */
export function configureWebpack() {
  const expozrConfig = createReactExpozr();
  const adapter = new WebpackAdapter();

  // Get webpack configuration
  const webpackConfig = adapter.configureExpozr(expozrConfig, {
    entry: "./src/index.ts",
    // ... other webpack options
  });

  return webpackConfig;
}

/**
 * Example 5: Create a modern host application
 */
export function createModernHost() {
  const hostConfig = createModernHostConfig({
    expozrs: {
      "react-components": {
        url: "https://cdn.example.com/react-components/",
        version: "^1.0.0",
      },
      utils: {
        url: "https://cdn.example.com/modern-utils/",
        version: "^2.0.0",
      },
    },
    cache: {
      strategy: "indexedDB",
      ttl: 24 * 60 * 60 * 1000, // 24 hours
    },
  });

  // Create navigator
  const navigator = createNavigator(hostConfig);

  return { hostConfig, navigator };
}

/**
 * Example 6: Load components at runtime
 */
export async function loadComponentsExample() {
  const { navigator } = createModernHost();

  try {
    // Load a React component (will try ESM first, fallback to UMD)
    const ButtonComponent = await navigator.loadCargo(
      "react-components",
      "Button"
    );
    console.log("Loaded Button component:", ButtonComponent.module);

    // Load utility functions
    const DateUtils = await navigator.loadCargo("utils", "date-utils");
    console.log("Loaded date utilities:", DateUtils.module);

    // Preload components for better performance
    await navigator.preload("react-components", ["Card", "Modal"]);
    console.log("Preloaded Card and Modal components");

    return {
      Button: ButtonComponent.module,
      DateUtils: DateUtils.module,
    };
  } catch (error) {
    console.error("Error loading components:", error);
    throw error;
  }
}

/**
 * Example 7: Manual module system configuration
 */
export function configureModuleSystem() {
  const moduleSystem = getGlobalModuleSystem();

  // Get available loaders
  const loaders = moduleSystem.getLoaderRegistry().getAvailableLoaders();
  console.log("Available loaders:", Array.from(loaders.keys()));

  // Update configuration
  moduleSystem.updateConfig({
    primary: "esm",
    fallbacks: ["umd", "cjs"],
    strategy: "dynamic",
    hybrid: true,
  });

  return moduleSystem;
}

/**
 * Example 8: Using the module system directly
 */
export async function loadModuleDirectly() {
  const moduleSystem = getGlobalModuleSystem();

  try {
    // Load a module using the universal system
    const module = await moduleSystem.loadModule(
      "https://cdn.example.com/my-module.mjs"
    );
    console.log("Loaded module:", module);
    return module;
  } catch (error) {
    console.error("Failed to load module:", error);
    throw error;
  }
}

/**
 * Example 9: Webpack configuration for different modes
 */
export function getWebpackConfigs() {
  const adapter = new WebpackAdapter();

  // ESM-only configuration
  const esmConfig = adapter.configureExpozr(createModernExpozr(), {
    entry: "./src/index.ts",
  });

  // UMD-only configuration
  const umdConfig = adapter.configureExpozr(createLegacyExpozr(), {
    entry: "./src/index.js",
  });

  // Hybrid configuration (generates both ESM and UMD)
  const hybridConfig = adapter.configureExpozr(createReactExpozr(), {
    entry: "./src/index.tsx",
  });

  return {
    esm: esmConfig,
    umd: umdConfig,
    hybrid: hybridConfig, // This will be an array of configs
  };
}

/**
 * Example 10: Migration helper
 */
export function migrateLegacyProject() {
  // Legacy configuration
  const legacyConfig = {
    name: "old-project",
    version: "1.0.0",
    expose: {
      Component: "./src/Component.js",
    },
    outDir: "dist",
    publicPath: "/assets/",
  };

  // Migrate to new format
  const newConfig = createHybridExpozrConfig({
    name: legacyConfig.name,
    version: legacyConfig.version,
    expose: legacyConfig.expose,
    build: {
      outDir: legacyConfig.outDir,
      publicPath: legacyConfig.publicPath,
    },
  });

  console.log("Migrated configuration:", newConfig);
  return newConfig;
}
