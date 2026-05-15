import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AnalyticsClient } from "@/components/analytics/analytics-client";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/onboarding");

  const [{ data: analytics30d }, { data: leadsByStatus }, { data: totalLeads }, { data: totalAppointments }] = await Promise.all([
    supabase
      .from("analytics_daily")
      .select("*")
      .eq("business_id", business.id)
      .order("date", { ascending: false })
      .limit(30),
    supabase
      .from("leads")
      .select("status")
      .eq("business_id", business.id),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id)
      .in("status", ["completed", "confirmed"]),
  ]);

  return (
    <AnalyticsClient
      analytics={analytics30d ?? []}
      leadsByStatus={leadsByStatus ?? []}
      totalLeads={totalLeads ?? 0}
      totalAppointments={totalAppointments ?? 0}
    />
  );
}
