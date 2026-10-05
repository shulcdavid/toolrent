"use client";

import { useState, useRef } from "react";
import { sendMessageToOwner } from "@/lib/actions/messaging";

interface Props {
  lang: string;
  listingId: string;
}

export function ContactOwnerForm({ lang, listingId }: Props) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const lt = lang === "lt";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await sendMessageToOwner(formData);
    if (result.success) {
      setSent(true);
      formRef.current?.reset();
    } else {
      setError(result.error ?? (lt ? "Klaida. Bandykite vėliau." : "Error. Please try again."));
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <p className="text-sm text-emerald-700 font-medium">
          ✓ {lt
            ? "Žinutė išsiųsta! Savininkas atsakys jūsų el. paštu."
            : "Message sent! The owner will reply to your email."}
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-5 flex flex-col gap-4"
    >
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="listing_id" value={listingId} />
      <h2 className="font-outfit font-semibold text-[#20201f] text-sm uppercase tracking-wide">
        {lt ? "Rašyti savininkui" : "Contact owner"}
      </h2>
      <textarea
        name="message"
        required
        rows={3}
        placeholder={lt
          ? "Užduokite klausimą apie šį įrankį…"
          : "Ask a question about this tool…"}
        className="w-full rounded-xl border border-[#e5e2db] bg-[#f7f6f2] px-3 py-2.5 text-sm text-[#20201f] resize-none focus:outline-none focus:ring-1 focus:ring-[#20201f] placeholder:text-[#20201f]/40 transition-colors"
      />
      {error && (
        <p className="text-sm text-red-600 rounded-lg bg-red-50 px-3 py-2">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#20201f] py-2.5 text-sm font-semibold text-[#f7f6f2] hover:bg-[#3a3a38] transition-colors disabled:opacity-50"
      >
        {loading
          ? (lt ? "Siunčiama…" : "Sending…")
          : (lt ? "Siųsti žinutę" : "Send message")}
      </button>
    </form>
  );
}
