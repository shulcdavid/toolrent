"use client";

import { useRef, useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { updateProfile } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/config";

const COUNTRIES = [
  { value: "LT", label: "🇱🇹 Lithuania / Lietuva" },
  { value: "LV", label: "🇱🇻 Latvia / Latvija" },
  { value: "EE", label: "🇪🇪 Estonia / Eesti" },
  { value: "PL", label: "🇵🇱 Poland / Polska" },
];

interface Props {
  profile: Profile | null;
  userId: string;
  email: string;
  lang: Locale;
  dict: {
    profile: {
      avatar: string; changeAvatar: string; removeAvatar: string;
      fullName: string; username: string; phone: string; phonePlaceholder: string;
      city: string; country: string; lockedMsg: string; lockedUntil: string;
      saved: string; memberSince: string;
    };
    common: { save: string; cancel: string };
  };
  canChangeName: boolean;
  canChangeUsername: boolean;
  nameLockedUntil: string;
  usernameLockedUntil: string;
  saved?: boolean;
  error?: string;
}

export function ProfileForm({
  profile, userId, email, lang, dict,
  canChangeName, canChangeUsername,
  nameLockedUntil, usernameLockedUntil,
  saved: savedProp, error: errorProp,
}: Props) {
  const p = dict.profile;
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setUploadError("Max 2 MB"); return; }

    setUploading(true);
    setUploadError("");
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) {
      setUploadError(upErr.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    // Bust cache
    setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
    setUploading(false);
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <form action={updateProfile} className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-6 flex flex-col gap-5">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="avatar_url" value={avatarUrl} />

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-16 w-16 rounded-full object-cover border-2 border-[#e5e2db]"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#20201f] text-xl font-bold text-[#f7f6f2] border-2 border-[#e5e2db]">
              {initials}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-[#20201f]/60">{p.avatar}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="text-xs font-medium text-[#20201f] underline underline-offset-2 hover:opacity-70 disabled:opacity-40"
            >
              {uploading ? "…" : p.changeAvatar}
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl("")}
                className="text-xs text-[#20201f]/40 hover:text-red-500 transition-colors"
              >
                {p.removeAvatar}
              </button>
            )}
          </div>
          {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="ml-auto text-right">
          <p className="font-outfit font-semibold text-[#20201f] text-sm">{profile?.full_name ?? ""}</p>
          <p className="text-xs text-[#20201f]/40 mt-0.5">
            {p.memberSince} {new Date(profile?.created_at ?? "").getFullYear()}
          </p>
        </div>
      </div>

      {/* Identity lock notice */}
      {(!canChangeName || !canChangeUsername) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-relaxed">
          {p.lockedMsg}
          {!canChangeName && nameLockedUntil && (
            <div className="mt-1">{p.fullName}: {p.lockedUntil} <strong>{nameLockedUntil}</strong></div>
          )}
          {!canChangeUsername && usernameLockedUntil && (
            <div className="mt-0.5">{p.username}: {p.lockedUntil} <strong>{usernameLockedUntil}</strong></div>
          )}
        </div>
      )}

      <Input
        name="full_name"
        label={p.fullName}
        defaultValue={profile?.full_name ?? ""}
        placeholder="Jonas Jonaitis"
        disabled={!canChangeName}
        required
      />

      {/* Read-only email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#20201f]">{lang === "lt" ? "El. paštas" : "Email"}</label>
        <div className="w-full rounded-xl border border-[#e5e2db] bg-[#f0ede6] px-3 py-2.5 text-sm text-[#20201f]/60 select-all">
          {email}
        </div>
      </div>

      <Input
        name="username"
        label={p.username}
        defaultValue={profile?.username ?? ""}
        placeholder="jonas123"
        disabled={!canChangeUsername}
      />

      <Input
        name="phone"
        label={p.phone}
        defaultValue={profile?.phone ?? ""}
        placeholder={p.phonePlaceholder}
        type="tel"
      />

      <Input
        name="city"
        label={p.city}
        defaultValue={profile?.city ?? ""}
        placeholder="Vilnius"
      />

      {/* Country */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#20201f]">{p.country}</label>
        <select
          name="country"
          defaultValue={profile?.country ?? ""}
          className="w-full rounded-xl border border-[#e5e2db] bg-[#f7f6f2] px-3 py-2.5 text-sm text-[#20201f] outline-none focus:border-[#20201f] focus:ring-1 focus:ring-[#20201f] transition-colors appearance-none"
        >
          <option value="">—</option>
          {COUNTRIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {errorProp && (
        <p className="text-sm text-red-500 rounded-lg bg-red-50 px-3 py-2">{decodeURIComponent(errorProp)}</p>
      )}
      {savedProp && (
        <p className="text-sm text-green-700 rounded-lg bg-green-50 px-3 py-2">✓ {p.saved}</p>
      )}

      <Button type="submit" size="lg">{dict.common.save}</Button>
    </form>
  );
}
