"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteAccount(formData: FormData) {
  const lang = (formData.get("lang") as string) ?? "en";
  const confirmedEmail = (formData.get("email_confirm") as string ?? "").trim().toLowerCase();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${lang}/auth/login`);

  // Email must match — guards against accidental or confused deletions
  if (confirmedEmail !== user.email?.toLowerCase()) {
    redirect(`/${lang}/profile?delete_error=${encodeURIComponent("Email does not match. Account not deleted.")}`);
  }

  // Sign out first so cookies are cleared, then delete via admin client
  await supabase.auth.signOut();

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    // Can't redirect to profile — user is signed out now, go to login with error
    redirect(`/${lang}/auth/login?error=${encodeURIComponent("Failed to delete account. Please contact support.")}`);
  }

  redirect(`/${lang}?deleted=1`);
}
