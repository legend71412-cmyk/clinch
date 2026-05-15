import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Clinch — AI-Powered Lead Follow-Up for Local Businesses",
    template: "%s | Clinch",
  },
  description:
    "Capture, respond, nurture, and convert leads automatically with AI-powered SMS and email follow-ups. Built for local businesses.",
  keywords: [
    "lead follow-up",
    "AI CRM",
    "SMS automation",
    "local business",
    "appointment booking",
    "lead nurturing",
  ],
  authors: [{ name: "Clinch" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://clinch.ai",
    title: "Clinch — AI-Powered Lead Follow-Up",
    description: "Never lose a lead again. AI instantly responds, nurtures, and books appointments for your business.",
    siteName: "Clinch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinch — AI-Powered Lead Follow-Up",
    description: "Never lose a lead again.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1220" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
