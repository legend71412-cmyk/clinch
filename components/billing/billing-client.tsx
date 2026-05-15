"use client";

import { useState } from "react";
import { CreditCard, CheckCircle, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PRICING_TIERS } from "@/lib/stripe/client";
import { formatDate } from "@/lib/utils";
import type { Business, Subscription } from "@/types";

interface BillingClientProps {
  business: Pick<Business, "id" | "name" | "email">;
  subscription: Subscription | null;
  userEmail: string;
}

export function BillingClient({ business, subscription, userEmail }: BillingClientProps) {
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [isPortaling, setIsPortaling] = useState(false);
  const { toast } = useToast();

  async function handleUpgrade(priceId: string, tierId: string) {
    setIsUpgrading(tierId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, businessId: business.id, email: userEmail, name: business.name }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error ?? "Failed to create checkout session");
      }
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed", variant: "destructive" });
    } finally {
      setIsUpgrading(null);
    }
  }

  async function handleManageBilling() {
    setIsPortaling(true);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      toast({ title: "Error opening billing portal", variant: "destructive" });
    } finally {
      setIsPortaling(false);
    }
  }

  const isTrialing = subscription?.status === "trialing";
  const isActive = subscription?.status === "active";
  const isPastDue = subscription?.status === "past_due";
  const currentTier = subscription?.tier ?? "starter";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground text-sm">Manage your subscription and billing details.</p>
      </div>

      {/* Current plan card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-base">Current Plan</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-bold capitalize">{currentTier} Plan</span>
              {isTrialing && (
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400">
                  Trial
                </Badge>
              )}
              {isActive && (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400">
                  Active
                </Badge>
              )}
              {isPastDue && (
                <Badge variant="destructive">Past Due</Badge>
              )}
            </div>
          </div>
          <CreditCard className="w-8 h-8 text-muted-foreground" />
        </div>

        {subscription && (
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            {[
              {
                label: "Leads used",
                value: `${subscription.leads_used} / ${subscription.leads_limit === -1 ? "∞" : subscription.leads_limit}`,
              },
              {
                label: "Messages used",
                value: `${subscription.messages_used} / ${subscription.messages_limit === -1 ? "∞" : subscription.messages_limit}`,
              },
              {
                label: isTrialing
                  ? "Trial ends"
                  : "Next billing date",
                value: formatDate(
                  (isTrialing ? subscription.trial_ends_at : subscription.current_period_end) ?? ""
                ),
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-0.5">{stat.label}</div>
                <div className="font-semibold text-sm">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {isPastDue && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-400 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Your payment is past due. Please update your payment method to avoid service interruption.
          </div>
        )}

        {subscription?.stripe_customer_id && (
          <Button variant="outline" onClick={handleManageBilling} disabled={isPortaling}>
            {isPortaling ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <ExternalLink className="w-4 h-4 mr-2" />
            )}
            Manage Billing Portal
          </Button>
        )}
      </div>

      {/* Plan upgrade options */}
      <div>
        <h3 className="font-semibold text-base mb-4">Upgrade Plan</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {PRICING_TIERS.map((tier) => {
            const isCurrent = tier.id === currentTier;
            return (
              <div
                key={tier.id}
                className={`rounded-xl border p-5 flex flex-col ${
                  tier.popular
                    ? "border-brand-400 shadow-sm shadow-brand-100 dark:shadow-brand-900/20"
                    : "border-border"
                } bg-white dark:bg-gray-900`}
              >
                {tier.popular && (
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-2">Most Popular</span>
                )}
                <div className="font-bold text-base mb-0.5">{tier.name}</div>
                <div className="text-2xl font-bold mb-3">${tier.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-2 mb-4 flex-1">
                  {tier.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${isCurrent ? "" : "gradient-brand text-white"}`}
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent || isUpgrading === tier.id}
                  onClick={() => handleUpgrade(tier.priceId, tier.id)}
                >
                  {isUpgrading === tier.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : (
                    "Upgrade"
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
