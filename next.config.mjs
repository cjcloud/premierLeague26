/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure all routes, including admin, are processed correctly
  // This helps prevent 404 errors in production
  output: 'standalone',
  
  // Enable proper CSS loading and processing
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables to be available at build time
  env: {
    DATABASE_URL: 'postgresql://neondb_owner:npg_3za5wATPudVL@ep-jolly-band-ablax6xh-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    SECRET_COOKIE_PASSWORD: 'complex_password_at_least_32_characters_long_replace_this',
  },
  
  // Allow middleware to handle admin authorization
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
