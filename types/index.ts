// ============================================================
// Clinch — Core TypeScript Types
// ============================================================

export type LeadStatus = "new" | "contacted" | "booked" | "won" | "lost";
export type MessageDirection = "inbound" | "outbound";
export type MessageChannel = "sms" | "email" | "chat";
export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";
export type AutomationTrigger =
  | "new_lead"
  | "no_reply_24h"
  | "no_reply_48h"
  | "no_reply_72h"
  | "appointment_booked"
  | "appointment_reminder"
  | "custom";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "paused";
export type SubscriptionTier = "starter" | "pro" | "agency";
export type AiTone = "friendly" | "professional" | "luxury" | "casual" | "urgent";
export type Industry =
  | "dental"
  | "med_spa"
  | "auto_detail"
  | "gym"
  | "tutoring"
  | "photography"
  | "home_services"
  | "real_estate"
  | "other";

// ============================================================
// Business
// ============================================================

export interface BusinessHours {
  open: string;
  close: string;
  enabled: boolean;
}

export interface BusinessHoursMap {
  mon: BusinessHours;
  tue: BusinessHours;
  wed: BusinessHours;
  thu: BusinessHours;
  fri: BusinessHours;
  sat: BusinessHours;
  sun: BusinessHours;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  industry: Industry;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  timezone: string;
  booking_link: string | null;
  logo_url: string | null;
  ai_tone: AiTone;
  business_hours: BusinessHoursMap;
  services: string[];
  onboarding_done: boolean;
  twilio_account_sid: string | null;
  twilio_auth_token: string | null;
  twilio_phone_number: string | null;
  openai_api_key: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Lead
// ============================================================

export interface Lead {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  score: number;
  notes: string | null;
  tags: string[];
  service_interest: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  custom_fields: Record<string, unknown>;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type LeadWithConversation = Lead & {
  conversations?: Conversation[];
};

// ============================================================
// Conversation & Messages
// ============================================================

export interface Conversation {
  id: string;
  business_id: string;
  lead_id: string;
  channel: MessageChannel;
  last_message: string | null;
  unread_count: number;
  ai_active: boolean;
  created_at: string;
  updated_at: string;
  lead?: Lead;
}

export interface Message {
  id: string;
  conversation_id: string;
  business_id: string;
  direction: MessageDirection;
  channel: MessageChannel;
  content: string;
  ai_generated: boolean;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
  error: string | null;
  external_id: string | null;
  metadata: Record<string, unknown>;
}

// ============================================================
// Appointment
// ============================================================

export interface Appointment {
  id: string;
  business_id: string;
  lead_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  location: string | null;
  notes: string | null;
  reminder_sent: boolean;
  confirmation_sent: boolean;
  external_booking_id: string | null;
  created_at: string;
  updated_at: string;
  lead?: Lead;
}

// ============================================================
// Automation
// ============================================================

export interface Automation {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  trigger: AutomationTrigger;
  channel: MessageChannel;
  delay_hours: number;
  template: string;
  ai_personalize: boolean;
  active: boolean;
  send_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Prompt Template
// ============================================================

export interface PromptTemplate {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Subscription
// ============================================================

export interface Subscription {
  id: string;
  business_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  leads_limit: number;
  messages_limit: number;
  leads_used: number;
  messages_used: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Analytics
// ============================================================

export interface AnalyticsDaily {
  id: string;
  business_id: string;
  date: string;
  leads_created: number;
  leads_contacted: number;
  leads_booked: number;
  leads_won: number;
  messages_sent: number;
  messages_received: number;
  appointments_scheduled: number;
  appointments_completed: number;
  ai_responses: number;
}

export interface DashboardStats {
  total_leads: number;
  new_leads_today: number;
  leads_this_month: number;
  appointments_booked: number;
  conversion_rate: number;
  messages_sent: number;
  ai_responses: number;
  revenue_at_risk: number;
}

// ============================================================
// Lead Note
// ============================================================

export interface LeadNote {
  id: string;
  lead_id: string;
  business_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
}

// ============================================================
// Forms & Actions
// ============================================================

export interface LeadCaptureFormData {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  service_interest?: string;
  message?: string;
  business_id: string;
  source?: string;
}

export interface OnboardingFormData {
  name: string;
  industry: Industry;
  phone: string;
  booking_link: string;
  ai_tone: AiTone;
  services: string[];
  timezone: string;
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================
// Pricing
// ============================================================

export interface PricingTier {
  id: SubscriptionTier;
  name: string;
  price: number;
  priceId: string;
  description: string;
  features: string[];
  limits: {
    leads: number;
    messages: number;
    team_members: number;
  };
  popular?: boolean;
}
