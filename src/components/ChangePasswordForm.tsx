"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { updatePassword } from "@/lib/actions/profile";

interface Props {
  lang: string;
  error?: string;
  saved?: boolean;
}

export function ChangePasswordForm({ lang, error, saved }: Props) {
  const isLt = lang === "lt";
  const [open, setOpen] = useState(!!(error || saved));

  return (
    <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[#20201f]">
          <KeyRound size={15} className="text-[#20201f]/60" />
          {isLt ? "Keisti slaptažodį" : "Change password"}
        </span>
        <span className="text-xs text-[#20201f]/40">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <form action={updatePassword} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="lang" value={lang} />
          <Input
            type="password"
            name="old_password"
            label={isLt ? "Dabartinis slaptažodis" : "Current password"}
            placeholder="••••••••"
            required
          />
          <Input
            type="password"
            name="new_password"
            label={isLt ? "Naujas slaptažodis" : "New password"}
            placeholder="••••••••"
            required
            hint={isLt ? "Mažiausiai 8 simboliai" : "At least 8 characters"}
          />
          <Input
            type="password"
            name="confirm_password"
            label={isLt ? "Pakartoti slaptažodį" : "Confirm new password"}
            placeholder="••••••••"
            required
          />
          {error && (
            <p className="text-sm text-red-500 rounded-lg bg-red-50 px-3 py-2">{error}</p>
          )}
          {saved && (
            <p className="text-sm text-green-700 rounded-lg bg-green-50 px-3 py-2">
              ✓ {isLt ? "Slaptažodis sėkmingai pakeistas" : "Password changed successfully"}
            </p>
          )}
          <Button type="submit" size="lg">
            {isLt ? "Išsaugoti slaptažodį" : "Save password"}
          </Button>
        </form>
      )}
    </div>
  );
}
