"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/utils";
import { createListing } from "@/lib/actions/listings";
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
  const f = dict.addListing.fields;

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
        <label className="text-sm font-medium text-gray-700 block mb-1.5">{f.images}</label>
        <p className="text-xs text-gray-400 mb-3">{f.imagesHint}</p>
        <div className="flex flex-wrap gap-3">
          {images.map((src, i) => (
            <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80">
                <X size={10} />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-orange-400 hover:bg-orange-50 transition-colors">
              <Upload size={20} className="text-gray-400 mb-1" />
              <span className="text-xs text-gray-400">Upload</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
            </label>
          )}
        </div>
      </div>

      <Input name="title" label={f.title} placeholder={f.titlePlaceholder} required />

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">{f.description}</label>
        <textarea name="description" placeholder={f.descPlaceholder} rows={4}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">{f.category}</label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="cursor-pointer">
              <input type="radio" name="category" value={cat} className="sr-only peer" required />
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm transition peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:text-orange-700 hover:border-orange-300">
                <span>{CATEGORY_ICONS[cat]}</span>
                <span className="font-medium">{dict.categories[cat]}</span>
              </div>
            </label>
          ))}
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

      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input type="checkbox" name="is_available" defaultChecked className="sr-only peer" />
          <div className="w-11 h-6 rounded-full bg-gray-200 peer-checked:bg-orange-500 transition-colors" />
          <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
        </div>
        <span className="text-sm font-medium text-gray-700">{f.available}</span>
      </label>

      <Button type="submit" size="lg">{dict.addListing.submit}</Button>
    </form>
  );
}
