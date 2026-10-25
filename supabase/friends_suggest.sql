-- Gợi ý bạn bè (theo vị trí gần đúng ~10km nếu người dùng bật, ngược lại ngẫu nhiên) + kết bạn theo id
alter table public.profiles add column if not exists geo_lat numeric(5,1);
alter table public.profiles add column if not exists geo_lng numeric(5,1);
alter table public.profiles add column if not exists geo_at timestamptz;

-- Lưu vị trí đã làm tròn 0.1 độ (~11km); gọi với null để xoá
create or replace function public.set_my_geo(lat double precision, lng double precision)
returns void language sql security definer set search_path = public as $$
  update profiles set geo_lat = round(lat::numeric, 1), geo_lng = round(lng::numeric, 1), geo_at = case when lat is null then null else now() end
  where id = auth.uid();
$$;

create or replace function public.friend_suggestions(track uuid default null, lat double precision default null, lng double precision default null)
returns table(user_id uuid, name text, avatar text, max_level int, dist_km int)
language sql security definer set search_path = public stable as $$
  with tr as (select coalesce(track, (select id from tracks where slug = 'steel')) as id),
  cand as (
    select p.id, coalesce(nullif(p.full_name,''), split_part(p.email,'@',1)) as name, p.avatar, p.geo_lat, p.geo_lng
    from profiles p, tr
    where p.id <> auth.uid()
      and not exists (select 1 from friendships f where (f.requester = auth.uid() and f.addressee = p.id) or (f.requester = p.id and f.addressee = auth.uid()))
      and (exists (select 1 from saga_scores s where s.user_id = p.id and s.track_id = tr.id)
           or exists (select 1 from enrollments e where e.user_id = p.id and e.track_id = tr.id and e.status = 'approved'))
  )
  select c.id, c.name, c.avatar,
    (select coalesce(max(s.level + 1), 1)::int from saga_scores s, tr where s.user_id = c.id and s.track_id = tr.id and s.stars >= 1),
    case when lat is not null and c.geo_lat is not null then
      greatest(1, round(111 * sqrt(power(c.geo_lat - lat, 2) + power((c.geo_lng - lng) * cos(radians(lat)), 2))))::int end
  from cand c
  order by (lat is not null and c.geo_lat is not null) desc,
           case when lat is not null and c.geo_lat is not null then power(c.geo_lat - lat, 2) + power(c.geo_lng - lng, 2) end asc nulls last,
           random()
  limit 8;
$$;

create or replace function public.friend_request_id(target uuid)
returns text language plpgsql security definer set search_path = public as $$
declare em text;
begin
  select email into em from profiles where id = target;
  if em is null then raise exception 'Không tìm thấy tài khoản'; end if;
  return public.friend_request(em);
end $$;

revoke all on function public.set_my_geo(double precision, double precision), public.friend_suggestions(uuid, double precision, double precision), public.friend_request_id(uuid) from public, anon;
grant execute on function public.set_my_geo(double precision, double precision), public.friend_suggestions(uuid, double precision, double precision), public.friend_request_id(uuid) to authenticated;
