import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { ListingCard } from "@/components/ListingCard";
import { mockListings, mockCities } from "@/lib/mock-data";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";

interface SearchParams {
  category?: string;
  city?: string;
  q?: string;
  sort?: string;
  maxPrice?: string;
}

export default async function ListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);
  const sp = await searchParams;

  let listings = [...mockListings];

  if (sp.category) listings = listings.filter((l) => l.category === sp.category);
  if (sp.city) listings = listings.filter((l) => l.city === sp.city);
  if (sp.q) {
    const q = sp.q.toLowerCase();
    listings = listings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q)
    );
  }
  if (sp.maxPrice) listings = listings.filter((l) => l.price_per_day <= Number(sp.maxPrice));

  if (sp.sort === "priceLow") listings.sort((a, b) => a.price_per_day - b.price_per_day);
  else if (sp.sort === "priceHigh") listings.sort((a, b) => b.price_per_day - a.price_per_day);
  else listings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{dict.listings.title}</h1>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden lg:flex flex-col gap-6 w-56 shrink-0">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 flex flex-col gap-5">
            <div className="flex items-center gap-2 font-semibold text-gray-700">
              <SlidersHorizontal size={16} />
              Filters
            </div>

            {/* Search */}
            <FilterSection label={dict.listings.search}>
              <SearchInput defaultValue={sp.q} lang={lang} sp={sp} />
            </FilterSection>

            {/* Category */}
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

            {/* City */}
            <FilterSection label={dict.listings.filters.city}>
              <div className="flex flex-col gap-1">
                <FilterLink href={buildUrl(lang, { ...sp, city: undefined })} active={!sp.city}>
                  {dict.listings.filters.allCities}
                </FilterLink>
                {mockCities.map((city) => (
                  <FilterLink key={city} href={buildUrl(lang, { ...sp, city })} active={sp.city === city}>
                    {city}
                  </FilterLink>
                ))}
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* Listings grid */}
        <div className="flex-1 min-w-0">
          {/* Mobile filters bar */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 lg:hidden">
            {CATEGORIES.map((cat) => (
              <a
                key={cat}
                href={buildUrl(lang, { ...sp, category: sp.category === cat ? undefined : cat })}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  sp.category === cat
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-orange-300"
                }`}
              >
                {CATEGORY_ICONS[cat]} {dict.categories[cat]}
              </a>
            ))}
          </div>

          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">{listings.length} results</span>
            <div className="flex gap-2">
              {(["newest", "priceLow", "priceHigh"] as const).map((s) => (
                <a
                  key={s}
                  href={buildUrl(lang, { ...sp, sort: s })}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    (sp.sort ?? "newest") === s
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-orange-300"
                  }`}
                >
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
      </div>
    </div>
  );
}

function buildUrl(lang: string, sp: SearchParams): string {
  const params = new URLSearchParams();
  if (sp.category) params.set("category", sp.category);
  if (sp.city) params.set("city", sp.city);
  if (sp.q) params.set("q", sp.q);
  if (sp.sort) params.set("sort", sp.sort);
  if (sp.maxPrice) params.set("maxPrice", sp.maxPrice);
  const qs = params.toString();
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
    <a
      href={href}
      className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
        active ? "bg-orange-50 text-orange-700 font-medium" : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      {children}
    </a>
  );
}

function SearchInput({ defaultValue, lang, sp }: { defaultValue?: string; lang: string; sp: SearchParams }) {
  return (
    <form action={`/${lang}/listings`} method="GET">
      {sp.category && <input type="hidden" name="category" value={sp.category} />}
      {sp.city && <input type="hidden" name="city" value={sp.city} />}
      {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Search..."
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
    </form>
  );
}
