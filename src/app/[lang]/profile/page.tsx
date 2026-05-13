import { redirect, notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/ProfileForm";

export default async function ProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/auth/login`);

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {lang === "lt" ? "Mano profilis" : "My Profile"}
      </h1>
      <ProfileForm profile={profile} lang={lang as Locale} dict={dict} />
    </div>
  );
}
