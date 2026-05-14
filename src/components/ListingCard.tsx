import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { formatPrice, CATEGORY_ICONS } from "@/lib/utils";
import type { ListingWithProfile } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/dictionaries";

interface Props {
  listing: ListingWithProfile;
  lang: Locale;
  perDayLabel: string;
  availableLabel: string;
  unavailableLabel: string;
}

export function ListingCard({ listing, lang, perDayLabel, availableLabel, unavailableLabel }: Props) {
  const icon = CATEGORY_ICONS[listing.category as keyof typeof CATEGORY_ICONS] ?? "📦";
  const coverImage = listing.images?.[0];

  return (
    <Link
      href={`/${lang}/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-[#eeece3] border border-[#e5e2db] hover:border-[#c8c4bc] transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full bg-[#e5e2db] overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl opacity-40">{icon}</div>
        )}

        {/* Availability dot */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[#f7f6f2]/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-[#20201f]">
          <span className={`h-1.5 w-1.5 rounded-full ${listing.is_available ? "bg-emerald-500" : "bg-[#20201f]/30"}`} />
          {listing.is_available ? availableLabel : unavailableLabel}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-full bg-[#20201f]/80 backdrop-blur-sm py-3 px-4 text-center text-xs font-semibold tracking-widest uppercase text-[#f7f6f2]">
            View Details
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 p-4">
        <h3 className="font-outfit font-semibold text-[#20201f] leading-snug line-clamp-2 text-sm">
          {listing.title}
        </h3>

        <div className="flex items-center gap-1 text-xs text-[#20201f]/50">
          <MapPin size={11} className="shrink-0" />
          <span>{listing.city}</span>
        </div>

        <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#e5e2db]">
          <span className="font-outfit text-sm font-semibold text-[#20201f]">
            {formatPrice(listing.price_per_day)}
            <span className="text-xs font-normal text-[#20201f]/50 ml-1">{perDayLabel}</span>
          </span>
          {listing.profiles?.full_name && (
            <div className="h-6 w-6 rounded-full bg-[#20201f] flex items-center justify-center text-[10px] font-bold text-[#f7f6f2]">
              {listing.profiles.full_name[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
