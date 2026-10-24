-- Chạy 1 lần trong Supabase > SQL Editor
create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.progress enable row level security;
create policy "own row select" on public.progress for select using (auth.uid() = user_id);
create policy "own row insert" on public.progress for insert with check (auth.uid() = user_id);
create policy "own row update" on public.progress for update using (auth.uid() = user_id);

-- Đếm lượt gọi AI mỗi ngày để giữ trong hạn mức miễn phí
create table if not exists public.ai_usage (
  user_id uuid references auth.users(id) on delete cascade,
  day date not null default current_date,
  n int not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security; -- chỉ Edge Function (service role) được ghi
