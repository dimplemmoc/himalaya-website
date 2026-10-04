-- Himalaya Blog CMS. Apply once in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.cms_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create or replace function public.is_cms_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.cms_admins
    where user_id = auth.uid()
      and lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;

create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  h1 text not null,
  seo_title text not null,
  slug text not null unique,
  category_id uuid references public.blog_categories(id) on delete set null,
  category_label text not null default '',
  excerpt text not null default '',
  content_html text not null default '',
  featured_image_url text not null default '',
  featured_image_alt text not null default '',
  seo_description text not null default '',
  status text not null default 'draft' check (status in ('draft','published','unpublished')),
  published_at timestamptz,
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_title_search_idx on public.blog_posts using gin (to_tsvector('simple', coalesce(h1,'') || ' ' || coalesce(seo_title,'')));
create index if not exists blog_posts_published_idx on public.blog_posts (published_at desc) where status = 'published' and deleted_at is null;

create table if not exists public.blog_post_versions (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  snapshot jsonb not null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);
create table if not exists public.blog_activity (
  id bigint generated always as identity primary key,
  post_id uuid references public.blog_posts(id) on delete set null,
  post_title text not null,
  action text not null,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.capture_blog_post_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare action_name text;
begin
  if tg_op = 'UPDATE' then
    insert into public.blog_post_versions(post_id, snapshot, changed_by) values (old.id, to_jsonb(old), auth.uid());
    if old.deleted_at is distinct from new.deleted_at and new.deleted_at is not null then action_name := 'moved to trash';
    elsif old.deleted_at is not null and new.deleted_at is null then action_name := 'restored';
    elsif old.status is distinct from new.status and new.status = 'published' then action_name := 'published';
    elsif old.status is distinct from new.status and new.status <> 'published' then action_name := 'unpublished';
    else action_name := 'edited'; end if;
    insert into public.blog_activity(post_id, post_title, action, actor_id) values (new.id, new.h1, action_name, auth.uid());
    return new;
  elsif tg_op = 'INSERT' then
    insert into public.blog_activity(post_id, post_title, action, actor_id)
      values (new.id, new.h1, case when new.status = 'published' then 'created and published' else 'created draft' end, auth.uid());
    return new;
  end if;
  return null;
end;
$$;
drop trigger if exists blog_post_audit on public.blog_posts;
create trigger blog_post_audit after insert or update on public.blog_posts for each row execute function public.capture_blog_post_change();

alter table public.cms_admins enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_post_versions enable row level security;
alter table public.blog_activity enable row level security;

drop policy if exists "Admins manage CMS admins" on public.cms_admins;
drop policy if exists "CMS users read their own admin row" on public.cms_admins;
create policy "CMS users read their own admin row" on public.cms_admins for select to authenticated
  using (user_id = auth.uid() and lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
drop policy if exists "Public read categories" on public.blog_categories;
create policy "Public read categories" on public.blog_categories for select to anon, authenticated using (true);
drop policy if exists "Admins manage categories" on public.blog_categories;
create policy "Admins manage categories" on public.blog_categories for all to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());
drop policy if exists "Public read published blog posts" on public.blog_posts;
create policy "Public read published blog posts" on public.blog_posts for select to anon, authenticated using (status = 'published' and deleted_at is null);
drop policy if exists "Admins read all blog posts" on public.blog_posts;
create policy "Admins read all blog posts" on public.blog_posts for select to authenticated using (public.is_cms_admin());
drop policy if exists "Admins create blog posts" on public.blog_posts;
create policy "Admins create blog posts" on public.blog_posts for insert to authenticated with check (public.is_cms_admin());
drop policy if exists "Admins update blog posts" on public.blog_posts;
create policy "Admins update blog posts" on public.blog_posts for update to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());
drop policy if exists "Admins read post versions" on public.blog_post_versions;
create policy "Admins read post versions" on public.blog_post_versions for select to authenticated using (public.is_cms_admin());
drop policy if exists "Admins read activity" on public.blog_activity;
create policy "Admins read activity" on public.blog_activity for select to authenticated using (public.is_cms_admin());

-- Published images are public; original documents stay in a private bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-media', 'blog-media', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 10485760;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-documents', 'blog-documents', false, 20971520, array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword'])
on conflict (id) do update set public = false, file_size_limit = 20971520;
drop policy if exists "Public read blog media" on storage.objects;
create policy "Public read blog media" on storage.objects for select to anon, authenticated using (bucket_id = 'blog-media');
drop policy if exists "Admins upload blog media" on storage.objects;
create policy "Admins upload blog media" on storage.objects for insert to authenticated with check (bucket_id in ('blog-media','blog-documents') and public.is_cms_admin());
drop policy if exists "Admins update blog media" on storage.objects;
create policy "Admins update blog media" on storage.objects for update to authenticated using (bucket_id in ('blog-media','blog-documents') and public.is_cms_admin()) with check (bucket_id in ('blog-media','blog-documents') and public.is_cms_admin());
drop policy if exists "Admins delete blog media" on storage.objects;
create policy "Admins delete blog media" on storage.objects for delete to authenticated using (bucket_id in ('blog-media','blog-documents') and public.is_cms_admin());
drop policy if exists "Admins read blog documents" on storage.objects;
create policy "Admins read blog documents" on storage.objects for select to authenticated using (bucket_id = 'blog-documents' and public.is_cms_admin());

grant usage on schema public to anon, authenticated;
grant select on public.blog_categories to anon, authenticated;
grant select on public.blog_posts to anon, authenticated;
grant insert, update on public.blog_posts to authenticated;
grant select, insert, update, delete on public.blog_categories to authenticated;
grant select on public.cms_admins to authenticated;
grant select on public.blog_post_versions, public.blog_activity to authenticated;
grant usage, select on all sequences in schema public to authenticated;
