-- ====================================================================
-- REPORTSAATHI SUPABASE DATABASE SCHEMA
-- Minimal schema for user profiles and opt-in educational report history
-- Enforces Row Level Security (RLS) for complete patient privacy
-- ====================================================================

-- 1. User Profiles Table (Linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Profiles RLS Policies: Users can only read and update their own profile
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger to automatically create a profile when a new user registers in Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Saved Reports History Table
-- PRIVACY PRINCIPLES:
-- • By default, reports are EPHEMERAL and NOT saved anywhere.
-- • When a user explicitly chooses to save, this table stores ONLY educational
--   summaries, parameter results, and doctor questions.
-- • Original PDF/Image files and raw extracted medical text are NEVER saved.
create table if not exists public.saved_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  specimen_date text default 'Recent',
  overall_status text not null check (overall_status in ('all_normal', 'attention_needed')),
  summary text not null,
  key_takeaways jsonb default '[]'::jsonb not null,
  parameters_summary jsonb default '[]'::jsonb not null,
  doctor_questions jsonb default '[]'::jsonb not null,
  lifestyle_tips jsonb default '[]'::jsonb not null,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.saved_reports enable row level security;

-- Saved Reports RLS Policies: Users can strictly access only their own records
create policy "Users can view their own saved reports"
  on public.saved_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved reports"
  on public.saved_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own saved reports"
  on public.saved_reports for delete
  using (auth.uid() = user_id);

create policy "Users can update their own saved reports"
  on public.saved_reports for update
  using (auth.uid() = user_id);

-- Performance Index for user query lookups
create index if not exists idx_saved_reports_user_id on public.saved_reports(user_id, created_at desc);
