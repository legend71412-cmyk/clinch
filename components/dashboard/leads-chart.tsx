"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { AnalyticsDaily } from "@/types";

interface LeadsChartProps {
  data: AnalyticsDaily[];
}

export function LeadsChart({ data }: LeadsChartProps) {
  const chartData = useMemo(() => {
    return [...data]
      .reverse()
      .slice(-14)
      .map((d) => ({
        date: format(parseISO(d.date), "MMM d"),
        Leads: d.leads_created,
        Messages: d.messages_sent,
        Booked: d.leads_booked,
      }));
  }, [data]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-base">Lead Activity</h3>
          <p className="text-xs text-muted-foreground">Last 14 days</p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
          No activity data yet. Leads will appear here as they come in.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBooked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 12,
              }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="Leads" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorLeads)" dot={false} />
            <Area type="monotone" dataKey="Booked" stroke="#10b981" strokeWidth={2} fill="url(#colorBooked)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
