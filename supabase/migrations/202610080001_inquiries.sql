-- Himalaya Form Inquiries and Subscriptions Schema
-- Run this once in the Supabase SQL Editor (Dashboard > SQL Editor)

create extension if not exists pgcrypto;

-- 1. Contact Form Inquiries Table
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

-- 2. Trip Planning Inquiries Table
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

-- 3. Newsletter Subscribers Table
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'footer',
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists contact_inquiries_created_idx on public.contact_inquiries (created_at desc);
create index if not exists trip_inquiries_created_idx on public.trip_inquiries (created_at desc);
create index if not exists newsletter_subscribers_created_idx on public.newsletter_subscribers (created_at desc);

-- Enable Row Level Security (RLS)
alter table public.contact_inquiries enable row level security;
alter table public.trip_inquiries enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Policies:
drop policy if exists "Public insert contact inquiries" on public.contact_inquiries;
create policy "Public insert contact inquiries" on public.contact_inquiries for insert to anon, authenticated with check (true);

drop policy if exists "Public insert trip inquiries" on public.trip_inquiries;
create policy "Public insert trip inquiries" on public.trip_inquiries for insert to anon, authenticated with check (true);

drop policy if exists "Public insert newsletter subscribers" on public.newsletter_subscribers;
create policy "Public insert newsletter subscribers" on public.newsletter_subscribers for insert to anon, authenticated with check (true);

-- Admin read and update policies
drop policy if exists "Admins manage contact inquiries" on public.contact_inquiries;
create policy "Admins manage contact inquiries" on public.contact_inquiries for all to anon, authenticated using (true) with check (true);

drop policy if exists "Admins manage trip inquiries" on public.trip_inquiries;
create policy "Admins manage trip inquiries" on public.trip_inquiries for all to anon, authenticated using (true) with check (true);

drop policy if exists "Admins manage newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins manage newsletter subscribers" on public.newsletter_subscribers for all to anon, authenticated using (true) with check (true);

-- Grant privileges
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.contact_inquiries to anon, authenticated;
grant select, insert, update, delete on public.trip_inquiries to anon, authenticated;
grant select, insert, update, delete on public.newsletter_subscribers to anon, authenticated;
