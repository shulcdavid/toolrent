import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updatePassword } from "@/lib/actions/auth";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { lang } = await params;
  const { error, message } = await searchParams;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const r = dict.auth.reset;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <span className="font-outfit text-2xl font-bold text-[#20201f] mb-1">Rente</span>
          <h1 className="font-outfit text-lg font-semibold text-[#20201f]">{r.title}</h1>
          <p className="text-sm text-[#20201f]/65 mt-1 text-center">{r.description}</p>
        </div>

        <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-6">
          <form action={updatePassword} className="flex flex-col gap-4">
            <input type="hidden" name="lang" value={lang} />
            <Input
              name="password"
              label={r.password}
              type="password"
              placeholder="••••••••"
              hint={r.passwordHint}
              minLength={8}
              required
            />
            {error && (
              <p className="text-sm text-red-500 rounded-lg bg-red-50 px-3 py-2">
                {decodeURIComponent(error)}
              </p>
            )}
            {message && (
              <p className="text-sm text-green-700 rounded-lg bg-green-50 px-3 py-2">
                {decodeURIComponent(message)}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full mt-1">{r.submit}</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
