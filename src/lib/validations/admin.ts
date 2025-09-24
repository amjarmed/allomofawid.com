import { z } from "zod";

// Admin role schema
export const adminRoleSchema = z.enum(["admin", "super_admin"]);

// Admin permissions schema
export const adminPermissionsSchema = z.object({
  users: z.object({
    read: z.boolean().default(false),
    write: z.boolean().default(false),
    delete: z.boolean().default(false),
  }).optional(),
  huissiers: z.object({
    read: z.boolean().default(false),
    write: z.boolean().default(false),
    delete: z.boolean().default(false),
    verify: z.boolean().default(false),
  }).optional(),
  requests: z.object({
    read: z.boolean().default(false),
    write: z.boolean().default(false),
    delete: z.boolean().default(false),
    assign: z.boolean().default(false),
  }).optional(),
  cities: z.object({
    read: z.boolean().default(false),
    write: z.boolean().default(false),
    delete: z.boolean().default(false),
  }).optional(),
  notifications: z.object({
    read: z.boolean().default(false),
    write: z.boolean().default(false),
    delete: z.boolean().default(false),
    send: z.boolean().default(false),
  }).optional(),
  admin_users: z.object({
    read: z.boolean().default(false),
    write: z.boolean().default(false),
    delete: z.boolean().default(false),
  }).optional(),
  reports: z.object({
    read: z.boolean().default(false),
    generate: z.boolean().default(false),
    export: z.boolean().default(false),
  }).optional(),
  system: z.object({
    settings: z.boolean().default(false),
    maintenance: z.boolean().default(false),
    logs: z.boolean().default(false),
  }).optional(),
}).optional();

// Base Admin User schema
export const adminUserSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid("Invalid user ID format").optional(),
  role: adminRoleSchema.default("admin"),
  permissions: adminPermissionsSchema,
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schema for creating a new admin user
export const createAdminUserSchema = adminUserSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Schema for updating admin user
export const updateAdminUserSchema = adminUserSchema.partial().omit({
  id: true,
  user_id: true,
  created_at: true,
});

// Schema for admin user search/filtering
export const adminUserSearchSchema = z.object({
  role: adminRoleSchema.optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Schema for permission updates
export const updatePermissionsSchema = z.object({
  permissions: adminPermissionsSchema,
});

// Types
export type AdminUser = z.infer<typeof adminUserSchema>;
export type CreateAdminUserData = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserData = z.infer<typeof updateAdminUserSchema>;
export type AdminUserSearchParams = z.infer<typeof adminUserSearchSchema>;
export type AdminRole = z.infer<typeof adminRoleSchema>;
export type AdminPermissions = z.infer<typeof adminPermissionsSchema>;
