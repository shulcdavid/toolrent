"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendConfirmationEmail } from "@/lib/email";

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
  const admin = createAdminClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;
  const city = formData.get("city") as string;
  const lang = (formData.get("lang") as string) ?? "en";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // 1. Create user (unconfirmed) — bypasses Supabase SMTP entirely
  const { data: userData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name, city },
    email_confirm: false,
  });

  if (createError) {
    redirect(`/${lang}/auth/register?error=${encodeURIComponent(createError.message)}`);
  }

  // 2. Generate a confirmation link via admin API
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/${lang}/dashboard`,
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    redirect(`/${lang}/auth/register?error=${encodeURIComponent("Failed to generate confirmation link.")}`);
  }

  // 3. Send the confirmation email via Resend (not Supabase SMTP)
  try {
    await sendConfirmationEmail({
      to: email,
      name: full_name,
      confirmUrl: linkData.properties.action_link,
      lang,
    });
  } catch (emailErr) {
    console.error("Failed to send confirmation email:", emailErr);
    // Don't block the user — show the check-email screen anyway
  }

  redirect(`/${lang}/auth/register?success=confirm`);
}

export async function logout(formData: FormData) {
  const supabase = await createClient();
  const lang = (formData.get("lang") as string) ?? "en";
  await supabase.auth.signOut();
  redirect(`/${lang}`);
}
