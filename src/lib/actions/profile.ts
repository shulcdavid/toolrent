"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canChangeIdentity } from "@/lib/utils";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const lang = (formData.get("lang") as string) ?? "en";

  if (!user) redirect(`/${lang}/auth/login`);

  const db = supabase as any;

  // Fetch current profile to check change timestamps
  const { data: current } = await db
    .from("profiles")
    .select("full_name_changed_at, username_changed_at, phone_changed_at")
    .eq("id", user.id)
    .single();

  const updates: Record<string, unknown> = {
    city: (formData.get("city") as string) || null,
    country: (formData.get("country") as string) || null,
    avatar_url: (formData.get("avatar_url") as string) || null,
  };

  const newFullName = formData.get("full_name") as string;
  const newUsername = formData.get("username") as string;
  const newPhone = formData.get("phone") as string;

  // Only update identity fields if allowed (once per year)
  if (canChangeIdentity(current?.full_name_changed_at)) {
    updates.full_name = newFullName || null;
    updates.full_name_changed_at = new Date().toISOString();
  }

  if (canChangeIdentity(current?.username_changed_at)) {
    updates.username = newUsername || null;
    updates.username_changed_at = new Date().toISOString();
  }

  // Phone: editable once per 6 months
  if (canChangeIdentity(current?.phone_changed_at, 6)) {
    updates.phone = newPhone || null;
    updates.phone_changed_at = new Date().toISOString();
  }

  const { error } = await db
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    redirect(`/${lang}/profile?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${lang}/profile?saved=1`);
}
