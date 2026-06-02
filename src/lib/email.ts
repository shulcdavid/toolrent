import { Resend } from "resend";

// Use RESEND_FROM env var once your domain is verified in Resend.
// Until then, onboarding@resend.dev only delivers to your own Resend account email.
const FROM = process.env.RESEND_FROM ?? "Rente <onboarding@resend.dev>";

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

  const year = new Date().getFullYear();

  await resend.emails.send({
    from: FROM,
    to: opts.ownerEmail,
    subject: `New rental request: "${opts.listingTitle}"`,
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
            <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#20201f;">New rental request</p>
            <p style="margin:0 0 24px;font-size:15px;color:rgba(32,32,31,0.6);line-height:1.6;">
              Hi ${opts.ownerName}, <strong style="color:#20201f;">${opts.renterName}</strong> wants to rent your tool.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6f2;border-radius:12px;padding:20px;margin-bottom:28px;">
              <tr><td style="padding:6px 0;font-size:14px;color:#20201f;"><strong>Tool:</strong> ${opts.listingTitle}</td></tr>
              <tr><td style="padding:6px 0;font-size:14px;color:#20201f;"><strong>Dates:</strong> ${opts.startDate} → ${opts.endDate}</td></tr>
              ${opts.message ? `<tr><td style="padding:6px 0;font-size:14px;color:#20201f;"><strong>Message:</strong> "${opts.message}"</td></tr>` : ""}
            </table>
            <a href="${opts.listingUrl}" style="display:inline-block;background:#20201f;color:#f7f6f2;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;font-weight:600;">
              View request &rarr;
            </a>
            <p style="margin:28px 0 0;font-size:13px;color:rgba(32,32,31,0.4);line-height:1.6;">
              Log in to your dashboard to approve or decline this request.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #e5e2db;">
            <p style="margin:0;font-size:12px;color:rgba(32,32,31,0.35);">© ${year} Rente · P2P tool rental</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
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
  const year = new Date().getFullYear();

  await resend.emails.send({
    from: FROM,
    to: opts.renterEmail,
    subject: approved
      ? `Your booking was approved – ${opts.listingTitle}`
      : `Your booking was declined – ${opts.listingTitle}`,
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
              ${approved ? "Booking approved!" : "Booking declined"}
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:rgba(32,32,31,0.6);line-height:1.6;">
              Hi ${opts.renterName}, your rental request for <strong style="color:#20201f;">${opts.listingTitle}</strong> was
              ${approved
                ? "approved by the owner. You can now coordinate pickup details directly."
                : "declined by the owner. Feel free to browse other available tools."}
            </p>
            ${approved
              ? `<a href="${opts.listingUrl}" style="display:inline-block;background:#20201f;color:#f7f6f2;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;font-weight:600;">View listing &rarr;</a>`
              : ""}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #e5e2db;">
            <p style="margin:0;font-size:12px;color:rgba(32,32,31,0.35);">© ${year} Rente · P2P tool rental</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
