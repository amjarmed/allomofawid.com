const DB_NAME = 'allomofawid'
const DB_VERSION = 2 // Increment version for new schema
const NOTIFICATION_STORE = 'pendingNotifications'
const REQUEST_STORE = 'offlineRequests'

interface PendingNotification {
  id: string
  userId: string
  title: string
  body: string
  data?: any
  createdAt: string
  attempts: number
}

interface OfflineRequest {
  id: string
  url: string
  method: string
  payload: any
  attempts: number
  timestamp: string
}

export class NotificationStore {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create store for pending notifications if it doesn't exist
        if (!db.objectStoreNames.contains(NOTIFICATION_STORE)) {
          const store = db.createObjectStore(NOTIFICATION_STORE, { keyPath: 'id' })
          store.createIndex('userId', 'userId', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('attempts', 'attempts', { unique: false })
        }

        // Create store for offline requests if it doesn't exist
        if (!db.objectStoreNames.contains(REQUEST_STORE)) {
          const store = db.createObjectStore(REQUEST_STORE, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('attempts', 'attempts', { unique: false })
        }
      }
    })
  }

  async addNotification(notification: Omit<PendingNotification, 'id' | 'attempts' | 'createdAt'>): Promise<string> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const id = crypto.randomUUID()
      const record: PendingNotification = {
        ...notification,
        id,
        attempts: 0,
        createdAt: new Date().toISOString(),
      }

      const request = store.add(record)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(id)
    })
  }

  async getNotification(id: string): Promise<PendingNotification | undefined> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async updateNotification(id: string, updates: Partial<PendingNotification>): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      // First get the existing notification
      const getRequest = store.get(id)

      getRequest.onerror = () => reject(getRequest.error)
      getRequest.onsuccess = () => {
        const notification = { ...getRequest.result, ...updates }
        const updateRequest = store.put(notification)

        updateRequest.onerror = () => reject(updateRequest.error)
        updateRequest.onsuccess = () => resolve()
      }
    })
  }

  async deleteNotification(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getPendingNotifications(userId: string): Promise<PendingNotification[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('userId')
      const request = index.getAll(userId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async getAllPendingNotifications(): Promise<PendingNotification[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }
}
