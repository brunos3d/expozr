import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/index.ts",
  external: ["@expozr/core", "@expozr/navigator", "fs", "path", "process"],
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
      banner: "#!/usr/bin/env node",
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "./dist",
      exclude: ["**/*.test.ts", "node_modules/**"],
    }),
  ],
};
