import type { AiTone, Business, Lead, Message } from "@/types";

// ============================================================
// Tone descriptors injected into system prompts
// ============================================================

const TONE_INSTRUCTIONS: Record<AiTone, string> = {
  friendly:
    "Be warm, approachable, and conversational. Use a casual but professional tone. Occasional light humor is fine.",
  professional:
    "Be precise, courteous, and business-like. Keep messages concise and informative. Avoid slang.",
  luxury:
    "Be elegant, refined, and attentive. Use elevated language that conveys exclusivity and white-glove service.",
  casual:
    "Be relaxed, down-to-earth, and personable. Write like a friendly neighbor — keep it simple and genuine.",
  urgent:
    "Be direct, concise, and action-oriented. Convey urgency and scarcity while staying respectful.",
};

// ============================================================
// Build the system prompt for a business
// ============================================================

export function buildSystemPrompt(business: Business): string {
  const tone = TONE_INSTRUCTIONS[business.ai_tone];
  const services =
    business.services.length > 0 ? business.services.join(", ") : "our services";

  return `You are a helpful AI assistant for ${business.name}, a ${business.industry.replace("_", " ")} business.

TONE: ${tone}

YOUR JOB:
- Warmly greet and engage new leads who have submitted an inquiry
- Answer questions about ${services}
- Qualify the lead (budget, timeline, specific service needed)
- Guide the conversation toward booking an appointment
- Keep replies SHORT (1-3 sentences for SMS; 3-5 sentences for email)
- Never make up prices — say you'll have someone reach out with pricing details
- Always end with a soft call-to-action toward scheduling

BUSINESS INFO:
- Name: ${business.name}
- Services: ${services}
- Booking link: ${business.booking_link ?? "Will be provided upon request"}
- Hours: ${formatBusinessHours(business.business_hours)}

RULES:
- Never pretend to be a human if directly asked
- Never share internal business details or pricing without authorization
- If a lead seems upset, apologize and offer to have a team member call them
- Don't send more than one question per message`;
}

// ============================================================
// Build the initial outreach message for a new lead
// ============================================================

export function buildLeadResponsePrompt(
  business: Business,
  lead: Lead,
  channel: "sms" | "email"
): string {
  const name = lead.first_name;
  const service = lead.service_interest ?? "your inquiry";

  if (channel === "sms") {
    return `Generate a SHORT (under 160 chars) SMS reply to ${name} who just submitted a lead form about: "${service}".
Be ${business.ai_tone}. Include a soft call-to-action. Do NOT include a URL unless explicitly needed.
Start the message with "Hi ${name}," — respond with just the message text, no quotes.`;
  }

  return `Generate a SHORT email reply to ${name} who just submitted an inquiry about: "${service}".
Subject line is handled separately — just write the email body.
Be ${business.ai_tone}. 2-3 short paragraphs max.
End with next steps toward booking.
Respond with just the email body text, no quotes.`;
}

// ============================================================
// Build a follow-up message for a non-responsive lead
// ============================================================

export function buildFollowUpPrompt(
  business: Business,
  lead: Lead,
  followUpNumber: number,
  channel: "sms" | "email"
): string {
  const name = lead.first_name;
  const angle =
    followUpNumber === 1
      ? "Check in gently — they may have missed your first message."
      : followUpNumber === 2
        ? "Create a little urgency — limited spots or a time-sensitive offer."
        : "Final attempt — let them know the conversation will close, offer one last easy action.";

  return `Generate a ${channel === "sms" ? "SHORT SMS (under 160 chars)" : "brief email"} follow-up #${followUpNumber} for ${name}, a lead who hasn't responded.
They originally inquired about: "${lead.service_interest ?? "your services"}".
Strategy: ${angle}
Tone: ${business.ai_tone}
Business: ${business.name}
Respond with just the message text, no quotes.`;
}

// ============================================================
// Generate AI suggestions for the inbox
// ============================================================

export function buildSuggestionPrompt(
  business: Business,
  lead: Lead,
  conversationHistory: Message[]
): string {
  const history = conversationHistory
    .slice(-6)
    .map((m) => `${m.direction === "outbound" ? "Agent" : "Lead"}: ${m.content}`)
    .join("\n");

  return `You are helping a ${business.industry.replace("_", " ")} business reply to a lead.

CONVERSATION SO FAR:
${history}

LEAD NAME: ${lead.first_name} ${lead.last_name ?? ""}
SERVICE INTEREST: ${lead.service_interest ?? "unknown"}
TONE: ${business.ai_tone}

Generate 3 SHORT suggested reply options. Each should be a distinct approach:
1. Move toward booking
2. Answer a likely objection
3. Ask a qualifying question

Format as JSON array: [{"label": "Book Now", "text": "..."}, ...]`;
}

// ============================================================
// Helpers
// ============================================================

function formatBusinessHours(hours: Business["business_hours"]): string {
  const days: Record<string, string> = {
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",
  };

  return Object.entries(hours)
    .filter(([, v]) => v.enabled)
    .map(([k, v]) => `${days[k]} ${v.open}-${v.close}`)
    .join(", ");
}
