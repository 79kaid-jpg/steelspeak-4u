-- Thông báo khi học viên bắt đầu học + tin nhắn riêng giữa admin và học viên.
-- Chạy 1 lần trong Supabase → SQL Editor (sau profiles.sql). Chạy lại được.

-- 1. Lần học gần nhất của mỗi người (chỉ ghi khi đang ở màn hình học)
create table if not exists public.presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_seen timestamptz not null default now(),
  started_at timestamptz not null default now(),
  activity text default '',
  track text default ''
);
alter table public.presence enable row level security;
drop policy if exists "pr read" on public.presence;
create policy "pr read" on public.presence for select using (user_id = auth.uid() or public.is_admin());

-- 2. Admin chọn theo dõi học viên nào
create table if not exists public.study_watches (
  admin_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (admin_id, user_id)
);
alter table public.study_watches enable row level security;
drop policy if exists "sw admin" on public.study_watches;
create policy "sw admin" on public.study_watches for all using (admin_id = auth.uid() and public.is_admin()) with check (admin_id = auth.uid() and public.is_admin());

-- 3. Hộp thông báo của từng người
create table if not exists public.notifications (
  id bigserial primary key,
  to_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,                 -- 'study' | 'msg'
  title text not null default '',
  body text not null default '',
  ref uuid,                           -- người liên quan
  created_at timestamptz default now(),
  read_at timestamptz
);
create index if not exists notif_to on public.notifications(to_id, id desc);
alter table public.notifications enable row level security;
drop policy if exists "nt own" on public.notifications;
create policy "nt own" on public.notifications for select using (to_id = auth.uid());
drop policy if exists "nt own upd" on public.notifications;
create policy "nt own upd" on public.notifications for update using (to_id = auth.uid()) with check (to_id = auth.uid());
drop policy if exists "nt own del" on public.notifications;
create policy "nt own del" on public.notifications for delete using (to_id = auth.uid());

create or replace function public.display_name(u uuid) returns text
language sql security definer set search_path = public stable as $$
  select coalesce(nullif(full_name, ''), split_part(email, '@', 1), 'Học viên') from profiles where id = u
$$;

-- Gọi mỗi phút khi người học đang ở màn hình học. Phiên mới (nghỉ > 15 phút) → báo cho admin đang theo dõi.
create or replace function public.study_heartbeat(act text, trk text default '')
returns void language plpgsql security definer set search_path = public as $$
declare prev timestamptz; fresh boolean;
begin
  if auth.uid() is null then return; end if;
  select last_seen into prev from presence where user_id = auth.uid();
  fresh := prev is null or prev < now() - interval '15 minutes';
  insert into presence(user_id, last_seen, started_at, activity, track)
  values (auth.uid(), now(), now(), left(coalesce(act, ''), 120), left(coalesce(trk, ''), 60))
  on conflict (user_id) do update set last_seen = now(), activity = excluded.activity, track = excluded.track,
    started_at = case when fresh then now() else presence.started_at end;
  if fresh then
    insert into notifications(to_id, kind, title, body, ref)
    select w.admin_id, 'study', display_name(auth.uid()) || ' đang học', left(coalesce(act, ''), 120), auth.uid()
    from study_watches w where w.user_id = auth.uid() and w.admin_id <> auth.uid();
  end if;
end $$;
revoke all on function public.study_heartbeat(text, text) from public, anon;
grant execute on function public.study_heartbeat(text, text) to authenticated;

-- 4. Tin nhắn: mỗi học viên có 1 cuộc trò chuyện với ban admin
create table if not exists public.messages (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,  -- học viên của cuộc trò chuyện
  from_admin boolean not null default false,
  sender_id uuid not null default auth.uid() references auth.users(id) on delete set null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz default now(),
  read_at timestamptz
);
create index if not exists msg_thread on public.messages(user_id, id);
alter table public.messages enable row level security;
drop policy if exists "msg read" on public.messages;
create policy "msg read" on public.messages for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "msg send" on public.messages;
create policy "msg send" on public.messages for insert with check (
  sender_id = auth.uid() and read_at is null and
  ((not from_admin and user_id = auth.uid()) or (from_admin and public.is_admin())));

-- Có tin mới → tạo thông báo cho bên nhận
create or replace function public.msg_notify() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.from_admin then
    insert into notifications(to_id, kind, title, body, ref) values (new.user_id, 'msg', 'Admin', left(new.body, 140), new.user_id);
  else
    insert into notifications(to_id, kind, title, body, ref)
    select p.id, 'msg', display_name(new.user_id), left(new.body, 140), new.user_id from profiles p where p.is_admin and p.id <> new.user_id;
  end if;
  return new;
end $$;
drop trigger if exists msg_notify on public.messages;
create trigger msg_notify after insert on public.messages for each row execute function public.msg_notify();

-- Đánh dấu đã đọc tin của bên kia trong 1 cuộc trò chuyện
create or replace function public.msg_read(thread uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if thread = auth.uid() then
    update messages set read_at = now() where user_id = thread and from_admin and read_at is null;
  elsif public.is_admin() then
    update messages set read_at = now() where user_id = thread and not from_admin and read_at is null;
  end if;
  update notifications set read_at = now() where to_id = auth.uid() and kind = 'msg' and ref = thread and read_at is null;
end $$;
revoke all on function public.msg_read(uuid) from public, anon;
grant execute on function public.msg_read(uuid) to authenticated;

-- Danh sách cuộc trò chuyện cho admin
create or replace function public.admin_threads()
returns table(user_id uuid, name text, email text, last_body text, last_at timestamptz, last_from_admin boolean, unread int, last_seen timestamptz, activity text)
language sql security definer set search_path = public stable as $$
  select m.user_id, display_name(m.user_id), p.email, m.body, m.created_at, m.from_admin,
    (select count(*)::int from messages x where x.user_id = m.user_id and not x.from_admin and x.read_at is null),
    pr.last_seen, pr.activity
  from (select distinct on (user_id) * from messages order by user_id, id desc) m
  left join profiles p on p.id = m.user_id left join presence pr on pr.user_id = m.user_id
  where public.is_admin()
  order by m.created_at desc limit 200
$$;
revoke all on function public.admin_threads() from public, anon;
grant execute on function public.admin_threads() to authenticated;

-- 5. Bật realtime cho thông báo (để báo ngay khi app đang mở)
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; when undefined_object then null; end $$;
