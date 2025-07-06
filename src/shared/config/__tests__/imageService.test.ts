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
});
