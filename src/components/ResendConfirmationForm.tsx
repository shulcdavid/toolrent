"use client";

import { useEffect, useState } from "react";
import { resendConfirmation } from "@/lib/actions/auth";

interface Props {
  email: string;
  lang: string;
  justResent?: boolean;
  isLt?: boolean;
}

export function ResendConfirmationForm({ email, lang, justResent, isLt }: Props) {
  const [cooldown, setCooldown] = useState(justResent ? 60 : 0);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  return (
    <div className="flex flex-col items-center gap-2">
      {justResent && cooldown > 0 && (
        <p className="text-xs text-green-600 font-medium">
          {isLt ? "✓ Laiškas išsiųstas iš naujo!" : "✓ Email resent!"}
        </p>
      )}
      <form
        action={async (fd) => {
          setPending(true);
          await resendConfirmation(fd);
        }}
      >
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="lang" value={lang} />
        <button
          type="submit"
          disabled={cooldown > 0 || pending}
          className="text-sm font-medium text-[#20201f] underline underline-offset-2 hover:opacity-70 disabled:opacity-40 disabled:no-underline transition-opacity"
        >
          {pending
            ? (isLt ? "Siunčiama..." : "Sending…")
            : cooldown > 0
            ? (isLt ? `Siųsti iš naujo (${cooldown}s)` : `Resend in ${cooldown}s`)
            : (isLt ? "Siųsti patvirtinimo laišką iš naujo" : "Resend confirmation email")}
        </button>
      </form>
    </div>
  );
}
