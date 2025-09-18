export interface NotificationCategory {
  key: 'request_status' | 'request_messages' | 'request_documents' | 'system_updates'
  enabled: boolean
}

export interface QuietHours {
  enabled: boolean
  start: string
  end: string
  timezone: string
}

export interface NotificationPreferences {
  id: string
  userId: string
  categories: Record<NotificationCategory['key'], boolean>
  soundsEnabled: boolean
  desktopEnabled: boolean
  emailEnabled: boolean
  quietHours: QuietHours
  createdAt: string
  updatedAt: string
}
