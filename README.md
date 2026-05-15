# Clinch — AI-Powered Lead Follow-Up SaaS

Clinch is a production-ready multi-tenant SaaS application that helps local businesses automatically capture, respond to, nurture, and convert leads into booked appointments using AI-powered SMS and email.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui, Framer Motion |
| Backend | Supabase (PostgreSQL + Auth + RLS + Realtime) |
| AI | OpenAI GPT-4o-mini |
| SMS | Twilio |
| Email | Resend |
| Payments | Stripe (subscriptions + webhook) |
| Deployment | Vercel |

---

## Features

- **AI Auto-Reply** — Responds to new leads within seconds, 24/7
- **SMS & Email Sequences** — Automated follow-up at 24h, 48h, 72h
- **Appointment Booking** — Guide leads to book via your Calendly/Acuity link
- **Multi-tenant** — Each business gets fully isolated data via Row Level Security
- **Lead Management** — Full CRUD with status pipeline, notes, search/filter, CSV export
- **Conversations Inbox** — Real-time messaging with AI suggestions
- **Automations Engine** — Configurable trigger-based message sequences
- **Analytics** — Charts for lead activity, conversion rates, AI usage
- **Stripe Billing** — 14-day trial, 3 pricing tiers, billing portal
- **Embeddable Widget** — Drop an iframe anywhere to capture leads
- **Dark mode** — Full dark/light theme support

---

## Project Structure

```
clinch/
├── app/
│   ├── (auth)/               # Login, signup, forgot-password pages
│   ├── (dashboard)/          # Protected app pages
│   │   ├── dashboard/        # Overview stats + charts
│   │   ├── leads/            # Lead management
│   │   ├── conversations/    # Messaging inbox with AI
│   │   ├── appointments/     # Booking management
│   │   ├── automations/      # Follow-up automation builder
│   │   ├── analytics/        # Charts and reports
│   │   ├── settings/         # Business profile + integrations
│   │   └── billing/          # Stripe subscription management
│   ├── (marketing)/          # Public landing page
│   ├── api/
│   │   ├── webhooks/stripe/  # Stripe event handler
│   │   ├── webhooks/twilio/  # Inbound SMS handler + AI reply
│   │   ├── leads/            # Public lead capture endpoint
│   │   ├── ai/suggest/       # AI reply suggestions
│   │   └── billing/          # Checkout + portal sessions
│   ├── embed/[businessId]/   # Embeddable lead capture form
│   └── onboarding/           # First-run business setup
├── components/
│   ├── ui/                   # shadcn/ui primitives
│   ├── dashboard/            # Dashboard-specific components
│   ├── leads/                # Lead table, create dialog
│   ├── conversations/        # Messaging client
│   ├── appointments/         # Appointment components
│   ├── automations/          # Automation builder
│   ├── analytics/            # Chart components
│   ├── billing/              # Billing UI
│   ├── settings/             # Settings tabs
│   ├── auth/                 # Auth forms
│   ├── landing/              # Marketing page sections
│   ├── onboarding/           # Setup wizard
│   └── embed/                # Embeddable form
├── lib/
│   ├── supabase/             # Browser + server + admin clients
│   ├── openai/               # Client + prompt engineering
│   ├── twilio/               # SMS client
│   ├── resend/               # Email client + templates
│   ├── stripe/               # Stripe client + pricing config
│   ├── utils.ts              # Shared utilities
│   └── validations.ts        # Zod schemas
├── actions/                  # Next.js Server Actions
│   ├── leads.ts
│   ├── conversations.ts
│   ├── appointments.ts
│   └── business.ts
├── types/index.ts            # All TypeScript types
├── hooks/use-toast.ts
├── middleware.ts             # Auth routing
└── supabase/schema.sql       # Full DB schema with RLS
```

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-org/clinch.git
cd clinch
npm install
```

### 2. Copy environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local` (see each section below).

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full contents of `supabase/schema.sql`
3. In **Settings → API**, copy your:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`
4. In **Authentication → URL Configuration**, set:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
5. Enable **Email** auth provider under **Authentication → Providers**

### 4. Set up OpenAI

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key and add it as `OPENAI_API_KEY`

### 5. Set up Twilio (for SMS)

1. Create an account at [twilio.com](https://twilio.com)
2. Buy a phone number with SMS capability
3. Add to `.env.local`:
   ```
   TWILIO_ACCOUNT_SID=ACxxx
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+15550000000
   ```
4. After deploying (or using ngrok locally), configure your Twilio number's **SMS Webhook** to:
   ```
   POST https://your-domain.com/api/webhooks/twilio
   ```

### 6. Set up Resend (for email)

1. Create an account at [resend.com](https://resend.com)
2. Create an API key → `RESEND_API_KEY`
3. Verify your sending domain → `RESEND_FROM_EMAIL`

### 7. Set up Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Create 3 products with monthly prices:
   - **Starter** — $97/mo
   - **Pro** — $197/mo
   - **Agency** — $397/mo
3. Copy the price IDs to `.env.local`
4. Add your publishable key and secret key
5. Set up webhook:
   - Endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Events: `customer.subscription.*`, `invoice.payment_*`
   - Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`

### 8. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

---

## Deployment (Vercel)

1. Push your code to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local` to Vercel's project settings
4. Set `NEXT_PUBLIC_APP_URL` to your production domain
5. Deploy!

After deploying:
- Update Supabase redirect URLs with your production domain
- Update Twilio webhook URL
- Update Stripe webhook endpoint URL

---

## Embedding the Lead Capture Form

Each business gets an embeddable form at:
```
https://your-domain.com/embed/{businessId}
```

To embed on any website, add this iframe:
```html
<iframe
  src="https://your-domain.com/embed/YOUR_BUSINESS_ID"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius: 16px;"
></iframe>
```

Find your Business ID in **Settings** once logged in.

---

## Subscription Tiers

| Tier | Price | Leads/mo | Messages/mo |
|---|---|---|---|
| Starter | $97 | 100 | 500 |
| Pro | $197 | 500 | 2,500 |
| Agency | $397 | Unlimited | 10,000 |

All plans include a **14-day free trial**.

---

## Architecture Notes

### Multi-Tenancy
Every data table has a `business_id` foreign key with Row Level Security policies that enforce tenant isolation. The service-role client (used only in webhook handlers) bypasses RLS.

### AI Flow
1. Lead submits form → `POST /api/leads`
2. Lead is saved to DB
3. `triggerAIOutreach()` fires in the background:
   - Fetches business system prompt
   - Calls OpenAI GPT-4o-mini
   - Sends via Twilio (SMS) or Resend (email)
   - Records the message in DB
4. Inbound reply comes via Twilio webhook → `POST /api/webhooks/twilio`
5. If `ai_active = true` on the conversation, generates and sends another AI reply

### Automations
The automation engine is queue-based (currently cron-driven). In production, you'd add a Supabase Edge Function or a `pg_cron` job that:
1. Queries automations with trigger conditions met
2. Filters leads matching the trigger (e.g., no reply in 24h)
3. Personalizes the template via OpenAI if `ai_personalize = true`
4. Sends via Twilio/Resend and records in `automation_logs`

---

## Security

- All routes are protected by Supabase Auth middleware
- RLS enforces multi-tenant data isolation at the DB level
- Twilio webhooks are signature-verified in production
- Stripe webhooks use signing secret verification
- Sensitive credentials (Twilio auth token, OpenAI key) are stored encrypted in the business record — use Supabase Vault in production
- No SQL injection risk — all queries use parameterized Supabase client
- Input validation via Zod on all forms and API endpoints

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## License

MIT
