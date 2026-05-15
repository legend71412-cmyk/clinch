import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LEAD_STATUS_COLORS, LEAD_STATUS_LABELS, formatRelativeTime, getLeadFullName } from "@/lib/utils";
import type { Lead } from "@/types";

interface RecentLeadsProps { leads: Lead[]; }

export function RecentLeads({ leads }: RecentLeadsProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-base">Recent Leads</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/leads" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </Button>
      </div>

      {leads.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No leads yet. Share your lead capture form to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const colors = LEAD_STATUS_COLORS[lead.status];
            return (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-xs shrink-0">
                  {lead.first_name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{getLeadFullName(lead)}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {lead.source ?? "Direct"} · {formatRelativeTime(lead.created_at)}
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                  {LEAD_STATUS_LABELS[lead.status]}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
