"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateBusinessSettings } from "@/actions/business";
import { INDUSTRY_LABELS, TONE_LABELS } from "@/lib/utils";
import type { Business, PromptTemplate } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface SettingsClientProps {
  business: Business;
  promptTemplates: PromptTemplate[];
}

export function SettingsClient({ business, promptTemplates }: SettingsClientProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showTwilioToken, setShowTwilioToken] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [promptContent, setPromptContent] = useState(
    promptTemplates.find((p) => p.is_default)?.system_prompt ?? ""
  );
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);

  const [formData, setFormData] = useState({
    name: business.name,
    phone: business.phone ?? "",
    email: business.email ?? "",
    website: business.website ?? "",
    address: business.address ?? "",
    city: business.city ?? "",
    state: business.state ?? "",
    timezone: business.timezone,
    booking_link: business.booking_link ?? "",
    ai_tone: business.ai_tone,
    industry: business.industry,
    twilio_account_sid: business.twilio_account_sid ?? "",
    twilio_auth_token: business.twilio_auth_token ?? "",
    twilio_phone_number: business.twilio_phone_number ?? "",
    openai_api_key: business.openai_api_key ?? "",
  });

  async function handleSave() {
    setIsSaving(true);
    const result = await updateBusinessSettings(formData as any);
    if (result.success) {
      toast({ title: "Settings saved" });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setIsSaving(false);
  }

  async function handleSavePrompt() {
    setIsSavingPrompt(true);
    const supabase = createClient();
    const defaultTemplate = promptTemplates.find((p) => p.is_default);

    if (defaultTemplate) {
      await supabase
        .from("prompt_templates")
        .update({ system_prompt: promptContent })
        .eq("id", defaultTemplate.id);
    } else {
      await supabase.from("prompt_templates").insert({
        business_id: business.id,
        name: "Default Follow-Up",
        system_prompt: promptContent,
        is_default: true,
      });
    }
    toast({ title: "AI prompt saved" });
    setIsSavingPrompt(false);
  }

  function field(key: keyof typeof formData) {
    return {
      value: formData[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setFormData((prev) => ({ ...prev, [key]: e.target.value })),
    };
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your business profile and integrations.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI & Tone</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* ---- General ---- */}
        <TabsContent value="general" className="space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-base">Business Info</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Business Name</Label>
                <Input {...field("name")} />
              </div>
              <div className="space-y-1.5">
                <Label>Industry</Label>
                <Select value={formData.industry} onValueChange={(v) => setFormData((p) => ({ ...p, industry: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(INDUSTRY_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input type="tel" {...field("phone")} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" {...field("email")} />
              </div>
              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input type="url" placeholder="https://" {...field("website")} />
              </div>
              <div className="space-y-1.5">
                <Label>Booking Link</Label>
                <Input type="url" placeholder="https://calendly.com/..." {...field("booking_link")} />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input {...field("city")} />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input {...field("state")} />
              </div>
            </div>
            <Button className="gradient-brand text-white" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* ---- AI & Tone ---- */}
        <TabsContent value="ai" className="space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-base">AI Tone</h3>
            <p className="text-sm text-muted-foreground">Choose how your AI communicates with leads.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(TONE_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFormData((p) => ({ ...p, ai_tone: value as any }))}
                  className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
                    formData.ai_tone === value
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 dark:border-brand-700"
                      : "border-border hover:border-brand-300 hover:bg-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Button className="gradient-brand text-white" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-base">System Prompt</h3>
            <p className="text-sm text-muted-foreground">
              This is the base prompt that defines how your AI behaves. Customize it to match your business.
            </p>
            <Textarea
              rows={10}
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              className="font-mono text-xs"
            />
            <Button className="gradient-brand text-white" onClick={handleSavePrompt} disabled={isSavingPrompt}>
              {isSavingPrompt ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Prompt
            </Button>
          </div>
        </TabsContent>

        {/* ---- Integrations ---- */}
        <TabsContent value="integrations" className="space-y-5">
          {/* Twilio */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-base">Twilio (SMS)</h3>
            <p className="text-sm text-muted-foreground">
              Add your own Twilio credentials to send SMS from your business number. Leave blank to use our shared number.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Account SID</Label>
                <Input placeholder="ACxxx..." {...field("twilio_account_sid")} />
              </div>
              <div className="space-y-1.5">
                <Label>Auth Token</Label>
                <div className="relative">
                  <Input
                    type={showTwilioToken ? "text" : "password"}
                    placeholder="••••••••"
                    {...field("twilio_auth_token")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowTwilioToken(!showTwilioToken)}
                  >
                    {showTwilioToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Phone Number</Label>
                <Input placeholder="+15550000000" {...field("twilio_phone_number")} />
              </div>
            </div>
          </div>

          {/* OpenAI */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-base">OpenAI</h3>
            <p className="text-sm text-muted-foreground">
              Add your own OpenAI API key for dedicated usage and higher rate limits. Leave blank to use the shared key.
            </p>
            <div className="space-y-1.5">
              <Label>API Key</Label>
              <div className="relative">
                <Input
                  type={showOpenAIKey ? "text" : "password"}
                  placeholder="sk-..."
                  {...field("openai_api_key")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                >
                  {showOpenAIKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button className="gradient-brand text-white" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Integrations
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
