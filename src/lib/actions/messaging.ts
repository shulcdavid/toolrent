"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOwnerMessageEmail } from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rente.lt";

export async function sendMessageToOwner(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  const lang = (formData.get("lang") as string) ?? "en";
  const listingId = formData.get("listing_id") as string;
  const message = (formData.get("message") as string)?.trim();

  if (!message) return { success: false, error: "Message is required" };

  try {
    const db = supabase as any;
    const { data: listing } = await db
      .from("listings")
      .select("title, user_id")
      .eq("id", listingId)
      .single();

    if (!listing) return { success: false, error: "Listing not found" };
    if (listing.user_id === user.id) return { success: false, error: "Cannot message yourself" };

    const admin = createAdminClient();
    const [{ data: ownerAuth }, { data: ownerProfile }, { data: renterProfile }] = await Promise.all([
      admin.auth.admin.getUserById(listing.user_id),
      db.from("profiles").select("full_name").eq("id", listing.user_id).single(),
      db.from("profiles").select("full_name").eq("id", user.id).single(),
    ]);

    if (!ownerAuth?.user?.email) return { success: false, error: "Could not reach owner" };

    await sendOwnerMessageEmail({
      ownerEmail: ownerAuth.user.email,
      ownerName: ownerProfile?.full_name ?? "there",
      renterName: renterProfile?.full_name ?? user.email ?? "Someone",
      renterEmail: user.email ?? "",
      listingTitle: listing.title,
      message,
      listingUrl: `${BASE_URL}/${lang}/listings/${listingId}`,
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to send message to owner:", err);
    return { success: false, error: "Failed to send. Please try again." };
  }
}
