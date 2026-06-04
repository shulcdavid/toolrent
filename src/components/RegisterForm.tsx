"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { register } from "@/lib/actions/auth";
import type { Locale } from "@/i18n/config";

const COUNTRIES = [
  { value: "LT", label: "🇱🇹 Lithuania" },
  { value: "LV", label: "🇱🇻 Latvia" },
  { value: "EE", label: "🇪🇪 Estonia" },
  { value: "PL", label: "🇵🇱 Poland" },
];

interface Props {
  dict: {
    fullName: string; username: string; usernamePlaceholder: string;
    email: string; password: string; passwordHint: string;
    city: string; country: string; submit: string; terms: string;
  };
  lang: Locale;
}

export function RegisterForm({ dict, lang }: Props) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <form action={register} className="flex flex-col gap-4">
      <input type="hidden" name="lang" value={lang} />
      <Input name="full_name" label={dict.fullName} placeholder="Jonas Jonaitis" required />
      <Input name="username" label={dict.username} placeholder={dict.usernamePlaceholder} required />
      <Input name="email" label={dict.email} type="email" placeholder="you@example.com" required />
      <Input name="password" label={dict.password} type="password" placeholder="••••••••" hint={dict.passwordHint} required />
      <Input name="city" label={dict.city} placeholder="Vilnius" required />

      {/* Country select */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#20201f]">{dict.country}</label>
        <select
          name="country"
          required
          defaultValue=""
          className="w-full rounded-xl border border-[#e5e2db] bg-[#f7f6f2] px-3 py-2.5 text-sm text-[#20201f] outline-none focus:border-[#20201f] focus:ring-1 focus:ring-[#20201f] transition-colors appearance-none"
        >
          <option value="" disabled>—</option>
          {COUNTRIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-500 rounded-lg bg-red-50 px-3 py-2">{decodeURIComponent(error)}</p>
      )}
      <p className="text-xs text-[#20201f]/75">{dict.terms}</p>
      <Button type="submit" size="lg" className="w-full">
        {dict.submit}
      </Button>
    </form>
  );
}
