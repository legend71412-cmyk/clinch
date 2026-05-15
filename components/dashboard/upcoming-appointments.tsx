import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { Appointment } from "@/types";

interface UpcomingAppointmentsProps {
  appointments: (Appointment & { lead?: { first_name: string; last_name: string | null } | null })[];
}

const STATUS_STYLES = {
  scheduled: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  confirmed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  cancelled: "bg-red-50 text-red-700",
  completed: "bg-gray-50 text-gray-600",
  no_show: "bg-red-50 text-red-700",
};

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-base">Upcoming Appointments</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/appointments" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </Button>
      </div>

      {appointments.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No upcoming appointments. They&apos;ll appear here once leads book.
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <Link
              key={appt.id}
              href={`/appointments/${appt.id}`}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="shrink-0 w-10 text-center">
                <div className="text-xs font-bold text-brand-600 uppercase">
                  {formatDate(appt.starts_at, "MMM")}
                </div>
                <div className="text-lg font-bold leading-none">
                  {formatDate(appt.starts_at, "d")}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{appt.title}</div>
                {appt.lead && (
                  <div className="text-xs text-muted-foreground">
                    {appt.lead.first_name} {appt.lead.last_name}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Clock className="w-3 h-3" />
                  {formatDate(appt.starts_at, "h:mm a")}
                  {appt.location && (
                    <>
                      <MapPin className="w-3 h-3 ml-1" />
                      <span className="truncate">{appt.location}</span>
                    </>
                  )}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_STYLES[appt.status]}`}>
                {appt.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
