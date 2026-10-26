-- Tủ sách riêng: mỗi người chỉ đọc/ghi được file trong thư mục mang id của chính mình.
-- Chạy 1 lần trong Supabase → SQL Editor.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('private-books', 'private-books', false, 52428800, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 52428800, allowed_mime_types = array['application/pdf'];

drop policy if exists "private books: owner read"   on storage.objects;
drop policy if exists "private books: owner insert" on storage.objects;
drop policy if exists "private books: owner delete" on storage.objects;

create policy "private books: owner read" on storage.objects for select to authenticated
  using (bucket_id = 'private-books' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "private books: owner insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'private-books' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "private books: owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'private-books' and (storage.foldername(name))[1] = auth.uid()::text);
