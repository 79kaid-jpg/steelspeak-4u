-- Speed Saga: chạy 1 lần trong Supabase > SQL Editor (sau profiles.sql)
create table if not exists public.saga_scores (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  level int not null,
  correct int not null,
  ms int not null,
  score int not null,
  stars int not null,
  overdrive boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists saga_scores_user on public.saga_scores(user_id, level);
create index if not exists saga_scores_time on public.saga_scores(created_at);
alter table public.saga_scores enable row level security;
-- Người dùng chỉ ĐỌC điểm của mình; chỉ máy chủ (Edge Function "saga") được GHI
create policy "saga own select" on public.saga_scores for select using (auth.uid() = user_id);

-- Bảng xếp hạng: period = 'week' | 'all'. Tuần tính theo giờ Việt Nam, bắt đầu thứ Hai.
create or replace function public.saga_board(period text default 'week')
returns table(user_id uuid, name text, department text, stars int, levels int, max_level int, score int, is_me boolean)
language sql security definer set search_path = public stable as $$
  with since as (
    select case when period = 'week'
      then (date_trunc('week', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh')
      else '-infinity'::timestamptz end as t
  ),
  best as (
    select s.user_id, s.level, max(s.score) as score, max(s.stars) as stars,
           bool_or(s.overdrive) as od
    from saga_scores s, since where s.created_at >= since.t
    group by s.user_id, s.level
  ),
  allbest as (
    select user_id, level, max(stars) as stars, bool_or(overdrive) as od
    from saga_scores where stars >= 1 group by user_id, level
  )
  select b.user_id,
         coalesce(nullif(p.full_name,''), split_part(p.email,'@',1), 'Người học') as name,
         coalesce(p.department,'') as department,
         (select coalesce(sum(a.stars),0)::int from allbest a where a.user_id = b.user_id) as stars,
         (select count(*)::int from allbest a where a.user_id = b.user_id) as levels,
         (select coalesce(max(a.level + case when a.od then 3 else 1 end),1)::int from allbest a where a.user_id = b.user_id) as max_level,
         sum(b.score)::int as score,
         b.user_id = auth.uid() as is_me
  from best b left join profiles p on p.id = b.user_id
  group by b.user_id, p.full_name, p.email, p.department
  order by score desc
  limit 100;
$$;
revoke all on function public.saga_board(text) from public, anon;
grant execute on function public.saga_board(text) to authenticated;
