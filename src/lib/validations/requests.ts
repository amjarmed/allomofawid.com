import { z } from "zod";

// Enums from your database
export const requestStatusSchema = z.enum([
  "pending",
  "accepted",
  "completed",
  "cancelled"
]);

export const requestUrgencySchema = z.enum(["normal", "urgent"]);

// Location schema for client location
export const clientLocationSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90),   // latitude
  ]),
});

// Base Request schema
export const requestSchema = z.object({
  id: z.string().uuid().optional(),
  huissier_id: z.string().uuid("Invalid huissier ID format"),
  client_phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  client_name: z.string()
    .min(2, "Client name must be at least 2 characters")
    .max(100, "Client name must be at most 100 characters")
    .regex(/^[a-zA-Zأ-ي\s]+$/, "Client name can only contain letters and spaces"),
  status: requestStatusSchema.default("pending"),
  urgency: requestUrgencySchema.default("normal"),
  client_location: clientLocationSchema,
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schema for creating a new request
export const createRequestSchema = requestSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  description: z.string()
    .min(10, "Description is required and must be at least 10 characters")
    .max(1000, "Description must be at most 1000 characters"),
});

// Schema for updating a request (mainly status updates)
export const updateRequestSchema = z.object({
  status: requestStatusSchema.optional(),
  urgency: requestUrgencySchema.optional(),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
}).strict();

// Schema for request search/filtering
export const requestSearchSchema = z.object({
  huissier_id: z.string().uuid().optional(),
  client_phone: z.string().optional(),
  status: requestStatusSchema.optional(),
  urgency: requestUrgencySchema.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  city_id: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Schema for status update (for huissiers)
export const updateRequestStatusSchema = z.object({
  status: requestStatusSchema,
  notes: z.string().max(500, "Notes must be at most 500 characters").optional(),
});

// Schema for emergency requests
export const emergencyRequestSchema = createRequestSchema.extend({
  urgency: z.literal("urgent"),
  priority_reason: z.string()
    .min(5, "Priority reason must be at least 5 characters")
    .max(200, "Priority reason must be at most 200 characters"),
});

// Types
export type Request = z.infer<typeof requestSchema>;
export type CreateRequestData = z.infer<typeof createRequestSchema>;
export type UpdateRequestData = z.infer<typeof updateRequestSchema>;
export type RequestSearchParams = z.infer<typeof requestSearchSchema>;
export type RequestStatus = z.infer<typeof requestStatusSchema>;
export type RequestUrgency = z.infer<typeof requestUrgencySchema>;
export type ClientLocation = z.infer<typeof clientLocationSchema>;
export type UpdateRequestStatusData = z.infer<typeof updateRequestStatusSchema>;
export type EmergencyRequestData = z.infer<typeof emergencyRequestSchema>;
