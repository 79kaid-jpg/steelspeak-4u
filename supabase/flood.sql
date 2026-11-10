-- Game "Nước Dâng": thách đấu 1-1 thời gian thực. Chạy 1 lần trong Supabase → SQL Editor (sau challenges.sql).
-- Trận đấu lưu ở flood_matches; diễn biến từng câu đi qua kênh Realtime broadcast 'flood-<id>' (không lưu DB).
create table if not exists public.flood_matches (
  id bigserial primary key,
  a uuid not null references auth.users(id) on delete cascade,   -- người mời (chủ phòng)
  b uuid references auth.users(id) on delete cascade,            -- đối thủ; null = Kaka
  topic text,
  q jsonb not null,
  status text not null default 'invite' check (status in ('invite','live','declined','done','expired')),
  a_air int, b_air int, winner uuid,
  created_at timestamptz not null default now(), ended_at timestamptz
);
create index if not exists flood_b_idx on public.flood_matches(b, created_at desc);
alter table public.flood_matches enable row level security;
drop policy if exists "flood read" on public.flood_matches;
create policy "flood read" on public.flood_matches for select to authenticated using (auth.uid() in (a, b));

create or replace function public.flood_invite(target uuid, q jsonb, topic text)
returns public.flood_matches language plpgsql security definer set search_path = public as $$
declare r public.flood_matches; ok_target boolean; nm text;
begin
  if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
  if (select count(*) from flood_matches where a = auth.uid() and created_at > now() - interval '1 minute') >= 5 then
    raise exception 'Bạn mời nhanh quá, đợi một chút nhé'; end if;
  if jsonb_typeof(q) <> 'array' or jsonb_array_length(q) > 12 or length(q::text) > 20000 then raise exception 'Câu hỏi không hợp lệ'; end if;
  if target is not null then
    select (p.is_admin or public.is_admin() or exists(select 1 from friendships f where f.status='accepted' and ((f.requester=auth.uid() and f.addressee=target) or (f.addressee=auth.uid() and f.requester=target))))
      into ok_target from profiles p where p.id = target;
    if not coalesce(ok_target,false) or target = auth.uid() then raise exception 'Chỉ mời được bạn bè hoặc Admin'; end if;
  end if;
  insert into flood_matches(a, b, q, topic, status) values (auth.uid(), target, q, left(topic,80), case when target is null then 'live' else 'invite' end) returning * into r;
  if target is not null then
    select display_name(auth.uid()) into nm;
    insert into notifications(to_id, kind, title, body, ref) values (target, 'flood', '🌊 ' || nm || ' mời bạn đấu Nước Dâng', r.id::text, auth.uid());
  end if;
  return r;
end $$;

create or replace function public.flood_respond(mid bigint, accept boolean)
returns public.flood_matches language plpgsql security definer set search_path = public as $$
declare r public.flood_matches;
begin
  update flood_matches set status = case when accept then 'live' else 'declined' end
   where id = mid and b = auth.uid() and status = 'invite' and created_at > now() - interval '3 minutes' returning * into r;
  if r.id is null then raise exception 'Lời mời đã hết hạn'; end if;
  return r;
end $$;

create or replace function public.flood_finish(mid bigint, a_left int, b_left int, win uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update flood_matches set status = 'done', a_air = a_left, b_air = b_left, winner = win, ended_at = now()
   where id = mid and a = auth.uid() and status = 'live';
end $$;

-- Thông tin đối thủ (tên + ảnh đại diện) cho người trong trận
create or replace function public.flood_people(mid bigint)
returns table(user_id uuid, name text, avatar text) language sql security definer set search_path = public stable as $$
  select p.id, coalesce(nullif(p.full_name,''), split_part(p.email,'@',1)), p.avatar
  from flood_matches m join profiles p on p.id in (m.a, m.b)
  where m.id = mid and auth.uid() in (m.a, m.b)
$$;

revoke all on function public.flood_invite(uuid, jsonb, text), public.flood_respond(bigint, boolean), public.flood_finish(bigint, int, int, uuid), public.flood_people(bigint) from public, anon;
grant execute on function public.flood_invite(uuid, jsonb, text), public.flood_respond(bigint, boolean), public.flood_finish(bigint, int, int, uuid), public.flood_people(bigint) to authenticated;
