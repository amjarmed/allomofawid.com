import { z } from "zod"

export const regionSchema = z.object({
  name_ar: z.string().min(2).max(100),
  name_fr: z.string().min(2).max(100),
  name_en: z.string().min(2).max(100),
  code: z.string().min(2).max(10),
})

export const citySchema = z.object({
  region_id: z.string().uuid(),
  name_ar: z.string().min(2).max(100),
  name_fr: z.string().min(2).max(100),
  name_en: z.string().min(2).max(100),
  code: z.string().min(2).max(10),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  bounds: z.array(
    z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
  ).min(3), // Minimum 3 points to form a polygon
  population: z.number().int().positive().optional(),
  active: z.boolean().default(true),
})

export type RegionInput = z.infer<typeof regionSchema>
export type CityInput = z.infer<typeof citySchema>
