import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOrRetrieveCustomer, createCheckoutSession, stripe } from "@/lib/stripe/client";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { priceId, businessId, email, name } = await request.json();

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("business_id", businessId)
      .single();

    const customerId = await createOrRetrieveCustomer({
      businessId,
      email,
      name,
      existingCustomerId: subscription?.stripe_customer_id ?? undefined,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const url = await createCheckoutSession({
      customerId,
      priceId,
      businessId,
      successUrl: `${appUrl}/billing?success=1`,
      cancelUrl: `${appUrl}/billing?cancelled=1`,
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
