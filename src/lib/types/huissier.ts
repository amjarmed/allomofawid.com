import { type Specialty } from '@/lib/validations/filters'

export interface Huissier {
  id: string
  name: string
  specialty: Specialty[]
  verified: boolean
  rating: number
  distance?: number
  location: {
    city: string
    coordinates: [number, number]
  }
}

export interface HuissierWithPagination {
  items: Huissier[]
  nextCursor?: string
  prevCursor?: string
}
