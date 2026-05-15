"use client";

import { useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react";
import type { AnalyticsDaily } from "@/types";
import { percentOf } from "@/lib/utils";

interface AnalyticsClientProps {
  analytics: AnalyticsDaily[];
  leadsByStatus: { status: string }[];
  totalLeads: number;
  totalAppointments: number;
}

const STATUS_COLORS: Record<string, string> = {
  new: "#3b82f6",
  contacted: "#f59e0b",
  booked: "#8b5cf6",
  won: "#10b981",
  lost: "#ef4444",
};

export function AnalyticsClient({ analytics, leadsByStatus, totalLeads, totalAppointments }: AnalyticsClientProps) {
  const chartData = useMemo(() => {
    return [...analytics]
      .reverse()
      .map((d) => ({
        date: format(parseISO(d.date), "MMM d"),
        Leads: d.leads_created,
        Messages: d.messages_sent,
        Booked: d.leads_booked,
        "AI Replies": d.ai_responses,
      }));
  }, [analytics]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    leadsByStatus.forEach((l) => { counts[l.status] = (counts[l.status] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leadsByStatus]);

  const totals = useMemo(() => ({
    leads: analytics.reduce((s, d) => s + d.leads_created, 0),
    messages: analytics.reduce((s, d) => s + d.messages_sent, 0),
    aiReplies: analytics.reduce((s, d) => s + d.ai_responses, 0),
    booked: analytics.reduce((s, d) => s + d.leads_booked, 0),
  }), [analytics]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">30-day performance overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "New Leads (30d)", value: totals.leads, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
          { icon: TrendingUp, label: "Messages Sent (30d)", value: totals.messages, color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30" },
          { icon: BarChart3, label: "AI Replies (30d)", value: totals.aiReplies, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30" },
          { icon: Calendar, label: "Appointments (all)", value: totalAppointments, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white dark:bg-gray-900 rounded-xl border border-border p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold mb-0.5">{card.value.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Activity over time */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-border p-5">
        <h3 className="font-semibold text-base mb-4">Activity Over Time</h3>
        {chartData.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
            No data yet — activity will appear here as leads come in.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gAI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="Leads" stroke="#0ea5e9" strokeWidth={2} fill="url(#gLeads)" dot={false} />
              <Area type="monotone" dataKey="AI Replies" stroke="#8b5cf6" strokeWidth={2} fill="url(#gAI)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Lead status breakdown + bar chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-border p-5">
          <h3 className="font-semibold text-base mb-4">Leads by Status</h3>
          {statusData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">No lead data yet.</div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.name] ?? "#94a3b8" }} />
                      <span className="capitalize">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{d.value}</span>
                      <span className="text-xs text-muted-foreground">({percentOf(d.value, totalLeads)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-border p-5">
          <h3 className="font-semibold text-base mb-4">Daily Leads (Last 14 Days)</h3>
          {chartData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">No data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData.slice(-14)} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                <Bar dataKey="Leads" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
