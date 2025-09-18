import { z } from 'zod';

export const specialtyOptions = [
  'civil',
  'commercial',
  'family',
  'real_estate',
  'criminal',
  'administrative',
  'labor',
] as const

export const sortOptions = [
  'distance',
  'rating',
  'verification',
] as const

export const sortOrderOptions = [
  'asc',
  'desc',
] as const

export const huissierFilterSchema = z.object({
  specialties: z.array(z.enum(specialtyOptions)).default([]),
  verificationStatus: z.enum(['all', 'verified', 'unverified']).default('all'),
  sortBy: z.enum(sortOptions).default('distance'),
  sortOrder: z.enum(sortOrderOptions).default('desc'),
  cursor: z.string().nullable().optional(),
  perPage: z.number().min(1).max(50).default(10),
})

export type Specialty = (typeof specialtyOptions)[number]
export type SortOption = (typeof sortOptions)[number]
export type SortOrder = (typeof sortOrderOptions)[number]
export type VerificationStatus = 'all' | 'verified' | 'unverified'

export type HuissierFilters = z.infer<typeof huissierFilterSchema>

export type HuissierFilter = z.infer<typeof huissierFilterSchema>
