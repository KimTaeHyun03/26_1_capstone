-- =============================================
-- 반려동물 관리 앱 DB 스키마
-- Supabase SQL Editor에서 실행
-- =============================================

-- 1. users (public.users — auth.users와 연동)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nickname TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. pets
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat')),
  breed TEXT,
  birth_date DATE,
  weight NUMERIC(5, 2),
  neutered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. feeding_schedules
CREATE TABLE public.feeding_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  time TEXT NOT NULL CHECK (time ~ '^([01]\d|2[0-3]):[0-5]\d$'),  -- HH:MM 형식
  amount NUMERIC(6, 1) NOT NULL,  -- 급여량 (g)
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. health_logs
CREATE TABLE public.health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  symptoms JSONB NOT NULL DEFAULT '[]',  -- ["구토", "무기력"] 형태
  diagnosis TEXT,  -- Gemini AI 분석 결과
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. dangerous_foods
CREATE TABLE public.dangerous_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('high', 'medium', 'low')),
  symptoms TEXT,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'both'))
);

-- 6. guide_content
CREATE TABLE public.guide_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('preparation', 'feeding', 'health', 'grooming', 'behavior')),
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  step_order INTEGER NOT NULL DEFAULT 0
);

-- 7. training_guides
CREATE TABLE public.training_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('basic', 'behavior', 'trick')),
  title TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]',  -- [{"step": 1, "title": "...", "description": "..."}]
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

-- 8. push_subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 전문 검색을 위한 pg_trgm 확장 (위험 음식 검색용)
-- =============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_dangerous_foods_name_trgm ON public.dangerous_foods USING GIN (name gin_trgm_ops);

-- =============================================
-- RLS 활성화 (모든 테이블)
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dangerous_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS 정책
-- =============================================

-- users: 본인 데이터만
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- pets: 본인 데이터만 CRUD
CREATE POLICY "pets_select_own" ON public.pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pets_insert_own" ON public.pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pets_update_own" ON public.pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pets_delete_own" ON public.pets FOR DELETE USING (auth.uid() = user_id);

-- feeding_schedules: pet의 owner가 본인인 경우만
CREATE POLICY "feeding_select_own" ON public.feeding_schedules FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = feeding_schedules.pet_id AND pets.user_id = auth.uid()));
CREATE POLICY "feeding_insert_own" ON public.feeding_schedules FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = feeding_schedules.pet_id AND pets.user_id = auth.uid()));
CREATE POLICY "feeding_update_own" ON public.feeding_schedules FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = feeding_schedules.pet_id AND pets.user_id = auth.uid()));
CREATE POLICY "feeding_delete_own" ON public.feeding_schedules FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = feeding_schedules.pet_id AND pets.user_id = auth.uid()));

-- health_logs: pet의 owner가 본인인 경우만
CREATE POLICY "health_select_own" ON public.health_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = health_logs.pet_id AND pets.user_id = auth.uid()));
CREATE POLICY "health_insert_own" ON public.health_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = health_logs.pet_id AND pets.user_id = auth.uid()));

-- dangerous_foods: 전체 공개 읽기
CREATE POLICY "foods_select_all" ON public.dangerous_foods FOR SELECT USING (true);

-- guide_content: 전체 공개 읽기
CREATE POLICY "guide_select_all" ON public.guide_content FOR SELECT USING (true);

-- training_guides: 전체 공개 읽기
CREATE POLICY "training_select_all" ON public.training_guides FOR SELECT USING (true);

-- push_subscriptions: 본인 데이터만
CREATE POLICY "push_select_own" ON public.push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "push_insert_own" ON public.push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "push_delete_own" ON public.push_subscriptions FOR DELETE USING (auth.uid() = user_id);
