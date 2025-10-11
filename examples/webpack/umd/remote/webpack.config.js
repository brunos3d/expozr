const path = require("path");
const { createExpozrPlugin } = require("@expozr/webpack-adapter");

module.exports = {
  mode: "none", // Force mode to none for proper UMD
  entry: {
    calculator: "./src/calculator.ts",
    advanced: "./src/advanced.ts",
  },
  devtool: false, // Disable source maps for cleaner UMD
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
  // Force UMD output configuration
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    library: {
      name: "[name]",
      type: "umd",
      export: "default",
    },
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this",
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
    hot: false, // Disable hot reloading for UMD
    liveReload: false, // Disable live reloading for UMD
    devMiddleware: {
      writeToDisk: true, // Ensure files are written to disk in development
    },
  },
};
