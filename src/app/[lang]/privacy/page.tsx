import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/dictionaries";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy – ToolRent" };

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const lt = lang === "lt";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{lt ? "Privatumo politika" : "Privacy Policy"}</h1>
      <p className="text-sm text-gray-400 mb-10">{lt ? "Atnaujinta: 2026 m. gegužė" : "Last updated: May 2026"}</p>
      <div className="flex flex-col gap-6 text-sm text-gray-600 leading-relaxed">
        {[
          { h: lt ? "Kokią informaciją renkame" : "What we collect",
            p: lt ? "Mes renkame jūsų vardą, el. paštą, miestą ir telefono numerį registracijos metu. Skelbimų informacija, nuotraukos ir rezervacijos taip pat saugomos mūsų duomenų bazėje."
                  : "We collect your name, email, city and phone number when you register. Listing information, photos and booking details are also stored in our database." },
          { h: lt ? "Kaip naudojame duomenis" : "How we use your data",
            p: lt ? "Jūsų duomenys naudojami tik platformos funkcionavimui: rezervacijų valdymui, pranešimams ir jūsų paskyros administravimui. Mes neparduodame jūsų duomenų trečiosioms šalims."
                  : "Your data is used only to operate the platform: managing bookings, notifications, and your account. We do not sell your data to third parties." },
          { h: lt ? "Duomenų saugojimas" : "Data storage",
            p: lt ? "Duomenys saugomi Supabase serveriuose Europos Sąjungoje (Airija). Supabase atitinka GDPR reikalavimus."
                  : "Data is stored on Supabase servers in the European Union (Ireland). Supabase is GDPR compliant." },
          { h: lt ? "Jūsų teisės" : "Your rights",
            p: lt ? "Pagal GDPR jūs turite teisę prieiti prie savo duomenų, juos koreguoti arba ištrinti. Norėdami pasinaudoti šia teise, susisiekite: hello@toolrent.lt"
                  : "Under GDPR you have the right to access, correct or delete your data. To exercise this right, contact: hello@toolrent.lt" },
          { h: lt ? "Slapukai" : "Cookies",
            p: lt ? "Naudojame tik būtinus slapukus autentifikacijai. Nenaudojame sekimo ar reklaminių slapukų."
                  : "We use only essential cookies for authentication. We do not use tracking or advertising cookies." },
        ].map((s) => (
          <div key={s.h}>
            <h2 className="font-bold text-gray-900 mb-2">{s.h}</h2>
            <p>{s.p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
