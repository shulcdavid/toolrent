import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { PlusCircle, Package, CalendarCheck, Bell, UserRound } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDate } from "@/lib/utils";
import { updateBookingStatus } from "@/lib/actions/bookings";
import { deleteListing } from "@/lib/actions/listings";
import type { Listing } from "@/lib/supabase/types";

const statusVariant: Record<string, "green" | "yellow" | "red" | "gray" | "default"> = {
  pending: "yellow", approved: "green", rejected: "red", completed: "gray", cancelled: "gray",
};

export default async function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/auth/login`);

  const dict = await getDictionary(lang as Locale);
  const d = dict.dashboard;

  const [{ data: profileRaw }, { data: myListingsRaw }, { data: myBookings }, { data: incomingRaw }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("listings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("bookings").select("*, listings(title, city, price_per_day)").eq("renter_id", user.id).order("created_at", { ascending: false }),
    supabase.from("bookings").select("*, listings!inner(title, user_id), profiles!renter_id(full_name, phone, city)").eq("listings.user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const profile = profileRaw as any;
  const myListings = (myListingsRaw ?? []) as Listing[];
  const incoming = (incomingRaw ?? []).filter((b: any) => b.listings?.user_id === user.id);
  const pendingCount = incoming.filter((b: any) => b.status === "pending").length;

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#20201f]/40 mb-1 font-outfit">{lang === "lt" ? "Mano paskyra" : "My account"}</p>
          <h1 className="font-outfit text-3xl font-bold text-[#20201f]">{d.title}</h1>
          <p className="text-sm text-[#20201f]/50 mt-1">{d.welcome}, {(profile as any)?.full_name?.split(" ")[0]} 👋</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${lang}/profile`}>
            <Button size="sm" variant="outline">
              <UserRound size={14} />
              {lang === "lt" ? "Profilis" : "Profile"}
            </Button>
          </Link>
          <Link href={`/${lang}/add-listing`}>
            <Button size="sm"><PlusCircle size={14} /> {d.addNew}</Button>
          </Link>
        </div>
      </div>

      {/* My Listings */}
      <section className="mb-10">
        <SectionHeader icon={Package} title={`${d.myListings} (${myListings?.length ?? 0})`} />
        {!myListings?.length ? <EmptyState msg={d.noListings} /> : (
          <div className="flex flex-col gap-3">
            {myListings.map((listing) => (
              <div key={listing.id} className="flex items-center gap-4 rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-4">
                <div className="h-14 w-14 rounded-xl bg-[#e5e2db] overflow-hidden shrink-0 flex items-center justify-center text-2xl">
                  {listing.images?.[0]
                    ? <img src={listing.images[0]} alt="" className="h-full w-full object-cover" />
                    : "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-outfit font-semibold text-[#20201f] truncate text-sm">{listing.title}</p>
                  <p className="text-xs text-[#20201f]/50 mt-0.5">{listing.city} · {formatPrice(listing.price_per_day)}{dict.listings.perDay}</p>
                </div>
                <Badge variant={listing.is_available ? "green" : "gray"}>
                  {listing.is_available ? dict.listings.available : dict.listings.unavailable}
                </Badge>
                <div className="flex gap-2">
                  <Link href={`/${lang}/add-listing?edit=${listing.id}`}>
                    <Button variant="ghost" size="sm">{d.edit}</Button>
                  </Link>
                  <form action={deleteListing.bind(null, listing.id, lang)}>
                    <Button variant="danger" size="sm" type="submit">{d.delete}</Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Incoming requests */}
      <section className="mb-10">
        <SectionHeader icon={Bell} title={d.incomingRequests} badge={pendingCount} />
        {!incoming.length ? <EmptyState msg={d.noRequests} /> : (
          <div className="flex flex-col gap-3">
            {incoming.map((req: any) => (
              <div key={req.id} className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-outfit font-semibold text-[#20201f] text-sm">{req.profiles?.full_name} → {req.listings?.title}</p>
                    <p className="text-xs text-[#20201f]/50 mt-1">{formatDate(req.start_date)} – {formatDate(req.end_date)} · {formatPrice(req.total_price)}</p>
                    {req.message && <p className="text-xs text-[#20201f]/60 mt-1.5 italic">"{req.message}"</p>}
                  </div>
                  <Badge variant={statusVariant[req.status]}>{d.status[req.status as keyof typeof d.status]}</Badge>
                </div>
                {req.status === "approved" && req.profiles && (
                  <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                    <span className="text-xs font-semibold text-emerald-800">
                      {lang === "lt" ? "📞 Kontaktai" : "📞 Contact"}
                    </span>
                    <span className="text-xs text-emerald-700">{req.profiles.full_name}</span>
                    {req.profiles.phone && (
                      <a href={`tel:${req.profiles.phone}`} className="text-xs font-medium text-emerald-700 underline underline-offset-2">
                        {req.profiles.phone}
                      </a>
                    )}
                    {req.profiles.city && <span className="text-xs text-emerald-600">📍 {req.profiles.city}</span>}
                  </div>
                )}
                {req.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <form action={updateBookingStatus.bind(null, req.id, "approved", lang)}>
                      <Button size="sm" type="submit">{d.approve}</Button>
                    </form>
                    <form action={updateBookingStatus.bind(null, req.id, "rejected", lang)}>
                      <Button size="sm" variant="outline" type="submit">{d.reject}</Button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Bookings */}
      <section>
        <SectionHeader icon={CalendarCheck} title={d.myBookings} />
        {!myBookings?.length ? <EmptyState msg={d.noBookings} /> : (
          <div className="flex flex-col gap-3">
            {myBookings.map((booking: any) => (
              <div key={booking.id} className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <Link href={`/${lang}/listings/${booking.listing_id}`} className="font-outfit font-semibold text-[#20201f] truncate text-sm hover:underline block">
                      {booking.listings?.title}
                    </Link>
                    <p className="text-xs text-[#20201f]/50 mt-0.5">
                      {formatDate(booking.start_date)} – {formatDate(booking.end_date)} · {formatPrice(booking.total_price)}
                    </p>
                    {booking.listings?.city && (
                      <p className="text-xs text-[#20201f]/40 mt-0.5">📍 {booking.listings.city}</p>
                    )}
                  </div>
                  <Badge variant={statusVariant[booking.status]}>{d.status[booking.status as keyof typeof d.status]}</Badge>
                  {(booking.status === "pending" || booking.status === "approved") && (
                    <form action={updateBookingStatus.bind(null, booking.id, "cancelled", lang)}>
                      <Button size="sm" variant="outline" type="submit">{d.cancel}</Button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, badge }: { icon: React.ElementType; title: string; badge?: number }) {
  return (
    <h2 className="flex items-center gap-2.5 font-outfit font-semibold text-[#20201f] mb-4 text-sm uppercase tracking-wide">
      <Icon size={16} className="text-[#20201f]/40" /> {title}
      {badge ? (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#20201f] text-[10px] font-bold text-[#f7f6f2]">
          {badge}
        </span>
      ) : null}
    </h2>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#e5e2db] bg-[#eeece3] py-10 text-center text-sm text-[#20201f]/40">
      {msg}
    </div>
  );
}
