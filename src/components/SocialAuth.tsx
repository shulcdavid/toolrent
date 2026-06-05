"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/i18n/config";
import type { Provider } from "@supabase/supabase-js";

interface Props {
  lang: Locale;
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.33.07 2.24.73 3.01.75.93-.14 1.81-.84 3.19-.9 1.37-.06 2.75.53 3.52 1.61-3.19 1.92-2.56 6.2.65 7.4-.62 1.65-1.35 3.28-2.37 4zm-3.47-17.57C15.18.65 17.01.5 17.13 2.38c-1.63.15-3.13 1.6-3.55 3.33z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

const providers: { id: Provider; label: string; Icon: () => React.ReactElement }[] = [
  { id: "google",   label: "Continue with Google",   Icon: GoogleIcon },
  { id: "facebook", label: "Continue with Facebook", Icon: FacebookIcon },
];

export function SocialAuth({ lang }: Props) {
  const supabase = createClient();

  async function signInWith(provider: Provider) {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/${lang}/dashboard`,
      },
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {providers.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => signInWith(id)}
          className="relative flex items-center justify-center gap-3 w-full rounded-xl border border-[#d4d0c8] bg-white hover:bg-[#fafaf8] active:bg-[#f0ede6] transition-colors px-4 py-3 text-sm font-medium text-[#20201f] shadow-sm"
        >
          <span className="absolute left-4 flex items-center">
            <Icon />
          </span>
          {label}
        </button>
      ))}
    </div>
  );
}
