-- Bài thi lên level & chứng chỉ
create table if not exists public.exam_attempts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete cascade,
  chapter int not null,
  seed text not null,
  started_at timestamptz default now(),
  submitted_at timestamptz,
  correct int, total int, ms int,
  passed boolean
);
create index if not exists exam_att_user on public.exam_attempts(user_id, track_id, chapter);
alter table public.exam_attempts enable row level security;
drop policy if exists "ea own read" on public.exam_attempts;
create policy "ea own read" on public.exam_attempts for select using (user_id = auth.uid() or public.is_admin());

create table if not exists public.certificates (
  id bigserial primary key,
  code text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete cascade,
  chapter int not null,
  level_name text not null,
  track_name text not null,
  holder_name text not null,
  score int not null,
  issued_at timestamptz default now(),
  unique (user_id, track_id, chapter)
);
alter table public.certificates enable row level security;
drop policy if exists "cert own read" on public.certificates;
create policy "cert own read" on public.certificates for select using (user_id = auth.uid() or public.is_admin());

-- Ai cũng kiểm tra được chứng chỉ bằng mã (không lộ email)
create or replace function public.cert_verify(code text)
returns table(code text, holder_name text, track_name text, level_name text, score int, issued_at timestamptz)
language sql security definer set search_path = public stable as $$
  select c.code, c.holder_name, c.track_name, c.level_name, c.score, c.issued_at from certificates c where c.code = upper(trim(cert_verify.code));
$$;
grant execute on function public.cert_verify(text) to anon, authenticated;
