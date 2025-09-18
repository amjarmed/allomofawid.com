import { z } from 'zod'

export const searchSchema = z.object({
  query: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  specialties: z.array(z.string()).optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional(),
  radius: z.number().min(1).max(50000).default(5000), // radius in meters
  verified: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
})

export const nearbyHuissiersSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radius: z.number().min(1).max(50000).default(5000)
})

export type SearchParams = z.infer<typeof searchSchema>
export type NearbyHuissiersParams = z.infer<typeof nearbyHuissiersSchema>
