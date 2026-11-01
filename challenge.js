/* ===================== THÁCH ĐẤU TỪNG CÂU HỎI =====================
 - Trong bài trắc nghiệm / nghe, trả lời xong một câu → "⚔ Thách đấu": gửi đúng câu đó cho Kaka (luôn có),
   Admin (luôn có trong danh sách) hoặc bạn bè. Kaka trả lời ngay; người thật nhận thông báo và trả lời sau.
 - Kaka cũng chủ động thách đấu mỗi người tối đa 4 câu / ngày, cách nhau ít nhất 2 giờ.
 - Thắng: trả lời đúng; nếu cả hai cùng đúng (hoặc cùng sai) thì ai nhanh hơn thắng.
 Máy chủ: supabase/challenges.sql */
(function(){
const CH={targets:null,list:null,pending:0,uid:null,off:false,busy:false};window.CH=CH;
const on=()=>{try{return typeof USER!='undefined'&&USER&&typeof SB!='undefined'}catch(e){return false}};
const rr=()=>{try{render()}catch(e){}};
const KAKA_IMG='<img src="assets/kaka_m.png" alt="" style="width:100%;height:100%;object-fit:cover">';
const SW='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6M16 16l4 4M19 21l2-2"/><path d="M14.5 6.5 18 3h3v3l-3.5 3.5"/><path d="m5 14 4 4M7 17l-3 3M3 19l2 2"/></svg>';
const sec=ms=>(ms/1000).toFixed(1).replace('.',',')+' giây';
function css(){if(document.getElementById('chcss'))return;const s=document.createElement('style');s.id='chcss';s.textContent=`
.ch-ov{position:fixed;inset:0;z-index:2147483647;background:rgba(8,14,20,.62);display:flex;align-items:flex-end;justify-content:center;padding:12px;padding-bottom:calc(12px + env(safe-area-inset-bottom,0px));animation:chf .2s ease-out}
.ch-sheet{width:min(460px,100%);max-height:calc(100vh - 40px);max-height:calc(100dvh - 24px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:var(--card);color:var(--ink);border-radius:22px;padding:18px 16px 16px;box-shadow:0 18px 50px #0006;animation:chu .28s cubic-bezier(.2,.9,.3,1)}
.ch-row{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:8px 10px;border-radius:14px;text-align:left}
.ch-row:active{background:var(--soft)}.ch-av{width:42px;height:42px;flex:none;border-radius:50%;overflow:hidden;display:grid;place-items:center;background:var(--soft);font-family:var(--fd);font-weight:700}
.ch-vs{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;text-align:center;margin:14px 0}
.ch-vs .p{display:flex;flex-direction:column;align-items:center;gap:4px}.ch-vs .p .ch-av{width:64px;height:64px}
.ch-vs .win .ch-av{box-shadow:0 0 0 3px var(--amber)}.ch-x{font-family:var(--fd);font-weight:800;font-size:1.4rem;color:var(--bad)}
.ch-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:48px;margin-top:10px;border-radius:14px;border:1.5px dashed var(--bad);color:var(--bad);font-weight:700;background:color-mix(in srgb,var(--bad) 7%,var(--card))}
.ch-sheet .flash{min-height:0!important;padding:14px!important}.ch-sheet .flash .big{font-size:1.7rem}.ch-sheet .opt{min-height:48px;padding:10px 14px}
body.ch-open nav{visibility:hidden}
@keyframes chf{from{opacity:0}}@keyframes chu{from{transform:translateY(30px);opacity:0}}
@media (prefers-reduced-motion:reduce){.ch-ov,.ch-sheet{animation:none}}`;document.head.appendChild(s)}
function avatar(id,name,av){if(!id)return `<span class="ch-av">${KAKA_IMG}</span>`;try{if(typeof avatarHTML=='function')return `<span class="ch-av">${avatarHTML(av,id,42)}</span>`}catch(e){}return `<span class="ch-av">${esc((name||'?').trim()[0]||'?')}</span>`}
function sheet(html){css();document.querySelectorAll('.ch-ov').forEach(x=>{document.removeEventListener('keydown',x._kd);x.remove()});const ov=document.createElement('div');ov.className='ch-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
 ov.innerHTML=`<div class="ch-sheet">${html}</div>`;document.body.classList.add('ch-open');ov.onclick=e=>{if(e.target===ov)close()};document.body.appendChild(ov);
 const kd=e=>{if(e.key==='Escape')close()};document.addEventListener('keydown',kd);ov._kd=kd;setTimeout(()=>{const f=ov.querySelector('button');f&&f.focus()},40);return ov}
function close(){document.querySelectorAll('.ch-ov').forEach(x=>{document.removeEventListener('keydown',x._kd);x.remove()});document.body.classList.remove('ch-open')}
function needSql(e){return /challenge|function|does not exist/i.test(e?.message||'')}

/* ---------- bắt câu hỏi đang làm trong bài ---------- */
function snapshot(){try{const g=S.game;if(!g||g.saga||g.fc||g.ans==null||!g.opts)return null;const t=g.pool[g.i];if(!t)return null;
 const opts=g.opts.map(o=>String(o.vi||''));const ans=g.opts.indexOf(t);if(ans<0)return null;
 return {q:{en:String(t.en),vi:String(t.vi||''),ex:String(t.ex||''),opts,ans,mode:g.l.mode=='listen'?'listen':'quiz'},ok:g.opts[g.ans]===t,ms:g.ms||8000}}catch(e){return null}}
function hookGame(){const f=window.vGame;if(typeof f!='function'||f._ch)return;const w=function(...a){let h=f.apply(this,a);try{const g=S.game;
  if(g&&!g.saga&&!g.fc&&g.pool&&g.pool[g.i]){if(g._qi!==g.i){g._qi=g.i;g.qt=Date.now();g.ms=null}if(g.ans!=null&&g.ms==null)g.ms=Date.now()-(g.qt||Date.now())}
  if(on()&&!CH.off&&snapshot()){css();h+=`<button class="ch-btn" onclick="CHX.pick()">${SW} Thách đấu câu này</button>`}}catch(e){}return h};w._ch=1;window.vGame=w}
setTimeout(hookGame,0);setTimeout(hookGame,1500);

/* ---------- chọn người để thách ---------- */
async function loadTargets(){const {data,error}=await SB.rpc('challenge_targets');if(error){if(needSql(error))CH.off=true;CH.targets=[];return}CH.targets=data||[]}
async function pick(){const snap=snapshot();if(!snap)return;CH.snap=snap;
 const ov=sheet(`<div class="lbl">Thách đấu câu này</div><h2 style="margin:4px 0 2px">${esc(snap.q.en)}</h2><p class="mut" style="margin:0 0 10px;font-size:.88rem">Bạn ${snap.ok?'trả lời đúng':'trả lời sai'} trong ${sec(snap.ms)}. Ai đúng và nhanh hơn sẽ thắng.</p><div id="chlist"><p class="mut">Đang tải danh sách…</p></div><button class="btn ghost" style="width:100%;margin-top:8px" onclick="CHX.close()">Để sau</button>`);
 if(!CH.targets)await loadTargets();
 const L=CH.targets||[];const box=ov.querySelector('#chlist');if(!box)return;
 box.innerHTML=`<button class="ch-row" onclick="CHX.send(null)">${avatar(null)}<span style="flex:1;min-width:0"><b>Kaka</b><small class="mut" style="display:block">Luôn sẵn sàng · trả lời ngay</small></span><span class="chip on" style="display:inline-flex">${SW}</span></button>`+
  L.map(u=>`<button class="ch-row" onclick="CHX.send('${u.user_id}')">${avatar(u.user_id,u.name,u.avatar)}<span style="flex:1;min-width:0"><b>${esc(u.name)}</b><small class="mut" style="display:block">${u.is_admin?'Admin':'Bạn bè'}</small></span><span class="chip" style="display:inline-flex">${SW}</span></button>`).join('')+
  (CH.off?'<p class="note">Admin cần chạy supabase/challenges.sql để bật thách đấu với người khác.</p>':L.length?'':'<p class="mut" style="font-size:.84rem;margin:8px 4px 0">Kết bạn trong Đua level để thách đấu bạn bè.</p>')}
async function send(target){if(CH.busy||!CH.snap)return;CH.busy=true;const s=CH.snap;let trk='';try{trk=curTrack()?.name||''}catch(e){}
 const {data,error}=await SB.rpc('challenge_send',{target,q:s.q,ok:s.ok,ms:s.ms,trk});CH.busy=false;
 if(error){close();return toast(needSql(error)?'Admin cần chạy supabase/challenges.sql':error.message)}
 CH.list=null;if(!target){showResult(data,true);try{BDG&&BDG.evt&&BDG.evt('study')}catch(e){}}else{close();const u=(CH.targets||[]).find(x=>x.user_id==target);toast('Đã gửi thách đấu tới '+(u?u.name:'bạn'))}}

/* ---------- kết quả ---------- */
function verdict(c,meFrom){const a={ok:meFrom?c.from_ok:c.to_ok,ms:meFrom?c.from_ms:c.to_ms},b={ok:meFrom?c.to_ok:c.from_ok,ms:meFrom?c.to_ms:c.from_ms};
 if(a.ok&&!b.ok)return 'win';if(b.ok&&!a.ok)return 'lose';return a.ms<b.ms?'win':a.ms>b.ms?'lose':'tie'}
function showResult(c,meFrom,names){const v=verdict(c,meFrom);const me={name:'Bạn',id:USER.id},op=meFrom?{id:c.to_id,name:c.to_id?(names?.to||'Đối thủ'):'Kaka'}:{id:c.from_id,name:c.from_id?(names?.from||'Đối thủ'):'Kaka'};
 const mine=meFrom?{ok:c.from_ok,ms:c.from_ms}:{ok:c.to_ok,ms:c.to_ms},their=meFrom?{ok:c.to_ok,ms:c.to_ms}:{ok:c.from_ok,ms:c.from_ms};
 const col=p=>`<div class="p ${p.win?'win':''}">${p.av}<b>${esc(p.name)}</b><small style="color:var(${p.ok?'--good':'--bad'})">${p.ok?'✓ Đúng':'✕ Sai'} · ${sec(p.ms)}</small></div>`;
 const title=v=='win'?'Bạn thắng! 🏆':v=='lose'?(op.id?esc(op.name)+' thắng':'Kaka thắng 😼'):'Hòa!';
 sheet(`<div class="lbl" style="text-align:center">Kết quả thách đấu</div><h2 style="text-align:center;margin:4px 0">${title}</h2>
 <div class="ch-vs">${col({av:avatar(me.id,'B',(typeof PROF!='undefined'&&PROF?.avatar)||null),name:me.name,ok:mine.ok,ms:mine.ms,win:v=='win'})}<span class="ch-x">VS</span>${col({av:avatar(op.id,op.name),name:op.name,ok:their.ok,ms:their.ms,win:v=='lose'})}</div>
 <div class="card" style="padding:10px 12px"><b>${esc(c.q.en)}</b><div class="mut" style="font-size:.88rem">Đáp án: ${esc(c.q.opts[c.q.ans]||c.q.vi)}</div></div>
 ${!op.id&&v!='win'?'<p class="mut" style="font-size:.84rem;text-align:center;margin:8px 0 0">Kaka trả lời đúng khoảng 7/10 câu. Thử câu khác để phục thù!</p>':''}
 <div class="stack" style="margin-top:12px"><button class="btn" onclick="CHX.close()">Tiếp tục học</button><button class="btn ghost" onclick="CHX.close();go('duel')">Lịch sử thách đấu</button></div>`);
 if(v=='win'){try{navigator.vibrate&&navigator.vibrate([40,30,80])}catch(e){}}}

/* ---------- nhận & trả lời thách đấu ---------- */
async function loadList(){if(!on())return;const {data,error}=await SB.rpc('my_challenges');if(error){if(needSql(error))CH.off=true;CH.list=[];return}
 CH.list=data||[];const p=CH.list.filter(c=>c.status=='open'&&c.to_id==USER.id).length;const ch=p!==CH.pending;CH.pending=p;if(ch||S.tab=='duel')rr()}
function play(id){const c=(CH.list||[]).find(x=>x.id==id);if(!c)return;CH.cur={c,t0:Date.now(),done:false};const q=c.q;
 const say1=`say(${esc(JSON.stringify(q.en))})`;
 sheet(`<div class="row" style="justify-content:space-between;flex-wrap:nowrap">${avatar(c.from_id,c.from_name)}<div style="flex:1;min-width:0"><div class="lbl">${esc(c.from_name)} thách đấu bạn</div><small class="mut">${c.from_id?'':'Kaka đúng khoảng 7/10 câu. '}Chọn nghĩa đúng, càng nhanh càng tốt</small></div></div>
 ${q.mode=='listen'?`<div class="card flash" style="margin-top:12px"><div class="mut">Nghe và chọn nghĩa đúng</div><button class="mic" style="background:var(--steel)" onclick="${say1}" aria-label="Nghe">${typeof svg=='function'?svg('spk'):'🔊'}</button></div>`:`<div class="card flash" style="margin-top:12px"><div class="big">${esc(q.en)}</div><button class="ic" onclick="${say1}" aria-label="Nghe">${typeof svg=='function'?svg('spk'):'🔊'}</button></div>`}
 <div class="stack" style="margin-top:10px" id="chopts">${q.opts.map((o,k)=>`<button class="opt" onclick="CHX.answer(${k})">${esc(o)}</button>`).join('')}</div>`);
 if(q.mode=='listen')setTimeout(()=>{try{say(q.en)}catch(e){}},300)}
async function answer(k){const cur=CH.cur;if(!cur||cur.done)return;cur.done=true;const ms=Date.now()-cur.t0,ok=k===cur.c.q.ans;
 document.querySelectorAll('#chopts .opt').forEach((b,i)=>{b.disabled=true;if(i===cur.c.q.ans)b.classList.add('ok');else if(i===k)b.classList.add('no')});
 try{if(ok)say(cur.c.q.en)}catch(e){}
 const {data,error}=await SB.rpc('challenge_answer',{cid:cur.c.id,ok,ms});if(error){toast(error.message);return close()}
 setTimeout(()=>{showResult(data,false,{from:cur.c.from_name});CH.list=null;loadList()},650)}

/* ---------- Kaka chủ động thách đấu ---------- */
async function kakaDaily(){try{if(!on()||CH.off)return;const k='ss-kaka-ch-'+USER.id,last=+localStorage.getItem(k)||0;if(Date.now()-last<2*3600e3)return;
 const pool=(typeof TERMS!='undefined'&&TERMS||[]).filter(t=>t&&t.en&&t.vi);if(pool.length<4)return;
 const t=pool[Math.floor(Math.random()*pool.length)];const opts=[t,...pool.filter(x=>x.vi!==t.vi).sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);
 let trk='';try{trk=curTrack()?.name||''}catch(e){}
 const {error}=await SB.rpc('kaka_challenge',{q:{en:t.en,vi:t.vi,ex:t.ex||'',opts:opts.map(o=>o.vi),ans:opts.indexOf(t),mode:Math.random()<.3?'listen':'quiz'},trk});
 localStorage.setItem(k,String(Date.now()));if(!error)setTimeout(loadList,800)}catch(e){}}

/* ---------- giao diện ---------- */
function banner(){if(!on()||!CH.pending)return '';css();return `<button class="card login-nudge" style="margin-top:12px;border:1.5px solid var(--bad)" onclick="go('duel')"><span class="tile2-ic" style="color:var(--bad)">${SW}</span><span style="flex:1;text-align:left"><b>${CH.pending} lời thách đấu đang chờ</b><small>Trả lời nhanh để giành chiến thắng</small></span><span class="chev">›</span></button>`}
function meCard(){if(!on())return '';return `<button class="card login-nudge" style="margin-top:12px" onclick="go('duel')"><span class="tile2-ic">${SW}</span><span style="flex:1;text-align:left"><b>Thách đấu${CH.pending?` · <span style="color:var(--bad)">${CH.pending} đang chờ</span>`:''}</b><small>Với Kaka, Admin và bạn bè</small></span><span class="chev">›</span></button>`}
function vDuel(){css();if(!on())return '<h1>Thách đấu</h1><p class="mut">Đăng nhập để thách đấu.</p>';if(!CH.list){loadList();return '<h1>Thách đấu</h1><p class="mut">Đang tải…</p>'}
 const me=USER.id,open=CH.list.filter(c=>c.status=='open'&&c.to_id==me),wait=CH.list.filter(c=>c.status=='open'&&c.from_id==me),done=CH.list.filter(c=>c.status=='done');
 const W=done.filter(c=>verdict(c,c.from_id==me)=='win').length;
 const row=(c,act)=>{const fromMe=c.from_id==me,opId=fromMe?c.to_id:c.from_id,opName=fromMe?c.to_name:c.from_name;let tag='';
  if(c.status=='done'){const v=verdict(c,fromMe);tag=`<span class="chip ${v=='win'?'on':''}" style="${v=='lose'?'color:var(--bad)':''}">${v=='win'?'Thắng':v=='lose'?'Thua':'Hòa'}</span>`}else tag=act?'<span class="chip on">Trả lời</span>':'<span class="chip">Đang chờ</span>';
  return `<button class="ch-row card" style="padding:8px 12px" ${act?`onclick="CHX.play(${c.id})"`:c.status=='done'?`onclick="CHX.view(${c.id})"`:''}>${avatar(opId,opName)}<span style="flex:1;min-width:0"><b>${fromMe?'Bạn → ':''}${esc(opName)}</b><small class="mut" style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.q.en)} · ${new Date(c.created_at).toLocaleDateString('vi-VN')}</small></span>${tag}</button>`};
 return `<button class="link" onclick="go('home')">‹ Trang Học</button><h1 style="margin-top:6px">Thách đấu</h1>
 <p class="mut" style="font-size:.9rem">Trong bài trắc nghiệm, trả lời xong một câu rồi bấm <b>Thách đấu câu này</b>. Đúng thì thắng; cùng đúng thì ai nhanh hơn thắng.</p>
 <div class="row" style="gap:8px;margin-top:6px"><span class="chip on">${W} thắng</span><span class="chip">${done.length-W} còn lại</span>${CH.off?'<span class="chip" style="color:var(--bad)">Cần chạy challenges.sql</span>':''}</div>
 ${open.length?`<div class="sec-h"><h2>Đang chờ bạn</h2><span class="mut">${open.length}</span></div><div class="stack">${open.map(c=>row(c,true)).join('')}</div>`:''}
 ${wait.length?`<div class="sec-h"><h2>Bạn đã gửi</h2><span class="mut">${wait.length}</span></div><div class="stack">${wait.map(c=>row(c,false)).join('')}</div>`:''}
 <div class="sec-h"><h2>Kết quả</h2><span class="mut">${done.length}</span></div><div class="stack">${done.map(c=>row(c,false)).join('')||'<p class="mut">Chưa có trận nào. Hãy thử thách Kaka!</p>'}</div>`}
function view(id){const c=(CH.list||[]).find(x=>x.id==id);if(c)showResult(c,c.from_id==USER.id,{from:c.from_name,to:c.to_name})}

window.CHX={pick,send,close,play,answer,view,banner,meCard};window.vDuel=vDuel;
function hookHome(){const f=window.vHome;if(typeof f!='function'||f._ch)return;const w=function(...a){const h=f.apply(this,a);try{const b=banner();if(b){const i=h.indexOf('</div>',h.indexOf('class="topbar"'));if(i>0){const j=h.indexOf('</div>',i+6)+6;return h.slice(0,j)+b+h.slice(j)}return b+h}}catch(e){}return h};w._ch=1;window.vHome=w}
setTimeout(hookHome,0);setTimeout(hookHome,1500);
setInterval(()=>{const u=on()?USER.id:null;if(u!==CH.uid){CH.uid=u;CH.targets=null;CH.list=null;CH.pending=0;if(u){loadList();setTimeout(kakaDaily,4000)}}},2000);
setInterval(()=>{if(on()&&document.visibilityState==='visible')loadList()},45000);
setInterval(()=>{if(on()&&document.visibilityState==='visible')kakaDaily()},10*60e3);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&on())loadList()});
})();
