import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/dictionaries";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service – ToolRent" };

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const lt = lang === "lt";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{lt ? "Paslaugų teikimo sąlygos" : "Terms of Service"}</h1>
      <p className="text-sm text-gray-400 mb-10">{lt ? "Galioja nuo: 2026 m. gegužės" : "Effective: May 2026"}</p>
      <div className="flex flex-col gap-6 text-sm text-gray-600 leading-relaxed">
        {[
          { h: lt ? "Platformos paskirtis" : "Platform purpose",
            p: lt ? "ToolRent yra tarpininkavimo platforma, sujungianti įrankių savininkus su nuomininkais. Mes nesame sandorio šalimi ir neatsakome už sandorius tarp naudotojų."
                  : "ToolRent is a marketplace connecting tool owners with renters. We are not a party to transactions and are not responsible for dealings between users." },
          { h: lt ? "Naudotojų atsakomybė" : "User responsibility",
            p: lt ? "Savininkai atsako už tikslią skelbimų informaciją ir įrankių būklę. Nuomininkai atsako už tinkamą įrankių naudojimą ir savalaikį grąžinimą."
                  : "Owners are responsible for accurate listing information and tool condition. Renters are responsible for proper use and timely return of tools." },
          { h: lt ? "Žalos atlyginimas" : "Damage policy",
            p: lt ? "Žalos atveju šalys turėtų pirmiausia spręsti tarpusavyje. Rekomenduojame naudoti užstatą kaip apsaugą. Platforma negarantuoja žalos atlyginimo."
                  : "In case of damage, parties should first resolve it between themselves. We recommend using the deposit as protection. The platform does not guarantee damage compensation." },
          { h: lt ? "Draudžiamas turinys" : "Prohibited content",
            p: lt ? "Draudžiama skelbti netikrus skelbimus, melagingą informaciją ar naudotis platforma nesąžiningai. Pažeidėjų paskyros bus užblokuotos."
                  : "Fake listings, false information or fraudulent use of the platform is prohibited. Violating accounts will be suspended." },
          { h: lt ? "Sąlygų keitimas" : "Changes to terms",
            p: lt ? "Pasiliekame teisę keisti šias sąlygas. Esminiai pakeitimai bus pranešti el. paštu."
                  : "We reserve the right to change these terms. Material changes will be notified by email." },
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
