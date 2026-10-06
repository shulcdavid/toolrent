"use client";

import Link from "next/link";
import { Home, Search, PlusCircle, LayoutDashboard } from "lucide-react";
import type { Locale } from "@/i18n/config";

interface Props {
  lang: Locale;
  dict: { browse: string; addListing: string; dashboard: string; login: string };
  user?: { id: string } | null;
}

export function BottomNav({ lang, dict, user }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e5e2db] bg-[#f7f6f2] md:hidden">
      <div className="flex items-center justify-around py-2">
        <NavItem href={`/${lang}`} icon={Home} label="Home" />
        <NavItem href={`/${lang}/listings`} icon={Search} label={dict.browse} />
        <NavItem href={`/${lang}/add-listing`} icon={PlusCircle} label={dict.addListing} primary />
        <NavItem
          href={user ? `/${lang}/dashboard` : `/${lang}/auth/login`}
          icon={LayoutDashboard}
          label={user ? dict.dashboard : dict.login}
        />
      </div>
    </div>
  );
}

function NavItem({
  href, icon: Icon, label, primary,
}: {
  href: string; icon: React.ElementType; label: string; primary?: boolean;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 px-4 py-1">
      <span className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
        primary ? "bg-[#20201f] text-[#f7f6f2]" : "text-[#20201f]/65"
      }`}>
        <Icon size={18} />
      </span>
      <span className={`text-[10px] font-medium truncate max-w-[64px] text-center ${
        primary ? "text-[#20201f]" : "text-[#20201f]/75"
      }`}>{label}</span>
    </Link>
  );
}
