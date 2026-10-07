"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { daysBetween, calcServiceFee } from "@/lib/utils";
import { sendBookingRequestEmail, sendBookingStatusEmail, sendPaymentReceivedEmail } from "@/lib/email";
import { getStripe } from "@/lib/stripe";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rente.lt";

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
  const proposedPriceRaw = formData.get("proposed_price");
  const proposedPrice = proposedPriceRaw ? Number(proposedPriceRaw) : null;
  const days = daysBetween(startDate, endDate);
  const toolCost = days * pricePerDay;
  const serviceFee = calcServiceFee(toolCost);
  const db = supabase as any;

  const { error } = await db.from("bookings").insert({
    listing_id: listingId,
    renter_id: user.id,
    start_date: startDate,
    end_date: endDate,
    tool_price: toolCost,
    service_fee: serviceFee,
    total_price: toolCost + serviceFee,
    message,
    proposed_price: proposedPrice,
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

export async function updateBookingStatus(bookingId: string, status: "approved" | "rejected" | "cancelled" | "completed", lang: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const db = supabase as any;
  await db.from("bookings").update({ status }).eq("id", bookingId);

  // Charge the renter's saved card when a booking is approved
  if (status === "approved") {
    try {
      const { data: booking } = await db
        .from("bookings")
        .select("renter_id, total_price")
        .eq("id", bookingId)
        .single();

      const { data: renterProfile } = await db
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", booking?.renter_id)
        .single();

      if (renterProfile?.stripe_customer_id) {
        const stripe = getStripe();
        const paymentMethods = await stripe.paymentMethods.list({
          customer: renterProfile.stripe_customer_id,
          type: "card",
          limit: 1,
        });

        if (paymentMethods.data.length > 0) {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round((booking.total_price ?? 0) * 100),
            currency: "eur",
            customer: renterProfile.stripe_customer_id,
            payment_method: paymentMethods.data[0].id,
            confirm: true,
            off_session: true,
          });
          const { data: bookingFull } = await db
            .from("bookings")
            .select("listing_id, listings(title)")
            .eq("id", bookingId)
            .single();
          await Promise.all([
            db.from("bookings").update({ stripe_payment_intent_id: paymentIntent.id }).eq("id", bookingId),
            db.from("listings").update({ is_available: false }).eq("id", bookingFull?.listing_id),
          ]);
          // Email the owner: payment confirmed
          try {
            const { data: renterProfileFull } = await db.from("profiles").select("full_name").eq("id", booking?.renter_id).single();
            const { data: ownerProfile } = await db.from("profiles").select("full_name").eq("id", user.id).single();
            if (user.email) {
              await sendPaymentReceivedEmail({
                ownerEmail: user.email,
                ownerName: ownerProfile?.full_name ?? "there",
                renterName: renterProfileFull?.full_name ?? "Renter",
                listingTitle: bookingFull?.listings?.title ?? "",
                amount: booking.total_price ?? 0,
                listingUrl: `${BASE_URL}/${lang}/listings/${bookingFull?.listing_id}`,
              });
            }
          } catch (emailErr) {
            console.error("Failed to send payment confirmation email:", emailErr);
          }
        }
      }
    } catch (err) {
      console.error("[Stripe] Failed to charge renter:", err);
    }
  }

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

export async function retryBookingPayment(bookingId: string, lang: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/auth/login`);

  const db = supabase as any;
  const { data: booking } = await db
    .from("bookings")
    .select("renter_id, total_price, stripe_payment_intent_id")
    .eq("id", bookingId)
    .single();

  // All safety-check redirects are OUTSIDE try/catch so they work correctly
  if (!booking || booking.renter_id !== user.id || booking.stripe_payment_intent_id) {
    redirect(`/${lang}/dashboard`);
  }

  const { data: profile } = await db
    .from("profiles")
    .select("stripe_customer_id, full_name")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) redirect(`/${lang}/profile`);

  let charged = false;

  try {
    const stripe = getStripe();
    const paymentMethods = await stripe.paymentMethods.list({
      customer: profile.stripe_customer_id,
      type: "card",
      limit: 1,
    });

    if (paymentMethods.data.length > 0) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round((booking.total_price ?? 0) * 100),
        currency: "eur",
        customer: profile.stripe_customer_id,
        payment_method: paymentMethods.data[0].id,
        confirm: true,
        off_session: true,
      });

      const { data: fullBooking } = await db
        .from("bookings")
        .select("listing_id, listings(title, user_id)")
        .eq("id", bookingId)
        .single();

      await Promise.all([
        db.from("bookings").update({ stripe_payment_intent_id: paymentIntent.id }).eq("id", bookingId),
        db.from("listings").update({ is_available: false }).eq("id", fullBooking?.listing_id),
      ]);

      charged = true;

      // Email owner: payment received
      try {
        const admin = createAdminClient();
        const { data: ownerAuth } = await admin.auth.admin.getUserById(fullBooking?.listings?.user_id);
        const { data: ownerProfile } = await db.from("profiles").select("full_name").eq("id", fullBooking?.listings?.user_id).single();
        if (ownerAuth?.user?.email) {
          await sendPaymentReceivedEmail({
            ownerEmail: ownerAuth.user.email,
            ownerName: ownerProfile?.full_name ?? "there",
            renterName: profile?.full_name ?? "Renter",
            listingTitle: fullBooking?.listings?.title ?? "",
            amount: booking.total_price ?? 0,
            listingUrl: `${BASE_URL}/${lang}/listings/${fullBooking?.listing_id}`,
          });
        }
      } catch (err) {
        console.error("Failed to send payment email:", err);
      }
    }
  } catch (err) {
    console.error("[Stripe] Retry charge failed:", err);
  }

  // Redirects are OUTSIDE try/catch — Next.js redirect() throws NEXT_REDIRECT internally
  // which would be swallowed if placed inside a catch block
  if (!charged) redirect(`/${lang}/profile`);
  redirect(`/${lang}/dashboard`);
}
