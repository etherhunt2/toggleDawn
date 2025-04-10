/**
 * Extracts the slug from a URL path
 * @param url The full URL or path
 * @returns The extracted slug
 */
export const extractSlugFromUrl = (url: string): string => {
  // Split the URL by '/' and get the last segment
  const segments = url.split('/');
  return segments[segments.length - 1];
};