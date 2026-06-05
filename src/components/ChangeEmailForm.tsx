"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { requestEmailChange } from "@/lib/actions/profile";

interface Props {
  lang: string;
  currentEmail: string;
  emailSent?: boolean;
  error?: string;
}

export function ChangeEmailForm({ lang, currentEmail, emailSent, error }: Props) {
  const isLt = lang === "lt";
  const [open, setOpen] = useState(!!(emailSent || error));

  return (
    <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Mail size={15} className="text-[#20201f]/60" />
          <div>
            <p className="text-sm font-semibold text-[#20201f]">
              {isLt ? "Keisti el. paštą" : "Change email"}
            </p>
            <p className="text-xs text-[#20201f]/55 mt-0.5">{currentEmail}</p>
          </div>
        </div>
        <span className="text-xs text-[#20201f]/40">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-4">
          {emailSent ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-4 text-sm text-emerald-700">
              <p className="font-semibold mb-1">
                {isLt ? "✉ Laiškas išsiųstas!" : "✉ Confirmation email sent!"}
              </p>
              <p className="text-emerald-600/80">
                {isLt
                  ? "Patikrink naujojo el. pašto dėžutę ir spustelk patvirtinimo nuorodą."
                  : "Check your new email inbox and click the confirmation link to complete the change."}
              </p>
            </div>
          ) : (
            <form action={requestEmailChange} className="flex flex-col gap-4">
              <input type="hidden" name="lang" value={lang} />
              <Input
                type="email"
                name="new_email"
                label={isLt ? "Naujas el. paštas" : "New email address"}
                placeholder="your@newemail.com"
                required
                hint={
                  isLt
                    ? "Patvirtinimo laiškas bus išsiųstas naujuoju adresu."
                    : "A confirmation link will be sent to the new address."
                }
              />
              {error && (
                <p className="text-sm text-red-500 rounded-lg bg-red-50 px-3 py-2">{error}</p>
              )}
              <Button type="submit" size="lg">
                {isLt ? "Siųsti patvirtinimą" : "Send confirmation"}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
