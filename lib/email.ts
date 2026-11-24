// Candidate email sending.
//
// If RESEND_API_KEY and EMAIL_FROM are set, mail goes out through Resend's
// HTTP API (no extra package needed). Without them, the message is printed to
// the server console and logged with status "LOGGED", so the whole flow works
// in development without an email provider.

export type EmailStatus = "SENT" | "FAILED" | "LOGGED";

export async function sendEmail(msg: { to: string; subject: string; body: string }): Promise<EmailStatus> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!key || !from) {
    console.info(`[email:dev] To: ${msg.to}\nSubject: ${msg.subject}\n\n${msg.body}`);
    return "LOGGED";
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [msg.to], subject: msg.subject, text: msg.body }),
    });
    return res.ok ? "SENT" : "FAILED";
  } catch {
    return "FAILED";
  }
}

/** Fills {{name}}, {{job}} and {{company}} placeholders. */
export function fillTemplate(text: string, vars: { name: string; job: string; company: string }) {
  return text
    .replaceAll("{{name}}", vars.name)
    .replaceAll("{{job}}", vars.job)
    .replaceAll("{{company}}", vars.company);
}
