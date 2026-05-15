import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { leadCaptureSchema } from "@/lib/validations";
import { getOpenAIClient } from "@/lib/openai/client";
import { buildLeadResponsePrompt } from "@/lib/openai/prompts";
import { sendSMS } from "@/lib/twilio/client";
import { sendEmail, buildLeadReplyEmail } from "@/lib/resend/client";

// Public endpoint for lead capture forms
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = leadCaptureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createAdminClient();

    // Verify business exists
    const { data: business } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", data.business_id)
      .single();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Check subscription limits
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("leads_limit, leads_used, status")
      .eq("business_id", data.business_id)
      .single();

    if (
      subscription &&
      subscription.leads_limit !== -1 &&
      subscription.leads_used >= subscription.leads_limit &&
      subscription.status !== "trialing"
    ) {
      return NextResponse.json({ error: "Lead limit reached" }, { status: 429 });
    }

    // Create lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        business_id: data.business_id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        source: data.source ?? "website",
        service_interest: data.service_interest,
        status: "new",
      })
      .select()
      .single();

    if (leadError) {
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }

    // Increment leads_used
    await supabase
      .from("subscriptions")
      .update({ leads_used: (subscription?.leads_used ?? 0) + 1 })
      .eq("business_id", data.business_id);

    // Trigger AI outreach in background (don't await to keep response fast)
    triggerAIOutreach(lead, business, data.message).catch(console.error);

    return NextResponse.json({ success: true, lead_id: lead.id });
  } catch (err) {
    console.error("Lead capture error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function triggerAIOutreach(lead: any, business: any, customMessage?: string) {
  const supabase = createAdminClient();

  // Determine channel
  const channel = lead.phone ? "sms" : lead.email ? "email" : null;
  if (!channel) return;

  // Get or create conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .upsert({ business_id: business.id, lead_id: lead.id, channel }, { onConflict: "lead_id,channel" })
    .select("id")
    .single();

  if (!conversation) return;

  // Get prompt template
  const { data: template } = await supabase
    .from("prompt_templates")
    .select("system_prompt")
    .eq("business_id", business.id)
    .eq("is_default", true)
    .single();

  try {
    const openai = getOpenAIClient(business.openai_api_key ?? undefined);
    const userPrompt = buildLeadResponsePrompt(business, lead, channel as "sms" | "email");

    const systemPrompt = template?.system_prompt ?? `You are a helpful assistant for ${business.name}.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt + (customMessage ? `\n\nLead's message: "${customMessage}"` : "") },
      ],
      max_tokens: channel === "sms" ? 160 : 400,
      temperature: 0.7,
    });

    const aiReply = completion.choices[0]?.message?.content?.trim();
    if (!aiReply) return;

    let externalId: string | undefined;

    if (channel === "sms" && lead.phone) {
      const creds = business.twilio_account_sid
        ? { accountSid: business.twilio_account_sid, authToken: business.twilio_auth_token, fromNumber: business.twilio_phone_number }
        : undefined;
      const result = await sendSMS(lead.phone, aiReply, creds);
      externalId = result.sid;
    } else if (channel === "email" && lead.email) {
      const { html, text } = buildLeadReplyEmail({
        businessName: business.name,
        leadFirstName: lead.first_name,
        content: aiReply,
        bookingLink: business.booking_link,
      });
      externalId = await sendEmail({
        to: lead.email,
        subject: `Hi ${lead.first_name} — a quick note from ${business.name}`,
        html,
        text,
      });
    }

    // Record message
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      business_id: business.id,
      direction: "outbound",
      channel,
      content: aiReply,
      ai_generated: true,
      external_id: externalId,
    });

    // Update lead status and analytics
    await supabase.from("leads").update({ status: "contacted", last_contacted_at: new Date().toISOString() }).eq("id", lead.id);
    await supabase.from("analytics_daily").upsert(
      { business_id: business.id, date: new Date().toISOString().split("T")[0], ai_responses: 1 },
      { onConflict: "business_id,date" }
    );
  } catch (err) {
    console.error("AI outreach failed:", err);
  }
}
