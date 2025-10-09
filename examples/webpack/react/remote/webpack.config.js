const path = require("path");
const {
  createWarehousePlugin,
  createWarehouseConfig,
} = require("@expozr/webpack-adapter");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    ...createWarehouseConfig(), // Apply Expozr warehouse optimizations
    // NOTE: Entries from expozr.config.ts are auto-populated. You can add custom entries here if needed.
    // Custom entries will take precedence over auto-generated ones with the same name.
    entry: {
      // Example: Override the Button entry with a custom one, or add additional entries
      // Button: './src/custom-button.tsx', // This would override the expozr.config.ts Button entry
    },
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
