import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { hasLocale } from "@/i18n/dictionaries";
import { createClient } from "@/lib/supabase/server";
import { PaymentPrompt } from "@/components/PaymentPrompt";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/auth/login`);

  const lt = lang === "lt";

  return (
    <div className="mx-auto max-w-md px-5 py-16 flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#20201f]">
          <CreditCard size={24} className="text-[#f7f6f2]" />
        </div>
        <h1 className="font-outfit text-2xl font-bold text-[#20201f]">
          {lt ? "Paskutinis žingsnis" : "One last step"}
        </h1>
        <p className="text-sm text-[#20201f]/65 leading-relaxed">
          {lt
            ? "Pridėkite mokėjimo kortelę, kad galėtumėte nuomoti įrankius. Pinigai bus nurašyti tik kai savininkas patvirtins jūsų užklausą."
            : "Add a payment card so you can rent tools. You'll only be charged when an owner approves your request."}
        </p>
      </div>

      <div className="w-full">
        <PaymentPrompt lang={lang} redirectTo={`/${lang}/dashboard`} />
      </div>

      <Link
        href={`/${lang}/dashboard`}
        className="text-xs text-[#20201f]/40 hover:text-[#20201f]/65 transition-colors underline underline-offset-2"
      >
        {lt ? "Praleisti dabar" : "Skip for now"}
      </Link>
    </div>
  );
}
