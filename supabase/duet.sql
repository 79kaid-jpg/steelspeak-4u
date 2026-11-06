-- ===== BƯỚC 1: gỡ bản cũ (tên rooms, members...) vừa chạy nhầm tên =====
-- Chỉ xoá các bảng/hàm của Hát nối, không đụng bảng khác của SteelSpeak.
drop view if exists public.room_scores;
drop table if exists public.takes, public.assignments, public.lines,
  public.members, public.songs, public.rooms cascade;
drop function if exists public.join_room(text, text);
drop function if exists public.add_admin_member() cascade;
drop function if exists public.is_member(uuid) cascade;
drop policy if exists hatnoi_read on storage.objects;
drop policy if exists hatnoi_upload_own on storage.objects;
drop policy if exists hatnoi_update_own on storage.objects;
drop policy if exists hatnoi_delete_own on storage.objects;

-- ===== BƯỚC 2: tạo lại với tiền tố duet_ =====
-- Hát nối (duet) cho SteelSpeak

create table public.duet_rooms (
  id          uuid primary key default gen_random_uuid(),
  code        char(6) not null unique,                 -- mã phòng 6 số
  name        text not null,
  admin_id    uuid not null references auth.users(id) on delete cascade,
  song_id     uuid,                                    -- bài đang chọn
  status      text not null default 'waiting'
              check (status in ('waiting','singing','mixing','done')),
  current_line int not null default 0,                 -- câu đang đến lượt
  mix_path    text,                                    -- file ráp toàn bài trong Storage
  created_at  timestamptz not null default now()
);

create table public.duet_members (
  room_id   uuid not null references public.duet_rooms(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  slot      char(1) not null,                          -- A, B, C...
  nickname  text not null,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id),
  unique (room_id, slot)
);

create table public.duet_songs (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid references public.duet_rooms(id) on delete cascade, -- null = bài dùng chung
  title       text not null,
  source      text not null check (source in ('upload','youtube','ai','public_domain')),
  level       text,                                    -- A1..C1
  original_path text,                                  -- audio gốc (Storage)
  beat_path   text,                                    -- beat đã tách giọng
  status      text not null default 'processing'
              check (status in ('processing','ready','failed')),
  created_at  timestamptz not null default now()
);

alter table public.duet_rooms
  add constraint duet_rooms_song_fk foreign key (song_id) references public.duet_songs(id) on delete set null;

create table public.duet_lines (
  id        uuid primary key default gen_random_uuid(),
  song_id   uuid not null references public.duet_songs(id) on delete cascade,
  idx       int not null,                              -- thứ tự câu, từ 1
  text      text not null,
  text_vi   text,                                      -- nghĩa tiếng Việt
  start_ms  int not null,
  end_ms    int not null check (end_ms > start_ms),
  unique (song_id, idx)
);

-- Ai hát câu nào trong từng phòng (null user_id = cả nhóm)
create table public.duet_assignments (
  room_id uuid not null references public.duet_rooms(id) on delete cascade,
  line_id uuid not null references public.duet_lines(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  primary key (room_id, line_id)
);

create table public.duet_takes (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid not null references public.duet_rooms(id) on delete cascade,
  line_id       uuid not null references public.duet_lines(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  audio_path    text not null,                         -- đoạn thu (Storage)
  offset_ms     int not null default 0,                -- độ lệch sau khi căn nhịp
  score_total   numeric(5,2),
  score_words   numeric(5,2),                          -- lời + phát âm
  score_pitch   numeric(5,2),
  score_timing  numeric(5,2),
  wrong_words   text[] not null default '{}',
  created_at    timestamptz not null default now()
);
create index duet_takes_room_idx on public.duet_takes(room_id, line_id);

-- Bảng điểm từng người trong phòng
create view public.duet_room_scores with (security_invoker = true) as
select t.room_id, t.user_id, m.nickname, m.slot,
       round(avg(t.score_total), 1) as avg_score,
       count(*) as lines_sung,
       array_agg(distinct w) filter (where w is not null) as words_to_practice
from public.duet_takes t
join public.duet_members m on m.room_id = t.room_id and m.user_id = t.user_id
left join lateral unnest(t.wrong_words) w on true
group by t.room_id, t.user_id, m.nickname, m.slot;

-- ===== Bảo mật: chỉ thành viên phòng mới thấy dữ liệu phòng =====
create function public.duet_is_member(r uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from duet_members where room_id = r and user_id = auth.uid());
$$;

alter table public.duet_rooms       enable row level security;
alter table public.duet_members     enable row level security;
alter table public.duet_songs       enable row level security;
alter table public.duet_lines       enable row level security;
alter table public.duet_assignments enable row level security;
alter table public.duet_takes       enable row level security;

create policy duet_rooms_read   on public.duet_rooms for select using (public.duet_is_member(id) or admin_id = auth.uid());
create policy duet_rooms_create on public.duet_rooms for insert with check (admin_id = auth.uid());
create policy duet_rooms_admin  on public.duet_rooms for update using (admin_id = auth.uid());

-- Vào phòng bằng mã: app gọi hàm duet_join_room thay vì insert trực tiếp
create policy duet_members_read  on public.duet_members for select using (public.duet_is_member(room_id));
create policy duet_members_leave on public.duet_members for delete using (user_id = auth.uid());

create policy duet_songs_read  on public.duet_songs for select using (room_id is null or public.duet_is_member(room_id));
create policy duet_songs_add   on public.duet_songs for insert with check (public.duet_is_member(room_id));

create policy duet_lines_read  on public.duet_lines for select using (
  exists (select 1 from duet_songs s where s.id = song_id and (s.room_id is null or public.duet_is_member(s.room_id))));

create policy duet_assign_read  on public.duet_assignments for select using (public.duet_is_member(room_id));
create policy duet_assign_admin on public.duet_assignments for all using (
  exists (select 1 from duet_rooms r where r.id = room_id and r.admin_id = auth.uid()));

create policy duet_takes_read  on public.duet_takes for select using (public.duet_is_member(room_id));
create policy duet_takes_add   on public.duet_takes for insert with check (user_id = auth.uid() and public.duet_is_member(room_id));

create function public.duet_join_room(p_code text, p_nickname text) returns uuid
language plpgsql security definer set search_path = public as $$
declare r uuid; s char(1);
begin
  select id into r from duet_rooms where code = p_code;
  if r is null then raise exception 'Mã phòng không đúng'; end if;
  if exists (select 1 from duet_members where room_id = r and user_id = auth.uid()) then return r; end if;
  select chr(65 + count(*)::int) into s from duet_members where room_id = r;
  if s > 'F' then raise exception 'Phòng đã đủ 6 người'; end if;
  insert into duet_members(room_id, user_id, slot, nickname) values (r, auth.uid(), s, p_nickname);
  return r;
end $$;

-- Admin tạo phòng xong thì tự thành thành viên A
create function public.duet_add_admin_member() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into duet_members(room_id, user_id, slot, nickname) values (new.id, new.admin_id, 'A', 'Admin');
  return new;
end $$;
create trigger duet_rooms_admin_member after insert on public.duet_rooms
  for each row execute function public.duet_add_admin_member();

-- Đồng bộ trực tiếp "đến lượt ai" và điểm mới
alter publication supabase_realtime add table public.duet_rooms, public.duet_takes;

-- Storage: tạo bucket riêng tư 'duet' (audio gốc, beat, đoạn thu, bản ráp)
insert into storage.buckets (id, name, public) values ('duet', 'duet', false)
  on conflict (id) do nothing;
-- Hát nối: quyền cho bucket 'duet' (cùng file này).
-- Đường dẫn file quy ước: <room_id>/<user_id>/<tên file>
--   ví dụ: 7f3c.../a91b.../line-02.webm
-- Bản ráp toàn bài:      <room_id>/mix/<tên file>

-- Thành viên phòng được nghe mọi file trong thư mục phòng
create policy duet_storage_read on storage.objects for select to authenticated
using (
  bucket_id = 'duet'
  and public.duet_is_member(((storage.foldername(name))[1])::uuid)
);

-- Mỗi người chỉ tải lên vào thư mục của chính mình, trong phòng mình là thành viên
create policy duet_storage_upload_own on storage.objects for insert to authenticated
with check (
  bucket_id = 'duet'
  and public.duet_is_member(((storage.foldername(name))[1])::uuid)
  and (
    (storage.foldername(name))[2] = auth.uid()::text
    or (storage.foldername(name))[2] = 'mix'
  )
);

-- Cho phép ghi đè (thu lại câu) và xoá file của chính mình
create policy duet_storage_update_own on storage.objects for update to authenticated
using (bucket_id = 'duet' and owner = auth.uid());

create policy duet_storage_delete_own on storage.objects for delete to authenticated
using (bucket_id = 'duet' and owner = auth.uid());

-- Thành viên phòng được thêm bài và câu cho phòng mình (bản MVP: dán lời thủ công)
create policy duet_lines_add on public.duet_lines for insert to authenticated
with check (
  exists (select 1 from public.duet_songs s
          where s.id = song_id and s.room_id is not null and public.duet_is_member(s.room_id))
);

-- Bản MVP chưa có server tách beat: bài dán lời coi như sẵn sàng
create policy duet_songs_update on public.duet_songs for update to authenticated
using (room_id is not null and public.duet_is_member(room_id));
