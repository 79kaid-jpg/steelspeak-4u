-- ============================================================
-- SteelSpeak Platform – Giai đoạn 1: đa khóa học (tracks)
-- Chạy 1 lần trong Supabase > SQL Editor, SAU profiles.sql, saga.sql, saga_v2.sql
-- ============================================================

-- Ai là admin (dùng trong các chính sách bảo mật)
create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false)
$$;

-- 1. Khóa học
create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  kind text not null default 'specialty' check (kind in ('specialty','cefr')),
  description text default '',
  audience text default '',
  join_policy text not null default 'open' check (join_policy in ('open','approval')),
  auto_domains text[] not null default '{}',
  words_per_level int not null default 30,
  cats jsonb not null default '{}',
  published boolean not null default true,
  sort int not null default 100,
  created_at timestamptz default now()
);
alter table public.tracks enable row level security;
drop policy if exists "tracks read" on public.tracks;
create policy "tracks read" on public.tracks for select using (published or public.is_admin());
drop policy if exists "tracks admin" on public.tracks;
create policy "tracks admin" on public.tracks for all using (public.is_admin()) with check (public.is_admin());

-- 2. Tham gia khóa học
create table if not exists public.enrollments (
  user_id uuid references auth.users(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  current_level int not null default 1,
  note text default '',
  requested_at timestamptz default now(),
  approved_by uuid,
  approved_at timestamptz,
  primary key (user_id, track_id)
);
alter table public.enrollments enable row level security;
drop policy if exists "enr own read" on public.enrollments;
create policy "enr own read" on public.enrollments for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "enr own insert" on public.enrollments;
create policy "enr own insert" on public.enrollments for insert with check (auth.uid() = user_id);
drop policy if exists "enr admin update" on public.enrollments;
create policy "enr admin update" on public.enrollments for update using (public.is_admin());
drop policy if exists "enr own delete" on public.enrollments;
create policy "enr own delete" on public.enrollments for delete using (auth.uid() = user_id or public.is_admin());

-- Trạng thái khi đăng ký: khóa mở → duyệt ngay; khóa cần duyệt → chờ, trừ email thuộc tên miền tự duyệt
create or replace function public.enroll_status() returns trigger
language plpgsql security definer set search_path = public as $$
declare t tracks; em text;
begin
  select * into t from tracks where id = new.track_id;
  select email into em from auth.users where id = new.user_id;
  -- Chạy từ SQL Editor / máy chủ (không có người đăng nhập) hoặc admin: giữ nguyên trạng thái được truyền vào
  if auth.uid() is null or public.is_admin() then return new; end if;
  if t.join_policy = 'open' or split_part(lower(em),'@',2) = any(t.auto_domains) then
    new.status := 'approved'; new.approved_at := now();
  else
    new.status := 'pending';
  end if;
  return new;
end $$;
drop trigger if exists enroll_status on public.enrollments;
create trigger enroll_status before insert on public.enrollments for each row execute function public.enroll_status();

create or replace function public.is_enrolled(t uuid) returns boolean
language sql security definer set search_path = public stable as $$
  select exists(select 1 from enrollments where user_id = auth.uid() and track_id = t and status = 'approved')
$$;

-- 3. Kho từ
create table if not exists public.words (
  id bigserial primary key,
  track_id uuid not null references public.tracks(id) on delete cascade,
  term text not null,
  meaning_vi text not null default '',
  example text default '',
  example_vi text default '',
  cat text default '',
  pos text default '',
  cefr text default '',
  difficulty numeric,
  ord int default 0,
  status text not null default 'draft' check (status in ('draft','approved','retired')),
  source text default '',
  created_at timestamptz default now()
);
create unique index if not exists words_unique on public.words(track_id, lower(term));
alter table public.words enable row level security;
drop policy if exists "words read" on public.words;
create policy "words read" on public.words for select using (
  public.is_admin() or (status = 'approved' and (
    public.is_enrolled(track_id) or exists(select 1 from tracks t where t.id = track_id and t.join_policy = 'open' and t.published))));
drop policy if exists "words admin" on public.words;
create policy "words admin" on public.words for all using (public.is_admin()) with check (public.is_admin());

-- 4. Admin: danh sách đơn chờ duyệt và duyệt đơn
create or replace function public.admin_enrollments(only_pending boolean default true)
returns table(user_id uuid, track_id uuid, track_name text, email text, full_name text, department text, status text, requested_at timestamptz)
language sql security definer set search_path = public stable as $$
  select e.user_id, e.track_id, t.name, p.email, p.full_name, p.department, e.status, e.requested_at
  from enrollments e join tracks t on t.id = e.track_id left join profiles p on p.id = e.user_id
  where public.is_admin() and (not only_pending or e.status = 'pending')
  order by e.requested_at desc limit 500
$$;
create or replace function public.admin_set_enrollment(u uuid, t uuid, s text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Bạn không có quyền admin'; end if;
  if s not in ('approved','rejected','pending') then raise exception 'Trạng thái không hợp lệ'; end if;
  insert into enrollments(user_id, track_id, status, approved_by, approved_at)
    values (u, t, s, auth.uid(), now())
  on conflict (user_id, track_id) do update set status = s, approved_by = auth.uid(), approved_at = now();
end $$;
revoke all on function public.admin_enrollments(boolean) from public, anon;
revoke all on function public.admin_set_enrollment(uuid,uuid,text) from public, anon;
grant execute on function public.admin_enrollments(boolean) to authenticated;
grant execute on function public.admin_set_enrollment(uuid,uuid,text) to authenticated;

-- 5. Hai khóa học đầu tiên
insert into public.tracks(slug,name,kind,description,audience,join_policy,words_per_level,cats,sort) values
 ('steel','Thép phủ – TPL, QA, QC','specialty','Thuật ngữ sản phẩm, chất lượng, nguyên vật liệu và quy trình của thép mạ, thép phủ màu.','Technical Product Lead, QA, QC','approval',30,
  '{"coat":"Thép phủ & vật liệu","qual":"Chất lượng & thử nghiệm","nspe":"NSPE & quy trình","colr":"Pha màu & chạy thử","npd":"Phát triển sản phẩm mới","biz":"Thương mại & KPI","sys":"Hệ thống & dữ liệu","talk":"Mẫu câu họp & email"}',1),
 ('general','General English (CEFR A1–C2)','cefr','Tiếng Anh tổng quát theo khung tham chiếu châu Âu CEFR, từ A1 đến C2.','Mọi người học','open',40,
  '{"A1":"A1 – Mới bắt đầu","A2":"A2 – Sơ cấp","B1":"B1 – Trung cấp","B2":"B2 – Trung cao cấp","C1":"C1 – Cao cấp","C2":"C2 – Thành thạo"}',2)
on conflict (slug) do nothing;

-- Nạp 148 thuật ngữ Thép phủ vào track steel
insert into public.words(track_id,term,meaning_vi,example,example_vi,cat,status,source,ord) values
((select id from public.tracks where slug='steel'),'substrate','vật liệu nền (thép nền)','The steel substrate determines the grade, thickness and yield strength of the product.','Lớp thép nền quyết định mác thép, chiều dày và giới hạn chảy của sản phẩm.','coat','approved','seed',0),
((select id from public.tracks where slug='steel'),'metallic coating','lớp phủ (mạ) kim loại','The metallic coating is the first line of defence against rust.','Lớp mạ kim loại là tuyến phòng thủ đầu tiên chống gỉ.','coat','approved','seed',1),
((select id from public.tracks where slug='steel'),'galvanised steel (GI)','thép mạ kẽm (GI)','Galvanised steel (GI) is protected by a zinc coating.','Thép mạ kẽm (GI) được bảo vệ bằng lớp phủ kẽm.','coat','approved','seed',2),
((select id from public.tracks where slug='steel'),'zinc-aluminium coating (GL)','lớp mạ hợp kim nhôm-kẽm (GL)','A zinc-aluminium coating (GL) protects the steel against corrosion.','Lớp mạ nhôm-kẽm (GL) bảo vệ thép khỏi ăn mòn.','coat','approved','seed',3),
((select id from public.tracks where slug='steel'),'sacrificial layer','lớp bảo vệ hy sinh','Zinc acts as a sacrificial layer, so it still protects the steel when the surface is scratched.','Kẽm đóng vai trò lớp hy sinh nên vẫn bảo vệ thép khi bề mặt bị xước.','coat','approved','seed',4),
((select id from public.tracks where slug='steel'),'chemical treatment','lớp xử lý hóa học (tiền xử lý)','The chemical treatment improves paint adhesion and helps prevent white rust.','Lớp xử lý hóa học cải thiện độ bám sơn và giúp ngăn gỉ trắng.','coat','approved','seed',5),
((select id from public.tracks where slug='steel'),'white rust','gỉ trắng (ăn mòn kẽm)','White rust can appear on zinc surfaces that are stored in damp conditions.','Gỉ trắng có thể xuất hiện trên bề mặt kẽm khi lưu kho nơi ẩm ướt.','coat','approved','seed',6),
((select id from public.tracks where slug='steel'),'primer','sơn lót','The primer bonds the paint to the metal and adds flexibility during forming.','Sơn lót giúp sơn bám vào kim loại và tăng độ dẻo khi tạo hình.','coat','approved','seed',7),
((select id from public.tracks where slug='steel'),'top finish coat','lớp sơn hoàn thiện (mặt trên)','The top finish coat provides colour and protects against UV and weathering.','Lớp sơn hoàn thiện mặt trên tạo màu và bảo vệ chống tia UV, thời tiết.','coat','approved','seed',8),
((select id from public.tracks where slug='steel'),'back coat','lớp sơn mặt sau','The back coat protects the underside of the sheet and is usually thinner than the top coat.','Lớp sơn mặt sau bảo vệ mặt dưới tấm tôn và thường mỏng hơn lớp mặt trên.','coat','approved','seed',9),
((select id from public.tracks where slug='steel'),'polyester (PE)','sơn polyester (PE)','Polyester (PE) is one example of a top finish coating.','Polyester (PE) là một ví dụ về lớp sơn phủ hoàn thiện mặt trên.','coat','approved','seed',10),
((select id from public.tracks where slug='steel'),'silicone modified polyester (SMP)','polyester biến tính silicone (SMP)','Silicone modified polyester (SMP) is another option for the top finish coat.','Polyester biến tính silicone (SMP) là một lựa chọn khác cho lớp sơn mặt trên.','coat','approved','seed',11),
((select id from public.tracks where slug='steel'),'PVDF','sơn PVDF (polyvinylidene fluoride)','The type of top coat, such as PVDF, is a key driver of the price premium.','Loại sơn phủ, như PVDF, là yếu tố chính tạo ra mức giá cao hơn.','coat','approved','seed',12),
((select id from public.tracks where slug='steel'),'protective film','màng bảo vệ bề mặt','A protective film shields architectural panels during transport and installation.','Màng bảo vệ che chắn tấm kiến trúc trong vận chuyển và lắp đặt.','coat','approved','seed',13),
((select id from public.tracks where slug='steel'),'cold rolled steel','thép cán nguội','Painted products typically use cold rolled steel as the substrate.','Sản phẩm sơn thường dùng thép cán nguội làm vật liệu nền.','coat','approved','seed',14),
((select id from public.tracks where slug='steel'),'steel grade','mác thép','Please confirm the steel grade required for this application.','Vui lòng xác nhận mác thép yêu cầu cho ứng dụng này.','coat','approved','seed',15),
((select id from public.tracks where slug='steel'),'yield strength','giới hạn chảy','The yield strength must meet the customer specification.','Giới hạn chảy phải đáp ứng yêu cầu kỹ thuật của khách hàng.','coat','approved','seed',16),
((select id from public.tracks where slug='steel'),'tensile strength','độ bền kéo','Tensile strength is reported on the Mill Test Certificate.','Độ bền kéo được ghi trên chứng chỉ thử nghiệm của nhà máy.','coat','approved','seed',17),
((select id from public.tracks where slug='steel'),'base metal thickness (BMT)','chiều dày thép nền (BMT, chưa tính lớp phủ)','The base metal thickness (BMT) excludes the metallic and paint coatings.','Chiều dày thép nền (BMT) không bao gồm lớp mạ và lớp sơn.','coat','approved','seed',18),
((select id from public.tracks where slug='steel'),'coating mass','khối lượng lớp mạ (g/m²)','The coating mass affects the corrosion protection of the steel.','Khối lượng lớp mạ ảnh hưởng đến khả năng bảo vệ chống ăn mòn của thép.','coat','approved','seed',19),
((select id from public.tracks where slug='steel'),'coil','cuộn thép','We supply painted steel in coil form as well as profiled sheets.','Chúng tôi cung cấp thép sơn dạng cuộn cũng như tôn định hình.','coat','approved','seed',20),
((select id from public.tracks where slug='steel'),'profiled sheet','tôn định hình (cán sóng)','The coil is roll-formed into a profiled sheet for roofing.','Cuộn thép được cán tạo hình thành tôn định hình để lợp mái.','coat','approved','seed',21),
((select id from public.tracks where slug='steel'),'formability','khả năng tạo hình','Good formability prevents the paint from cracking during bending.','Khả năng tạo hình tốt giúp sơn không bị nứt khi uốn.','coat','approved','seed',22),
((select id from public.tracks where slug='steel'),'delamination','hiện tượng bong tách lớp','Delamination means the coating layers separate from each other.','Bong tách lớp nghĩa là các lớp phủ tách rời nhau.','coat','approved','seed',23),
((select id from public.tracks where slug='steel'),'chalking','hiện tượng phấn hóa (bề mặt sơn)','Chalking appears as a powdery film on the paint surface after long UV exposure.','Phấn hóa xuất hiện dưới dạng lớp bột trên bề mặt sơn sau thời gian dài tiếp xúc UV.','coat','approved','seed',24),
((select id from public.tracks where slug='steel'),'fading','hiện tượng phai màu','Fading is a gradual loss of colour intensity over time.','Phai màu là sự giảm dần độ đậm của màu theo thời gian.','coat','approved','seed',25),
((select id from public.tracks where slug='steel'),'corrosion resistance','khả năng chống ăn mòn','Corrosion resistance depends on the coating system and the environment.','Khả năng chống ăn mòn phụ thuộc vào hệ lớp phủ và môi trường.','coat','approved','seed',26),
((select id from public.tracks where slug='steel'),'end application','ứng dụng cuối (mục đích sử dụng)','The end application, such as roofing or walling, drives the product specification.','Ứng dụng cuối như lợp mái hay ốp tường quyết định quy cách sản phẩm.','coat','approved','seed',27),
((select id from public.tracks where slug='steel'),'Mill Test Certificate (MTC)','chứng chỉ thử nghiệm của nhà máy','Please send the Mill Test Certificate (MTC) for this lot number.','Vui lòng gửi chứng chỉ thử nghiệm của nhà máy (MTC) cho số lô này.','qual','approved','seed',28),
((select id from public.tracks where slug='steel'),'lot number','số lô','We can trace the product back using the lot number.','Chúng tôi có thể truy xuất sản phẩm bằng số lô.','qual','approved','seed',29),
((select id from public.tracks where slug='steel'),'traceability','khả năng truy xuất nguồn gốc','Traceability allows us to link a complaint to a specific coil and batch.','Truy xuất nguồn gốc cho phép liên kết khiếu nại với cuộn và lô cụ thể.','qual','approved','seed',30),
((select id from public.tracks where slug='steel'),'specification','quy cách / yêu cầu kỹ thuật (spec)','The customer specification is attached to the inquiry.','Yêu cầu kỹ thuật của khách hàng được đính kèm trong yêu cầu báo giá.','qual','approved','seed',31),
((select id from public.tracks where slug='steel'),'tolerance','dung sai','The thickness must be within the agreed tolerance.','Độ dày phải nằm trong dung sai đã thỏa thuận.','qual','approved','seed',32),
((select id from public.tracks where slug='steel'),'inspection','kiểm tra, kiểm định','A visual inspection was carried out before dispatch.','Việc kiểm tra bằng mắt đã được thực hiện trước khi xuất hàng.','qual','approved','seed',33),
((select id from public.tracks where slug='steel'),'non-conformance','sự không phù hợp (lỗi không đạt yêu cầu)','A non-conformance was found on the test strip.','Một điểm không phù hợp đã được phát hiện trên dải thử.','qual','approved','seed',34),
((select id from public.tracks where slug='steel'),'root cause analysis','phân tích nguyên nhân gốc','We have started the root cause analysis for this complaint.','Chúng tôi đã bắt đầu phân tích nguyên nhân gốc cho khiếu nại này.','qual','approved','seed',35),
((select id from public.tracks where slug='steel'),'corrective action','hành động khắc phục','The corrective action will be completed by the end of the month.','Hành động khắc phục sẽ hoàn thành vào cuối tháng.','qual','approved','seed',36),
((select id from public.tracks where slug='steel'),'preventive action','hành động phòng ngừa','A preventive action is needed to avoid the same issue in future.','Cần có hành động phòng ngừa để tránh tái diễn vấn đề này.','qual','approved','seed',37),
((select id from public.tracks where slug='steel'),'salt spray test','thử nghiệm phun muối','The salt spray test evaluates corrosion resistance in a laboratory.','Thử nghiệm phun muối đánh giá khả năng chống ăn mòn trong phòng thí nghiệm.','qual','approved','seed',38),
((select id from public.tracks where slug='steel'),'T-bend test','thử uốn chữ T (độ bám sơn khi uốn)','The T-bend test checks paint adhesion and flexibility when the sheet is bent.','Thử uốn chữ T kiểm tra độ bám dính và độ dẻo của sơn khi uốn tấm.','qual','approved','seed',39),
((select id from public.tracks where slug='steel'),'impact test','thử va đập','The impact test shows whether the paint cracks under sudden load.','Thử va đập cho biết sơn có nứt khi chịu tải đột ngột hay không.','qual','approved','seed',40),
((select id from public.tracks where slug='steel'),'cross-cut adhesion test','thử bám dính ô vuông','A cross-cut adhesion test was performed on the sample.','Đã thực hiện thử bám dính ô vuông trên mẫu.','qual','approved','seed',41),
((select id from public.tracks where slug='steel'),'MEK rub test','thử cọ dung môi MEK (mức độ đóng rắn của sơn)','The MEK rub test is used to check the degree of paint cure.','Thử cọ MEK dùng để kiểm tra mức độ đóng rắn của sơn.','qual','approved','seed',42),
((select id from public.tracks where slug='steel'),'gloss level','độ bóng','The gloss level of the batch is within the customer requirement.','Độ bóng của lô hàng nằm trong yêu cầu của khách hàng.','qual','approved','seed',43),
((select id from public.tracks where slug='steel'),'film thickness','độ dày màng sơn','Film thickness is measured at several points across the width.','Độ dày màng sơn được đo tại nhiều điểm trên bề ngang.','qual','approved','seed',44),
((select id from public.tracks where slug='steel'),'colour difference (ΔE)','chênh lệch màu (ΔE)','The colour difference (ΔE) must be within the agreed limit.','Chênh lệch màu (ΔE) phải nằm trong giới hạn đã thỏa thuận.','qual','approved','seed',45),
((select id from public.tracks where slug='steel'),'batch-to-batch variation','sai khác giữa các lô','The customer complained about batch-to-batch variation in shade.','Khách hàng khiếu nại về sự sai khác sắc độ giữa các lô.','qual','approved','seed',46),
((select id from public.tracks where slug='steel'),'Line Working Standard (LWS)','mẫu chuẩn làm việc trên dây chuyền (LWS)','A sample is taken from the run for the Line Working Standard (LWS).','Một mẫu được lấy từ lần chạy để làm mẫu chuẩn làm việc trên dây chuyền (LWS).','qual','approved','seed',47),
((select id from public.tracks where slug='steel'),'Temporary Line Standard (TLS)','mẫu chuẩn tạm thời trên dây chuyền (TLS)','A Temporary Line Standard (TLS) is used as the colour reference during the trial.','Mẫu chuẩn tạm thời (TLS) được dùng làm chuẩn màu trong lần chạy thử.','qual','approved','seed',48),
((select id from public.tracks where slug='steel'),'Quality Engineer','kỹ sư chất lượng','The Quality Engineer will write the trial proposal.','Kỹ sư chất lượng sẽ viết đề xuất chạy thử.','qual','approved','seed',49),
((select id from public.tracks where slug='steel'),'Non-Standard Product Enquiry (NSPE)','yêu cầu sản phẩm phi tiêu chuẩn','A Non-Standard Product Enquiry (NSPE) is a variation outside the current market offer.','NSPE là yêu cầu biến thể nằm ngoài danh mục chào bán hiện tại.','nspe','approved','seed',50),
((select id from public.tracks where slug='steel'),'market offer','danh mục sản phẩm chào bán (tiêu chuẩn)','Anything outside the market offer is treated as an NSPE.','Bất cứ yêu cầu nào ngoài danh mục chào bán đều được xem là NSPE.','nspe','approved','seed',51),
((select id from public.tracks where slug='steel'),'standard capability','năng lực tiêu chuẩn','The system checks the request against our standard capability.','Hệ thống kiểm tra yêu cầu so với năng lực tiêu chuẩn của chúng ta.','nspe','approved','seed',52),
((select id from public.tracks where slug='steel'),'extended capability','năng lực mở rộng (cần quy tắc/phê duyệt đặc biệt)','The CFT evaluates the extended capability before accepting the request.','CFT đánh giá năng lực mở rộng trước khi chấp nhận yêu cầu.','nspe','approved','seed',53),
((select id from public.tracks where slug='steel'),'Cross-Functional Team (CFT)','nhóm liên chức năng (CFT)','The Cross-Functional Team (CFT) includes Sales, Planning, Procurement, Production, Quality, Logistics and Finance.','CFT gồm Kinh doanh, Kế hoạch, Mua hàng, Sản xuất, Chất lượng, Logistics và Tài chính.','nspe','approved','seed',54),
((select id from public.tracks where slug='steel'),'inquiry','yêu cầu của khách hàng (inquiry/enquiry)','The sales team logs every customer inquiry in the system.','Bộ phận bán hàng ghi nhận mọi yêu cầu của khách hàng vào hệ thống.','nspe','approved','seed',55),
((select id from public.tracks where slug='steel'),'quotation','báo giá','The quotation will be released once the CFT has approved the request.','Báo giá sẽ được phát hành sau khi CFT phê duyệt yêu cầu.','nspe','approved','seed',56),
((select id from public.tracks where slug='steel'),'feasibility','tính khả thi','We need to confirm the technical and commercial feasibility.','Chúng ta cần xác nhận tính khả thi về kỹ thuật và thương mại.','nspe','approved','seed',57),
((select id from public.tracks where slug='steel'),'approval workflow','quy trình phê duyệt (workflow)','The approval workflow sends reminders to the approvers.','Quy trình phê duyệt gửi nhắc nhở đến những người phê duyệt.','nspe','approved','seed',58),
((select id from public.tracks where slug='steel'),'Delegation of Authority (DoA)','phân quyền phê duyệt (DoA)','Approvals follow the Delegation of Authority (DoA).','Việc phê duyệt tuân theo phân quyền phê duyệt (DoA).','nspe','approved','seed',59),
((select id from public.tracks where slug='steel'),'counter proposal','đề xuất thay thế / phản đề xuất','The CFT may share a counter proposal with the customer.','CFT có thể gửi đề xuất thay thế cho khách hàng.','nspe','approved','seed',60),
((select id from public.tracks where slug='steel'),'alternative product','sản phẩm thay thế','We recommend an alternative product that meets the same performance requirement.','Chúng tôi đề xuất sản phẩm thay thế đáp ứng cùng yêu cầu hiệu năng.','nspe','approved','seed',61),
((select id from public.tracks where slug='steel'),'rejection notification','thông báo từ chối','A rejection notification is sent with a valid reason.','Thông báo từ chối được gửi kèm lý do hợp lệ.','nspe','approved','seed',62),
((select id from public.tracks where slug='steel'),'pending with CFT','đang chờ CFT xử lý','The inquiry status is pending with CFT.','Trạng thái của yêu cầu là đang chờ CFT xử lý.','nspe','approved','seed',63),
((select id from public.tracks where slug='steel'),'minimum order quantity (MOQ)','số lượng đặt hàng tối thiểu (MOQ)','Non-standard products may carry a minimum order quantity (MOQ).','Sản phẩm phi tiêu chuẩn có thể có số lượng đặt hàng tối thiểu (MOQ).','nspe','approved','seed',64),
((select id from public.tracks where slug='steel'),'yield rate','tỷ lệ thu hồi (hiệu suất thành phẩm)','A low yield rate can lead to additional cost for non-standard orders.','Tỷ lệ thu hồi thấp có thể phát sinh chi phí bổ sung cho đơn hàng phi tiêu chuẩn.','nspe','approved','seed',65),
((select id from public.tracks where slug='steel'),'lead time','thời gian thực hiện (từ đặt hàng đến giao)','Please note the lead time may be longer for non-standard items.','Lưu ý thời gian thực hiện có thể dài hơn với hàng phi tiêu chuẩn.','nspe','approved','seed',66),
((select id from public.tracks where slug='steel'),'escalate','báo cáo lên cấp cao hơn','If the CFT cannot agree, we will escalate to the approvers.','Nếu CFT không thống nhất, chúng tôi sẽ báo cáo lên cấp phê duyệt.','nspe','approved','seed',67),
((select id from public.tracks where slug='steel'),'parking lot','danh sách vấn đề tạm hoãn (để xử lý sau)','Let us put this item in the parking lot and revisit it next week.','Hãy đưa mục này vào danh sách tạm hoãn và xem lại vào tuần sau.','nspe','approved','seed',68),
((select id from public.tracks where slug='steel'),'colour matching','đối màu / pha màu theo yêu cầu','Colour matching is the most common reason for raising an NSPE.','Đối màu là lý do phổ biến nhất để tạo một NSPE.','colr','approved','seed',69),
((select id from public.tracks where slug='steel'),'colour panel','tấm màu mẫu','The customer signs the colour panel to approve the shade.','Khách hàng ký lên tấm màu mẫu để duyệt sắc độ.','colr','approved','seed',70),
((select id from public.tracks where slug='steel'),'paint supplier','nhà cung cấp sơn','The paint supplier will submit four samples for approval.','Nhà cung cấp sơn sẽ gửi bốn mẫu để phê duyệt.','colr','approved','seed',71),
((select id from public.tracks where slug='steel'),'sample approval','phê duyệt mẫu','Production starts only after the sample approval from the customer.','Sản xuất chỉ bắt đầu sau khi khách hàng phê duyệt mẫu.','colr','approved','seed',72),
((select id from public.tracks where slug='steel'),'colour registration','đăng ký màu (mã màu mới)','One approved panel is kept for colour registration.','Một tấm mẫu đã duyệt được giữ lại để đăng ký màu.','colr','approved','seed',73),
((select id from public.tracks where slug='steel'),'re-matching','đối màu lại','If the shade is not agreed, the supplier will do a re-matching.','Nếu sắc độ chưa được đồng ý, nhà cung cấp sẽ đối màu lại.','colr','approved','seed',74),
((select id from public.tracks where slug='steel'),'shade','sắc độ','The customer asked for a slightly darker shade.','Khách hàng yêu cầu sắc độ đậm hơn một chút.','colr','approved','seed',75),
((select id from public.tracks where slug='steel'),'wet sample','mẫu sơn ướt','The supplier sends a wet sample after the first paint batch.','Nhà cung cấp gửi mẫu sơn ướt sau lô sơn đầu tiên.','colr','approved','seed',76),
((select id from public.tracks where slug='steel'),'drawdown sample','mẫu kéo sơn (draw-down) trong phòng thí nghiệm','A drawdown sample is tested in the laboratory before the line trial.','Mẫu kéo sơn được thử trong phòng thí nghiệm trước khi chạy thử trên dây chuyền.','colr','approved','seed',77),
((select id from public.tracks where slug='steel'),'pre-shipment panel','tấm mẫu trước khi giao (từ nhà cung cấp sơn)','We compare the pre-shipment panel with the customer-approved panel.','Chúng tôi so sánh tấm mẫu trước khi giao với tấm mẫu khách đã duyệt.','colr','approved','seed',78),
((select id from public.tracks where slug='steel'),'trial run','chạy thử (sản xuất thử)','We will schedule a trial run on the paint line.','Chúng tôi sẽ lên lịch chạy thử trên dây chuyền sơn.','colr','approved','seed',79),
((select id from public.tracks where slug='steel'),'trial proposal','đề xuất chạy thử','The Quality Engineer distributes the trial proposal to the line team.','Kỹ sư chất lượng gửi đề xuất chạy thử cho tổ dây chuyền.','colr','approved','seed',80),
((select id from public.tracks where slug='steel'),'test strip','dải thử (cuộn/mẫu thử)','A test strip is produced according to the trial proposal.','Một dải thử được sản xuất theo đề xuất chạy thử.','colr','approved','seed',81),
((select id from public.tracks where slug='steel'),'paint line','dây chuyền sơn','The paint line is booked for the trial next Tuesday.','Dây chuyền sơn đã được đặt lịch cho đợt chạy thử vào thứ Ba tuần sau.','colr','approved','seed',82),
((select id from public.tracks where slug='steel'),'Line Leader','trưởng chuyền','The Line Leader completes the order if the test strip is successful.','Trưởng chuyền hoàn tất đơn hàng nếu dải thử đạt.','colr','approved','seed',83),
((select id from public.tracks where slug='steel'),'idea generation','tạo ý tưởng','Idea generation draws on market research, technology and customer feedback.','Tạo ý tưởng dựa trên nghiên cứu thị trường, công nghệ và phản hồi của khách hàng.','npd','approved','seed',84),
((select id from public.tracks where slug='steel'),'feasibility study','nghiên cứu khả thi','A feasibility study evaluates technical, economic and legal viability.','Nghiên cứu khả thi đánh giá tính khả thi về kỹ thuật, kinh tế và pháp lý.','npd','approved','seed',85),
((select id from public.tracks where slug='steel'),'concept development','phát triển ý tưởng thành concept','During concept development we define features and performance characteristics.','Trong giai đoạn phát triển concept, chúng ta xác định tính năng và đặc tính hiệu năng.','npd','approved','seed',86),
((select id from public.tracks where slug='steel'),'prototype','mẫu thử nghiệm (nguyên mẫu)','A small-scale prototype is made to test the design.','Một nguyên mẫu quy mô nhỏ được làm ra để thử nghiệm thiết kế.','npd','approved','seed',87),
((select id from public.tracks where slug='steel'),'Minimum Viable Product (MVP)','sản phẩm khả dụng tối thiểu (MVP)','The Minimum Viable Product (MVP) lets us test the idea with customers early.','MVP cho phép thử ý tưởng với khách hàng từ sớm.','npd','approved','seed',88),
((select id from public.tracks where slug='steel'),'product refinement','tinh chỉnh sản phẩm','Product refinement uses feedback from testing and market analysis.','Tinh chỉnh sản phẩm dựa trên phản hồi từ thử nghiệm và phân tích thị trường.','npd','approved','seed',89),
((select id from public.tracks where slug='steel'),'final validation','xác nhận cuối cùng (kỹ thuật & thương mại)','Final validation confirms the product is technically and commercially viable.','Xác nhận cuối cùng khẳng định sản phẩm khả thi về kỹ thuật và thương mại.','npd','approved','seed',90),
((select id from public.tracks where slug='steel'),'production planning','lập kế hoạch sản xuất','Production planning covers the BOM, routing and sourcing.','Lập kế hoạch sản xuất bao gồm BOM, routing và nguồn cung.','npd','approved','seed',91),
((select id from public.tracks where slug='steel'),'pilot production','sản xuất thí điểm','Pilot production confirms we can make the product with consistent quality.','Sản xuất thí điểm xác nhận chúng ta có thể làm ra sản phẩm với chất lượng ổn định.','npd','approved','seed',92),
((select id from public.tracks where slug='steel'),'commercial trial','thử nghiệm thương mại (lô nhỏ cho khách chọn lọc)','A commercial trial with selected customers gives market feedback.','Thử nghiệm thương mại với khách hàng chọn lọc mang lại phản hồi thị trường.','npd','approved','seed',93),
((select id from public.tracks where slug='steel'),'launch','ra mắt (sản phẩm)','The launch is supported by marketing and sales campaigns.','Việc ra mắt được hỗ trợ bởi các chiến dịch marketing và bán hàng.','npd','approved','seed',94),
((select id from public.tracks where slug='steel'),'end of life','kết thúc vòng đời sản phẩm','At end of life we decide to discontinue, redesign or replace the product.','Khi kết thúc vòng đời, chúng ta quyết định ngừng, thiết kế lại hoặc thay thế sản phẩm.','npd','approved','seed',95),
((select id from public.tracks where slug='steel'),'gate approver','người phê duyệt tại cổng giai đoạn (stage gate)','The gate approver decides whether the project moves to the next stage.','Người phê duyệt cổng quyết định dự án có được chuyển sang giai đoạn tiếp theo không.','npd','approved','seed',96),
((select id from public.tracks where slug='steel'),'desirability','mức độ khách hàng mong muốn','Desirability asks whether customers really want this product.','Desirability hỏi liệu khách hàng có thực sự muốn sản phẩm này không.','npd','approved','seed',97),
((select id from public.tracks where slug='steel'),'viability','tính khả thi về kinh doanh (hiệu quả tài chính)','Viability looks at margin, pricing and the business case.','Viability xem xét biên lợi nhuận, giá bán và bài toán kinh doanh.','npd','approved','seed',98),
((select id from public.tracks where slug='steel'),'business case','bài toán kinh doanh','The business case must be approved before we start the prototype.','Bài toán kinh doanh phải được duyệt trước khi bắt đầu làm nguyên mẫu.','npd','approved','seed',99),
((select id from public.tracks where slug='steel'),'target market','thị trường mục tiêu','We need to define the target market before the customer survey.','Cần xác định thị trường mục tiêu trước khi khảo sát khách hàng.','npd','approved','seed',100),
((select id from public.tracks where slug='steel'),'product positioning','định vị sản phẩm','Product positioning explains how the product differs from competitors.','Định vị sản phẩm giải thích sản phẩm khác biệt thế nào so với đối thủ.','npd','approved','seed',101),
((select id from public.tracks where slug='steel'),'time to market','thời gian đưa sản phẩm ra thị trường','Time to market is measured from ideation to launch.','Thời gian ra thị trường được tính từ ý tưởng đến khi ra mắt.','npd','approved','seed',102),
((select id from public.tracks where slug='steel'),'response time','thời gian phản hồi','The NSPE response time is measured from logging to quotation acceptance.','Thời gian phản hồi NSPE tính từ lúc ghi nhận đến khi khách chấp nhận báo giá.','biz','approved','seed',103),
((select id from public.tracks where slug='steel'),'opportunity loss','mất cơ hội (doanh thu bị bỏ lỡ)','Non-converted quotations help us evaluate opportunity loss.','Các báo giá không chuyển đổi giúp chúng ta đánh giá mức mất cơ hội.','biz','approved','seed',104),
((select id from public.tracks where slug='steel'),'conversion rate','tỷ lệ chuyển đổi','We track the conversion rate from inquiry to order.','Chúng tôi theo dõi tỷ lệ chuyển đổi từ yêu cầu sang đơn hàng.','biz','approved','seed',105),
((select id from public.tracks where slug='steel'),'price premium','mức giá cao hơn (phần giá cộng thêm)','The premium coating supports a price premium.','Lớp phủ cao cấp hỗ trợ mức giá cao hơn.','biz','approved','seed',106),
((select id from public.tracks where slug='steel'),'margin','biên lợi nhuận','The extra cost reduces the margin on this order.','Chi phí phát sinh làm giảm biên lợi nhuận của đơn hàng này.','biz','approved','seed',107),
((select id from public.tracks where slug='steel'),'pricing strategy','chiến lược giá','The pricing strategy for the new product will be agreed with Finance.','Chiến lược giá cho sản phẩm mới sẽ được thống nhất với Tài chính.','biz','approved','seed',108),
((select id from public.tracks where slug='steel'),'competitor benchmarking','so sánh chuẩn với đối thủ','Competitor benchmarking shows where we are above or below the market.','So sánh với đối thủ cho thấy chúng ta cao hơn hay thấp hơn thị trường ở điểm nào.','biz','approved','seed',109),
((select id from public.tracks where slug='steel'),'value proposition','đề xuất giá trị','Our value proposition is durability and consistent colour.','Đề xuất giá trị của chúng ta là độ bền và màu sắc ổn định.','biz','approved','seed',110),
((select id from public.tracks where slug='steel'),'market segment','phân khúc thị trường','Which market segment is this customer in?','Khách hàng này thuộc phân khúc thị trường nào?','biz','approved','seed',111),
((select id from public.tracks where slug='steel'),'volume','sản lượng / khối lượng (tấn)','The expected volume is the key input to the feasibility check.','Khối lượng dự kiến là đầu vào quan trọng cho việc kiểm tra tính khả thi.','biz','approved','seed',112),
((select id from public.tracks where slug='steel'),'stakeholder','bên liên quan','Each stakeholder needs a clear update on the timeline.','Mỗi bên liên quan cần một cập nhật rõ ràng về tiến độ.','biz','approved','seed',113),
((select id from public.tracks where slug='steel'),'cost to serve','chi phí phục vụ khách hàng','Special requests increase the cost to serve.','Các yêu cầu đặc biệt làm tăng chi phí phục vụ.','biz','approved','seed',114),
((select id from public.tracks where slug='steel'),'Advanced Variant Configuration (AVC)','cấu hình biến thể nâng cao (AVC)','Advanced Variant Configuration (AVC) checks whether an inquiry fits our standard offering.','AVC kiểm tra xem yêu cầu có nằm trong danh mục tiêu chuẩn hay không.','sys','approved','seed',115),
((select id from public.tracks where slug='steel'),'inconsistent configuration','cấu hình không nhất quán (ngoài tiêu chuẩn)','An inconsistent configuration triggers the NSPE process.','Cấu hình không nhất quán sẽ kích hoạt quy trình NSPE.','sys','approved','seed',116),
((select id from public.tracks where slug='steel'),'characteristic','đặc tính (thuộc tính cấu hình sản phẩm)','The NSPE flag is a characteristic in the product configuration.','Cờ NSPE là một đặc tính trong cấu hình sản phẩm.','sys','approved','seed',117),
((select id from public.tracks where slug='steel'),'material master','dữ liệu gốc vật tư (material master)','The Master Data Team updates the material master after approval.','Nhóm dữ liệu gốc cập nhật material master sau khi được duyệt.','sys','approved','seed',118),
((select id from public.tracks where slug='steel'),'Bill of Materials (BOM)','định mức vật tư (BOM)','The Bill of Materials (BOM) lists all the components of the product.','BOM liệt kê tất cả thành phần của sản phẩm.','sys','approved','seed',119),
((select id from public.tracks where slug='steel'),'routing','quy trình công nghệ (routing)','The routing defines the production steps and work centres.','Routing xác định các bước sản xuất và trung tâm gia công.','sys','approved','seed',120),
((select id from public.tracks where slug='steel'),'master data','dữ liệu gốc','Accurate master data is required before production planning.','Cần dữ liệu gốc chính xác trước khi lập kế hoạch sản xuất.','sys','approved','seed',121),
((select id from public.tracks where slug='steel'),'audit trail','nhật ký kiểm toán (lịch sử thay đổi)','Every change is recorded in the audit trail.','Mọi thay đổi đều được ghi lại trong nhật ký kiểm toán.','sys','approved','seed',122),
((select id from public.tracks where slug='steel'),'system of record','hệ thống ghi nhận chính thức','S/4HANA becomes the system of record for product management.','S/4HANA trở thành hệ thống ghi nhận chính thức cho quản lý sản phẩm.','sys','approved','seed',123),
((select id from public.tracks where slug='steel'),'satellite system','hệ thống vệ tinh (ứng dụng phụ ngoài ERP)','The standalone satellite system will be retired.','Hệ thống vệ tinh độc lập sẽ được ngừng sử dụng.','sys','approved','seed',124),
((select id from public.tracks where slug='steel'),'interface','giao diện tích hợp (interface)','There is an interface between Salesforce and SAP S/4HANA.','Có một interface giữa Salesforce và SAP S/4HANA.','sys','approved','seed',125),
((select id from public.tracks where slug='steel'),'workflow','quy trình tự động (workflow)','The workflow routes the request to each approver.','Workflow chuyển yêu cầu đến từng người phê duyệt.','sys','approved','seed',126),
((select id from public.tracks where slug='steel'),'retire (sunset)','ngừng sử dụng (khai tử) ứng dụng','We plan to sunset the old Power Apps solution.','Chúng tôi dự định khai tử giải pháp Power Apps cũ.','sys','approved','seed',127),
((select id from public.tracks where slug='steel'),'opportunity','cơ hội bán hàng (trong CRM)','The opportunity in Salesforce captures the customer requirement.','Opportunity trong Salesforce ghi nhận yêu cầu của khách hàng.','sys','approved','seed',128),
((select id from public.tracks where slug='steel'),'data migration','chuyển đổi dữ liệu','The data migration plan depends on the final design decision.','Kế hoạch chuyển đổi dữ liệu phụ thuộc vào quyết định thiết kế cuối cùng.','sys','approved','seed',129),
((select id from public.tracks where slug='steel'),'Could you walk me through the specification?','Anh/chị có thể giải thích chi tiết quy cách giúp tôi không?','Could you walk me through the specification?','Anh/chị có thể giải thích chi tiết quy cách giúp tôi không?','talk','approved','seed',130),
((select id from public.tracks where slug='steel'),'Could you confirm the end application?','Anh/chị có thể xác nhận ứng dụng cuối được không?','Could you confirm the end application and the exposure environment?','Anh/chị có thể xác nhận ứng dụng cuối và môi trường sử dụng không?','talk','approved','seed',131),
((select id from public.tracks where slug='steel'),'This falls outside our standard offering.','Yêu cầu này nằm ngoài danh mục tiêu chuẩn của chúng tôi.','Based on our current capability, this falls outside our standard offering.','Dựa trên năng lực hiện tại, yêu cầu này nằm ngoài danh mục tiêu chuẩn.','talk','approved','seed',132),
((select id from public.tracks where slug='steel'),'I will check the feasibility and get back to you by Friday.','Tôi sẽ kiểm tra tính khả thi và phản hồi anh/chị vào thứ Sáu.','I will check the feasibility and get back to you by Friday.','Tôi sẽ kiểm tra tính khả thi và phản hồi anh/chị vào thứ Sáu.','talk','approved','seed',133),
((select id from public.tracks where slug='steel'),'We need approval from the CFT to move forward.','Chúng tôi cần CFT phê duyệt để tiến hành.','We need approval from the CFT to move forward.','Chúng tôi cần CFT phê duyệt để tiến hành.','talk','approved','seed',134),
((select id from public.tracks where slug='steel'),'The root cause is still under investigation.','Nguyên nhân gốc vẫn đang được điều tra.','The root cause is still under investigation; we will share the findings once the lab results are available.','Nguyên nhân gốc vẫn đang được điều tra; chúng tôi sẽ chia sẻ kết quả khi có số liệu phòng thí nghiệm.','talk','approved','seed',135),
((select id from public.tracks where slug='steel'),'Could you share the coil number and photos?','Anh/chị có thể chia sẻ số cuộn và hình ảnh không?','Could you share the coil number and photos so that we can start the investigation?','Anh/chị có thể chia sẻ số cuộn và hình ảnh để chúng tôi bắt đầu điều tra không?','talk','approved','seed',136),
((select id from public.tracks where slug='steel'),'I would like to flag a risk on the lead time.','Tôi muốn lưu ý một rủi ro về thời gian thực hiện.','I would like to flag a risk on the lead time for this order.','Tôi muốn lưu ý một rủi ro về thời gian thực hiện của đơn hàng này.','talk','approved','seed',137),
((select id from public.tracks where slug='steel'),'Could we schedule a trial run next week?','Chúng ta có thể lên lịch chạy thử vào tuần sau không?','Could we schedule a trial run on the paint line next week?','Chúng ta có thể lên lịch chạy thử trên dây chuyền sơn vào tuần sau không?','talk','approved','seed',138),
((select id from public.tracks where slug='steel'),'The customer-approved panel is our reference.','Tấm mẫu khách đã duyệt là chuẩn tham chiếu của chúng ta.','For the colour shade, the customer-approved panel is our reference.','Về sắc độ màu, tấm mẫu khách đã duyệt là chuẩn tham chiếu của chúng ta.','talk','approved','seed',139),
((select id from public.tracks where slug='steel'),'Let us park this item and revisit it next time.','Hãy tạm hoãn mục này và xem lại vào lần sau.','Let us park this item and revisit it in the next meeting.','Hãy tạm hoãn mục này và xem lại trong cuộc họp tới.','talk','approved','seed',140),
((select id from public.tracks where slug='steel'),'Just to confirm my understanding...','Để tôi xác nhận lại là mình hiểu đúng...','Just to confirm my understanding, the customer needs a custom colour for roofing, correct?','Để tôi xác nhận lại là mình hiểu đúng, khách cần màu riêng cho mái, đúng không?','talk','approved','seed',141),
((select id from public.tracks where slug='steel'),'Please find attached the test report.','Đính kèm là báo cáo thử nghiệm.','Please find attached the test report for your reference.','Đính kèm là báo cáo thử nghiệm để anh/chị tham khảo.','talk','approved','seed',142),
((select id from public.tracks where slug='steel'),'We apologise for the inconvenience caused.','Chúng tôi xin lỗi vì sự bất tiện này.','We apologise for the inconvenience caused and are working on a solution.','Chúng tôi xin lỗi vì sự bất tiện này và đang tìm giải pháp.','talk','approved','seed',143),
((select id from public.tracks where slug='steel'),'Could you clarify the next steps and owners?','Anh/chị có thể làm rõ các bước tiếp theo và người phụ trách không?','Before we close, could you clarify the next steps and owners?','Trước khi kết thúc, anh/chị có thể làm rõ các bước tiếp theo và người phụ trách không?','talk','approved','seed',144),
((select id from public.tracks where slug='steel'),'This is subject to MOQ and additional cost.','Điều này tùy thuộc vào MOQ và chi phí phát sinh.','The offer is subject to MOQ and additional cost.','Đề nghị này tùy thuộc vào MOQ và chi phí phát sinh.','talk','approved','seed',145),
((select id from public.tracks where slug='steel'),'The price is TBC until the CFT confirms.','Giá sẽ được xác nhận (TBC) sau khi CFT chốt.','The price is TBC until the CFT confirms the feasibility.','Giá sẽ được xác nhận sau khi CFT chốt tính khả thi.','talk','approved','seed',146),
((select id from public.tracks where slug='steel'),'Could you please prioritise this request?','Anh/chị có thể ưu tiên xử lý yêu cầu này được không?','Could you please prioritise this request? The customer is waiting for our reply.','Anh/chị có thể ưu tiên yêu cầu này được không? Khách hàng đang chờ phản hồi.','talk','approved','seed',147)
on conflict do nothing;

-- 6. Người dùng đã có từ trước: cho vào khóa Thép luôn (đã duyệt)
insert into public.enrollments(user_id, track_id, status, approved_at)
select p.id, (select id from tracks where slug='steel'), 'approved', now() from profiles p
on conflict do nothing;
