"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleFavourite } from "@/lib/actions/favourites";

interface Props {
  listingId: string;
  initialFavourited: boolean;
}

export function FavouriteButton({ listingId, initialFavourited }: Props) {
  const [favourited, setFavourited] = useState(initialFavourited);
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    const next = !favourited;
    setFavourited(next); // optimistic
    setLoading(true);
    try {
      const result = await toggleFavourite(listingId);
      if (!result.success) setFavourited(!next); // revert
    } catch {
      setFavourited(!next); // revert on error
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      aria-label={favourited ? "Remove from favourites" : "Add to favourites"}
      className={`absolute top-3 right-3 flex items-center justify-center h-8 w-8 rounded-full bg-white/85 backdrop-blur-sm border border-white/40 shadow-sm hover:scale-110 transition-all ${loading ? "opacity-60" : ""}`}
    >
      <Heart
        size={14}
        className={favourited ? "fill-red-500 text-red-500" : "text-[#20201f]/60"}
      />
    </button>
  );
}
