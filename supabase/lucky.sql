-- Vòng quay may mắn theo mùa: admin tạo chiến dịch, chọn quà + tỉ lệ; học viên nhận lượt khi học và quay.
-- Kết quả quay do MÁY CHỦ chọn (không gian lận được tỉ lệ). Chạy 1 lần trong Supabase → SQL Editor,
-- sau profiles.sql và messaging.sql. Chạy lại được.

create table if not exists public.lucky_campaigns (
  id bigserial primary key,
  name text not null default 'Vòng quay may mắn',
  season text not null default 'xmas',            -- xmas | tet | bday | star | daily
  starts_on date not null default current_date,
  ends_on date not null default (current_date + 30),
  active boolean not null default false,
  earn jsonb not null default '{"lesson":1,"streak7":2,"kaka":1}',
  daily_max int not null default 3 check (daily_max between 1 and 20),
  pickup text not null default '',                -- nơi/cách nhận quà
  created_at timestamptz default now()
);
create table if not exists public.lucky_prizes (
  id bigserial primary key,
  campaign_id bigint not null references public.lucky_campaigns(id) on delete cascade,
  gift text not null default 'custom',            -- mã ảnh trong bộ quà (vd 'candy'), hoặc 'none' = chúc may mắn lần sau
  name text not null,
  value int not null default 0,                   -- giá trị ước tính (đồng)
  rate numeric(5,2) not null default 0 check (rate >= 0 and rate <= 100),
  stock int,                                      -- null = không giới hạn
  given int not null default 0,
  sort int not null default 0
);
create index if not exists lp_c on public.lucky_prizes(campaign_id, sort);
create table if not exists public.lucky_wallet (
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id bigint not null references public.lucky_campaigns(id) on delete cascade,
  tickets int not null default 0,
  primary key (user_id, campaign_id)
);
create table if not exists public.lucky_grants (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id bigint not null references public.lucky_campaigns(id) on delete cascade,
  reason text not null, n int not null, day date not null default current_date,
  created_at timestamptz default now()
);
create index if not exists lg_u on public.lucky_grants(user_id, campaign_id, day);
create table if not exists public.lucky_spins (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id bigint not null references public.lucky_campaigns(id) on delete cascade,
  prize_id bigint references public.lucky_prizes(id) on delete set null,
  gift text, name text, value int,
  code text,
  delivered boolean not null default false,
  created_at timestamptz default now()
);
create index if not exists ls_u on public.lucky_spins(user_id, id desc);
create index if not exists ls_c on public.lucky_spins(campaign_id, id desc);

alter table public.lucky_campaigns enable row level security;
alter table public.lucky_prizes enable row level security;
alter table public.lucky_wallet enable row level security;
alter table public.lucky_grants enable row level security;
alter table public.lucky_spins enable row level security;
drop function if exists public.lucky_grant(text);
drop policy if exists "lc read" on public.lucky_campaigns;  create policy "lc read" on public.lucky_campaigns for select using (auth.role() = 'authenticated');
drop policy if exists "lc admin" on public.lucky_campaigns; create policy "lc admin" on public.lucky_campaigns for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "lp read" on public.lucky_prizes;     create policy "lp read" on public.lucky_prizes for select using (auth.role() = 'authenticated');
drop policy if exists "lp admin" on public.lucky_prizes;    create policy "lp admin" on public.lucky_prizes for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "lw own" on public.lucky_wallet;      create policy "lw own" on public.lucky_wallet for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "lg own" on public.lucky_grants;      create policy "lg own" on public.lucky_grants for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "ls own" on public.lucky_spins;       create policy "ls own" on public.lucky_spins for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "ls admin" on public.lucky_spins;     create policy "ls admin" on public.lucky_spins for update using (public.is_admin()) with check (public.is_admin());

create or replace function public.lucky_current() returns public.lucky_campaigns
language sql security definer set search_path = public stable as $$
  select * from lucky_campaigns where active and current_date between starts_on and ends_on order by id desc limit 1
$$;

-- Nhận lượt quay. why: lesson | streak7 | kaka. Giới hạn: tổng lượt nhận trong ngày ≤ daily_max;
-- streak7 tối đa 1 lần / 7 ngày; mỗi lần gọi cách nhau ≥ 20 giây.
create or replace function public.lucky_grant(why text)
returns int language plpgsql security definer set search_path = public as $$
declare c lucky_campaigns; n int; today_n int; t int;
begin
  if auth.uid() is null then return null; end if;
  select * into c from lucky_current(); if c.id is null then return null; end if;
  n := coalesce((c.earn->>why)::int, 0); if n <= 0 then return null; end if;
  if exists(select 1 from lucky_grants g where g.user_id = auth.uid() and g.campaign_id = c.id and g.created_at > now() - interval '20 seconds') then return null; end if;
  if why = 'streak7' and exists(select 1 from lucky_grants g where g.user_id = auth.uid() and g.campaign_id = c.id and g.reason = 'streak7' and g.day > current_date - 7) then return null; end if;
  select coalesce(sum(g.n),0) into today_n from lucky_grants g where g.user_id = auth.uid() and g.campaign_id = c.id and g.day = current_date;
  n := least(n, c.daily_max - today_n); if n <= 0 then return null; end if;
  insert into lucky_grants(user_id, campaign_id, reason, n) values (auth.uid(), c.id, why, n);
  insert into lucky_wallet(user_id, campaign_id, tickets) values (auth.uid(), c.id, n)
    on conflict (user_id, campaign_id) do update set tickets = lucky_wallet.tickets + n returning tickets into t;
  return n;
end $$;

-- Quay: máy chủ chọn quà theo tỉ lệ (bỏ qua quà đã hết), trừ 1 lượt, ghi kết quả, báo admin nếu là quà thật.
create or replace function public.lucky_spin()
returns jsonb language plpgsql security definer set search_path = public as $$
declare c lucky_campaigns; p lucky_prizes; total numeric; x numeric; acc numeric := 0; code text; sid bigint; nm text;
begin
  if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
  select * into c from lucky_current(); if c.id is null then raise exception 'Hiện không có vòng quay nào'; end if;
  update lucky_wallet set tickets = tickets - 1 where user_id = auth.uid() and campaign_id = c.id and tickets > 0;
  if not found then raise exception 'Bạn đã hết lượt quay'; end if;
  -- chọn trên toàn bộ tỉ lệ; trúng quà đã hết thì chuyển sang ô 'chúc may mắn lần sau' (hoặc quà không giới hạn)
  select coalesce(sum(rate),0) into total from lucky_prizes where campaign_id = c.id and rate > 0;
  if total <= 0 then raise exception 'Vòng quay chưa có quà'; end if;
  x := random() * total;
  for p in select * from lucky_prizes where campaign_id = c.id and rate > 0 order by sort, id loop
    acc := acc + p.rate; exit when x < acc;
  end loop;
  if p.stock is not null and p.given >= p.stock then
    select * into p from lucky_prizes where campaign_id = c.id and stock is null order by (gift = 'none') desc, value, sort limit 1;
    if p.id is null then raise exception 'Quà trong vòng quay đã hết'; end if;
  end if;
  update lucky_prizes set given = given + 1 where id = p.id;
  if p.gift not in ('none') and p.value > 0 then
    code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4) || '-' || substr(md5(random()::text), 1, 4));
  end if;
  insert into lucky_spins(user_id, campaign_id, prize_id, gift, name, value, code) values (auth.uid(), c.id, p.id, p.gift, p.name, p.value, code) returning id into sid;
  if code is not null then
    select display_name(auth.uid()) into nm;
    insert into notifications(to_id, kind, title, body, ref)
    select pr.id, 'lucky', '🎁 ' || nm || ' trúng ' || p.name, 'Mã ' || code || ' · cần trao quà', auth.uid() from profiles pr where pr.is_admin;
  end if;
  return jsonb_build_object('spin_id', sid, 'prize_id', p.id, 'gift', p.gift, 'name', p.name, 'value', p.value, 'code', code,
    'tickets', (select tickets from lucky_wallet where user_id = auth.uid() and campaign_id = c.id), 'pickup', c.pickup);
end $$;

-- Danh sách người trúng (admin)
create or replace function public.lucky_winners(cid bigint)
returns table(id bigint, user_id uuid, who text, gift text, name text, value int, code text, delivered boolean, created_at timestamptz)
language sql security definer set search_path = public stable as $$
  select s.id, s.user_id, display_name(s.user_id), s.gift, s.name, s.value, s.code, s.delivered, s.created_at
  from lucky_spins s where public.is_admin() and s.campaign_id = cid and s.code is not null order by s.delivered, s.id desc limit 300
$$;

revoke all on function public.lucky_current(), public.lucky_grant(text), public.lucky_spin(), public.lucky_winners(bigint) from public, anon;
grant execute on function public.lucky_current(), public.lucky_grant(text), public.lucky_spin(), public.lucky_winners(bigint) to authenticated;
