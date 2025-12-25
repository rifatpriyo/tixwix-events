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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      booking_items: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          price: number
          seat_id: string | null
          ticket_type: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          price: number
          seat_id?: string | null
          ticket_type: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          price?: number
          seat_id?: string | null
          ticket_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          booking_type: string
          concert_id: string | null
          concert_section_id: string | null
          created_at: string
          discount_amount: number | null
          final_amount: number
          id: string
          payment_method: string | null
          payment_status: string | null
          promo_code: string | null
          showtime_id: string | null
          status: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          booking_date?: string
          booking_type: string
          concert_id?: string | null
          concert_section_id?: string | null
          created_at?: string
          discount_amount?: number | null
          final_amount: number
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          promo_code?: string | null
          showtime_id?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          booking_date?: string
          booking_type?: string
          concert_id?: string | null
          concert_section_id?: string | null
          created_at?: string
          discount_amount?: number | null
          final_amount?: number
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          promo_code?: string | null
          showtime_id?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "concerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_concert_section_id_fkey"
            columns: ["concert_section_id"]
            isOneToOne: false
            referencedRelation: "concert_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_showtime_id_fkey"
            columns: ["showtime_id"]
            isOneToOne: false
            referencedRelation: "showtimes"
            referencedColumns: ["id"]
          },
        ]
      }
      concert_sections: {
        Row: {
          available_tickets: number
          concert_id: string
          created_at: string
          id: string
          name: string
          price: number
          total_tickets: number
        }
        Insert: {
          available_tickets: number
          concert_id: string
          created_at?: string
          id?: string
          name: string
          price: number
          total_tickets: number
        }
        Update: {
          available_tickets?: number
          concert_id?: string
          created_at?: string
          id?: string
          name?: string
          price?: number
          total_tickets?: number
        }
        Relationships: [
          {
            foreignKeyName: "concert_sections_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "concerts"
            referencedColumns: ["id"]
          },
        ]
      }
      concerts: {
        Row: {
          artist: string
          available_tickets: number
          created_at: string
          date: string
          description: string | null
          id: string
          poster_url: string | null
          price_max: number
          price_min: number
          status: string | null
          title: string
          total_tickets: number
          updated_at: string
          venue_id: string | null
          venue_name: string
        }
        Insert: {
          artist: string
          available_tickets: number
          created_at?: string
          date: string
          description?: string | null
          id?: string
          poster_url?: string | null
          price_max: number
          price_min: number
          status?: string | null
          title: string
          total_tickets: number
          updated_at?: string
          venue_id?: string | null
          venue_name: string
        }
        Update: {
          artist?: string
          available_tickets?: number
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          poster_url?: string | null
          price_max?: number
          price_min?: number
          status?: string | null
          title?: string
          total_tickets?: number
          updated_at?: string
          venue_id?: string | null
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "concerts_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "halls"
            referencedColumns: ["id"]
          },
        ]
      }
      halls: {
        Row: {
          amenities: string[] | null
          capacity: number
          created_at: string
          description: string | null
          hall_type: string
          id: string
          image_url: string | null
          is_active: boolean | null
          location: string
          name: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          capacity: number
          created_at?: string
          description?: string | null
          hall_type: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location: string
          name: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          capacity?: number
          created_at?: string
          description?: string | null
          hall_type?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      movies: {
        Row: {
          age_rating: string | null
          cast_members: string[] | null
          created_at: string
          description: string | null
          director: string | null
          duration: number
          end_date: string | null
          genre: string[]
          id: string
          language: string | null
          poster_url: string | null
          rating: number | null
          release_date: string
          status: string | null
          title: string
          trailer_url: string | null
          updated_at: string
        }
        Insert: {
          age_rating?: string | null
          cast_members?: string[] | null
          created_at?: string
          description?: string | null
          director?: string | null
          duration: number
          end_date?: string | null
          genre: string[]
          id?: string
          language?: string | null
          poster_url?: string | null
          rating?: number | null
          release_date: string
          status?: string | null
          title: string
          trailer_url?: string | null
          updated_at?: string
        }
        Update: {
          age_rating?: string | null
          cast_members?: string[] | null
          created_at?: string
          description?: string | null
          director?: string | null
          duration?: number
          end_date?: string | null
          genre?: string[]
          id?: string
          language?: string | null
          poster_url?: string | null
          rating?: number | null
          release_date?: string
          status?: string | null
          title?: string
          trailer_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          applicable_to: string[] | null
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_purchase: number | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          applicable_to?: string[] | null
          code: string
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_purchase?: number | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from: string
          valid_until: string
        }
        Update: {
          applicable_to?: string[] | null
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_purchase?: number | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          concert_id: string | null
          content: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          movie_id: string | null
          rating: number
          review_type: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          concert_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          movie_id?: string | null
          rating: number
          review_type: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          concert_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          movie_id?: string | null
          rating?: number
          review_type?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "concerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      seats: {
        Row: {
          created_at: string
          hall_id: string
          id: string
          is_active: boolean | null
          price_multiplier: number | null
          row_label: string
          seat_number: number
          seat_type: string | null
        }
        Insert: {
          created_at?: string
          hall_id: string
          id?: string
          is_active?: boolean | null
          price_multiplier?: number | null
          row_label: string
          seat_number: number
          seat_type?: string | null
        }
        Update: {
          created_at?: string
          hall_id?: string
          id?: string
          is_active?: boolean | null
          price_multiplier?: number | null
          row_label?: string
          seat_number?: number
          seat_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seats_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: false
            referencedRelation: "halls"
            referencedColumns: ["id"]
          },
        ]
      }
      showtimes: {
        Row: {
          available_seats: number
          created_at: string
          end_time: string
          format: string | null
          hall_id: string
          id: string
          is_active: boolean | null
          movie_id: string
          price: number
          start_time: string
          total_seats: number
          updated_at: string
        }
        Insert: {
          available_seats: number
          created_at?: string
          end_time: string
          format?: string | null
          hall_id: string
          id?: string
          is_active?: boolean | null
          movie_id: string
          price: number
          start_time: string
          total_seats: number
          updated_at?: string
        }
        Update: {
          available_seats?: number
          created_at?: string
          end_time?: string
          format?: string | null
          hall_id?: string
          id?: string
          is_active?: boolean | null
          movie_id?: string
          price?: number
          start_time?: string
          total_seats?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "showtimes_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: false
            referencedRelation: "halls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showtimes_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
