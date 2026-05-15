import twilio from "twilio";

export interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export function getTwilioClient(creds?: Partial<TwilioCredentials>) {
  const accountSid = creds?.accountSid ?? process.env.TWILIO_ACCOUNT_SID!;
  const authToken = creds?.authToken ?? process.env.TWILIO_AUTH_TOKEN!;

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials are required");
  }

  return twilio(accountSid, authToken);
}

export async function sendSMS(
  to: string,
  body: string,
  creds?: Partial<TwilioCredentials>
): Promise<{ sid: string; status: string }> {
  const client = getTwilioClient(creds);
  const from = creds?.fromNumber ?? process.env.TWILIO_PHONE_NUMBER!;

  if (!from) throw new Error("Twilio phone number is required");

  const message = await client.messages.create({ to, from, body });
  return { sid: message.sid, status: message.status };
}

export function verifyTwilioWebhook(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  return twilio.validateRequest(authToken, signature, url, params);
}
