import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AutomationsClient } from "@/components/automations/automations-client";

export const metadata: Metadata = { title: "Automations" };

export default async function AutomationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/onboarding");

  const { data: automations } = await supabase
    .from("automations")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return <AutomationsClient initialAutomations={automations ?? []} businessId={business.id} />;
}
