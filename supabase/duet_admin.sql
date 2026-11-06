-- Hát nối bài 6: admin xoá người chơi, admin chọn không hát.
-- Chạy một lần trong SQL Editor (sau các file duet_*.sql trước).

-- Admin được xoá người khác khỏi phòng của mình (không tự xoá mình)
drop policy if exists duet_members_kick on public.duet_members;
create policy duet_members_kick on public.duet_members for delete to authenticated
using (
  user_id <> auth.uid()
  and exists (select 1 from public.duet_rooms r where r.id = room_id and r.admin_id = auth.uid())
);

-- Admin có hát hay chỉ điều khiển phòng
alter table public.duet_rooms add column if not exists admin_sings boolean not null default true;
