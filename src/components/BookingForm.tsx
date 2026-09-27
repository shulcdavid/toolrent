"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/Button";
import { formatPrice, daysBetween, calcServiceFee, SERVICE_FEE_RATE } from "@/lib/utils";
import { createBooking } from "@/lib/actions/bookings";
import type { Listing } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/config";

const WEEK_LT = ["Pr", "An", "Tr", "Kt", "Pn", "Št", "Sk"];
const WEEK_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(dateStr: string, isLt: boolean): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(isLt ? "lt-LT" : "en-GB", { day: "numeric", month: "short" });
}

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
  blockedDates?: string[];
  bookedRanges?: { start: string; end: string }[];
}

export function BookingForm({
  listing, dict, lang, isLoggedIn = false,
  blockedDates = [], bookedRanges = [],
}: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateStr(today);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [phase, setPhase] = useState<"start" | "end">("start");
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const isLt = lang === "lt";
  const weekDays = isLt ? WEEK_LT : WEEK_EN;
  const blockedSet = new Set(blockedDates);

  function isBooked(dateStr: string): boolean {
    return bookedRanges.some(r => dateStr >= r.start && dateStr <= r.end);
  }

  function isUnavailable(dateStr: string): boolean {
    return blockedSet.has(dateStr) || isBooked(dateStr);
  }

  function hasBlockedBetween(start: string, end: string): boolean {
    const s = new Date(start + "T00:00:00");
    const e = new Date(end + "T00:00:00");
    const d = new Date(s);
    d.setDate(d.getDate() + 1);
    while (d < e) {
      if (isUnavailable(toDateStr(d))) return true;
      d.setDate(d.getDate() + 1);
    }
    return false;
  }

  function handleDayClick(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    if (d < today || isUnavailable(dateStr)) return;

    if (phase === "start") {
      setStartDate(dateStr);
      setEndDate("");
      setPhase("end");
    } else {
      if (dateStr <= startDate || hasBlockedBetween(startDate, dateStr)) {
        // Invalid end → restart from this day as new start
        setStartDate(dateStr);
        setEndDate("");
        return;
      }
      setEndDate(dateStr);
      setPhase("start");
    }
  }

  // Effective end for range highlight (hover preview or confirmed end)
  const rangeEnd = endDate || (phase === "end" && hoverDate && hoverDate > startDate ? hoverDate : null);
  const hoverInvalid = phase === "end" && hoverDate && hoverDate <= startDate;

  // Calendar state
  const baseDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const viewYear = baseDate.getFullYear();
  const viewMonth = baseDate.getMonth();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const monthLabel = baseDate.toLocaleString(isLt ? "lt-LT" : "en-US", { month: "long", year: "numeric" });

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(<div key={`g${i}`} />);

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    const dateStr = toDateStr(date);
    const isPast = date < today;
    const unavail = isUnavailable(dateStr);
    const isStart = dateStr === startDate;
    const isEnd = dateStr === endDate;
    const inRange = !!(rangeEnd && startDate && dateStr > startDate && dateStr < rangeEnd);
    const isToday = dateStr === todayStr;

    let cls = "flex h-9 w-full items-center justify-center text-sm font-medium transition-colors select-none ";

    if (isPast) {
      cls += "text-[#20201f]/20 cursor-default rounded-lg";
    } else if (unavail) {
      cls += "text-[#20201f]/30 line-through cursor-not-allowed rounded-lg bg-[#e5e2db]/60";
    } else if (isStart) {
      cls += "bg-[#20201f] text-[#f7f6f2] cursor-pointer rounded-l-lg rounded-r-none";
    } else if (isEnd) {
      cls += "bg-[#20201f] text-[#f7f6f2] cursor-pointer rounded-r-lg rounded-l-none";
    } else if (inRange) {
      cls += "bg-[#20201f]/10 text-[#20201f] cursor-pointer rounded-none";
    } else if (isToday) {
      cls += "ring-2 ring-[#20201f]/30 text-[#20201f] hover:bg-[#e5e2db] cursor-pointer rounded-lg";
    } else {
      cls += "text-[#20201f] hover:bg-[#e5e2db] cursor-pointer rounded-lg";
    }

    cells.push(
      <button
        key={dateStr}
        type="button"
        disabled={isPast || unavail}
        onClick={() => handleDayClick(dateStr)}
        onMouseEnter={() => { if (phase === "end") setHoverDate(dateStr); }}
        onMouseLeave={() => setHoverDate(null)}
        className={cls}
      >
        {d}
      </button>
    );
  }

  const days = startDate && endDate ? daysBetween(startDate, endDate) : 0;
  const toolCost = days * listing.price_per_day;
  const serviceFee = calcServiceFee(toolCost);
  const total = toolCost + serviceFee;
  const isValid = !!(startDate && endDate && endDate > startDate);

  return (
    <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-5">
      <h2 className="font-outfit font-semibold text-[#20201f] mb-4">{dict.listing.bookingTitle}</h2>
      <div className="mb-4 flex items-baseline gap-1">
        <span className="font-outfit text-2xl font-bold text-[#20201f]">{formatPrice(listing.price_per_day)}</span>
        <span className="text-[#20201f]/65 text-sm">{dict.listing.perDay}</span>
      </div>

      {!isLoggedIn ? (
        <div className="rounded-xl border border-[#e5e2db] bg-[#f7f6f2] p-4 text-center">
          <p className="text-sm text-[#20201f]/75 mb-3">{dict.listing.loginToBook}</p>
          <Link href={`/${lang}/auth/login`}>
            <Button className="w-full">{dict.listing.loginToBook}</Button>
          </Link>
        </div>
      ) : (
        <form action={createBooking} className="flex flex-col gap-4">
          <input type="hidden" name="listing_id" value={listing.id} />
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="price_per_day" value={listing.price_per_day} />
          <input type="hidden" name="start_date" value={startDate} />
          <input type="hidden" name="end_date" value={endDate} />

          {/* Date display */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setPhase("start"); setStartDate(""); setEndDate(""); }}
              className={`rounded-xl border p-3 text-left text-xs transition-colors ${
                phase === "start" && !startDate
                  ? "border-[#20201f] bg-[#f7f6f2] ring-2 ring-[#20201f]/15"
                  : "border-[#e5e2db] bg-[#f7f6f2] hover:border-[#20201f]/40"
              }`}
            >
              <div className="text-[#20201f]/50 mb-0.5">{dict.listing.startDate}</div>
              <div className="font-semibold text-[#20201f]">
                {startDate ? formatDisplayDate(startDate, isLt) : (isLt ? "Pasirinkti" : "Pick date")}
              </div>
            </button>
            <button
              type="button"
              onClick={() => { if (startDate) { setPhase("end"); setEndDate(""); } }}
              className={`rounded-xl border p-3 text-left text-xs transition-colors ${
                phase === "end"
                  ? "border-[#20201f] bg-[#f7f6f2] ring-2 ring-[#20201f]/15"
                  : "border-[#e5e2db] bg-[#f7f6f2] hover:border-[#20201f]/40"
              }`}
            >
              <div className="text-[#20201f]/50 mb-0.5">{dict.listing.endDate}</div>
              <div className="font-semibold text-[#20201f]">
                {endDate ? formatDisplayDate(endDate, isLt) : (isLt ? "Pasirinkti" : "Pick date")}
              </div>
            </button>
          </div>

          {/* Instruction hint */}
          <p className="text-xs text-[#20201f]/55 -mt-1">
            {phase === "start"
              ? (isLt ? "Pasirinkite pradžios datą" : "Select start date")
              : (isLt ? "Pasirinkite pabaigos datą" : "Select end date")}
          </p>

          {/* Calendar */}
          <div className="rounded-2xl border border-[#e5e2db] bg-[#f7f6f2] p-4">
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={() => setMonthOffset(o => Math.max(0, o - 1))} disabled={monthOffset === 0}
                className="p-1.5 rounded-lg hover:bg-[#e5e2db] disabled:opacity-25 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-semibold text-[#20201f] capitalize">{monthLabel}</span>
              <button type="button" onClick={() => setMonthOffset(o => Math.min(11, o + 1))}
                className="p-1.5 rounded-lg hover:bg-[#e5e2db] transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {weekDays.map(w => (
                <div key={w} className="flex items-center justify-center py-1 text-xs text-[#20201f]/50 font-medium">{w}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">{cells}</div>

            <div className="flex items-center gap-4 mt-3 text-xs text-[#20201f]/50">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-[#e5e2db] shrink-0 line-through" />
                {isLt ? "Neprieinama" : "Unavailable"}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-[#20201f] shrink-0" />
                {isLt ? "Pasirinkta" : "Selected"}
              </span>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-[#20201f] block mb-1.5">{dict.listing.messageLabel}</label>
            <textarea name="message" placeholder={dict.listing.messagePlaceholder} rows={3}
              className="w-full rounded-xl border border-[#e5e2db] bg-[#f7f6f2] px-4 py-2.5 text-sm text-[#20201f] placeholder:text-[#20201f]/70 transition focus:outline-none focus:ring-2 focus:ring-[#20201f]/15 resize-none" />
          </div>

          {/* Price breakdown */}
          {isValid && (
            <div className="rounded-xl border border-[#e5e2db] bg-[#f7f6f2] p-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-[#20201f]/75">
                <span>{formatPrice(listing.price_per_day)} × {days} {dict.listing.totalDays}</span>
                <span>{formatPrice(toolCost)}</span>
              </div>
              <div className="flex justify-between text-[#20201f]/75">
                <span>{isLt ? `Aptarnavimo mokestis (${SERVICE_FEE_RATE * 100}%)` : `Service fee (${SERVICE_FEE_RATE * 100}%)`}</span>
                <span>{formatPrice(serviceFee)}</span>
              </div>
              {listing.deposit > 0 && (
                <div className="flex justify-between text-[#20201f]/75">
                  <span>{dict.listing.deposit}</span>
                  <span>{formatPrice(listing.deposit)}</span>
                </div>
              )}
              <div className="flex justify-between font-outfit font-bold text-[#20201f] border-t border-[#e5e2db] pt-2 mt-1">
                <span>{dict.listing.totalPrice}</span>
                <span>{formatPrice(total + listing.deposit)}</span>
              </div>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={!isValid}>
            {dict.listing.sendRequest}
          </Button>
        </form>
      )}
    </div>
  );
}
