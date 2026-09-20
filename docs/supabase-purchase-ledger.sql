-- Spark — purchase ledger & step-up approvals (run after supabase-schema.sql)
-- Server-side source of truth for Stripe and audited store grants.

create table if not exists public.purchase_approvals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  idempotency_key text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, idempotency_key)
);

create index if not exists purchase_approvals_user_expires_idx
  on public.purchase_approvals (user_id, expires_at desc);

create table if not exists public.purchase_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  provider text not null check (provider in ('stripe', 'app_store', 'play_store', 'demo')),
  external_id text,
  status text not null check (status in ('pending', 'completed', 'failed', 'refunded')),
  grant jsonb,
  amount_cents int,
  currency text default 'usd',
  idempotency_key text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists purchase_ledger_external_id_idx
  on public.purchase_ledger (external_id)
  where external_id is not null;

create index if not exists purchase_ledger_user_created_idx
  on public.purchase_ledger (user_id, created_at desc);

alter table public.purchase_approvals enable row level security;
alter table public.purchase_ledger enable row level security;

create policy "Users read own purchase approvals"
  on public.purchase_approvals for select using (auth.uid() = user_id);

create policy "Users read own purchase ledger"
  on public.purchase_ledger for select using (auth.uid() = user_id);

-- Inserts/updates only via service role (Edge Functions)
