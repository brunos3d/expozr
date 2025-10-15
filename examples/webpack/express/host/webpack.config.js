const path = require("path");
const { suppressExpozrWarnings } = require("@expozr/webpack-adapter");

/**
 * Webpack configuration for Express host server
 * @param {*} env - The environment variables
 * @param {*} argv - The command line arguments
 * @returns {import("webpack").Configuration} - The webpack configuration object
 */
module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/server.ts",
    target: "node", // Server-side Node.js
    mode: "none",
    devtool: false,

    ignoreWarnings: suppressExpozrWarnings(),

    resolve: {
      extensions: [".ts", ".js"],
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        vm: false,
      },
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
    output: {
      filename: "server.js",
      path: path.resolve(__dirname, "dist"),
    },
    externals: {
      // Exclude Node.js built-in modules
      express: "commonjs express",
      cors: "commonjs cors",
      fs: "commonjs fs",
      path: "commonjs path",
      http: "commonjs http",
    },
  };
};
