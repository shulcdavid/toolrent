export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          username: string | null;
          avatar_url: string | null;
          phone: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          price_per_day: number;
          deposit: number;
          city: string;
          address: string | null;
          images: string[];
          is_available: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["listings"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          listing_id: string;
          renter_id: string;
          start_date: string;
          end_date: string;
          total_price: number;
          status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
          message: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          reviewer_id: string;
          reviewee_id: string;
          listing_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Listing = Database["public"]["Tables"]["listings"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];

export type ListingWithProfile = Listing & { profiles: Profile };
export type BookingWithListing = Booking & { listings: ListingWithProfile };
