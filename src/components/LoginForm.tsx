"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { login, resendConfirmation } from "@/lib/actions/auth";
import { useState } from "react";
import type { Locale } from "@/i18n/config";

interface Props {
  dict: { email: string; password: string; submit: string; forgot: string };
  lang: Locale;
}

export function LoginForm({ dict, lang }: Props) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");
  const emailFromParam = searchParams.get("email") ?? "";
  const isNotConfirmed = !!error?.toLowerCase().includes("not confirmed");
  const lt = lang === "lt";
  const [resendPending, setResendPending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  return (
    <>
      <form action={login} className="flex flex-col gap-4">
        <input type="hidden" name="lang" value={lang} />
        <Input
          name="email"
          label={dict.email}
          type="email"
          placeholder="you@example.com"
          defaultValue={emailFromParam}
          required
        />
        {/* Password row with inline forgot link */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#20201f]">{dict.password}</label>
            <Link
              href={`/${lang}/auth/forgot-password`}
              className="text-xs text-[#20201f]/65 hover:text-[#20201f] transition-colors"
            >
              {dict.forgot}
            </Link>
          </div>
          <Input name="password" type="password" placeholder="••••••••" required />
        </div>
        {message && (
          <p className="text-sm text-green-700 rounded-lg bg-green-50 px-3 py-2">
            {decodeURIComponent(message)}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-500 rounded-lg bg-red-50 px-3 py-2">
            {decodeURIComponent(error)}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full mt-1">
          {dict.submit}
        </Button>
      </form>

      {/* Resend notice — must be outside the login form to avoid nesting */}
      {isNotConfirmed && emailFromParam && (
        <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 flex flex-col gap-1.5">
          <p className="text-xs text-amber-800 leading-relaxed">
            {lt
              ? "El. paštas dar nepatvirtintas. Išsiųsk patvirtinimo laišką iš naujo."
              : "Your email hasn't been confirmed yet. Resend the confirmation link."}
          </p>
          {resendDone ? (
            <p className="text-xs font-medium text-green-700">
              {lt ? "✓ Laiškas išsiųstas!" : "✓ Email sent!"}
            </p>
          ) : (
            <form
              action={async (fd) => {
                setResendPending(true);
                await resendConfirmation(fd);
                setResendDone(true);
                setResendPending(false);
              }}
            >
              <input type="hidden" name="email" value={emailFromParam} />
              <input type="hidden" name="lang" value={lang} />
              <button
                type="submit"
                disabled={resendPending}
                className="text-xs font-semibold text-amber-900 underline underline-offset-2 hover:opacity-70 disabled:opacity-50 transition-opacity"
              >
                {resendPending
                  ? (lt ? "Siunčiama..." : "Sending…")
                  : (lt ? "Siųsti patvirtinimo laišką" : "Resend confirmation email")}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
