"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { login } from "@/lib/actions/auth";
import type { Locale } from "@/i18n/config";

interface Props {
  dict: { email: string; password: string; submit: string; forgot: string };
  lang: Locale;
}

export function LoginForm({ dict, lang }: Props) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <form action={login} className="flex flex-col gap-4">
      <input type="hidden" name="lang" value={lang} />
      <Input name="email" label={dict.email} type="email" placeholder="you@example.com" required />
      <Input name="password" label={dict.password} type="password" placeholder="••••••••" required />
      {error && (
        <p className="text-sm text-red-500 rounded-lg bg-red-50 px-3 py-2">{decodeURIComponent(error)}</p>
      )}
      <Button type="submit" size="lg" className="w-full mt-1">
        {dict.submit}
      </Button>
    </form>
  );
}
