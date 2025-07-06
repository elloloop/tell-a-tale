// Service Worker for Tell A Tale
// Handles offline caching for prompt images and shell assets

const CACHE_NAME = 'tell-a-tale-v1';
const STATIC_CACHE_NAME = 'tell-a-tale-static-v1';

// Static assets to cache (shell assets)
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/_next/static/css/',  // Will be matched with startsWith
  '/_next/static/chunks/', // Will be matched with startsWith
];

// Image cache configuration
const IMAGE_CACHE_NAME = 'tell-a-tale-images-v1';
const MAX_IMAGE_CACHE_SIZE = 50; // Maximum number of images to cache
const MAX_IMAGE_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(['/']); // Cache at least the root
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== IMAGE_CACHE_NAME
            ) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isStaticAssetRequest(request)) {
    event.respondWith(handleStaticAssetRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  }
});

// Check if request is for an image
function isImageRequest(request) {
  const url = new URL(request.url);
  // Check for image file extensions or image service domains
  return (
    request.destination === 'image' ||
    /\.(jpg|jpeg|png|gif|webp|svg|mp4)$/i.test(url.pathname) ||
    url.hostname.includes('picsum') ||
    url.hostname.includes('amazonaws.com')
  );
}

// Check if request is for a static asset
function isStaticAssetRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.includes('.css') ||
    url.pathname.includes('.js') ||
    url.pathname === '/manifest.json'
  );
}

// Check if request is a navigation request
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Handle image requests with caching
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  
  try {
    // Try to get from cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving cached image:', request.url);
      return cachedResponse;
    }
    
    // Fetch from network
    console.log('[SW] Fetching image from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the image
      await cache.put(request, networkResponse.clone());
      
      // Clean up old images to maintain cache size
      await cleanupImageCache();
      
      return networkResponse;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
  } catch (error) {
    console.log('[SW] Image request failed:', error);
    
    // Return a placeholder or cached fallback
    return new Response(
      '<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="800" height="400" fill="#f3f4f6"/>' +
      '<text x="400" y="200" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="24">' +
      'Image not available offline' +
      '</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' },
        status: 200
      }
    );
  }
}

// Handle static asset requests
async function handleStaticAssetRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  try {
    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving cached static asset:', request.url);
      return cachedResponse;
    }
    
    // Fetch from network and cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Static asset request failed:', error);
    
    // Try to serve from cache anyway
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful navigation responses
      const cache = await caches.open(STATIC_CACHE_NAME);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error(`Navigation response not ok: ${networkResponse.status}`);
  } catch (error) {
    console.log('[SW] Navigation request failed, serving cached version:', error);
    
    // Fallback to cached version
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match('/');
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Last resort: offline page
    return new Response(
      '<!DOCTYPE html><html><head><title>Offline</title></head>' +
      '<body><h1>You are offline</h1><p>Please check your connection.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Clean up old images from cache
async function cleanupImageCache() {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const requests = await cache.keys();
  
  if (requests.length > MAX_IMAGE_CACHE_SIZE) {
    // Remove oldest entries
    const entriesToRemove = requests.slice(0, requests.length - MAX_IMAGE_CACHE_SIZE);
    await Promise.all(entriesToRemove.map(request => cache.delete(request)));
    console.log(`[SW] Cleaned up ${entriesToRemove.length} old images from cache`);
  }
}

// Handle message events from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_TODAY_IMAGE') {
    console.log('[SW] Received request to cache today\'s image');
    
    // Cache today's image proactively
    const imageUrl = event.data.imageUrl;
    if (imageUrl) {
      caches.open(IMAGE_CACHE_NAME).then(cache => {
        return fetch(imageUrl).then(response => {
          if (response.ok) {
            return cache.put(imageUrl, response);
          }
        });
      }).catch(error => {
        console.log('[SW] Failed to cache today\'s image:', error);
      });
    }
  }
});