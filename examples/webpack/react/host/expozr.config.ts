/**
 * React host configuration
 * This host consumes React components from the React expozr
 */

import { defineExpozrConfig } from "@expozr/core";

export default defineExpozrConfig({
  name: "react-host",
  version: "1.0.0",
  expose: {
    // Currently just a consumer, but ready to expose modules if needed
  },
  metadata: {
    description: "React host example that consumes React components",
    author: "Expozr Team",
    license: "MIT",
    tags: ["react", "host", "consumer", "components"],
  },
});
