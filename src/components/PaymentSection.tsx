"use client";

import { useState, useEffect, useCallback } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripeClient } from "@/lib/stripe-client";
import { CreditCard, Trash2, Plus } from "lucide-react";
import { Button } from "./ui/Button";

interface PaymentMethod {
  id: string;
  card: { brand: string; last4: string; exp_month: number; exp_year: number };
}

function AddCardForm({ lang, onSuccess, onCancel }: { lang: string; onSuccess: () => void; onCancel: () => void }) {
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

    const res = await fetch("/api/stripe/setup-intent", { method: "POST" });
    const { clientSecret, error: apiError } = await res.json();
    if (apiError) { setError(apiError); setLoading(false); return; }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error: stripeError } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (stripeError) {
      setError(stripeError.message ?? "Failed to save card");
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
      <div className="rounded-xl border border-[#e5e2db] bg-[#f7f6f2] px-4 py-3.5">
        <CardElement
          options={{
            style: {
              base: { fontSize: "14px", color: "#20201f", "::placeholder": { color: "rgba(32,32,31,0.4)" } },
            },
          }}
        />
      </div>
      {error && <p className="text-sm text-red-500 rounded-lg bg-red-50 px-3 py-2">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={loading} className="flex-1">
          {loading ? "…" : (isLt ? "Išsaugoti kortelę" : "Save card")}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 flex items-center justify-center rounded-full border border-[#e5e2db] text-sm font-medium text-[#20201f]/70 hover:border-[#20201f]/40 transition-colors"
        >
          {isLt ? "Atšaukti" : "Cancel"}
        </button>
      </div>
    </form>
  );
}

function PaymentSectionInner({ lang }: { lang: string }) {
  const isLt = lang === "lt";
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  const loadMethods = useCallback(async () => {
    setLoadingCards(true);
    const res = await fetch("/api/stripe/payment-methods");
    const data = await res.json();
    setMethods(data.paymentMethods ?? []);
    setLoadingCards(false);
  }, []);

  useEffect(() => {
    if (open) loadMethods();
  }, [open, loadMethods]);

  async function removeCard(id: string) {
    await fetch("/api/stripe/payment-methods", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethodId: id }),
    });
    setMethods((prev) => prev.filter((m) => m.id !== id));
  }

  const brandLabel: Record<string, string> = {
    visa: "Visa", mastercard: "Mastercard", amex: "Amex", discover: "Discover",
  };

  return (
    <div className="rounded-2xl border border-[#e5e2db] bg-[#eeece3] p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-2">
          <CreditCard size={15} className="text-[#20201f]/60" />
          <div>
            <p className="text-sm font-semibold text-[#20201f]">
              {isLt ? "Mokėjimo kortelė" : "Payment card"}
            </p>
            {methods.length > 0 && (
              <p className="text-xs text-[#20201f]/55 mt-0.5">
                {methods.length} {isLt ? "kortelė išsaugota" : methods.length === 1 ? "card saved" : "cards saved"}
              </p>
            )}
          </div>
        </div>
        <span className="text-xs text-[#20201f]/40">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-3">
          {loadingCards && (
            <p className="text-sm text-[#20201f]/55">{isLt ? "Kraunama…" : "Loading…"}</p>
          )}

          {methods.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-[#e5e2db] bg-[#f7f6f2] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[#20201f]">
                  {brandLabel[m.card.brand] ?? m.card.brand}
                </span>
                <span className="text-sm text-[#20201f]/65">•••• {m.card.last4}</span>
                <span className="text-xs text-[#20201f]/40">
                  {String(m.card.exp_month).padStart(2, "0")}/{m.card.exp_year}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeCard(m.id)}
                className="text-[#20201f]/35 hover:text-red-500 transition-colors"
                title={isLt ? "Pašalinti" : "Remove"}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {adding ? (
            <AddCardForm
              lang={lang}
              onSuccess={() => { setAdding(false); loadMethods(); }}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#e5e2db] bg-[#f7f6f2] px-4 py-3 text-sm font-medium text-[#20201f]/55 hover:border-[#20201f]/30 hover:text-[#20201f] transition-colors"
            >
              <Plus size={14} />
              {isLt ? "Pridėti kortelę" : "Add card"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function PaymentSection({ lang }: { lang: string }) {
  return (
    <Elements stripe={getStripeClient()}>
      <PaymentSectionInner lang={lang} />
    </Elements>
  );
}
