import Link from "next/link";
import { notFound } from "next/navigation";
import { MailCheck } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { RegisterForm } from "@/components/RegisterForm";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { lang } = await params;
  const { success } = await searchParams;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const lt = lang === "lt";

  // Show "check your email" screen after successful signup
  if (success === "confirm") {
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
              {lt
                ? "Išsiuntėme patvirtinimo nuorodą. Spustelk ją, kad aktyvuotum paskyrą."
                : "We sent you a confirmation link. Click it to activate your account."}
            </p>
          </div>
          <p className="text-xs text-[#20201f]/40">
            {lt ? "Negauni laiško? Patikrink šlamšto aplanką." : "No email? Check your spam folder."}
          </p>
          <Link href={`/${lang}/auth/login`} className="text-sm font-medium text-[#20201f] underline underline-offset-2 hover:opacity-70">
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

        <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-6">
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
