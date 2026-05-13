"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/config";

interface Props {
  profile: Profile | null;
  lang: Locale;
  dict: { common: { save: string } };
}

export function ProfileForm({ profile, lang, dict }: Props) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error: err } = await (supabase.from("profiles") as any).upsert({
      id: profile?.id ?? "",
      full_name: fd.get("full_name") as string,
      phone: fd.get("phone") as string,
      city: fd.get("city") as string,
    });

    setLoading(false);
    if (err) setError(err.message);
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-6 flex flex-col gap-5">
      {/* Avatar placeholder */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600">
          {profile?.full_name?.[0] ?? "?"}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{profile?.full_name ?? ""}</p>
          <p className="text-sm text-gray-500">{lang === "lt" ? "Narys nuo" : "Member since"} {new Date(profile?.created_at ?? "").getFullYear()}</p>
        </div>
      </div>

      <Input name="full_name" label={lang === "lt" ? "Vardas ir pavardė" : "Full name"}
        defaultValue={profile?.full_name ?? ""} placeholder="Jonas Jonaitis" required />
      <Input name="phone" label={lang === "lt" ? "Telefono numeris" : "Phone number"}
        defaultValue={profile?.phone ?? ""} placeholder="+370 600 00000" type="tel" />
      <Input name="city" label={lang === "lt" ? "Miestas" : "City"}
        defaultValue={profile?.city ?? ""} placeholder="Vilnius" required />

      {error && <p className="text-sm text-red-500 rounded-lg bg-red-50 px-3 py-2">{error}</p>}
      {saved && <p className="text-sm text-green-600 rounded-lg bg-green-50 px-3 py-2">✓ {lang === "lt" ? "Išsaugota!" : "Saved!"}</p>}

      <Button type="submit" size="lg" disabled={loading}>{loading ? "..." : dict.common.save}</Button>
    </form>
  );
}
