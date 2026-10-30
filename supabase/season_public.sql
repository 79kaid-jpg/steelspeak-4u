-- Cho người chưa đăng nhập đọc được cài đặt giao diện mùa lễ (chỉ dòng 'season')
drop policy if exists "season public read" on public.app_settings;
create policy "season public read" on public.app_settings for select to anon using (key = 'season');
