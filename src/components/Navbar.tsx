import Link from "next/link";
import { Wrench } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "./ui/Button";
import { MobileNav } from "./MobileNav";
import { logout } from "@/lib/actions/auth";
import type { Locale } from "@/i18n/config";

interface NavDict {
  browse: string; addListing: string; dashboard: string;
  login: string; register: string; logout: string;
}

interface NavbarProps {
  dict: NavDict;
  lang: Locale;
  user?: { id: string; email?: string } | null;
}

export function Navbar({ dict, lang, user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href={`/${lang}`} className="flex items-center gap-2 font-bold text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
            <Wrench size={16} />
          </span>
          <span className="text-lg tracking-tight">ToolRent</span>
        </Link>

        {/* Center links – desktop only */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href={`/${lang}/listings`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            {dict.browse}
          </Link>
          {user && (
            <Link href={`/${lang}/dashboard`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              {dict.dashboard}
            </Link>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={lang} />

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link href={`/${lang}/add-listing`}>
                  <Button size="sm">{dict.addListing}</Button>
                </Link>
                <form action={logout}>
                  <input type="hidden" name="lang" value={lang} />
                  <button className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-2">
                    {dict.logout}
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href={`/${lang}/auth/login`}>
                  <Button variant="ghost" size="sm">{dict.login}</Button>
                </Link>
                <Link href={`/${lang}/auth/register`}>
                  <Button size="sm">{dict.register}</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <MobileNav dict={dict} lang={lang} user={user} />
        </div>
      </nav>
    </header>
  );
}
