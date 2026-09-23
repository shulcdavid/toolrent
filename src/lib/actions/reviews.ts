"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const lang = (formData.get("lang") as string) ?? "en";

  if (!user) redirect(`/${lang}/auth/login`);

  const bookingId = formData.get("booking_id") as string;
  const listingId = formData.get("listing_id") as string;
  const rating = Number(formData.get("rating"));
  const comment = ((formData.get("comment") as string) ?? "").trim();

  if (!bookingId || !listingId || !rating || rating < 1 || rating > 5) {
    redirect(`/${lang}/dashboard?review_error=1`);
  }

  const db = supabase as any;

  const { data: booking } = await db
    .from("bookings")
    .select("renter_id, status")
    .eq("id", bookingId)
    .single();

  if (!booking || booking.renter_id !== user.id || booking.status !== "completed") {
    redirect(`/${lang}/dashboard?review_error=1`);
  }

  const { data: existing } = await db
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("reviewer_id", user.id)
    .maybeSingle();

  if (existing) redirect(`/${lang}/dashboard?review_error=1`);

  const { data: listing } = await db
    .from("listings")
    .select("user_id")
    .eq("id", listingId)
    .single();

  await db.from("reviews").insert({
    booking_id: bookingId,
    listing_id: listingId,
    reviewer_id: user.id,
    reviewee_id: listing?.user_id,
    rating,
    comment: comment || null,
  });

  redirect(`/${lang}/dashboard?review_sent=1`);
}
