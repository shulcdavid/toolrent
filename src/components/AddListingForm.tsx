"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { CATEGORIES } from "@/lib/utils";
import { CategoryIcon } from "@/components/CategoryIcon";
import { createListing } from "@/lib/actions/listings";
import { OwnerAvailabilityCalendar } from "@/components/AvailabilityCalendar";
import type { Locale } from "@/i18n/config";

interface Props {
  dict: {
    addListing: {
      fields: {
        title: string; titlePlaceholder: string; description: string; descPlaceholder: string;
        category: string; pricePerDay: string; deposit: string; depositHint: string;
        city: string; cityPlaceholder: string; address: string; addressPlaceholder: string;
        images: string; imagesHint: string; available: string;
      };
      submit: string;
    };
    categories: Record<string, string>;
  };
  lang: Locale;
}

export function AddListingForm({ dict, lang }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const f = dict.addListing.fields;

  function toggleCat(cat: string) {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  }

  function handleImageAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).slice(0, 5 - images.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setImages((prev) => [...prev, ev.target?.result as string].slice(0, 5));
      reader.readAsDataURL(file);
    });
  }

  return (
    <form action={createListing} className="flex flex-col gap-6">
      <input type="hidden" name="lang" value={lang} />

      {/* Images */}
      <div>
        <label className="text-sm font-medium text-[#20201f] block mb-1.5">{f.images}</label>
        <p className="text-xs text-[#20201f]/75 mb-3">{f.imagesHint}</p>
        <div className="flex flex-wrap gap-3">
          {images.map((src, i) => (
            <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden border border-[#e5e2db]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#20201f]/70 text-[#f7f6f2] hover:bg-[#20201f]">
                <X size={10} />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e5e2db] bg-[#eeece3] hover:border-[#20201f]/40 hover:bg-[#e5e2db] transition-colors">
              <Upload size={18} className="text-[#20201f]/65 mb-1" />
              <span className="text-xs text-[#20201f]/75">Upload</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
            </label>
          )}
        </div>
      </div>

      <Input name="title" label={f.title} placeholder={f.titlePlaceholder} required />

      <div>
        <label className="text-sm font-medium text-[#20201f] block mb-1.5">{f.description}</label>
        <textarea name="description" placeholder={f.descPlaceholder} rows={4}
          className="w-full rounded-xl border border-[#e5e2db] bg-[#f7f6f2] px-4 py-2.5 text-sm text-[#20201f] placeholder:text-[#20201f]/70 transition focus:outline-none focus:ring-2 focus:ring-[#20201f]/15 resize-none" />
      </div>

      <div>
        <label className="text-sm font-medium text-[#20201f] block mb-1">{f.category}</label>
        <p className="text-xs text-[#20201f]/75 mb-3">
          {lang === "lt" ? "Galite pasirinkti kelias kategorijas." : "You can select more than one."}
        </p>
        {/* Hidden validation sentinel — ensures at least one is checked */}
        <input
          type="text"
          name="_categories_check"
          value={selectedCats.size > 0 ? "ok" : ""}
          onChange={() => {}}
          required
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
        {/* Pass each selected category as a separate form value */}
        {[...selectedCats].map((cat) => (
          <input key={cat} type="hidden" name="categories" value={cat} />
        ))}
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => {
            const checked = selectedCats.has(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCat(cat)}
                className={`flex items-center gap-2 rounded-xl border px-3 text-xs transition h-14 ${
                  checked
                    ? "border-[#20201f] bg-[#20201f] text-[#f7f6f2]"
                    : "border-[#e5e2db] bg-[#eeece3] text-[#20201f] hover:border-[#20201f]/40"
                }`}
              >
                <CategoryIcon category={cat} size={14} className="shrink-0" />
                <span className="font-medium leading-snug">{dict.categories[cat]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input name="price_per_day" label={f.pricePerDay} type="number" min="1" step="0.5" placeholder="8" required />
        <Input name="deposit" label={f.deposit} type="number" min="0" step="1" placeholder="0" hint={f.depositHint} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input name="city" label={f.city} placeholder={f.cityPlaceholder} required />
        <Input name="address" label={f.address} placeholder={f.addressPlaceholder} />
      </div>

      {/* Availability calendar */}
      <div>
        <label className="text-sm font-medium text-[#20201f] block mb-1.5">
          {lang === "lt" ? "Prieinamumas" : "Availability"}
        </label>
        <p className="text-xs text-[#20201f]/75 mb-3">
          {lang === "lt"
            ? "Pažymėkite dienas, kuriomis įrankis nebus prieinamas."
            : "Mark the days when the tool will not be available."}
        </p>
        <OwnerAvailabilityCalendar lang={lang} />
      </div>

      {/* Toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input type="checkbox" name="is_available" defaultChecked className="sr-only peer" />
          <div className="w-11 h-6 rounded-full bg-[#e5e2db] peer-checked:bg-[#20201f] transition-colors" />
          <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-[#f7f6f2] shadow transition-transform peer-checked:translate-x-5" />
        </div>
        <span className="text-sm font-medium text-[#20201f]">{f.available}</span>
      </label>

      <Button type="submit" size="lg">{dict.addListing.submit}</Button>
    </form>
  );
}
