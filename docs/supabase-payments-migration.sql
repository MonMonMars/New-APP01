-- Spark — payments ledger, purchase approvals, Stripe customer mapping
-- Run after docs/supabase-schema.sql and docs/supabase-security-migration.sql

create table if not exists public.purchase_approvals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  idempotency_key text not null,
  status text not null default 'approved'
    check (status in ('approved', 'consumed', 'expired')),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, idempotency_key)
);

create index if not exists purchase_approvals_user_idx on public.purchase_approvals(user_id);
create index if not exists purchase_approvals_expires_idx on public.purchase_approvals(expires_at);

alter table public.purchase_approvals enable row level security;

create policy "Users read own purchase approvals"
  on public.purchase_approvals for select
  using (auth.uid() = user_id);

create table if not exists public.purchase_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  provider text not null,
  status text not null default 'completed'
    check (status in ('pending', 'completed', 'failed', 'refunded')),
  grant jsonb,
  external_id text,
  idempotency_key text,
  approval_id uuid references public.purchase_approvals(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists purchase_ledger_user_idx on public.purchase_ledger(user_id);
create index if not exists purchase_ledger_status_idx on public.purchase_ledger(status);

alter table public.purchase_ledger enable row level security;

create policy "Users read own purchase ledger"
  on public.purchase_ledger for select
  using (auth.uid() = user_id);

alter table public.profiles
  add column if not exists stripe_customer_id text;

create unique index if not exists profiles_stripe_customer_id_idx
  on public.profiles(stripe_customer_id)
  where stripe_customer_id is not null;

-- Server-only entitlement grant (bypasses client is_spark_plus trigger)
create or replace function public.grant_spark_plus_entitlement(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_state (user_id, is_spark_plus, updated_at)
  values (target_user_id, true, now())
  on conflict (user_id) do update
  set is_spark_plus = true, updated_at = now();
end;
$$;

revoke all on function public.grant_spark_plus_entitlement(uuid) from public;
grant execute on function public.grant_spark_plus_entitlement(uuid) to service_role;
