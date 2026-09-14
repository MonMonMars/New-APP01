-- Spark — additional security tables & hardening
-- Run after docs/supabase-schema.sql

-- Abuse / safety reports (persisted server-side)
create table if not exists public.security_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references auth.users(id) on delete set null,
  reported_profile_id text not null,
  reason text not null,
  context text default 'profile',
  status text default 'pending' check (status in ('pending', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz default now()
);

create index if not exists security_reports_status_idx on public.security_reports(status);
create index if not exists security_reports_reporter_idx on public.security_reports(reporter_user_id);

alter table public.security_reports enable row level security;

create policy "Users insert own reports"
  on public.security_reports for insert
  with check (auth.uid() = reporter_user_id);

create policy "Users read own reports"
  on public.security_reports for select
  using (auth.uid() = reporter_user_id);

-- Security audit trail (unlock failures, reports, etc.)
create table if not exists public.security_audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists security_audit_user_idx on public.security_audit_events(user_id);

alter table public.security_audit_events enable row level security;

create policy "Users insert own audit events"
  on public.security_audit_events for insert
  with check (auth.uid() = user_id);

create policy "Users read own audit events"
  on public.security_audit_events for select
  using (auth.uid() = user_id);

-- Prevent clients from self-granting Spark+ (subscription must come from server/IAP)
create or replace function public.prevent_client_spark_plus_grant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.is_spark_plus := false;
    return new;
  end if;

  if new.is_spark_plus = true and coalesce(old.is_spark_plus, false) = false then
    new.is_spark_plus := old.is_spark_plus;
  end if;

  return new;
end;
$$;

drop trigger if exists user_state_spark_plus_guard on public.user_state;
create trigger user_state_spark_plus_guard
  before insert or update on public.user_state
  for each row execute function public.prevent_client_spark_plus_grant();

-- Private photo bucket (replace public profile-photos for production)
-- insert into storage.buckets (id, name, public) values ('profile-photos-private', 'profile-photos-private', false)
-- on conflict (id) do update set public = false;
