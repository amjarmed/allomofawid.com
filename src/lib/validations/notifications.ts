import { z } from "zod";

// Notification category schema
export const notificationCategorySchema = z.enum([
  "request_status",
  "system_updates",
  "request_messages",
  "request_documents",
  "account_verification",
  "payment_updates",
  "emergency_requests",
  "general"
]);

// Notification data schema (flexible JSON field)
export const notificationDataSchema = z.record(z.string(), z.any()).optional();

// Base Notification schema
export const notificationSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid("Invalid user ID format"),
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),
  body: z.string()
    .max(500, "Body must be at most 500 characters")
    .optional(),
  icon: z.string().url("Invalid icon URL").optional(),
  data: notificationDataSchema,
  category: notificationCategorySchema.optional(),
  read_at: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  deleted_at: z.string().datetime().optional(),
});

// Schema for creating a new notification
export const createNotificationSchema = notificationSchema.omit({
  id: true,
  read_at: true,
  created_at: true,
  deleted_at: true,
});

// Schema for marking notification as read
export const markNotificationReadSchema = z.object({
  notification_id: z.string().uuid("Invalid notification ID"),
});

// Schema for clearing notifications
export const clearNotificationsSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  category: notificationCategorySchema.optional(),
});

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid("Invalid user ID format"),
  categories: z.object({
    request_status: z.boolean().default(true),
    system_updates: z.boolean().default(true),
    request_messages: z.boolean().default(true),
    request_documents: z.boolean().default(true),
    account_verification: z.boolean().default(true),
    payment_updates: z.boolean().default(true),
    emergency_requests: z.boolean().default(true),
    general: z.boolean().default(false),
  }),
  sounds_enabled: z.boolean().default(true).optional(),
  desktop_enabled: z.boolean().default(true).optional(),
  email_enabled: z.boolean().default(true).optional(),
  quiet_hours: z.object({
    enabled: z.boolean().default(false),
    start: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format").default("22:00"),
    end: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format").default("08:00"),
    timezone: z.string().default("Africa/Casablanca"),
  }).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schema for updating notification preferences
export const updateNotificationPreferencesSchema = notificationPreferencesSchema.partial().omit({
  id: true,
  user_id: true,
  created_at: true,
});

// Schema for notification search/filtering
export const notificationSearchSchema = z.object({
  user_id: z.string().uuid("Invalid user ID format"),
  category: notificationCategorySchema.optional(),
  read: z.boolean().optional(), // Filter by read/unread status
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

// Push subscription schema
export const pushSubscriptionSchema = z.object({
  id: z.string().uuid().optional(),
  subscription_id: z.string().min(1, "Subscription ID is required"),
  endpoint: z.string().url("Invalid endpoint URL"),
  p256dh: z.string().min(1, "p256dh key is required"),
  auth: z.string().min(1, "Auth key is required"),
  user_agent: z.string().max(500).optional(),
  ip_address: z.string()
    .regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/, "Invalid IP address")
    .optional(),
  phone: z.string().optional(),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schema for creating push subscription
export const createPushSubscriptionSchema = pushSubscriptionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Types
export type Notification = z.infer<typeof notificationSchema>;
export type CreateNotificationData = z.infer<typeof createNotificationSchema>;
export type NotificationCategory = z.infer<typeof notificationCategorySchema>;
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type UpdateNotificationPreferencesData = z.infer<typeof updateNotificationPreferencesSchema>;
export type NotificationSearchParams = z.infer<typeof notificationSearchSchema>;
export type PushSubscription = z.infer<typeof pushSubscriptionSchema>;
export type CreatePushSubscriptionData = z.infer<typeof createPushSubscriptionSchema>;
