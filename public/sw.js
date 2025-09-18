/// <reference lib="webworker" />
import { ServiceWorkerUtils } from '../src/lib/stores/service-worker-utils'

const CACHE_NAME = 'allomofawid-v1'
const swUtils = new ServiceWorkerUtils()

// Initialize utils
swUtils.init().catch(console.error)

// Listen for push events
self.addEventListener('push', function(event) {
  if (!event.data) return

  try {
    const payload = event.data.json()
    
    const options = {
      ...payload,
      badge: '/icons/badge-96x96.png',
      icon: payload.icon || '/icons/icon-192x192.png',
      data: {
        ...payload.data,
        url: payload.data?.url || '/'
      },
      // Add renotify option for important updates
      renotify: payload.data?.important === true,
      // Add tag to group similar notifications
      tag: payload.data?.tag || 'default'
    }

    event.waitUntil(
      swUtils.showNotification(payload.title, options)
    )
  } catch (err) {
    console.error('Error showing notification:', err)
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  // Get the URL from notification data
  const url = event.notification.data?.url || '/'

  // Open the URL in the app
  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })

      // If we have an open window, focus it and navigate
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          await client.focus()
          return
        }
      }

      // Otherwise open a new window
      await self.clients.openWindow(url)
    })()
  )
})

// Handle background sync for notifications and failed requests
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(swUtils.syncNotifications())
  } else if (event.tag === 'sync-failed-requests') {
    event.waitUntil(swUtils.syncFailedRequests())
  }
})

// Handle offline support
self.addEventListener('fetch', function(event) {
  event.respondWith(
    (async () => {
      try {
        // Try the network first
        const response = await fetch(event.request)
        
        // Only cache successful GET requests
        if (response.ok && event.request.method === 'GET') {
          const cache = await caches.open(CACHE_NAME)
          await cache.put(event.request, response.clone())
        }
        
        return response
      } catch (err) {
        // If offline, try the cache
        const cached = await caches.match(event.request)
        if (cached) return cached

        // If not in cache and it's a GET request
        if (event.request.method === 'GET') {
          // For navigation requests, return offline page
          if (event.request.mode === 'navigate') {
            const offlinePage = await caches.match('/offline')
            if (offlinePage) return offlinePage
          }

          // For API requests that modify data
          if (event.request.url.includes('/api/')) {
            try {
              const clonedRequest = event.request.clone()
              const payload = await clonedRequest.json()
              
              // Queue failed request for retry
              await swUtils.queueFailedRequest(event.request, payload)

              // Register for background sync
              await self.registration.sync.register('sync-failed-requests')
              
              return new Response(JSON.stringify({ 
                error: 'offline',
                message: 'Request queued for sync when online',
                success: false
              }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              })
            } catch (e) {
              console.error('Error queueing offline request:', e)
            }
          }
        }

        throw err
      }
    })()
  )
})

// Clean up old caches and take control
self.addEventListener('activate', function(event) {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const keys = await caches.keys()
      await Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )

      // Take control of all clients immediately
      await self.clients.claim()
    })()
  )
})