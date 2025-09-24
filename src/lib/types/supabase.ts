export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string
          id: string
          location: unknown
          name_ar: string
          name_fr: string
          region_ar: string
          region_fr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location: unknown
          name_ar: string
          name_fr: string
          region_ar: string
          region_fr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: unknown
          name_ar?: string
          name_fr?: string
          region_ar?: string
          region_fr?: string
          updated_at?: string
        }
        Relationships: []
      }
      huissiers: {
        Row: {
          city_id: string
          created_at: string
          email: string | null
          email_verified: boolean | null
          full_name: string
          id: string
          languages: string[] | null
          location: unknown
          office_address: string
          phone: string
          phone_verified: boolean | null
          profile_image_url: string | null
          rating: number | null
          rating_count: number | null
          registration_type: string | null
          specialties: string[] | null
          updated_at: string
          user_id: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          working_hours: Json | null
          years_experience: number | null
        }
        Insert: {
          city_id: string
          created_at?: string
          email?: string | null
          email_verified?: boolean | null
          full_name: string
          id?: string
          languages?: string[] | null
          location: unknown
          office_address: string
          phone: string
          phone_verified?: boolean | null
          profile_image_url?: string | null
          rating?: number | null
          rating_count?: number | null
          registration_type?: string | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          working_hours?: Json | null
          years_experience?: number | null
        }
        Update: {
          city_id?: string
          created_at?: string
          email?: string | null
          email_verified?: boolean | null
          full_name?: string
          id?: string
          languages?: string[] | null
          location?: unknown
          office_address?: string
          phone?: string
          phone_verified?: boolean | null
          profile_image_url?: string | null
          rating?: number | null
          rating_count?: number | null
          registration_type?: string | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          working_hours?: Json | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "huissiers_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          categories: Json
          created_at: string
          desktop_enabled: boolean | null
          email_enabled: boolean | null
          id: string
          quiet_hours: Json | null
          sounds_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          categories?: Json
          created_at?: string
          desktop_enabled?: boolean | null
          email_enabled?: boolean | null
          id?: string
          quiet_hours?: Json | null
          sounds_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          categories?: Json
          created_at?: string
          desktop_enabled?: boolean | null
          email_enabled?: boolean | null
          id?: string
          quiet_hours?: Json | null
          sounds_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          category: string | null
          created_at: string
          data: Json | null
          deleted_at: string | null
          icon: string | null
          id: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          category?: string | null
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          icon?: string | null
          id?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          category?: string | null
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          icon?: string | null
          id?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          p256dh: string
          phone: string | null
          subscription_id: string
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          p256dh: string
          phone?: string | null
          subscription_id: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          p256dh?: string
          phone?: string | null
          subscription_id?: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "huissiers"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          client_location: unknown
          client_name: string
          client_phone: string
          created_at: string
          description: string | null
          huissier_id: string
          id: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          urgency: Database["public"]["Enums"]["request_urgency"]
        }
        Insert: {
          client_location: unknown
          client_name: string
          client_phone: string
          created_at?: string
          description?: string | null
          huissier_id: string
          id?: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["request_urgency"]
        }
        Update: {
          client_location?: unknown
          client_name?: string
          client_phone?: string
          created_at?: string
          description?: string | null
          huissier_id?: string
          id?: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["request_urgency"]
        }
        Relationships: [
          {
            foreignKeyName: "requests_huissier_id_fkey"
            columns: ["huissier_id"]
            isOneToOne: false
            referencedRelation: "huissiers"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      // Notification functions
      clear_all_notifications: {
        Args: { user_id_input: string }
        Returns: {
          body: string | null
          category: string | null
          created_at: string
          data: Json | null
          deleted_at: string | null
          icon: string | null
          id: string
          read_at: string | null
          title: string
          user_id: string
        }[]
      }
      clear_notification: {
        Args: { notification_id: string }
        Returns: {
          body: string | null
          category: string | null
          created_at: string
          data: Json | null
          deleted_at: string | null
          icon: string | null
          id: string
          read_at: string | null
          title: string
          user_id: string
        }[]
      }
      mark_notification_read: {
        Args: { notification_id: string }
        Returns: {
          body: string | null
          category: string | null
          created_at: string
          data: Json | null
          deleted_at: string | null
          icon: string | null
          id: string
          read_at: string | null
          title: string
          user_id: string
        }[]
      }
      // Huissier functions
      find_nearest_huissiers: {
        Args: {
          max_distance_km?: number
          max_results?: number
          search_lat: number
          search_lng: number
        }
        Returns: {
          city_name_ar: string
          city_name_fr: string
          distance_meters: number
          email: string
          full_name: string
          id: string
          languages: string[]
          office_address: string
          phone: string
          rating: number
          rating_count: number
          specialties: string[]
          verification_status: string
          working_hours: Json
        }[]
      }
    }
    Enums: {
      request_status: "pending" | "accepted" | "completed" | "cancelled"
      request_urgency: "normal" | "urgent"
      verification_status: "unverified" | "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      request_status: ["pending", "accepted", "completed", "cancelled"],
      request_urgency: ["normal", "urgent"],
      verification_status: ["unverified", "pending", "verified", "rejected"],
    },
  },
} as const
