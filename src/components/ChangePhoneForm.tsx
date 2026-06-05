"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { requestPhoneOtp, verifyPhoneOtp } from "@/lib/actions/profile";

interface Props {
  lang: string;
  currentPhone: string | null;
  otpSent?: boolean;
  error?: string;
}

export function ChangePhoneForm({ lang, currentPhone, otpSent, error }: Props) {
  const isLt = lang === "lt";
  const [open, setOpen] = useState(!!(otpSent || error));

  return (
    <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Phone size={15} className="text-[#20201f]/60" />
          <div>
            <p className="text-sm font-semibold text-[#20201f]">
              {isLt ? "Keisti telefono numerį" : "Change phone number"}
            </p>
            {currentPhone && (
              <p className="text-xs text-[#20201f]/55 mt-0.5">{currentPhone}</p>
            )}
          </div>
        </div>
        <span className="text-xs text-[#20201f]/40">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-4">
          {otpSent ? (
            /* Step 2: enter the OTP code */
            <form action={verifyPhoneOtp} className="flex flex-col gap-4">
              <input type="hidden" name="lang" value={lang} />
              <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
                {isLt
                  ? "6 skaitmenų kodas išsiųstas į tavo el. paštą. Kodas galioja 15 minučių."
                  : "A 6-digit code was sent to your email. It expires in 15 minutes."}
              </div>
              <Input
                name="otp"
                label={isLt ? "Patvirtinimo kodas" : "Verification code"}
                placeholder="123456"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]{6}"
                required
                hint={isLt ? "Įvesk 6 skaitmenų kodą iš el. laiško" : "Enter the 6-digit code from your email"}
              />
              {error && (
                <p className="text-sm text-red-500 rounded-lg bg-red-50 px-3 py-2">{error}</p>
              )}
              <div className="flex gap-3">
                <Button type="submit" size="lg" className="flex-1">
                  {isLt ? "Patvirtinti" : "Verify"}
                </Button>
                <a
                  href={`?`}
                  className="flex-1 flex items-center justify-center rounded-full border border-[#e5e2db] text-sm font-medium text-[#20201f]/70 hover:border-[#20201f]/40 transition-colors"
                >
                  {isLt ? "Atšaukti" : "Cancel"}
                </a>
              </div>
            </form>
          ) : (
            /* Step 1: enter new phone number */
            <form action={requestPhoneOtp} className="flex flex-col gap-4">
              <input type="hidden" name="lang" value={lang} />
              <Input
                type="tel"
                name="new_phone"
                label={isLt ? "Naujas telefono numeris" : "New phone number"}
                placeholder="+370 600 00000"
                required
                hint={
                  isLt
                    ? "Patvirtinimo kodas bus išsiųstas į tavo el. paštą."
                    : "A verification code will be sent to your email."
                }
              />
              {error && (
                <p className="text-sm text-red-500 rounded-lg bg-red-50 px-3 py-2">{error}</p>
              )}
              <Button type="submit" size="lg">
                {isLt ? "Siųsti kodą" : "Send code"}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
