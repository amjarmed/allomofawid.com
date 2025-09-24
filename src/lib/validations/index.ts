// Export all validation schemas and types
export * from './admin';
export * from './cities';
export * from './huissiers';
export * from './notifications';
export * from './requests';

// Common validation schemas used across the app
import { z } from "zod";

// Common pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc").optional(),
});

// Common search schema
export const searchSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  ...paginationSchema.shape,
});

// Phone number validation (Moroccan format)
export const moroccanPhoneSchema = z.string()
  .regex(/^(\+212|0)[5-7]\d{8}$/, "Please enter a valid Moroccan phone number");

// ID validation
export const uuidSchema = z.string().uuid("Invalid ID format");

// Date range schema
export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

// Coordinates schema
export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// Language schema
export const languageSchema = z.enum(["ar", "fr", "en"]);

// File upload schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp']),
});

// API response schemas
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.any().optional(),
  message: z.string().optional(),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

export const paginatedResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// Types for common schemas
export type PaginationParams = z.infer<typeof paginationSchema>;
export type SearchParams = z.infer<typeof searchSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Language = z.infer<typeof languageSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type PaginatedResponse = z.infer<typeof paginatedResponseSchema>;
