import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Search, Send, PackageCheck, PlusCircle } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const lt = lang === "lt";
  return {
    title: "ToolRent – " + (lt ? "Nuomokis įrankius iš kaimynų" : "Rent tools from your neighbours"),
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

  // Fetch real listings from database
  const { data: listingsRaw } = await (supabase as any)
    .from("listings")
    .select("*, profiles(*)")
    .eq("is_available", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const featured = (listingsRaw ?? []) as any[];

  // Real stats from DB
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 px-4 py-20 sm:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 text-9xl">🔧</div>
          <div className="absolute bottom-10 right-20 text-9xl">🪚</div>
          <div className="absolute top-1/2 left-10 text-7xl">🔩</div>
        </div>
        <div className="relative mx-auto max-w-3xl text-center text-white">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            {dict.home.hero.title}
          </h1>
          <p className="mt-6 text-lg text-orange-100 sm:text-xl max-w-xl mx-auto">
            {dict.home.hero.subtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${lang}/listings`}>
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 w-full sm:w-auto">
                {dict.home.hero.cta} <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href={`/${lang}/add-listing`}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                {dict.home.hero.listCta}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Real stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-2">
            {[
              { value: toolCount ?? 0, label: dict.home.stats.tools },
              { value: bookingCount ?? 0, label: dict.home.stats.renters },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-extrabold text-orange-500">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            {dict.home.howItWorks.title}
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 mb-4">
                  <step.icon size={24} />
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold mb-3">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{dict.home.categories.title}</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <Link key={cat} href={`/${lang}/listings?category=${cat}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 hover:border-orange-200 hover:bg-orange-50 transition-all group">
                <span className="text-3xl">{CATEGORY_ICONS[cat]}</span>
                <span className="text-xs font-medium text-gray-600 text-center group-hover:text-orange-700">
                  {dict.categories[cat]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently listed — real data only */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{dict.home.featured.title}</h2>
            {featured.length > 0 && (
              <Link href={`/${lang}/listings`} className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700">
                {dict.nav.browse} <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {featured.length === 0 ? (
            /* Empty state — platform is new, no fake data */
            <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
              <span className="text-5xl mb-4">🔧</span>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {lt ? "Čia bus pirmieji įrankiai!" : "First tools coming soon!"}
              </h3>
              <p className="text-sm text-gray-400 mb-6 max-w-xs">
                {lt
                  ? "Platforma ką tik paleista. Būk pirmas ir įkelk savo įrankį."
                  : "The platform just launched. Be the first to list your tool."}
              </p>
              <Link href={`/${lang}/add-listing`}>
                <Button size="md">
                  <PlusCircle size={16} /> {dict.home.hero.listCta}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* CTA banner */}
      <section className="py-16 px-4 sm:px-6 bg-orange-500">
        <div className="mx-auto max-w-2xl text-center text-white">
          <h2 className="text-2xl font-bold mb-4">{dict.home.hero.listCta}</h2>
          <p className="text-orange-100 mb-8 text-sm">
            {lt
              ? "Tavo gręžtuvas rūdija garaže? Leisk kitiems jį naudoti ir užsidirk."
              : "Got tools sitting in your garage? Let others use them and earn money."}
          </p>
          <Link href={`/${lang}/add-listing`}>
            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
              {dict.home.hero.listCta} <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
