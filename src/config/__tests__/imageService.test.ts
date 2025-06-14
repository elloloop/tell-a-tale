import { imageServiceConfig } from '../imageService';

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
});
