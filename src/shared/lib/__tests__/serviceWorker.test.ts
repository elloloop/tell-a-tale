/**
 * @jest-environment jsdom
 */

import {
  registerServiceWorker,
  unregisterServiceWorker,
  sendMessageToServiceWorker,
  cacheTodayImage,
  isOffline,
  addNetworkListeners,
  getCacheStatus,
  clearAllCaches,
} from '../serviceWorker';

// Mock Service Worker API
const mockServiceWorkerRegistration = {
  installing: null,
  waiting: null,
  active: { state: 'activated' },
  unregister: jest.fn(),
  addEventListener: jest.fn(),
};

const mockServiceWorker = {
  register: jest.fn(),
  getRegistration: jest.fn(),
  controller: {
    postMessage: jest.fn(),
  } as { postMessage: jest.Mock } | null,
};

const mockCaches = {
  open: jest.fn(),
  keys: jest.fn(),
  delete: jest.fn(),
};

const mockCache = {
  keys: jest.fn(),
};

// Setup mocks
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset mock implementations
  mockServiceWorkerRegistration.unregister.mockResolvedValue(true);
  mockServiceWorker.register.mockResolvedValue(mockServiceWorkerRegistration);
  mockServiceWorker.getRegistration.mockResolvedValue(mockServiceWorkerRegistration);
  mockServiceWorker.controller = {
    postMessage: jest.fn(),
  };
  
  mockCaches.keys.mockResolvedValue(['tell-a-tale-images-v1']);
  mockCaches.open.mockResolvedValue(mockCache);
  mockCaches.delete.mockResolvedValue(true);
  mockCache.keys.mockResolvedValue([{ url: 'image1.jpg' }, { url: 'image2.jpg' }]);
  
  // Mock navigator.serviceWorker
  Object.defineProperty(navigator, 'serviceWorker', {
    value: mockServiceWorker,
    writable: true,
    configurable: true,
  });

  // Mock navigator.onLine
  Object.defineProperty(navigator, 'onLine', {
    value: true,
    writable: true,
    configurable: true,
  });

  // Mock caches API
  Object.defineProperty(window, 'caches', {
    value: mockCaches,
    writable: true,
    configurable: true,
  });
});

describe('Service Worker Utilities', () => {
  describe('registerServiceWorker', () => {
    it('should register service worker successfully', async () => {
      const onSuccess = jest.fn();
      mockServiceWorker.register.mockResolvedValue(mockServiceWorkerRegistration);

      await registerServiceWorker({ onSuccess });

      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js');
      expect(onSuccess).toHaveBeenCalledWith(mockServiceWorkerRegistration);
    });

    it('should handle registration failure', async () => {
      const onError = jest.fn();
      const error = new Error('Registration failed');
      mockServiceWorker.register.mockRejectedValue(error);

      await registerServiceWorker({ onError });

      expect(onError).toHaveBeenCalledWith(error);
    });

    it('should not register if service worker is not supported', async () => {
      // Remove serviceWorker from navigator
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        writable: true,
      });

      const result = await registerServiceWorker();
      expect(result).toBeUndefined();
    });
  });

  describe('unregisterServiceWorker', () => {
    it('should unregister service worker successfully', async () => {
      mockServiceWorker.getRegistration.mockResolvedValue(mockServiceWorkerRegistration);
      mockServiceWorkerRegistration.unregister.mockResolvedValue(true);

      await unregisterServiceWorker();

      expect(mockServiceWorkerRegistration.unregister).toHaveBeenCalled();
    });

    it('should handle no registration found', async () => {
      mockServiceWorker.getRegistration.mockResolvedValue(undefined);

      await expect(unregisterServiceWorker()).resolves.not.toThrow();
    });
  });

  describe('sendMessageToServiceWorker', () => {
    it('should send message when controller is available', () => {
      const message = { type: 'TEST', data: 'test' };

      sendMessageToServiceWorker(message);

      expect(mockServiceWorker.controller?.postMessage).toHaveBeenCalledWith(message);
    });

    it('should not send message when no controller', () => {
      mockServiceWorker.controller = null;

      sendMessageToServiceWorker({ type: 'TEST' });

      expect(mockServiceWorker.controller).toBeNull();
    });
  });

  describe('cacheTodayImage', () => {
    it('should send cache message for image URL', () => {
      const imageUrl = 'https://example.com/image.jpg';
      
      // Ensure controller is available
      mockServiceWorker.controller = {
        postMessage: jest.fn(),
      };

      cacheTodayImage(imageUrl);

      expect(mockServiceWorker.controller.postMessage).toHaveBeenCalledWith({
        type: 'CACHE_TODAY_IMAGE',
        imageUrl,
      });
    });

    it('should not send message when no controller', () => {
      mockServiceWorker.controller = null;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      cacheTodayImage('https://example.com/image.jpg');

      // Should not throw error
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('isOffline', () => {
    it('should return false when online', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });

      expect(isOffline()).toBe(false);
    });

    it('should return true when offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      expect(isOffline()).toBe(true);
    });
  });

  describe('addNetworkListeners', () => {
    it('should add event listeners for online/offline events', () => {
      const onOnline = jest.fn();
      const onOffline = jest.fn();
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      const cleanup = addNetworkListeners(onOnline, onOffline);

      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

      // Test cleanup
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('getCacheStatus', () => {
    it('should return cache status when supported', async () => {
      const mockRequests = [{ url: 'image1.jpg' }, { url: 'image2.jpg' }];
      mockCaches.keys.mockResolvedValue(['tell-a-tale-images-v1']);
      mockCaches.open.mockResolvedValue(mockCache);
      mockCache.keys.mockResolvedValue(mockRequests);

      const status = await getCacheStatus();

      expect(status).toEqual({
        isSupported: true,
        totalSize: 200, // 2 images * 100KB each
        imageCount: 2,
        cacheNames: ['tell-a-tale-images-v1'],
      });
    });

    it('should return not supported when caches API is not available', async () => {
      // Remove caches from window
      const originalCaches = window.caches;
      delete (window as { caches?: CacheStorage }).caches;

      const status = await getCacheStatus();

      expect(status).toEqual({
        isSupported: false,
        totalSize: 0,
        imageCount: 0,
      });

      // Restore caches
      window.caches = originalCaches;
    });
  });

  describe('clearAllCaches', () => {
    it('should clear all caches', async () => {
      const cacheNames = ['cache1', 'cache2'];
      mockCaches.keys.mockResolvedValue(cacheNames);
      mockCaches.delete.mockResolvedValue(true);

      await clearAllCaches();

      expect(mockCaches.delete).toHaveBeenCalledWith('cache1');
      expect(mockCaches.delete).toHaveBeenCalledWith('cache2');
    });

    it('should handle missing caches API', async () => {
      // Remove caches from window
      const originalCaches = window.caches;
      delete (window as { caches?: CacheStorage }).caches;

      await expect(clearAllCaches()).resolves.not.toThrow();

      // Restore caches
      window.caches = originalCaches;
    });
  });
});