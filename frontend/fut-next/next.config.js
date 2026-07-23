// Doc 3/11: @next/bundle-analyzer is already installed (package.json) but was
// never actually wired up here, AND the webpack() override below
// unconditionally filters out any plugin whose name includes "Bundle" or
// "Analyzer" - so even if someone tried `ANALYZE=true next build`, this
// config would have silently stripped the analyzer's own plugin before it
// could run. That's the one tool that could show *why* this build needs up
// to 16GB of heap (see build:emergency/build:memory/build:windows scripts,
// and the 5 different Dockerfile.* variants) - it was disabled by the same
// effort trying to work around the symptom. Wired it up properly below,
// gated behind ANALYZE so normal builds are unaffected. Likely culprits
// worth checking once this runs: @react-three/fiber + drei (full three.js),
// gsap, framer-motion, and styled-components are all real dependencies
// (not dynamically imported per-page as far as this pass could confirm) -
// but the analyzer output is what actually answers it, not a guess.
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  
  // Minimal experimental features to reduce memory usage
  experimental: {
    webVitalsAttribution: ['CLS'],
    optimizePackageImports: ['lucide-react'],
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dxfjdqqppxfoobevbubc.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // Aggressive memory optimization for Docker builds
  webpack: (config, { dev, isServer }) => {
    // Extreme memory optimization
    config.parallelism = 1;
    config.cache = false; // Disable webpack cache to save memory
    
    if (!dev) {
      // Disable source maps completely
      config.devtool = false;
      
      // Minimal chunk splitting to reduce memory usage
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 50000,
        maxSize: 150000,
        cacheGroups: {
          default: false,
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
        },
      };
      
      // Disable most optimizations to save memory
      config.optimization.usedExports = false;
      config.optimization.sideEffects = false;
      
      // Minimize plugins - but never during an intentional ANALYZE run,
      // otherwise this strips out the analyzer plugin withBundleAnalyzer
      // just added above and the report silently comes back empty.
      if (process.env.ANALYZE !== 'true') {
        config.plugins = config.plugins.filter(plugin => {
          // Keep only essential plugins
          return !plugin.constructor.name.includes('Bundle') &&
                 !plugin.constructor.name.includes('Analyzer');
        });
      }
    }
    
    // Memory-focused resolve options
    config.resolve.symlinks = false;
    config.resolve.cacheWithContext = false;
    
    // Infrastructure logging
    config.infrastructureLogging = {
      level: 'error',
    };
    
    return config;
  },
  
  // Minimal compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Disable features that use memory
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // Keep this for safety
  },
  
  // Static optimization
  trailingSlash: false,
  poweredByHeader: false,
  compress: false, // Let the reverse proxy handle compression
};

module.exports = withBundleAnalyzer(nextConfig);