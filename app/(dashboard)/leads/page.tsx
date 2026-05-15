import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LeadsClient } from "@/components/leads/leads-client";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/onboarding");

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier, leads_limit, leads_used")
    .eq("business_id", business.id)
    .single();

  return (
    <LeadsClient
      initialLeads={leads ?? []}
      businessId={business.id}
      subscription={subscription}
    />
  );
}
