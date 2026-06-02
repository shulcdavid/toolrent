import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { LoginForm } from "@/components/LoginForm";
import { SocialAuth } from "@/components/SocialAuth";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const lt = lang === "lt";

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <span className="font-outfit text-2xl font-bold text-[#20201f] mb-1">Rente</span>
          <h1 className="font-outfit text-lg font-semibold text-[#20201f]">{dict.auth.login.title}</h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-6 flex flex-col gap-5">
          {/* Social buttons */}
          <SocialAuth lang={lang as Locale} />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#d4d0c8]" />
            <span className="text-xs text-[#20201f]/40 font-medium">
              {lt ? "arba" : "or"}
            </span>
            <div className="flex-1 h-px bg-[#d4d0c8]" />
          </div>

          {/* Email / password form */}
          <LoginForm dict={dict.auth.login} lang={lang as Locale} />
        </div>

        {/* Footer link */}
        <p className="mt-5 text-center text-sm text-[#20201f]/50">
          {dict.auth.login.noAccount}{" "}
          <Link
            href={`/${lang}/auth/register`}
            className="font-medium text-[#20201f] underline underline-offset-2 hover:opacity-70"
          >
            {dict.auth.login.register}
          </Link>
        </p>
      </div>
    </div>
  );
}
