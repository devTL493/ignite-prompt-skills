
-- 1. Role enum
CREATE TYPE public.app_role AS ENUM ('admin');

-- 2. user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
-- No direct SELECT on user_roles; accessed only via has_role()

-- 3. has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. competitions table
CREATE TABLE public.competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  location text DEFAULT '',
  event_date date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view competitions" ON public.competitions FOR SELECT USING (true);
CREATE POLICY "Admins can insert competitions" ON public.competitions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update competitions" ON public.competitions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete competitions" ON public.competitions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. scenarios table
CREATE TABLE public.scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  context text NOT NULL DEFAULT '',
  goal text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'Anfänger' CHECK (difficulty IN ('Anfänger', 'Mittelstufe', 'Fortgeschritten')),
  category text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  ideal_prompt text NOT NULL DEFAULT '',
  hints jsonb NOT NULL DEFAULT '[]'::jsonb,
  evaluation jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scenarios" ON public.scenarios FOR SELECT USING (true);
CREATE POLICY "Admins can insert scenarios" ON public.scenarios FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update scenarios" ON public.scenarios FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete scenarios" ON public.scenarios FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. competition_scenarios junction
CREATE TABLE public.competition_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  scenario_id uuid REFERENCES public.scenarios(id) ON DELETE CASCADE NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE (competition_id, scenario_id)
);
ALTER TABLE public.competition_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view competition_scenarios" ON public.competition_scenarios FOR SELECT USING (true);
CREATE POLICY "Admins can insert competition_scenarios" ON public.competition_scenarios FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update competition_scenarios" ON public.competition_scenarios FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete competition_scenarios" ON public.competition_scenarios FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. contestants table
CREATE TABLE public.contestants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  email text,
  access_code text NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competition_id, access_code)
);
ALTER TABLE public.contestants ENABLE ROW LEVEL SECURITY;

-- Anyone can sign up (INSERT)
CREATE POLICY "Anyone can sign up as contestant" ON public.contestants FOR INSERT WITH CHECK (true);
-- Anyone can SELECT (filtered by access_code in app logic)
CREATE POLICY "Anyone can view contestants" ON public.contestants FOR SELECT USING (true);
-- Admins can update/delete
CREATE POLICY "Admins can update contestants" ON public.contestants FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contestants" ON public.contestants FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 8. submissions table
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contestant_id uuid REFERENCES public.contestants(id) ON DELETE CASCADE NOT NULL,
  scenario_id uuid REFERENCES public.scenarios(id) ON DELETE CASCADE NOT NULL,
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  user_prompt text NOT NULL DEFAULT '',
  refined_prompt text,
  initial_score int DEFAULT 0,
  final_score int DEFAULT 0,
  ai_feedback text DEFAULT '',
  ai_suggestions jsonb DEFAULT '[]'::jsonb,
  submitted_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert submissions (contestants are unauthenticated)
CREATE POLICY "Anyone can insert submissions" ON public.submissions FOR INSERT WITH CHECK (true);
-- Anyone can view submissions (for leaderboard)
CREATE POLICY "Anyone can view submissions" ON public.submissions FOR SELECT USING (true);
-- Admins can update/delete
CREATE POLICY "Admins can update submissions" ON public.submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete submissions" ON public.submissions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
