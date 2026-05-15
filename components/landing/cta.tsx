"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 gradient-brand opacity-90" />
          <div className="absolute inset-0 bg-[url('/grid-white.svg')] opacity-10" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />

          <div className="relative text-center py-20 px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 max-w-2xl mx-auto">
              Your competitors are already responding in seconds.
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
              Start your free 14-day trial today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-brand-700 hover:bg-white/90 h-14 px-10 text-base font-semibold"
                asChild
              >
                <Link href="/signup">
                  Start free trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 h-14 px-10 text-base"
                asChild
              >
                <Link href="#pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
