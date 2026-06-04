import Link from "next/link";
import { notFound } from "next/navigation";
import { MailCheck } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requestPasswordReset } from "@/lib/actions/auth";

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ sent?: string; email?: string; error?: string }>;
}) {
  const { lang } = await params;
  const { sent, email, error } = await searchParams;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const f = dict.auth.forgot;

  if (sent === "1") {
    const decoded = email ? decodeURIComponent(email) : "";
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm text-center flex flex-col items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eeece3] border border-[#e5e2db]">
            <MailCheck size={28} className="text-[#20201f]" />
          </div>
          <div>
            <h1 className="font-outfit text-2xl font-bold text-[#20201f] mb-2">{f.sentTitle}</h1>
            <p className="text-sm text-[#20201f]/70 leading-relaxed">
              {f.sentDesc}{" "}
              {decoded && <span className="font-medium text-[#20201f]/80">{decoded}</span>}
            </p>
          </div>
          <p className="text-xs text-[#20201f]/75">
            {lang === "lt" ? "Negauni laiško? Patikrink šlamšto aplanką." : "No email? Check your spam folder."}
          </p>
          <Link
            href={`/${lang}/auth/login`}
            className="text-sm font-medium text-[#20201f]/65 hover:text-[#20201f] transition-colors"
          >
            {f.backToLogin}
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
          <h1 className="font-outfit text-lg font-semibold text-[#20201f]">{f.title}</h1>
          <p className="text-sm text-[#20201f]/65 mt-1 text-center">{f.description}</p>
        </div>

        <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-6">
          <form action={requestPasswordReset} className="flex flex-col gap-4">
            <input type="hidden" name="lang" value={lang} />
            <Input name="email" label={f.email} type="email" placeholder="you@example.com" required />
            {error && (
              <p className="text-sm text-red-500 rounded-lg bg-red-50 px-3 py-2">
                {decodeURIComponent(error)}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full mt-1">{f.submit}</Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-[#20201f]/65">
          <Link
            href={`/${lang}/auth/login`}
            className="font-medium text-[#20201f] underline underline-offset-2 hover:opacity-70"
          >
            {f.backToLogin}
          </Link>
        </p>
      </div>
    </div>
  );
}
