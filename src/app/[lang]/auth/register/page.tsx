import Link from "next/link";
import { notFound } from "next/navigation";
import { MailCheck } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { RegisterForm } from "@/components/RegisterForm";
import { ResendConfirmationForm } from "@/components/ResendConfirmationForm";
import { SocialAuth } from "@/components/SocialAuth";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ success?: string; email?: string; resent?: string; error?: string }>;
}) {
  const { lang } = await params;
  const { success, email, resent, error } = await searchParams;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const lt = lang === "lt";

  // Show "check your email" screen after successful signup
  if (success === "confirm") {
    const decodedEmail = email ? decodeURIComponent(email) : "";
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm text-center flex flex-col items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eeece3] border border-[#e5e2db]">
            <MailCheck size={28} className="text-[#20201f]" />
          </div>
          <div>
            <h1 className="font-outfit text-2xl font-bold text-[#20201f] mb-2">
              {lt ? "Patikrink el. paštą" : "Check your email"}
            </h1>
            <p className="text-sm text-[#20201f]/55 leading-relaxed">
              {decodedEmail ? (
                <>
                  {lt ? "Išsiuntėme patvirtinimo nuorodą į " : "We sent a confirmation link to "}
                  <span className="font-medium text-[#20201f]/80">{decodedEmail}</span>
                  {lt ? ". Spustelk ją, kad aktyvuotum paskyrą." : ". Click it to activate your account."}
                </>
              ) : (
                lt
                  ? "Išsiuntėme patvirtinimo nuorodą. Spustelk ją, kad aktyvuotum paskyrą."
                  : "We sent you a confirmation link. Click it to activate your account."
              )}
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500 rounded-lg bg-red-50 px-3 py-2 w-full text-left">
              {decodeURIComponent(error)}
            </p>
          )}

          <p className="text-xs text-[#20201f]/40">
            {lt ? "Negauni laiško? Patikrink šlamšto aplanką." : "No email? Check your spam folder."}
          </p>

          {decodedEmail && (
            <ResendConfirmationForm
              email={decodedEmail}
              lang={lang}
              justResent={resent === "1"}
              isLt={lt}
            />
          )}

          <Link href={`/${lang}/auth/login`} className="text-sm font-medium text-[#20201f]/50 hover:text-[#20201f] transition-colors">
            {lt ? "Grįžti į prisijungimą" : "Back to login"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <span className="font-outfit text-2xl font-bold text-[#20201f] mb-1">Rente</span>
          <h1 className="font-outfit text-lg font-semibold text-[#20201f]">{dict.auth.register.title}</h1>
        </div>

        <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-6 flex flex-col gap-5">
          {/* Social buttons */}
          <SocialAuth lang={lang as Locale} />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#d4d0c8]" />
            <span className="text-xs text-[#20201f]/40 font-medium">
              {lt ? "arba el. paštu" : "or with email"}
            </span>
            <div className="flex-1 h-px bg-[#d4d0c8]" />
          </div>

          {/* Email registration form */}
          <RegisterForm dict={dict.auth.register} lang={lang as Locale} />
        </div>

        <p className="mt-5 text-center text-sm text-[#20201f]/50">
          {dict.auth.register.hasAccount}{" "}
          <Link href={`/${lang}/auth/login`} className="font-medium text-[#20201f] underline underline-offset-2 hover:opacity-70">
            {dict.auth.register.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
