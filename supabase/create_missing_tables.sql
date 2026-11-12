-- ==============================================================================
-- LIVE LOCAL HIMALAYA - SUPABASE SCHEMA MIGRATION
-- Creates all missing tables for Leads, Inquiries, Subscriptions & User Auth
-- 
-- HOW TO RUN:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Click on the SQL Editor icon (>_) in the left navigation sidebar
-- 3. Click "+ New query", paste this entire script, and click "RUN" (or Ctrl + Enter)
-- ==============================================================================

create extension if not exists pgcrypto;

-- 1. TRIP PLANNING INQUIRIES TABLE
create table if not exists public.trip_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  destination text,
  trip_type text,
  travelers text,
  start_date text,
  end_date text,
  budget text,
  style text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'resolved', 'archived')),
  created_at timestamptz not null default now()
);

-- 2. CONTACT FORM MESSAGES TABLE
create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  travel_date text,
  travellers integer,
  interested text,
  budget text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'resolved', 'archived')),
  created_at timestamptz not null default now()
);

-- 3. NEWSLETTER SUBSCRIBERS TABLE
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'footer',
  created_at timestamptz not null default now()
);

-- 4. REGISTERED USERS & CUSTOMER AUTH TABLE (Supports Google & Email)
create table if not exists public.registered_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  provider text not null default 'email',
  role text default 'member',
  password_hash text,
  last_login timestamptz default now(),
  created_at timestamptz not null default now()
);

-- If registered_users already exists without provider column, add it safely
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'registered_users' and column_name = 'provider'
  ) then
    alter table public.registered_users add column provider text not null default 'email';
  end if;
end $$;

-- ==============================================================================
-- INDEXES FOR INSTANT CRM PERFORMANCE
-- ==============================================================================
create index if not exists trip_inquiries_created_idx on public.trip_inquiries (created_at desc);
create index if not exists contact_inquiries_created_idx on public.contact_inquiries (created_at desc);
create index if not exists newsletter_subscribers_created_idx on public.newsletter_subscribers (created_at desc);
create index if not exists registered_users_email_idx on public.registered_users (email);
create index if not exists registered_users_created_idx on public.registered_users (created_at desc);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.trip_inquiries enable row level security;
alter table public.contact_inquiries enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.registered_users enable row level security;

-- Public Insert Policies (Allows visitors to submit forms and sign up)
drop policy if exists "Public insert trip inquiries" on public.trip_inquiries;
create policy "Public insert trip inquiries" on public.trip_inquiries 
  for insert to anon, authenticated with check (true);

drop policy if exists "Public insert contact inquiries" on public.contact_inquiries;
create policy "Public insert contact inquiries" on public.contact_inquiries 
  for insert to anon, authenticated with check (true);

drop policy if exists "Public insert newsletter subscribers" on public.newsletter_subscribers;
create policy "Public insert newsletter subscribers" on public.newsletter_subscribers 
  for insert to anon, authenticated with check (true);

drop policy if exists "Public insert registered users" on public.registered_users;
create policy "Public insert registered users" on public.registered_users 
  for insert to anon, authenticated with check (true);

-- Update & Read Policies (For Admin portal and User profile updates)
drop policy if exists "Admins manage trip inquiries" on public.trip_inquiries;
create policy "Admins manage trip inquiries" on public.trip_inquiries 
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "Admins manage contact inquiries" on public.contact_inquiries;
create policy "Admins manage contact inquiries" on public.contact_inquiries 
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "Admins manage newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins manage newsletter subscribers" on public.newsletter_subscribers 
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "Admins manage registered users" on public.registered_users;
create policy "Admins manage registered users" on public.registered_users 
  for all to anon, authenticated using (true) with check (true);

-- Permissions
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.trip_inquiries to anon, authenticated;
grant select, insert, update, delete on public.contact_inquiries to anon, authenticated;
grant select, insert, update, delete on public.newsletter_subscribers to anon, authenticated;
grant select, insert, update, delete on public.registered_users to anon, authenticated;
