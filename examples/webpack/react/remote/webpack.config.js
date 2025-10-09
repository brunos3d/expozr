const path = require("path");
const {
  createWarehousePlugin,
  createWarehouseConfig,
} = require("@expozr/webpack-adapter");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    ...createWarehouseConfig(), // Apply Expozr warehouse optimizations
    entry: {
      Button: "./src/components/Button.tsx",
      Card: "./src/components/Card.tsx",
      hooks: "./src/hooks/index.ts",
    }, // Adapter will populate this from expozr.config.ts
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
    // externals are now handled by createWarehouseConfig()
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
};
