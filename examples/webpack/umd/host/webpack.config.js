const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { suppressExpozrWarnings } = require("@expozr/webpack-adapter");

/**
 * Webpack configuration
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

    resolve: {
      extensions: [".ts", ".js"],
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        vm: false,
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist"),
    },
    plugins: [
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
