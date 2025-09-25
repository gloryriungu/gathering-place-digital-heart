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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      attendance_records: {
        Row: {
          checked_in_at: string | null
          created_at: string | null
          id: string
          member_id: string | null
          service_date: string
          service_type: string | null
        }
        Insert: {
          checked_in_at?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          service_date: string
          service_type?: string | null
        }
        Update: {
          checked_in_at?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          service_date?: string
          service_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      church_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_attendees: number | null
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          location: string | null
          max_attendees: number | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          location?: string | null
          max_attendees?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          location?: string | null
          max_attendees?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contributions: {
        Row: {
          amount: number
          contribution_date: string | null
          contribution_type: string | null
          created_at: string | null
          id: string
          member_id: string | null
          notes: string | null
          payment_method: string | null
        }
        Insert: {
          amount: number
          contribution_date?: string | null
          contribution_type?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          payment_method?: string | null
        }
        Update: {
          amount?: number
          contribution_date?: string | null
          contribution_type?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          payment_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contributions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_stats: {
        Row: {
          created_at: string | null
          id: string
          stat_type: string
          stat_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          stat_type: string
          stat_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          stat_type?: string
          stat_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      department_inventory: {
        Row: {
          category: string | null
          condition: string | null
          created_at: string | null
          department_id: string
          description: string | null
          id: string
          item_name: string
          location: string | null
          purchase_date: string | null
          quantity_available: number | null
          unit_value: number | null
          updated_at: string | null
          warranty_info: string | null
        }
        Insert: {
          category?: string | null
          condition?: string | null
          created_at?: string | null
          department_id: string
          description?: string | null
          id?: string
          item_name: string
          location?: string | null
          purchase_date?: string | null
          quantity_available?: number | null
          unit_value?: number | null
          updated_at?: string | null
          warranty_info?: string | null
        }
        Update: {
          category?: string | null
          condition?: string | null
          created_at?: string | null
          department_id?: string
          description?: string | null
          id?: string
          item_name?: string
          location?: string | null
          purchase_date?: string | null
          quantity_available?: number | null
          unit_value?: number | null
          updated_at?: string | null
          warranty_info?: string | null
        }
        Relationships: []
      }
      faq_content: {
        Row: {
          answer: string
          category: string
          created_at: string
          created_by: string | null
          display_order: number | null
          id: string
          is_published: boolean | null
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category: string
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_transactions: {
        Row: {
          created_at: string | null
          event_date: string | null
          event_name: string | null
          handled_by: string
          id: string
          inventory_item_id: string
          notes: string | null
          quantity: number
          transaction_type: string
        }
        Insert: {
          created_at?: string | null
          event_date?: string | null
          event_name?: string | null
          handled_by: string
          id?: string
          inventory_item_id: string
          notes?: string | null
          quantity: number
          transaction_type: string
        }
        Update: {
          created_at?: string | null
          event_date?: string | null
          event_name?: string | null
          handled_by?: string
          id?: string
          inventory_item_id?: string
          notes?: string | null
          quantity?: number
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_inventory_trans_item"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "department_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      join_family_applications: {
        Row: {
          address: string | null
          application_date: string | null
          baptism_status: string
          created_at: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          id: string
          last_name: string
          ministry_interests: string[] | null
          notes: string | null
          phone: string | null
          previous_church: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          testimony: string | null
          updated_at: string | null
          user_id: string
          volunteer_interests: string[] | null
        }
        Insert: {
          address?: string | null
          application_date?: string | null
          baptism_status: string
          created_at?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          id?: string
          last_name: string
          ministry_interests?: string[] | null
          notes?: string | null
          phone?: string | null
          previous_church?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          testimony?: string | null
          updated_at?: string | null
          user_id: string
          volunteer_interests?: string[] | null
        }
        Update: {
          address?: string | null
          application_date?: string | null
          baptism_status?: string
          created_at?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          id?: string
          last_name?: string
          ministry_interests?: string[] | null
          notes?: string | null
          phone?: string | null
          previous_church?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          testimony?: string | null
          updated_at?: string | null
          user_id?: string
          volunteer_interests?: string[] | null
        }
        Relationships: []
      }
      media_content: {
        Row: {
          content_data: Json
          content_type: string
          created_at: string
          created_by: string
          description: string | null
          expire_date: string | null
          id: string
          image_url: string | null
          priority: number | null
          publish_date: string | null
          status: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content_data?: Json
          content_type: string
          created_at?: string
          created_by: string
          description?: string | null
          expire_date?: string | null
          id?: string
          image_url?: string | null
          priority?: number | null
          publish_date?: string | null
          status?: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content_data?: Json
          content_type?: string
          created_at?: string
          created_by?: string
          description?: string | null
          expire_date?: string | null
          id?: string
          image_url?: string | null
          priority?: number | null
          publish_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      members: {
        Row: {
          address: string | null
          created_at: string | null
          date_joined: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          member_number: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          date_joined?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          member_number?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          date_joined?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          member_number?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ministries: {
        Row: {
          created_at: string | null
          current_members: number | null
          description: string
          id: string
          is_active: boolean | null
          leader_id: string | null
          location: string | null
          max_members: number | null
          meeting_schedule: string | null
          name: string
          requirements: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_members?: number | null
          description: string
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          location?: string | null
          max_members?: number | null
          meeting_schedule?: string | null
          name: string
          requirements?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_members?: number | null
          description?: string
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          location?: string | null
          max_members?: number | null
          meeting_schedule?: string | null
          name?: string
          requirements?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ministry_members: {
        Row: {
          id: string
          joined_date: string | null
          ministry_id: string
          role: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_date?: string | null
          ministry_id: string
          role?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_date?: string | null
          ministry_id?: string
          role?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ministry_members_ministry"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_email_sent: string | null
          last_name: string | null
          subscription_date: string
          subscription_preferences: Json | null
          unsubscribe_token: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_email_sent?: string | null
          last_name?: string | null
          subscription_date?: string
          subscription_preferences?: Json | null
          unsubscribe_token?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_email_sent?: string | null
          last_name?: string | null
          subscription_date?: string
          subscription_preferences?: Json | null
          unsubscribe_token?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      page_content: {
        Row: {
          content: string
          content_type: string
          created_at: string
          id: string
          is_published: boolean | null
          page_name: string
          section_name: string
          updated_at: string
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          page_name: string
          section_name: string
          updated_at?: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          page_name?: string
          section_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      pastor_roles: {
        Row: {
          created_at: string
          id: string
          permissions: string[] | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: string[] | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: string[] | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          county: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          county?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          county?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string
          file_size: number | null
          file_url: string | null
          generated_by: string | null
          id: string
          period: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          file_size?: number | null
          file_url?: string | null
          generated_by?: string | null
          id?: string
          period: string
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          file_size?: number | null
          file_url?: string | null
          generated_by?: string | null
          id?: string
          period?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          action_taken: string
          created_at: string
          description: string
          event_type: string
          id: string
          metadata: Json | null
          severity: string
          source: string
        }
        Insert: {
          action_taken: string
          created_at?: string
          description: string
          event_type: string
          id?: string
          metadata?: Json | null
          severity: string
          source: string
        }
        Update: {
          action_taken?: string
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          severity?: string
          source?: string
        }
        Relationships: []
      }
      serve_applications: {
        Row: {
          application_date: string | null
          created_at: string | null
          department_id: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_date?: string | null
          created_at?: string | null
          department_id: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_date?: string | null
          created_at?: string | null
          department_id?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_serve_applications_dept"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "serve_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      serve_departments: {
        Row: {
          created_at: string
          description: string
          display_order: number | null
          icon: string
          id: string
          is_visible: boolean | null
          name: string
          requirements: string[]
          time_commitment: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number | null
          icon: string
          id: string
          is_visible?: boolean | null
          name: string
          requirements: string[]
          time_commitment: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number | null
          icon?: string
          id?: string
          is_visible?: boolean | null
          name?: string
          requirements?: string[]
          time_commitment?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_media_handles: {
        Row: {
          created_at: string
          display_order: number | null
          handle: string
          icon: string | null
          id: string
          is_active: boolean | null
          platform: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          handle: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          handle?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          department: string
          description: string
          id: string
          priority: string
          status: string
          submitted_by: string
          ticket_number: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string
          department: string
          description: string
          id?: string
          priority: string
          status?: string
          submitted_by: string
          ticket_number: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          department?: string
          description?: string
          id?: string
          priority?: string
          status?: string
          submitted_by?: string
          ticket_number?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string
          category: string
          created_at: string
          details: string
          id: string
          ip_address: string | null
          log_level: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          category: string
          created_at?: string
          details: string
          id?: string
          ip_address?: string | null
          log_level: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          category?: string
          created_at?: string
          details?: string
          id?: string
          ip_address?: string | null
          log_level?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_type: string
          metric_value: Json
          timestamp: string
        }
        Insert: {
          id?: string
          metric_name: string
          metric_type: string
          metric_value: Json
          timestamp?: string
        }
        Update: {
          id?: string
          metric_name?: string
          metric_type?: string
          metric_value?: Json
          timestamp?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          name: string
          position: string | null
          testimonial_text: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          name: string
          position?: string | null
          testimonial_text: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          name?: string
          position?: string | null
          testimonial_text?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_member_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          monthly_contributions: number
          total_members: number
          upcoming_events: number
          weekly_attendance: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "pastor"
        | "registration"
        | "accounts"
        | "sunday_school"
        | "teacher"
        | "it"
        | "user"
        | "media"
        | "marketing"
        | "senior_pastor"
        | "founder"
    }
    CompositeTypes: {
      [_ in never]: never
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
      app_role: [
        "admin",
        "pastor",
        "registration",
        "accounts",
        "sunday_school",
        "teacher",
        "it",
        "user",
        "media",
        "marketing",
        "senior_pastor",
        "founder",
      ],
    },
  },
} as const
