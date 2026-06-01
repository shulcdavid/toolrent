import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Supabase Auth callback handler.
 * Supabase redirects here after email confirmation / magic link / OAuth.
 * We exchange the one-time code for a session and redirect the user onward.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/en/dashboard";
  const lang = next.split("/")[1] ?? "en"; // pull locale from next for error redirect

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — send back to login with a readable error
  return NextResponse.redirect(
    `${origin}/${lang}/auth/login?error=${encodeURIComponent("Email verification failed. Please try again.")}`
  );
}
