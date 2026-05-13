"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { daysBetween } from "@/lib/utils";

export async function createBooking(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const lang = (formData.get("lang") as string) ?? "en";
  const listingId = formData.get("listing_id") as string;

  if (!user) redirect(`/${lang}/auth/login`);

  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;
  const pricePerDay = Number(formData.get("price_per_day"));
  const days = daysBetween(startDate, endDate);

  const db = supabase as any;
  const { error } = await db.from("bookings").insert({
    listing_id: listingId,
    renter_id: user.id,
    start_date: startDate,
    end_date: endDate,
    total_price: days * pricePerDay,
    message: formData.get("message") as string,
    status: "pending",
  });

  if (error) redirect(`/${lang}/listings/${listingId}?error=${encodeURIComponent(error.message)}`);
  redirect(`/${lang}/listings/${listingId}?booked=1`);
}

export async function updateBookingStatus(bookingId: string, status: "approved" | "rejected" | "cancelled", lang: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await (supabase as any).from("bookings").update({ status }).eq("id", bookingId);
  redirect(`/${lang}/dashboard`);
}
