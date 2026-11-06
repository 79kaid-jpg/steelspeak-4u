-- Hát nối bài 5: mốc bắt đầu mỗi lượt hát, để "hát lại" không tính bản thu cũ.
-- Chạy một lần trong SQL Editor (sau duet.sql).
alter table public.duet_rooms add column if not exists round_at timestamptz;

create or replace function public.duet_round_mark() returns trigger
language plpgsql as $$
begin
  if new.status = 'singing' and old.status is distinct from 'singing' then
    new.round_at := now();   -- giờ của máy chủ, không phụ thuộc đồng hồ điện thoại
  end if;
  return new;
end $$;

drop trigger if exists duet_round_mark on public.duet_rooms;
create trigger duet_round_mark before update on public.duet_rooms
  for each row execute function public.duet_round_mark();
