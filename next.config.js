/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Completely exclude playwright from the client-side bundle
  webpack: (config, { isServer }) => {
    // Only include playwright in the server-side bundle
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'playwright-core': false,
        'playwright': false,
      };
    }

    // Find the rule that handles CSS
    const cssRule = config.module.rules.find(
      (rule) => rule.test && rule.test.toString().includes('css')
    );

    // If found, modify it to exclude problematic CSS imports
    if (cssRule) {
      const cssLoaders = cssRule.use;
      if (cssLoaders) {
        // Add a condition to exclude CSS from node_modules/playwright-core
        cssRule.exclude = [/node_modules\/playwright-core/];
      }
    }

    // Add a specific rule for Playwright CSS files
    config.module.rules.push({
      test: /node_modules\/playwright-core\/.*\.css$/,
      use: 'null-loader',
      // This ensures these files are completely ignored
      type: 'javascript/auto',
    });

    return config;
  },
};

module.exports = nextConfig; 