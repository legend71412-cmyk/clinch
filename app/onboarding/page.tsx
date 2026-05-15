import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingClient } from "@/components/onboarding/onboarding-client";

export const metadata: Metadata = { title: "Set Up Your Business" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  // Already onboarded
  if (business?.onboarding_done) redirect("/dashboard");

  return <OnboardingClient initialBusiness={business as any} />;
}
