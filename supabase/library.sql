-- Kho đề IELTS dùng chung, lịch sử làm bài, bài học chia sẻ trong khóa
create table if not exists public.ielts_sets (
  id bigserial primary key,
  track_id uuid not null references public.tracks(id) on delete cascade,
  skill text not null check (skill in ('reading','listening','wprompt','sprompt')),
  sub int not null default 0,                -- Writing: task 1/2; Speaking: part 1/2/3
  topic text default '',
  title text default '',
  data jsonb not null,
  quality boolean not null default false,    -- admin đánh dấu đề tốt
  status text not null default 'live' check (status in ('live','off')),
  uses int not null default 0,
  created_by uuid default auth.uid(),
  created_at timestamptz default now()
);
create index if not exists ielts_sets_pick on public.ielts_sets(track_id, skill, sub, status);
alter table public.ielts_sets enable row level security;
drop policy if exists "is read" on public.ielts_sets;
create policy "is read" on public.ielts_sets for select using (auth.role() = 'authenticated' and (status = 'live' or public.is_admin()));
drop policy if exists "is insert" on public.ielts_sets;
create policy "is insert" on public.ielts_sets for insert with check (auth.uid() is not null and created_by = auth.uid() and quality = false and status = 'live');
drop policy if exists "is admin" on public.ielts_sets;
create policy "is admin" on public.ielts_sets for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "is admin del" on public.ielts_sets;
create policy "is admin del" on public.ielts_sets for delete using (public.is_admin());

create table if not exists public.ielts_attempts (
  id bigserial primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete cascade,
  set_id bigint references public.ielts_sets(id) on delete set null,
  skill text not null,
  sub int default 0,
  band numeric(3,1),
  title text default '',
  detail jsonb,
  created_at timestamptz default now()
);
create index if not exists ielts_att_user on public.ielts_attempts(user_id, created_at desc);
alter table public.ielts_attempts enable row level security;
drop policy if exists "ia own" on public.ielts_attempts;
create policy "ia own" on public.ielts_attempts for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());

-- Chọn 1 đề có sẵn: ưu tiên đề chất lượng, đúng chủ đề, ít người dùng, chưa làm gần đây
create or replace function public.ielts_pick(track uuid, skill text, sub int default 0, topic text default '')
returns setof public.ielts_sets language plpgsql security definer set search_path = public as $$
declare r public.ielts_sets;
begin
  select s.* into r from ielts_sets s
  where s.track_id = ielts_pick.track and s.skill = ielts_pick.skill and s.sub = coalesce(ielts_pick.sub, 0) and s.status = 'live'
    and (coalesce(ielts_pick.topic, '') = '' or s.topic ilike '%' || ielts_pick.topic || '%' or s.title ilike '%' || ielts_pick.topic || '%')
    and not exists (select 1 from ielts_attempts a where a.set_id = s.id and a.user_id = auth.uid())
  order by s.quality desc, s.uses asc, random()
  limit 1;
  if found then update ielts_sets set uses = uses + 1 where id = r.id; return next r; end if;
end $$;
revoke all on function public.ielts_pick(uuid, text, int, text) from public, anon;
grant execute on function public.ielts_pick(uuid, text, int, text) to authenticated;

create table if not exists public.shared_lessons (
  id bigserial primary key,
  track_id uuid not null references public.tracks(id) on delete cascade,
  name text not null,
  src text default '',
  terms jsonb not null,
  status text not null default 'pending' check (status in ('pending','live','rejected')),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  author text default '',
  created_at timestamptz default now()
);
alter table public.shared_lessons enable row level security;
drop policy if exists "sl read" on public.shared_lessons;
create policy "sl read" on public.shared_lessons for select using (status = 'live' or created_by = auth.uid() or public.is_admin());
drop policy if exists "sl insert" on public.shared_lessons;
create policy "sl insert" on public.shared_lessons for insert with check (created_by = auth.uid() and status = 'pending');
drop policy if exists "sl admin" on public.shared_lessons;
create policy "sl admin" on public.shared_lessons for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "sl admin del" on public.shared_lessons;
create policy "sl admin del" on public.shared_lessons for delete using (public.is_admin() or created_by = auth.uid());
