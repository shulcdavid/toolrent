"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Auth callback page — handles both flows Supabase can produce:
 *
 * 1. Implicit flow  → tokens arrive as a URL hash (#access_token=…&refresh_token=…)
 * 2. PKCE flow      → code arrives as a query param (?code=…)
 *
 * The middleware redirects /auth/callback → /[lang]/auth/callback, so this
 * page is the actual landing point after the user clicks the confirmation link.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const next = searchParams.get("next") ?? "/en/dashboard";

    async function handleCallback() {
      // ── PKCE flow: ?code=… ──────────────────────────────────────────────
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) { window.location.replace(next); return; }
      }

      // ── Implicit flow: #access_token=…&refresh_token=… ──────────────────
      const hash = window.location.hash.substring(1); // strip leading #
      if (hash) {
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          // Hard redirect so server re-reads the session cookies properly
          if (!error) { window.location.replace(next); return; }
        }
      }

      // ── Fallback: just refresh session from cookies ──────────────────────
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        window.location.replace(next);
      } else {
        window.location.replace("/en/auth/login?error=" + encodeURIComponent("Email verification failed. Please try again."));
      }
    }

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#20201f] border-t-transparent" />
        <p className="text-sm text-[#20201f]/50">Verifying…</p>
      </div>
    </div>
  );
}
