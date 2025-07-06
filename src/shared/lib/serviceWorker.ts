// Service Worker registration and management utilities

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

// Register the service worker
export async function registerServiceWorker(config: ServiceWorkerConfig = {}) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            config.onUpdate?.(registration);
          }
        });
      }
    });

    if (registration.active) {
      config.onSuccess?.(registration);
    }

    console.log('Service Worker registered successfully');
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    config.onError?.(error as Error);
  }
}

// Unregister the service worker
export async function unregisterServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('Service Worker unregistered successfully');
    }
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
  }
}

// Send a message to the service worker
export function sendMessageToServiceWorker(message: { type: string; [key: string]: unknown }) {
  if (typeof window === 'undefined' || !navigator.serviceWorker.controller) {
    return;
  }

  navigator.serviceWorker.controller.postMessage(message);
}

// Cache today's image proactively
export function cacheTodayImage(imageUrl: string) {
  sendMessageToServiceWorker({
    type: 'CACHE_TODAY_IMAGE',
    imageUrl,
  });
}

// Check if the app is running offline
export function isOffline(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return !navigator.onLine;
}

// Listen for online/offline events
export function addNetworkListeners(
  onOnline?: () => void,
  onOffline?: () => void
) {
  if (typeof window === 'undefined') {
    return () => {}; // Return empty cleanup function
  }

  const handleOnline = () => {
    console.log('App is online');
    onOnline?.();
  };

  const handleOffline = () => {
    console.log('App is offline');
    onOffline?.();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Get cache status information
export async function getCacheStatus() {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return {
      isSupported: false,
      totalSize: 0,
      imageCount: 0,
    };
  }

  try {
    const cacheNames = await caches.keys();
    const imageCacheName = 'tell-a-tale-images-v1';
    
    let totalSize = 0;
    let imageCount = 0;

    if (cacheNames.includes(imageCacheName)) {
      const cache = await caches.open(imageCacheName);
      const requests = await cache.keys();
      imageCount = requests.length;
      
      // Estimate cache size (rough approximation)
      totalSize = imageCount * 100; // Assume ~100KB per image
    }

    return {
      isSupported: true,
      totalSize,
      imageCount,
      cacheNames,
    };
  } catch (error) {
    console.error('Failed to get cache status:', error);
    return {
      isSupported: false,
      totalSize: 0,
      imageCount: 0,
      error: error as Error,
    };
  }
}

// Clear all caches
export async function clearAllCaches() {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('All caches cleared');
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
}