-- Bài học chủ đề (truyện ngắn 4 phần) do người học tạo và chia sẻ cho khóa; admin duyệt trước khi hiện.
-- Chạy 1 lần trong Supabase → SQL Editor. Cần chạy platform.sql trước (bảng tracks, hàm is_admin).
create table if not exists public.topic_lessons (
  id bigserial primary key,
  track_id uuid not null references public.tracks(id) on delete cascade,
  title text not null,
  level text default '',
  data jsonb not null,
  status text not null default 'pending' check (status in ('pending','live','rejected')),
  note text default '',
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  author text default '',
  created_at timestamptz default now(),
  reviewed_at timestamptz
);
create index if not exists topic_lessons_track on public.topic_lessons(track_id, status, id desc);
alter table public.topic_lessons enable row level security;
drop policy if exists "tl read" on public.topic_lessons;
create policy "tl read" on public.topic_lessons for select using (status = 'live' or created_by = auth.uid() or public.is_admin());
drop policy if exists "tl insert" on public.topic_lessons;
create policy "tl insert" on public.topic_lessons for insert with check (created_by = auth.uid() and status = 'pending' and pg_column_size(data) < 200000);
drop policy if exists "tl admin" on public.topic_lessons;
create policy "tl admin" on public.topic_lessons for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "tl del" on public.topic_lessons;
create policy "tl del" on public.topic_lessons for delete using (public.is_admin() or created_by = auth.uid());
