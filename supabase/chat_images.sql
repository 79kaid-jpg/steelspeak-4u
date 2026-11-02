-- Gửi hình / sticker trong chat. Chạy 1 lần trong Supabase → SQL Editor (sau messaging.sql).
-- Hình lưu ở bucket công khai 'chat-images', thư mục = id cuộc trò chuyện (id học viên). Tên file ngẫu nhiên nên không đoán được.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-images', 'chat-images', true, 5242880, array['image/webp','image/png','image/jpeg','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/webp','image/png','image/jpeg','image/gif'];

drop policy if exists "chat img insert" on storage.objects;
drop policy if exists "chat img delete" on storage.objects;
create policy "chat img insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'chat-images' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "chat img delete" on storage.objects for delete to authenticated
  using (bucket_id = 'chat-images' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
