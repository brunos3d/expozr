const path = require("path");
const { createExpozrPlugin } = require("@expozr/webpack-adapter");

/**
 * Webpack configuration
 * @type {import("webpack").Configuration}
 */
module.exports = {
  entry: {
    utils: "./src/index.ts",
  },
  devtool: false,
  resolve: {
    extensions: [".ts", ".js"],
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
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    library: {
      name: "utils",
      type: "umd",
    },
    globalObject: "this",
    umdNamedDefine: true,
  },
  plugins: [
    createExpozrPlugin(), // Will automatically discover expozr.config.ts
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    port: 3001,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    open: false,
    hot: true,
    liveReload: true,
    devMiddleware: {
      writeToDisk: true, // Ensure files are written to disk in development
    },
  },
};
