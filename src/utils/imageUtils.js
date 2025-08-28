// Image URL utility for consistent image handling
const BACKEND_URL = process.env.REACT_APP_API_URL || 'https://charism-backend.onrender.com';

export const getImageUrl = (imagePath, type = 'general') => {
  if (!imagePath) return null;
  
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Handle different image types
  switch (type) {
    case 'profile':
      return `${BACKEND_URL}/uploads/profile-pictures/${cleanPath}`;
    case 'event':
      return `${BACKEND_URL}/uploads/${cleanPath}`;
    case 'logo':
      return `${BACKEND_URL}/uploads/${cleanPath}`;
    case 'documentation':
      return `${BACKEND_URL}/uploads/documentation/${cleanPath}`;
    default:
      return `${BACKEND_URL}/uploads/${cleanPath}`;
  }
};

export const getProfilePictureUrl = (filename) => {
  return getImageUrl(filename, 'profile');
};

export const getEventImageUrl = (filename) => {
  return getImageUrl(filename, 'event');
};

export const getLogoUrl = (filename) => {
  return getImageUrl(filename, 'logo');
};

export const getDocumentationUrl = (filename) => {
  return getImageUrl(filename, 'documentation');
};

// Add timestamp to prevent caching issues
export const getImageUrlWithTimestamp = (imagePath, type = 'general') => {
  const baseUrl = getImageUrl(imagePath, type);
  if (!baseUrl) return null;
  
  const timestamp = new Date().getTime();
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}t=${timestamp}`;
};
