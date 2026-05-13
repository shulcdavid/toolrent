import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { ListingCard } from "@/components/ListingCard";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/utils";
import { SlidersHorizontal, MapPin } from "lucide-react";

interface SearchParams { category?: string; city?: string; q?: string; sort?: string }

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
  if (sp.sort === "priceLow") query = query.order("price_per_day", { ascending: true });
  else if (sp.sort === "priceHigh") query = query.order("price_per_day", { ascending: false });

  const { data: listingsRaw } = await query;
  const listings = (listingsRaw ?? []) as any[];

  // Get unique cities for filter
  const { data: cityData } = await supabase.from("listings").select("city");
  const cities = [...new Set(((cityData ?? []) as any[]).map((r) => r.city as string))].sort();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{dict.listings.title}</h1>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-6 w-56 shrink-0">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 flex flex-col gap-5">
            <div className="flex items-center gap-2 font-semibold text-gray-700">
              <SlidersHorizontal size={16} /> Filters
            </div>

            <FilterSection label={dict.listings.search}>
              <form action={`/${lang}/listings`} method="GET">
                {sp.category && <input type="hidden" name="category" value={sp.category} />}
                {sp.city && <input type="hidden" name="city" value={sp.city} />}
                {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
                <input name="q" defaultValue={sp.q} placeholder="Search..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </form>
            </FilterSection>

            <FilterSection label={dict.listings.filters.category}>
              <div className="flex flex-col gap-1">
                <FilterLink href={buildUrl(lang, { ...sp, category: undefined })} active={!sp.category}>
                  {dict.listings.filters.allCategories}
                </FilterLink>
                {CATEGORIES.map((cat) => (
                  <FilterLink key={cat} href={buildUrl(lang, { ...sp, category: cat })} active={sp.category === cat}>
                    {CATEGORY_ICONS[cat]} {dict.categories[cat]}
                  </FilterLink>
                ))}
              </div>
            </FilterSection>

            <FilterSection label={dict.listings.filters.city}>
              <div className="flex flex-col gap-1">
                <FilterLink href={buildUrl(lang, { ...sp, city: undefined })} active={!sp.city}>
                  {dict.listings.filters.allCities}
                </FilterLink>
                {cities.map((city) => (
                  <FilterLink key={city} href={buildUrl(lang, { ...sp, city })} active={sp.city === city}>
                    <MapPin size={12} className="inline mr-1" />{city}
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
                  sp.category === cat ? "border-orange-500 bg-orange-500 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-orange-300"}`}>
                {CATEGORY_ICONS[cat]} {dict.categories[cat]}
              </a>
            ))}
          </div>

          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">{listings.length} {lang === "lt" ? "rezultatai" : "results"}</span>
            <div className="flex gap-2">
              {(["newest", "priceLow", "priceHigh"] as const).map((s) => (
                <a key={s} href={buildUrl(lang, { ...sp, sort: s })}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    (sp.sort ?? "newest") === s ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 bg-white text-gray-600 hover:border-orange-300"}`}>
                  {dict.listings.filters[s]}
                </a>
              ))}
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-gray-400">
              <span className="text-5xl mb-4">🔍</span>
              <p>{dict.listings.noResults}</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
  const qs = p.toString();
  return `/${lang}/listings${qs ? `?${qs}` : ""}`;
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{label}</p>
      {children}
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a href={href} className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${active ? "bg-orange-50 text-orange-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
      {children}
    </a>
  );
}
