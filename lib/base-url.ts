/**
 * Utility for handling base URLs across the application
 * Works with Next.js basePath configuration for GitHub Pages deployment
 */

// Get the base path from Next.js configuration
const getBasePath = () => {
  // In production with GitHub Pages, this will be '/pomera-new-dev'
  // In development, this will be empty string
  return process.env.NODE_ENV === 'production' ? '/pomera-new-dev' : '';
};

/**
 * Creates a URL with the correct base path for assets
 * @param path - The relative path to the asset (e.g., '/pomera_logo_cropped.png')
 * @returns The full URL with base path
 */
export const getAssetUrl = (path: string): string => {
  const basePath = getBasePath();
  
  // Ensure path starts with '/'
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${basePath}${normalizedPath}`;
};

/**
 * Creates a URL with the correct base path for internal routes
 * @param path - The route path (e.g., '/crm', '/ats')
 * @returns The full URL with base path
 */
export const getRouteUrl = (path: string): string => {
  const basePath = getBasePath();
  
  // Ensure path starts with '/'
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${basePath}${normalizedPath}`;
};

/**
 * Gets the base URL for the current environment
 * @returns The base URL (e.g., '/pomera-new-dev' in production, '' in development)
 */
export const getBaseUrl = (): string => {
  return getBasePath();
};
