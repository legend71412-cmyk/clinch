import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ConversationsClient } from "@/components/conversations/conversations-client";

export const metadata: Metadata = { title: "Conversations" };

export default async function ConversationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, booking_link, ai_tone")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/onboarding");

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*, lead:leads(id, first_name, last_name, phone, email, service_interest, status)")
    .eq("business_id", business.id)
    .order("updated_at", { ascending: false });

  return (
    <ConversationsClient
      initialConversations={conversations ?? []}
      business={business as any}
    />
  );
}
