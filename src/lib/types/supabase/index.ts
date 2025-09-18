export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type BaseFields = {
  id: string
  created_at: string
}

export type OptionalBaseFields = {
  id?: string
  created_at?: string
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected'
export type Specialty = 'civil' | 'commercial' | 'family' | 'real_estate' | 'criminal' | 'administrative' | 'labor'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: BaseFields & {
          full_name: string
          email: string
          phone: string
          avatar_url: string | null
          updated_at: string
        }
        Insert: OptionalBaseFields & {
          full_name: string
          email: string
          phone: string
          avatar_url?: string | null
        }
        Update: OptionalBaseFields & {
          full_name?: string
          email?: string
          phone?: string
          avatar_url?: string | null
          updated_at?: string
        }
      }
      huissiers: {
        Row: BaseFields & {
          name: string
          email: string
          phone: string
          address: string
          city: string
          license_number: string
          bio: string | null
          avatar_url: string | null
          working_hours: Json | null
          is_verified: boolean
          avg_rating: number
          location: unknown
        }
        Insert: OptionalBaseFields & {
          name: string
          email: string
          phone: string
          address: string
          city: string
          license_number: string
          bio?: string | null
          avatar_url?: string | null
          working_hours?: Json | null
          is_verified?: boolean
          avg_rating?: number
          location?: unknown
        }
        Update: OptionalBaseFields & {
          name?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          license_number?: string
          bio?: string | null
          avatar_url?: string | null
          working_hours?: Json | null
          is_verified?: boolean
          avg_rating?: number
          location?: unknown
        }
      }
      specialties: {
        Row: BaseFields & {
          huissier_id: string
          specialty: Specialty
        }
        Insert: OptionalBaseFields & {
          huissier_id: string
          specialty: Specialty
        }
        Update: OptionalBaseFields & {
          huissier_id?: string
          specialty?: Specialty
        }
      }
      ratings: {
        Row: BaseFields & {
          huissier_id: string
          user_id: string
          rating: number
          comment: string | null
        }
        Insert: OptionalBaseFields & {
          huissier_id: string
          user_id: string
          rating: number
          comment?: string | null
        }
        Update: OptionalBaseFields & {
          huissier_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      find_nearest_huissiers: {
        Args: {
          lat: number
          lng: number
          limit?: number
          max_distance?: number
        }
        Returns: Array<{
          id: string
          name: string
          distance: number
          location: {
            lat: number
            lng: number
          }
        }>
      }
    }
    Enums: {
      verification_status: VerificationStatus
    }
  }
}
