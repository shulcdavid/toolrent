import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("lt-LT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("lt-LT", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function daysBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export const CATEGORIES = [
  "power",
  "hand",
  "pneumatic",
  "hydraulic",
  "woodworking",
  "metalworking",
  "fastening",
  "garden",
  "construction",
  "roofing",
  "measuring",
  "painting",
  "cleaning",
  "plumbing",
  "automotive",
  "safety",
  "jewelry",
  "leftovers",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function canChangeIdentity(changedAt: string | null, months = 12): boolean {
  if (!changedAt) return true;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return new Date(changedAt) < cutoff;
}

export function nextEditDate(changedAt: string | null, months = 12): string {
  if (!changedAt) return "";
  const d = new Date(changedAt);
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("lt-LT", { year: "numeric", month: "long", day: "numeric" });
}

export const CATEGORY_ICONS: Record<Category, string> = {
  power: "⚡",
  hand: "🔨",
  pneumatic: "💨",
  hydraulic: "💧",
  woodworking: "🪵",
  metalworking: "🔩",
  fastening: "🪛",
  garden: "🌿",
  construction: "🏗️",
  roofing: "🏠",
  measuring: "📐",
  painting: "🖌️",
  cleaning: "🧹",
  plumbing: "🚿",
  automotive: "🚗",
  safety: "🦺",
  jewelry: "💎",
  leftovers: "♻️",
  other: "📦",
};
