const path = require("path");
const { createWarehousePlugin } = require("@expozr/webpack-adapter");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: {}, // Adapter will populate this from expozr.config.ts
    mode: argv.mode || "development",
    devtool: isProduction ? "source-map" : "inline-source-map",
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
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
      filename: "[name].js",
      library: {
        name: "[name]",
        type: "umd",
      },
      globalObject: "this",
      clean: true,
    },
    plugins: [
      // Automatically discovers expozr.config.ts
      createWarehousePlugin(),
    ],
    externals: {
      react: "react",
      "react-dom": "react-dom",
    },
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      port: 3002,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      open: false,
      hot: true,
      liveReload: true,
    },
  };
};
