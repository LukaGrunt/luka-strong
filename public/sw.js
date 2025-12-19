const CACHE_NAME = 'luka-forge-v1'
const RUNTIME_CACHE = 'luka-forge-runtime-v1'

const STATIC_ASSETS = [
  '/',
  '/workout',
  '/history',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip Supabase API requests (always need fresh data)
  if (url.origin.includes('supabase')) {
    return
  }

  // Network first strategy for app routes
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone()

        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache)
        })

        return response
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }

          // If not in cache, return offline page or error
          return new Response('Offline - please check your connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          })
        })
      })
  )
})
