import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { Navbar } from "@/components/Navbar";

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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar dict={dict.nav} lang={lang as Locale} user={null} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-100 bg-white py-8 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} ToolRent. {lang === "lt" ? "Visos teisės saugomos." : "All rights reserved."}
        </div>
      </footer>
    </div>
  );
}
