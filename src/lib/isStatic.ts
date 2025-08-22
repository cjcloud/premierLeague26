/**
 * Helper to determine if we're running in a static export environment like Firebase hosting
 */
export const isStaticEnvironment = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Check if we're on Firebase hosting or other static host
    return window.location.hostname.includes('firebaseapp.com') || 
           window.location.hostname.includes('web.app') ||
           process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';
  }
  
  // Server-side check
  // In a static export context, output is "export" in next.config.js
  return process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';
};
