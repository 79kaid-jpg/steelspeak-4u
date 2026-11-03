-- Admin thách đấu được mọi người dùng, kể cả khi họ không online (họ nhận thông báo khi mở app).
-- Chạy SAU challenges.sql và messaging.sql. Chạy lại được.
drop function if exists public.challenge_targets();
create or replace function public.challenge_targets()
returns table(user_id uuid, name text, avatar text, is_admin boolean, is_friend boolean, online boolean, last_seen timestamptz)
language sql security definer set search_path = public stable as $$
  select p.id, coalesce(nullif(p.full_name,''), split_part(p.email,'@',1)), p.avatar, p.is_admin,
         exists(select 1 from friendships f where f.status='accepted' and ((f.requester=auth.uid() and f.addressee=p.id) or (f.addressee=auth.uid() and f.requester=p.id))),
         coalesce(pr.last_seen > now() - interval '3 minutes', false), pr.last_seen
  from profiles p left join presence pr on pr.user_id = p.id
  where p.id <> auth.uid() and (
    public.is_admin() or p.is_admin
    or exists(select 1 from friendships f where f.status='accepted' and ((f.requester=auth.uid() and f.addressee=p.id) or (f.addressee=auth.uid() and f.requester=p.id))))
  order by p.is_admin desc, coalesce(pr.last_seen > now() - interval '3 minutes', false) desc, pr.last_seen desc nulls last, 2
$$;
grant execute on function public.challenge_targets() to authenticated;
