"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Dr. Rachel Kim",
    title: "Owner, Bright Smile Dental",
    avatar: "RK",
    quote: "We used to lose 3-4 leads every week because we couldn't respond fast enough. Clinch fixed that overnight. Our bookings are up 40% in just 2 months.",
    stars: 5,
    industry: "Dental",
  },
  {
    name: "Marcus Thompson",
    title: "Founder, Elite Auto Detail",
    avatar: "MT",
    quote: "I'm a one-man show. I can't be texting customers while I'm detailing cars. Clinch handles all my follow-ups and books the appointments. It's like having a full-time receptionist.",
    stars: 5,
    industry: "Auto Detailing",
  },
  {
    name: "Sophia Patel",
    title: "Director, Glow Med Spa",
    avatar: "SP",
    quote: "The AI tone customization is incredible. Our luxury brand voice is maintained perfectly in every message. Clients actually compliment us on how quickly and professionally we respond.",
    stars: 5,
    industry: "Med Spa",
  },
  {
    name: "James Okonkwo",
    title: "Owner, Peak Performance Gym",
    avatar: "JO",
    quote: "We converted 23 leads into memberships in the first month — leads we would have just lost. The ROI on this tool is insane compared to the monthly cost.",
    stars: 5,
    industry: "Gym",
  },
  {
    name: "Amanda Chen",
    title: "Photographer, Chen Studios",
    avatar: "AC",
    quote: "I was skeptical about AI handling my client inquiries, but the messages feel so natural. Clients don't even know it's automated until they meet me at the shoot.",
    stars: 5,
    industry: "Photography",
  },
  {
    name: "Robert Vasquez",
    title: "Owner, Vasquez Home Services",
    avatar: "RV",
    quote: "Responding to leads at 11pm used to keep me up at night. Now Clinch does it automatically and I wake up to booked estimates. Sleep has never been better.",
    stars: 5,
    industry: "Home Services",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Loved by <span className="gradient-brand-text">2,400+ businesses</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From solo operators to growing agencies — businesses of every size trust Clinch to never miss a lead.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-border card-hover"
            >
              <div className="flex mb-3">
                {[...Array(t.stars)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-foreground mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.title}</div>
                </div>
                <div className="ml-auto">
                  <span className="text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full font-medium">
                    {t.industry}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
