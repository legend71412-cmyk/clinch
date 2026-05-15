"use client";

import { motion } from "framer-motion";

const INDUSTRIES = [
  "Dental Practices",
  "Med Spas",
  "Auto Detailers",
  "Gyms & Studios",
  "Tutoring Centers",
  "Photographers",
  "Home Services",
  "Real Estate",
  "Chiropractors",
  "Law Firms",
];

export function LogoCloud() {
  return (
    <section className="py-12 border-y border-border/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm font-medium text-muted-foreground mb-8">
          Trusted by local businesses across every industry
        </p>
        <div className="relative flex overflow-x-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="flex gap-10 whitespace-nowrap"
          >
            {[...INDUSTRIES, ...INDUSTRIES].map((industry, i) => (
              <span
                key={i}
                className="text-sm font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-default"
              >
                ✦ {industry}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
