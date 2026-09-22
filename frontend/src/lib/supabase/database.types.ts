export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          created_at: string
          data: Json
          entity_id: string | null
          entity_type: string
          event_type: string
          family_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          entity_id?: string | null
          entity_type: string
          event_type: string
          family_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          entity_id?: string | null
          entity_type?: string
          event_type?: string
          family_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_requests: {
        Row: {
          created_at: string
          error: string | null
          id: string
          latency_ms: number
          model: string
          operation: string
          provider: string
          status: string
          tokens_input: number
          tokens_output: number
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          latency_ms?: number
          model: string
          operation: string
          provider: string
          status: string
          tokens_input?: number
          tokens_output?: number
          user_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          latency_ms?: number
          model?: string
          operation?: string
          provider?: string
          status?: string
          tokens_input?: number
          tokens_output?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          amount: number
          created_at: string
          currency: string
          end_date: string | null
          id: string
          list_id: string | null
          name: string | null
          period: string
          spent_amount: number
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          list_id?: string | null
          name?: string | null
          period?: string
          spent_amount?: number
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          list_id?: string | null
          name?: string | null
          period?: string
          spent_amount?: number
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          emoji: string | null
          id: number
          name: string
          parent_id: number | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          emoji?: string | null
          id?: number
          name: string
          parent_id?: number | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          emoji?: string | null
          id?: number
          name?: string
          parent_id?: number | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "families_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      family_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          created_by: string
          expires_at: string
          family_id: string
          id: string
          is_used: boolean
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by: string
          expires_at: string
          family_id: string
          id?: string
          is_used?: boolean
          token: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by?: string
          expires_at?: string
          family_id?: string
          id?: string
          is_used?: boolean
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_invites_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_invites_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          family_id: string
          id: string
          is_active: boolean
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          family_id: string
          id?: string
          is_active?: boolean
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          family_id?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          sort_order: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      markets: {
        Row: {
          city: string | null
          created_at: string
          id: string
          name: string
          type: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          name: string
          type?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json
          id: string
          is_read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      price_observations: {
        Row: {
          confidence: number
          created_at: string
          currency: string
          id: string
          market_id: string | null
          observed_at: string
          price: number
          product_id: string
          reported_by: string | null
          source: string
          store_id: string | null
          unit: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          currency?: string
          id?: string
          market_id?: string | null
          observed_at?: string
          price: number
          product_id: string
          reported_by?: string | null
          source: string
          store_id?: string | null
          unit?: string
        }
        Update: {
          confidence?: number
          created_at?: string
          currency?: string
          id?: string
          market_id?: string | null
          observed_at?: string
          price?: number
          product_id?: string
          reported_by?: string | null
          source?: string
          store_id?: string | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_observations_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_observations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_observations_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_observations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_aliases: {
        Row: {
          alias: string
          created_at: string
          id: string
          language: string
          product_id: string
        }
        Insert: {
          alias: string
          created_at?: string
          id?: string
          language?: string
          product_id: string
        }
        Update: {
          alias?: string
          created_at?: string
          id?: string
          language?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_aliases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: number | null
          created_at: string
          default_unit: string
          id: string
          name: string
          normalized_name: string
        }
        Insert: {
          category_id?: number | null
          created_at?: string
          default_unit?: string
          id?: string
          name: string
          normalized_name: string
        }
        Update: {
          category_id?: number | null
          created_at?: string
          default_unit?: string
          id?: string
          name?: string
          normalized_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_history: {
        Row: {
          created_at: string
          currency: string
          id: string
          item_name: string
          price: number | null
          product_id: string | null
          purchased_at: string
          quantity: number
          store_id: string | null
          unit: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          item_name: string
          price?: number | null
          product_id?: string | null
          purchased_at?: string
          quantity?: number
          store_id?: string | null
          unit?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          item_name?: string
          price?: number | null
          product_id?: string | null
          purchased_at?: string
          quantity?: number
          store_id?: string | null
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_history_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_items: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          interval_days: number
          last_added_at: string | null
          list_id: string | null
          name: string
          next_due_at: string | null
          product_id: string | null
          quantity: number
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          interval_days?: number
          last_added_at?: string | null
          list_id?: string | null
          name: string
          next_due_at?: string | null
          product_id?: string | null
          quantity?: number
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          interval_days?: number
          last_added_at?: string | null
          list_id?: string | null
          name?: string
          next_due_at?: string | null
          product_id?: string | null
          quantity?: number
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_completed: boolean
          remind_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          remind_at: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          remind_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_items: {
        Row: {
          actual_price: number | null
          category_id: number | null
          client_mutation_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          deleted_at: string | null
          estimated_price: number | null
          id: string
          is_purchased: boolean
          list_id: string
          name: string
          normalized_name: string
          note: string | null
          priority: number
          product_id: string | null
          purchased_at: string | null
          purchased_by: string | null
          quantity: number
          unit: string
          updated_at: string
          version: number
        }
        Insert: {
          actual_price?: number | null
          category_id?: number | null
          client_mutation_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          estimated_price?: number | null
          id?: string
          is_purchased?: boolean
          list_id: string
          name: string
          normalized_name?: string
          note?: string | null
          priority?: number
          product_id?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          quantity?: number
          unit?: string
          updated_at?: string
          version?: number
        }
        Update: {
          actual_price?: number | null
          category_id?: number | null
          client_mutation_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          estimated_price?: number | null
          id?: string
          is_purchased?: boolean
          list_id?: string
          name?: string
          normalized_name?: string
          note?: string | null
          priority?: number
          product_id?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          quantity?: number
          unit?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_items_purchased_by_fkey"
            columns: ["purchased_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_list_members: {
        Row: {
          added_by: string | null
          created_at: string
          id: string
          joined_at: string
          list_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          id?: string
          joined_at?: string
          list_id: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          id?: string
          joined_at?: string
          list_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_members_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_members_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          color: string
          created_at: string
          deleted_at: string | null
          emoji: string
          family_id: string | null
          id: string
          is_archived: boolean
          is_default: boolean
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          deleted_at?: string | null
          emoji?: string
          family_id?: string | null
          id?: string
          is_archived?: boolean
          is_default?: boolean
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          deleted_at?: string | null
          emoji?: string
          family_id?: string | null
          id?: string
          is_archived?: boolean
          is_default?: boolean
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_lists_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_reorder_events: {
        Row: {
          confidence: number
          created_at: string
          estimated_interval_days: number
          id: string
          last_purchase_at: string
          next_expected_at: string
          product_id: string
          product_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          estimated_interval_days?: number
          id?: string
          last_purchase_at: string
          next_expected_at: string
          product_id: string
          product_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          estimated_interval_days?: number
          id?: string
          last_purchase_at?: string
          next_expected_at?: string
          product_id?: string
          product_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_reorder_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_reorder_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          name: string
          type: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name: string
          type?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          ai_enabled: boolean
          city: string | null
          created_at: string
          currency: string | null
          id: string
          language: string | null
          notification_preferences: Json
          notifications_enabled: boolean
          theme: string
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_enabled?: boolean
          city?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          language?: string | null
          notification_preferences?: Json
          notifications_enabled?: boolean
          theme?: string
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_enabled?: boolean
          city?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          language?: string | null
          notification_preferences?: Json
          notifications_enabled?: boolean
          theme?: string
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          currency: string
          deleted_at: string | null
          first_name: string
          id: string
          is_active: boolean
          language: string
          last_name: string | null
          last_seen_at: string | null
          telegram_user_id: number
          timezone: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          first_name: string
          id?: string
          is_active?: boolean
          language?: string
          last_name?: string | null
          last_seen_at?: string | null
          telegram_user_id: number
          timezone?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          first_name?: string
          id?: string
          is_active?: boolean
          language?: string
          last_name?: string | null
          last_seen_at?: string | null
          telegram_user_id?: number
          timezone?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_app_user_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
