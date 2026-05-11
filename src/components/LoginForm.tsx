"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import type { Locale } from "@/i18n/dictionaries";

interface Props {
  dict: {
    email: string; password: string; submit: string; forgot: string;
  };
  lang: Locale;
}

export function LoginForm({ dict, lang }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setError(lang === "lt" ? "Neteisingas el. paštas arba slaptažodis." : "Invalid email or password.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input name="email" label={dict.email} type="email" placeholder="you@example.com" required />
      <Input name="password" label={dict.password} type="password" placeholder="••••••••" required />
      {error && <p className="text-sm text-red-500 rounded-lg bg-red-50 px-3 py-2">{error}</p>}
      <div className="flex justify-end">
        <Link href={`/${lang}/auth/forgot`} className="text-xs text-gray-400 hover:text-gray-600">
          {dict.forgot}
        </Link>
      </div>
      <Button type="submit" size="lg" disabled={loading} className="w-full mt-1">
        {loading ? "..." : dict.submit}
      </Button>
    </form>
  );
}
