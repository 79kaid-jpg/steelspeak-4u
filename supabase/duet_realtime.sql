-- Hát nối bài 4: bật realtime cho danh sách người chơi và phân câu.
-- (duet_rooms và duet_takes đã bật từ duet.sql)
alter publication supabase_realtime add table public.duet_members, public.duet_assignments;
