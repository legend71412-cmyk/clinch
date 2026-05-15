"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { automationSchema, type AutomationFormData } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import type { Automation } from "@/types";

const TEMPLATE_VARS = ["{{first_name}}", "{{business_name}}", "{{booking_link}}", "{{service}}"];

interface AutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  automation: Automation | null;
  onSaved: (automation: Automation) => void;
}

export function AutomationDialog({ open, onOpenChange, businessId, automation, onSaved }: AutomationDialogProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AutomationFormData>({
    resolver: zodResolver(automationSchema),
    defaultValues: { active: true, ai_personalize: true, delay_hours: 0, channel: "sms" },
  });

  useEffect(() => {
    if (automation) {
      reset({
        name: automation.name,
        description: automation.description ?? "",
        trigger: automation.trigger,
        channel: automation.channel,
        delay_hours: automation.delay_hours,
        template: automation.template,
        ai_personalize: automation.ai_personalize,
        active: automation.active,
      });
    } else {
      reset({ active: true, ai_personalize: true, delay_hours: 0, channel: "sms" });
    }
  }, [automation, reset]);

  async function onSubmit(data: AutomationFormData) {
    const supabase = createClient();
    let result;
    if (automation) {
      result = await supabase
        .from("automations")
        .update(data)
        .eq("id", automation.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("automations")
        .insert({ ...data, business_id: businessId })
        .select()
        .single();
    }

    if (result.error) {
      toast({ title: "Error", description: result.error.message, variant: "destructive" });
      return;
    }

    toast({ title: automation ? "Automation updated" : "Automation created" });
    onSaved(result.data as Automation);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{automation ? "Edit Automation" : "Create Automation"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input placeholder="e.g. 24h SMS Follow-Up" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Trigger *</Label>
              <Controller name="trigger" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select trigger" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_lead">New Lead</SelectItem>
                    <SelectItem value="no_reply_24h">No Reply (24h)</SelectItem>
                    <SelectItem value="no_reply_48h">No Reply (48h)</SelectItem>
                    <SelectItem value="no_reply_72h">No Reply (72h)</SelectItem>
                    <SelectItem value="appointment_booked">Appointment Booked</SelectItem>
                    <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-1.5">
              <Label>Channel *</Label>
              <Controller name="channel" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Delay (hours after trigger)</Label>
            <Input type="number" min={0} {...register("delay_hours", { valueAsNumber: true })} />
          </div>

          <div className="space-y-1.5">
            <Label>Message Template *</Label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {TEMPLATE_VARS.map((v) => (
                <span key={v} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded cursor-pointer hover:bg-brand-50 hover:text-brand-700">{v}</span>
              ))}
            </div>
            <Textarea
              rows={4}
              placeholder="Hi {{first_name}}, just checking in from {{business_name}}..."
              {...register("template")}
            />
            {errors.template && <p className="text-xs text-destructive">{errors.template.message}</p>}
            <p className="text-xs text-muted-foreground">Use the variables above to personalize your message.</p>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label>AI Personalization</Label>
              <p className="text-xs text-muted-foreground">Let AI rewrite this template for each lead</p>
            </div>
            <Controller name="ai_personalize" control={control} render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )} />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label>Active</Label>
            <Controller name="active" control={control} render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="gradient-brand text-white" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : automation ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
