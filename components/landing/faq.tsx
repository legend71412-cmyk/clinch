"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "How fast does Clinch respond to new leads?",
    a: "Typically within 5-30 seconds of a lead submitting a form — even at 2am on a Sunday. Speed is one of the biggest factors in lead conversion, and Clinch ensures you're always first to respond.",
  },
  {
    q: "Can I customize what the AI says?",
    a: "Absolutely. You can set your AI's tone (friendly, professional, luxury, casual), edit the base system prompt, create custom message templates, and even review/edit responses before they go out. You're always in control.",
  },
  {
    q: "Does it work with my existing booking system?",
    a: "Yes. Clinch integrates with any booking system via your booking link. The AI guides leads to click your link and book directly. We also support Calendly, Acuity, Jane App, and other platforms.",
  },
  {
    q: "What if I want to take over a conversation?",
    a: "You can pause AI on any conversation with one click and reply manually. Clinch hands off gracefully and you can re-enable AI at any time.",
  },
  {
    q: "Do I need technical experience to set this up?",
    a: "Not at all. Setup takes about 5 minutes: enter your business info, connect your Twilio number for SMS, add your booking link, and you're live. Our guided onboarding walks you through every step.",
  },
  {
    q: "Is my customer data secure?",
    a: "Yes. All data is encrypted at rest and in transit. We use Supabase with row-level security so each business's data is completely isolated. We never sell or share your data.",
  },
  {
    q: "Can I use my own phone number for SMS?",
    a: "Yes. You can use your existing Twilio number or purchase a new local number. Clinch supports full A2P 10DLC compliance for business SMS.",
  },
  {
    q: "What happens when I hit my plan limits?",
    a: "We'll notify you when you're at 80% of your limit so you can upgrade before it impacts your business. We never silently drop messages — we always let you know.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="py-24 bg-gray-50 dark:bg-gray-950/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Frequently asked questions</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Clinch.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-white dark:bg-gray-900 rounded-xl border border-border px-6"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
