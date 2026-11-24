/**
 * ToggleDawn Command Center — Service Worker v3.0.0
 * ==================================================
 * Offline-first PWA service worker.
 *
 * Strategies:
 *   1. Static assets  → Cache-first (stale-while-revalidate)
 *   2. HTML pages     → Network-first with cached offline shell fallback
 *   3. API reads (GET /api/*) → Network-first; on fail serve from API-cache
 *   4. API writes (POST/PATCH/DELETE) → Pass-through (IndexedDB handles offline writes client-side)
 *   5. Auth routes    → Always network, never cached
 *
 * Offline write buffering is handled ENTIRELY in the browser via IndexedDB
 * (src/lib/offlineDB.ts + useOfflineStore.ts). The SW does NOT intercept
 * write requests — that logic lives in client-side code so the app can
 * manage retry/sync directly.
 */

const CACHE_VERSION = 'v3'
const STATIC_CACHE = `toggledawn-static-${CACHE_VERSION}`
const API_CACHE = `toggledawn-api-${CACHE_VERSION}`
const PAGES_CACHE = `toggledawn-pages-${CACHE_VERSION}`

// Assets pre-cached at install time
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
  '/icons/apple-touch-icon.png',
  // Offline-navigable app routes
  '/projects',
  '/missions',
  '/flash-cards',
  '/books',
  '/search',
  '/drafts',
  '/sync',
]

// API endpoints whose GET responses we cache for offline reading
const CACHEABLE_API_PREFIXES = [
  '/api/projects',
  '/api/missions',
  '/api/mission-types',
  '/api/mission-planners',
  '/api/books',
  '/api/chapters',
  '/api/notes',
  '/api/flash-cards',
  '/api/time-logs',
  '/api/test-scores',
  '/api/habits',
  '/api/schedules',
  '/api/categories',
]

// Routes that must NEVER be cached
const NEVER_CACHE = [
  '/super-master',
  '/api/users',
  '/api/users/login',
  '/api/users/logout',
  '/api/users/me',
  '/api/redis',
  '/api/payload-jobs',
]

// ─────────────────────────────────────────────────────────────────────────────
// 1. INSTALL
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache partial fail:', err)
      })
    )
  )
  self.skipWaiting()
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. ACTIVATE — clean old caches
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const keepCaches = new Set([STATIC_CACHE, API_CACHE, PAGES_CACHE])
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => !keepCaches.has(k)).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. FETCH — intercept all requests
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-http schemes
  if (!url.protocol.startsWith('http')) return

  // Skip never-cached routes — always go to network
  if (NEVER_CACHE.some((path) => url.pathname.startsWith(path))) return

  // Skip Payload admin
  if (url.pathname.startsWith('/super-master')) return

  // ── API GET requests → Network-first, API-cache fallback ──────────────────
  if (
    request.method === 'GET' &&
    CACHEABLE_API_PREFIXES.some((p) => url.pathname.startsWith(p))
  ) {
    event.respondWith(networkFirstWithApiCache(request))
    return
  }

  // ── API WRITE requests → Pass through (IndexedDB handles offline) ─────────
  if (url.pathname.startsWith('/api/') && request.method !== 'GET') {
    // Don't intercept — let it go to network; if it fails, client code queues it
    return
  }

  // ── HTML Navigation → Network-first, page-cache fallback ─────────────────
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request, url))
    return
  }

  // ── Static Assets → Cache-first (stale-while-revalidate) ─────────────────
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStatic(request))
    return
  }

  // ── Default → Network with cache fallback ─────────────────────────────────
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// Strategy implementations
// ─────────────────────────────────────────────────────────────────────────────

async function networkFirstWithApiCache(request) {
  try {
    const networkRes = await fetch(request.clone())
    if (networkRes && networkRes.status === 200) {
      const cache = await caches.open(API_CACHE)
      // Cache with 10-minute max-age
      const resClone = networkRes.clone()
      const headers = new Headers(resClone.headers)
      headers.set('sw-cached-at', Date.now().toString())
      const cachedRes = new Response(await resClone.blob(), {
        status: resClone.status,
        statusText: resClone.statusText,
        headers,
      })
      await cache.put(request, cachedRes)
    }
    return networkRes
  } catch {
    // Offline — serve from API cache
    const cached = await caches.match(request, { cacheName: API_CACHE })
    if (cached) {
      // Add header so client knows this is stale data
      const headers = new Headers(cached.headers)
      headers.set('x-offline-cache', 'true')
      return new Response(await cached.blob(), {
        status: cached.status,
        headers,
      })
    }
    // No cache — return empty collection response so app still renders
    return new Response(JSON.stringify({ docs: [], totalDocs: 0, offline: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'x-offline-cache': 'true' },
    })
  }
}

async function networkFirstPage(request, url) {
  try {
    const networkRes = await fetch(request, { cache: 'no-cache' })
    if (networkRes && networkRes.status === 200 && !url.pathname.includes('offline')) {
      const cache = await caches.open(PAGES_CACHE)
      await cache.put(request, networkRes.clone())
    }
    return networkRes
  } catch {
    // Try page cache
    const cached = await caches.match(request, { cacheName: PAGES_CACHE })
    if (cached) return cached

    // Try static cache (pre-cached shell)
    const staticCached = await caches.match(request, { cacheName: STATIC_CACHE })
    if (staticCached) return staticCached

    // Fall back to offline shell page
    const offlinePage = await caches.match('/offline.html', { cacheName: STATIC_CACHE })
    return offlinePage || new Response('Offline', { status: 503 })
  }
}

async function cacheFirstStatic(request) {
  const cached = await caches.match(request, { cacheName: STATIC_CACHE })
  if (cached) {
    // Revalidate in background
    fetch(request).then((res) => {
      if (res && res.status === 200) {
        caches.open(STATIC_CACHE).then((c) => c.put(request, res))
      }
    }).catch(() => {})
    return cached
  }
  const networkRes = await fetch(request)
  if (networkRes && networkRes.status === 200) {
    const cache = await caches.open(STATIC_CACHE)
    await cache.put(request, networkRes.clone())
  }
  return networkRes
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MESSAGES from main thread
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (!event.data) return

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
    )
  }

  // Triggered after a successful sync to refresh the API cache
  if (event.data.type === 'INVALIDATE_API_CACHE') {
    event.waitUntil(caches.delete(API_CACHE))
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. BACKGROUND SYNC (for browsers that support it)
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'td-sync-pending') {
    // Signal to all open clients to trigger a sync
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'BACKGROUND_SYNC_TRIGGERED' })
        })
      })
    )
  }
})
