import api from '../api/axios';
import userIcon from '../assets/images/user_icon.png';

/**
 * Get the full image URL, handling both Cloudinary URLs and local paths
 * @param imagePath - The image path from the database (can be Cloudinary URL or local path)
 * @param fallback - Optional fallback image (defaults to userIcon)
 * @returns Full image URL
 */
export const getImageUrl = (imagePath?: string | null, fallback: string = userIcon): string => {
  if (!imagePath) {
    return fallback;
  }
  
  // If it's already a full URL (Cloudinary), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Otherwise, prepend the API base URL for local images
  return `${api.defaults.baseURL}/${imagePath}`;
};

/**
 * Check if an image URL is from Cloudinary
 * @param imagePath - The image path to check
 * @returns true if it's a Cloudinary URL
 */
export const isCloudinaryUrl = (imagePath?: string | null): boolean => {
  if (!imagePath) return false;
  return imagePath.includes('cloudinary.com') || imagePath.includes('res.cloudinary.com');
};
