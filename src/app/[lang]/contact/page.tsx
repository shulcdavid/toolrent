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
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">{lt ? "Susisiekite" : "Contact us"}</h1>
      <p className="text-gray-500 mb-10">{lt ? "Turite klausimų? Mes visada pasiruošę padėti." : "Have questions? We're always happy to help."}</p>

      <div className="flex flex-col gap-4 mb-10">
        <a href="mailto:hello@toolrent.lt" className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 hover:border-orange-200 hover:bg-orange-50 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600"><Mail size={20} /></div>
          <div>
            <p className="font-semibold text-gray-900">Email</p>
            <p className="text-sm text-gray-500">hello@toolrent.lt</p>
          </div>
        </a>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="flex items-center gap-2 font-semibold text-gray-900 mb-5">
          <MessageSquare size={18} className="text-orange-500" />
          {lt ? "Siųsti žinutę" : "Send a message"}
        </div>
        <form className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">{lt ? "Vardas" : "Name"}</label>
            <input name="name" placeholder={lt ? "Jonas Jonaitis" : "John Smith"} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
            <input name="email" type="email" placeholder="you@example.com" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">{lt ? "Žinutė" : "Message"}</label>
            <textarea name="message" rows={4} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
          </div>
          <button type="submit" className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">
            {lt ? "Siųsti" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
