"use server";

import { createClient } from "@/lib/supabase/server";
import { createLeadSchema, updateLeadSchema } from "@/lib/validations";
import type { Lead, LeadStatus, ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

async function getAuthenticatedBusiness(): Promise<{ userId: string; businessId: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business) return null;
  return { userId: user.id, businessId: business.id };
}

export async function createLead(data: Record<string, unknown>): Promise<ActionResult<Lead>> {
  const auth = await getAuthenticatedBusiness();
  if (!auth) return { success: false, error: "Not authenticated" };

  const parsed = createLeadSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .insert({ ...parsed.data, business_id: auth.businessId })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  return { success: true, data: lead as Lead };
}

export async function updateLead(id: string, data: Record<string, unknown>): Promise<ActionResult<Lead>> {
  const auth = await getAuthenticatedBusiness();
  if (!auth) return { success: false, error: "Not authenticated" };

  const parsed = updateLeadSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .update(parsed.data)
    .eq("id", id)
    .eq("business_id", auth.businessId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return { success: true, data: lead as Lead };
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<ActionResult> {
  const auth = await getAuthenticatedBusiness();
  if (!auth) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id)
    .eq("business_id", auth.businessId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function deleteLead(id: string): Promise<ActionResult> {
  const auth = await getAuthenticatedBusiness();
  if (!auth) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .eq("business_id", auth.businessId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function addLeadNote(leadId: string, content: string): Promise<ActionResult> {
  const auth = await getAuthenticatedBusiness();
  if (!auth) return { success: false, error: "Not authenticated" };

  if (!content.trim()) return { success: false, error: "Note cannot be empty" };

  const supabase = await createClient();
  const { error } = await supabase.from("lead_notes").insert({
    lead_id: leadId,
    business_id: auth.businessId,
    user_id: auth.userId,
    content: content.trim(),
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/leads/${leadId}`);
  return { success: true, data: undefined };
}
