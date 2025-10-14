const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { suppressExpozrWarnings } = require("@expozr/webpack-adapter");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    mode: argv.mode || "development",
    entry: "./src/main.tsx", // Use bootstrap.tsx as entry point
    devtool: isProduction ? "source-map" : "inline-source-map",
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
      extensions: [".tsx", ".ts", ".js"],
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        vm: false,
      },
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
      new HtmlWebpackPlugin({
        template: "./public/index.html", // Use public/index.html as template
      }),
    ],
    devServer: {
      static: [
        {
          directory: path.join(__dirname, "dist"),
        },
      ],
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
