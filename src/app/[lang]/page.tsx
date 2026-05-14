import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Search, Send, PackageCheck, PlusCircle } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/utils";
import { CategoryIcon } from "@/components/CategoryIcon";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const lt = lang === "lt";
  return {
    title: "Rente – " + (lt ? "Nuomokis įrankius iš kaimynų" : "Rent tools from your neighbours"),
    description: lt
      ? "P2P įrankių nuomos platforma. Rask gręžtuvus, kopėčias, plovyklas ir daugiau šalia tavęs."
      : "Peer-to-peer tool rental. Find drills, ladders, pressure washers and more near you.",
    openGraph: { images: [{ url: "/og-default.png", width: 1200, height: 630 }] },
  };
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);
  const supabase = await createClient();

  const { data: listingsRaw } = await (supabase as any)
    .from("listings")
    .select("*, profiles(*)")
    .eq("is_available", true)
    .order("created_at", { ascending: false })
    .limit(6);

  const featured = (listingsRaw ?? []) as any[];

  const [{ count: toolCount }, { count: bookingCount }] = await Promise.all([
    (supabase as any).from("listings").select("*", { count: "exact", head: true }),
    (supabase as any).from("bookings").select("*", { count: "exact", head: true }).eq("status", "completed"),
  ]);

  const steps = [
    { icon: Search, title: dict.home.howItWorks.step1Title, desc: dict.home.howItWorks.step1Desc },
    { icon: Send, title: dict.home.howItWorks.step2Title, desc: dict.home.howItWorks.step2Desc },
    { icon: PackageCheck, title: dict.home.howItWorks.step3Title, desc: dict.home.howItWorks.step3Desc },
  ];

  const lt = lang === "lt";

  return (
    <div className="flex flex-col">

      {/* ── Announcement bar ── */}
      <div className="border-b border-[#e5e2db] bg-[#eeece3] px-4 py-2.5 text-center">
        <p className="text-xs text-[#20201f]/60 tracking-wide">
          {lt
            ? "🔧 Nuomok įrankius iš kaimynų · greita, pigu, patogu"
            : "🔧 Rent tools from your neighbours · fast, affordable, local"}
        </p>
      </div>

      {/* ── Hero ── */}
      <section className="px-5 sm:px-8 py-16 sm:py-24 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: editorial text */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e5e2db] bg-[#eeece3] px-4 py-1.5 w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-[#20201f]/60 tracking-wide">
                  {lt ? "Platforma veikia" : "Platform is live"}
                </span>
              </div>
              <h1 className="font-outfit text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#20201f] leading-[1.05]">
                {dict.home.hero.title}
              </h1>
              <p className="text-base sm:text-lg text-[#20201f]/55 leading-relaxed max-w-md">
                {dict.home.hero.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/${lang}/listings`}>
                <Button size="lg" className="w-full sm:w-auto">
                  {dict.home.hero.cta} <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href={`/${lang}/add-listing`}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  {dict.home.hero.listCta}
                </Button>
              </Link>
            </div>

            {/* Mini stats */}
            <div className="flex items-center gap-8 pt-2">
              <div>
                <div className="font-outfit text-2xl font-bold text-[#20201f]">{toolCount ?? 0}</div>
                <div className="text-xs text-[#20201f]/50 mt-0.5">{dict.home.stats.tools}</div>
              </div>
              <div className="w-px h-8 bg-[#e5e2db]" />
              <div>
                <div className="font-outfit text-2xl font-bold text-[#20201f]">{bookingCount ?? 0}</div>
                <div className="text-xs text-[#20201f]/50 mt-0.5">{dict.home.stats.renters}</div>
              </div>
            </div>
          </div>

          {/* Right: stacked tool cards visual */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-[340px] h-[420px]">
              {/* Back card */}
              <div className="absolute top-8 left-6 right-0 bottom-0 rounded-3xl bg-[#eeece3] border border-[#e5e2db] rotate-[4deg]" />
              {/* Mid card */}
              <div className="absolute top-4 left-3 right-2 bottom-2 rounded-3xl bg-[#e8e5de] border border-[#e5e2db] rotate-[2deg]" />
              {/* Front card */}
              <div className="absolute inset-0 rounded-3xl bg-[#f7f6f2] border border-[#e5e2db] shadow-xl overflow-hidden flex flex-col">
                <div className="flex-1 bg-[#eeece3] flex items-center justify-center text-8xl">
                  🔧
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-outfit font-semibold text-[#20201f] text-sm">
                        {lt ? "Gręžtuvas Bosch" : "Bosch Drill Set"}
                      </div>
                      <div className="text-xs text-[#20201f]/50 mt-0.5">
                        {lt ? "Vilnius, Šeškinė" : "Vilnius, Šeškinė"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-[#eeece3] px-2.5 py-1 text-xs font-medium text-[#20201f]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {lt ? "Laisva" : "Available"}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#e5e2db]">
                    <span className="font-outfit text-base font-bold text-[#20201f]">5 € <span className="text-xs font-normal text-[#20201f]/50">{lt ? "/ diena" : "/ day"}</span></span>
                    <div className="h-7 w-7 rounded-full bg-[#20201f] flex items-center justify-center text-xs font-bold text-[#f7f6f2]">T</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="border-t border-[#e5e2db] py-16 px-5 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#20201f]/40 mb-2 font-outfit">{lt ? "Kategorijos" : "Categories"}</p>
              <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-[#20201f]">{dict.home.categories.title}</h2>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/${lang}/listings?category=${cat}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-5 hover:bg-[#e5e2db] hover:border-[#c8c4bc] transition-all duration-200"
              >
                <CategoryIcon category={cat} size={24} className="text-[#20201f]/50 group-hover:text-[#20201f] transition-colors" />
                <span className="text-xs font-medium text-[#20201f]/60 text-center group-hover:text-[#20201f] transition-colors leading-tight">
                  {dict.categories[cat]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t border-[#e5e2db] py-16 px-5 sm:px-8 bg-[#eeece3]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest text-[#20201f]/40 mb-2 font-outfit">{lt ? "Kaip tai veikia" : "How it works"}</p>
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-[#20201f]">{dict.home.howItWorks.title}</h2>
          </div>
          <div className="grid gap-0 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e5e2db]">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col gap-5 p-8 sm:pr-12 first:pl-0 last:pr-0">
                <div className="flex items-center gap-3">
                  <span className="font-outfit text-xs text-[#20201f]/30 font-medium">0{i + 1}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#20201f] text-[#f7f6f2]">
                    <step.icon size={18} />
                  </div>
                </div>
                <div>
                  <h3 className="font-outfit font-semibold text-[#20201f] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#20201f]/55 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured listings ── */}
      <section className="border-t border-[#e5e2db] py-16 px-5 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#20201f]/40 mb-2 font-outfit">{lt ? "Naujausi įrankiai" : "Recently listed"}</p>
              <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-[#20201f]">{dict.home.featured.title}</h2>
            </div>
            {featured.length > 0 && (
              <Link href={`/${lang}/listings`} className="flex items-center gap-1.5 text-sm text-[#20201f]/60 hover:text-[#20201f] transition-colors">
                {dict.nav.browse} <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {featured.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-[#e5e2db] bg-[#eeece3] py-20 text-center">
              <span className="text-6xl mb-5 opacity-40">🔧</span>
              <h3 className="font-outfit text-lg font-semibold text-[#20201f] mb-2">
                {lt ? "Čia bus pirmieji įrankiai!" : "First tools coming soon!"}
              </h3>
              <p className="text-sm text-[#20201f]/50 mb-8 max-w-xs leading-relaxed">
                {lt
                  ? "Platforma ką tik paleista. Būk pirmas ir įkelk savo įrankį."
                  : "The platform just launched. Be the first to list your tool."}
              </p>
              <Link href={`/${lang}/add-listing`}>
                <Button size="md">
                  <PlusCircle size={15} /> {dict.home.hero.listCta}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  lang={lang as Locale}
                  perDayLabel={dict.listings.perDay}
                  availableLabel={dict.listings.available}
                  unavailableLabel={dict.listings.unavailable}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Full-width CTA ── */}
      <section className="mx-5 sm:mx-8 mb-16 rounded-3xl overflow-hidden bg-[#20201f]">
        <div className="px-8 sm:px-16 py-16 sm:py-20 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <p className="text-xs uppercase tracking-widest text-white/30 mb-3 font-outfit">{lt ? "Uždirk su savo įrankiais" : "Earn with your tools"}</p>
            <h2 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold text-[#f7f6f2] leading-tight mb-4">
              {dict.home.hero.listCta}
            </h2>
            <p className="text-sm text-white/50 max-w-md leading-relaxed">
              {lt
                ? "Tavo gręžtuvas rūdija garaže? Leisk kitiems jį naudoti ir užsidirk papildomai."
                : "Got tools sitting in your garage? Let others use them and earn extra income."}
            </p>
          </div>
          <div className="shrink-0">
            <Link href={`/${lang}/add-listing`}>
              <Button size="lg" className="bg-[#f7f6f2] text-[#20201f] hover:bg-[#eeece3] font-outfit">
                {lt ? "Įkelti įrankį" : "List a tool"} <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
