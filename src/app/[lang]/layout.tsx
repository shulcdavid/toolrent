import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "lt" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar dict={dict.nav} lang={lang as Locale} user={user} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <footer className="hidden md:block border-t border-gray-100 bg-white py-8 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>© {new Date().getFullYear()} ToolRent</span>
          <div className="flex gap-6">
            <a href={`/${lang}/about`} className="hover:text-gray-600 transition-colors">
              {lang === "lt" ? "Apie mus" : "About"}
            </a>
            <a href={`/${lang}/privacy`} className="hover:text-gray-600 transition-colors">
              {lang === "lt" ? "Privatumas" : "Privacy"}
            </a>
            <a href={`/${lang}/terms`} className="hover:text-gray-600 transition-colors">
              {lang === "lt" ? "Sąlygos" : "Terms"}
            </a>
            <a href={`/${lang}/contact`} className="hover:text-gray-600 transition-colors">
              {lang === "lt" ? "Kontaktai" : "Contact"}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
