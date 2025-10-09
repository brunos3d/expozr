const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { suppressExpozrWarnings } = require("@expozr/webpack-adapter");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/index.ts",
    mode: argv.mode || "development",
    devtool: isProduction ? "source-map" : "inline-source-map",
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
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "app.js",
      clean: true,
    },
    ignoreWarnings: suppressExpozrWarnings(),
    plugins: [
      new HtmlWebpackPlugin({
        template: "src/index.html",
        title: "Expozr UMD Calculator Example",
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
