import Link from "next/link";
import { notFound } from "next/navigation";
import { PlusCircle, Package, CalendarCheck, Bell } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { mockListings } from "@/lib/mock-data";
import { formatPrice, formatDate } from "@/lib/utils";

const statusVariant: Record<string, "green" | "yellow" | "red" | "gray" | "default"> = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
  completed: "gray",
  cancelled: "gray",
};

const mockBookings = [
  {
    id: "b1",
    listing_id: "2",
    renter_id: "u1",
    start_date: "2025-05-15",
    end_date: "2025-05-17",
    total_price: 30,
    status: "approved" as const,
    message: "Hi, I need it for weekend cleaning.",
    created_at: "2025-05-10T10:00:00Z",
    listings: mockListings[1],
  },
  {
    id: "b2",
    listing_id: "3",
    renter_id: "u1",
    start_date: "2025-05-20",
    end_date: "2025-05-22",
    total_price: 20,
    status: "pending" as const,
    message: "Need it for painting.",
    created_at: "2025-05-11T08:00:00Z",
    listings: mockListings[2],
  },
];

const mockIncoming = [
  {
    id: "r1",
    listing_id: "1",
    renter_id: "u3",
    start_date: "2025-05-18",
    end_date: "2025-05-19",
    total_price: 8,
    status: "pending" as const,
    message: "Need the drill for one day.",
    created_at: "2025-05-11T09:00:00Z",
    listings: mockListings[0],
    renter_name: "Andrius J.",
  },
];

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const d = dict.dashboard;

  const myListings = mockListings.filter((l) => l.user_id === "u1");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{d.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{d.welcome}, Tomas 👋</p>
        </div>
        <Link href={`/${lang}/add-listing`}>
          <Button size="sm">
            <PlusCircle size={15} /> {d.addNew}
          </Button>
        </Link>
      </div>

      {/* My Listings */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 font-semibold text-gray-800 mb-4">
          <Package size={18} className="text-orange-500" /> {d.myListings}
        </h2>
        {myListings.length === 0 ? (
          <EmptyState msg={d.noListings} />
        ) : (
          <div className="flex flex-col gap-3">
            {myListings.map((listing) => (
              <div key={listing.id} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4">
                <div className="h-14 w-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {listing.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listing.images[0]} alt="" className="h-full w-full object-cover" />
                  )}
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
          {mockIncoming.length > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
              {mockIncoming.length}
            </span>
          )}
        </h2>
        {mockIncoming.length === 0 ? (
          <EmptyState msg={d.noRequests} />
        ) : (
          <div className="flex flex-col gap-3">
            {mockIncoming.map((req) => (
              <div key={req.id} className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-medium text-gray-900">{req.renter_name} → {req.listings.title}</p>
                    <p className="text-sm text-gray-500">{formatDate(req.start_date)} – {formatDate(req.end_date)}</p>
                    {req.message && <p className="text-sm text-gray-600 mt-1 italic">"{req.message}"</p>}
                  </div>
                  <Badge variant={statusVariant[req.status]}>{d.status[req.status]}</Badge>
                </div>
                {req.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="primary">{d.approve}</Button>
                    <Button size="sm" variant="outline">{d.reject}</Button>
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
        {mockBookings.length === 0 ? (
          <EmptyState msg={d.noBookings} />
        ) : (
          <div className="flex flex-col gap-3">
            {mockBookings.map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{booking.listings.title}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(booking.start_date)} – {formatDate(booking.end_date)} · {formatPrice(booking.total_price)}
                  </p>
                </div>
                <Badge variant={statusVariant[booking.status]}>{d.status[booking.status]}</Badge>
                {booking.status === "pending" && (
                  <Button size="sm" variant="outline">{d.cancel}</Button>
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
