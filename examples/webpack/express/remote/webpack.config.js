const path = require("path");
const { createExpozrPlugin } = require("@expozr/webpack-adapter");

/**
 * Webpack configuration for Express remote server
 * @type {import("webpack").Configuration}
 */
module.exports = {
  entry: {
    userUtils: "./src/modules/user-utils.ts",
    mathUtils: "./src/modules/math-utils.ts",
    dataProcessor: "./src/modules/data-processor.ts",
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
      name: "[name]",
      type: "umd",
    },
    globalObject: "this",
    umdNamedDefine: true,
  },
  plugins: [
    createExpozrPlugin(), // Will automatically discover expozr.config.ts
  ],
};
