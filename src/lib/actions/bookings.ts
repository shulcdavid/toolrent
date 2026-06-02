"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { daysBetween } from "@/lib/utils";
import { sendBookingRequestEmail, sendBookingStatusEmail } from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolrent.lt";

export async function createBooking(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const lang = (formData.get("lang") as string) ?? "en";
  const listingId = formData.get("listing_id") as string;

  if (!user) redirect(`/${lang}/auth/login`);

  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;
  const pricePerDay = Number(formData.get("price_per_day"));
  const message = (formData.get("message") as string) ?? "";
  const days = daysBetween(startDate, endDate);
  const db = supabase as any;

  const { error } = await db.from("bookings").insert({
    listing_id: listingId,
    renter_id: user.id,
    start_date: startDate,
    end_date: endDate,
    total_price: days * pricePerDay,
    message,
    status: "pending",
  });

  if (error) redirect(`/${lang}/listings/${listingId}?error=${encodeURIComponent(error.message)}`);

  // Send email notification to owner
  try {
    const admin = createAdminClient();
    const { data: listing } = await db.from("listings").select("title, user_id").eq("id", listingId).single();
    const { data: owner } = await db.from("profiles").select("full_name").eq("id", listing.user_id).single();
    const { data: ownerAuth } = await admin.auth.admin.getUserById(listing.user_id);
    const { data: renter } = await db.from("profiles").select("full_name").eq("id", user.id).single();

    if (ownerAuth?.user?.email) {
      await sendBookingRequestEmail({
        ownerEmail: ownerAuth.user.email,
        ownerName: owner?.full_name ?? "there",
        renterName: renter?.full_name ?? user.email ?? "Someone",
        listingTitle: listing.title,
        startDate,
        endDate,
        message,
        listingUrl: `${BASE_URL}/${lang}/listings/${listingId}`,
      });
    }
  } catch (err) {
    console.error("Failed to send booking request email:", err);
  }

  redirect(`/${lang}/listings/${listingId}?booked=1`);
}

export async function updateBookingStatus(bookingId: string, status: "approved" | "rejected" | "cancelled", lang: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const db = supabase as any;
  await db.from("bookings").update({ status }).eq("id", bookingId);

  // Send email notification to renter
  if (status === "approved" || status === "rejected") {
    try {
      const admin = createAdminClient();
      const { data: booking } = await db.from("bookings")
        .select("renter_id, listing_id, listings(title)")
        .eq("id", bookingId).single();
      const { data: renter } = await db.from("profiles").select("full_name").eq("id", booking.renter_id).single();
      const { data: renterAuth } = await admin.auth.admin.getUserById(booking.renter_id);

      if (renterAuth?.user?.email) {
        await sendBookingStatusEmail({
          renterEmail: renterAuth.user.email,
          renterName: renter?.full_name ?? "there",
          listingTitle: booking.listings?.title ?? "",
          status,
          listingUrl: `${BASE_URL}/${lang}/listings/${booking.listing_id}`,
        });
      }
    } catch (err) {
      console.error("Failed to send booking status email:", err);
    }
  }

  redirect(`/${lang}/dashboard`);
}
