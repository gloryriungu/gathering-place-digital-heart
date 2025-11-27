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
      activity_log_visibility: {
        Row: {
          can_view_all_activity: boolean
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          can_view_all_activity?: boolean
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          can_view_all_activity?: boolean
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_category: string
          event_type: string
          id: string
          properties: Json
          session_id: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_category: string
          event_type: string
          id?: string
          properties?: Json
          session_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_category?: string
          event_type?: string
          id?: string
          properties?: Json
          session_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
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
      budget_proposals: {
        Row: {
          amount: number
          created_at: string
          department_id: string
          description: string
          id: string
          justification: string
          period_end: string
          period_start: string
          proposal_type: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          submitted_by: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          department_id: string
          description: string
          id?: string
          justification: string
          period_end: string
          period_start: string
          proposal_type?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          submitted_by: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          department_id?: string
          description?: string
          id?: string
          justification?: string
          period_end?: string
          period_start?: string
          proposal_type?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          submitted_by?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          category: string | null
          content: string
          created_at: string
          download_url: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          download_url?: string | null
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          download_url?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          donor_email: string | null
          donor_name: string | null
          donor_phone: string | null
          id: string
          member_id: string | null
          notes: string | null
          payment_channel: string | null
          payment_method: string | null
          paystack_reference: string | null
          save_details: boolean | null
          transaction_reference: string | null
          transaction_status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          contribution_date?: string | null
          contribution_type?: string | null
          created_at?: string | null
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          payment_channel?: string | null
          payment_method?: string | null
          paystack_reference?: string | null
          save_details?: boolean | null
          transaction_reference?: string | null
          transaction_status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          contribution_date?: string | null
          contribution_type?: string | null
          created_at?: string | null
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          payment_channel?: string | null
          payment_method?: string | null
          paystack_reference?: string | null
          save_details?: boolean | null
          transaction_reference?: string | null
          transaction_status?: string | null
          updated_at?: string | null
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
      counseling_sessions: {
        Row: {
          created_at: string
          end_time: string
          id: string
          member_id: string
          member_notes: string | null
          notes: string | null
          pastor_id: string
          session_date: string
          session_type: string
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          member_id: string
          member_notes?: string | null
          notes?: string | null
          pastor_id: string
          session_date: string
          session_type?: string
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          member_id?: string
          member_notes?: string | null
          notes?: string | null
          pastor_id?: string
          session_date?: string
          session_type?: string
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
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
      email_analytics: {
        Row: {
          bounced_at: string | null
          campaign_id: string | null
          click_count: number | null
          clicked_at: string | null
          email: string
          id: string
          open_count: number | null
          opened_at: string | null
          sent_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          bounced_at?: string | null
          campaign_id?: string | null
          click_count?: number | null
          clicked_at?: string | null
          email: string
          id?: string
          open_count?: number | null
          opened_at?: string | null
          sent_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          bounced_at?: string | null
          campaign_id?: string | null
          click_count?: number | null
          clicked_at?: string | null
          email?: string
          id?: string
          open_count?: number | null
          opened_at?: string | null
          sent_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_bounces: {
        Row: {
          bounce_reason: string | null
          bounce_type: string
          created_at: string | null
          email: string
          id: string
          message_id: string | null
          occurred_at: string | null
        }
        Insert: {
          bounce_reason?: string | null
          bounce_type: string
          created_at?: string | null
          email: string
          id?: string
          message_id?: string | null
          occurred_at?: string | null
        }
        Update: {
          bounce_reason?: string | null
          bounce_type?: string
          created_at?: string | null
          email?: string
          id?: string
          message_id?: string | null
          occurred_at?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          created_at: string | null
          created_by: string | null
          html_content: string
          id: string
          name: string
          scheduled_at: string | null
          segment_filters: Json | null
          sent_at: string | null
          status: string | null
          subject: string
          text_content: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          html_content: string
          id?: string
          name: string
          scheduled_at?: string | null
          segment_filters?: Json | null
          sent_at?: string | null
          status?: string | null
          subject: string
          text_content?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          html_content?: string
          id?: string
          name?: string
          scheduled_at?: string | null
          segment_filters?: Json | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          text_content?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          county: string | null
          created_at: string
          custom_fields: Json | null
          email: string
          event_id: string
          first_name: string
          id: string
          last_name: string
          number_of_attendees: number
          phone: string | null
          registered_by: string | null
          registration_type: string
          special_requirements: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          county?: string | null
          created_at?: string
          custom_fields?: Json | null
          email: string
          event_id: string
          first_name: string
          id?: string
          last_name: string
          number_of_attendees?: number
          phone?: string | null
          registered_by?: string | null
          registration_type?: string
          special_requirements?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          county?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string
          event_id?: string
          first_name?: string
          id?: string
          last_name?: string
          number_of_attendees?: number
          phone?: string | null
          registered_by?: string | null
          registration_type?: string
          special_requirements?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "media_content"
            referencedColumns: ["id"]
          },
        ]
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
          county: string | null
          created_at: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          id: string
          last_name: string
          ministry_interests: string[] | null
          notes: string | null
          occupation: string | null
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
          county?: string | null
          created_at?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          id?: string
          last_name: string
          ministry_interests?: string[] | null
          notes?: string | null
          occupation?: string | null
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
          county?: string | null
          created_at?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          id?: string
          last_name?: string
          ministry_interests?: string[] | null
          notes?: string | null
          occupation?: string | null
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
      member_import_batches: {
        Row: {
          created_at: string | null
          duplicates: number | null
          failed: number | null
          file_name: string
          id: string
          imported_by: string
          successful: number | null
          total_records: number
        }
        Insert: {
          created_at?: string | null
          duplicates?: number | null
          failed?: number | null
          file_name: string
          id?: string
          imported_by: string
          successful?: number | null
          total_records: number
        }
        Update: {
          created_at?: string | null
          duplicates?: number | null
          failed?: number | null
          file_name?: string
          id?: string
          imported_by?: string
          successful?: number | null
          total_records?: number
        }
        Relationships: []
      }
      member_import_logs: {
        Row: {
          batch_id: string
          created_at: string | null
          data: Json
          error_message: string | null
          id: string
          member_id: string | null
          row_number: number
          status: string
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          data: Json
          error_message?: string | null
          id?: string
          member_id?: string | null
          row_number: number
          status: string
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          data?: Json
          error_message?: string | null
          id?: string
          member_id?: string | null
          row_number?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_import_logs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "member_import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_import_logs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_link_suggestions: {
        Row: {
          confidence_score: number
          created_at: string | null
          id: string
          match_reasons: Json
          member_id: string
          profile_user_id: string
          status: string | null
        }
        Insert: {
          confidence_score: number
          created_at?: string | null
          id?: string
          match_reasons: Json
          member_id: string
          profile_user_id: string
          status?: string | null
        }
        Update: {
          confidence_score?: number
          created_at?: string | null
          id?: string
          match_reasons?: Json
          member_id?: string
          profile_user_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_link_suggestions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          address: string | null
          created_at: string | null
          date_joined: string | null
          email: string | null
          first_name: string
          id: string
          import_batch_id: string | null
          imported_at: string | null
          last_name: string
          member_number: string | null
          phone: string | null
          source: string | null
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
          import_batch_id?: string | null
          imported_at?: string | null
          last_name: string
          member_number?: string | null
          phone?: string | null
          source?: string | null
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
          import_batch_id?: string | null
          imported_at?: string | null
          last_name?: string
          member_number?: string | null
          phone?: string | null
          source?: string | null
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
          bounce_count: number | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_bounce_at: string | null
          last_email_sent: string | null
          last_name: string | null
          metadata: Json | null
          source: string | null
          status: string | null
          subscription_date: string
          subscription_preferences: Json | null
          tags: string[] | null
          unsubscribe_token: string | null
          updated_at: string
        }
        Insert: {
          bounce_count?: number | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_bounce_at?: string | null
          last_email_sent?: string | null
          last_name?: string | null
          metadata?: Json | null
          source?: string | null
          status?: string | null
          subscription_date?: string
          subscription_preferences?: Json | null
          tags?: string[] | null
          unsubscribe_token?: string | null
          updated_at?: string
        }
        Update: {
          bounce_count?: number | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_bounce_at?: string | null
          last_email_sent?: string | null
          last_name?: string | null
          metadata?: Json | null
          source?: string | null
          status?: string | null
          subscription_date?: string
          subscription_preferences?: Json | null
          tags?: string[] | null
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
      pastor_availability: {
        Row: {
          created_at: string
          day_of_week: string
          end_time: string
          id: string
          is_active: boolean
          max_sessions: number
          pastor_id: string
          session_duration: number
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: string
          end_time: string
          id?: string
          is_active?: boolean
          max_sessions?: number
          pastor_id: string
          session_duration?: number
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: string
          end_time?: string
          id?: string
          is_active?: boolean
          max_sessions?: number
          pastor_id?: string
          session_duration?: number
          start_time?: string
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
      paystack_webhook_logs: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          ip_address: string | null
          processed_at: string | null
          processing_error: string | null
          processing_status: string
          reference: string | null
          related_contribution_id: string | null
          signature_valid: boolean
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_data: Json
          event_type: string
          id?: string
          ip_address?: string | null
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string
          reference?: string | null
          related_contribution_id?: string | null
          signature_valid?: boolean
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          ip_address?: string | null
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string
          reference?: string | null
          related_contribution_id?: string | null
          signature_valid?: boolean
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paystack_webhook_logs_related_contribution_id_fkey"
            columns: ["related_contribution_id"]
            isOneToOne: false
            referencedRelation: "contributions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          county: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          occupation: string | null
          phone: string | null
          qr_code_data: string | null
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
          occupation?: string | null
          phone?: string | null
          qr_code_data?: string | null
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
          occupation?: string | null
          phone?: string | null
          qr_code_data?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_contributions: {
        Row: {
          amount: number
          contribution_type: string
          created_at: string
          end_date: string | null
          failed_attempts: number | null
          frequency: string
          id: string
          last_charge_date: string | null
          last_charge_status: string | null
          member_id: string | null
          next_charge_date: string
          payment_method_id: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          contribution_type?: string
          created_at?: string
          end_date?: string | null
          failed_attempts?: number | null
          frequency?: string
          id?: string
          last_charge_date?: string | null
          last_charge_status?: string | null
          member_id?: string | null
          next_charge_date: string
          payment_method_id: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          contribution_type?: string
          created_at?: string
          end_date?: string | null
          failed_attempts?: number | null
          frequency?: string
          id?: string
          last_charge_date?: string | null
          last_charge_status?: string | null
          member_id?: string | null
          next_charge_date?: string
          payment_method_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_recurring_member"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_recurring_payment_method"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "saved_payment_methods"
            referencedColumns: ["id"]
          },
        ]
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
      requisitions: {
        Row: {
          amount: number | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          department_id: string
          description: string
          id: string
          priority: string
          reason: string | null
          request_type: string
          requested_by: string
          requested_date: string
          required_by: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          department_id: string
          description: string
          id?: string
          priority?: string
          reason?: string | null
          request_type: string
          requested_by: string
          requested_date?: string
          required_by?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          department_id?: string
          description?: string
          id?: string
          priority?: string
          reason?: string | null
          request_type?: string
          requested_by?: string
          requested_date?: string
          required_by?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_payment_methods: {
        Row: {
          authorization_code: string | null
          card_last4: string | null
          card_type: string | null
          created_at: string | null
          email: string | null
          id: string
          is_default: boolean | null
          phone_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          authorization_code?: string | null
          card_last4?: string | null
          card_type?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_default?: boolean | null
          phone_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          authorization_code?: string | null
          card_last4?: string | null
          card_type?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_default?: boolean | null
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string
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
      shop_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      shop_orders: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          items: Json
          order_number: string
          payment_channel: string | null
          payment_method: string | null
          paystack_reference: string | null
          subtotal: number
          total_amount: number
          transaction_reference: string | null
          transaction_status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          items: Json
          order_number: string
          payment_channel?: string | null
          payment_method?: string | null
          paystack_reference?: string | null
          subtotal: number
          total_amount: number
          transaction_reference?: string | null
          transaction_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          items?: Json
          order_number?: string
          payment_channel?: string | null
          payment_method?: string | null
          paystack_reference?: string | null
          subtotal?: number
          total_amount?: number
          transaction_reference?: string | null
          transaction_status?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      suppression_list: {
        Row: {
          added_at: string | null
          added_by: string | null
          email: string
          id: string
          notes: string | null
          reason: string
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          email: string
          id?: string
          notes?: string | null
          reason: string
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          email?: string
          id?: string
          notes?: string | null
          reason?: string
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
      can_view_all_activity: { Args: { _user_id: string }; Returns: boolean }
      generate_member_number: { Args: never; Returns: string }
      generate_order_number: { Args: never; Returns: string }
      generate_ticket_number: { Args: never; Returns: string }
      get_campaign_stats: {
        Args: { campaign_uuid: string }
        Returns: {
          click_rate: number
          open_rate: number
          total_bounced: number
          total_clicked: number
          total_opened: number
          total_sent: number
          total_unsubscribed: number
        }[]
      }
      get_dashboard_stats: {
        Args: never
        Returns: {
          monthly_contributions: number
          total_members: number
          upcoming_events: number
          weekly_attendance: number
        }[]
      }
      get_pastor_activity_summary: {
        Args: { pastor_user_id: string }
        Returns: {
          availability_changes: number
          cancelled_sessions: number
          completed_sessions: number
          last_activity: string
          total_sessions: number
        }[]
      }
      get_user_email: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_email_suppressed: {
        Args: { email_to_check: string }
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
