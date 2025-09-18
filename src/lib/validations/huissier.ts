import { z } from 'zod'

export const workingHoursSchema = z.object({
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  isOpen: z.boolean(),
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
})

export const huissierProfileSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  fullName: z.string().min(3).max(100),
  licenseNumber: z.string().min(3).max(50),
  phone: z.string().regex(/^\+212[0-9]{9}$/),
  email: z.string().email(),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(50),
  specialties: z.array(z.string()),
  workingHours: z.array(workingHoursSchema),
  serviceAreas: z.array(z.string()),
  about: z.string().max(500).optional(),
  isVerified: z.boolean().default(false),
  documents: z.array(z.object({
    type: z.enum(['license', 'id', 'other']),
    url: z.string().url(),
    verified: z.boolean().default(false)
  })).optional()
})
