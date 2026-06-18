-- Run this in Supabase SQL Editor to create the assessments history table.
-- RLS: allow users to read/insert only their own rows.

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  form_data jsonb not null default '{}',
  risk_score int not null,
  risk_stage text not null,
  created_at timestamptz not null default now()
);

create index if not exists assessments_user_id_created_at_idx
  on public.assessments (user_id, created_at desc);

alter table public.assessments enable row level security;

create policy "Users can read own assessments"
  on public.assessments for select
  using (auth.uid() = user_id);

create policy "Users can insert own assessments"
  on public.assessments for insert
  with check (auth.uid() = user_id);
