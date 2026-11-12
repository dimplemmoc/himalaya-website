-- Himalaya Registered Users & Customer Auth Schema
create table if not exists public.registered_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  password_hash text,
  role text default 'member',
  last_login timestamptz default now(),
  created_at timestamptz not null default now()
);

create index if not exists registered_users_email_idx on public.registered_users (email);
create index if not exists registered_users_created_idx on public.registered_users (created_at desc);

alter table public.registered_users enable row level security;

drop policy if exists "Public insert registered users" on public.registered_users;
create policy "Public insert registered users" on public.registered_users for insert to anon, authenticated with check (true);

drop policy if exists "Public update own user profile" on public.registered_users;
create policy "Public update own user profile" on public.registered_users for update to anon, authenticated using (true) with check (true);

drop policy if exists "Admins manage registered users" on public.registered_users;
create policy "Admins manage registered users" on public.registered_users for all to anon, authenticated using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.registered_users to anon, authenticated;
