"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star, CheckCircle2, MessageSquare, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STAT_ITEMS = [
  { value: "3min", label: "Avg. response time" },
  { value: "47%", label: "Higher conversion rate" },
  { value: "2,400+", label: "Businesses served" },
  { value: "$0", label: "Setup cost" },
];

const MOCK_MESSAGES = [
  {
    from: "Sarah M.",
    text: "Hi! I saw your ad about teeth whitening. How much does it cost?",
    time: "Just now",
    type: "inbound",
  },
  {
    from: "Clinch AI",
    text: "Hi Sarah! Thanks for reaching out to Bright Smile Dental 😊 We'd love to help you get that perfect smile! Our whitening packages start at $199. Want to schedule a free consultation this week?",
    time: "10 sec",
    type: "outbound",
  },
  {
    from: "Sarah M.",
    text: "Yes! Thursday afternoon works for me.",
    time: "2 min",
    type: "inbound",
  },
  {
    from: "Clinch AI",
    text: "Perfect! I've got you down for Thursday at 3pm. You'll receive a confirmation SMS shortly. See you then! 🦷",
    time: "11 sec",
    type: "outbound",
  },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-400/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </div>

      <div className="container mx-auto px-4 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/20 dark:text-brand-300">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Trusted by 2,400+ local businesses
            </Badge>

            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
              Never lose a{" "}
              <span className="gradient-brand-text">lead</span>{" "}
              again.
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Clinch uses AI to instantly respond to new leads, send automated follow-ups, and book appointments — so you can focus on running your business.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              {["Instant AI replies", "SMS & email automations", "Auto-booking"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Button
                size="lg"
                className="gradient-brand text-white hover:opacity-90 transition-opacity text-base h-12 px-8"
                asChild
              >
                <Link href="/signup">
                  Start free 14-day trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              No credit card required · Cancel anytime · Setup in 5 minutes
            </p>
          </motion.div>

          {/* Right: Mock conversation UI */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Stats floating cards */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -top-4 -left-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-border p-3 flex items-center gap-2 z-10"
            >
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">This month</div>
                <div className="text-sm font-bold">+47% conversions</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-border p-3 flex items-center gap-2 z-10"
            >
              <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Auto-booked today</div>
                <div className="text-sm font-bold">12 appointments</div>
              </div>
            </motion.div>

            {/* Chat window */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-border overflow-hidden">
              {/* Chat header */}
              <div className="bg-gradient-to-r from-brand-500 to-violet-600 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Clinch AI</div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-white/80 text-xs">Active · responding instantly</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-950/50 min-h-[320px]">
                {MOCK_MESSAGES.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.15 }}
                    className={`flex ${msg.type === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.type === "outbound"
                          ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-tr-sm"
                          : "bg-white dark:bg-gray-800 border border-border rounded-tl-sm shadow-sm"
                      }`}
                    >
                      <div className="font-medium text-xs opacity-70 mb-0.5">
                        {msg.from} · {msg.time}
                      </div>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input bar (decorative) */}
              <div className="p-3 border-t border-border flex items-center gap-2">
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm text-muted-foreground">
                  AI is handling this conversation...
                </div>
                <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-12 border-t border-border/50"
        >
          {STAT_ITEMS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold gradient-brand-text mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
