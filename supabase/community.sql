-- ============================================================
-- Góp từ cộng đồng: người học đề xuất từ, AI chấm level, bình chọn, admin duyệt
-- Chạy SAU platform.sql
-- ============================================================
alter table public.tracks add column if not exists vote_threshold int not null default 3;

create table if not exists public.word_suggestions (
  id bigserial primary key,
  track_id uuid not null references public.tracks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  term text not null,
  meaning_vi text not null default '',
  example text default '',
  example_vi text default '',
  cat text default '',            -- chủ đề (chuyên ngành) hoặc bậc CEFR
  user_level text not null,       -- level người học đề nghị: '1'..'5' (chuyên ngành) hoặc 'A1'..'C2'
  ai_level text,                  -- level AI đề xuất
  ai_valid boolean,               -- AI xác nhận từ hợp lệ và đúng ngành
  ai_note text default '',
  ai_meaning text default '',
  status text not null default 'voting' check (status in ('voting','needs_admin','approved','rejected')),
  up int not null default 0,
  down int not null default 0,
  decided_by text default '',     -- 'ai' | 'admin' | 'votes'
  word_id bigint,
  created_at timestamptz default now()
);
create index if not exists ws_track on public.word_suggestions(track_id, status, created_at desc);
alter table public.word_suggestions enable row level security;
drop policy if exists "ws read" on public.word_suggestions;
create policy "ws read" on public.word_suggestions for select using (public.is_admin() or public.is_enrolled(track_id) or user_id = auth.uid());
-- Ghi chỉ qua máy chủ (Edge Function "suggest") và các hàm bên dưới

create table if not exists public.word_votes (
  suggestion_id bigint references public.word_suggestions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  vote smallint not null check (vote in (-1, 1)),
  created_at timestamptz default now(),
  primary key (suggestion_id, user_id)
);
alter table public.word_votes enable row level security;
drop policy if exists "wv own read" on public.word_votes;
create policy "wv own read" on public.word_votes for select using (user_id = auth.uid() or public.is_admin());

-- Đổi level đề nghị thành điểm độ khó 0–100
create or replace function public.level_to_difficulty(l text) returns numeric language sql immutable as $$
  select case l when 'A1' then 10 when 'A2' then 25 when 'B1' then 45 when 'B2' then 60 when 'C1' then 78 when 'C2' then 92
    else least(100, greatest(0, coalesce(nullif(l,'')::numeric, 3) * 20 - 10)) end
$$;

-- Thêm từ đã duyệt vào kho
create or replace function public._accept_suggestion(sid bigint, final_level text, final_cat text, final_meaning text, by_who text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s word_suggestions; t tracks; wid bigint; o int;
begin
  select * into s from word_suggestions where id = sid for update;
  select * into t from tracks where id = s.track_id;
  select coalesce(max(ord), 0) + 1 into o from words where track_id = s.track_id;
  insert into words(track_id, term, meaning_vi, example, example_vi, cat, cefr, difficulty, ord, status, source)
  values (s.track_id, s.term, coalesce(nullif(final_meaning,''), s.meaning_vi), s.example, s.example_vi,
          coalesce(nullif(final_cat,''), case when t.kind = 'cefr' then final_level else s.cat end),
          case when t.kind = 'cefr' then final_level else '' end,
          level_to_difficulty(final_level), o, 'approved', 'community')
  on conflict (track_id, lower(term)) do nothing
  returning id into wid;
  update word_suggestions set status = 'approved', decided_by = by_who, word_id = wid,
    user_level = case when by_who = 'admin' then final_level else user_level end where id = sid;
  return wid;
end $$;
revoke all on function public._accept_suggestion(bigint,text,text,text,text) from public, anon, authenticated;
grant execute on function public._accept_suggestion(bigint,text,text,text,text) to service_role;

-- Bình chọn: chỉ người đã tham gia khóa, không tự bình chọn từ của mình
create or replace function public.vote_suggestion(sid bigint, v int)
returns table(up int, down int, status text) language plpgsql security definer set search_path = public as $$
declare s word_suggestions; th int;
begin
  select * into s from word_suggestions where id = sid;
  if s.id is null then raise exception 'Không tìm thấy từ'; end if;
  if s.status <> 'voting' then raise exception 'Từ này đã kết thúc bình chọn'; end if;
  if not public.is_enrolled(s.track_id) then raise exception 'Bạn chưa tham gia khóa học này'; end if;
  if s.user_id = auth.uid() then raise exception 'Không tự bình chọn từ của mình'; end if;
  if v not in (-1, 1) then raise exception 'Phiếu không hợp lệ'; end if;
  insert into word_votes(suggestion_id, user_id, vote) values (sid, auth.uid(), v)
  on conflict (suggestion_id, user_id) do update set vote = excluded.vote, created_at = now();
  update word_suggestions ws set
    up = (select count(*) from word_votes where suggestion_id = sid and vote = 1),
    down = (select count(*) from word_votes where suggestion_id = sid and vote = -1)
  where ws.id = sid returning * into s;
  select vote_threshold into th from tracks where id = s.track_id;
  if s.up - s.down >= th then update word_suggestions set status = 'needs_admin', decided_by = 'votes' where id = sid;
  elsif s.down - s.up >= th then update word_suggestions set status = 'rejected', decided_by = 'votes' where id = sid;
  end if;
  return query select ws.up, ws.down, ws.status from word_suggestions ws where ws.id = sid;
end $$;
revoke all on function public.vote_suggestion(bigint,int) from public, anon;
grant execute on function public.vote_suggestion(bigint,int) to authenticated;

-- Admin duyệt / từ chối
create or replace function public.admin_review_suggestion(sid bigint, approve boolean, final_level text default null, final_meaning text default null)
returns void language plpgsql security definer set search_path = public as $$
declare s word_suggestions;
begin
  if not public.is_admin() then raise exception 'Bạn không có quyền admin'; end if;
  select * into s from word_suggestions where id = sid;
  if approve then perform public._accept_suggestion(sid, coalesce(final_level, s.ai_level, s.user_level), null, final_meaning, 'admin');
  else update word_suggestions set status = 'rejected', decided_by = 'admin' where id = sid; end if;
end $$;
revoke all on function public.admin_review_suggestion(bigint,boolean,text,text) from public, anon;
grant execute on function public.admin_review_suggestion(bigint,boolean,text,text) to authenticated;

-- Danh sách góp từ kèm tên người góp và phiếu của tôi
create or replace function public.list_suggestions(track uuid, st text default 'voting')
returns table(id bigint, term text, meaning_vi text, example text, cat text, user_level text, ai_level text, ai_valid boolean, ai_note text,
              status text, up int, down int, created_at timestamptz, author text, mine boolean, my_vote int)
language sql security definer set search_path = public stable as $$
  select s.id, s.term, s.meaning_vi, s.example, s.cat, s.user_level, s.ai_level, s.ai_valid, s.ai_note, s.status, s.up, s.down, s.created_at,
         coalesce(nullif(p.full_name,''), split_part(p.email,'@',1)), s.user_id = auth.uid(),
         (select vote from word_votes v where v.suggestion_id = s.id and v.user_id = auth.uid())
  from word_suggestions s left join profiles p on p.id = s.user_id
  where s.track_id = track and (public.is_admin() or public.is_enrolled(track))
    and (st = 'all' or s.status = st or (st = 'mine' and s.user_id = auth.uid()))
  order by s.created_at desc limit 200
$$;
revoke all on function public.list_suggestions(uuid,text) from public, anon;
grant execute on function public.list_suggestions(uuid,text) to authenticated;
