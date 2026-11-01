-- Thách đấu từng câu hỏi: học viên ↔ bạn bè / Admin / Kaka. Kaka cũng chủ động thách đấu mọi người.
-- Chạy 1 lần trong Supabase → SQL Editor, SAU friends.sql và messaging.sql. Chạy lại được.
-- Quy ước: from_id / to_id = null nghĩa là Kaka (nhân vật trong app).

create table if not exists public.challenges (
  id bigserial primary key,
  from_id uuid references auth.users(id) on delete cascade,
  to_id uuid references auth.users(id) on delete cascade,
  track text default '',
  q jsonb not null,                       -- {en, vi, ex, opts:[...], ans, mode}
  from_ok boolean, from_ms int,
  to_ok boolean, to_ms int,
  status text not null default 'open' check (status in ('open','done')),
  created_at timestamptz default now(),
  answered_at timestamptz,
  check (from_id is not null or to_id is not null)
);
create index if not exists ch_to on public.challenges(to_id, status, id desc);
create index if not exists ch_from on public.challenges(from_id, id desc);
alter table public.challenges enable row level security;
drop policy if exists "ch read" on public.challenges;
create policy "ch read" on public.challenges for select using (auth.uid() in (from_id, to_id) or public.is_admin());

-- Người có thể thách đấu: Admin (luôn có) + bạn bè đã kết bạn. Kaka do app tự thêm.
create or replace function public.challenge_targets()
returns table(user_id uuid, name text, avatar text, is_admin boolean, is_friend boolean)
language sql security definer set search_path = public stable as $$
  select p.id, coalesce(nullif(p.full_name,''), split_part(p.email,'@',1)), p.avatar, p.is_admin,
         exists(select 1 from friendships f where f.status='accepted' and ((f.requester=auth.uid() and f.addressee=p.id) or (f.addressee=auth.uid() and f.requester=p.id)))
  from profiles p
  where p.id <> auth.uid() and (p.is_admin or exists(select 1 from friendships f where f.status='accepted' and ((f.requester=auth.uid() and f.addressee=p.id) or (f.addressee=auth.uid() and f.requester=p.id))))
  order by p.is_admin desc, 2
$$;

-- Kaka trả lời: đúng khoảng 72%, mất 2,5–9 giây
create or replace function public.kaka_play() returns jsonb language sql volatile as $$
  select jsonb_build_object('ok', random() < 0.72, 'ms', (2500 + floor(random()*6500))::int)
$$;

create or replace function public.ch_q(q jsonb) returns jsonb language plpgsql immutable as $$
begin
  if jsonb_typeof(q->'opts') <> 'array' or jsonb_array_length(q->'opts') < 2 or jsonb_array_length(q->'opts') > 6
     or coalesce(length(q->>'en'),0) = 0 or length(q::text) > 4000
     or (q->>'ans')::int < 0 or (q->>'ans')::int >= jsonb_array_length(q->'opts') then
    raise exception 'Câu hỏi không hợp lệ';
  end if;
  return q;
end $$;

-- Gửi thách đấu. target = null → thách Kaka (Kaka trả lời ngay)
create or replace function public.challenge_send(target uuid, q jsonb, ok boolean, ms int, trk text default '')
returns public.challenges language plpgsql security definer set search_path = public as $$
declare r challenges; k jsonb; me_admin boolean; ok_target boolean; nm text;
begin
  if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
  if (select count(*) from challenges where from_id = auth.uid() and created_at > now() - interval '1 minute') >= 6 then
    raise exception 'Bạn thách đấu nhanh quá, đợi một chút nhé'; end if;
  q := ch_q(q);
  if target is null then
    k := kaka_play();
    insert into challenges(from_id, to_id, track, q, from_ok, from_ms, to_ok, to_ms, status, answered_at)
    values (auth.uid(), null, left(trk,60), q, ok, greatest(ms,0), (k->>'ok')::boolean, (k->>'ms')::int, 'done', now()) returning * into r;
    return r;
  end if;
  me_admin := public.is_admin();
  select (p.is_admin or me_admin or exists(select 1 from friendships f where f.status='accepted' and ((f.requester=auth.uid() and f.addressee=target) or (f.addressee=auth.uid() and f.requester=target))))
    into ok_target from profiles p where p.id = target;
  if not coalesce(ok_target,false) or target = auth.uid() then raise exception 'Chỉ thách đấu được bạn bè hoặc Admin'; end if;
  insert into challenges(from_id, to_id, track, q, from_ok, from_ms) values (auth.uid(), target, left(trk,60), q, ok, greatest(ms,0)) returning * into r;
  select display_name(auth.uid()) into nm;
  insert into notifications(to_id, kind, title, body, ref) values (target, 'challenge', '⚔ ' || nm || ' thách đấu bạn', q->>'en', auth.uid());
  return r;
end $$;

-- Trả lời thách đấu đang chờ
create or replace function public.challenge_answer(cid bigint, ok boolean, ms int)
returns public.challenges language plpgsql security definer set search_path = public as $$
declare r challenges; win text;
begin
  update challenges set to_ok = ok, to_ms = greatest(ms,0), status = 'done', answered_at = now()
   where id = cid and to_id = auth.uid() and status = 'open' returning * into r;
  if not found then raise exception 'Thách đấu không còn hiệu lực'; end if;
  if r.from_id is not null then
    win := case when r.to_ok and (not r.from_ok or r.to_ms < r.from_ms) then 'thắng' when r.from_ok and (not r.to_ok or r.from_ms < r.to_ms) then 'thua' else 'hòa' end;
    insert into notifications(to_id, kind, title, body, ref)
    values (r.from_id, 'challenge', display_name(auth.uid()) || ' đã nhận lời: bạn ' || case win when 'thắng' then 'thua' when 'thua' then 'thắng' else 'hòa' end, r.q->>'en', auth.uid());
  end if;
  return r;
end $$;

-- Kaka chủ động thách đấu: tối đa 4 lần / ngày (cách nhau ≥ 2 giờ) cho mỗi người (câu hỏi do app chọn từ khóa đang học)
create or replace function public.kaka_challenge(q jsonb, trk text default '')
returns public.challenges language plpgsql security definer set search_path = public as $$
declare r challenges; k jsonb;
begin
  if auth.uid() is null then return null; end if;
  -- tối đa 4 câu / 24 giờ, cách nhau ít nhất 2 giờ
  if (select count(*) from challenges where from_id is null and to_id = auth.uid() and created_at > now() - interval '24 hours') >= 4
     or exists(select 1 from challenges where from_id is null and to_id = auth.uid() and created_at > now() - interval '2 hours') then return null; end if;
  q := ch_q(q); k := kaka_play();
  insert into challenges(from_id, to_id, track, q, from_ok, from_ms) values (null, auth.uid(), left(trk,60), q, (k->>'ok')::boolean, (k->>'ms')::int) returning * into r;
  insert into notifications(to_id, kind, title, body, ref) values (auth.uid(), 'challenge', '⚔ Kaka thách đấu bạn!', q->>'en', null);
  return r;
end $$;

-- Lịch sử thách đấu của tôi (kèm tên hai bên)
create or replace function public.my_challenges()
returns table(id bigint, from_id uuid, to_id uuid, from_name text, to_name text, q jsonb, from_ok boolean, from_ms int, to_ok boolean, to_ms int, status text, created_at timestamptz)
language sql security definer set search_path = public stable as $$
  select c.id, c.from_id, c.to_id, coalesce(display_name(c.from_id),'Kaka'), coalesce(display_name(c.to_id),'Kaka'), c.q, c.from_ok, c.from_ms, c.to_ok, c.to_ms, c.status, c.created_at
  from challenges c where auth.uid() in (c.from_id, c.to_id)
  order by (c.status='open' and c.to_id=auth.uid()) desc, c.id desc limit 60
$$;

revoke all on function public.challenge_targets(), public.challenge_send(uuid, jsonb, boolean, int, text), public.challenge_answer(bigint, boolean, int), public.kaka_challenge(jsonb, text), public.my_challenges() from public, anon;
grant execute on function public.challenge_targets(), public.challenge_send(uuid, jsonb, boolean, int, text), public.challenge_answer(bigint, boolean, int), public.kaka_challenge(jsonb, text), public.my_challenges() to authenticated;
