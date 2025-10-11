const path = require("path");
const { createExpozrPlugin } = require("@expozr/webpack-adapter");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
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
      createExpozrPlugin(),
    ],
    externals: {
      react: {
        commonjs: "react",
        commonjs2: "react",
        amd: "react",
        root: "React",
      },
      "react-dom": {
        commonjs: "react-dom",
        commonjs2: "react-dom",
        amd: "react-dom",
        root: "ReactDOM",
      },
    },
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
