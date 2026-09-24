-- Spark — trust & safety (Step 7)
-- Run after docs/supabase-security-migration.sql

-- Shared scam quarantine (replaces device-only AsyncStorage when synced)
create table if not exists public.scam_quarantine (
  profile_id text primary key,
  active boolean not null default true,
  quarantined_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz default now()
);

create index if not exists scam_quarantine_active_idx on public.scam_quarantine(active);

alter table public.scam_quarantine enable row level security;

create or replace function public.is_moderator_jwt()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'admin_role') in ('moderator', 'superadmin'),
    false
  );
$$;

-- Discover filtering: signed-in users read active quarantine ids
create policy "Authenticated read active quarantine"
  on public.scam_quarantine for select
  to authenticated
  using (active = true);

-- Moderators manage quarantine rows
create policy "Moderators upsert quarantine"
  on public.scam_quarantine for insert
  to authenticated
  with check (public.is_moderator_jwt());

create policy "Moderators update quarantine"
  on public.scam_quarantine for update
  to authenticated
  using (public.is_moderator_jwt())
  with check (public.is_moderator_jwt());

create policy "Moderators read all quarantine"
  on public.scam_quarantine for select
  to authenticated
  using (public.is_moderator_jwt());

-- Moderation queue on security_reports (reporter policies unchanged)
create policy "Moderators read all security reports"
  on public.security_reports for select
  to authenticated
  using (public.is_moderator_jwt());

create policy "Moderators update security reports"
  on public.security_reports for update
  to authenticated
  using (public.is_moderator_jwt())
  with check (public.is_moderator_jwt());
