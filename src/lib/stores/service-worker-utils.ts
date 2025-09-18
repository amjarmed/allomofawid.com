import { NotificationStore } from './notification-store'

interface ServiceWorkerRegistrationLike {
  showNotification(title: string, options: NotificationOptions): Promise<void>
}

/**
 * Utility class for managing service worker operations
 * Can be used in both service worker and window contexts
 */
export class ServiceWorkerUtils {
  private store: NotificationStore
  private registration: ServiceWorkerRegistrationLike | null = null

  constructor() {
    this.store = new NotificationStore()
  }

  /**
   * Initialize with registration from either window.navigator or service worker context
   */
  async init(): Promise<void> {
    if ('serviceWorker' in navigator) {
      // Window context
      this.registration = await navigator.serviceWorker.ready
    } else if ('registration' in self) {
      // Service worker context
      this.registration = (self as unknown as { registration: ServiceWorkerRegistrationLike }).registration
    }
  }

  async syncFailedRequests(): Promise<void> {
    try {
      const pendingRequests = await this.store.getAllPendingNotifications()

      for (const request of pendingRequests) {
        try {
          // Attempt to replay the request
          const response = await fetch(request.data.url, {
            method: request.data.method,
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(request.data.payload)
          })

          if (response.ok) {
            // If successful, remove from store
            await this.store.deleteNotification(request.id)
          } else {
            // If failed, increment attempt counter
            const attempts = (request.attempts || 0) + 1
            if (attempts >= 5) {
              // Give up after 5 attempts
              await this.store.deleteNotification(request.id)
            } else {
              await this.store.updateNotification(request.id, { attempts })
            }
          }
        } catch (error) {
          console.error('Error replaying request:', error)
        }
      }
    } catch (error) {
      console.error('Error syncing failed requests:', error)
    }
  }

  async queueFailedRequest(request: Request, payload: any): Promise<void> {
    try {
      await this.store.addNotification({
        userId: 'system', // Will be updated with actual user ID
        title: 'Failed Request',
        body: `${request.method} ${request.url}`,
        data: {
          url: request.url,
          method: request.method,
          payload: payload
        }
      })
    } catch (error) {
      console.error('Error queueing failed request:', error)
    }
  }

  async showNotification(title: string, options: NotificationOptions): Promise<void> {
    try {
      if (!this.registration) {
        await this.init()
      }

      if (!navigator.onLine) {
        // Store for later if offline
        await this.store.addNotification({
          userId: options.data?.userId || 'system',
          title,
          body: options.body || '',
          data: options.data
        })
        return
      }

      if (this.registration) {
        await this.registration.showNotification(title, options)
      }
    } catch (error) {
      console.error('Error showing notification:', error)
    }
  }

  async syncNotifications(): Promise<void> {
    try {
      if (!this.registration) {
        await this.init()
      }

      const pendingNotifications = await this.store.getAllPendingNotifications()

      for (const notification of pendingNotifications) {
        try {
          if (this.registration) {
            await this.registration.showNotification(notification.title, {
              body: notification.body,
              data: notification.data,
              badge: '/icons/badge-96x96.png',
              icon: '/icons/icon-192x192.png'
            })
          }

          await this.store.deleteNotification(notification.id)
        } catch (error) {
          const attempts = (notification.attempts || 0) + 1
          if (attempts >= 5) {
            await this.store.deleteNotification(notification.id)
          } else {
            await this.store.updateNotification(notification.id, { attempts })
          }
        }
      }
    } catch (error) {
      console.error('Error syncing notifications:', error)
    }
  }
}
