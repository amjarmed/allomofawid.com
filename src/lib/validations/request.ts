import { z } from 'zod';

/**
 * Request priority levels
 */
export const RequestPriorityEnum = z.enum(['URGENT', 'HIGH', 'NORMAL', 'LOW'])
export type RequestPriority = z.infer<typeof RequestPriorityEnum>

/**
 * Request status types
 */
export const RequestStatusEnum = z.enum([
  'PENDING',    // Initial state
  'ACCEPTED',   // Huissier accepted the request
  'REJECTED',   // Huissier rejected the request
  'IN_PROGRESS',// Work in progress
  'COMPLETED',  // Request completed
  'CANCELLED'   // Request cancelled by user or system
])
export type RequestStatus = z.infer<typeof RequestStatusEnum>

/**
 * Request types based on service categories
 */
export const RequestTypeEnum = z.enum([
  'NOTIFICATION',        // Legal notification delivery
  'ENFORCEMENT',        // Enforcement of court decisions
  'INSPECTION',         // Site inspection and reporting
  'CONSULTATION',       // Legal consultation
  'DOCUMENT_SERVICE',   // Document service/delivery
  'OTHER'              // Other services
])
export type RequestType = z.infer<typeof RequestTypeEnum>

/**
 * Base schema for creating a new request
 */
export const createRequestSchema = z.object({
  type: RequestTypeEnum,
  priority: RequestPriorityEnum,
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  location: z.object({
    address: z.string().min(5).max(500),
    city: z.string().min(2).max(100),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
    }).optional(),
  }),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
  })).optional(),
  preferredDate: z.date().optional(),
  huissierId: z.string().uuid().optional(), // Optional if user wants a specific huissier
})

export type CreateRequestInput = z.infer<typeof createRequestSchema>

/**
 * Schema for updating request status
 */
export const updateRequestStatusSchema = z.object({
  requestId: z.string().uuid(),
  status: RequestStatusEnum,
  note: z.string().max(500).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
  })).optional(),
})

export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>

/**
 * Schema for request notifications
 */
export const requestNotificationSchema = z.object({
  requestId: z.string().uuid(),
  type: z.enum([
    'STATUS_CHANGE',
    'NEW_MESSAGE',
    'DOCUMENT_ADDED',
    'REMINDER',
    'URGENT_UPDATE'
  ]),
  title: z.string().max(200),
  message: z.string().max(1000),
  metadata: z.record(z.string(), z.any()).optional(),
  recipientId: z.string().uuid(),
})

export type RequestNotification = z.infer<typeof requestNotificationSchema>

/**
 * Schema for request status history
 */
export const requestStatusHistorySchema = z.object({
  id: z.string().uuid(),
  requestId: z.string().uuid(),
  status: RequestStatusEnum,
  note: z.string().max(500).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
  })).optional(),
  createdAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  createdByUser: z.object({
    id: z.string().uuid(),
    fullName: z.string(),
    avatarUrl: z.string().url().optional(),
  }).optional(),
})

export type RequestStatusHistory = z.infer<typeof requestStatusHistorySchema>

/**
 * Database type for requests
 */
export const requestSchema = z.object({
  id: z.string().uuid(),
  type: RequestTypeEnum,
  priority: RequestPriorityEnum,
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  location: z.object({
    address: z.string().min(5).max(500),
    city: z.string().min(2).max(100),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
    }).optional(),
  }),
  status: RequestStatusEnum,
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
  })).optional(),
  preferredDate: z.string().datetime().optional(),
  userId: z.string().uuid(),
  huissierId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  statusHistory: z.array(requestStatusHistorySchema).optional(),
  huissier: z.object({
    id: z.string().uuid(),
    fullName: z.string(),
    avatarUrl: z.string().url().optional(),
    city: z.string(),
    phone: z.string().optional(),
  }).optional(),
})

export type RequestRecord = z.infer<typeof requestSchema>
