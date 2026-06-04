import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, ArrowLeft, Star, Shield } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { Badge } from "@/components/ui/Badge";
import { BookingForm } from "@/components/BookingForm";
import { ImageGallery } from "@/components/ImageGallery";
import { RenterAvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { TrustBadges } from "@/components/TrustBadges";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDate } from "@/lib/utils";
import { CategoryIcon } from "@/components/CategoryIcon";

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

  const { data: allBookings } = await (supabase as any)
    .from("bookings").select("status").eq("listing_id", id);
  const total = (allBookings ?? []).length;
  const responded = (allBookings ?? []).filter((b: any) => b.status !== "pending").length;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : null;

  const dict = await getDictionary(lang as Locale);
  const sp = await searchParams;
  const isOwner = user?.id === listing.user_id;
  const avgRating = reviews?.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-8">
      <Link href={`/${lang}/listings`}
        className="inline-flex items-center gap-1.5 text-sm text-[#20201f]/50 hover:text-[#20201f] mb-6 transition-colors">
        <ArrowLeft size={14} /> {dict.common.back}
      </Link>

      {sp.booked && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 font-medium">
          ✅ {lang === "lt" ? "Užklausa išsiųsta! Savininkas netrukus susisieks." : "Request sent! The owner will get back to you soon."}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Gallery */}
          {listing.images?.length > 0 ? (
            <ImageGallery images={listing.images} title={listing.title} />
          ) : (
            <div className="flex h-72 sm:h-96 w-full items-center justify-center rounded-2xl bg-[#eeece3] border border-[#e5e2db] opacity-20">
              <CategoryIcon category={listing.categories?.[0] ?? "other"} size={72} />
            </div>
          )}

          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-outfit text-2xl font-bold text-[#20201f]">{listing.title}</h1>
              <span className="font-outfit text-xl font-bold text-[#20201f] whitespace-nowrap">
                {formatPrice(listing.price_per_day)}
                <span className="text-sm font-normal text-[#20201f]/50 ml-1">{dict.listing.perDay}</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-[#20201f]/50"><MapPin size={12} /> {listing.city}{listing.address && ` · ${listing.address}`}</span>
              <span className="flex items-center gap-1.5 text-xs text-[#20201f]/50"><Calendar size={12} /> {formatDate(listing.created_at)}</span>
              {(listing.categories ?? []).map((cat: string) => (
                <Badge key={cat} variant="default">{dict.categories[cat as keyof typeof dict.categories]}</Badge>
              ))}
              {listing.is_available ? <Badge variant="green">{dict.listings.available}</Badge> : <Badge variant="gray">{dict.listings.unavailable}</Badge>}
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-5">
            <h2 className="font-outfit font-semibold text-[#20201f] mb-3 text-sm uppercase tracking-wide">{dict.listing.description}</h2>
            <p className="text-sm text-[#20201f]/65 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {listing.deposit > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-[#e5e2db] bg-[#eeece3] px-5 py-4">
              <Shield size={18} className="text-[#20201f]/40 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#20201f]">{dict.listing.deposit}</p>
                <p className="text-sm text-[#20201f]/50">{formatPrice(listing.deposit)}</p>
              </div>
            </div>
          )}

          {/* Availability calendar */}
          <RenterAvailabilityCalendar
            bookedRanges={bookedRanges}
            blockedDates={listing.blocked_dates ?? []}
            lang={lang}
          />

          {/* Owner */}
          <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-5">
            <h2 className="font-outfit font-semibold text-[#20201f] mb-4 text-sm uppercase tracking-wide">{dict.listing.owner}</h2>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#20201f] text-lg font-bold text-[#f7f6f2]">
                {listing.profiles?.full_name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="font-outfit font-semibold text-[#20201f] text-sm">{listing.profiles?.full_name ?? "Anonymous"}</p>
                <p className="text-xs text-[#20201f]/50">{dict.listing.memberSince} {formatDate(listing.profiles?.created_at)}</p>
              </div>
              {avgRating && (
                <div className="ml-auto flex items-center gap-1 text-sm text-amber-600 font-medium">
                  <Star size={13} fill="currentColor" /> {avgRating}
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
          <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-5">
            <h2 className="font-outfit font-semibold text-[#20201f] mb-4 text-sm uppercase tracking-wide">
              {dict.listing.reviews} {reviews?.length ? `(${reviews.length})` : ""}
            </h2>
            {!reviews?.length ? (
              <p className="text-sm text-[#20201f]/40">{dict.listing.noReviews}</p>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-[#e5e2db] pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-7 w-7 rounded-full bg-[#20201f] flex items-center justify-center text-xs font-bold text-[#f7f6f2]">
                        {(review.profiles as any)?.full_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <span className="text-sm font-medium text-[#20201f]">{(review.profiles as any)?.full_name}</span>
                      <div className="flex ml-auto">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={11} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-[#e5e2db] fill-[#e5e2db]"} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-[#20201f]/60 ml-9">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking card */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            {isOwner ? (
              <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-5 text-center">
                <p className="text-sm text-[#20201f]/60 mb-4">{dict.listing.ownListing}</p>
                <Link href={`/${lang}/add-listing?edit=${listing.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#20201f] px-5 py-2.5 text-sm font-semibold text-[#f7f6f2] hover:bg-[#3a3a38] transition-colors">
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
