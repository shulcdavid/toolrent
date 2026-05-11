import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { Badge } from "./ui/Badge";
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
      className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 w-full bg-gray-100">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">{icon}</div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant={listing.is_available ? "green" : "gray"}>
            {listing.is_available ? availableLabel : unavailableLabel}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors">
            {listing.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin size={13} className="shrink-0" />
          <span>{listing.city}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(listing.price_per_day)}
            <span className="text-sm font-normal text-gray-500 ml-1">{perDayLabel}</span>
          </span>
          {listing.profiles?.full_name && (
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
                {listing.profiles.full_name[0]}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
