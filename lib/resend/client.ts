import { Resend } from "resend";

let resendInstance: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY!);
  }
  return resendInstance;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<string> {
  const resend = getResendClient();
  const from = options.from ?? process.env.RESEND_FROM_EMAIL ?? "noreply@clinch.ai";

  const { data, error } = await resend.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  });

  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("Failed to send email — no ID returned");

  return data.id;
}

// ============================================================
// Simple HTML email templates
// ============================================================

export function buildLeadReplyEmail(params: {
  businessName: string;
  leadFirstName: string;
  content: string;
  bookingLink?: string;
}): { html: string; text: string } {
  const { businessName, leadFirstName, content, bookingLink } = params;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <div style="margin-bottom: 24px;">
    <h2 style="margin:0; font-size:20px; color:#0ea5e9;">${businessName}</h2>
  </div>
  <div style="background:#f8fafc; border-radius:12px; padding:24px; margin-bottom:24px;">
    <p style="margin:0 0 16px; font-size:16px;">Hi ${leadFirstName},</p>
    ${content
      .split("\n")
      .filter(Boolean)
      .map((p) => `<p style="margin:0 0 12px; line-height:1.6;">${p}</p>`)
      .join("")}
    ${
      bookingLink
        ? `<div style="margin-top:24px;">
        <a href="${bookingLink}" style="background:#0ea5e9; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; display:inline-block;">
          Book an Appointment →
        </a>
      </div>`
        : ""
    }
  </div>
  <p style="font-size:12px; color:#94a3b8; margin:0;">Sent by ${businessName} · Powered by Clinch</p>
</body>
</html>`;

  const text = `Hi ${leadFirstName},\n\n${content}${bookingLink ? `\n\nBook an appointment: ${bookingLink}` : ""}\n\n— ${businessName}`;

  return { html, text };
}
