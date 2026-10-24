-- Speed Saga v3: đua level theo từng khóa học. Chạy SAU platform.sql
alter table public.saga_scores add column if not exists track_id uuid references public.tracks(id) on delete cascade;
update public.saga_scores set track_id = (select id from public.tracks where slug = 'steel') where track_id is null;
create index if not exists saga_scores_track on public.saga_scores(track_id, user_id, level);

drop function if exists public.saga_board(text);
drop function if exists public.saga_board(text, uuid);
create or replace function public.saga_board(period text default 'week', track uuid default null)
returns table(user_id uuid, name text, department text, avatar text, stars int, levels int, max_level int, score int, is_me boolean)
language sql security definer set search_path = public stable as $$
  with tr as (select coalesce(track, (select id from tracks where slug = 'steel')) as id),
  since as (
    select case when period = 'week'
      then (date_trunc('week', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh')
      else '-infinity'::timestamptz end as t
  ),
  best as (
    select s.user_id, s.level, max(s.score) as score
    from saga_scores s, since, tr where s.created_at >= since.t and s.track_id = tr.id
    group by s.user_id, s.level
  ),
  allbest as (
    select s.user_id, s.level, max(s.stars) as stars, bool_or(s.overdrive) as od
    from saga_scores s, tr where s.stars >= 1 and s.track_id = tr.id group by s.user_id, s.level
  )
  select b.user_id,
         coalesce(nullif(p.full_name,''), split_part(p.email,'@',1), 'Người học') as name,
         coalesce(p.department,'') as department,
         p.avatar,
         (select coalesce(sum(a.stars),0)::int from allbest a where a.user_id = b.user_id) as stars,
         (select count(*)::int from allbest a where a.user_id = b.user_id) as levels,
         (select coalesce(max(a.level + case when a.od then 3 else 1 end),1)::int from allbest a where a.user_id = b.user_id) as max_level,
         sum(b.score)::int as score,
         b.user_id = auth.uid() as is_me
  from best b left join profiles p on p.id = b.user_id
  group by b.user_id, p.full_name, p.email, p.department, p.avatar
  order by score desc
  limit 100;
$$;
revoke all on function public.saga_board(text, uuid) from public, anon;
grant execute on function public.saga_board(text, uuid) to authenticated;
