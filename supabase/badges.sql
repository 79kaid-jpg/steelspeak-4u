-- Huy hiệu của người học (đồng bộ giữa các thiết bị). Chạy 1 lần trong Supabase → SQL Editor. Chạy lại được.
create table if not exists public.user_badges (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  badge text not null check (char_length(badge) <= 40),
  earned_at timestamptz not null default now(),
  primary key (user_id, badge)
);
alter table public.user_badges enable row level security;
drop policy if exists "ub read" on public.user_badges;
create policy "ub read" on public.user_badges for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "ub insert" on public.user_badges;
create policy "ub insert" on public.user_badges for insert with check (user_id = auth.uid());
