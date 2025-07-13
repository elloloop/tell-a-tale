import { regionService } from './regionService';

export const imageServiceConfig = {
  getBaseUrl: () => {
    if (typeof window !== 'undefined') {
      const storedUrl = window.localStorage.getItem('imageServiceUrl');
      if (storedUrl) return storedUrl;
    }
    return process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL || 'https://picsum.photos';
  },
  width: 800,
  height: 400,
  getImageUrl: (date: string) => {
    return `${imageServiceConfig.getBaseUrl()}/${imageServiceConfig.width}/${imageServiceConfig.height}?date=${date}`;
  },
  // New S3-based image URL generation with region support
  getS3ImageUrl: (date: string, region?: string) => {
    const baseUrl = imageServiceConfig.getBaseUrl();
    const regionPath = regionService.getRegionPath(region);

    // If using S3, construct path as: baseUrl/region/YYYY-MM-DD.jpg
    if (baseUrl.includes('s3.amazonaws.com') || baseUrl.includes('amazonaws.com')) {
      return `${baseUrl}/${regionPath}/${date}.jpg`;
    }

    // For non-S3 URLs, fallback to original format with region as parameter
    return `${baseUrl}/${imageServiceConfig.width}/${imageServiceConfig.height}?date=${date}&region=${regionPath}`;
  },
  // Get fallback image URL for yesterday
  getFallbackImageUrl: (date: string, region?: string) => {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    return imageServiceConfig.getS3ImageUrl(yesterdayStr, region);
  },
  // Get media URL with animation support (GIF/MP4)
  getMediaUrl: (date: string, region?: string, preferVideo = false) => {
    const baseUrl = imageServiceConfig.getBaseUrl();
    const regionPath = regionService.getRegionPath(region);

    // If using S3, try video first if preferred, then fallback to image
    if (baseUrl.includes('s3.amazonaws.com') || baseUrl.includes('amazonaws.com')) {
      if (preferVideo) {
        // Try MP4 first, then GIF, then fallback to JPG
        return `${baseUrl}/${regionPath}/${date}.mp4`;
      } else {
        // Try GIF first, then fallback to JPG
        return `${baseUrl}/${regionPath}/${date}.gif`;
      }
    }

    // For non-S3 URLs, fallback to original format
    return `${baseUrl}/${imageServiceConfig.width}/${imageServiceConfig.height}?date=${date}&region=${regionPath}`;
  },
  // Check if URL is for video content
  isVideoUrl: (url: string) => {
    if (!url) return false;
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
  },
  // Check if URL is for animated content
  isAnimatedUrl: (url: string) => {
    if (!url) return false;
    return url.includes('.gif') || imageServiceConfig.isVideoUrl(url);
  },
  // Get tomorrow's image URL for preloading
  getTomorrowImageUrl: (region?: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return imageServiceConfig.getS3ImageUrl(tomorrowStr, region);
  },
};
