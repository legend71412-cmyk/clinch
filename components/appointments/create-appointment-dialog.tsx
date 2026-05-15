"use client";

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
import { useToast } from "@/hooks/use-toast";
import { createAppointmentSchema, type CreateAppointmentFormData } from "@/lib/validations";
import { createAppointment } from "@/actions/appointments";
import type { Appointment } from "@/types";

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  leads: { id: string; first_name: string; last_name: string | null }[];
  onCreated: (appt: Appointment) => void;
  defaultLeadId?: string;
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  businessId,
  leads,
  onCreated,
  defaultLeadId,
}: CreateAppointmentDialogProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAppointmentFormData>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: { lead_id: defaultLeadId },
  });

  async function onSubmit(data: CreateAppointmentFormData) {
    const result = await createAppointment(data as Record<string, unknown>);
    if (result.success) {
      toast({ title: "Appointment booked!" });
      reset();
      onCreated(result.data);
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Lead *</Label>
            <Controller name="lead_id" control={control} render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.first_name} {lead.last_name ?? ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
            {errors.lead_id && <p className="text-xs text-destructive">{errors.lead_id.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input placeholder="e.g. Consultation" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date & Time *</Label>
              <Input type="datetime-local" {...register("starts_at")} />
              {errors.starts_at && <p className="text-xs text-destructive">{errors.starts_at.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>End Date & Time *</Label>
              <Input type="datetime-local" {...register("ends_at")} />
              {errors.ends_at && <p className="text-xs text-destructive">{errors.ends_at.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input placeholder="e.g. Office, Google Meet, or address" {...register("location")} />
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={2} {...register("notes")} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="gradient-brand text-white" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Book Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
