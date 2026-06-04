"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { deleteAccount } from "@/lib/actions/account";

interface Props {
  lang: string;
  email: string;
  deleteError?: string;
}

export function DeleteAccountForm({ lang, email, deleteError }: Props) {
  const isLt = lang === "lt";
  const [open, setOpen] = useState(!!deleteError);
  const [typed, setTyped] = useState("");

  const matches = typed.trim().toLowerCase() === email.toLowerCase();

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-red-600">
          <TriangleAlert size={15} />
          {isLt ? "Panaikinti paskyrą" : "Delete account"}
        </span>
        <span className="text-xs text-red-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <form action={deleteAccount} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="lang" value={lang} />

          <p className="text-sm text-red-700/80 leading-relaxed">
            {isLt
              ? "Ši operacija negrįžtama. Visi jūsų duomenys, skelbimai ir užsakymai bus ištrinti visam laikui."
              : "This action is irreversible. All your data, listings, and bookings will be permanently deleted."}
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-red-700">
              {isLt
                ? `Norėdami patvirtinti, įveskite savo el. paštą: `
                : `To confirm, type your email address: `}
              <span className="font-bold">{email}</span>
            </label>
            <input
              name="email_confirm"
              type="email"
              autoComplete="off"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={email}
              className="w-full rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm text-[#20201f] placeholder:text-[#20201f]/75 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300 transition-colors"
            />
          </div>

          {deleteError && (
            <p className="text-xs text-red-600 bg-red-100 rounded-lg px-3 py-2">{deleteError}</p>
          )}

          <button
            type="submit"
            disabled={!matches}
            className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isLt ? "Ištrinti paskyrą visam laikui" : "Permanently delete my account"}
          </button>
        </form>
      )}
    </div>
  );
}
