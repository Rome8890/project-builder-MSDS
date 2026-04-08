-- ============================================================
-- VisionBoard AI (미라클비전) Database Schema
-- Supabase SQL Editor에서 순서대로 실행하세요
-- ============================================================

-- 1. users 테이블 (auth.users 확장)
CREATE TABLE IF NOT EXISTS public.users (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text NOT NULL,
  avatar_url   text,              -- 셀카 Storage URL
  plan         text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  daily_count  int  NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 2. visions 테이블
CREATE TABLE IF NOT EXISTS public.visions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prompt       text NOT NULL,
  template_id  text,              -- Canva 템플릿 ID (nullable)
  image_url    text,              -- 생성된 이미지 Storage URL
  video_url    text,              -- 영상 URL (Later)
  is_public    boolean NOT NULL DEFAULT false,
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 3. subscriptions 테이블
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  polar_order_id  text NOT NULL,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  plan            text NOT NULL DEFAULT 'premium_monthly',
  started_at      timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL
);

-- 4. referrals 테이블
CREATE TABLE IF NOT EXISTS public.referrals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id  uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id  uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bonus_given  boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- ============================================================
-- Row Level Security (RLS) 설정
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- users: 본인만 조회/수정
CREATE POLICY "users: select own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users: update own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- visions: 본인 것 + 공개 게시물은 누구나 조회 가능
CREATE POLICY "visions: select own or public" ON public.visions
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "visions: insert own" ON public.visions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "visions: update own" ON public.visions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "visions: delete own" ON public.visions
  FOR DELETE USING (auth.uid() = user_id);

-- subscriptions: 본인만
CREATE POLICY "subscriptions: select own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- referrals: 본인이 초대자 or 피초대자
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
  INSERT INTO public.users (id, email, plan, daily_count)
  VALUES (
    NEW.id,
    NEW.email,
    'free',
    0
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
-- daily_count 자정 초기화 함수 (Supabase Edge Function Cron에서 호출)
-- ============================================================

CREATE OR REPLACE FUNCTION public.reset_daily_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users SET daily_count = 0;
END;
$$;

-- ============================================================
-- Storage Buckets (Supabase Dashboard > Storage에서 생성)
-- ============================================================
-- 버킷명: selfies   (비공개 - 셀카 저장)
-- 버킷명: visions   (공개  - 생성 이미지 저장)
--
-- selfies 버킷 정책:
--   INSERT: auth.uid() = (storage.foldername(name))[1]::uuid
--   SELECT: auth.uid() = (storage.foldername(name))[1]::uuid
--
-- visions 버킷 정책:
--   INSERT: auth.uid() = (storage.foldername(name))[1]::uuid
--   SELECT: true (공개 읽기)
-- ============================================================

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX IF NOT EXISTS visions_user_id_idx ON public.visions(user_id);
CREATE INDEX IF NOT EXISTS visions_created_at_idx ON public.visions(created_at DESC);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
