import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, ArrowLeft, Star, Shield } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { Badge } from "@/components/ui/Badge";
import { BookingForm } from "@/components/BookingForm";
import { ImageGallery } from "@/components/ImageGallery";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { TrustBadges } from "@/components/TrustBadges";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDate, CATEGORY_ICONS } from "@/lib/utils";

export default async function ListingDetailPage({
  params, searchParams,
}: {
  params: Promise<{ lang: string; id: string }>;
  searchParams: Promise<{ booked?: string; error?: string }>;
}) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const supabase = await createClient();
  const { data: listingRaw } = await supabase
    .from("listings")
    .select("*, profiles(*)")
    .eq("id", id)
    .single();

  if (!listingRaw) notFound();
  const listing = listingRaw as any;

  const { data: { user } } = await supabase.auth.getUser();
  const { data: bookingsRaw } = await supabase
    .from("bookings")
    .select("start_date, end_date")
    .eq("listing_id", id)
    .eq("status", "approved");
  const bookedRanges = ((bookingsRaw ?? []) as any[]).map((b) => ({ start: b.start_date, end: b.end_date }));

  const { data: reviewsRaw } = await supabase
    .from("reviews")
    .select("*, profiles!reviewer_id(*)")
    .eq("listing_id", id)
    .order("created_at", { ascending: false });
  const reviews = (reviewsRaw ?? []) as any[];

  // Response rate: % of bookings that were approved or rejected (not left pending)
  const { data: allBookings } = await (supabase as any)
    .from("bookings").select("status").eq("listing_id", id);
  const total = (allBookings ?? []).length;
  const responded = (allBookings ?? []).filter((b: any) => b.status !== "pending").length;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : null;

  const dict = await getDictionary(lang as Locale);
  const sp = await searchParams;
  const icon = CATEGORY_ICONS[listing.category as keyof typeof CATEGORY_ICONS] ?? "📦";
  const isOwner = user?.id === listing.user_id;
  const avgRating = reviews?.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <Link href={`/${lang}/listings`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> {dict.common.back}
      </Link>

      {sp.booked && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700 font-medium">
          ✅ {lang === "lt" ? "Užklausa išsiųsta! Savininkas netrukus susisieks." : "Request sent! The owner will get back to you soon."}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Gallery */}
          {listing.images?.length > 0 ? (
            <ImageGallery images={listing.images} title={listing.title} />
          ) : (
            <div className="flex h-72 sm:h-96 w-full items-center justify-center rounded-2xl bg-gray-100 text-6xl">
              {icon}
            </div>
          )}

          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
              <span className="text-2xl font-bold text-orange-500 whitespace-nowrap">
                {formatPrice(listing.price_per_day)}
                <span className="text-base font-normal text-gray-500 ml-1">{dict.listing.perDay}</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {listing.city}{listing.address && ` · ${listing.address}`}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(listing.created_at)}</span>
              <Badge variant="default">{dict.categories[listing.category as keyof typeof dict.categories]}</Badge>
              {listing.is_available ? <Badge variant="green">{dict.listings.available}</Badge> : <Badge variant="gray">{dict.listings.unavailable}</Badge>}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="font-semibold text-gray-900 mb-3">{dict.listing.description}</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {listing.deposit > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
              <Shield size={20} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-800">{dict.listing.deposit}</p>
                <p className="text-sm text-blue-600">{formatPrice(listing.deposit)}</p>
              </div>
            </div>
          )}

          {/* Availability calendar */}
          <AvailabilityCalendar bookedRanges={bookedRanges} lang={lang} />

          {/* Owner */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="font-semibold text-gray-900 mb-4">{dict.listing.owner}</h2>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-xl font-bold text-orange-600">
                {listing.profiles?.full_name?.[0] ?? "?"}
              </div>
              <div>
                <p className="font-medium text-gray-900">{listing.profiles?.full_name ?? "Anonymous"}</p>
                <p className="text-sm text-gray-500">{dict.listing.memberSince} {formatDate(listing.profiles?.created_at)}</p>
              </div>
              {avgRating && (
                <div className="ml-auto flex items-center gap-1 text-sm text-yellow-600 font-medium">
                  <Star size={14} fill="currentColor" /> {avgRating}
                </div>
              )}
            </div>
            <TrustBadges
              hasPhone={!!listing.profiles?.phone}
              responseRate={responseRate}
              avgRating={avgRating}
              totalReviews={reviews.length}
              lang={lang}
            />
          </div>

          {/* Reviews */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="font-semibold text-gray-900 mb-4">
              {dict.listing.reviews} {reviews?.length ? `(${reviews.length})` : ""}
            </h2>
            {!reviews?.length ? (
              <p className="text-sm text-gray-400">{dict.listing.noReviews}</p>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-7 w-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
                        {(review.profiles as any)?.full_name?.[0] ?? "?"}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{(review.profiles as any)?.full_name}</span>
                      <div className="flex ml-auto">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-gray-600 ml-9">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            {isOwner ? (
              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5 text-center">
                <p className="text-sm font-medium text-orange-700 mb-3">{dict.listing.ownListing}</p>
                <Link href={`/${lang}/add-listing?edit=${listing.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
                  {dict.listing.editListing}
                </Link>
              </div>
            ) : (
              <BookingForm listing={listing} dict={dict} lang={lang as Locale} isLoggedIn={!!user} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
