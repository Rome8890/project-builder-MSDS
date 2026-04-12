-- ============================================================
-- VisionBoard AI (미라클비전) Database Schema v2
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- 1. users 테이블
CREATE TABLE IF NOT EXISTS public.users (
  id               uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            text        NOT NULL,
  avatar_url       text,
  plan             text        NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  daily_count      int         NOT NULL DEFAULT 0,
  daily_reset_at   text        NOT NULL DEFAULT '',  -- 'YYYY-MM-DD' 형식
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- 2. visions 테이블
CREATE TABLE IF NOT EXISTS public.visions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prompt       text        NOT NULL,
  image_url    text,
  status       text        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  is_public    boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 3. subscriptions 테이블
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  polar_order_id  text        NOT NULL,
  status          text        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'cancelled', 'expired')),
  plan            text        NOT NULL DEFAULT 'premium_monthly',
  started_at      timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL
);

-- 4. referrals 테이블
CREATE TABLE IF NOT EXISTS public.referrals (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id  uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id  uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bonus_given  boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals    ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "users: select own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users: insert own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users: update own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- visions
CREATE POLICY "visions: select own or public" ON public.visions
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "visions: insert own" ON public.visions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "visions: update own" ON public.visions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "visions: delete own" ON public.visions
  FOR DELETE USING (auth.uid() = user_id);

-- subscriptions
CREATE POLICY "subscriptions: select own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- referrals
CREATE POLICY "referrals: select own" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "referrals: insert own" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- ============================================================
-- 신규 가입 시 users 레코드 자동 생성 (Trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, plan, daily_count, daily_reset_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', ''),
    'free',
    0,
    to_char(now() AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Realtime 구독 활성화 (이미지 생성 완료 감지용)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.visions;

-- ============================================================
-- Storage Buckets & Policies
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('selfies', 'selfies', false, 5242880, ARRAY['image/jpeg','image/jpg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('visions', 'visions', true, 10485760, ARRAY['image/jpeg','image/jpg','image/png'])
ON CONFLICT (id) DO NOTHING;

-- selfies 정책
DROP POLICY IF EXISTS "selfies: upload own" ON storage.objects;
CREATE POLICY "selfies: upload own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'selfies' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "selfies: read own" ON storage.objects;
CREATE POLICY "selfies: read own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'selfies' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "selfies: delete own" ON storage.objects;
CREATE POLICY "selfies: delete own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'selfies' AND auth.uid()::text = (storage.foldername(name))[1]);

-- visions 정책
DROP POLICY IF EXISTS "visions: upload own" ON storage.objects;
CREATE POLICY "visions: upload own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'visions' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "visions: public read" ON storage.objects;
CREATE POLICY "visions: public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'visions');

DROP POLICY IF EXISTS "visions: delete own" ON storage.objects;
CREATE POLICY "visions: delete own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'visions' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX IF NOT EXISTS visions_user_id_idx   ON public.visions(user_id);
CREATE INDEX IF NOT EXISTS visions_status_idx    ON public.visions(status);
CREATE INDEX IF NOT EXISTS visions_created_idx   ON public.visions(created_at DESC);
CREATE INDEX IF NOT EXISTS subs_user_id_idx      ON public.subscriptions(user_id);
