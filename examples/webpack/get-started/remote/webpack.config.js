const path = require("path");

/**
 * Webpack configuration
 * @param {*} env - The environment variables
 * @param {*} argv - The command line arguments
 * @returns {import("webpack").Configuration} - The webpack configuration object
 */
module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/index.ts",
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
    resolve: {
      extensions: [".ts", ".js"],
    },
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
      module: true, // Output as ES module
      library: {
        type: "module",
      },
      environment: {
        module: true,
        arrowFunction: true,
        const: true,
        destructuring: true,
        forOf: true,
      },
    },
    experiments: {
      outputModule: true, // Enable ES module output
    },
    plugins: [],
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      port: 3001,
      open: false,
      hot: true,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow CORS
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization",
      },
      devMiddleware: {
        writeToDisk: true,
      },
    },
  };
};
