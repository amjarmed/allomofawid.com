import { z } from 'zod'

export const huissierProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^(\+212|0)[567]\d{8}$/, 'Invalid Moroccan phone number'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  working_hours: z.record(z.string(), z.array(z.string())), // e.g., { "monday": ["09:00-12:00", "14:00-18:00"] }
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  })
})

export const updateHuissierSchema = huissierProfileSchema.partial().extend({
  active: z.boolean().optional(),
  verified: z.boolean().optional()
})

export const huissierIdSchema = z.object({
  id: z.string().uuid('Invalid huissier ID')
})

export type HuissierProfileInput = z.infer<typeof huissierProfileSchema>
export type UpdateHuissierInput = z.infer<typeof updateHuissierSchema>
