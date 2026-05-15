-- ============================================================
-- Clinch Database Schema
-- Run this in your Supabase SQL editor to initialize the DB.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fuzzy search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'booked', 'won', 'lost');
CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE message_channel AS ENUM ('sms', 'email', 'chat');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE automation_trigger AS ENUM ('new_lead', 'no_reply_24h', 'no_reply_48h', 'no_reply_72h', 'appointment_booked', 'appointment_reminder', 'custom');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'cancelled', 'paused');
CREATE TYPE subscription_tier AS ENUM ('starter', 'pro', 'agency');
CREATE TYPE ai_tone AS ENUM ('friendly', 'professional', 'luxury', 'casual', 'urgent');
CREATE TYPE industry AS ENUM ('dental', 'med_spa', 'auto_detail', 'gym', 'tutoring', 'photography', 'home_services', 'real_estate', 'other');

-- ============================================================
-- BUSINESSES (Multi-tenant root)
-- ============================================================

CREATE TABLE businesses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  industry        industry NOT NULL DEFAULT 'other',
  phone           TEXT,
  email           TEXT,
  website         TEXT,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  timezone        TEXT NOT NULL DEFAULT 'America/New_York',
  booking_link    TEXT,
  logo_url        TEXT,
  ai_tone         ai_tone NOT NULL DEFAULT 'friendly',
  business_hours  JSONB DEFAULT '{"mon":{"open":"09:00","close":"17:00","enabled":true},"tue":{"open":"09:00","close":"17:00","enabled":true},"wed":{"open":"09:00","close":"17:00","enabled":true},"thu":{"open":"09:00","close":"17:00","enabled":true},"fri":{"open":"09:00","close":"17:00","enabled":true},"sat":{"open":"09:00","close":"13:00","enabled":false},"sun":{"open":"09:00","close":"13:00","enabled":false}}',
  services        TEXT[] DEFAULT '{}',
  onboarding_done BOOLEAN NOT NULL DEFAULT FALSE,
  -- Encrypted third-party credentials (store encrypted via Supabase Vault in prod)
  twilio_account_sid   TEXT,
  twilio_auth_token    TEXT,
  twilio_phone_number  TEXT,
  openai_api_key       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "businesses_owner_select" ON businesses
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "businesses_owner_insert" ON businesses
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "businesses_owner_update" ON businesses
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "businesses_owner_delete" ON businesses
  FOR DELETE USING (owner_id = auth.uid());

-- ============================================================
-- TEAM MEMBERS (future multi-seat support)
-- ============================================================

CREATE TABLE team_members (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member',  -- 'owner' | 'admin' | 'member'
  invited_email TEXT,
  accepted      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_members_select" ON team_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "team_members_insert" ON team_members
  FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "team_members_update" ON team_members
  FOR UPDATE USING (
    user_id = auth.uid() OR
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================================
-- LEADS
-- ============================================================

CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  first_name      TEXT NOT NULL,
  last_name       TEXT,
  email           TEXT,
  phone           TEXT,
  source          TEXT,          -- 'website', 'facebook', 'google', 'referral', etc.
  status          lead_status NOT NULL DEFAULT 'new',
  score           INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  notes           TEXT,
  tags            TEXT[] DEFAULT '{}',
  service_interest TEXT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  custom_fields   JSONB DEFAULT '{}',
  last_contacted_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_business_select" ON leads
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM team_members WHERE user_id = auth.uid() AND accepted = TRUE
    )
  );

CREATE POLICY "leads_business_insert" ON leads
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM team_members WHERE user_id = auth.uid() AND accepted = TRUE
    )
  );

CREATE POLICY "leads_business_update" ON leads
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM team_members WHERE user_id = auth.uid() AND accepted = TRUE
    )
  );

CREATE POLICY "leads_business_delete" ON leads
  FOR DELETE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Public insert policy: allow external lead capture forms to insert leads
CREATE POLICY "leads_public_insert" ON leads
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- CONVERSATIONS
-- ============================================================

CREATE TABLE conversations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  lead_id       UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  channel       message_channel NOT NULL DEFAULT 'sms',
  last_message  TEXT,
  unread_count  INTEGER NOT NULL DEFAULT 0,
  ai_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lead_id, channel)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_business_all" ON conversations
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM team_members WHERE user_id = auth.uid() AND accepted = TRUE
    )
  );

-- ============================================================
-- MESSAGES
-- ============================================================

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  direction       message_direction NOT NULL,
  channel         message_channel NOT NULL,
  content         TEXT NOT NULL,
  ai_generated    BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at    TIMESTAMPTZ,
  read_at         TIMESTAMPTZ,
  error           TEXT,
  external_id     TEXT,  -- Twilio SID or Resend message ID
  metadata        JSONB DEFAULT '{}'
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_business_all" ON messages
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM team_members WHERE user_id = auth.uid() AND accepted = TRUE
    )
  );

-- ============================================================
-- APPOINTMENTS
-- ============================================================

CREATE TABLE appointments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  status          appointment_status NOT NULL DEFAULT 'scheduled',
  location        TEXT,
  notes           TEXT,
  reminder_sent   BOOLEAN NOT NULL DEFAULT FALSE,
  confirmation_sent BOOLEAN NOT NULL DEFAULT FALSE,
  external_booking_id TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_business_all" ON appointments
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM team_members WHERE user_id = auth.uid() AND accepted = TRUE
    )
  );

-- ============================================================
-- AUTOMATIONS (Follow-up sequences)
-- ============================================================

CREATE TABLE automations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  trigger       automation_trigger NOT NULL,
  channel       message_channel NOT NULL DEFAULT 'sms',
  delay_hours   INTEGER NOT NULL DEFAULT 0,
  template      TEXT NOT NULL,  -- Message template with {{variables}}
  ai_personalize BOOLEAN NOT NULL DEFAULT TRUE,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  send_count    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "automations_business_all" ON automations
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================================
-- AUTOMATION LOGS
-- ============================================================

CREATE TABLE automation_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  lead_id       UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'sent',  -- 'sent' | 'failed' | 'skipped'
  message       TEXT,
  error         TEXT,
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "automation_logs_business_all" ON automation_logs
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================================
-- AI PROMPT TEMPLATES
-- ============================================================

CREATE TABLE prompt_templates (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  system_prompt TEXT NOT NULL,
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prompt_templates_business_all" ON prompt_templates
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id           UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id       TEXT,
  tier                  subscription_tier NOT NULL DEFAULT 'starter',
  status                subscription_status NOT NULL DEFAULT 'trialing',
  trial_ends_at         TIMESTAMPTZ,
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT FALSE,
  -- Usage limits by tier
  leads_limit           INTEGER NOT NULL DEFAULT 100,
  messages_limit        INTEGER NOT NULL DEFAULT 500,
  -- Current usage
  leads_used            INTEGER NOT NULL DEFAULT 0,
  messages_used         INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_business_select" ON subscriptions
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "subscriptions_business_update" ON subscriptions
  FOR UPDATE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Service role bypass for Stripe webhooks
CREATE POLICY "subscriptions_service_all" ON subscriptions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- ANALYTICS (daily rollups for performance)
-- ============================================================

CREATE TABLE analytics_daily (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  leads_created   INTEGER NOT NULL DEFAULT 0,
  leads_contacted INTEGER NOT NULL DEFAULT 0,
  leads_booked    INTEGER NOT NULL DEFAULT 0,
  leads_won       INTEGER NOT NULL DEFAULT 0,
  messages_sent   INTEGER NOT NULL DEFAULT 0,
  messages_received INTEGER NOT NULL DEFAULT 0,
  appointments_scheduled INTEGER NOT NULL DEFAULT 0,
  appointments_completed INTEGER NOT NULL DEFAULT 0,
  ai_responses    INTEGER NOT NULL DEFAULT 0,
  UNIQUE(business_id, date)
);

ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_business_all" ON analytics_daily
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================================
-- LEAD NOTES
-- ============================================================

CREATE TABLE lead_notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_notes_business_all" ON lead_notes
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM team_members WHERE user_id = auth.uid() AND accepted = TRUE
    )
  );

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_leads_business_id ON leads(business_id);
CREATE INDEX idx_leads_status ON leads(business_id, status);
CREATE INDEX idx_leads_created_at ON leads(business_id, created_at DESC);
CREATE INDEX idx_leads_phone ON leads(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_leads_email ON leads(email) WHERE email IS NOT NULL;
CREATE INDEX idx_leads_search ON leads USING gin((first_name || ' ' || COALESCE(last_name, '') || ' ' || COALESCE(email, '') || ' ' || COALESCE(phone, '')) gin_trgm_ops);

CREATE INDEX idx_conversations_business_id ON conversations(business_id);
CREATE INDEX idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX idx_conversations_updated_at ON conversations(business_id, updated_at DESC);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_business_id ON messages(business_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);

CREATE INDEX idx_appointments_business_id ON appointments(business_id);
CREATE INDEX idx_appointments_starts_at ON appointments(business_id, starts_at);
CREATE INDEX idx_appointments_lead_id ON appointments(lead_id);

CREATE INDEX idx_analytics_business_date ON analytics_daily(business_id, date DESC);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER automations_updated_at BEFORE UPDATE ON automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create subscription on new business
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (business_id, tier, status, trial_ends_at, leads_limit, messages_limit)
  VALUES (
    NEW.id,
    'starter',
    'trialing',
    NOW() + INTERVAL '14 days',
    100,
    500
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER business_create_subscription
  AFTER INSERT ON businesses
  FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- Auto-create default prompt templates on new business
CREATE OR REPLACE FUNCTION create_default_prompts()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO prompt_templates (business_id, name, description, system_prompt, is_default)
  VALUES (
    NEW.id,
    'Default Follow-Up',
    'Standard AI lead follow-up prompt',
    'You are a helpful assistant for ' || NEW.name || ', a local ' || NEW.industry || ' business. Your role is to warmly greet new leads, answer questions about services, and guide them toward booking an appointment. Keep responses concise, friendly, and professional. Always try to move the conversation toward scheduling. If the lead is interested, ask for their preferred time and mention the booking link.',
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER business_create_prompts
  AFTER INSERT ON businesses
  FOR EACH ROW EXECUTE FUNCTION create_default_prompts();

-- Auto-update conversation last_message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message = NEW.content,
    updated_at = NOW(),
    unread_count = CASE
      WHEN NEW.direction = 'inbound' THEN unread_count + 1
      ELSE unread_count
    END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Increment analytics on new lead
CREATE OR REPLACE FUNCTION increment_analytics_leads()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_daily (business_id, date, leads_created)
  VALUES (NEW.business_id, CURRENT_DATE, 1)
  ON CONFLICT (business_id, date)
  DO UPDATE SET leads_created = analytics_daily.leads_created + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_analytics
  AFTER INSERT ON leads
  FOR EACH ROW EXECUTE FUNCTION increment_analytics_leads();

-- Increment analytics on new message
CREATE OR REPLACE FUNCTION increment_analytics_messages()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.direction = 'outbound' THEN
    INSERT INTO analytics_daily (business_id, date, messages_sent)
    VALUES (NEW.business_id, CURRENT_DATE, 1)
    ON CONFLICT (business_id, date)
    DO UPDATE SET messages_sent = analytics_daily.messages_sent + 1;
  ELSE
    INSERT INTO analytics_daily (business_id, date, messages_received)
    VALUES (NEW.business_id, CURRENT_DATE, 1)
    ON CONFLICT (business_id, date)
    DO UPDATE SET messages_received = analytics_daily.messages_received + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_analytics
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION increment_analytics_messages();
