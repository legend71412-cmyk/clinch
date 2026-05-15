"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  Zap,
  BarChart3,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/leads", icon: Users, label: "Leads" },
  { href: "/conversations", icon: MessageSquare, label: "Conversations", badge: null },
  { href: "/appointments", icon: Calendar, label: "Appointments" },
  { href: "/automations", icon: Zap, label: "Automations" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
];

const BOTTOM_ITEMS = [
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/billing", icon: CreditCard, label: "Billing" },
];

interface SidebarProps {
  business: { id: string; name: string; logo_url: string | null; industry: string };
}

export function DashboardSidebar({ business }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden md:flex flex-col h-full border-r border-border bg-white dark:bg-gray-900 transition-all duration-300 shrink-0",
          collapsed ? "w-[60px]" : "w-[220px]"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center h-16 px-3 border-b border-border", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-base">
              <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="gradient-brand-text truncate">Clinch</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard">
              <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 shrink-0"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </Button>
        </div>

        {/* Business name */}
        {!collapsed && (
          <div className="px-3 py-2 border-b border-border">
            <div className="text-xs text-muted-foreground truncate">{business.name}</div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            const linkEl = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-brand-600 dark:text-brand-400")} />
                {!collapsed && item.label}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return linkEl;
          })}
        </nav>

        {/* Bottom nav */}
        <div className="p-2 space-y-0.5 border-t border-border">
          {BOTTOM_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            const linkEl = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return linkEl;
          })}
        </div>
      </aside>
    </TooltipProvider>
  );
}
