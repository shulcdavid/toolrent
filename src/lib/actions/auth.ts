"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendConfirmationEmail, sendPasswordResetEmail } from "@/lib/email";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const lang = (formData.get("lang") as string) ?? "en";

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const isNotConfirmed = error.message.toLowerCase().includes("not confirmed");
    const extra = isNotConfirmed ? `&email=${encodeURIComponent(email)}` : "";
    redirect(`/${lang}/auth/login?error=${encodeURIComponent(error.message)}${extra}`);
  }

  redirect(`/${lang}/dashboard`);
}

export async function register(formData: FormData) {
  const admin = createAdminClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;
  const username = formData.get("username") as string;
  const city = formData.get("city") as string;
  const country = formData.get("country") as string;
  const lang = (formData.get("lang") as string) ?? "en";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // 1. Create user (unconfirmed) — bypasses Supabase SMTP entirely
  const { data: userData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name, username, city, country },
    email_confirm: false,
  });

  if (createError) {
    redirect(`/${lang}/auth/register?error=${encodeURIComponent(createError.message)}`);
  }

  // 1b. Save username & country to profile (trigger creates the row but doesn't know these fields)
  if (userData.user) {
    await (admin as any)
      .from("profiles")
      .update({ username, country })
      .eq("id", userData.user.id);
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

  redirect(`/${lang}/auth/register?success=confirm&email=${encodeURIComponent(email)}`);
}

export async function resendConfirmation(formData: FormData) {
  const admin = createAdminClient();
  const email = formData.get("email") as string;
  const lang = (formData.get("lang") as string) ?? "en";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/${lang}/dashboard`,
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    redirect(`/${lang}/auth/register?success=confirm&email=${encodeURIComponent(email)}&error=${encodeURIComponent("Could not resend. Please try again later.")}`);
  }

  try {
    await sendConfirmationEmail({
      to: email,
      name: "",
      confirmUrl: linkData.properties.action_link,
      lang,
    });
  } catch (emailErr) {
    console.error("Failed to resend confirmation email:", emailErr);
  }

  redirect(`/${lang}/auth/register?success=confirm&email=${encodeURIComponent(email)}&resent=1`);
}

export async function requestPasswordReset(formData: FormData) {
  const admin = createAdminClient();
  const email = formData.get("email") as string;
  const lang = (formData.get("lang") as string) ?? "en";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/${lang}/auth/reset-password`,
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    redirect(`/${lang}/auth/forgot-password?error=${encodeURIComponent("Could not send reset email. Is that email registered?")}`);
  }

  try {
    await sendPasswordResetEmail({ to: email, resetUrl: linkData.properties.action_link, lang });
  } catch (err) {
    console.error("Failed to send password reset email:", err);
  }

  redirect(`/${lang}/auth/forgot-password?sent=1&email=${encodeURIComponent(email)}`);
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const lang = (formData.get("lang") as string) ?? "en";

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/${lang}/auth/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.auth.signOut();
  redirect(`/${lang}/auth/login?message=${encodeURIComponent("Password updated. Please log in with your new password.")}`);
}

export async function logout(formData: FormData) {
  const supabase = await createClient();
  const lang = (formData.get("lang") as string) ?? "en";
  await supabase.auth.signOut();
  redirect(`/${lang}`);
}
