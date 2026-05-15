"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRICING_TIERS } from "@/lib/stripe/client";

export function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" /> Simple pricing
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Start free, <span className="gradient-brand-text">scale as you grow</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            14-day free trial on all plans. No credit card required to start.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING_TIERS.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                tier.popular
                  ? "border-brand-500 shadow-2xl shadow-brand-500/10 scale-105"
                  : "border-border"
              } bg-white dark:bg-gray-900`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="gradient-brand text-white border-0 shadow-md px-4">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground mb-1">/month</span>
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full h-11 ${
                  tier.popular
                    ? "gradient-brand text-white hover:opacity-90"
                    : ""
                }`}
                variant={tier.popular ? "default" : "outline"}
                asChild
              >
                <Link href={`/signup?plan=${tier.id}`}>
                  Start free trial
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mt-10"
        >
          All plans include: 14-day free trial · No setup fees · Cancel anytime · 24/7 AI support
        </motion.p>
      </div>
    </section>
  );
}
