import { imageServiceConfig } from '../imageService';

// Mock the regionService
jest.mock('../regionService', () => ({
  regionService: {
    getRegionPath: jest.fn(() => 'global'),
  },
}));

import { regionService } from '../regionService';

// Mock process.env
const originalEnv = process.env;

describe('Image Service Config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
    // Mock localStorage methods
    jest.spyOn(window.localStorage, 'getItem').mockImplementation(() => null);
    jest.spyOn(window.localStorage, 'setItem').mockImplementation(() => undefined);
    jest.spyOn(window.localStorage, 'clear').mockImplementation(() => undefined);
    
    // Reset regionService mock
    (regionService.getRegionPath as jest.Mock).mockReturnValue('global');
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('should have proper width and height values', () => {
    expect(imageServiceConfig.width).toBe(800);
    expect(imageServiceConfig.height).toBe(400);
  });

  it('should generate correct image URL with date', () => {
    const date = '2023-01-01';
    const url = imageServiceConfig.getImageUrl(date);
    expect(url).toContain(date);
    expect(url).toContain('800/400');
  });

  it('should use stored URL from localStorage when available', () => {
    const storedUrl = 'https://custom-image-service.com';
    (window.localStorage.getItem as jest.Mock).mockReturnValue(storedUrl);

    expect(imageServiceConfig.getBaseUrl()).toBe(storedUrl);
  });

  it('should use environment variable when localStorage is empty', () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL = 'https://env-image-service.com';

    expect(imageServiceConfig.getBaseUrl()).toBe('https://env-image-service.com');
  });

  it('should use default URL when neither localStorage nor env var is available', () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL = undefined;

    expect(imageServiceConfig.getBaseUrl()).toBe('https://picsum.photos');
  });

  describe('getS3ImageUrl', () => {
    it('should generate S3 URL for AWS S3 base URL', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('https://my-bucket.s3.amazonaws.com');
      (regionService.getRegionPath as jest.Mock).mockReturnValue('us');
      
      const date = '2023-01-01';
      const url = imageServiceConfig.getS3ImageUrl(date);
      expect(url).toBe('https://my-bucket.s3.amazonaws.com/us/2023-01-01.jpg');
    });

    it('should generate S3 URL for amazonaws.com base URL', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('https://my-bucket.amazonaws.com');
      (regionService.getRegionPath as jest.Mock).mockReturnValue('eu');
      
      const date = '2023-01-01';
      const url = imageServiceConfig.getS3ImageUrl(date);
      expect(url).toBe('https://my-bucket.amazonaws.com/eu/2023-01-01.jpg');
    });

    it('should use fallback format for non-S3 URLs', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('https://picsum.photos');
      (regionService.getRegionPath as jest.Mock).mockReturnValue('ap');
      
      const date = '2023-01-01';
      const url = imageServiceConfig.getS3ImageUrl(date);
      expect(url).toBe('https://picsum.photos/800/400?date=2023-01-01&region=ap');
    });

    it('should use specified region when provided', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('https://my-bucket.s3.amazonaws.com');
      (regionService.getRegionPath as jest.Mock).mockReturnValue('us');
      
      const date = '2023-01-01';
      const url = imageServiceConfig.getS3ImageUrl(date, 'eu');
      expect(url).toBe('https://my-bucket.s3.amazonaws.com/us/2023-01-01.jpg');
      expect(regionService.getRegionPath).toHaveBeenCalledWith('eu');
    });
  });

  describe('getFallbackImageUrl', () => {
    it('should generate URL for yesterday\'s image', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('https://my-bucket.s3.amazonaws.com');
      (regionService.getRegionPath as jest.Mock).mockReturnValue('global');
      
      const date = '2023-01-02';
      const url = imageServiceConfig.getFallbackImageUrl(date);
      expect(url).toBe('https://my-bucket.s3.amazonaws.com/global/2023-01-01.jpg');
    });

    it('should handle month boundary correctly', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('https://my-bucket.s3.amazonaws.com');
      (regionService.getRegionPath as jest.Mock).mockReturnValue('global');
      
      const date = '2023-02-01';
      const url = imageServiceConfig.getFallbackImageUrl(date);
      expect(url).toBe('https://my-bucket.s3.amazonaws.com/global/2023-01-31.jpg');
    });
  });

  describe('getMediaUrl', () => {
    it('should generate MP4 URL when preferVideo is true', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('https://my-bucket.s3.amazonaws.com');
      (regionService.getRegionPath as jest.Mock).mockReturnValue('us');
      
      const date = '2023-01-01';
      const url = imageServiceConfig.getMediaUrl(date, undefined, true);
      expect(url).toBe('https://my-bucket.s3.amazonaws.com/us/2023-01-01.mp4');
    });

    it('should generate GIF URL when preferVideo is false', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('https://my-bucket.s3.amazonaws.com');
      (regionService.getRegionPath as jest.Mock).mockReturnValue('eu');
      
      const date = '2023-01-01';
      const url = imageServiceConfig.getMediaUrl(date, undefined, false);
      expect(url).toBe('https://my-bucket.s3.amazonaws.com/eu/2023-01-01.gif');
    });

    it('should fallback to S3 URL for non-S3 base URLs', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('https://picsum.photos');
      (regionService.getRegionPath as jest.Mock).mockReturnValue('ap');
      
      const date = '2023-01-01';
      const url = imageServiceConfig.getMediaUrl(date, undefined, true);
      expect(url).toBe('https://picsum.photos/800/400?date=2023-01-01&region=ap');
    });
  });

  describe('isVideoUrl', () => {
    it('should return true for MP4 URLs', () => {
      expect(imageServiceConfig.isVideoUrl('https://example.com/video.mp4')).toBe(true);
    });

    it('should return true for WEBM URLs', () => {
      expect(imageServiceConfig.isVideoUrl('https://example.com/video.webm')).toBe(true);
    });

    it('should return true for MOV URLs', () => {
      expect(imageServiceConfig.isVideoUrl('https://example.com/video.mov')).toBe(true);
    });

    it('should return false for image URLs', () => {
      expect(imageServiceConfig.isVideoUrl('https://example.com/image.jpg')).toBe(false);
    });

    it('should return false for GIF URLs', () => {
      expect(imageServiceConfig.isVideoUrl('https://example.com/image.gif')).toBe(false);
    });
  });

  describe('isAnimatedUrl', () => {
    it('should return true for GIF URLs', () => {
      expect(imageServiceConfig.isAnimatedUrl('https://example.com/image.gif')).toBe(true);
    });

    it('should return true for video URLs', () => {
      expect(imageServiceConfig.isAnimatedUrl('https://example.com/video.mp4')).toBe(true);
    });

    it('should return false for static image URLs', () => {
      expect(imageServiceConfig.isAnimatedUrl('https://example.com/image.jpg')).toBe(false);
    });
  });

  describe('getTomorrowImageUrl', () => {
    it('should generate URL for tomorrow\'s image', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('https://my-bucket.s3.amazonaws.com');
      (regionService.getRegionPath as jest.Mock).mockReturnValue('global');
      
      // Mock Date to return a fixed date
      const mockDate = new Date('2023-01-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      const url = imageServiceConfig.getTomorrowImageUrl();
      expect(url).toBe('https://my-bucket.s3.amazonaws.com/global/2023-01-02.jpg');
      
      // Restore Date
      jest.restoreAllMocks();
    });
  });
});
