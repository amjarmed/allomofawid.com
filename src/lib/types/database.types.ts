export type Database = {
  public: {
    Tables: {
      requests: {
        Row: {
          id: string
          userId: string
          huissierId: string | null
          type: string
          priority: string
          status: string
          title: string
          description: string
          location: {
            address: string
            city: string
            coordinates?: {
              latitude: number
              longitude: number
            }
          }
          attachments?: {
            name: string
            url: string
            type: string
          }[]
          preferredDate?: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          userId: string
          huissierId?: string | null
          type: string
          priority: string
          status?: string
          title: string
          description: string
          location: {
            address: string
            city: string
            coordinates?: {
              latitude: number
              longitude: number
            }
          }
          attachments?: {
            name: string
            url: string
            type: string
          }[]
          preferredDate?: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          huissierId?: string | null
          type?: string
          priority?: string
          status?: string
          title?: string
          description?: string
          location?: {
            address: string
            city: string
            coordinates?: {
              latitude: number
              longitude: number
            }
          }
          attachments?: {
            name: string
            url: string
            type: string
          }[]
          preferredDate?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      request_status_history: {
        Row: {
          id: string
          requestId: string
          status: string
          note?: string
          attachments?: {
            name: string
            url: string
            type: string
          }[]
          createdAt: string
          createdBy: string
        }
        Insert: {
          id?: string
          requestId: string
          status: string
          note?: string
          attachments?: {
            name: string
            url: string
            type: string
          }[]
          createdAt?: string
          createdBy: string
        }
        Update: {
          id?: string
          requestId?: string
          status?: string
          note?: string
          attachments?: {
            name: string
            url: string
            type: string
          }[]
          createdAt?: string
          createdBy?: string
        }
      }
    }
    Functions: {
      update_request_status: {
        Args: {
          p_request_id: string
          p_status: string
          p_note?: string
          p_attachments?: {
            name: string
            url: string
            type: string
          }[]
          p_user_id: string
        }
        Returns: {
          id: string
          status: string
          updated_at: string
          status_history: Array<{
            id: string
            status: string
            note?: string
            attachments?: {
              name: string
              url: string
              type: string
            }[]
            created_at: string
            created_by: string
          }>
        }
      }
    }
  }
}
