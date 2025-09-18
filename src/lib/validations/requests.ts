import { z } from 'zod';

export const createRequestSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  urgency: z.enum(['normal', 'urgent']).default('normal'),
  huissier_id: z.string().uuid('Invalid huissier ID'),
  documents: z.array(z.string().url('Invalid document URL')).optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional()
})

export const updateRequestSchema = createRequestSchema.partial().extend({
  status: z.enum(['pending', 'accepted', 'completed', 'cancelled']).optional()
})

export const requestIdSchema = z.object({
  id: z.string().uuid('Invalid request ID')
})

export type CreateRequestInput = z.infer<typeof createRequestSchema>
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>
