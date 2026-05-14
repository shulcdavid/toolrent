"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  bookedRanges: { start: string; end: string }[];
  lang: string;
}

const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_LT = ["Pir", "Ant", "Tre", "Ket", "Pen", "Šeš", "Sek"];
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_LT = ["Sausis","Vasaris","Kovas","Balandis","Gegužė","Birželis","Liepa","Rugpjūtis","Rugsėjis","Spalis","Lapkritis","Gruodis"];

function isBooked(date: Date, ranges: { start: string; end: string }[]): boolean {
  const d = date.getTime();
  return ranges.some((r) => {
    const s = new Date(r.start).getTime();
    const e = new Date(r.end).getTime();
    return d >= s && d <= e;
  });
}

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

export function AvailabilityCalendar({ bookedRanges, lang }: Props) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const lt = lang === "lt";
  const days = lt ? DAYS_LT : DAYS_EN;
  const months = lt ? MONTHS_LT : MONTHS_EN;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday-based: 0=Mon … 6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = startOffset + lastDay.getDate();
  const cells = Array.from({ length: Math.ceil(totalCells / 7) * 7 }, (_, i) => {
    const d = i - startOffset + 1;
    return d >= 1 && d <= lastDay.getDate() ? new Date(year, month, d) : null;
  });

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-5">
      <h2 className="font-outfit font-semibold text-[#20201f] mb-4 text-sm uppercase tracking-wide">
        {lt ? "Prieinamumas" : "Availability"}
      </h2>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-[#20201f]/50">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-100 border border-emerald-300" />{lt ? "Laisva" : "Available"}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-red-100 border border-red-300" />{lt ? "Užimta" : "Booked"}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#e5e2db] border border-[#d0cdc5]" />{lt ? "Praėjusi" : "Past"}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#e5e2db] text-[#20201f]/60 transition-colors">
          <ChevronLeft size={15} />
        </button>
        <span className="text-sm font-outfit font-semibold text-[#20201f]">{months[month]} {year}</span>
        <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#e5e2db] text-[#20201f]/60 transition-colors">
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {days.map((d) => (
          <div key={d} className="py-1 text-center text-xs font-medium text-[#20201f]/35">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const past = date < today && !isSameDay(date, today);
          const booked = isBooked(date, bookedRanges);
          const isToday = isSameDay(date, today);

          return (
            <div key={i} className={`flex h-9 items-center justify-center rounded-lg text-xs font-medium transition-colors
              ${isToday ? "ring-2 ring-[#20201f]/40" : ""}
              ${past ? "bg-[#e5e2db]/50 text-[#20201f]/25" : booked ? "bg-red-100 text-red-600" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
