"use server";

import { createClient } from "@/lib/supabase/server";
import { createAppointmentSchema } from "@/lib/validations";
import type { Appointment, ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

async function getAuthenticatedBusiness() {
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

export async function createAppointment(data: Record<string, unknown>): Promise<ActionResult<Appointment>> {
  const auth = await getAuthenticatedBusiness();
  if (!auth) return { success: false, error: "Not authenticated" };

  const parsed = createAppointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { data: appt, error } = await supabase
    .from("appointments")
    .insert({ ...parsed.data, business_id: auth.businessId })
    .select("*, lead:leads(first_name, last_name)")
    .single();

  if (error) return { success: false, error: error.message };

  // Update lead status to booked
  await supabase
    .from("leads")
    .update({ status: "booked" })
    .eq("id", parsed.data.lead_id)
    .eq("business_id", auth.businessId);

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return { success: true, data: appt as Appointment };
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment["status"]
): Promise<ActionResult> {
  const auth = await getAuthenticatedBusiness();
  if (!auth) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .eq("business_id", auth.businessId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function deleteAppointment(id: string): Promise<ActionResult> {
  const auth = await getAuthenticatedBusiness();
  if (!auth) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id)
    .eq("business_id", auth.businessId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/appointments");
  return { success: true, data: undefined };
}
