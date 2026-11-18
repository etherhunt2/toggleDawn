/**
 * ToggleDawn Command Center - Progressive Web App Service Worker
 * Version: v1.0.0
 */

const CACHE_NAME = 'toggledawn-cache-v2';

// Essential assets pre-cached upon service worker installation
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png'
];

// 1. Service Worker Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ToggleDawn PWA SW] Pre-caching offline shells and assets...');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ToggleDawn PWA SW] Pre-cache partial fail (some assets may not be available yet):', err);
      });
    })
  );
  // Force activate immediately without waiting for existing tabs to close
  self.skipWaiting();
});

// 2. Service Worker Activation & Cache Cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[ToggleDawn PWA SW] Removing outdated cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[ToggleDawn PWA SW] Claiming clients...');
      return self.clients.claim();
    })
  );
});

// 3. Fetch Interception
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-http / non-https schemes (e.g. chrome-extension://)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // CRITICAL: NEVER cache or intercept Payload CMS Admin, GraphQL, or Auth/API routes
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/super-master') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/next-api') ||
    url.searchParams.has('draft') ||
    request.headers.get('accept')?.includes('application/json')
  ) {
    return;
  }

  // Strategy A: HTML Page Navigation (Network-First with Offline Fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then((networkResponse) => {
          // If valid response, clone into cache for future offline visits (never cache offline.html as page shell)
          if (networkResponse && networkResponse.status === 200 && !url.pathname.includes('offline')) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Network failed: attempt to match cached version of this page (if not offline.html itself)
          if (!url.pathname.includes('offline')) {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
              return cachedResponse;
            }
          }
          // Fall back to offline page
          const offlineFallback = await caches.match('/offline.html');
          return offlineFallback || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // Strategy B: Static Assets & Next.js Bundles (Stale-While-Revalidate)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Network fetch failed, nothing to update
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: Network with Cache Fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// 4. Update / Skip-Waiting Message Channel
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
    );
  }
});

