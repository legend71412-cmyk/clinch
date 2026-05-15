"use client";

import { useToast } from "./use-toast";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[380px] max-w-[calc(100vw-2rem)]">
      {toasts
        .filter((t) => t.open)
        .map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl border shadow-lg text-sm animate-fade-in",
              toast.variant === "destructive"
                ? "bg-red-600 text-white border-red-700"
                : "bg-white dark:bg-gray-900 border-border"
            )}
          >
            {toast.variant === "destructive" ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            )}
            <div className="flex-1 min-w-0">
              {toast.title && <div className="font-semibold">{toast.title}</div>}
              {toast.description && (
                <div className={cn("mt-0.5 text-xs", toast.variant === "destructive" ? "text-red-100" : "text-muted-foreground")}>
                  {toast.description}
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className={cn("shrink-0", toast.variant === "destructive" ? "text-red-200 hover:text-white" : "text-muted-foreground hover:text-foreground")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
    </div>
  );
}
