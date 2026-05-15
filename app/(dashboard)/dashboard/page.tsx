import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardStats } from "@/components/dashboard/stats";
import { LeadsChart } from "@/components/dashboard/leads-chart";
import { RecentLeads } from "@/components/dashboard/recent-leads";
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments";
import { RecentConversations } from "@/components/dashboard/recent-conversations";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/onboarding");

  const businessId = business.id;

  // Fetch all dashboard data in parallel
  const [
    { count: totalLeads },
    { count: newLeadsToday },
    { count: appointmentsBooked },
    { data: analyticsData },
    { data: recentLeads },
    { data: upcomingAppointments },
    { data: recentConversations },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("business_id", businessId),
    supabase.from("leads").select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", new Date().toISOString().split("T")[0]),
    supabase.from("appointments").select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .in("status", ["scheduled", "confirmed", "completed"]),
    supabase.from("analytics_daily")
      .select("*")
      .eq("business_id", businessId)
      .order("date", { ascending: false })
      .limit(30),
    supabase.from("leads")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("appointments")
      .select("*, lead:leads(first_name, last_name, phone, email)")
      .eq("business_id", businessId)
      .gte("starts_at", new Date().toISOString())
      .in("status", ["scheduled", "confirmed"])
      .order("starts_at", { ascending: true })
      .limit(5),
    supabase.from("conversations")
      .select("*, lead:leads(first_name, last_name)")
      .eq("business_id", businessId)
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const wonLeads = analyticsData?.reduce((sum, d) => sum + (d.leads_won ?? 0), 0) ?? 0;
  const conversionRate = totalLeads ? Math.round((wonLeads / totalLeads) * 100) : 0;

  const stats = {
    total_leads: totalLeads ?? 0,
    new_leads_today: newLeadsToday ?? 0,
    appointments_booked: appointmentsBooked ?? 0,
    conversion_rate: conversionRate,
    messages_sent: analyticsData?.reduce((sum, d) => sum + (d.messages_sent ?? 0), 0) ?? 0,
    ai_responses: analyticsData?.reduce((sum, d) => sum + (d.ai_responses ?? 0), 0) ?? 0,
    leads_this_month: analyticsData?.slice(0, 30).reduce((sum, d) => sum + (d.leads_created ?? 0), 0) ?? 0,
    revenue_at_risk: 0,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back to {business.name}</p>
      </div>

      {/* Stats grid */}
      <DashboardStats stats={stats} />

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LeadsChart data={analyticsData ?? []} />
        </div>
        <div>
          <RecentConversations conversations={recentConversations ?? []} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentLeads leads={recentLeads ?? []} />
        <UpcomingAppointments appointments={upcomingAppointments ?? []} />
      </div>
    </div>
  );
}
