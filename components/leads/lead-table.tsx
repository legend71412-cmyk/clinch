"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, MessageSquare, Calendar, Trash2, Edit3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LEAD_STATUS_COLORS,
  LEAD_STATUS_LABELS,
  formatRelativeTime,
  formatPhoneNumber,
  getLeadFullName,
} from "@/lib/utils";
import { updateLeadStatus, deleteLead } from "@/actions/leads";
import { useToast } from "@/hooks/use-toast";
import type { Lead, LeadStatus } from "@/types";

const STATUS_CYCLE: LeadStatus[] = ["new", "contacted", "booked", "won", "lost"];

interface LeadTableProps {
  leads: Lead[];
  onLeadsChange: (fn: (prev: Lead[]) => Lead[]) => void;
}

export function LeadTable({ leads, onLeadsChange }: LeadTableProps) {
  const { toast } = useToast();

  async function handleStatusChange(leadId: string, status: LeadStatus) {
    onLeadsChange((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
    const result = await updateLeadStatus(leadId, status);
    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  }

  async function handleDelete(leadId: string) {
    onLeadsChange((prev) => prev.filter((l) => l.id !== leadId));
    const result = await deleteLead(leadId);
    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Lead deleted" });
    }
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-border p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
          <MessageSquare className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-base mb-1">No leads found</h3>
        <p className="text-sm text-muted-foreground">
          Adjust your filters or add a new lead to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Contact</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Source</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Added</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, i) => {
              const colors = LEAD_STATUS_COLORS[lead.status];
              return (
                <tr
                  key={lead.id}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors"
                >
                  {/* Name */}
                  <td className="px-4 py-3">
                    <Link href={`/leads/${lead.id}`} className="flex items-center gap-2.5 group">
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-xs shrink-0">
                        {lead.first_name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium group-hover:text-brand-600 transition-colors">
                          {getLeadFullName(lead)}
                        </div>
                        {lead.service_interest && (
                          <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                            {lead.service_interest}
                          </div>
                        )}
                      </div>
                    </Link>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="text-sm text-muted-foreground">
                      {lead.phone && <div>{formatPhoneNumber(lead.phone)}</div>}
                      {lead.email && <div className="truncate max-w-[180px]">{lead.email}</div>}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-80 ${colors.bg} ${colors.text}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                          {LEAD_STATUS_LABELS[lead.status]}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {STATUS_CYCLE.map((s) => (
                          <DropdownMenuItem
                            key={s}
                            onClick={() => handleStatusChange(lead.id, s)}
                            className={lead.status === s ? "font-semibold" : ""}
                          >
                            {LEAD_STATUS_LABELS[s]}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground capitalize">
                      {lead.source ?? "Direct"}
                    </span>
                  </td>

                  {/* Added */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(lead.created_at)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-7 h-7">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/leads/${lead.id}`}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            View / Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/conversations?lead=${lead.id}`}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Conversations
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/appointments/new?lead=${lead.id}`}>
                            <Calendar className="w-4 h-4 mr-2" />
                            Book appointment
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(lead.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
