CREATE TABLE if not exists public.profiles(
  id uuid REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  interests TEXT[],
  motivations TEXT[],
  language_level TEXT,
  onboarding_completed boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  premium_expired_at TIMESTAMP with TIME ZONE, 
  updated_at TIMESTAMP with TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles enable row level security;

CREATE policy "Users can read own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE policy "Users can insert own profile"
ON public.profiles
FOR INSERT
with check (auth.uid() = id);

CREATE policy "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
with check (
  auth.uid() = id
);

REVOKE UPDATE on TABLE public.profiles FROM authenticated;
REVOKE INSERT on TABLE public.profiles FROM authenticated;

GRANT SELECT on TABLE public.profiles to authenticated;

GRANT INSERT (
  id,
  full_name,
  language_level,
  motivations,
  interests,
  onboarding_completed,
  updated_at
) on TABLE public.profiles to authenticated;

GRANT UPDATE (
  id,
  full_name,
  language_level,
  motivations,
  interests,
  onboarding_completed,
  updated_at
) on TABLE public.profiles to authenticated;