import { Database } from './supabase'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

// User related types
export type UserRole = 'user' | 'huissier' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: UserRole
  created_at: string
  updated_at: string
}

// Document verification types
export type DocumentType = 'license' | 'id' | 'other'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'

export interface Document {
  id: string
  user_id: string
  type: DocumentType
  url: string
  verified: boolean
  verification_status: VerificationStatus
  verified_at?: string
  created_at: string
  updated_at: string
  user?: User
}

// Request Types
export type RequestStatus =
  | 'pending'
  | 'accepted'
  | 'inProgress'
  | 'completed'
  | 'cancelled'
  | 'rejected'

interface Location {
  address: string
  city: string
  coordinates?: {
    lat: number
    lng: number
  }
}

interface Huissier {
  id: string
  fullName: string
  avatarUrl?: string
  phone?: string
  city: string
}

interface StatusHistoryItem {
  status: RequestStatus
  timestamp: string
  comment?: string
  updatedBy: {
    id: string
    name: string
    avatarUrl?: string
  }
}

export interface RequestWithDetails {
  id: string
  userId: string
  huissierId?: string
  huissier?: Huissier
  title: string
  description: string
  location: Location
  status: RequestStatus
  urgency: 'normal' | 'urgent'
  preferredDate?: string
  documents?: {
    id: string
    name: string
    url: string
  }[]
  statusHistory?: StatusHistoryItem[]
  createdAt: string
  updatedAt: string
}
