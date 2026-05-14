import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/dictionaries";
import { Mail, MessageSquare } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact – ToolRent" };

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const lt = lang === "lt";

  return (
    <div className="mx-auto max-w-xl px-5 sm:px-8 py-14">
      <p className="text-xs uppercase tracking-widest text-[#20201f]/40 mb-2 font-outfit">{lt ? "Kontaktai" : "Contact"}</p>
      <h1 className="font-outfit text-4xl font-bold text-[#20201f] mb-3">{lt ? "Susisiekite" : "Contact us"}</h1>
      <p className="text-[#20201f]/55 mb-10">{lt ? "Turite klausimų? Mes visada pasiruošę padėti." : "Have questions? We're always happy to help."}</p>

      <div className="flex flex-col gap-4 mb-10">
        <a href="mailto:hello@toolrent.lt" className="flex items-center gap-4 rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-5 hover:border-[#c8c4bc] transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#20201f] text-[#f7f6f2]"><Mail size={18} /></div>
          <div>
            <p className="font-outfit font-semibold text-[#20201f] text-sm">Email</p>
            <p className="text-sm text-[#20201f]/50">hello@toolrent.lt</p>
          </div>
        </a>
      </div>

      <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-6">
        <div className="flex items-center gap-2 font-outfit font-semibold text-[#20201f] mb-5 text-sm">
          <MessageSquare size={16} className="text-[#20201f]/40" />
          {lt ? "Siųsti žinutę" : "Send a message"}
        </div>
        <form className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-[#20201f] block mb-1.5">{lt ? "Vardas" : "Name"}</label>
            <input name="name" placeholder={lt ? "Jonas Jonaitis" : "John Smith"} className="w-full rounded-xl border border-[#e5e2db] bg-[#f7f6f2] px-4 py-2.5 text-sm text-[#20201f] placeholder:text-[#20201f]/35 focus:outline-none focus:ring-2 focus:ring-[#20201f]/15" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#20201f] block mb-1.5">Email</label>
            <input name="email" type="email" placeholder="you@example.com" className="w-full rounded-xl border border-[#e5e2db] bg-[#f7f6f2] px-4 py-2.5 text-sm text-[#20201f] placeholder:text-[#20201f]/35 focus:outline-none focus:ring-2 focus:ring-[#20201f]/15" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#20201f] block mb-1.5">{lt ? "Žinutė" : "Message"}</label>
            <textarea name="message" rows={4} className="w-full rounded-xl border border-[#e5e2db] bg-[#f7f6f2] px-4 py-2.5 text-sm text-[#20201f] focus:outline-none focus:ring-2 focus:ring-[#20201f]/15 resize-none" />
          </div>
          <button type="submit" className="rounded-full bg-[#20201f] px-6 py-3 text-sm font-semibold text-[#f7f6f2] hover:bg-[#3a3a38] transition-colors">
            {lt ? "Siųsti" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
