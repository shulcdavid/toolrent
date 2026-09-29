"use client";

import { useState, useEffect } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripeClient } from "@/lib/stripe-client";
import { CreditCard, CheckCircle } from "lucide-react";
import { Button } from "./ui/Button";

function CardForm({ lang, onSuccess }: { lang: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isLt = lang === "lt";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/setup-intent", { method: "POST" });
      const { clientSecret, error: apiErr } = await res.json();
      if (apiErr) { setError(apiErr); setLoading(false); return; }
      const card = elements.getElement(CardElement);
      if (!card) { setError("Card element missing"); setLoading(false); return; }
      const { error: stripeErr } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card },
      });
      if (stripeErr) { setError(stripeErr.message ?? "Failed"); setLoading(false); }
      else onSuccess();
    } catch (err: any) {
      setError(err?.message ?? "Unexpected error");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-3">
      <div className="rounded-xl border border-[#e5e2db] bg-white px-4 py-3.5">
        <CardElement options={{
          hidePostalCode: true,
          style: { base: { fontSize: "14px", color: "#20201f", "::placeholder": { color: "rgba(32,32,31,0.4)" } } },
        }} />
      </div>
      {error && <p className="text-sm text-red-600 rounded-lg bg-red-50 px-3 py-2">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (isLt ? "Saugoma…" : "Saving…") : (isLt ? "Išsaugoti kortelę" : "Save card")}
      </Button>
      <p className="text-xs text-center text-[#20201f]/40">
        {isLt ? "Mokėjimas bus nurašytas tik kai savininkas patvirtins užklausą." : "You won't be charged until the owner approves your request."}
      </p>
    </form>
  );
}

function Inner({ lang }: { lang: string }) {
  const [hasCard, setHasCard] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);
  const isLt = lang === "lt";

  useEffect(() => {
    fetch("/api/stripe/payment-methods")
      .then(r => r.json())
      .then(d => setHasCard((d.paymentMethods ?? []).length > 0))
      .catch(() => setHasCard(false));
  }, []);

  if (hasCard === null) return null; // still loading — show nothing

  if (hasCard || saved) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 flex items-center gap-3">
        <CheckCircle size={16} className="text-emerald-600 shrink-0" />
        <p className="text-sm text-emerald-700 font-medium">
          {isLt
            ? "Kortelė išsaugota. Mokėjimas bus nurašytas, kai savininkas patvirtins užklausą."
            : "Card saved. Payment will be charged when the owner approves."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5">
      <div className="flex items-start gap-3">
        <CreditCard size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            {isLt ? "Pridėkite mokėjimo kortelę" : "Add your payment card"}
          </p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            {isLt
              ? "Kortelė reikalinga, kad galėtume apmokėti nuomą, kai savininkas patvirtins užklausą."
              : "Your card is needed to process payment once the owner approves your request."}
          </p>
        </div>
      </div>
      <CardForm lang={lang} onSuccess={() => setSaved(true)} />
    </div>
  );
}

export function PaymentPrompt({ lang }: { lang: string }) {
  return (
    <Elements stripe={getStripeClient()}>
      <Inner lang={lang} />
    </Elements>
  );
}
