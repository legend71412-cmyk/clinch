"use client";

import { useState } from "react";
import { Plus, Zap, ToggleLeft, ToggleRight, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { AutomationDialog } from "@/components/automations/automation-dialog";
import { createClient } from "@/lib/supabase/client";
import type { Automation } from "@/types";

const TRIGGER_LABELS: Record<string, string> = {
  new_lead: "New Lead",
  no_reply_24h: "No Reply (24h)",
  no_reply_48h: "No Reply (48h)",
  no_reply_72h: "No Reply (72h)",
  appointment_booked: "Appointment Booked",
  appointment_reminder: "Appointment Reminder",
  custom: "Custom",
};

interface AutomationsClientProps {
  initialAutomations: Automation[];
  businessId: string;
}

export function AutomationsClient({ initialAutomations, businessId }: AutomationsClientProps) {
  const [automations, setAutomations] = useState(initialAutomations);
  const [showDialog, setShowDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<Automation | null>(null);
  const { toast } = useToast();

  async function toggleAutomation(id: string, active: boolean) {
    setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, active } : a)));
    const supabase = createClient();
    await supabase.from("automations").update({ active }).eq("id", id);
  }

  async function deleteAutomation(id: string) {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
    const supabase = createClient();
    const { error } = await supabase.from("automations").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else toast({ title: "Automation deleted" });
  }

  function handleSaved(automation: Automation) {
    setAutomations((prev) => {
      const exists = prev.find((a) => a.id === automation.id);
      return exists
        ? prev.map((a) => (a.id === automation.id ? automation : a))
        : [automation, ...prev];
    });
    setShowDialog(false);
    setEditTarget(null);
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Automations</h1>
          <p className="text-muted-foreground text-sm">Set up automated SMS and email follow-up sequences.</p>
        </div>
        <Button className="gradient-brand text-white" onClick={() => { setEditTarget(null); setShowDialog(true); }}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Automation
        </Button>
      </div>

      {/* Default automations notice */}
      <div className="bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800 rounded-xl p-4 flex gap-3">
        <Zap className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <p className="text-sm text-brand-700 dark:text-brand-300">
          Clinch automatically handles AI-generated replies for new leads. The automations below are additional follow-up sequences you can customize.
        </p>
      </div>

      {automations.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-border p-12 text-center">
          <Zap className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <h3 className="font-semibold text-base mb-1">No automations yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first automation to start following up with leads automatically.
          </p>
          <Button className="gradient-brand text-white" onClick={() => setShowDialog(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Create automation
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map((automation) => (
            <div
              key={automation.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-border p-5 flex items-start gap-4"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${automation.active ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-gray-100 dark:bg-gray-800"}`}>
                <Zap className={`w-5 h-5 ${automation.active ? "text-emerald-600" : "text-gray-400"}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{automation.name}</span>
                  <Badge variant="outline" className="text-[10px] capitalize">{automation.channel}</Badge>
                  {automation.delay_hours > 0 && (
                    <Badge variant="outline" className="text-[10px]">+{automation.delay_hours}h delay</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 px-2 py-0.5 rounded-full font-medium">
                    {TRIGGER_LABELS[automation.trigger] ?? automation.trigger}
                  </span>
                  {automation.ai_personalize && (
                    <span className="text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full font-medium">
                      AI personalized
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{automation.template}</p>
                <p className="text-xs text-muted-foreground mt-1">{automation.send_count} sends</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={automation.active}
                  onCheckedChange={(v) => toggleAutomation(automation.id, v)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7"
                  onClick={() => { setEditTarget(automation); setShowDialog(true); }}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-destructive hover:text-destructive"
                  onClick={() => deleteAutomation(automation.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AutomationDialog
        open={showDialog}
        onOpenChange={(open) => { setShowDialog(open); if (!open) setEditTarget(null); }}
        businessId={businessId}
        automation={editTarget}
        onSaved={handleSaved}
      />
    </div>
  );
}
