import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/ProfileForm";
import { DeleteAccountForm } from "@/components/DeleteAccountForm";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { PaymentSection } from "@/components/PaymentSection";
import { ChangeEmailForm } from "@/components/ChangeEmailForm";
import { ChangePhoneForm } from "@/components/ChangePhoneForm";
import { canChangeIdentity, nextEditDate } from "@/lib/utils";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    saved?: string;
    error?: string;
    delete_error?: string;
    password_saved?: string;
    password_error?: string;
    email_sent?: string;
    email_error?: string;
    phone_otp_sent?: string;
    phone_error?: string;
  }>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  if (!hasLocale(lang)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/auth/login`);

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const dict = await getDictionary(lang as Locale);

  const canName = canChangeIdentity(profile?.full_name_changed_at ?? null);
  const canUsername = canChangeIdentity(profile?.username_changed_at ?? null, 1); // monthly
  const nameUntil = nextEditDate(profile?.full_name_changed_at ?? null, 12, lang);
  const usernameUntil = nextEditDate(profile?.username_changed_at ?? null, 1, lang);

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-10">
      <Link
        href={`/${lang}/dashboard`}
        className="inline-flex items-center gap-1.5 text-sm text-[#20201f]/65 hover:text-[#20201f] mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> {dict.common.back}
      </Link>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-[#20201f]/75 mb-1 font-outfit">
          {lang === "lt" ? "Paskyra" : "Account"}
        </p>
        <h1 className="font-outfit text-2xl font-bold text-[#20201f]">{dict.profile.title}</h1>
      </div>

      {/* Main profile fields */}
      <ProfileForm
        profile={profile}
        userId={user.id}
        email={user.email ?? ""}
        lang={lang as Locale}
        dict={dict}
        canChangeName={canName}
        canChangeUsername={canUsername}
        nameLockedUntil={nameUntil}
        usernameLockedUntil={usernameUntil}
        saved={sp.saved === "1"}
        error={sp.error}
      />

      <div className="mt-4 flex flex-col gap-3">
        {/* Email */}
        <ChangeEmailForm
          lang={lang}
          currentEmail={user.email ?? ""}
          emailSent={sp.email_sent === "1"}
          error={sp.email_error ? decodeURIComponent(sp.email_error) : undefined}
        />

        {/* Phone */}
        <ChangePhoneForm
          lang={lang}
          currentPhone={profile?.phone ?? null}
          otpSent={sp.phone_otp_sent === "1"}
          error={sp.phone_error ? decodeURIComponent(sp.phone_error) : undefined}
        />

        {/* Payment card */}
        <PaymentSection lang={lang} />

        {/* Password */}
        <ChangePasswordForm
          lang={lang}
          saved={sp.password_saved === "1"}
          error={sp.password_error ? decodeURIComponent(sp.password_error) : undefined}
        />

        {/* Delete account */}
        <DeleteAccountForm
          lang={lang}
          email={user.email ?? ""}
          deleteError={sp.delete_error ? decodeURIComponent(sp.delete_error) : undefined}
        />
      </div>
    </div>
  );
}
