-- =====================================================
-- ESCALACLUB - Complete Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- COMMUNITIES TABLE (core of the marketplace)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ec_communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  owner_id uuid NOT NULL REFERENCES public.ec_members(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  cover_url text,
  logo_url text,
  category text NOT NULL DEFAULT 'negocios',
  price_monthly numeric NOT NULL DEFAULT 0,
  price_annual numeric,
  paypal_plan_id_monthly text,
  paypal_plan_id_annual text,
  member_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  is_free boolean NOT NULL DEFAULT false,
  language text NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'pt', 'both')),
  tags text[],
  accent_color text NOT NULL DEFAULT '#6366f1',
  featured boolean NOT NULL DEFAULT false
);

-- =====================================================
-- COMMUNITY MEMBERSHIPS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ec_community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  community_id uuid NOT NULL REFERENCES public.ec_communities(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.ec_members(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  paypal_subscription_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  expires_at timestamptz,
  UNIQUE(community_id, member_id)
);

-- =====================================================
-- COMMUNITY SUBSCRIPTIONS (creator paying EscalaClub)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ec_creator_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  member_id uuid NOT NULL REFERENCES public.ec_members(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('starter', 'creator', 'pro')),
  status text NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'paused')),
  paypal_subscription_id text UNIQUE,
  price_usd numeric NOT NULL,
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz
);

-- =====================================================
-- LIVE EVENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ec_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  community_id uuid NOT NULL REFERENCES public.ec_communities(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES public.ec_members(id),
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  meet_url text,
  zoom_url text,
  attendees_count integer NOT NULL DEFAULT 0,
  max_attendees integer,
  is_recorded boolean DEFAULT false,
  recording_url text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled'))
);

-- =====================================================
-- EVENT ATTENDEES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ec_event_attendees (
  event_id uuid NOT NULL REFERENCES public.ec_events(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.ec_members(id) ON DELETE CASCADE,
  registered_at timestamptz DEFAULT now(),
  attended boolean DEFAULT false,
  PRIMARY KEY (event_id, member_id)
);

-- =====================================================
-- AFFILIATES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ec_affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  member_id uuid NOT NULL REFERENCES public.ec_members(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES public.ec_communities(id) ON DELETE CASCADE,
  referral_code text NOT NULL UNIQUE DEFAULT substring(md5(random()::text), 1, 8),
  commission_pct integer NOT NULL DEFAULT 20,
  total_referrals integer NOT NULL DEFAULT 0,
  total_earned numeric NOT NULL DEFAULT 0,
  paypal_email text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  UNIQUE(member_id, community_id)
);

-- =====================================================
-- AFFILIATE REFERRALS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ec_affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  affiliate_id uuid NOT NULL REFERENCES public.ec_affiliates(id),
  referred_member_id uuid NOT NULL REFERENCES public.ec_members(id),
  community_id uuid NOT NULL REFERENCES public.ec_communities(id),
  commission_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled'))
);

-- =====================================================
-- POST COMMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ec_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  post_id uuid NOT NULL REFERENCES public.ec_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.ec_members(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 2000),
  likes integer NOT NULL DEFAULT 0
);

-- =====================================================
-- CERTIFICATES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ec_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  member_id uuid NOT NULL REFERENCES public.ec_members(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.ec_courses(id) ON DELETE CASCADE,
  certificate_url text,
  issued_at timestamptz DEFAULT now(),
  UNIQUE(member_id, course_id)
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ec_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  member_id uuid NOT NULL REFERENCES public.ec_members(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean NOT NULL DEFAULT false,
  data jsonb
);

-- =====================================================
-- Add missing columns to existing tables
-- =====================================================
ALTER TABLE public.ec_members ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.ec_members ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE public.ec_members ADD COLUMN IF NOT EXISTS language text DEFAULT 'es';
ALTER TABLE public.ec_members ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.ec_courses ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES public.ec_communities(id);
ALTER TABLE public.ec_courses ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.ec_courses ADD COLUMN IF NOT EXISTS language text DEFAULT 'es';
ALTER TABLE public.ec_courses ADD COLUMN IF NOT EXISTS what_you_learn text[];
ALTER TABLE public.ec_courses ADD COLUMN IF NOT EXISTS requirements text[];

ALTER TABLE public.ec_posts ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES public.ec_communities(id);
ALTER TABLE public.ec_posts ADD COLUMN IF NOT EXISTS comments_count integer DEFAULT 0;
ALTER TABLE public.ec_posts ADD COLUMN IF NOT EXISTS media_url text;

ALTER TABLE public.ec_modules ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE public.ec_modules ADD COLUMN IF NOT EXISTS resources jsonb DEFAULT '[]';

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ec_communities_slug ON public.ec_communities(slug);
CREATE INDEX IF NOT EXISTS idx_ec_communities_owner ON public.ec_communities(owner_id);
CREATE INDEX IF NOT EXISTS idx_ec_community_members_member ON public.ec_community_members(member_id);
CREATE INDEX IF NOT EXISTS idx_ec_community_members_community ON public.ec_community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_ec_posts_community ON public.ec_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_ec_posts_author ON public.ec_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_ec_events_community ON public.ec_events(community_id);
CREATE INDEX IF NOT EXISTS idx_ec_notifications_member ON public.ec_notifications(member_id, read);
CREATE INDEX IF NOT EXISTS idx_ec_courses_community ON public.ec_courses(community_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.ec_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_creator_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_notifications ENABLE ROW LEVEL SECURITY;

-- Communities: public read, owner write
DROP POLICY IF EXISTS "communities_public_read" ON public.ec_communities;
CREATE POLICY "communities_public_read" ON public.ec_communities FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "communities_owner_all" ON public.ec_communities;
CREATE POLICY "communities_owner_all" ON public.ec_communities FOR ALL USING (owner_id = auth.uid());

-- Community members: members can see their own, community members can see each other
DROP POLICY IF EXISTS "cm_member_read" ON public.ec_community_members;
CREATE POLICY "cm_member_read" ON public.ec_community_members FOR SELECT USING (member_id = auth.uid() OR community_id IN (SELECT community_id FROM public.ec_community_members WHERE member_id = auth.uid()));
DROP POLICY IF EXISTS "cm_member_insert" ON public.ec_community_members;
CREATE POLICY "cm_member_insert" ON public.ec_community_members FOR INSERT WITH CHECK (member_id = auth.uid());
DROP POLICY IF EXISTS "cm_member_update" ON public.ec_community_members;
CREATE POLICY "cm_member_update" ON public.ec_community_members FOR UPDATE USING (member_id = auth.uid());

-- Creator subscriptions: only own
DROP POLICY IF EXISTS "creator_sub_own" ON public.ec_creator_subscriptions;
CREATE POLICY "creator_sub_own" ON public.ec_creator_subscriptions FOR ALL USING (member_id = auth.uid());

-- Events: community members can read
DROP POLICY IF EXISTS "events_read" ON public.ec_events;
CREATE POLICY "events_read" ON public.ec_events FOR SELECT USING (community_id IN (SELECT community_id FROM public.ec_community_members WHERE member_id = auth.uid()) OR host_id = auth.uid());
DROP POLICY IF EXISTS "events_host_write" ON public.ec_events;
CREATE POLICY "events_host_write" ON public.ec_events FOR ALL USING (host_id = auth.uid());

-- Notifications: own only
DROP POLICY IF EXISTS "notifs_own" ON public.ec_notifications;
CREATE POLICY "notifs_own" ON public.ec_notifications FOR ALL USING (member_id = auth.uid());

-- Post comments: authenticated can read/write
DROP POLICY IF EXISTS "comments_auth_read" ON public.ec_post_comments;
CREATE POLICY "comments_auth_read" ON public.ec_post_comments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "comments_auth_write" ON public.ec_post_comments;
CREATE POLICY "comments_auth_write" ON public.ec_post_comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());

-- Certificates: own only
DROP POLICY IF EXISTS "certs_own" ON public.ec_certificates;
CREATE POLICY "certs_own" ON public.ec_certificates FOR SELECT USING (member_id = auth.uid());

-- Affiliates: own only
DROP POLICY IF EXISTS "affiliates_own" ON public.ec_affiliates;
CREATE POLICY "affiliates_own" ON public.ec_affiliates FOR SELECT USING (member_id = auth.uid());

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-create ec_members profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.ec_members (id, email, full_name, role, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'member'),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update community member count
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.ec_communities SET member_count = member_count + 1, updated_at = now() WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.ec_communities SET member_count = GREATEST(0, member_count - 1), updated_at = now() WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_community_member_count ON public.ec_community_members;
CREATE TRIGGER trg_community_member_count
  AFTER INSERT OR DELETE ON public.ec_community_members
  FOR EACH ROW EXECUTE PROCEDURE public.update_community_member_count();

-- Update post likes count
CREATE OR REPLACE FUNCTION public.update_post_likes()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.ec_posts SET likes = likes + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.ec_posts SET likes = GREATEST(0, likes - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_post_likes ON public.ec_post_likes;
CREATE TRIGGER trg_post_likes
  AFTER INSERT OR DELETE ON public.ec_post_likes
  FOR EACH ROW EXECUTE PROCEDURE public.update_post_likes();

-- Update comment count
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.ec_posts SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.ec_posts SET comments_count = GREATEST(0, COALESCE(comments_count, 0) - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_post_comments ON public.ec_post_comments;
CREATE TRIGGER trg_post_comments
  AFTER INSERT OR DELETE ON public.ec_post_comments
  FOR EACH ROW EXECUTE PROCEDURE public.update_post_comments_count();

-- Grant XP for activity
CREATE OR REPLACE FUNCTION public.award_xp(member_id uuid, xp_amount integer)
RETURNS void AS $$
DECLARE
  current_xp integer;
  new_level integer;
BEGIN
  UPDATE public.ec_members SET xp = xp + xp_amount, last_active = CURRENT_DATE WHERE id = member_id
  RETURNING xp INTO current_xp;
  new_level := FLOOR(SQRT(current_xp / 100.0)) + 1;
  UPDATE public.ec_members SET level = new_level WHERE id = member_id AND level != new_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEED DATA: Creator Plans
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ec_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  name_pt text NOT NULL,
  price_monthly numeric NOT NULL,
  price_annual numeric NOT NULL,
  max_members integer,
  max_communities integer,
  features jsonb NOT NULL,
  features_pt jsonb NOT NULL,
  is_highlighted boolean DEFAULT false,
  sort_order integer DEFAULT 0
);

INSERT INTO public.ec_plans VALUES
('starter', 'Starter', 'Iniciante', 49, 470, 100, 1, 
 '["1 comunidad", "Hasta 100 miembros", "Cursos ilimitados", "Foro por canales", "Certificados digitales", "Soporte por email"]'::jsonb,
 '["1 comunidade", "Até 100 membros", "Cursos ilimitados", "Fórum por canais", "Certificados digitais", "Suporte por email"]'::jsonb,
 false, 1),
('creator', 'Creator', 'Criador', 97, 931, 1000, 1,
 '["1 comunidad", "Hasta 1,000 miembros", "Todo lo de Starter", "Programa de afiliados", "Eventos en vivo", "Notificaciones WhatsApp", "Analytics avanzado", "Soporte prioritario"]'::jsonb,
 '["1 comunidade", "Até 1.000 membros", "Tudo do Iniciante", "Programa de afiliados", "Eventos ao vivo", "Notificações WhatsApp", "Analytics avançado", "Suporte prioritário"]'::jsonb,
 true, 2),
('pro', 'Pro', 'Pro', 197, 1891, null, null,
 '["Comunidades ilimitadas", "Miembros ilimitados", "Todo lo de Creator", "Badge verificado ✓", "API access", "Manager dedicado", "Branding personalizado", "Reportes avanzados"]'::jsonb,
 '["Comunidades ilimitadas", "Membros ilimitados", "Tudo do Criador", "Badge verificado ✓", "Acesso à API", "Gerente dedicado", "Branding personalizado", "Relatórios avançados"]'::jsonb,
 false, 3)
ON CONFLICT (id) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual;

