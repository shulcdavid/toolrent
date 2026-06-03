"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const WEEK_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const WEEK_LT = ["Pr", "An", "Tr", "Kt", "Pn", "Št", "Sk"];

/* ─────────────────────────────────────────────────────────────────────────────
   OwnerAvailabilityCalendar
   Used in the "add/edit listing" form. Owner clicks days to mark them as
   unavailable (blocked). All future days are available by default.
───────────────────────────────────────────────────────────────────────────── */
interface OwnerProps {
  lang: string;
  initialBlocked?: string[];
}

export function OwnerAvailabilityCalendar({ lang, initialBlocked = [] }: OwnerProps) {
  const isLt = lang === "lt";
  const weekDays = isLt ? WEEK_LT : WEEK_EN;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateStr(today);

  const [monthOffset, setMonthOffset] = useState(0);
  const [blocked, setBlocked] = useState<Set<string>>(new Set(initialBlocked));

  const baseYear = today.getFullYear();
  const baseMonth = today.getMonth();
  const viewYear = new Date(baseYear, baseMonth + monthOffset, 1).getFullYear();
  const viewMonth = new Date(baseYear, baseMonth + monthOffset, 1).getMonth();

  const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString(
    isLt ? "lt-LT" : "en-US",
    { month: "long", year: "numeric" }
  );

  const toggle = useCallback((dateStr: string) => {
    setBlocked((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr); else next.add(dateStr);
      return next;
    });
  }, []);

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(<div key={`g${i}`} />);

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    const dateStr = toDateStr(date);
    const isPast = date < today;
    const isBlocked = blocked.has(dateStr);
    const isToday = dateStr === todayStr;

    cells.push(
      <button
        key={dateStr}
        type="button"
        disabled={isPast}
        onClick={() => toggle(dateStr)}
        className={[
          "flex aspect-square w-full items-center justify-center rounded-lg text-sm font-medium transition-colors select-none",
          isPast
            ? "text-[#20201f]/20 cursor-default"
            : isBlocked
            ? "bg-[#20201f]/80 text-[#f7f6f2] line-through"
            : isToday
            ? "ring-2 ring-[#20201f]/30 text-[#20201f] hover:bg-[#e5e2db]"
            : "text-[#20201f] hover:bg-[#e5e2db]",
        ].join(" ")}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e5e2db] bg-[#f7f6f2] p-4">
      <input type="hidden" name="blocked_dates" value={JSON.stringify([...blocked])} />

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
          disabled={monthOffset === 0}
          className="p-1.5 rounded-lg hover:bg-[#e5e2db] disabled:opacity-25 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-[#20201f] capitalize">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setMonthOffset((o) => Math.min(11, o + 1))}
          className="p-1.5 rounded-lg hover:bg-[#e5e2db] transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((d) => (
          <div key={d} className="flex items-center justify-center py-1 text-xs text-[#20201f]/40 font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">{cells}</div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 text-xs text-[#20201f]/50">
        <span className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-[#f7f6f2] border border-[#e5e2db] shrink-0" />
          {isLt ? "Prieinama" : "Available"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-[#20201f]/80 shrink-0" />
          {isLt ? "Neprieinama" : "Unavailable"}
        </span>
      </div>
      <p className="mt-2 text-xs text-[#20201f]/40">
        {isLt
          ? "Spustelkite dieną, kad ją pažymėtumėte kaip neprieinamą."
          : "Click a day to mark it as unavailable."}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   RenterAvailabilityCalendar
   Read-only view shown to renters. Shows available / booked / blocked days.
───────────────────────────────────────────────────────────────────────────── */
interface RenterProps {
  lang: string;
  blockedDates: string[];
  bookedRanges: { start: string; end: string }[];
}

export function RenterAvailabilityCalendar({ lang, blockedDates, bookedRanges }: RenterProps) {
  const isLt = lang === "lt";
  const weekDays = isLt ? WEEK_LT : WEEK_EN;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [monthOffset, setMonthOffset] = useState(0);
  const blockedSet = new Set(blockedDates);

  const baseYear = today.getFullYear();
  const baseMonth = today.getMonth();
  const viewYear = new Date(baseYear, baseMonth + monthOffset, 1).getFullYear();
  const viewMonth = new Date(baseYear, baseMonth + monthOffset, 1).getMonth();

  const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = toDateStr(today);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString(
    isLt ? "lt-LT" : "en-US",
    { month: "long", year: "numeric" }
  );

  function isBooked(dateStr: string): boolean {
    return bookedRanges.some((r) => dateStr >= r.start && dateStr <= r.end);
  }

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(<div key={`g${i}`} />);

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    const dateStr = toDateStr(date);
    const isPast = date < today;
    const isBlockedDay = blockedSet.has(dateStr);
    const isBookedDay = isBooked(dateStr);
    const isToday = dateStr === todayStr;

    let bg = "text-emerald-700 bg-emerald-50";
    if (isPast) bg = "text-[#20201f]/20";
    else if (isBlockedDay || isBookedDay) bg = "text-[#20201f]/30 bg-[#e5e2db] line-through";

    cells.push(
      <div
        key={dateStr}
        className={[
          "flex aspect-square w-full items-center justify-center rounded-lg text-sm font-medium",
          bg,
          isToday ? "ring-2 ring-[#20201f]/30" : "",
        ].join(" ")}
      >
        {d}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
          disabled={monthOffset === 0}
          className="p-1.5 rounded-lg hover:bg-[#e5e2db] disabled:opacity-25 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-[#20201f] capitalize">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setMonthOffset((o) => Math.min(11, o + 1))}
          className="p-1.5 rounded-lg hover:bg-[#e5e2db] transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((d) => (
          <div key={d} className="flex items-center justify-center py-1 text-xs text-[#20201f]/40 font-medium">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{cells}</div>

      <div className="flex items-center gap-5 mt-4 text-xs text-[#20201f]/50">
        <span className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-emerald-50 border border-emerald-200 shrink-0" />
          {isLt ? "Prieinama" : "Available"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-[#e5e2db] shrink-0" />
          {isLt ? "Neprieinama" : "Unavailable"}
        </span>
      </div>
    </div>
  );
}
