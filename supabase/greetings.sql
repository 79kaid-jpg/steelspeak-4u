-- Lời chúc đặc biệt (sinh nhật…) hiện cho đúng một tài khoản vào đúng ngày
create table if not exists public.greetings(
  id bigserial primary key,
  to_email text not null,
  show_on date not null,
  show_until date,       -- hiện đến hết ngày này (trống = chỉ 1 ngày)
  from_name text not null default 'SteelSpeak',
  title text not null default 'Happy Birthday',
  name text,
  message text not null,
  image text,            -- data URL, chỉ người nhận & admin đọc được
  created_at timestamptz default now()
);
alter table public.greetings enable row level security;
drop policy if exists "greet read" on public.greetings;
create policy "greet read" on public.greetings for select using (lower(to_email)=lower(auth.jwt()->>'email') or public.is_admin());
drop policy if exists "greet admin" on public.greetings;
create policy "greet admin" on public.greetings for all using (public.is_admin()) with check (public.is_admin());
alter table public.greetings add column if not exists show_until date;
