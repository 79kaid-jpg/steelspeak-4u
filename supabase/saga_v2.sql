-- Speed Saga v2: ảnh đại diện. Chạy 1 lần trong SQL Editor (sau saga.sql)
alter table public.profiles add column if not exists avatar text;
alter table public.profiles drop constraint if exists avatar_size;
alter table public.profiles add constraint avatar_size check (avatar is null or length(avatar) < 60000);

drop function if exists public.saga_board(text);
create or replace function public.saga_board(period text default 'week')
returns table(user_id uuid, name text, department text, avatar text, stars int, levels int, max_level int, score int, is_me boolean)
language sql security definer set search_path = public stable as $$
  with since as (
    select case when period = 'week'
      then (date_trunc('week', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh')
      else '-infinity'::timestamptz end as t
  ),
  best as (
    select s.user_id, s.level, max(s.score) as score
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
revoke all on function public.saga_board(text) from public, anon;
grant execute on function public.saga_board(text) to authenticated;
