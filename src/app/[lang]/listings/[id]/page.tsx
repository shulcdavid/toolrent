import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, ArrowLeft, Star, Shield } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BookingForm } from "@/components/BookingForm";
import { mockListings } from "@/lib/mock-data";
import { formatPrice, formatDate, CATEGORY_ICONS } from "@/lib/utils";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const listing = mockListings.find((l) => l.id === id);
  if (!listing) notFound();

  const dict = await getDictionary(lang as Locale);
  const icon = CATEGORY_ICONS[listing.category as keyof typeof CATEGORY_ICONS] ?? "📦";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      {/* Back */}
      <Link
        href={`/${lang}/listings`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> {dict.common.back}
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left – images + details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Main image */}
          <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-gray-100">
            {listing.images?.[0] ? (
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">{icon}</div>
            )}
            <div className="absolute top-4 left-4">
              <Badge variant={listing.is_available ? "green" : "gray"}>
                {listing.is_available ? dict.listings.available : dict.listings.unavailable}
              </Badge>
            </div>
          </div>

          {/* Title & meta */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
              <span className="text-2xl font-bold text-orange-500 whitespace-nowrap">
                {formatPrice(listing.price_per_day)}
                <span className="text-base font-normal text-gray-500 ml-1">{dict.listing.perDay}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} /> {listing.city}
                {listing.address && ` · ${listing.address}`}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> {formatDate(listing.created_at)}
              </span>
              <Badge variant="default">{dict.categories[listing.category as keyof typeof dict.categories]}</Badge>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="font-semibold text-gray-900 mb-3">{dict.listing.description}</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Deposit */}
          {listing.deposit > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
              <Shield size={20} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-800">{dict.listing.deposit}</p>
                <p className="text-sm text-blue-600">{formatPrice(listing.deposit)}</p>
              </div>
            </div>
          )}

          {/* Owner */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="font-semibold text-gray-900 mb-4">{dict.listing.owner}</h2>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-xl font-bold text-orange-600">
                {listing.profiles.full_name?.[0] ?? "?"}
              </div>
              <div>
                <p className="font-medium text-gray-900">{listing.profiles.full_name}</p>
                <p className="text-sm text-gray-500">
                  {dict.listing.memberSince} {formatDate(listing.profiles.created_at)}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-sm text-yellow-600 font-medium">
                <Star size={14} fill="currentColor" /> 4.8
              </div>
            </div>
          </div>

          {/* Reviews placeholder */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="font-semibold text-gray-900 mb-3">{dict.listing.reviews}</h2>
            <p className="text-sm text-gray-400">{dict.listing.noReviews}</p>
          </div>
        </div>

        {/* Right – booking card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <BookingForm listing={listing} dict={dict} lang={lang as Locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
