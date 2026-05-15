"use server";

import { createClient } from "@/lib/supabase/server";
import { sendSMS } from "@/lib/twilio/client";
import { sendEmail, buildLeadReplyEmail } from "@/lib/resend/client";
import type { ActionResult, Message } from "@/types";
import { revalidatePath } from "next/cache";

async function getAuthenticatedBusiness() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, twilio_account_sid, twilio_auth_token, twilio_phone_number, booking_link")
    .eq("owner_id", user.id)
    .single();

  if (!business) return null;
  return { userId: user.id, business };
}

export async function sendMessage(params: {
  conversationId: string;
  content: string;
  channel: "sms" | "email" | "chat";
}): Promise<ActionResult<Message>> {
  const auth = await getAuthenticatedBusiness();
  if (!auth) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();

  // Fetch conversation + lead
  const { data: conversation } = await supabase
    .from("conversations")
    .select("*, lead:leads(*)")
    .eq("id", params.conversationId)
    .eq("business_id", auth.business.id)
    .single();

  if (!conversation) return { success: false, error: "Conversation not found" };
  if (!conversation.lead) return { success: false, error: "Lead not found" };

  let externalId: string | undefined;

  // Actually send via Twilio/Resend
  try {
    if (params.channel === "sms" && conversation.lead.phone) {
      const creds = auth.business.twilio_account_sid
        ? {
            accountSid: auth.business.twilio_account_sid,
            authToken: auth.business.twilio_auth_token!,
            fromNumber: auth.business.twilio_phone_number!,
          }
        : undefined;
      const result = await sendSMS(conversation.lead.phone, params.content, creds);
      externalId = result.sid;
    } else if (params.channel === "email" && conversation.lead.email) {
      const { html, text } = buildLeadReplyEmail({
        businessName: auth.business.name,
        leadFirstName: conversation.lead.first_name,
        content: params.content,
        bookingLink: auth.business.booking_link ?? undefined,
      });
      externalId = await sendEmail({
        to: conversation.lead.email,
        subject: `Re: Your inquiry — ${auth.business.name}`,
        html,
        text,
      });
    }
  } catch (err) {
    // Record the message with error status but don't fail silently
    const errMsg = err instanceof Error ? err.message : "Send failed";
    await supabase.from("messages").insert({
      conversation_id: params.conversationId,
      business_id: auth.business.id,
      direction: "outbound",
      channel: params.channel,
      content: params.content,
      ai_generated: false,
      error: errMsg,
    });
    return { success: false, error: errMsg };
  }

  // Record message in DB
  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      business_id: auth.business.id,
      direction: "outbound",
      channel: params.channel,
      content: params.content,
      ai_generated: false,
      external_id: externalId,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  // Update lead last_contacted_at
  await supabase
    .from("leads")
    .update({ last_contacted_at: new Date().toISOString() })
    .eq("id", conversation.lead.id);

  revalidatePath(`/conversations/${params.conversationId}`);
  return { success: true, data: message as Message };
}

export async function toggleAI(conversationId: string, active: boolean): Promise<ActionResult> {
  const auth = await getAuthenticatedBusiness();
  if (!auth) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("conversations")
    .update({ ai_active: active })
    .eq("id", conversationId)
    .eq("business_id", auth.business.id);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/conversations/${conversationId}`);
  return { success: true, data: undefined };
}

export async function markConversationRead(conversationId: string): Promise<ActionResult> {
  const auth = await getAuthenticatedBusiness();
  if (!auth) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("conversations")
    .update({ unread_count: 0 })
    .eq("id", conversationId)
    .eq("business_id", auth.business.id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}
