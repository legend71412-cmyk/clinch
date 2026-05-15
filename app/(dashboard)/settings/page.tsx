import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/onboarding");

  const { data: promptTemplates } = await supabase
    .from("prompt_templates")
    .select("*")
    .eq("business_id", business.id)
    .order("is_default", { ascending: false });

  return (
    <SettingsClient
      business={business as any}
      promptTemplates={promptTemplates ?? []}
    />
  );
}
