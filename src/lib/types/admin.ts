import { Database } from './supabase'

export type Region = Database['public']['Tables']['regions']['Row']
export type City = Database['public']['Tables']['cities']['Row']
export type Specialty = Database['public']['Tables']['specialties']['Row']
export type HuissierSpecialty = Database['public']['Tables']['huissier_specialties']['Row']
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row']

export interface CityWithDistance extends City {
  distance_meters?: number
}

export interface RegionWithCities extends Region {
  cities?: City[]
}

export interface SpecialtyWithHuissiers extends Specialty {
  huissiers?: Array<{
    huissier: Database['public']['Tables']['profiles']['Row']
    verified: boolean
    verified_at: string | null
  }>
}

export interface ActivityLogWithActor extends ActivityLog {
  actor: Database['public']['Tables']['profiles']['Row']
}
