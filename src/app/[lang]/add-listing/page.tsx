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
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{dict.addListing.title}</h1>
      <AddListingForm dict={dict} lang={lang as Locale} />
    </div>
  );
}
