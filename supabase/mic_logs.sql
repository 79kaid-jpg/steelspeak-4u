-- Ghi lại lỗi micro của người dùng để admin biết nguyên nhân (máy, trình duyệt, tên lỗi)
create table if not exists public.mic_logs(
  id bigint generated always as identity primary key,
  user_id uuid default auth.uid(),
  message text,
  meta jsonb,
  created_at timestamptz not null default now()
);
alter table public.mic_logs enable row level security;
drop policy if exists "mic log insert" on public.mic_logs;
create policy "mic log insert" on public.mic_logs for insert to anon, authenticated with check (true);
drop policy if exists "mic log admin read" on public.mic_logs;
create policy "mic log admin read" on public.mic_logs for select to authenticated using (public.is_admin());
