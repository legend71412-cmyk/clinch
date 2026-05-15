import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { EmbedForm } from "@/components/embed/embed-form";

export const metadata: Metadata = { title: "Get in Touch" };

interface EmbedPageProps {
  params: Promise<{ businessId: string }>;
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const { businessId } = await params;
  const supabase = createAdminClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, services, industry")
    .eq("id", businessId)
    .single();

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Form not found.</p>
      </div>
    );
  }

  return <EmbedForm business={business as any} />;
}
