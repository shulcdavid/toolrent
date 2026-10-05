"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleFavourite(listingId: string): Promise<{ success: boolean; isFavourited: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, isFavourited: false };

  const db = supabase as any;

  const { data: existing } = await db
    .from("favourites")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    await db.from("favourites").delete().eq("id", existing.id);
    return { success: true, isFavourited: false };
  } else {
    await db.from("favourites").insert({ user_id: user.id, listing_id: listingId });
    return { success: true, isFavourited: true };
  }
}
