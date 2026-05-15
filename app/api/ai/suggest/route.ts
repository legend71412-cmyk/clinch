export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai/client";
import { buildSuggestionPrompt } from "@/lib/openai/prompts";
import { safeJsonParse } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { conversationId } = await request.json();
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: business } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", user.id)
      .single();

    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    const { data: conversation } = await supabase
      .from("conversations")
      .select("*, lead:leads(*)")
      .eq("id", conversationId)
      .eq("business_id", business.id)
      .single();

    if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("sent_at", { ascending: false })
      .limit(6);

    const openai = getOpenAIClient(business.openai_api_key ?? undefined);
    const prompt = buildSuggestionPrompt(business, conversation.lead, messages ?? []);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content ?? "[]";
    const suggestions = safeJsonParse<{ label: string; text: string }[]>(content, []);

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("AI suggest error:", err);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}
