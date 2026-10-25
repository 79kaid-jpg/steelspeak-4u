-- Bạn bè: chỉ bạn bè mới thấy nhau trên bản đồ Đua level
create table if not exists public.friendships (
  id bigserial primary key,
  requester uuid not null references auth.users(id) on delete cascade,
  addressee uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz default now(),
  unique (requester, addressee), check (requester <> addressee)
);
alter table public.friendships enable row level security;
drop policy if exists "fr read own" on public.friendships;
create policy "fr read own" on public.friendships for select using (auth.uid() in (requester, addressee));

-- Gửi lời mời theo email
create or replace function public.friend_request(email text)
returns text language plpgsql security definer set search_path = public as $$
declare target uuid; ex record;
begin
  if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
  select id into target from profiles where lower(profiles.email) = lower(trim(friend_request.email)) limit 1;
  if target is null then raise exception 'Không tìm thấy tài khoản với email này'; end if;
  if target = auth.uid() then raise exception 'Không thể tự kết bạn với chính mình'; end if;
  select * into ex from friendships where (requester = auth.uid() and addressee = target) or (requester = target and addressee = auth.uid());
  if found then
    if ex.status = 'accepted' then return 'already'; end if;
    if ex.addressee = auth.uid() then update friendships set status = 'accepted' where id = ex.id; return 'accepted'; end if;
    return 'pending';
  end if;
  insert into friendships(requester, addressee) values (auth.uid(), target);
  return 'sent';
end $$;

create or replace function public.friend_respond(fid bigint, accept boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if accept then update friendships set status = 'accepted' where id = fid and addressee = auth.uid() and status = 'pending';
  else delete from friendships where id = fid and auth.uid() in (requester, addressee); end if;
end $$;

-- Danh sách bạn + lời mời, kèm level cao nhất đã mở trong khóa
create or replace function public.my_friends(track uuid default null)
returns table(fid bigint, user_id uuid, name text, email text, avatar text, status text, incoming boolean, max_level int)
language sql security definer set search_path = public stable as $$
  with tr as (select coalesce(track, (select id from tracks where slug = 'steel')) as id)
  select f.id, o.uid, coalesce(nullif(p.full_name,''), split_part(p.email,'@',1)), p.email, p.avatar, f.status,
         f.addressee = auth.uid(),
         (select coalesce(max(s.level + 1), 1)::int from saga_scores s, tr where s.user_id = o.uid and s.track_id = tr.id and s.stars >= 1)
  from friendships f
  cross join lateral (select case when f.requester = auth.uid() then f.addressee else f.requester end as uid) o
  left join profiles p on p.id = o.uid
  where auth.uid() in (f.requester, f.addressee)
  order by f.status, 3;
$$;
revoke all on function public.friend_request(text), public.friend_respond(bigint, boolean), public.my_friends(uuid) from public, anon;
grant execute on function public.friend_request(text), public.friend_respond(bigint, boolean), public.my_friends(uuid) to authenticated;
