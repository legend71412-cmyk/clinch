import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true });
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

export function formatDate(date: string | Date, pattern = "MMM d, yyyy"): string {
  return format(typeof date === "string" ? new Date(date) : date, pattern);
}

export function formatDateTime(date: string | Date): string {
  return format(typeof date === "string" ? new Date(date) : date, "MMM d, yyyy h:mm a");
}

export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function getInitials(firstName: string, lastName?: string | null): string {
  const first = firstName[0]?.toUpperCase() ?? "";
  const last = lastName?.[0]?.toUpperCase() ?? "";
  return first + last || "?";
}

export function getLeadFullName(lead: {
  first_name: string;
  last_name?: string | null;
}): string {
  return [lead.first_name, lead.last_name].filter(Boolean).join(" ");
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function percentOf(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function currencyFormat(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

// Safely parse JSON, returning a fallback on error
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// Replace {{variable}} placeholders in automation templates
export function interpolateTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
}

// Lead status display helpers
export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  booked: "Booked",
  won: "Won",
  lost: "Lost",
};

export const LEAD_STATUS_COLORS: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  new: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  contacted: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  booked: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  won: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  lost: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

export const INDUSTRY_LABELS: Record<string, string> = {
  dental: "Dental",
  med_spa: "Med Spa",
  auto_detail: "Auto Detailing",
  gym: "Gym / Fitness",
  tutoring: "Tutoring",
  photography: "Photography",
  home_services: "Home Services",
  real_estate: "Real Estate",
  other: "Other",
};

export const TONE_LABELS: Record<string, string> = {
  friendly: "Friendly",
  professional: "Professional",
  luxury: "Luxury",
  casual: "Casual",
  urgent: "Urgent",
};
