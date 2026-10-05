import { createClient } from "@/lib/supabase/server";
import { daysBetween } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const db = supabase as any;
  const { data: booking } = await db
    .from("bookings")
    .select("*, listings(title, price_per_day, city, user_id)")
    .eq("id", bookingId)
    .single();

  if (!booking) return new Response("Not found", { status: 404 });

  const isRenter = booking.renter_id === user.id;
  const isOwner = booking.listings?.user_id === user.id;
  if (!isRenter && !isOwner) return new Response("Forbidden", { status: 403 });

  const [{ data: renterProfile }, { data: ownerProfile }] = await Promise.all([
    db.from("profiles").select("full_name, company_name, vat_code, city").eq("id", booking.renter_id).single(),
    db.from("profiles").select("full_name, company_name, vat_code, city").eq("id", booking.listings?.user_id).single(),
  ]);

  const invoiceNumber = bookingId.slice(0, 8).toUpperCase();
  const today = new Date().toLocaleDateString("lt-LT");
  const fmt = (n: number) => n.toLocaleString("lt-LT", { style: "currency", currency: "EUR" });
  const days = daysBetween(booking.start_date, booking.end_date);

  const html = `<!DOCTYPE html>
<html lang="lt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sąskaita INV-${invoiceNumber}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Helvetica Neue',Arial,sans-serif;color:#20201f;background:#f7f6f2;padding:40px 20px}
  .wrap{max-width:720px;margin:0 auto;background:#fff;border-radius:16px;padding:56px;border:1px solid #e5e2db}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:32px;margin-bottom:40px;border-bottom:2px solid #20201f}
  .brand{font-size:26px;font-weight:700;letter-spacing:-0.5px}
  .brand span{font-size:12px;font-weight:400;color:rgba(32,32,31,0.5);display:block;margin-top:2px;letter-spacing:normal}
  .inv-meta{text-align:right}
  .inv-meta h1{font-size:18px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em}
  .inv-meta p{font-size:13px;color:rgba(32,32,31,0.6);margin-top:6px}
  .parties{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:40px}
  .party h3{font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:rgba(32,32,31,0.45);margin-bottom:10px}
  .party p{font-size:14px;line-height:1.6;color:#20201f}
  .party .gray{color:rgba(32,32,31,0.55);font-size:13px}
  table{width:100%;border-collapse:collapse;margin-bottom:28px}
  th{text-align:left;padding:8px 0;border-bottom:1px solid #e5e2db;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(32,32,31,0.45);font-weight:600}
  td{padding:14px 0;border-bottom:1px solid #e5e2db;font-size:14px;vertical-align:top}
  .totals-wrap{display:flex;justify-content:flex-end}
  .totals{width:280px}
  .totals td{border:none;padding:5px 0}
  .totals td:last-child{text-align:right;font-weight:600}
  .total-row td{font-size:17px;font-weight:700;padding-top:14px;border-top:2px solid #20201f}
  .footer{margin-top:56px;padding-top:20px;border-top:1px solid #e5e2db;font-size:12px;color:rgba(32,32,31,0.4);text-align:center}
  .print-btn{position:fixed;bottom:24px;right:24px;background:#20201f;color:#f7f6f2;border:none;padding:12px 26px;border-radius:999px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.2)}
  .status-paid{display:inline-block;background:#dcfce7;color:#166534;border:1px solid #86efac;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-top:8px}
  @media print{.print-btn{display:none}body{background:#fff;padding:0}.wrap{border:none;border-radius:0;padding:40px;box-shadow:none}}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="brand">Rente<span>P2P įrankių nuoma · rente.lt</span></div>
    <div class="inv-meta">
      <h1>Sąskaita-faktūra</h1>
      <p>№ INV-${invoiceNumber}</p>
      <p>Data: ${today}</p>
      ${booking.stripe_payment_intent_id ? '<div class="status-paid">✓ Apmokėta</div>' : ""}
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Pardavėjas (Savininkas)</h3>
      <p>${ownerProfile?.full_name ?? "—"}</p>
      ${ownerProfile?.company_name ? `<p>${ownerProfile.company_name}</p>` : ""}
      ${ownerProfile?.vat_code ? `<p class="gray">PVM: ${ownerProfile.vat_code}</p>` : ""}
      ${ownerProfile?.city ? `<p class="gray">${ownerProfile.city}</p>` : ""}
    </div>
    <div class="party">
      <h3>Pirkėjas (Nuomininkas)</h3>
      <p>${renterProfile?.full_name ?? "—"}</p>
      ${renterProfile?.company_name ? `<p>${renterProfile.company_name}</p>` : ""}
      ${renterProfile?.vat_code ? `<p class="gray">PVM: ${renterProfile.vat_code}</p>` : ""}
      ${renterProfile?.city ? `<p class="gray">${renterProfile.city}</p>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:40%">Aprašymas</th>
        <th>Datos</th>
        <th>Dienos</th>
        <th style="text-align:right">Kaina/d.</th>
        <th style="text-align:right">Suma</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${booking.listings?.title ?? "—"}</td>
        <td>${booking.start_date} – ${booking.end_date}</td>
        <td>${days}</td>
        <td style="text-align:right">${fmt(booking.listings?.price_per_day ?? 0)}</td>
        <td style="text-align:right">${fmt(booking.tool_price ?? 0)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals-wrap">
    <table class="totals">
      <tbody>
        <tr><td>Įrankio nuoma</td><td>${fmt(booking.tool_price ?? 0)}</td></tr>
        <tr><td style="color:rgba(32,32,31,0.6)">Paslaugų mokestis (10%)</td><td style="color:rgba(32,32,31,0.6)">${fmt(booking.service_fee ?? 0)}</td></tr>
        <tr class="total-row"><td>IŠ VISO</td><td>${fmt(booking.total_price ?? 0)}</td></tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>© ${new Date().getFullYear()} Rente · rente.lt · Sąskaita sugeneruota ${today}</p>
  </div>
</div>
<button class="print-btn" onclick="window.print()">🖨 Spausdinti / PDF</button>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
