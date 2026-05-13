"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Wrench, LayoutDashboard, Search, PlusCircle, LogIn, UserPlus, LogOut } from "lucide-react";
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
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative ml-auto flex h-full w-72 flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white">
                  <Wrench size={14} />
                </span>
                ToolRent
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-1 p-4 flex-1">
              <NavItem href={`/${lang}/listings`} icon={Search} onClick={() => setOpen(false)}>
                {dict.browse}
              </NavItem>
              {user && (
                <>
                  <NavItem href={`/${lang}/dashboard`} icon={LayoutDashboard} onClick={() => setOpen(false)}>
                    {dict.dashboard}
                  </NavItem>
                  <NavItem href={`/${lang}/add-listing`} icon={PlusCircle} onClick={() => setOpen(false)}>
                    {dict.addListing}
                  </NavItem>
                </>
              )}
            </nav>

            {/* Auth */}
            <div className="border-t border-gray-100 p-4 flex flex-col gap-2">
              {user ? (
                <form action={logout}>
                  <input type="hidden" name="lang" value={lang} />
                  <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={18} /> {dict.logout}
                  </button>
                </form>
              ) : (
                <>
                  <NavItem href={`/${lang}/auth/login`} icon={LogIn} onClick={() => setOpen(false)}>
                    {dict.login}
                  </NavItem>
                  <Link
                    href={`/${lang}/auth/register`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                  >
                    <UserPlus size={16} /> {dict.register}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav for mobile (always visible) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/95 backdrop-blur-sm md:hidden">
        <div className="flex items-center justify-around py-2">
          <BottomNavItem href={`/${lang}`} icon={Wrench} label="Home" />
          <BottomNavItem href={`/${lang}/listings`} icon={Search} label={dict.browse} />
          <BottomNavItem href={`/${lang}/add-listing`} icon={PlusCircle} label={dict.addListing} primary />
          <BottomNavItem href={user ? `/${lang}/dashboard` : `/${lang}/auth/login`} icon={LayoutDashboard} label={user ? dict.dashboard : dict.login} />
        </div>
      </div>
    </div>
  );
}

function NavItem({ href, icon: Icon, children, onClick }: { href: string; icon: React.ElementType; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <Icon size={18} className="text-gray-400" /> {children}
    </Link>
  );
}

function BottomNavItem({ href, icon: Icon, label, primary }: { href: string; icon: React.ElementType; label: string; primary?: boolean }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 px-4 py-1">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${primary ? "bg-orange-500 text-white" : "text-gray-500"}`}>
        <Icon size={20} />
      </span>
      <span className={`text-[10px] font-medium ${primary ? "text-orange-600" : "text-gray-500"} truncate max-w-[60px] text-center`}>{label}</span>
    </Link>
  );
}
