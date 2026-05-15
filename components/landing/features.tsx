"use client";

import { motion } from "framer-motion";
import { Bot, Zap, Calendar, BarChart3, MessageSquare, Shield, Repeat, Bell } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant AI Responses",
    description: "Reply to every lead within seconds — 24/7 — with personalized AI messages that match your brand voice.",
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    icon: MessageSquare,
    title: "SMS & Email Sequences",
    description: "Automated multi-step follow-up sequences that keep leads warm until they're ready to book.",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    icon: Calendar,
    title: "Auto-Book Appointments",
    description: "AI guides leads toward your booking link and sends confirmation + reminder messages automatically.",
    color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
  },
  {
    icon: Bot,
    title: "Fully Customizable AI",
    description: "Set your AI's tone (friendly, professional, luxury), edit prompts, and control every message.",
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  {
    icon: BarChart3,
    title: "Conversion Analytics",
    description: "Track leads, response rates, bookings, and revenue in a clean dashboard built for busy owners.",
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  },
  {
    icon: Repeat,
    title: "Re-Engagement Automations",
    description: "Never let a lead go cold. Clinch automatically re-engages contacts who didn't respond.",
    color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get notified when a hot lead replies, an appointment is booked, or a deal is about to close.",
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  },
  {
    icon: Shield,
    title: "Multi-Tenant & Secure",
    description: "Each business gets their own isolated workspace. Data is encrypted and protected at every level.",
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gray-50 dark:bg-gray-950/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" /> Everything you need
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Built for businesses that{" "}
            <span className="gradient-brand-text">can&apos;t afford to miss</span> a lead
          </h2>
          <p className="text-lg text-muted-foreground">
            Clinch handles the entire lead lifecycle — from first contact to booked appointment — so your team can focus on delivering great service.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={item}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-border card-hover"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
