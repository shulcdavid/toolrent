import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
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
    <header className="sticky top-0 z-50 border-b border-[#e5e2db] bg-[#f7f6f2]/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link href={`/${lang}`} className="font-outfit text-xl font-bold tracking-tight text-[#20201f]">
          Rente
        </Link>

        {/* Center links – desktop only */}
        <div className="hidden items-center gap-0 md:flex">
          <Link href={`/${lang}/listings`} className="text-sm text-[#20201f]/75 hover:text-[#20201f] transition-colors px-4">
            {dict.browse}
          </Link>
          {user && (
            <>
              <span className="text-[#e5e2db] select-none">/</span>
              <Link href={`/${lang}/dashboard`} className="text-sm text-[#20201f]/75 hover:text-[#20201f] transition-colors px-4">
                {dict.dashboard}
              </Link>
            </>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-0">
            <LanguageSwitcher currentLocale={lang} />
            <span className="text-[#e5e2db] select-none mx-1">/</span>
            {user ? (
              <>
                <Link href={`/${lang}/add-listing`} className="text-sm text-[#20201f]/75 hover:text-[#20201f] transition-colors px-3">
                  {dict.addListing}
                </Link>
                <span className="text-[#e5e2db] select-none">/</span>
                <form action={logout} className="flex">
                  <input type="hidden" name="lang" value={lang} />
                  <button className="text-sm text-[#20201f]/75 hover:text-[#20201f] transition-colors px-3">
                    {dict.logout}
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href={`/${lang}/auth/login`} className="text-sm text-[#20201f]/75 hover:text-[#20201f] transition-colors px-3">
                  {dict.login}
                </Link>
                <span className="text-[#e5e2db] select-none">/</span>
                <Link href={`/${lang}/auth/register`} className="text-sm font-medium text-[#20201f] hover:text-[#20201f]/70 transition-colors px-3">
                  {dict.register}
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
