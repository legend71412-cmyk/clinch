import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch business for the sidebar
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, logo_url, industry, onboarding_done")
    .eq("owner_id", user.id)
    .single();

  // First-time users who haven't created a business yet
  if (!business) redirect("/onboarding");

  // Users who started onboarding but haven't finished
  if (!business.onboarding_done) redirect("/onboarding");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <DashboardSidebar business={business} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader user={user} business={business} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
