"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "./ui/Button";
import { submitReview } from "@/lib/actions/reviews";

interface Props {
  lang: string;
  bookingId: string;
  listingId: string;
  listingTitle: string;
}

export function LeaveReviewForm({ lang, bookingId, listingId, listingTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const isLt = lang === "lt";
  const isLv = lang === "lv";
  const isEt = lang === "et";
  const isPl = lang === "pl";

  const t = {
    leaveReview: isLt ? "Palikti atsiliepimą" : isLv ? "Atstāt atsauksmi" : isEt ? "Jäta arvustus" : isPl ? "Zostaw opinię" : "Leave a review",
    yourRating: isLt ? "Jūsų įvertinimas" : isLv ? "Jūsu vērtējums" : isEt ? "Teie hinnang" : isPl ? "Twoja ocena" : "Your rating",
    placeholder: isLt ? "Pasidalink patirtimi (neprivaloma)..." : isLv ? "Dalieties pieredzē (pēc izvēles)..." : isEt ? "Jagage oma kogemust (vabatahtlik)..." : isPl ? "Podziel się doświadczeniem (opcjonalnie)..." : "Share your experience (optional)...",
    submit: isLt ? "Siųsti atsiliepimą" : isLv ? "Iesniegt atsauksmi" : isEt ? "Esita arvustus" : isPl ? "Wyślij opinię" : "Submit review",
    cancel: isLt ? "Atšaukti" : isLv ? "Atcelt" : isEt ? "Tühista" : isPl ? "Anuluj" : "Cancel",
    selectRating: isLt ? "Pasirinkite įvertinimą" : "Select a rating",
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-xs font-medium text-amber-600 underline underline-offset-2 hover:text-amber-700 transition-colors"
      >
        ⭐ {t.leaveReview}
      </button>
    );
  }

  return (
    <form
      action={submitReview}
      className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-col gap-3"
    >
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="booking_id" value={bookingId} />
      <input type="hidden" name="listing_id" value={listingId} />
      <input type="hidden" name="rating" value={rating} />

      <p className="text-xs font-semibold text-[#20201f]">
        {t.yourRating} — <span className="font-normal text-[#20201f]/70">{listingTitle}</span>
      </p>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              size={24}
              className={
                star <= (hover || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-[#e5e2db] fill-[#e5e2db]"
              }
            />
          </button>
        ))}
      </div>

      <textarea
        name="comment"
        rows={2}
        placeholder={t.placeholder}
        className="w-full rounded-lg border border-[#e5e2db] bg-white px-3 py-2 text-sm text-[#20201f] placeholder:text-[#20201f]/40 outline-none focus:border-[#20201f] resize-none"
      />

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={rating === 0}>
          {t.submit}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-[#20201f]/55 hover:text-[#20201f] transition-colors"
        >
          {t.cancel}
        </button>
        {rating === 0 && (
          <span className="text-xs text-[#20201f]/40">{t.selectRating}</span>
        )}
      </div>
    </form>
  );
}
