const { createExpozrPlugin } = require("@expozr/webpack-adapter");

/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  reactStrictMode: true,
  transpilePackages: [],
  // Ensure the remote can be loaded from a different origin
  crossOrigin: "anonymous",
  /**
   * @param {import('webpack').Configuration} config
   * @returns {import('webpack').Configuration}
   */
  webpack: (config) => {
    if (config.entry) {
      const originalEntry = config.entry;

      config.entry = async () => {
        const entries = await originalEntry();

        return {
          ...entries,
          Button: {
            import: "./components/Button.tsx",
            dependOn: undefined,
          },
        };
      };
    }

    if (!config.plugins) {
      config.plugins = [];
    }

    config.plugins.push(
      createExpozrPlugin({
        // outputPath: "public",
        outputPath: ".next/static/chunks",
        configureDevServer: false,
        configureOptimizations: false,
        configureTypescript: false,
        configureUMDOutput: false,
      })
    );

    return config;
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: "/Button.js",
          destination: "/_next/static/chunks/Button.js",
        },
        {
          source: "/expozr.inventory.json",
          destination: "/_next/static/chunks/expozr.inventory.json",
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/(.*)", // Match all routes
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://localhost:3000",
          },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
};
