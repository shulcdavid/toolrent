import { Resend } from "resend";

// onboarding@resend.dev works on free plan without domain verification
const FROM = "Rente <onboarding@resend.dev>";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendConfirmationEmail(opts: {
  to: string;
  name: string;
  confirmUrl: string;
  lang?: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const lt = opts.lang === "lt";
  const subject = lt ? "Patvirtink savo Rente paskyrą" : "Confirm your Rente account";

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f7f6f2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6f2;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e5e2db;overflow:hidden;max-width:520px;">
        <tr>
          <td style="background:#20201f;padding:28px 40px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#f7f6f2;letter-spacing:-0.5px;">Rente</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#20201f;">
              ${opts.name
                ? (lt ? `Sveiki, ${opts.name}!` : `Hi ${opts.name},`)
                : (lt ? "Sveiki!" : "Hello!")}
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:rgba(32,32,31,0.6);line-height:1.6;">
              ${lt
                ? "Spustelk žemiau esantį mygtuką, kad patvirtintum savo el. pašto adresą ir aktyvuotum paskyrą."
                : "Click the button below to confirm your email address and activate your Rente account."}
            </p>
            <a href="${opts.confirmUrl}" style="display:inline-block;background:#20201f;color:#f7f6f2;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;font-weight:600;">
              ${lt ? "Patvirtinti paskyrą" : "Confirm account"}
            </a>
            <p style="margin:28px 0 0;font-size:13px;color:rgba(32,32,31,0.4);line-height:1.6;">
              ${lt
                ? "Jei nesikūrei paskyros Rente, tiesiog ignoruok šį laišką."
                : "If you didn't create a Rente account, you can safely ignore this email."}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #e5e2db;">
            <p style="margin:0;font-size:12px;color:rgba(32,32,31,0.35);">© ${new Date().getFullYear()} Rente · ${lt ? "P2P įrankių nuoma" : "P2P tool rental"}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  resetUrl: string;
  lang?: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const lt = opts.lang === "lt";
  const subject = lt ? "Atstatyti Rente slaptažodį" : "Reset your Rente password";

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f7f6f2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6f2;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e5e2db;overflow:hidden;max-width:520px;">
        <tr>
          <td style="background:#20201f;padding:28px 40px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#f7f6f2;letter-spacing:-0.5px;">Rente</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#20201f;">
              ${lt ? "Slaptažodžio atstatymas" : "Password reset"}
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:rgba(32,32,31,0.6);line-height:1.6;">
              ${lt
                ? "Gavome prašymą atstatyti tavo Rente paskyros slaptažodį. Spustelk žemiau esantį mygtuką."
                : "We received a request to reset your Rente password. Click the button below to choose a new one."}
            </p>
            <a href="${opts.resetUrl}" style="display:inline-block;background:#20201f;color:#f7f6f2;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;font-weight:600;">
              ${lt ? "Atstatyti slaptažodį" : "Reset password"}
            </a>
            <p style="margin:28px 0 0;font-size:13px;color:rgba(32,32,31,0.4);line-height:1.6;">
              ${lt
                ? "Jei neprašei atstatyti slaptažodžio, ignoruok šį laišką. Nuoroda galioja 1 valandą."
                : "If you didn't request a password reset, you can safely ignore this email. The link expires in 1 hour."}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #e5e2db;">
            <p style="margin:0;font-size:12px;color:rgba(32,32,31,0.35);">© ${new Date().getFullYear()} Rente · ${lt ? "P2P įrankių nuoma" : "P2P tool rental"}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
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
          <h1 style="color:white;margin:0;font-size:22px">🔧 Rente</h1>
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
          <h1 style="color:white;margin:0;font-size:22px">🔧 Rente</h1>
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
