/* ===================== TIẾN ĐỘ & THI LÊN LEVEL =====================
 Admin: Quản trị → "Tiến độ & thi lên level": mỗi học viên × mỗi khóa đang học, chặng nào đã có chứng chỉ,
 chặng nào đủ sao đang CHỜ THI, chặng đang học. Chặng đã xong được gom lại (ẩn), nổi bật việc cần làm.
 Học viên: trang Học liệt kê mọi bài thi lên level đang chờ (không chỉ bài đầu tiên) + nhắc 1 lần mỗi ngày.
 Cần supabase/learning_admin.sql (GitHub Action Run SQL tự chạy). */
(function(){
if(window._progJs)return;window._progJs=1;
const esc2=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PG={rows:null,err:'',q:'',only:true,open:{}};
const PER=()=>(window.SAGA&&SAGA.PER_CH)||4;

/* dựng danh sách chặng giống saga-core buildCtx0 (chỉ cần số từ mỗi nhóm) */
function chapters(r){if(r.slug==='steel'||!r.cats)return ((window.SAGA&&SAGA.CHAPTERS)||[]).map(c=>c.name||c.n||'Chặng');
 const out=[],per=r.per||40;Object.keys(r.cats).forEach(c=>{const n=(r.cat_counts||{})[c]||0;
  if(r.kind==='cefr'){for(let i=0;i*per<n;i++){if(Math.min(per,n-i*per)>=4)out.push(c+'.'+(i+1)+' · '+r.cats[c])}}else if(n>=4)out.push(r.cats[c])});return out}
function status(r){const P=PER(),L=r.levels||{},C=r.certs||[],A=r.attempts||[];return chapters(r).map((name,ci)=>{
 let n=0;for(let k=1;k<=P;k++)if((L[ci*P+k]||0)>=1)n++;const cert=C.find(c=>c.chapter===ci),at=A.filter(a=>a.chapter===ci);
 const best=at.reduce((m,a)=>Math.max(m,a.total?Math.round(a.correct/a.total*100):0),0);
 return {ci,name,n,cert,tries:at.length,best,st:cert?'cert':n>=P?'ready':n>0?'learn':'lock'}})}

/* tóm tắt theo level CEFR: xong A1 · đang học A2 · cảnh báo khóa chưa có từ level kế tiếp */
function bands(r,ch){if(r.kind!=='cefr'||!r.cats)return '';const keys=Object.keys(r.cats),cnt=r.cat_counts||{};const done=[],out=[];let cur=null,miss=null;
 for(const b of keys){const cs=ch.filter(c=>c.name.startsWith(b+'.'));if(!cs.length){if(!cur&&!miss&&done.length)miss=b;continue}
  if(cs.every(c=>c.st==='cert'))done.push(b);else if(!cur)cur={b,ok:cs.filter(c=>c.st==='cert').length,n:cs.length}}
 if(done.length)out.push(`<span style="color:var(--good);font-weight:800">✅ Đã xong ${done.join(', ')}</span>`);
 if(cur)out.push(`<span>📘 Đang học <b>${cur.b}</b> · ${cur.ok}/${cur.n} chặng</span>`);
 else if(done.length){const nx=keys.find(k=>!done.includes(k)&&!(cnt[k]>=4));if(nx)out.push(`<span style="color:var(--bad)">⚠ Khóa chưa có từ ${nx} (cần thêm từ để học tiếp)</span>`);else out.push('<span>🎉 Đã hoàn thành cả khóa</span>')}
 else out.push('<span class="mut">Chưa có chứng chỉ nào</span>');
 return `<div class="row" style="gap:6px 12px;flex-wrap:wrap;margin-top:6px;font-size:.9rem">${out.join('')}</div>`}
function shortBand(r,ch){if(r.kind!=='cefr'||!r.cats)return '';const keys=Object.keys(r.cats);const done=keys.filter(b=>{const cs=ch.filter(c=>c.name.startsWith(b+'.'));return cs.length&&cs.every(c=>c.st==='cert')});
 if(!done.length)return '';const nx=keys.find(k=>!done.includes(k));return `✅ Xong ${done[done.length-1]}${nx?' → '+nx:''}`}
async function load(){PG.rows=null;PG.err='';render();const {data,error}=await SB.rpc('admin_learning');
 if(error){PG.err=/admin_learning|does not exist|schema cache/i.test(error.message)?'need':error.message;PG.rows=[]}else PG.rows=data||[];if(S.tab=='progadm')render()}
async function remind(uid,chName,track){if(!confirm('Gửi tin nhắn nhắc thi lên level '+chName+'?'))return;
 const {error}=await SB.from('messages').insert({user_id:uid,from_admin:true,body:`📝 Em đã đủ điều kiện thi lên level ${chName} (khóa ${track}). Vào trang Học → "Thi lên level" làm bài nhé, đạt 80% là có chứng chỉ! 💪`});
 toast(error?'Chưa gửi được: '+error.message:'Đã nhắc học viên ✓')}

function vProgAdm(){if(!(typeof PROF!='undefined'&&PROF&&PROF.is_admin))return '<p class="mut">Chỉ admin.</p>';
 if(PG.rows==null){if(!PG.loading){PG.loading=1;load().finally(()=>PG.loading=0)}return `<button class="link" onclick="go('admin')">‹ Quản trị</button><h1>Tiến độ & thi lên level</h1><p class="mut">Đang tải…</p>`}
 if(PG.err)return `<button class="link" onclick="go('admin')">‹ Quản trị</button><h1>Tiến độ & thi lên level</h1><div class="note">${PG.err=='need'?'Đang chờ GitHub Action chạy <b>supabase/learning_admin.sql</b>. Nếu lâu, vào Actions → Run SQL → nhập learning_admin.sql.':esc2(PG.err)}</div>`;
 /* gom theo học viên */
 const by={};PG.rows.forEach(r=>{(by[r.user_id]=by[r.user_id]||{id:r.user_id,name:r.name,email:r.email,tracks:[]}).tracks.push({r,ch:status(r)})});
 let U=Object.values(by);const q=PG.q.trim().toLowerCase();if(q)U=U.filter(u=>(u.name+' '+u.email).toLowerCase().includes(q));
 U.forEach(u=>{u.ready=u.tracks.reduce((a,t)=>a+t.ch.filter(c=>c.st=='ready').length,0);u.certs=u.tracks.reduce((a,t)=>a+t.ch.filter(c=>c.st=='cert').length,0)});
 U.sort((a,b)=>b.ready-a.ready||a.name.localeCompare(b.name));const shown=PG.only&&!q?U.filter(u=>u.ready):U;
 const totalReady=U.reduce((a,u)=>a+u.ready,0);
 return `<button class="link" onclick="go('admin')">‹ Quản trị</button><h1 style="margin:6px 0 4px">Tiến độ & thi lên level</h1>
 <p class="mut" style="margin:0 0 10px">${U.length} học viên · <b style="color:var(--warn)">${totalReady} bài thi đang chờ</b></p>
 <input class="ibx-search" type="search" placeholder="Tìm học viên (vd: Elly)…" aria-label="Tìm học viên" value="${esc2(PG.q)}" oninput="PGX.q(this.value)" style="width:100%;min-height:44px;box-sizing:border-box;border:1px solid var(--line);border-radius:12px;padding:0 12px;background:var(--card);color:var(--ink);font:inherit">
 <label class="row" style="gap:8px;margin:10px 0;font-size:.9rem;flex-wrap:nowrap"><input type="checkbox" ${PG.only?'checked':''} onchange="PGX.only(this.checked)" style="width:20px;height:20px"> Chỉ hiện người đang có bài thi chờ làm</label>
 ${shown.length?`<div class="stack">${shown.map(u=>{const op=PG.open[u.id]??(!!q||u.ready>0);
  return `<div class="card" style="padding:12px"><button class="row" style="width:100%;flex-wrap:nowrap;gap:10px;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer;padding:0" onclick="PGX.tog('${u.id}',${op})" aria-expanded="${op}"><span style="flex:1;min-width:0"><b>${esc2(u.name)}</b><small class="mut" style="display:block">${u.certs} chứng chỉ · ${u.tracks.length} khóa${u.tracks.map(t=>shortBand(t.r,t.ch)).filter(Boolean).map(x=>` · <b style="color:var(--good)">${x}</b>`).join('')}</small></span>${u.ready?`<span class="chip" style="background:var(--warn);color:#fff;border:0">⏳ ${u.ready} chờ thi</span>`:'<span class="chip">✓ Không có bài chờ</span>'}</button>
  ${op?u.tracks.map(({r,ch})=>{const done=ch.filter(c=>c.st=='cert'),todo=ch.filter(c=>c.st=='ready'),learn=ch.filter(c=>c.st=='learn'),nextLock=ch.find(c=>c.st=='lock');
   return `<div style="border-top:1px solid var(--line);margin-top:10px;padding-top:10px"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b style="font-size:.92rem">${esc2(r.track_name)}</b><small class="mut">${r.last_play?'học lần cuối '+new Date(r.last_play).toLocaleDateString('vi-VN'):'chưa chơi Đua level'}</small></div>${bands(r,ch)}
   ${done.length?`<details style="margin-top:6px"><summary class="mut" style="cursor:pointer;font-size:.86rem">🏅 Đã lên ${done.length} level (ẩn) · mới nhất ${esc2(done[done.length-1].cert.level||done[done.length-1].name)}</summary><div class="stack" style="gap:4px;margin-top:6px">${done.map(c=>`<small>🏅 ${esc2(c.cert.level||c.name)} · ${c.cert.score}% · ${new Date(c.cert.at).toLocaleDateString('vi-VN')}</small>`).join('')}</div></details>`:''}
   ${todo.map(c=>`<div class="row" style="flex-wrap:nowrap;gap:8px;margin-top:8px;padding:8px 10px;border-radius:12px;background:color-mix(in srgb,var(--warn) 14%,transparent)"><span style="flex:1;min-width:0;font-size:.9rem"><b>⏳ Chờ thi lên ${esc2(c.name)}</b><small class="mut" style="display:block">Đủ ${PER()}/${PER()} level${c.tries?` · đã thi ${c.tries} lần, cao nhất ${c.best}% (cần 80%)`:' · chưa thi lần nào'}</small></span><button class="chip" onclick="PGX.remind('${u.id}',${esc2(JSON.stringify(c.name))},${esc2(JSON.stringify(r.track_name))})">✉ Nhắc</button></div>`).join('')}
   ${learn.map(c=>`<small style="display:block;margin-top:6px">📘 Đang học ${esc2(c.name)} · ${c.n}/${PER()} level</small>`).join('')}
   ${!todo.length&&!learn.length&&nextLock?`<small class="mut" style="display:block;margin-top:6px">Tiếp theo: ${esc2(nextLock.name)} (chưa bắt đầu)</small>`:''}
   ${!ch.length?'<small class="mut">Khóa chưa có chặng.</small>':''}</div>`}).join(''):''}</div>`}).join('')}</div>`
 :`<p class="mut">${q?'Không tìm thấy học viên.':'Không có ai đang chờ thi. Bỏ chọn ô trên để xem tất cả.'}</p>`}`}

window.vProgAdm=vProgAdm;
window.PGX={q:v=>{PG.q=v;clearTimeout(PG.t);PG.t=setTimeout(()=>{render();const i=document.querySelector('.ibx-search');if(i){i.focus();i.setSelectionRange(v.length,v.length)}},250)},only:v=>{PG.only=v;render()},tog:(id,cur)=>{PG.open[id]=!cur;render()},remind,reload:()=>{PG.rows=null;render()}};
window.progCard=()=>`<button class="card login-nudge" onclick="PGX.reload();go('progadm')"><span class="tile2-ic">📈</span><span style="flex:1;text-align:left"><b>Tiến độ & thi lên level</b><small>Ai đã lên level, ai đang chờ thi · nhắc học viên</small></span><span class="chev">›</span></button>`;

/* ---- học viên: liệt kê mọi bài thi đang chờ ở trang Học + nhắc 1 lần/ngày ---- */
function hookExam(){if(typeof examHome!='function'||typeof SCTX!='function')return setTimeout(hookExam,400);if(window.examHome._all)return;
 const w=function(){try{const ch=SCTX().chapters||[];const R=ch.map((c,i)=>({c,i})).filter(x=>examState(x.i)=='ready');if(!R.length)return '';
  try{const k='ss-exam-nudge-'+(curTrack()?.slug||'steel'),d=new Date().toDateString();if(localStorage.getItem(k)!==d){localStorage.setItem(k,d);setTimeout(()=>toast(`📝 Bạn có ${R.length} bài thi lên level đang chờ: ${R.map(x=>x.c.name.split(' · ')[0]).join(', ')}`),900)}}catch(e){}
  return `<div class="card" style="padding:12px;border:2px solid var(--warn)"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b>🎓 Cần làm bài thi lên level</b><span class="chip" style="background:var(--warn);color:#fff;border:0">${R.length}</span></div>
   <small class="mut" style="display:block;margin:2px 0 8px">Bạn đã đủ sao ở các chặng dưới đây. Đạt 80% là nhận chứng chỉ.</small>
   <div class="stack" style="gap:6px">${R.map(x=>`<button class="row" style="width:100%;flex-wrap:nowrap;gap:10px;min-height:48px;padding:8px 10px;border:1px solid var(--line);border-radius:12px;background:var(--soft);color:var(--ink);font:inherit;text-align:left;cursor:pointer" onclick="examIntro(${x.i})"><span style="flex:1;min-width:0"><b>${esc2(x.c.name)}</b><small class="mut" style="display:block">20 câu · 12 phút</small></span><span style="color:var(--steel);font-weight:800">Thi ›</span></button>`).join('')}</div></div>`}catch(e){return ''}};
 w._all=1;window.examHome=w}
hookExam();
})();
