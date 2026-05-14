import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { RegisterForm } from "@/components/RegisterForm";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <span className="font-outfit text-2xl font-bold text-[#20201f] mb-1">ToolRent</span>
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
