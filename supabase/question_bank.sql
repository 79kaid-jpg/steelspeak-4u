-- Ngân hàng câu hỏi theo khóa học + báo lỗi câu hỏi
create table if not exists public.question_bank (
  id bigserial primary key,
  track_id uuid not null references public.tracks(id) on delete cascade,
  type text not null check (type in ('mcq','order')),
  prompt text not null,
  options jsonb not null,            -- mcq: các lựa chọn; order: các bước theo ĐÚNG thứ tự
  answer int,                        -- mcq: vị trí đáp án đúng trong options
  explanation text default '',
  cat text,                          -- chủ đề/chương (null = mọi chương)
  level_min int not null default 1,
  status text not null default 'live' check (status in ('draft','live','off')),
  source text not null default 'admin',
  created_by uuid default auth.uid(),
  updated_at timestamptz default now()
);
create index if not exists qb_track on public.question_bank(track_id, status);
alter table public.question_bank enable row level security;
drop policy if exists "qb read live" on public.question_bank;
create policy "qb read live" on public.question_bank for select using (status = 'live' or public.is_admin());
drop policy if exists "qb admin" on public.question_bank;
create policy "qb admin" on public.question_bank for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.question_reports (
  id bigserial primary key,
  track_id uuid references public.tracks(id) on delete cascade,
  level int,
  bank_id bigint references public.question_bank(id) on delete set null,
  question jsonb not null,           -- ảnh chụp câu hỏi lúc báo
  note text default '',
  user_id uuid default auth.uid() references auth.users(id) on delete cascade,
  status text not null default 'open' check (status in ('open','fixed','dismissed')),
  created_at timestamptz default now()
);
alter table public.question_reports enable row level security;
drop policy if exists "qr insert own" on public.question_reports;
create policy "qr insert own" on public.question_reports for insert with check (user_id = auth.uid());
drop policy if exists "qr read" on public.question_reports;
create policy "qr read" on public.question_reports for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "qr admin" on public.question_reports;
create policy "qr admin" on public.question_reports for update using (public.is_admin()) with check (public.is_admin());
