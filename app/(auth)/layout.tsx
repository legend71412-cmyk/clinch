import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-col justify-between p-12 gradient-brand relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-white.svg')] opacity-10" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white relative z-10">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          Clinch
        </Link>

        <div className="relative z-10">
          <blockquote className="text-white/90 text-xl font-medium leading-relaxed mb-4">
            &ldquo;Clinch doubled our bookings in the first month. The AI responds so fast, leads think we have a dedicated team.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
              DK
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Dr. David Kim</div>
              <div className="text-white/70 text-xs">Owner, Premier Dental Care</div>
            </div>
          </div>
        </div>

        <div className="flex gap-6 relative z-10">
          {[
            { label: "Avg response", value: "&lt;30s" },
            { label: "Conversion lift", value: "+47%" },
            { label: "Businesses", value: "2,400+" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                className="text-white font-bold text-xl"
                dangerouslySetInnerHTML={{ __html: stat.value }}
              />
              <div className="text-white/60 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-950">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-8 lg:hidden">
          <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          Clinch
        </Link>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
