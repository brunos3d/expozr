const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const {
  createExpozrPlugin,
  suppressExpozrWarnings,
} = require("@expozr/webpack-adapter");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    mode: argv.mode || "development",
    entry: "./src/bootstrap.tsx", // Use bootstrap.tsx as entry point
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
      createExpozrPlugin(),
      new HtmlWebpackPlugin({
        template: "./public/index.html", // Use public/index.html as template
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "public",
            to: "", // Copy to the root of the output directory (dist/)
            globOptions: {
              ignore: ["**/index.html"], // Don't copy index.html as it's handled by HtmlWebpackPlugin
            },
          },
        ],
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
