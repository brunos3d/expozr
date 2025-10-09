const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {
  createHostConfig,
  createWarehousePlugin,
} = require("@expozr/webpack-adapter");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    // Apply Expozr host optimizations
    ...createHostConfig(),
    entry: "./src/index.tsx",
    mode: argv.mode || "development",
    devtool: isProduction ? "source-map" : "inline-source-map",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "app.js",
      clean: true,
      library: {
        name: "ReactHost",
        type: "umd",
      },
      globalObject: "this",
    },
    plugins: [
      // Automatically discovers expozr.config.ts
      createWarehousePlugin(),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        title: "Expozr Host Example",
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      port: 3000,
      open: true,
      hot: true,
      liveReload: true,
      devMiddleware: {
        writeToDisk: true, // Ensure files are written to disk in development
      },
    },
  };
};
