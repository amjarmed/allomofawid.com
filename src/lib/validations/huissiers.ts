import { z } from "zod";

// Enums from your database
export const verificationStatusSchema = z.enum([
  "unverified",
  "pending",
  "verified",
  "rejected"
]);

export const registrationTypeSchema = z.enum(["imported", "manual"]);

export const languageSchema = z.enum(["ar", "fr", "en"]);

// Working hours schema for JSON field
export const workingHoursSchema = z.object({
  monday: z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    close: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    closed: z.boolean().default(false),
  }).optional(),
  tuesday: z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    close: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    closed: z.boolean().default(false),
  }).optional(),
  wednesday: z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    close: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    closed: z.boolean().default(false),
  }).optional(),
  thursday: z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    close: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    closed: z.boolean().default(false),
  }).optional(),
  friday: z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    close: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    closed: z.boolean().default(false),
  }).optional(),
  saturday: z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    close: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    closed: z.boolean().default(false),
  }).optional(),
  sunday: z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    close: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    closed: z.boolean().default(false),
  }).optional(),
}).optional();

// Location schema for PostGIS geometry
export const locationSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90),   // latitude
  ]),
}).optional();

// Base Huissier schema
export const huissierSchema = z.object({
  id: z.string().uuid().optional(),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  full_name: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  office_address: z.string()
    .min(5, "Office address must be at least 5 characters")
    .max(200, "Office address must be at most 200 characters"),
  city_id: z.string().uuid("Invalid city ID format"),
  location: locationSchema,
  verification_status: verificationStatusSchema.default("unverified"),
  years_experience: z.number()
    .int("Years of experience must be an integer")
    .min(0, "Years of experience cannot be negative")
    .max(50, "Years of experience seems unrealistic")
    .optional(),
  languages: z.array(languageSchema).default(["ar"]).optional(),
  specialties: z.array(z.string().min(1).max(50))
    .max(10, "Maximum 10 specialties allowed")
    .optional(),
  working_hours: workingHoursSchema,
  rating: z.number()
    .min(0, "Rating cannot be negative")
    .max(5, "Rating cannot exceed 5")
    .optional(),
  rating_count: z.number()
    .int("Rating count must be an integer")
    .min(0, "Rating count cannot be negative")
    .optional(),
  profile_image_url: z.string().url("Invalid image URL").optional(),
  email: z.string().email("Invalid email format").optional(),
  email_verified: z.boolean().default(false).optional(),
  phone_verified: z.boolean().default(false).optional(),
  registration_type: registrationTypeSchema.default("imported").optional(),
  user_id: z.string().uuid("Invalid user ID format").optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schema for creating a new huissier
export const createHuissierSchema = huissierSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  rating: true,
  rating_count: true,
});

// Schema for updating a huissier
export const updateHuissierSchema = huissierSchema.partial().omit({
  id: true,
  created_at: true,
});

// Schema for huissier search/filtering
export const huissierSearchSchema = z.object({
  city_id: z.string().uuid().optional(),
  verification_status: verificationStatusSchema.optional(),
  languages: z.array(languageSchema).optional(),
  specialties: z.array(z.string()).optional(),
  min_rating: z.number().min(0).max(5).optional(),
  max_distance_km: z.number().min(0).max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// Types
export type Huissier = z.infer<typeof huissierSchema>;
export type CreateHuissierData = z.infer<typeof createHuissierSchema>;
export type UpdateHuissierData = z.infer<typeof updateHuissierSchema>;
export type HuissierSearchParams = z.infer<typeof huissierSearchSchema>;
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;
export type WorkingHours = z.infer<typeof workingHoursSchema>;
export type Location = z.infer<typeof locationSchema>;
