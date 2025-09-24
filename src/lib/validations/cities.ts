import { z } from "zod";

// Location schema for city coordinates
export const cityLocationSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90),   // latitude
  ]),
});

// Base City schema
export const citySchema = z.object({
  id: z.string().uuid().optional(),
  name_ar: z.string()
    .min(2, "Arabic name must be at least 2 characters")
    .max(50, "Arabic name must be at most 50 characters")
    .regex(/^[أ-ي\s]+$/, "Arabic name must contain only Arabic characters"),
  name_fr: z.string()
    .min(2, "French name must be at least 2 characters")
    .max(50, "French name must be at most 50 characters")
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, "French name must contain only Latin characters"),
  region_ar: z.string()
    .min(2, "Arabic region must be at least 2 characters")
    .max(50, "Arabic region must be at most 50 characters")
    .regex(/^[أ-ي\s]+$/, "Arabic region must contain only Arabic characters"),
  region_fr: z.string()
    .min(2, "French region must be at least 2 characters")
    .max(50, "French region must be at most 50 characters")
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, "French region must contain only Latin characters"),
  location: cityLocationSchema,
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schema for creating a new city
export const createCitySchema = citySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Schema for updating a city
export const updateCitySchema = citySchema.partial().omit({
  id: true,
  created_at: true,
});

// Schema for city search/filtering
export const citySearchSchema = z.object({
  name: z.string().min(1).optional(), // Search in both Arabic and French names
  region: z.string().min(1).optional(), // Search in both Arabic and French regions
  language: z.enum(["ar", "fr"]).default("ar").optional(),
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
});

// Schema for city selection (used in forms)
export const citySelectorSchema = z.object({
  city_id: z.string().uuid("Please select a valid city"),
});

// Types
export type City = z.infer<typeof citySchema>;
export type CreateCityData = z.infer<typeof createCitySchema>;
export type UpdateCityData = z.infer<typeof updateCitySchema>;
export type CitySearchParams = z.infer<typeof citySearchSchema>;
export type CityLocation = z.infer<typeof cityLocationSchema>;
