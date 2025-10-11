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

    optimization: {
      minimize: false,
      concatenateModules: false,
      usedExports: false,
      sideEffects: false,
      runtimeChunk: false,
      splitChunks: false, // Disable chunk splitting
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                target: "ES2020",
                module: "ES2020", // Output ES modules
                moduleResolution: "node",
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
              },
            },
          },
          exclude: /node_modules/,
        },
      ],
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
      // Let the expozr plugin handle the output format based on expozr.config.ts
    },
    plugins: [
      createExpozrPlugin(), // Will automatically discover expozr.config.ts and apply ESM config
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
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
