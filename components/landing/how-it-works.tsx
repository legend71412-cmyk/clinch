"use client";

import { motion } from "framer-motion";
import { UserPlus, Bot, Send, CalendarCheck } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: UserPlus,
    title: "Lead submits a form",
    description: "A prospect fills out your lead form on your website, Facebook ad, Google ad, or anywhere you embed the Clinch widget.",
    color: "from-blue-500 to-blue-600",
  },
  {
    step: "02",
    icon: Bot,
    title: "AI instantly replies",
    description: "Within seconds, Clinch's AI sends a personalized SMS or email — 24/7 — in your exact brand voice.",
    color: "from-violet-500 to-violet-600",
  },
  {
    step: "03",
    icon: Send,
    title: "Automated follow-up sequence",
    description: "If the lead doesn't respond, Clinch automatically follows up at 24h, 48h, and 72h with smart, non-spammy messages.",
    color: "from-brand-500 to-brand-600",
  },
  {
    step: "04",
    icon: CalendarCheck,
    title: "Lead books appointment",
    description: "The AI guides the conversation toward your booking link. Once booked, reminders are sent automatically.",
    color: "from-emerald-500 to-emerald-600",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 text-sm font-semibold mb-4">
            Simple process
          </div>
          <h2 className="text-4xl font-bold mb-4">
            From lead to booked in{" "}
            <span className="gradient-brand-text">under 3 minutes</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Clinch runs on autopilot. You set it up once, and it works around the clock turning inquiries into appointments.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-1/2 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200 dark:from-blue-900/30 dark:via-violet-900/30 dark:to-emerald-900/30 -translate-y-1/2 z-0" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-6 relative`}>
                    <Icon className="w-7 h-7 text-white" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-900 rounded-full border-2 border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="font-bold text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
