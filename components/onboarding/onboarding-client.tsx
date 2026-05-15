"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, ChevronRight, Plus, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { onboardingSchema, type OnboardingFormData } from "@/lib/validations";
import { createOrUpdateBusiness } from "@/actions/business";
import { INDUSTRY_LABELS, TONE_LABELS } from "@/lib/utils";
import type { Business } from "@/types";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
];

const STEPS = [
  { id: 1, title: "Business Info", description: "Tell us about your business" },
  { id: 2, title: "Services", description: "What services do you offer?" },
  { id: 3, title: "AI Settings", description: "Customize your AI personality" },
  { id: 4, title: "Done!", description: "You're ready to go" },
];

interface OnboardingClientProps {
  initialBusiness: Business | null;
}

export function OnboardingClient({ initialBusiness }: OnboardingClientProps) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<string[]>(initialBusiness?.services ?? []);
  const [newService, setNewService] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: initialBusiness?.name ?? "",
      industry: initialBusiness?.industry ?? "other",
      phone: initialBusiness?.phone ?? "",
      booking_link: initialBusiness?.booking_link ?? "",
      ai_tone: initialBusiness?.ai_tone ?? "friendly",
      services: initialBusiness?.services ?? [],
      timezone: initialBusiness?.timezone ?? "America/New_York",
    },
  });

  function addService() {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices((prev) => [...prev, newService.trim()]);
      setNewService("");
    }
  }

  function removeService(s: string) {
    setServices((prev) => prev.filter((x) => x !== s));
  }

  async function onSubmit(data: OnboardingFormData) {
    const result = await createOrUpdateBusiness({ ...data, services });
    if (result.success) {
      setStep(4);
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  }

  function handleFinish() {
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 font-bold text-xl mb-8">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="gradient-brand-text">Clinch</span>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s.id < step
                    ? "gradient-brand text-white"
                    : s.id === step
                    ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 ring-2 ring-brand-500"
                    : "bg-gray-200 dark:bg-gray-800 text-muted-foreground"
                }`}
              >
                {s.id < step ? <CheckCircle className="w-4 h-4" /> : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-px ${s.id < step ? "bg-brand-400" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-8"
          >
            <div className="mb-6">
              <h1 className="text-xl font-bold mb-1">{STEPS[step - 1].title}</h1>
              <p className="text-muted-foreground text-sm">{STEPS[step - 1].description}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Business Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Business Name *</Label>
                    <Input placeholder="Bright Smile Dental" {...register("name")} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Industry *</Label>
                    <Controller name="industry" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(INDUSTRY_LABELS).map(([v, l]) => (
                            <SelectItem key={v} value={v}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Business Phone</Label>
                    <Input type="tel" placeholder="+1 (555) 000-0000" {...register("phone")} />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Timezone *</Label>
                    <Controller name="timezone" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TIMEZONES.map((tz) => (
                            <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Booking Link</Label>
                    <Input type="url" placeholder="https://calendly.com/your-link" {...register("booking_link")} />
                    <p className="text-xs text-muted-foreground">Your Calendly, Acuity, or other booking URL</p>
                  </div>
                  <Button type="button" className="w-full gradient-brand text-white" onClick={() => setStep(2)}>
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Step 2: Services */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Add the services you offer. The AI will use these to answer lead questions.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Teeth Whitening"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addService(); } }}
                    />
                    <Button type="button" variant="outline" onClick={addService}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {services.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {services.map((s) => (
                        <span key={s} className="flex items-center gap-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-sm px-3 py-1 rounded-full border border-brand-200 dark:border-brand-800">
                          {s}
                          <button type="button" onClick={() => removeService(s)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {services.length === 0 && (
                    <p className="text-xs text-muted-foreground">Add at least one service to continue.</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button
                      type="button"
                      className="flex-1 gradient-brand text-white"
                      onClick={() => services.length > 0 && setStep(3)}
                      disabled={services.length === 0}
                    >
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: AI Settings */}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Choose how your AI communicates with leads.</p>
                  <Controller name="ai_tone" control={control} render={({ field }) => (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(TONE_LABELS).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => field.onChange(value)}
                          className={`p-4 rounded-xl border text-sm font-medium text-left transition-all ${
                            field.value === value
                              ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 dark:border-brand-700"
                              : "border-border hover:border-brand-300 hover:bg-accent"
                          }`}
                        >
                          <div className="font-semibold">{label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {value === "friendly" && "Warm and approachable"}
                            {value === "professional" && "Formal and precise"}
                            {value === "luxury" && "Refined and elevated"}
                            {value === "casual" && "Relaxed and down-to-earth"}
                            {value === "urgent" && "Direct and action-focused"}
                          </div>
                        </button>
                      ))}
                    </div>
                  )} />
                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button
                      type="submit"
                      className="flex-1 gradient-brand text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Finish Setup <ChevronRight className="w-4 h-4 ml-1" /></>}
                    </Button>
                  </div>
                </div>
              )}
            </form>

            {/* Step 4: Done */}
            {step === 4 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">You&apos;re all set!</h2>
                  <p className="text-muted-foreground text-sm">
                    Your business is configured. Clinch is ready to start capturing and following up with leads.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left space-y-2">
                  <p className="text-sm font-semibold">What happens next:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Share your lead capture form URL with leads</li>
                    <li>✓ Clinch will instantly respond via SMS/email</li>
                    <li>✓ Follow-up automations will run automatically</li>
                    <li>✓ Track everything from your dashboard</li>
                  </ul>
                </div>
                <Button className="w-full gradient-brand text-white" onClick={handleFinish}>
                  Go to Dashboard →
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
