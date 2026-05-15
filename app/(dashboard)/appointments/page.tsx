import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppointmentsClient } from "@/components/appointments/appointments-client";

export const metadata: Metadata = { title: "Appointments" };

export default async function AppointmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/onboarding");

  const [{ data: appointments }, { data: leads }] = await Promise.all([
    supabase
      .from("appointments")
      .select("*, lead:leads(id, first_name, last_name, phone, email)")
      .eq("business_id", business.id)
      .order("starts_at", { ascending: false }),
    supabase
      .from("leads")
      .select("id, first_name, last_name, phone, email")
      .eq("business_id", business.id)
      .order("first_name"),
  ]);

  return (
    <AppointmentsClient
      initialAppointments={appointments ?? []}
      leads={leads ?? []}
      businessId={business.id}
    />
  );
}
