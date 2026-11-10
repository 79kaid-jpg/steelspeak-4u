-- Hệ thống: ghi lỗi từ máy người dùng + kiểm tra tình trạng database. Tự chạy qua GitHub Action (run-sql.yml).
create table if not exists public.app_errors (
  id bigserial primary key,
  at timestamptz not null default now(),
  user_id uuid default auth.uid(),
  ver text, tab text, msg text, stack text, ua text
);
create index if not exists app_errors_at on public.app_errors(at desc);
alter table public.app_errors enable row level security;
drop policy if exists "err insert" on public.app_errors;
drop policy if exists "err admin read" on public.app_errors;
drop policy if exists "err admin delete" on public.app_errors;
create policy "err insert" on public.app_errors for insert to anon, authenticated
  with check (length(coalesce(msg,'')) <= 600 and length(coalesce(stack,'')) <= 2000 and length(coalesce(ua,'')) <= 300 and length(coalesce(tab,'')) <= 40 and length(coalesce(ver,'')) <= 40);
create policy "err admin read" on public.app_errors for select to authenticated using (public.is_admin());
create policy "err admin delete" on public.app_errors for delete to authenticated using (public.is_admin());

-- Tình trạng: các bảng/hàm mà tính năng của app cần, có hay chưa (chỉ admin)
create or replace function public.sys_health()
returns table(feature text, object text, ok boolean)
language sql security definer set search_path = public stable as $$
  with need(feature, object, kind) as (values
    ('Nền tảng','tracks','t'),('Nền tảng','enrollments','t'),('Nền tảng','words','t'),
    ('Tin nhắn','messages','t'),('Tin nhắn','notifications','t'),('Tin nhắn','admin_threads','f'),('Gửi hình chat','chat-images','b'),
    ('Thách đấu','challenges','t'),('Thách đấu (admin đấu mọi học viên)','challenge_targets','f'),
    ('Nước Dâng','flood_matches','t'),('Nước Dâng · chọn khóa','flood_courses','f'),
    ('Vòng quay','lucky_spins','t'),('Vòng quay','lucky_winners','f'),
    ('Huy hiệu','badges','t'),('Lời chúc sinh nhật','greetings','t'),
    ('Bài học chủ đề','topic_lessons','t'),('Ghi lỗi','app_errors','t'))
  select n.feature, n.object,
    case n.kind when 't' then to_regclass('public.'||n.object) is not null
                when 'f' then exists(select 1 from pg_proc p join pg_namespace s on s.oid=p.pronamespace where s.nspname='public' and p.proname=n.object)
                else exists(select 1 from storage.buckets b where b.id=n.object) end
  from need n where public.is_admin()
$$;
revoke all on function public.sys_health() from public, anon;
grant execute on function public.sys_health() to authenticated;
