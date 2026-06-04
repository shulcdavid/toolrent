import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { AddListingForm } from "@/components/AddListingForm";

export default async function AddListingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);

  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-[#20201f]/75 mb-1 font-outfit">{lang === "lt" ? "Nuoma" : "List a tool"}</p>
        <h1 className="font-outfit text-3xl font-bold text-[#20201f]">{dict.addListing.title}</h1>
      </div>
      <AddListingForm dict={dict} lang={lang as Locale} />
    </div>
  );
}
