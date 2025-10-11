const HtmlWebpackPlugin = require("html-webpack-plugin");
const { createHostPlugin } = require("@expozr/webpack-adapter");
const path = require("path");

/**
 * Webpack configuration for ESM host
 * @param {*} env - The environment variables
 * @param {*} argv - The command line arguments
 * @returns {import("webpack").Configuration} - The webpack configuration object
 */
module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/index.ts",
    mode: "none", // Use 'none' for minimal output
    devtool: false, // No source maps for cleaner output

    optimization: {
      minimize: false,
      concatenateModules: false,
      usedExports: false,
      sideEffects: false,
      runtimeChunk: false,
      splitChunks: false, // Disable chunk splitting
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
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "index.html",
      }),
      createHostPlugin(), // Will automatically discover expozr.config.ts for host
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      port: 3000,
      open: false,
      hot: true,
      devMiddleware: {
        writeToDisk: true,
      },
    },
  };
};
