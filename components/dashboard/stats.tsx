"use client";

import { motion } from "framer-motion";
import { Users, Calendar, TrendingUp, MessageSquare, Bot, UserPlus } from "lucide-react";
import type { DashboardStats } from "@/types";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

interface StatsProps { stats: DashboardStats; }

export function DashboardStats({ stats }: StatsProps) {
  const cards = [
    {
      label: "Total Leads",
      value: stats.total_leads.toLocaleString(),
      subtext: `+${stats.new_leads_today} today`,
      icon: Users,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
      trend: "up",
    },
    {
      label: "New This Month",
      value: stats.leads_this_month.toLocaleString(),
      subtext: "vs last month",
      icon: UserPlus,
      color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30",
      trend: "up",
    },
    {
      label: "Appointments Booked",
      value: stats.appointments_booked.toLocaleString(),
      subtext: "total bookings",
      icon: Calendar,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
      trend: "up",
    },
    {
      label: "Conversion Rate",
      value: `${stats.conversion_rate}%`,
      subtext: "lead → booked",
      icon: TrendingUp,
      color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
      trend: stats.conversion_rate >= 10 ? "up" : "neutral",
    },
    {
      label: "Messages Sent",
      value: stats.messages_sent.toLocaleString(),
      subtext: "total all time",
      icon: MessageSquare,
      color: "text-pink-600 bg-pink-100 dark:bg-pink-900/30",
      trend: "up",
    },
    {
      label: "AI Responses",
      value: stats.ai_responses.toLocaleString(),
      subtext: "auto-generated",
      icon: Bot,
      color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30",
      trend: "up",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            variants={item}
            className="bg-white dark:bg-gray-900 rounded-xl border border-border p-4 card-hover"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold tabular-nums mb-0.5">{card.value}</div>
            <div className="text-xs font-medium text-foreground/80 mb-0.5">{card.label}</div>
            <div className="text-xs text-muted-foreground">{card.subtext}</div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
