import Link from "next/link";
import { notFound } from "next/navigation";
import { Wrench } from "lucide-react";
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
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white mb-4">
            <Wrench size={22} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{dict.auth.register.title}</h1>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <RegisterForm dict={dict.auth.register} lang={lang as Locale} />
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          {dict.auth.register.hasAccount}{" "}
          <Link href={`/${lang}/auth/login`} className="font-medium text-orange-600 hover:text-orange-700">
            {dict.auth.register.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
