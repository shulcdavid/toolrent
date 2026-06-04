"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

interface Props {
  currentLocale: Locale;
}

const labels: Record<Locale, string> = { en: "EN", lt: "LT", pl: "PL", lv: "LV", et: "ET" };

export function LanguageSwitcher({ currentLocale }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: Locale) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <div className="flex items-center gap-0.5">
      {locales.map((locale, i) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={`px-2 py-1 text-xs font-medium transition-colors ${
            locale === currentLocale
              ? "text-[#20201f] font-semibold"
              : "text-[#20201f]/75 hover:text-[#20201f]/70"
          }`}
        >
          {labels[locale]}
        </button>
      ))}
    </div>
  );
}
