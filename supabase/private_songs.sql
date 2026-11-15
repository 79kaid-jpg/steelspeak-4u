-- Học theo bài hát riêng: admin tải MP3 + lời, khớp thời gian từng câu, chia sẻ cho người được chọn.
-- Nhạc lưu ở bucket RIÊNG TƯ 'psong' (không có link công khai), thư mục = id bài hát; chỉ admin và người được chia sẻ mới mở được (link ký 1 giờ).
create table if not exists public.private_songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text default '',
  audio_path text,
  lines jsonb not null default '[]'::jsonb,   -- [{en, vi, t (giây bắt đầu), words:[[en,vi]], skip:bool}]
  share_with uuid[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.private_songs enable row level security;
drop policy if exists "psong admin" on public.private_songs;
create policy "psong admin" on public.private_songs for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "psong shared read" on public.private_songs;
create policy "psong shared read" on public.private_songs for select using (auth.uid() = any(share_with));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('psong','psong',false,31457280,array['audio/mpeg','audio/mp3','audio/mp4','audio/x-m4a','audio/aac','audio/wav','audio/x-wav'])
on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "psong obj admin" on storage.objects;
create policy "psong obj admin" on storage.objects for all
  using (bucket_id='psong' and public.is_admin()) with check (bucket_id='psong' and public.is_admin());
drop policy if exists "psong obj shared" on storage.objects;
create policy "psong obj shared" on storage.objects for select
  using (bucket_id='psong' and exists (select 1 from public.private_songs s where s.id::text=(storage.foldername(name))[1] and auth.uid() = any(s.share_with)));

-- danh sách học viên để admin chọn người được chia sẻ
create or replace function public.psong_people() returns table(id uuid, name text, email text)
language sql security definer set search_path=public as $$
  select p.id, coalesce(nullif(p.full_name,''),p.email), p.email from profiles p where public.is_admin() order by 2 $$;
grant execute on function public.psong_people() to authenticated;
