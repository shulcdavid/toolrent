"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import type { Locale } from "@/i18n/dictionaries";

interface Props {
  dict: {
    fullName: string; email: string; password: string;
    passwordHint: string; city: string; submit: string; terms: string;
  };
  lang: Locale;
}

export function RegisterForm({ dict, lang }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => router.push(`/${lang}`), 1500);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <p className="font-semibold text-gray-900">
          {lang === "lt" ? "Paskyra sukurta!" : "Account created!"}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input name="full_name" label={dict.fullName} placeholder="Jonas Jonaitis" required />
      <Input name="email" label={dict.email} type="email" placeholder="you@example.com" required />
      <Input name="password" label={dict.password} type="password" placeholder="••••••••" hint={dict.passwordHint} required />
      <Input name="city" label={dict.city} placeholder="Vilnius" required />
      <p className="text-xs text-gray-400">{dict.terms}</p>
      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading ? "..." : dict.submit}
      </Button>
    </form>
  );
}
