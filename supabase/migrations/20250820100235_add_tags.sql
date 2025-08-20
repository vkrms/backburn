-- Optional, for gen_random_uuid()
create extension if not exists pgcrypto with schema public;

-- Tags table
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- Join table task_tags
create table if not exists public.task_tags (
  task_id uuid not null references public.tasks(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, tag_id)
);

-- RLS
alter table public.tags enable row level security;
alter table public.task_tags enable row level security;

-- Policies for tags
create policy "tags_select_own"
  on public.tags for select
  using (user_id = auth.uid());

create policy "tags_insert_own"
  on public.tags for insert
  with check (user_id = auth.uid());

create policy "tags_update_own"
  on public.tags for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "tags_delete_own"
  on public.tags for delete
  using (user_id = auth.uid());

-- Auto-set user_id via trigger
create or replace function public.set_auth_uid()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'INSERT' then
    new.user_id := auth.uid();
  end if;
  return new;
end; $$;

drop trigger if exists set_tags_user_id on public.tags;
create trigger set_tags_user_id
before insert on public.tags
for each row execute function public.set_auth_uid();

-- Policies for task_tags (must own both the task and the tag)
create policy "task_tags_select_own"
  on public.task_tags for select
  using (
    exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid())
    and exists (select 1 from public.tags g where g.id = tag_id and g.user_id = auth.uid())
  );

create policy "task_tags_insert_own"
  on public.task_tags for insert
  with check (
    exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid())
    and exists (select 1 from public.tags g where g.id = tag_id and g.user_id = auth.uid())
  );

create policy "task_tags_delete_own"
  on public.task_tags for delete
  using (
    exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid())
    and exists (select 1 from public.tags g where g.id = tag_id and g.user_id = auth.uid())
  );

-- Helpful indexes
create index if not exists idx_tags_user_name on public.tags(user_id, name);
create index if not exists idx_task_tags_task on public.task_tags(task_id);
create index if not exists idx_task_tags_tag on public.task_tags(tag_id);
