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
      
      // Minimize plugins
      config.plugins = config.plugins.filter(plugin => {
        // Keep only essential plugins
        return !plugin.constructor.name.includes('Bundle') &&
               !plugin.constructor.name.includes('Analyzer');
      });
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

module.exports = nextConfig;