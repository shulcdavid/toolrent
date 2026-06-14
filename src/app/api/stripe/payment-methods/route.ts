import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = supabase as any;
  const { data: profile } = await db
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ paymentMethods: [] });
  }

  const stripe = getStripe();
  const list = await stripe.paymentMethods.list({
    customer: profile.stripe_customer_id,
    type: "card",
  });

  return NextResponse.json({ paymentMethods: list.data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paymentMethodId } = await request.json();
  const stripe = getStripe();
  await stripe.paymentMethods.detach(paymentMethodId);
  return NextResponse.json({ ok: true });
}
