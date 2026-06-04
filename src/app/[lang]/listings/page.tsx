import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { ListingCard } from "@/components/ListingCard";
import { ListingsMap } from "@/components/ListingsMap";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/utils";
import { CategoryIcon } from "@/components/CategoryIcon";
import { SlidersHorizontal, MapPin, LayoutGrid, Map } from "lucide-react";

interface SearchParams { category?: string; city?: string; q?: string; sort?: string; view?: string; priceMax?: string }

export default async function ListingsPage({
  params, searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false });

  if (sp.category) query = query.eq("category", sp.category);
  if (sp.city) query = query.eq("city", sp.city);
  if (sp.q) query = query.ilike("title", `%${sp.q}%`);
  if (sp.priceMax) query = query.lte("price_per_day", Number(sp.priceMax));
  if (sp.sort === "priceLow") query = query.order("price_per_day", { ascending: true });
  else if (sp.sort === "priceHigh") query = query.order("price_per_day", { ascending: false });

  const { data: listingsRaw } = await query;
  const listings = (listingsRaw ?? []) as any[];

  const { data: cityData } = await supabase.from("listings").select("city");
  const cities = [...new Set(((cityData ?? []) as any[]).map((r) => r.city as string))].sort();

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-[#20201f]/40 mb-1 font-outfit">{lang === "lt" ? "Naršyti" : "Browse"}</p>
        <h1 className="font-outfit text-3xl font-bold text-[#20201f]">{dict.listings.title}</h1>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-5 w-fit shrink-0">
          <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-5 flex flex-col gap-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#20201f] font-outfit">
              <SlidersHorizontal size={14} /> Filters
            </div>

            <FilterSection label={dict.listings.search}>
              <form action={`/${lang}/listings`} method="GET">
                {sp.category && <input type="hidden" name="category" value={sp.category} />}
                {sp.city && <input type="hidden" name="city" value={sp.city} />}
                {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
                <input name="q" defaultValue={sp.q} placeholder="Search..."
                  className="w-full rounded-xl border border-[#e5e2db] bg-[#f7f6f2] px-3 py-2 text-sm text-[#20201f] placeholder:text-[#20201f]/35 focus:outline-none focus:ring-2 focus:ring-[#20201f]/15" />
              </form>
            </FilterSection>

            <FilterSection label={dict.listings.filters.category}>
              <div className="flex flex-col gap-0.5">
                <FilterLink href={buildUrl(lang, { ...sp, category: undefined })} active={!sp.category}>
                  {dict.listings.filters.allCategories}
                </FilterLink>
                {CATEGORIES.map((cat) => (
                  <FilterLink key={cat} href={buildUrl(lang, { ...sp, category: cat })} active={sp.category === cat}>
                    <CategoryIcon category={cat} size={13} className="inline shrink-0" /> {dict.categories[cat]}
                  </FilterLink>
                ))}
              </div>
            </FilterSection>

            <FilterSection label={dict.listings.filters.priceMax}>
              <form action={`/${lang}/listings`} method="GET">
                {sp.category && <input type="hidden" name="category" value={sp.category} />}
                {sp.city && <input type="hidden" name="city" value={sp.city} />}
                {sp.q && <input type="hidden" name="q" value={sp.q} />}
                {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
                <div className="flex items-center gap-2">
                  <input
                    name="priceMax"
                    type="number"
                    min="1"
                    step="1"
                    defaultValue={sp.priceMax}
                    placeholder="e.g. 20"
                    className="w-full rounded-xl border border-[#e5e2db] bg-[#f7f6f2] px-3 py-2 text-sm text-[#20201f] placeholder:text-[#20201f]/35 focus:outline-none focus:ring-2 focus:ring-[#20201f]/15"
                  />
                  <button type="submit" className="shrink-0 rounded-xl bg-[#20201f] px-3 py-2 text-xs font-medium text-[#f7f6f2] hover:bg-[#3a3a38] transition-colors">→</button>
                </div>
                {sp.priceMax && (
                  <a href={buildUrl(lang, { ...sp, priceMax: undefined })} className="block mt-1.5 text-xs text-[#20201f]/50 hover:text-[#20201f] transition-colors">
                    ✕ {lang === "lt" ? "Išvalyti" : "Clear"}
                  </a>
                )}
              </form>
            </FilterSection>

            <FilterSection label={dict.listings.filters.city}>
              <div className="flex flex-col gap-0.5">
                <FilterLink href={buildUrl(lang, { ...sp, city: undefined })} active={!sp.city}>
                  {dict.listings.filters.allCities}
                </FilterLink>
                {cities.map((city) => (
                  <FilterLink key={city} href={buildUrl(lang, { ...sp, city })} active={sp.city === city}>
                    <MapPin size={11} className="inline mr-1" />{city}
                  </FilterLink>
                ))}
              </div>
            </FilterSection>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* Mobile category chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 lg:hidden">
            {CATEGORIES.map((cat) => (
              <a key={cat} href={buildUrl(lang, { ...sp, category: sp.category === cat ? undefined : cat })}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  sp.category === cat
                    ? "border-[#20201f] bg-[#20201f] text-[#f7f6f2]"
                    : "border-[#e5e2db] bg-[#eeece3] text-[#20201f]/60 hover:border-[#20201f]/30"}`}>
                <CategoryIcon category={cat} size={13} className="inline shrink-0" /> {dict.categories[cat]}
              </a>
            ))}
          </div>

          {/* Sort + view toggle bar */}
          <div className="flex items-center justify-between mb-5 gap-2 flex-wrap">
            <span className="text-sm text-[#20201f]/50">{listings.length} {lang === "lt" ? "rezultatai" : "results"}</span>
            <div className="flex gap-2 flex-wrap">
              {(["newest", "priceLow", "priceHigh"] as const).map((s) => (
                <a key={s} href={buildUrl(lang, { ...sp, sort: s })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    (sp.sort ?? "newest") === s
                      ? "border-[#20201f] bg-[#20201f] text-[#f7f6f2]"
                      : "border-[#e5e2db] bg-[#eeece3] text-[#20201f]/60 hover:border-[#20201f]/30"}`}>
                  {dict.listings.filters[s]}
                </a>
              ))}
              {/* View toggle */}
              <div className="flex rounded-full border border-[#e5e2db] overflow-hidden bg-[#eeece3]">
                <a href={buildUrl(lang, { ...sp, view: "grid" })}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                    (sp.view ?? "grid") === "grid" ? "bg-[#20201f] text-[#f7f6f2]" : "text-[#20201f]/60 hover:text-[#20201f]"}`}>
                  <LayoutGrid size={12} /> {lang === "lt" ? "Tinklelis" : "Grid"}
                </a>
                <a href={buildUrl(lang, { ...sp, view: "map" })}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                    sp.view === "map" ? "bg-[#20201f] text-[#f7f6f2]" : "text-[#20201f]/60 hover:text-[#20201f]"}`}>
                  <Map size={12} /> {lang === "lt" ? "Žemėlapis" : "Map"}
                </a>
              </div>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-[#20201f]/40">
              <span className="text-5xl mb-4 opacity-40">🔍</span>
              <p className="text-sm">{dict.listings.noResults}</p>
            </div>
          ) : sp.view === "map" ? (
            <ListingsMap listings={listings as any} lang={lang as Locale} perDayLabel={dict.listings.perDay} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing as any} lang={lang as Locale}
                  perDayLabel={dict.listings.perDay} availableLabel={dict.listings.available} unavailableLabel={dict.listings.unavailable} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildUrl(lang: string, sp: SearchParams): string {
  const p = new URLSearchParams();
  if (sp.category) p.set("category", sp.category);
  if (sp.city) p.set("city", sp.city);
  if (sp.q) p.set("q", sp.q);
  if (sp.sort) p.set("sort", sp.sort);
  if (sp.view) p.set("view", sp.view);
  if (sp.priceMax) p.set("priceMax", sp.priceMax);
  const qs = p.toString();
  return `/${lang}/listings${qs ? `?${qs}` : ""}`;
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-[#20201f]/30 mb-2 font-outfit">{label}</p>
      {children}
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a href={href} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
      active ? "bg-[#20201f] text-[#f7f6f2] font-medium" : "text-[#20201f]/75 hover:bg-[#e5e2db] hover:text-[#20201f]"}`}>
      {children}
    </a>
  );
}
