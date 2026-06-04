import { notFound } from "next/navigation";
import Link from "next/link";
import { hasLocale, type Locale } from "@/i18n/dictionaries";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About – Rente" };

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const lt = lang === "lt";

  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-14">
      <p className="text-xs uppercase tracking-widest text-[#20201f]/75 mb-2 font-outfit">{lt ? "Apie mus" : "About"}</p>
      <h1 className="font-outfit text-4xl font-bold text-[#20201f] mb-4">{lt ? "Apie Rente" : "About Rente"}</h1>
      <p className="text-lg text-[#20201f]/70 mb-10 leading-relaxed">
        {lt ? "Mes tikime, kad įrankiai turi dirbti, o ne dulkėti garaže."
             : "We believe tools should be working, not gathering dust in a garage."}
      </p>
      <div className="flex flex-col gap-5 text-[#20201f]/65 text-base leading-relaxed">
        <p>{lt
          ? "Rente yra platforma, jungianti žmones, kuriems reikia įrankių, su tais, kurie jų nenaudoja. Vietoj to, kad kiekvienas pirktų savo gręžtuvą ar kopėčias, mes leidžiame jais dalintis."
          : "Rente is a platform connecting people who need tools with people who aren't using theirs. Instead of everyone buying their own drill or ladder, we let neighbours share them."}</p>
        <p>{lt
          ? "Tai naudinga visiems: nuomotojas uždirba pinigų, nuomininkas sutaupo, o planetos aplinka ačiū — gaminama mažiau naujų daiktų."
          : "This benefits everyone: the owner earns money, the renter saves money, and the planet thanks you — fewer new things get manufactured."}</p>
        <h2 className="font-outfit text-xl font-bold text-[#20201f] mt-4">{lt ? "Mūsų misija" : "Our mission"}</h2>
        <p>{lt
          ? "Sukurti patikimą, paprastą ir lokalią dalijimosi ekonomikos platformą Lietuvoje ir už jos ribų."
          : "To build a trusted, simple, and local sharing economy platform — starting in Lithuania."}</p>
      </div>
      <Link href={`/${lang}/listings`} className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#20201f] px-6 py-3 text-sm font-semibold text-[#f7f6f2] hover:bg-[#3a3a38] transition-colors">
        {lt ? "Naršyti įrankius" : "Browse tools"} <ArrowRight size={15} />
      </Link>
    </div>
  );
}
