-- Admin: tiến độ học & thi lên level của từng học viên theo từng khóa (tự chạy bởi GitHub Action Run SQL).
create or replace function public.admin_learning()
returns table(user_id uuid, name text, email text, track_id uuid, slug text, track_name text, kind text, cats jsonb, per int,
              cat_counts jsonb, levels jsonb, certs jsonb, attempts jsonb, last_play timestamptz)
language sql security definer set search_path = public stable as $$
  select e.user_id, coalesce(nullif(p.full_name,''), split_part(p.email,'@',1)), p.email,
         t.id, t.slug, t.name, t.kind, t.cats, coalesce(t.words_per_level,40),
         coalesce((select jsonb_object_agg(c.cat, c.n) from (select w.cat, count(*) n from words w where w.track_id=t.id and w.status='approved' group by w.cat) c),'{}'::jsonb),
         coalesce((select jsonb_object_agg(s.level, s.st) from (select ss.level, max(ss.stars) st from saga_scores ss where ss.user_id=e.user_id and ss.track_id=t.id group by ss.level) s),'{}'::jsonb),
         coalesce((select jsonb_agg(jsonb_build_object('chapter',c.chapter,'level',c.level_name,'score',c.score,'at',c.issued_at,'code',c.code) order by c.chapter) from certificates c where c.user_id=e.user_id and c.track_id=t.id),'[]'::jsonb),
         coalesce((select jsonb_agg(jsonb_build_object('chapter',a.chapter,'passed',a.passed,'correct',a.correct,'total',a.total,'at',a.submitted_at) order by a.submitted_at desc) from exam_attempts a where a.user_id=e.user_id and a.track_id=t.id and a.submitted_at is not null),'[]'::jsonb),
         (select max(ss.created_at) from saga_scores ss where ss.user_id=e.user_id and ss.track_id=t.id)
  from enrollments e join tracks t on t.id=e.track_id join profiles p on p.id=e.user_id
  where e.status='approved' and public.is_admin()
  order by 2, t.name
$$;
revoke all on function public.admin_learning() from public, anon;
grant execute on function public.admin_learning() to authenticated;
