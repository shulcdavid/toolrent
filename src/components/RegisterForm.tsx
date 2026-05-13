"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { register } from "@/lib/actions/auth";
import type { Locale } from "@/i18n/config";

interface Props {
  dict: { fullName: string; email: string; password: string; passwordHint: string; city: string; submit: string; terms: string };
  lang: Locale;
}

export function RegisterForm({ dict, lang }: Props) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <form action={register} className="flex flex-col gap-4">
      <input type="hidden" name="lang" value={lang} />
      <Input name="full_name" label={dict.fullName} placeholder="Jonas Jonaitis" required />
      <Input name="email" label={dict.email} type="email" placeholder="you@example.com" required />
      <Input name="password" label={dict.password} type="password" placeholder="••••••••" hint={dict.passwordHint} required />
      <Input name="city" label={dict.city} placeholder="Vilnius" required />
      {error && (
        <p className="text-sm text-red-500 rounded-lg bg-red-50 px-3 py-2">{decodeURIComponent(error)}</p>
      )}
      <p className="text-xs text-gray-400">{dict.terms}</p>
      <Button type="submit" size="lg" className="w-full">
        {dict.submit}
      </Button>
    </form>
  );
}
