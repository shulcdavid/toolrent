import { notFound } from "next/navigation";
import Link from "next/link";
import { hasLocale, type Locale } from "@/i18n/dictionaries";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About – ToolRent" };

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const lt = lang === "lt";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{lt ? "Apie ToolRent" : "About ToolRent"}</h1>
      <p className="text-lg text-gray-500 mb-8">
        {lt ? "Mes tikime, kad įrankiai turi dirbti, o ne dulkėti garaže."
             : "We believe tools should be working, not gathering dust in a garage."}
      </p>
      <div className="prose prose-gray max-w-none text-gray-600 flex flex-col gap-5">
        <p>{lt
          ? "ToolRent yra platforma, jungianti žmones, kuriems reikia įrankių, su tais, kurie jų nenaudoja. Vietoj to, kad kiekvienas pirktų savo gręžtuvą ar kopėčias, mes leidžiame jais dalintis."
          : "ToolRent is a platform connecting people who need tools with people who aren't using theirs. Instead of everyone buying their own drill or ladder, we let neighbours share them."}</p>
        <p>{lt
          ? "Tai naudinga visiems: nuomotojas uždirba pinigų, nuomininkas sutaupo, o planetos aplinka ačiū — gaminama mažiau naujų daiktų."
          : "This benefits everyone: the owner earns money, the renter saves money, and the planet thanks you — fewer new things get manufactured."}</p>
        <h2 className="text-xl font-bold text-gray-900 mt-4">{lt ? "Mūsų misija" : "Our mission"}</h2>
        <p>{lt
          ? "Sukurti patikimą, paprastą ir lokalią dalijimosi ekonomikos platformą Lietuvoje ir už jos ribų."
          : "To build a trusted, simple, and local sharing economy platform — starting in Lithuania."}</p>
      </div>
      <Link href={`/${lang}/listings`} className="mt-10 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">
        {lt ? "Naršyti įrankius" : "Browse tools"} <ArrowRight size={16} />
      </Link>
    </div>
  );
}
