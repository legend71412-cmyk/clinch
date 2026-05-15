import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${msg}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const businessId = sub.metadata.business_id;
        if (!businessId) break;

        const tier = getTierFromPriceId(sub.items.data[0]?.price.id ?? "");

        await supabase.from("subscriptions").upsert({
          business_id: businessId,
          stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
          stripe_subscription_id: sub.id,
          stripe_price_id: sub.items.data[0]?.price.id,
          tier,
          status: sub.status as any,
          trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
          leads_limit: tierLimits[tier]?.leads ?? 100,
          messages_limit: tierLimits[tier]?.messages ?? 500,
        }, { onConflict: "business_id" });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const businessId = sub.metadata.business_id;
        if (!businessId) break;

        await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("business_id", businessId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const businessId = sub.metadata.business_id;
          if (businessId) {
            await supabase
              .from("subscriptions")
              .update({ status: "past_due" })
              .eq("business_id", businessId);
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const businessId = sub.metadata.business_id;
          if (businessId) {
            // Reset monthly usage counters on new billing cycle
            await supabase
              .from("subscriptions")
              .update({ status: "active", leads_used: 0, messages_used: 0 })
              .eq("business_id", businessId);
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

const tierLimits: Record<string, { leads: number; messages: number }> = {
  starter: { leads: 100, messages: 500 },
  pro: { leads: 500, messages: 2500 },
  agency: { leads: -1, messages: 10000 },
};

function getTierFromPriceId(priceId: string): "starter" | "pro" | "agency" {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return "starter";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) return "agency";
  return "starter";
}
