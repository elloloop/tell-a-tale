// Mock regionService before importing imageService
jest.mock('../regionService', () => ({
  regionService: {
    getRegionPath: jest.fn(regionCode => regionCode || 'global'),
  },
}));

import { imageServiceConfig } from '../imageService';
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

    // Reset regionService mock to return the actual region code
    (regionService.getRegionPath as jest.Mock).mockImplementation(
      regionCode => regionCode || 'global'
    );
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

  it('should generate correct image URL with date, region, and language', () => {
    const date = '2023-01-01';
    const url = imageServiceConfig.getImageUrl(date, 'us', 'en');
    expect(url).toContain(date);
    expect(url).toContain('us');
    expect(url).toContain('en');
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

  it('should fallback to picsum.photos when no environment variable is set', () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL = undefined;

    expect(imageServiceConfig.getBaseUrl()).toBe('https://picsum.photos');
  });

  describe('getImageUrl', () => {
    it('should generate deterministic URL for image', () => {
      const date = '2023-01-01';
      const url = imageServiceConfig.getImageUrl(date, 'eu', 'fr');

      expect(url).toContain('eu');
      expect(url).toContain('fr');
      expect(url).toContain(date);
      expect(regionService.getRegionPath).toHaveBeenCalledWith('eu');
    });

    it('should use default region and language when not provided', () => {
      const date = '2023-01-01';
      const url = imageServiceConfig.getImageUrl(date);

      expect(url).toContain('global');
      expect(url).toContain('en');
      expect(url).toContain(date);
    });
  });

  describe('getPlaceholderImage', () => {
    it('should return placeholder image URL', () => {
      const placeholder = imageServiceConfig.getPlaceholderImage();
      expect(placeholder).toContain('placehold.co');
    });
  });

  describe('getFallbackImageUrl', () => {
    it("should generate URL for yesterday's image", () => {
      const date = '2023-01-02';
      const url = imageServiceConfig.getFallbackImageUrl(date, 'ap', 'ja');

      expect(url).toContain('2023-01-01');
      expect(url).toContain('ap');
      expect(url).toContain('ja');
    });

    it('should handle month boundary correctly', () => {
      const date = '2023-02-01';
      const url = imageServiceConfig.getFallbackImageUrl(date);

      expect(url).toContain('2023-01-31');
    });
  });

  describe('getMediaUrl', () => {
    it('should generate MP4 URL when preferVideo is true', () => {
      const date = '2023-01-01';
      const url = imageServiceConfig.getMediaUrl(date, 'us', 'en', true);

      expect(url).toContain('.mp4');
      expect(url).toContain('us');
      expect(url).toContain('en');
    });

    it('should generate GIF URL when preferVideo is false', () => {
      const date = '2023-01-01';
      const url = imageServiceConfig.getMediaUrl(date, 'eu', 'de', false);

      expect(url).toContain('.gif');
      expect(url).toContain('eu');
      expect(url).toContain('de');
    });
  });

  describe('isVideoUrl', () => {
    it('should return true for video URLs', () => {
      expect(imageServiceConfig.isVideoUrl('https://example.com/video.mp4')).toBe(true);
      expect(imageServiceConfig.isVideoUrl('https://example.com/video.webm')).toBe(true);
      expect(imageServiceConfig.isVideoUrl('https://example.com/video.mov')).toBe(true);
    });

    it('should return false for non-video URLs', () => {
      expect(imageServiceConfig.isVideoUrl('https://example.com/image.jpg')).toBe(false);
      expect(imageServiceConfig.isVideoUrl('https://example.com/image.png')).toBe(false);
      expect(imageServiceConfig.isVideoUrl('')).toBe(false);
    });
  });

  describe('isAnimatedUrl', () => {
    it('should return true for animated URLs', () => {
      expect(imageServiceConfig.isAnimatedUrl('https://example.com/animation.gif')).toBe(true);
      expect(imageServiceConfig.isAnimatedUrl('https://example.com/video.mp4')).toBe(true);
      expect(imageServiceConfig.isAnimatedUrl('https://example.com/video.webm')).toBe(true);
    });

    it('should return false for static URLs', () => {
      expect(imageServiceConfig.isAnimatedUrl('https://example.com/image.jpg')).toBe(false);
      expect(imageServiceConfig.isAnimatedUrl('https://example.com/image.png')).toBe(false);
      expect(imageServiceConfig.isAnimatedUrl('')).toBe(false);
    });
  });

  describe('getTomorrowImageUrl', () => {
    it("should generate URL for tomorrow's image", () => {
      // Mock Date to return a fixed date
      const mockDate = new Date('2023-01-01T00:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);

      const url = imageServiceConfig.getTomorrowImageUrl('ap', 'ko');

      expect(url).toContain('2023-01-02');
      expect(url).toContain('ap');
      expect(url).toContain('ko');

      // Restore Date
      jest.restoreAllMocks();
    });
  });

  describe('Legacy methods', () => {
    it('should show deprecation warning for getS3ImageUrl', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const date = '2023-01-01';
      const url = imageServiceConfig.getS3ImageUrl(date);

      expect(consoleSpy).toHaveBeenCalledWith(
        'getS3ImageUrl is deprecated, use getImageUrl instead'
      );
      expect(url).toContain('2023-01-01');

      consoleSpy.mockRestore();
    });

    it('should show deprecation warning for getFirebaseImageUrl', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const date = '2023-01-01';
      const url = imageServiceConfig.getFirebaseImageUrl(date, 'us', 'en');

      expect(consoleSpy).toHaveBeenCalledWith(
        'getFirebaseImageUrl is deprecated, use getImageUrl instead'
      );
      expect(url).toContain('2023-01-01');
      expect(url).toContain('us');
      expect(url).toContain('en');

      consoleSpy.mockRestore();
    });
  });
});
