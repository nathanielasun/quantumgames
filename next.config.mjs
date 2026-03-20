/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow importing from games/ submodule directories
  transpilePackages: [],
  webpack: (config) => {
    // Ensure game directories under games/ can be resolved
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;
