"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createListing(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const lang = (formData.get("lang") as string) ?? "en";

  if (!user) redirect(`/${lang}/auth/login`);

  const db = supabase as any;
  const { data, error } = await db.from("listings").insert({
    user_id: user.id,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    categories: formData.getAll("categories") as string[],
    price_per_day: Number(formData.get("price_per_day")),
    deposit: Number(formData.get("deposit") ?? 0),
    city: formData.get("city") as string,
    address: formData.get("address") as string,
    images: [],
    is_available: formData.get("is_available") === "on",
    blocked_dates: JSON.parse((formData.get("blocked_dates") as string) || "[]"),
  }).select().single();

  if (error) redirect(`/${lang}/add-listing?error=${encodeURIComponent(error.message)}`);
  redirect(`/${lang}/listings/${data.id}`);
}

export async function updateListingAvailability(listingId: string, isAvailable: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await (supabase as any).from("listings").update({ is_available: isAvailable }).eq("id", listingId).eq("user_id", user.id);
}

export async function deleteListing(listingId: string, lang: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await (supabase as any).from("listings").delete().eq("id", listingId).eq("user_id", user.id);
  redirect(`/${lang}/dashboard`);
}
