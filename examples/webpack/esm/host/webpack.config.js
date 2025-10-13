const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { suppressExpozrWarnings } = require("@expozr/webpack-adapter");

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
    ignoreWarnings: suppressExpozrWarnings(),
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
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        vm: false,
      },
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
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
        process: "process/browser",
      }),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "index.html",
      }),
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
