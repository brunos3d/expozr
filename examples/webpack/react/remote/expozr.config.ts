/**
 * Example React warehouse configuration
 */

import { defineWarehouseConfig } from "@expozr/core";

export default defineWarehouseConfig({
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
  dependencies: {
    react: "^18.0.0",
    "react-dom": "^18.0.0",
  },
  build: {
    outDir: "dist",
    publicPath: "http://localhost:3001/",
  },
  metadata: {
    description: "Example React components warehouse",
    author: "Expozr Team",
    license: "MIT",
    tags: ["react", "components", "ui"],
  },
});
