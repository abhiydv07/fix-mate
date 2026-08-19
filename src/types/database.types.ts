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
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: 'customer' | 'provider' | 'admin';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'customer' | 'provider' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'customer' | 'provider' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          provider_id: string | null;
          category_id: string;
          status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
          scheduled_at: string;
          address: string;
          total_amount: number;
          payment_method: string;
          payment_status: 'pending' | 'paid' | 'refunded';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          provider_id?: string | null;
          category_id: string;
          status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
          scheduled_at: string;
          address: string;
          total_amount: number;
          payment_method?: string;
          payment_status?: 'pending' | 'paid' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          provider_id?: string | null;
          category_id?: string;
          status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
          scheduled_at?: string;
          address?: string;
          total_amount?: number;
          payment_method?: string;
          payment_status?: 'pending' | 'paid' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
