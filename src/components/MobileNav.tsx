"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, Search, PlusCircle, LogIn, UserPlus, LogOut, Home } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import type { Locale } from "@/i18n/config";

interface Props {
  dict: { browse: string; addListing: string; dashboard: string; login: string; register: string; logout: string };
  lang: Locale;
  user?: { id: string; email?: string } | null;
}

export function MobileNav({ dict, lang, user }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 items-center justify-center text-[#20201f]/75 hover:text-[#20201f] transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-[#20201f]/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative ml-auto flex h-full w-72 flex-col bg-[#f7f6f2]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e5e2db] px-6 py-4">
              <span className="font-outfit text-base font-semibold text-[#20201f]">Rente</span>
              <button onClick={() => setOpen(false)} className="text-[#20201f]/75 hover:text-[#20201f] transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col p-4 flex-1">
              <NavItem href={`/${lang}`} icon={Home} onClick={() => setOpen(false)}>Home</NavItem>
              <NavItem href={`/${lang}/listings`} icon={Search} onClick={() => setOpen(false)}>{dict.browse}</NavItem>
              {user && (
                <>
                  <NavItem href={`/${lang}/dashboard`} icon={LayoutDashboard} onClick={() => setOpen(false)}>{dict.dashboard}</NavItem>
                  <NavItem href={`/${lang}/add-listing`} icon={PlusCircle} onClick={() => setOpen(false)}>{dict.addListing}</NavItem>
                </>
              )}
            </nav>

            {/* Auth */}
            <div className="border-t border-[#e5e2db] p-4 flex flex-col gap-2">
              {user ? (
                <form action={logout}>
                  <input type="hidden" name="lang" value={lang} />
                  <button className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut size={16} /> {dict.logout}
                  </button>
                </form>
              ) : (
                <>
                  <NavItem href={`/${lang}/auth/login`} icon={LogIn} onClick={() => setOpen(false)}>{dict.login}</NavItem>
                  <Link
                    href={`/${lang}/auth/register`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full bg-[#20201f] px-4 py-3 text-sm font-semibold text-[#f7f6f2] hover:bg-[#3a3a38] transition-colors"
                  >
                    <UserPlus size={16} /> {dict.register}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function NavItem({ href, icon: Icon, children, onClick }: { href: string; icon: React.ElementType; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-[#20201f]/70 hover:text-[#20201f] hover:bg-[#eeece3] transition-colors"
    >
      <Icon size={16} className="text-[#20201f]/75" /> {children}
    </Link>
  );
}
