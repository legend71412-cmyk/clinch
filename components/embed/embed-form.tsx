"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { leadCaptureSchema } from "@/lib/validations";
import type { z } from "zod";

type FormData = z.infer<typeof leadCaptureSchema>;

interface EmbedFormProps {
  business: { id: string; name: string; services: string[]; industry: string };
}

export function EmbedForm({ business }: EmbedFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(leadCaptureSchema),
    defaultValues: { business_id: business.id, source: "embed_widget" },
  });

  async function onSubmit(data: FormData) {
    setError(null);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="bg-white rounded-2xl border border-border p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">We&apos;ll be in touch!</h2>
          <p className="text-muted-foreground text-sm">
            Thanks for reaching out to {business.name}. We typically respond within a few minutes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="bg-white rounded-2xl border border-border p-8 max-w-md w-full shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1">Get in touch with {business.name}</h1>
          <p className="text-muted-foreground text-sm">
            Fill out the form below and we&apos;ll reach out promptly.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("business_id")} />
          <input type="hidden" {...register("source")} />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">First Name *</Label>
              <Input id="first_name" placeholder="Jane" {...register("first_name")} />
              {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" placeholder="Smith" {...register("last_name")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" {...register("phone")} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="jane@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          {business.services.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="service_interest">What can we help you with?</Label>
              <Input
                id="service_interest"
                placeholder={business.services[0]}
                {...register("service_interest")}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea id="message" placeholder="Tell us a bit about what you need..." rows={3} {...register("message")} />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-red-50 rounded-lg p-3">{error}</p>
          )}

          <Button type="submit" className="w-full gradient-brand text-white h-11" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Message →"}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Zap className="w-3 h-3" />
          Powered by Clinch
        </div>
      </div>
    </div>
  );
}
