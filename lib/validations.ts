import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const onboardingSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  industry: z.enum([
    "dental",
    "med_spa",
    "auto_detail",
    "gym",
    "tutoring",
    "photography",
    "home_services",
    "real_estate",
    "other",
  ]),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-().]{7,}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  booking_link: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  ai_tone: z.enum(["friendly", "professional", "luxury", "casual", "urgent"]),
  services: z.array(z.string()).min(1, "Add at least one service"),
  timezone: z.string().min(1, "Select a timezone"),
});

export const leadCaptureSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-().]{7,}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  service_interest: z.string().optional(),
  message: z.string().max(1000).optional(),
  business_id: z.string().uuid("Invalid business ID"),
  source: z.string().optional(),
});

export const createLeadSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-().]{7,}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  source: z.string().optional(),
  status: z.enum(["new", "contacted", "booked", "won", "lost"]).optional(),
  service_interest: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  status: z.enum(["new", "contacted", "booked", "won", "lost"]).optional(),
  score: z.number().int().min(0).max(100).optional(),
});

export const createAppointmentSchema = z.object({
  lead_id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const sendMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  content: z.string().min(1, "Message cannot be empty").max(1600),
  channel: z.enum(["sms", "email", "chat"]),
});

export const automationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  trigger: z.enum([
    "new_lead",
    "no_reply_24h",
    "no_reply_48h",
    "no_reply_72h",
    "appointment_booked",
    "appointment_reminder",
    "custom",
  ]),
  channel: z.enum(["sms", "email", "chat"]),
  delay_hours: z.number().int().min(0),
  template: z.string().min(1, "Template is required"),
  ai_personalize: z.boolean(),
  active: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
export type CreateLeadFormData = z.infer<typeof createLeadSchema>;
export type UpdateLeadFormData = z.infer<typeof updateLeadSchema>;
export type CreateAppointmentFormData = z.infer<typeof createAppointmentSchema>;
export type SendMessageFormData = z.infer<typeof sendMessageSchema>;
export type AutomationFormData = z.infer<typeof automationSchema>;
