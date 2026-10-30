-- Lưu quà trúng từ vòng quay sinh nhật để admin xem
create table if not exists public.gift_claims(
  id bigint generated always as identity primary key,
  greeting_id bigint references public.greetings(id) on delete cascade,
  user_email text not null,
  prizes jsonb not null default '[]',
  created_at timestamptz not null default now()
);
alter table public.gift_claims enable row level security;
drop policy if exists "claim insert own" on public.gift_claims;
create policy "claim insert own" on public.gift_claims for insert to authenticated
  with check (lower(user_email) = lower(auth.jwt()->>'email'));
drop policy if exists "claim read" on public.gift_claims;
create policy "claim read" on public.gift_claims for select to authenticated
  using (public.is_admin() or lower(user_email) = lower(auth.jwt()->>'email'));
