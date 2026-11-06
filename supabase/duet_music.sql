-- Hát nối – phần nhạc: độ lệch giữa bản beat và bản có lời, và cho admin chỉnh mốc câu.
-- Chạy một lần trong SQL Editor (sau duet.sql và duet_round.sql).
alter table public.duet_songs add column if not exists beat_offset_ms int not null default 0;

drop policy if exists duet_lines_update on public.duet_lines;
create policy duet_lines_update on public.duet_lines for update to authenticated
using (
  exists (select 1 from public.duet_songs s join public.duet_rooms r on r.id = s.room_id
          where s.id = song_id and r.admin_id = auth.uid())
);
