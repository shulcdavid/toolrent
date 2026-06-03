import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/ProfileForm";
import { canChangeIdentity, nextEditDate } from "@/lib/utils";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { lang } = await params;
  const { saved, error } = await searchParams;
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
  const canUsername = canChangeIdentity(profile?.username_changed_at ?? null);
  const nameUntil = nextEditDate(profile?.full_name_changed_at ?? null);
  const usernameUntil = nextEditDate(profile?.username_changed_at ?? null);

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-10">
      <Link
        href={`/${lang}/dashboard`}
        className="inline-flex items-center gap-1.5 text-sm text-[#20201f]/50 hover:text-[#20201f] mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> {dict.common.back}
      </Link>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-[#20201f]/40 mb-1 font-outfit">
          {lang === "lt" ? "Paskyra" : "Account"}
        </p>
        <h1 className="font-outfit text-2xl font-bold text-[#20201f]">{dict.profile.title}</h1>
      </div>

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
        saved={saved === "1"}
        error={error}
      />
    </div>
  );
}
