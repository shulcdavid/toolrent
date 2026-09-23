import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/i18n/dictionaries";
import { AddListingForm } from "@/components/AddListingForm";
import { createClient } from "@/lib/supabase/server";

export default async function AddListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);
  const { edit } = await searchParams;

  let initialData: any = null;
  if (edit) {
    const supabase = await createClient();
    const { data } = await (supabase as any).from("listings").select("*").eq("id", edit).single();
    initialData = data ?? null;
  }

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-[#20201f]/75 mb-1 font-outfit">
          {lang === "lt" ? "Nuoma" : "List a tool"}
        </p>
        <h1 className="font-outfit text-3xl font-bold text-[#20201f]">
          {initialData
            ? (lang === "lt" ? "Redaguoti skelbimą" : "Edit listing")
            : dict.addListing.title}
        </h1>
      </div>
      <AddListingForm dict={dict} lang={lang as Locale} initialData={initialData} />
    </div>
  );
}
