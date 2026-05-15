import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTwilioWebhook } from "@/lib/twilio/client";
import { getOpenAIClient } from "@/lib/openai/client";
import { buildSystemPrompt } from "@/lib/openai/prompts";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  // Verify the webhook is from Twilio
  const signature = request.headers.get("x-twilio-signature") ?? "";
  const url = process.env.NEXT_PUBLIC_APP_URL + "/api/webhooks/twilio";

  if (process.env.NODE_ENV === "production") {
    const isValid = verifyTwilioWebhook(signature, url, params);
    if (!isValid) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
  }

  const fromNumber = params.From;
  const toNumber = params.To;
  const messageBody = params.Body?.trim();

  if (!fromNumber || !messageBody) {
    return new NextResponse("", { status: 200 });
  }

  const supabase = createAdminClient();

  // Find the lead by phone number
  const normalizedPhone = fromNumber.replace(/\D/g, "");
  const { data: lead } = await supabase
    .from("leads")
    .select("*, business:businesses(*)")
    .or(`phone.eq.${fromNumber},phone.eq.+${normalizedPhone},phone.eq.${normalizedPhone}`)
    .single();

  if (!lead) {
    // Could be a new lead — attempt to match by Twilio number to business
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .or(`twilio_phone_number.eq.${toNumber}`)
      .single();

    if (business) {
      // Create a new lead from the inbound message
      const { data: newLead } = await supabase
        .from("leads")
        .insert({
          business_id: business.id,
          first_name: "Unknown",
          phone: fromNumber,
          source: "sms_inbound",
          status: "new",
        })
        .select()
        .single();

      if (newLead) {
        await createConversationAndMessage(supabase, newLead, messageBody, business.id);
      }
    }
    return new NextResponse("", { status: 200 });
  }

  const business = lead.business;
  const businessId = business.id;

  await createConversationAndMessage(supabase, lead, messageBody, businessId);

  // Generate AI reply if AI is active for this conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, ai_active")
    .eq("lead_id", lead.id)
    .eq("channel", "sms")
    .single();

  if (conversation?.ai_active) {
    await generateAndSendAIReply(supabase, lead, business, conversation.id, messageBody);
  }

  return new NextResponse("", { status: 200 });
}

async function createConversationAndMessage(
  supabase: ReturnType<typeof createAdminClient>,
  lead: any,
  messageBody: string,
  businessId: string
) {
  // Get or create conversation
  const { data: existingConv } = await supabase
    .from("conversations")
    .select("id")
    .eq("lead_id", lead.id)
    .eq("channel", "sms")
    .single();

  let conversationId = existingConv?.id;

  if (!conversationId) {
    const { data: newConv } = await supabase
      .from("conversations")
      .insert({ business_id: businessId, lead_id: lead.id, channel: "sms" })
      .select("id")
      .single();
    conversationId = newConv?.id;
  }

  if (!conversationId) return;

  // Record inbound message
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    business_id: businessId,
    direction: "inbound",
    channel: "sms",
    content: messageBody,
  });

  // Update lead status to contacted
  if (lead.status === "new") {
    await supabase.from("leads").update({ status: "contacted", last_contacted_at: new Date().toISOString() }).eq("id", lead.id);
  }
}

async function generateAndSendAIReply(
  supabase: ReturnType<typeof createAdminClient>,
  lead: any,
  business: any,
  conversationId: string,
  inboundMessage: string
) {
  try {
    // Fetch recent conversation history
    const { data: recentMessages } = await supabase
      .from("messages")
      .select("direction, content")
      .eq("conversation_id", conversationId)
      .order("sent_at", { ascending: false })
      .limit(8);

    const openai = getOpenAIClient(business.openai_api_key ?? undefined);
    const systemPrompt = buildSystemPrompt(business);

    const history: ChatCompletionMessageParam[] = (recentMessages ?? [])
      .reverse()
      .map((m: { direction: string; content: string }) => ({
        role: (m.direction === "outbound" ? "assistant" : "user") as "assistant" | "user",
        content: m.content,
      }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: inboundMessage },
      ],
      max_tokens: 160,
      temperature: 0.7,
    });

    const aiReply = completion.choices[0]?.message?.content?.trim();
    if (!aiReply) return;

    // Send via Twilio
    const twilioModule = await import("@/lib/twilio/client");
    const creds = business.twilio_account_sid
      ? { accountSid: business.twilio_account_sid, authToken: business.twilio_auth_token, fromNumber: business.twilio_phone_number }
      : undefined;

    const { sid } = await twilioModule.sendSMS(lead.phone, aiReply, creds);

    // Record outbound message
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      business_id: business.id,
      direction: "outbound",
      channel: "sms",
      content: aiReply,
      ai_generated: true,
      external_id: sid,
    });

    // Update analytics
    await supabase.from("analytics_daily")
      .upsert({
        business_id: business.id,
        date: new Date().toISOString().split("T")[0],
        ai_responses: 1,
      }, { onConflict: "business_id,date" });
  } catch (err) {
    console.error("AI reply generation failed:", err);
  }
}
