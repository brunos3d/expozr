const path = require("path");
const { createExpozrPlugin } = require("@expozr/webpack-adapter");

/**
 * Webpack configuration for ESM remote
 * @param {*} env - The environment variables
 * @param {*} argv - The command line arguments
 * @returns {import("webpack").Configuration} - The webpack configuration object
 */
module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    mode: "none", // Use 'none' for minimal webpack overhead
    devtool: false, // No source maps for cleaner output
    entry: {
      utils: "./src/index.ts",
      math: "./src/math-utils.ts",
      strings: "./src/string-utils.ts",
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
      module: true, // Output as ES module
      library: {
        type: "module",
      },
      environment: {
        module: true,
        arrowFunction: true,
        const: true,
        destructuring: true,
        forOf: true,
      },
    },
    experiments: {
      outputModule: true, // Enable ES module output
    },
    plugins: [
      createExpozrPlugin(), // Will automatically discover expozr.config.ts and apply ESM config
    ],
    devServer: {
      static: {
        directory: "./dist",
      },
      port: 3001,
      open: false,
      hot: true,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow CORS
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization",
      },
      devMiddleware: {
        writeToDisk: true,
      },
    },
  };
};
