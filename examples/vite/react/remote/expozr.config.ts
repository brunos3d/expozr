/**
 * Vite React Remote - Expozr Configuration
 */

import { defineExpozrConfig } from "@expozr/core";

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
  metadata: {
    description: "Vite React components warehouse",
    author: "Expozr Team",
    license: "MIT",
    tags: ["react", "vite", "components"],
  },
});
