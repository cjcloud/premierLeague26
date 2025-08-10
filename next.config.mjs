/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure all routes, including admin, are processed correctly
  // This helps prevent 404 errors in production
  output: 'standalone',
  // Allow middleware to handle admin authorization
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
