-- Chạy 1 lần trong Supabase > SQL Editor (sau schema.sql)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text default '',
  role text default 'TPL',
  department text default '',
  is_admin boolean not null default false,
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;

create policy "profile select own" on public.profiles for select using (auth.uid() = id);
create policy "profile insert own" on public.profiles for insert with check (auth.uid() = id and is_admin = false);
-- Người dùng sửa được hồ sơ của mình nhưng KHÔNG tự cấp quyền admin
create policy "profile update own" on public.profiles for update using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid()));

-- Tự tạo hồ sơ khi có tài khoản mới
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role, department)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name',''),
          coalesce(new.raw_user_meta_data->>'role','TPL'),
          coalesce(new.raw_user_meta_data->>'department',''))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Tạo hồ sơ cho các tài khoản đã có từ trước
insert into public.profiles (id, email) select id, email from auth.users on conflict (id) do nothing;

-- CẤP QUYỀN ADMIN ĐẦU TIÊN: đổi email bên dưới thành email của bạn rồi chạy
update public.profiles set is_admin = true where email = 'email-cua-ban@gmail.com';
