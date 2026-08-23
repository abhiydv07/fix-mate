export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'customer' | 'provider' | 'admin'
          name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          role?: 'customer' | 'provider' | 'admin'
          name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'customer' | 'provider' | 'admin'
          name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          icon: string | null
          active: boolean
        }
        Insert: {
          id?: string
          name: string
          icon?: string | null
          active?: boolean
        }
        Update: {
          id?: string
          name?: string
          icon?: string | null
          active?: boolean
        }
      }
      services: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          base_price: number
          est_duration_min: number | null
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string | null
          base_price: number
          est_duration_min?: number | null
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          description?: string | null
          base_price?: number
          est_duration_min?: number | null
        }
      }
      provider_profiles: {
        Row: {
          id: string
          bio: string | null
          service_area_pincodes: string[] | null
          kyc_doc_url: string | null
          verified: boolean
          avg_rating: number
          is_available: boolean
        }
        Insert: {
          id: string
          bio?: string | null
          service_area_pincodes?: string[] | null
          kyc_doc_url?: string | null
          verified?: boolean
          avg_rating?: number
          is_available?: boolean
        }
        Update: {
          id?: string
          bio?: string | null
          service_area_pincodes?: string[] | null
          kyc_doc_url?: string | null
          verified?: boolean
          avg_rating?: number
          is_available?: boolean
        }
      }
      provider_services: {
        Row: {
          provider_id: string
          service_id: string
        }
        Insert: {
          provider_id: string
          service_id: string
        }
        Update: {
          provider_id?: string
          service_id?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string | null
          line1: string
          line2: string | null
          city: string
          pincode: string
          lat: number | null
          lng: number | null
          is_default: boolean
        }
        Insert: {
          id?: string
          user_id: string
          label?: string | null
          line1: string
          line2?: string | null
          city: string
          pincode: string
          lat?: number | null
          lng?: number | null
          is_default?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          label?: string | null
          line1?: string
          line2?: string | null
          city?: string
          pincode?: string
          lat?: number | null
          lng?: number | null
          is_default?: boolean
        }
      }
      bookings: {
        Row: {
          id: string
          customer_id: string
          provider_id: string | null
          service_id: string
          address_id: string
          status: 'pending' | 'assigned' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_at: string
          price: number
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          customer_id: string
          provider_id?: string | null
          service_id: string
          address_id: string
          status?: 'pending' | 'assigned' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_at: string
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          provider_id?: string | null
          service_id?: string
          address_id?: string
          status?: 'pending' | 'assigned' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_at?: string
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          amount: number
          method: string
          status: 'pending' | 'collected' | 'disputed'
          confirmed_by_provider: boolean
          confirmed_by_customer: boolean
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          amount: number
          method?: string
          status?: 'pending' | 'collected' | 'disputed'
          confirmed_by_provider?: boolean
          confirmed_by_customer?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          amount?: number
          method?: string
          status?: 'pending' | 'collected' | 'disputed'
          confirmed_by_provider?: boolean
          confirmed_by_customer?: boolean
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          booking_id: string
          sender_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          sender_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          sender_id?: string
          message?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string
          read?: boolean
          created_at?: string
        }
      }
      provider_locations: {
        Row: {
          provider_id: string
          lat: number
          lng: number
          updated_at: string
        }
        Insert: {
          provider_id: string
          lat: number
          lng: number
          updated_at?: string
        }
        Update: {
          provider_id?: string
          lat?: number
          lng?: number
          updated_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_type: 'flat' | 'percent'
          value: number
          valid_until: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_type: 'flat' | 'percent'
          value: number
          valid_until: string
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_type?: 'flat' | 'percent'
          value?: number
          valid_until?: string
          active?: boolean
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
