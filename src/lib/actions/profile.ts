"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canChangeIdentity } from "@/lib/utils";
import { sendSms } from "@/lib/sms";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const lang = (formData.get("lang") as string) ?? "en";

  if (!user) redirect(`/${lang}/auth/login`);

  const db = supabase as any;

  const { data: current } = await db
    .from("profiles")
    .select("full_name_changed_at, username_changed_at")
    .eq("id", user.id)
    .single();

  const updates: Record<string, unknown> = {
    city: (formData.get("city") as string) || null,
    country: (formData.get("country") as string) || null,
    avatar_url: (formData.get("avatar_url") as string) || null,
  };

  const newFullName = formData.get("full_name") as string;
  const newUsername = formData.get("username") as string;

  if (canChangeIdentity(current?.full_name_changed_at)) {
    updates.full_name = newFullName || null;
    updates.full_name_changed_at = new Date().toISOString();
  }

  // Username: editable once per month
  if (canChangeIdentity(current?.username_changed_at, 1)) {
    updates.username = newUsername || null;
    updates.username_changed_at = new Date().toISOString();
  }

  const { error } = await db.from("profiles").update(updates).eq("id", user.id);

  if (error) {
    redirect(`/${lang}/profile?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${lang}/profile?saved=1`);
}

// ── Password ─────────────────────────────────────────────────────────────────

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const lang = (formData.get("lang") as string) ?? "en";
  if (!user) redirect(`/${lang}/auth/login`);

  const oldPassword = formData.get("old_password") as string;
  const newPassword = formData.get("new_password") as string;
  const confirm = formData.get("confirm_password") as string;

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: oldPassword,
  });

  if (signInError) {
    redirect(`/${lang}/profile?password_error=${encodeURIComponent(
      lang === "lt" ? "Dabartinis slaptažodis neteisingas" : "Current password is incorrect"
    )}`);
  }

  if (!newPassword || newPassword.length < 8) {
    redirect(`/${lang}/profile?password_error=${encodeURIComponent(
      lang === "lt" ? "Slaptažodis turi būti bent 8 simbolių" : "Password must be at least 8 characters"
    )}`);
  }

  if (newPassword !== confirm) {
    redirect(`/${lang}/profile?password_error=${encodeURIComponent(
      lang === "lt" ? "Slaptažodžiai nesutampa" : "Passwords do not match"
    )}`);
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    redirect(`/${lang}/profile?password_error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${lang}/profile?password_saved=1`);
}

// ── Email change ──────────────────────────────────────────────────────────────

export async function requestEmailChange(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const lang = (formData.get("lang") as string) ?? "en";
  if (!user) redirect(`/${lang}/auth/login`);

  const newEmail = formData.get("new_email") as string;

  if (!newEmail || !newEmail.includes("@")) {
    redirect(`/${lang}/profile?email_error=${encodeURIComponent(
      lang === "lt" ? "Neteisingas el. pašto adresas" : "Invalid email address"
    )}`);
  }

  const { error } = await supabase.auth.updateUser({ email: newEmail });

  if (error) {
    redirect(`/${lang}/profile?email_error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${lang}/profile?email_sent=1`);
}

// ── Phone OTP ─────────────────────────────────────────────────────────────────

export async function requestPhoneOtp(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const lang = (formData.get("lang") as string) ?? "en";
  if (!user) redirect(`/${lang}/auth/login`);

  const newPhone = (formData.get("new_phone") as string).trim();

  if (!newPhone) {
    redirect(`/${lang}/profile?phone_error=${encodeURIComponent(
      lang === "lt" ? "Įveskite telefono numerį" : "Phone number required"
    )}`);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { error: dbError } = await (supabase as any)
    .from("profiles")
    .update({ phone_pending: newPhone, phone_otp: otp, phone_otp_expires_at: expiresAt })
    .eq("id", user.id);

  if (dbError) {
    redirect(`/${lang}/profile?phone_error=${encodeURIComponent(dbError.message)}`);
  }

  const lt = lang === "lt";
  const smsResult = await sendSms(
    newPhone,
    lt
      ? `Rente patvirtinimo kodas: ${otp}. Galioja 15 min.`
      : `Your Rente verification code: ${otp}. Expires in 15 min.`
  );

  if (!smsResult.ok) {
    redirect(`/${lang}/profile?phone_error=${encodeURIComponent(smsResult.error ?? "SMS failed")}`);
  }

  redirect(`/${lang}/profile?phone_otp_sent=1`);
}

export async function verifyPhoneOtp(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const lang = (formData.get("lang") as string) ?? "en";
  if (!user) redirect(`/${lang}/auth/login`);

  const enteredOtp = (formData.get("otp") as string).trim();

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("phone_pending, phone_otp, phone_otp_expires_at")
    .eq("id", user.id)
    .single();

  if (!profile?.phone_otp || !profile?.phone_pending) {
    redirect(`/${lang}/profile?phone_error=${encodeURIComponent(
      lang === "lt" ? "Nėra laukiančio pakeitimo. Bandykite iš naujo." : "No pending change found. Please try again."
    )}`);
  }

  if (new Date(profile.phone_otp_expires_at) < new Date()) {
    redirect(`/${lang}/profile?phone_error=${encodeURIComponent(
      lang === "lt" ? "Kodas baigė galioti. Paprašykite naujo." : "Code expired. Please request a new one."
    )}`);
  }

  if (profile.phone_otp !== enteredOtp) {
    redirect(`/${lang}/profile?phone_otp_sent=1&phone_error=${encodeURIComponent(
      lang === "lt" ? "Neteisingas kodas" : "Invalid code"
    )}`);
  }

  await (supabase as any)
    .from("profiles")
    .update({
      phone: profile.phone_pending,
      phone_changed_at: new Date().toISOString(),
      phone_pending: null,
      phone_otp: null,
      phone_otp_expires_at: null,
    })
    .eq("id", user.id);

  redirect(`/${lang}/profile?saved=1`);
}
