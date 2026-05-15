"use client";

import { useState } from "react";
import { Plus, Calendar, Clock, MapPin, CheckCircle, XCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatDateTime } from "@/lib/utils";
import { updateAppointmentStatus, deleteAppointment, createAppointment } from "@/actions/appointments";
import { CreateAppointmentDialog } from "@/components/appointments/create-appointment-dialog";
import type { Appointment } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  confirmed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  completed: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  no_show: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};

interface AppointmentsClientProps {
  initialAppointments: (Appointment & { lead?: any })[];
  leads: { id: string; first_name: string; last_name: string | null }[];
  businessId: string;
}

export function AppointmentsClient({ initialAppointments, leads, businessId }: AppointmentsClientProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("upcoming");
  const { toast } = useToast();

  const filtered = appointments.filter((a) => {
    if (statusFilter === "upcoming") return ["scheduled", "confirmed"].includes(a.status);
    if (statusFilter === "past") return ["completed", "no_show", "cancelled"].includes(a.status);
    return a.status === statusFilter;
  });

  async function handleStatusChange(id: string, status: Appointment["status"]) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    const result = await updateAppointmentStatus(id, status);
    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    await deleteAppointment(id);
    toast({ title: "Appointment deleted" });
  }

  function handleCreated(appt: Appointment) {
    setAppointments((prev) => [appt, ...prev]);
    setShowCreate(false);
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground text-sm">{appointments.length} total</p>
        </div>
        <Button className="gradient-brand text-white" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Book Appointment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: "upcoming", label: "Upcoming" },
          { value: "past", label: "Past" },
          { value: "cancelled", label: "Cancelled" },
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

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-border p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <h3 className="font-semibold text-base mb-1">No appointments</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {statusFilter === "upcoming" ? "No upcoming appointments." : "No past appointments."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered
            .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
            .map((appt) => (
              <div
                key={appt.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-border p-5 flex items-start gap-4"
              >
                {/* Date column */}
                <div className="shrink-0 w-12 text-center bg-brand-50 dark:bg-brand-900/10 rounded-xl py-2">
                  <div className="text-xs font-bold text-brand-600 uppercase">
                    {formatDate(appt.starts_at, "MMM")}
                  </div>
                  <div className="text-2xl font-bold leading-none text-brand-700 dark:text-brand-300">
                    {formatDate(appt.starts_at, "d")}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{appt.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[appt.status]}`}>
                      {appt.status}
                    </span>
                  </div>
                  {appt.lead && (
                    <p className="text-sm text-muted-foreground">
                      {appt.lead.first_name} {appt.lead.last_name}
                      {appt.lead.phone && ` · ${appt.lead.phone}`}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(appt.starts_at, "h:mm a")} – {formatDate(appt.ends_at, "h:mm a")}
                    </span>
                    {appt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {appt.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {appt.status === "scheduled" && (
                      <DropdownMenuItem onClick={() => handleStatusChange(appt.id, "confirmed")}>
                        <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                        Confirm
                      </DropdownMenuItem>
                    )}
                    {["scheduled", "confirmed"].includes(appt.status) && (
                      <DropdownMenuItem onClick={() => handleStatusChange(appt.id, "completed")}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </DropdownMenuItem>
                    )}
                    {["scheduled", "confirmed"].includes(appt.status) && (
                      <DropdownMenuItem onClick={() => handleStatusChange(appt.id, "cancelled")}>
                        <XCircle className="w-4 h-4 mr-2 text-destructive" />
                        Cancel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(appt.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
        </div>
      )}

      <CreateAppointmentDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        businessId={businessId}
        leads={leads}
        onCreated={handleCreated}
      />
    </div>
  );
}
