import { regionService } from './regionService';

export const imageServiceConfig = {
  width: 800,
  height: 400,

  // Get base URL for image service
  getBaseUrl: () => {
    if (typeof window !== 'undefined') {
      const storedUrl = window.localStorage.getItem('imageServiceUrl');
      if (storedUrl) return storedUrl;
    }
    return process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL || 'https://picsum.photos';
  },

  // Generate deterministic image URL based on domain, language, and date
  getImageUrl: (date: string, region?: string, language?: string): string => {
    const regionPath = regionService.getRegionPath(region);
    const lang = language || 'en';
    const baseUrl = imageServiceConfig.getBaseUrl();

    // Create deterministic URL pattern: baseUrl/region/language/date
    return `${baseUrl}/${regionPath}/${lang}/${date}`;
  },

  // Get image URL with fallback to placeholder
  getImageUrlWithFallback: (date: string, region?: string, language?: string): string => {
    const imageUrl = imageServiceConfig.getImageUrl(date, region, language);

    // Return the deterministic URL - if it fails to load, the browser will show the placeholder
    return imageUrl;
  },

  // Get placeholder image for language
  getPlaceholderImage: (): string => {
    const url = 'https://placehold.co/800x400';
    console.log('Using placeholder image URL:', url);
    return url;
  },

  // Get fallback image URL for yesterday
  getFallbackImageUrl: (date: string, region?: string, language?: string): string => {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    return imageServiceConfig.getImageUrl(yesterdayStr, region, language);
  },

  // Get media URL with animation support (GIF/MP4)
  getMediaUrl: (date: string, region?: string, language?: string, preferVideo = false): string => {
    const regionPath = regionService.getRegionPath(region);
    const lang = language || 'en';
    const baseUrl = imageServiceConfig.getBaseUrl();

    if (preferVideo) {
      // Try MP4 first, then fallback to static image
      return `${baseUrl}/${regionPath}/${lang}/${date}.mp4`;
    } else {
      // Try GIF first, then fallback to static image
      return `${baseUrl}/${regionPath}/${lang}/${date}.gif`;
    }
  },

  // Check if URL is for video content
  isVideoUrl: (url: string): boolean => {
    if (!url) return false;
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
  },

  // Check if URL is for animated content
  isAnimatedUrl: (url: string): boolean => {
    if (!url) return false;
    return url.includes('.gif') || imageServiceConfig.isVideoUrl(url);
  },

  // Get tomorrow's image URL for preloading
  getTomorrowImageUrl: (region?: string, language?: string): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return imageServiceConfig.getImageUrl(tomorrowStr, region, language);
  },

  // Legacy methods for backward compatibility (deprecated)
  getS3ImageUrl: (date: string) => {
    console.warn('getS3ImageUrl is deprecated, use getImageUrl instead');
    return imageServiceConfig.getImageUrl(date);
  },

  getFirebaseImageUrl: (date: string, region?: string, language?: string) => {
    console.warn('getFirebaseImageUrl is deprecated, use getImageUrl instead');
    return imageServiceConfig.getImageUrl(date, region, language);
  },
};
