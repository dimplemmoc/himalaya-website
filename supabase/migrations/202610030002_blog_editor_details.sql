-- Extra editorial fields shown in the blog post form.
alter table public.blog_posts
  add column if not exists target_url text not null default '',
  add column if not exists anchor_text text not null default '',
  add column if not exists link_type text not null default 'dofollow',
  add column if not exists is_indexable boolean not null default true,
  add column if not exists is_sponsored boolean not null default false,
  add column if not exists special_requirements text not null default '';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'blog_posts_link_type_check'
      and conrelid = 'public.blog_posts'::regclass
  ) then
    alter table public.blog_posts
      add constraint blog_posts_link_type_check
      check (link_type in ('dofollow', 'nofollow'));
  end if;
end $$;
