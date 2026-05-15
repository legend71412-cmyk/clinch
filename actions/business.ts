"use server";

import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validations";
import type { Business, ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

export async function createOrUpdateBusiness(data: Record<string, unknown>): Promise<ActionResult<Business>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = onboardingSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  let result;
  if (existing) {
    result = await supabase
      .from("businesses")
      .update({ ...parsed.data, onboarding_done: true })
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from("businesses")
      .insert({ ...parsed.data, owner_id: user.id, onboarding_done: true })
      .select()
      .single();
  }

  if (result.error) return { success: false, error: result.error.message };

  revalidatePath("/dashboard");
  return { success: true, data: result.data as Business };
}

export async function updateBusinessSettings(data: Partial<Business>): Promise<ActionResult<Business>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Never allow updating owner_id via this action
  const { owner_id, id, created_at, ...safeData } = data as Record<string, unknown>;

  const { data: business, error } = await supabase
    .from("businesses")
    .update(safeData)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true, data: business as Business };
}
