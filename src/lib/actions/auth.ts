"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const lang = (formData.get("lang") as string) ?? "en";

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/${lang}/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${lang}/dashboard`);
}

export async function register(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;
  const city = formData.get("city") as string;
  const lang = (formData.get("lang") as string) ?? "en";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, city },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/${lang}/dashboard`,
    },
  });

  if (error) {
    redirect(`/${lang}/auth/register?error=${encodeURIComponent(error.message)}`);
  }

  // If email confirmation is required, the session will be null — show a "check your email" page.
  // If auto-confirm is on (e.g. during local dev), the session is set and we go straight to dashboard.
  if (data.session) {
    redirect(`/${lang}/dashboard`);
  }

  redirect(`/${lang}/auth/register?success=confirm`);
}

export async function logout(formData: FormData) {
  const supabase = await createClient();
  const lang = (formData.get("lang") as string) ?? "en";
  await supabase.auth.signOut();
  redirect(`/${lang}`);
}
