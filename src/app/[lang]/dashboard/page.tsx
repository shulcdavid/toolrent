import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { PlusCircle, Package, CalendarCheck, Bell } from "lucide-react";
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
    supabase.from("bookings").select("*, listings!inner(title, user_id), profiles!renter_id(full_name)").eq("listings.user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const profile = profileRaw as any;
  const myListings = (myListingsRaw ?? []) as Listing[];
  const incoming = (incomingRaw ?? []).filter((b: any) => b.listings?.user_id === user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{d.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{d.welcome}, {(profile as any)?.full_name?.split(" ")[0]} 👋</p>
        </div>
        <Link href={`/${lang}/add-listing`}>
          <Button size="sm"><PlusCircle size={15} /> {d.addNew}</Button>
        </Link>
      </div>

      {/* My Listings */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 font-semibold text-gray-800 mb-4">
          <Package size={18} className="text-orange-500" /> {d.myListings}
          <span className="ml-1 text-sm font-normal text-gray-400">({myListings?.length ?? 0})</span>
        </h2>
        {!myListings?.length ? <EmptyState msg={d.noListings} /> : (
          <div className="flex flex-col gap-3">
            {myListings.map((listing) => (
              <div key={listing.id} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4">
                <div className="h-14 w-14 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-2xl">
                  {listing.images?.[0]
                    ? <img src={listing.images[0]} alt="" className="h-full w-full object-cover" />
                    : "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                  <p className="text-sm text-gray-500">{listing.city} · {formatPrice(listing.price_per_day)}{dict.listings.perDay}</p>
                </div>
                <Badge variant={listing.is_available ? "green" : "gray"}>
                  {listing.is_available ? dict.listings.available : dict.listings.unavailable}
                </Badge>
                <div className="flex gap-2">
                  <Link href={`/${lang}/listings/${listing.id}`}>
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
        <h2 className="flex items-center gap-2 font-semibold text-gray-800 mb-4">
          <Bell size={18} className="text-orange-500" /> {d.incomingRequests}
          {incoming.filter((b: any) => b.status === "pending").length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
              {incoming.filter((b: any) => b.status === "pending").length}
            </span>
          )}
        </h2>
        {!incoming.length ? <EmptyState msg={d.noRequests} /> : (
          <div className="flex flex-col gap-3">
            {incoming.map((req: any) => (
              <div key={req.id} className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-medium text-gray-900">{req.profiles?.full_name} → {req.listings?.title}</p>
                    <p className="text-sm text-gray-500">{formatDate(req.start_date)} – {formatDate(req.end_date)} · {formatPrice(req.total_price)}</p>
                    {req.message && <p className="text-sm text-gray-600 mt-1 italic">"{req.message}"</p>}
                  </div>
                  <Badge variant={statusVariant[req.status]}>{d.status[req.status as keyof typeof d.status]}</Badge>
                </div>
                {req.status === "pending" && (
                  <div className="flex gap-2 mt-3">
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
        <h2 className="flex items-center gap-2 font-semibold text-gray-800 mb-4">
          <CalendarCheck size={18} className="text-orange-500" /> {d.myBookings}
        </h2>
        {!myBookings?.length ? <EmptyState msg={d.noBookings} /> : (
          <div className="flex flex-col gap-3">
            {myBookings.map((booking: any) => (
              <div key={booking.id} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{booking.listings?.title}</p>
                  <p className="text-sm text-gray-500">{formatDate(booking.start_date)} – {formatDate(booking.end_date)} · {formatPrice(booking.total_price)}</p>
                </div>
                <Badge variant={statusVariant[booking.status]}>{d.status[booking.status as keyof typeof d.status]}</Badge>
                {booking.status === "pending" && (
                  <form action={updateBookingStatus.bind(null, booking.id, "cancelled", lang)}>
                    <Button size="sm" variant="outline" type="submit">{d.cancel}</Button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-10 text-center text-sm text-gray-400">
      {msg}
    </div>
  );
}
