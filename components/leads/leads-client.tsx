"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadTable } from "@/components/leads/lead-table";
import { CreateLeadDialog } from "@/components/leads/create-lead-dialog";
import { LEAD_STATUS_LABELS } from "@/lib/utils";
import type { Lead } from "@/types";

interface LeadsClientProps {
  initialLeads: Lead[];
  businessId: string;
  subscription: { tier: string; leads_limit: number; leads_used: number } | null;
}

export function LeadsClient({ initialLeads, businessId, subscription }: LeadsClientProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        search.trim() === "" ||
        `${lead.first_name} ${lead.last_name ?? ""} ${lead.email ?? ""} ${lead.phone ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => { counts[l.status] = (counts[l.status] ?? 0) + 1; });
    return counts;
  }, [leads]);

  function handleLeadCreated(lead: Lead) {
    setLeads((prev) => [lead, ...prev]);
    setShowCreate(false);
  }

  function exportCsv() {
    const rows = [
      ["First Name", "Last Name", "Email", "Phone", "Status", "Source", "Created"],
      ...filteredLeads.map((l) => [
        l.first_name,
        l.last_name ?? "",
        l.email ?? "",
        l.phone ?? "",
        l.status,
        l.source ?? "",
        l.created_at,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const atLimit = subscription
    ? subscription.leads_limit !== -1 && subscription.leads_used >= subscription.leads_limit
    : false;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground text-sm">{leads.length} total leads</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
          <Button
            size="sm"
            className="gradient-brand text-white"
            onClick={() => setShowCreate(true)}
            disabled={atLimit}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Subscription usage */}
      {subscription && subscription.leads_limit !== -1 && (
        <div className="bg-white dark:bg-gray-900 border border-border rounded-xl p-4 flex items-center gap-4">
          <Users className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Leads used this month</span>
              <span className="font-medium">{subscription.leads_used} / {subscription.leads_limit}</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all"
                style={{ width: `${Math.min((subscription.leads_used / subscription.leads_limit) * 100, 100)}%` }}
              />
            </div>
          </div>
          {atLimit && (
            <Button size="sm" className="gradient-brand text-white shrink-0" asChild>
              <a href="/billing">Upgrade</a>
            </Button>
          )}
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all", label: `All (${leads.length})` },
          ...Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({
            value,
            label: `${label} (${statusCounts[value] ?? 0})`,
          })),
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              statusFilter === tab.value
                ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            className="pl-9 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <p className="text-sm text-muted-foreground ml-auto">
          {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <LeadTable
        leads={filteredLeads}
        onLeadsChange={setLeads}
      />

      {/* Create lead dialog */}
      <CreateLeadDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        businessId={businessId}
        onCreated={handleLeadCreated}
      />
    </div>
  );
}
