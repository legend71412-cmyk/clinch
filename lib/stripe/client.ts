import Stripe from "stripe";
import type { PricingTier, SubscriptionTier } from "@/types";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

// ============================================================
// Pricing configuration
// ============================================================

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: 97,
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "",
    description: "Perfect for solo operators and small businesses just getting started.",
    features: [
      "Up to 100 leads/mo",
      "500 AI messages/mo",
      "SMS & email follow-ups",
      "AI auto-replies",
      "Appointment scheduling",
      "Dashboard & analytics",
      "Email support",
    ],
    limits: { leads: 100, messages: 500, team_members: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    price: 197,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    description: "For growing businesses that need more automation power.",
    features: [
      "Up to 500 leads/mo",
      "2,500 AI messages/mo",
      "Everything in Starter",
      "Advanced automations",
      "Lead scoring",
      "CSV export",
      "Priority support",
      "2 team members",
    ],
    limits: { leads: 500, messages: 2500, team_members: 2 },
    popular: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: 397,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID ?? "",
    description: "For agencies managing leads for multiple clients.",
    features: [
      "Unlimited leads",
      "10,000 AI messages/mo",
      "Everything in Pro",
      "Embeddable chatbot widget",
      "White-label ready",
      "API access",
      "Unlimited team members",
      "Dedicated support",
    ],
    limits: { leads: -1, messages: 10000, team_members: -1 },
  },
];

export const TIER_LIMITS: Record<SubscriptionTier, { leads: number; messages: number }> = {
  starter: { leads: 100, messages: 500 },
  pro: { leads: 500, messages: 2500 },
  agency: { leads: -1, messages: 10000 },
};

// ============================================================
// Stripe helpers
// ============================================================

export async function createOrRetrieveCustomer(params: {
  businessId: string;
  email: string;
  name: string;
  existingCustomerId?: string;
}): Promise<string> {
  if (params.existingCustomerId) {
    return params.existingCustomerId;
  }

  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: { business_id: params.businessId },
  });

  return customer.id;
}

export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  businessId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: params.priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { business_id: params.businessId },
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { business_id: params.businessId },
  });

  return session.url!;
}

export async function createBillingPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return session.url;
}
