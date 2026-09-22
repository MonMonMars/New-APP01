-- Spark dating app — Supabase schema
-- Run in Supabase SQL Editor after creating a project.

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  age int check (age >= 18),
  bio text default '',
  photos jsonb default '[]'::jsonb,
  interests jsonb default '[]'::jsonb,
  intent text,
  gender text,
  orientation text,
  prompts jsonb default '[]'::jsonb,
  instagram_connected boolean default false,
  spotify_connected boolean default false,
  age_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Discovery preferences
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  max_distance_miles int default 25,
  min_age int default 21,
  max_age int default 35,
  show_me text default 'everyone',
  passport_city text,
  travel_mode boolean default false,
  discover_filters jsonb default '[]'::jsonb,
  preferences_extra jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Existing projects: add extended preference fields (map search, spark section, locale, advanced filters)
alter table public.user_preferences
  add column if not exists preferences_extra jsonb default '{}'::jsonb;

-- App state (likes, passes, subscription flags)
create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  passed_ids jsonb default '[]'::jsonb,
  liked_ids jsonb default '[]'::jsonb,
  pending_like_ids jsonb default '[]'::jsonb,
  blocked_ids jsonb default '[]'::jsonb,
  is_spark_plus boolean default false,
  is_paused boolean default false,
  updated_at timestamptz default now()
);

-- Matches
create table if not exists public.matches (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  profile_id text not null,
  profile_data jsonb not null,
  matched_at timestamptz not null,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists matches_user_id_idx on public.matches(user_id);

-- Conversations
create table if not exists public.conversations (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  match_id text not null,
  messages jsonb default '[]'::jsonb,
  your_turn boolean default true,
  unread boolean default false,
  last_message text,
  last_message_at timestamptz,
  updated_at timestamptz default now()
);

create index if not exists conversations_user_id_idx on public.conversations(user_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_state enable row level security;
alter table public.matches enable row level security;
alter table public.conversations enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can upsert own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users manage own preferences"
  on public.user_preferences for all using (auth.uid() = user_id);

create policy "Users manage own state"
  on public.user_state for all using (auth.uid() = user_id);

create policy "Users manage own matches"
  on public.matches for all using (auth.uid() = user_id);

create policy "Users manage own conversations"
  on public.conversations for all using (auth.uid() = user_id);

-- Push tokens (Expo Push Service)
create table if not exists public.push_tokens (
  user_id uuid references auth.users(id) on delete cascade,
  expo_push_token text not null,
  platform text,
  updated_at timestamptz default now(),
  primary key (user_id, expo_push_token)
);

alter table public.push_tokens enable row level security;
create policy "Users manage own push tokens"
  on public.push_tokens for all using (auth.uid() = user_id);

-- Profile photo storage (public read)
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

create policy "Users upload own photos"
  on storage.objects for insert
  with check (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public read profile photos"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

-- Voice note storage (public read for chat playback URLs)
insert into storage.buckets (id, name, public)
values ('voice-notes', 'voice-notes', true)
on conflict (id) do nothing;

create policy "Users upload own voice notes"
  on storage.objects for insert
  with check (bucket_id = 'voice-notes' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public read voice notes"
  on storage.objects for select
  using (bucket_id = 'voice-notes');

-- Realtime for live chat sync
alter publication supabase_realtime add table public.conversations;
