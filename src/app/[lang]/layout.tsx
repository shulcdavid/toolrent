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

  const lt = lang === "lt";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar dict={dict.nav} lang={lang as Locale} user={user} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Footer */}
      <footer className="hidden md:block border-t border-[#e5e2db] bg-[#f7f6f2] mt-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <div className="font-outfit text-base font-semibold text-[#20201f] mb-3">Rente</div>
              <p className="text-xs text-[#20201f]/50 leading-relaxed max-w-[180px]">
                {lt ? "P2P įrankių nuomos platforma Lietuvoje." : "Peer-to-peer tool rental platform."}
              </p>
            </div>
            {/* Browse */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[#20201f]/30 mb-4 font-outfit">{lt ? "Platforma" : "Platform"}</div>
              <div className="flex flex-col gap-2.5">
                <a href={`/${lang}/listings`} className="text-xs text-[#20201f]/60 hover:text-[#20201f] transition-colors">{dict.nav.browse}</a>
                <a href={`/${lang}/add-listing`} className="text-xs text-[#20201f]/60 hover:text-[#20201f] transition-colors">{dict.nav.addListing}</a>
                {user && <a href={`/${lang}/dashboard`} className="text-xs text-[#20201f]/60 hover:text-[#20201f] transition-colors">{dict.nav.dashboard}</a>}
              </div>
            </div>
            {/* Company */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[#20201f]/30 mb-4 font-outfit">{lt ? "Įmonė" : "Company"}</div>
              <div className="flex flex-col gap-2.5">
                <a href={`/${lang}/about`} className="text-xs text-[#20201f]/60 hover:text-[#20201f] transition-colors">{lt ? "Apie mus" : "About"}</a>
                <a href={`/${lang}/contact`} className="text-xs text-[#20201f]/60 hover:text-[#20201f] transition-colors">{lt ? "Kontaktai" : "Contact"}</a>
              </div>
            </div>
            {/* Legal */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[#20201f]/30 mb-4 font-outfit">{lt ? "Teisinė info" : "Legal"}</div>
              <div className="flex flex-col gap-2.5">
                <a href={`/${lang}/privacy`} className="text-xs text-[#20201f]/60 hover:text-[#20201f] transition-colors">{lt ? "Privatumas" : "Privacy"}</a>
                <a href={`/${lang}/terms`} className="text-xs text-[#20201f]/60 hover:text-[#20201f] transition-colors">{lt ? "Sąlygos" : "Terms"}</a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#e5e2db] pt-6 flex items-center justify-between">
            <span className="text-xs text-[#20201f]/30">© {new Date().getFullYear()} Rente</span>
            <span className="text-xs text-[#20201f]/30">{lt ? "Lietuvoje 🇱🇹" : "Made in Lithuania 🇱🇹"}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
