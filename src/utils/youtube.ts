/**
 * Extracts YouTube video ID from various URL formats
 * Supports:
 * - youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 * - youtube.com/embed/VIDEO_ID
 * - youtube.com/v/VIDEO_ID
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Remove whitespace
  url = url.trim();
  
  // Pattern 1: youtube.com/watch?v=VIDEO_ID
  let match = url.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];
  
  // Pattern 2: youtu.be/VIDEO_ID
  match = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];
  
  // Pattern 3: youtube.com/embed/VIDEO_ID
  match = url.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];
  
  // Pattern 4: youtube.com/v/VIDEO_ID
  match = url.match(/(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];
  
  return null;
};

/**
 * Converts any YouTube URL to embed format
 */
export const getYouTubeEmbedUrl = (url: string): string | null => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  
  return `https://www.youtube.com/embed/${videoId}`;
};
