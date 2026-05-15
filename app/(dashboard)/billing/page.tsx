import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BillingClient } from "@/components/billing/billing-client";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, email")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/onboarding");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("business_id", business.id)
    .single();

  return (
    <BillingClient
      business={business as any}
      subscription={subscription as any}
      userEmail={user.email ?? ""}
    />
  );
}
