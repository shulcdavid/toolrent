/**
 * Twilio SMS sender using alphanumeric sender ID ("Rente").
 * No phone number purchase needed — works in Lithuania + most of Europe.
 * Requires env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
 * Optional: TWILIO_FROM (defaults to "Rente")
 */
export async function sendSms(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM ?? "Rente";

  if (!accountSid || !authToken) {
    console.warn("[SMS] Twilio env vars not set — skipping SMS send");
    return false;
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error("[SMS] Twilio error:", err);
  }

  return response.ok;
}
