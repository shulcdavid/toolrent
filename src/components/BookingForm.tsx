"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { formatPrice, daysBetween } from "@/lib/utils";
import { createBooking } from "@/lib/actions/bookings";
import type { Listing } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/config";

interface Props {
  listing: Listing;
  dict: {
    listing: {
      bookingTitle: string; startDate: string; endDate: string;
      totalDays: string; totalPrice: string; messageLabel: string;
      messagePlaceholder: string; sendRequest: string; loginToBook: string;
      deposit: string; perDay: string;
    };
    common: { currency: string };
  };
  lang: Locale;
  isLoggedIn?: boolean;
}

export function BookingForm({ listing, dict, lang, isLoggedIn = false }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);

  const days = daysBetween(startDate, endDate);
  const total = days * listing.price_per_day;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-gray-900 mb-4 text-lg">{dict.listing.bookingTitle}</h2>
      <div className="mb-4 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{formatPrice(listing.price_per_day)}</span>
        <span className="text-gray-500 text-sm">{dict.listing.perDay}</span>
      </div>

      {!isLoggedIn ? (
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-600 mb-3">{dict.listing.loginToBook}</p>
          <Link href={`/${lang}/auth/login`}>
            <Button className="w-full">{dict.listing.loginToBook}</Button>
          </Link>
        </div>
      ) : (
        <form action={createBooking} className="flex flex-col gap-4">
          <input type="hidden" name="listing_id" value={listing.id} />
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="price_per_day" value={listing.price_per_day} />

          <div className="grid grid-cols-2 gap-3">
            <Input label={dict.listing.startDate} name="start_date" type="date"
              value={startDate} min={today} onChange={(e) => setStartDate(e.target.value)} required />
            <Input label={dict.listing.endDate} name="end_date" type="date"
              value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} required />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">{dict.listing.messageLabel}</label>
            <textarea name="message" placeholder={dict.listing.messagePlaceholder} rows={3}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{formatPrice(listing.price_per_day)} × {days} {dict.listing.totalDays}</span>
              <span>{formatPrice(total)}</span>
            </div>
            {listing.deposit > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>{dict.listing.deposit}</span>
                <span>{formatPrice(listing.deposit)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
              <span>{dict.listing.totalPrice}</span>
              <span>{formatPrice(total + listing.deposit)}</span>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">{dict.listing.sendRequest}</Button>
        </form>
      )}
    </div>
  );
}
