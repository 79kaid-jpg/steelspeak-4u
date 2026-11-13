-- Riêng tư giữa học viên: Admin bật "Ẩn học viên khác với nhau" → học viên chỉ thấy Admin.
-- Bảng xếp hạng đổi tên người khác thành "Học viên #n", tắt gợi ý/kết bạn giữa học viên, thách đấu chỉ với Admin.
create table if not exists public.app_settings (key text primary key, value jsonb not null, updated_at timestamptz default now());
alter table public.app_settings enable row level security;
drop policy if exists "settings read" on public.app_settings;
drop policy if exists "settings admin" on public.app_settings;
create policy "settings read" on public.app_settings for select to authenticated using (true);
create policy "settings admin" on public.app_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.peers_hidden() returns boolean language sql security definer set search_path = public stable as $$
  select coalesce((select (value->>'on')::boolean from app_settings where key='hide_peers'), false) and not public.is_admin()
$$;

create or replace function public.saga_board(period text default 'week', track uuid default null)
returns table(user_id uuid, name text, department text, avatar text, stars int, levels int, max_level int, od int, score int, is_me boolean)
language sql security definer set search_path = public stable as $$
  with tr as (select coalesce(track, (select id from tracks where slug = 'steel')) as id),
  since as (select case when period = 'week' then (date_trunc('week', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh') else '-infinity'::timestamptz end as t),
  best as (select s.user_id, s.level, max(s.score) as score from saga_scores s, since, tr where s.created_at >= since.t and s.track_id = tr.id group by s.user_id, s.level),
  allbest as (select s.user_id, s.level, max(s.stars) as stars, bool_or(s.overdrive) as od from saga_scores s, tr where s.stars >= 1 and s.track_id = tr.id group by s.user_id, s.level),
  raw as (
    select b.user_id,
           coalesce(nullif(p.full_name,''), split_part(p.email,'@',1), 'Người học') as name,
           coalesce(p.department,'') as department, p.avatar, coalesce(p.is_admin,false) as adm,
           (select coalesce(sum(a.stars),0)::int from allbest a where a.user_id = b.user_id) as stars,
           (select count(*)::int from allbest a where a.user_id = b.user_id) as levels,
           (select coalesce(max(a.level + 1),1)::int from allbest a where a.user_id = b.user_id) as max_level,
           (select count(*)::int from allbest a where a.user_id = b.user_id and a.od) as od,
           sum(b.score)::int as score
    from best b left join profiles p on p.id = b.user_id
    group by b.user_id, p.full_name, p.email, p.department, p.avatar, p.is_admin),
  ranked as (select r.*, row_number() over (order by r.score desc) as rk from raw r)
  select r.user_id,
         case when public.peers_hidden() and r.user_id <> auth.uid() and not r.adm then 'Học viên #'||r.rk else r.name end,
         case when public.peers_hidden() and r.user_id <> auth.uid() and not r.adm then '' else r.department end,
         case when public.peers_hidden() and r.user_id <> auth.uid() and not r.adm then null else r.avatar end,
         r.stars, r.levels, r.max_level, r.od, r.score, r.user_id = auth.uid()
  from ranked r order by r.score desc limit 100;
$$;
revoke all on function public.saga_board(text, uuid) from public, anon;
grant execute on function public.saga_board(text, uuid) to authenticated;

create or replace function public.friend_suggestions(track uuid default null, lat double precision default null, lng double precision default null)
returns table(user_id uuid, name text, avatar text, max_level int, dist_km int)
language sql security definer set search_path = public stable as $$
  with tr as (select coalesce(track, (select id from tracks where slug = 'steel')) as id),
  cand as (
    select p.id, coalesce(nullif(p.full_name,''), split_part(p.email,'@',1)) as name, p.avatar, p.geo_lat, p.geo_lng
    from profiles p, tr
    where p.id <> auth.uid() and not public.peers_hidden()
      and not exists (select 1 from friendships f where (f.requester = auth.uid() and f.addressee = p.id) or (f.requester = p.id and f.addressee = auth.uid()))
      and (exists (select 1 from saga_scores s where s.user_id = p.id and s.track_id = tr.id)
           or exists (select 1 from enrollments e where e.user_id = p.id and e.track_id = tr.id and e.status = 'approved')))
  select c.id, c.name, c.avatar,
    (select coalesce(max(s.level + 1), 1)::int from saga_scores s, tr where s.user_id = c.id and s.track_id = tr.id and s.stars >= 1),
    case when lat is not null and c.geo_lat is not null then greatest(1, round(111 * sqrt(power(c.geo_lat - lat, 2) + power((c.geo_lng - lng) * cos(radians(lat)), 2))))::int end
  from cand c
  order by (lat is not null and c.geo_lat is not null) desc,
           case when lat is not null and c.geo_lat is not null then power(c.geo_lat - lat, 2) + power(c.geo_lng - lng, 2) end asc nulls last, random()
  limit 8;
$$;

create or replace function public.friend_request(email text)
returns text language plpgsql security definer set search_path = public as $$
declare target uuid; ex record; tadm boolean;
begin
  if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
  select id, is_admin into target, tadm from profiles where lower(profiles.email) = lower(trim(friend_request.email)) limit 1;
  if target is null then raise exception 'Không tìm thấy tài khoản với email này'; end if;
  if target = auth.uid() then raise exception 'Không thể tự kết bạn với chính mình'; end if;
  if public.peers_hidden() and not coalesce(tadm,false) then raise exception 'Admin đang tắt kết bạn giữa học viên'; end if;
  select * into ex from friendships where (requester = auth.uid() and addressee = target) or (requester = target and addressee = auth.uid());
  if found then
    if ex.status = 'accepted' then return 'already'; end if;
    if ex.addressee = auth.uid() then update friendships set status = 'accepted' where id = ex.id; return 'accepted'; end if;
    return 'pending';
  end if;
  insert into friendships(requester, addressee) values (auth.uid(), target);
  return 'sent';
end $$;

drop function if exists public.challenge_targets();
create or replace function public.challenge_targets()
returns table(user_id uuid, name text, avatar text, is_admin boolean, is_friend boolean, online boolean, last_seen timestamptz)
language sql security definer set search_path = public stable as $$
  select p.id, coalesce(nullif(p.full_name,''), split_part(p.email,'@',1)), p.avatar, p.is_admin,
         exists(select 1 from friendships f where f.status='accepted' and ((f.requester=auth.uid() and f.addressee=p.id) or (f.addressee=auth.uid() and f.requester=p.id))),
         coalesce(pr.last_seen > now() - interval '3 minutes', false), pr.last_seen
  from profiles p left join presence pr on pr.user_id = p.id
  where p.id <> auth.uid() and (
    public.is_admin() or p.is_admin
    or (not public.peers_hidden() and exists(select 1 from friendships f where f.status='accepted' and ((f.requester=auth.uid() and f.addressee=p.id) or (f.addressee=auth.uid() and f.requester=p.id)))))
  order by p.is_admin desc, coalesce(pr.last_seen > now() - interval '3 minutes', false) desc, pr.last_seen desc nulls last, 2
$$;
grant execute on function public.challenge_targets() to authenticated;

create or replace function public.flood_can_see(target uuid) returns boolean
language sql security definer set search_path = public stable as $$
  select target = auth.uid() or public.is_admin()
      or exists(select 1 from profiles p where p.id = target and p.is_admin)
      or (not public.peers_hidden() and exists(select 1 from friendships f where f.status='accepted' and ((f.requester=auth.uid() and f.addressee=target) or (f.addressee=auth.uid() and f.requester=target))))
$$;
