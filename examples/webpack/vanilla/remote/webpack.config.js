const path = require("path");
const { createExpozrPlugin } = require("@expozr/webpack-adapter");

module.exports = {
  entry: {
    hello: "./src/hello.ts",
    utils: "./src/utils.ts",
  },
  devtool: "inline-source-map",
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
