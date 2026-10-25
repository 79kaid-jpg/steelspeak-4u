-- Cài đặt app (admin chọn nhà cung cấp AI)
create table if not exists public.app_settings (key text primary key, value text, updated_at timestamptz default now());
alter table public.app_settings enable row level security;
drop policy if exists "settings read" on public.app_settings;
create policy "settings read" on public.app_settings for select using (auth.role() = 'authenticated');
drop policy if exists "settings admin write" on public.app_settings;
create policy "settings admin write" on public.app_settings for all using (public.is_admin()) with check (public.is_admin());
insert into public.app_settings(key, value) values ('ai_provider', 'groq') on conflict (key) do nothing;
