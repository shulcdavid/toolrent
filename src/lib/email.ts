import { Resend } from "resend";

const FROM = "ToolRent <noreply@toolrent.lt>";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendBookingRequestEmail(opts: {
  ownerEmail: string;
  ownerName: string;
  renterName: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
  message: string;
  listingUrl: string;
}) {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: opts.ownerEmail,
    subject: `New booking request for "${opts.listingTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#f97316;padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:22px">🔧 ToolRent</h1>
        </div>
        <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="margin:0 0 16px">New booking request</h2>
          <p style="color:#6b7280">Hi ${opts.ownerName}, <strong>${opts.renterName}</strong> wants to rent your tool.</p>
          <div style="background:#f9fafb;border-radius:10px;padding:16px;margin:20px 0">
            <p style="margin:0 0 8px"><strong>Tool:</strong> ${opts.listingTitle}</p>
            <p style="margin:0 0 8px"><strong>Dates:</strong> ${opts.startDate} → ${opts.endDate}</p>
            ${opts.message ? `<p style="margin:0"><strong>Message:</strong> "${opts.message}"</p>` : ""}
          </div>
          <a href="${opts.listingUrl}" style="display:inline-block;background:#f97316;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">
            View request →
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendBookingStatusEmail(opts: {
  renterEmail: string;
  renterName: string;
  listingTitle: string;
  status: "approved" | "rejected";
  listingUrl: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const approved = opts.status === "approved";

  await resend.emails.send({
    from: FROM,
    to: opts.renterEmail,
    subject: `Your booking was ${approved ? "approved ✅" : "declined"} – ${opts.listingTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#f97316;padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:22px">🔧 ToolRent</h1>
        </div>
        <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="margin:0 0 16px">${approved ? "✅ Booking approved!" : "❌ Booking declined"}</h2>
          <p style="color:#6b7280">Hi ${opts.renterName}, your booking request for <strong>${opts.listingTitle}</strong> was ${approved ? "approved. You can now coordinate pickup with the owner." : "declined by the owner."}</p>
          ${approved ? `<a href="${opts.listingUrl}" style="display:inline-block;background:#f97316;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:16px">View listing →</a>` : ""}
        </div>
      </div>
    `,
  });
}
