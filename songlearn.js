/* ===================== HỌC THEO BÀI HÁT (bài riêng) =====================
 Admin tải MP3 + dán lời → AI dịch nghĩa & chọn từ mới → "Chạm theo nhịp" để khớp thời gian từng câu
 → chia sẻ cho người được chọn. Người học: nghe, lời tự sáng theo ca sĩ, học & hát từng câu, AI chấm.
 Máy chủ: supabase/private_songs.sql (bảng private_songs, bucket riêng tư 'psong'). */
(function(){
const P={list:null,err:'',view:'list',song:null,url:'',i:-1,vi:true,hide:false,rate:1,loop:false,edit:null,people:null,sync:-1,busy:'',rec:null,res:{}};
const e2=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isAdm=()=>typeof PROF!='undefined'&&PROF&&PROF.is_admin;
const sb=()=>typeof SB!='undefined'?SB:null;
const rr=()=>{if(S.tab==='song'&&!S.game)render()};
const sungText=l=>String(l.en||'').replace(/\([^)]*\)[.…\s]*/g,'').trim();
const fmt=t=>t==null||isNaN(t)?'–:––':Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
/* Trình phát bằng Web Audio: giải mã cả bài vào bộ nhớ → tua chính xác tới từng phần nghìn giây
   (thẻ <audio> trên iPhone tua sai với MP3 bitrate thay đổi, làm lời lệch nhạc). */
class WA{constructor(){this.ctx=null;this.buf=null;this.src=null;this.off=0;this.t0=0;this.paused=true;this.rate=1;this.h={};this.url=''}
 on(e,f){(this.h[e]=this.h[e]||[]).push(f)}emit(e){(this.h[e]||[]).forEach(f=>{try{f()}catch(x){}})}
 get duration(){return this.buf?this.buf.duration:NaN}
 get currentTime(){return this.paused||!this.ctx?this.off:Math.min(this.duration||0,this.off+(this.ctx.currentTime-this.t0)*this.rate)}
 set currentTime(t){t=Math.max(0,Math.min(t,(this.duration||0)-0.01));if(this.paused){this.off=t}else{this._stop();this.off=t;this._start()}}
 get playbackRate(){return this.rate}set playbackRate(r){const c=this.currentTime;this.rate=r;if(!this.paused){this._stop();this.off=c;this._start()}}
 _ctx(){if(!this.ctx)this.ctx=new (window.AudioContext||window.webkitAudioContext)();return this.ctx}
 async load(url){this.pause();this.buf=null;this.off=0;this.url=url;const c=this._ctx();const ab=await (await fetch(url)).arrayBuffer();if(this.url!==url)return;
  this.buf=await new Promise((ok,no)=>{const p=c.decodeAudioData(ab,ok,no);p&&p.catch&&p.catch(no)});this.emit('loaded')}
 _start(){const c=this._ctx(),s=c.createBufferSource();s.buffer=this.buf;s.playbackRate.value=this.rate;s.connect(c.destination);
  s.onended=()=>{if(this.src===s&&!this.paused){this.off=this.duration;this.paused=true;this.src=null;this.emit('pause');this.emit('ended')}};
  this.t0=c.currentTime;s.start(0,this.off);this.src=s}
 _stop(){const s=this.src;this.src=null;if(s){s.onended=null;try{s.stop()}catch(e){}}}
 async play(){if(!this.buf)throw new Error('Nhạc chưa tải xong');const c=this._ctx();if(c.state!=='running')await c.resume();if(!this.paused)return;if(this.off>=this.duration-0.05)this.off=0;this.paused=false;this._start();this.emit('play')}
 pause(){if(this.paused)return;this.off=this.currentTime;this._stop();this.paused=true;this.emit('pause')}}
let A=null;function audio(){if(!A){A=new WA();A.on('ended',()=>{rr()});A.on('play',tick);A.on('pause',()=>{syncUI();uiBtn()});A.on('loaded',()=>{P.loading=false;rr();setTimeout(syncUI,30)})}return A}
async function loadAudio(s){const a=audio();P.loading=true;rr();try{await a.load(await signed(s))}catch(e){P.loading=false;P.err='Không tải được nhạc: '+(e.message||e);rr();throw e}}

/* ---------- tải dữ liệu ---------- */
async function load(){const c=sb();if(!c||typeof USER=='undefined'||!USER){P.list=[];return}
 const {data,error}=await c.from('private_songs').select('*').order('created_at',{ascending:false});
 P.err=error?(/private_songs|does not exist|schema cache/i.test(error.message)?'Chưa có bảng bài hát (supabase/private_songs.sql).':error.message):'';P.list=data||[];rr();try{if(S.tab=='home')render()}catch(e){}}
async function signed(s){const {data,error}=await sb().storage.from('psong').createSignedUrl(s.audio_path,3600);if(error)throw error;return data.signedUrl}
function count(){if(P.list==null){P.list=[];setTimeout(load,800)}return P.list.length}

/* ---------- danh sách ---------- */
function vList(){if(P.list==null){load();return '<h1>Học theo bài hát</h1><p class="mut">Đang tải…</p>'}
 return `<button class="link" onclick="go('home')">‹ Về trang Học</button><h1 style="margin-top:6px">Học theo bài hát</h1>
 <p class="mut" style="margin:0 0 12px">Nghe ca sĩ hát, lời sáng theo từng câu. Chạm vào câu để học và hát theo.</p>
 ${P.err?`<div class="note">${e2(P.err)}</div>`:''}
 <div class="ps-list">${P.list.map(s=>{const ls=s.lines||[],syn=ls.length&&ls.every(l=>l.t!=null);return `<div class="ps-item"><button class="ps-open" onclick="PSONG.open('${s.id}')" aria-label="Nghe ${e2(s.title)}"><span class="ps-ic" aria-hidden="true">${IC.note}</span><span class="ps-meta"><b>${e2(s.title)}</b><small>${e2(s.artist||'Chưa rõ ca sĩ')}</small><span class="ps-tags"><span>${ls.length} câu</span>${syn?'':'<span class="warn">Chưa khớp nhạc</span>'}${isAdm()?`<span>${IC.lock} ${(s.share_with||[]).length} người</span>`:''}</span></span><span class="ps-go" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg></span></button>${isAdm()?`<button class="ps-edit" onclick="PSONG.edit('${s.id}')" aria-label="Sửa ${e2(s.title)}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button>`:''}</div>`}).join('')||(isAdm()?'':'<p class="mut">Chưa có bài hát nào được chia sẻ cho bạn.</p>')}</div>
 ${isAdm()?`<button class="btn amber" style="width:100%;margin-top:12px" onclick="PSONG.edit(null)">＋ Thêm bài hát</button>`:''}`}

/* ---------- nghe & theo lời ---------- */
const IC={note:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
 prev:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 20L9 12l10-8z"/><path d="M5 19V5"/></svg>',
 next:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4l10 8-10 8z"/><path d="M19 5v14"/></svg>',
 loop:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
 mic:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4"/></svg>',
 play:'<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>',
 pause:'<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
 lock:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'};
const L=()=>(P.song&&P.song.lines)||[];
const startOf=k=>L()[k]&&L()[k].t;
const endOf=k=>{for(let j=k+1;j<L().length;j++)if(L()[j].t!=null)return L()[j].t;return (A&&A.duration)||((startOf(k)||0)+5)};
function lineAt(t){let k=-1;L().forEach((l,j)=>{if(l.t!=null&&l.t<=t+0.05)k=j});return k}
function wordsHTML(l,k){const ws=String(l.en).split(/(\s+)/);let n=0;return ws.map(w=>/^\s+$/.test(w)?w:`<span class="ps-w" data-k="${k}" data-n="${n++}">${e2(w)}</span>`).join('')}
function vPlay(){const s=P.song,ls=L();const t=A?A.currentTime:0;const cur=P.i;
 return `<div class="ps-top"><button class="ps-ib" aria-label="Quay lại" onclick="PSONG.back()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button><b class="ps-tt">Học theo bài hát</b>${isAdm()?`<button class="chip" onclick="PSONG.edit('${s.id}')">Sửa · khớp nhạc</button>`:`<span class="ps-priv">${IC.lock} Riêng tư</span>`}</div>
 <div class="ps-head"><div class="row" style="flex-wrap:nowrap;gap:12px;align-items:center"><span class="ps-cv" aria-hidden="true">${IC.note}</span><div style="flex:1;min-width:0"><b class="ps-name">${e2(s.title)}</b><small>${e2(s.artist||'')}${s.artist?' · ':''}${ls.length} câu</small></div><span class="mono" id="psn">${cur+1>0?cur+1:0}/${ls.length}</span></div>
 <div class="ps-bar" id="psbar" role="slider" aria-label="Vị trí bài hát" tabindex="0" onclick="PSONG.seekBar(event)"><i id="psfill"></i></div><div class="row mono" style="justify-content:space-between;font-size:.76rem;color:#c9d8e6"><span id="pst">${fmt(t)}</span><span id="psd">${fmt(A&&A.duration)}</span></div></div>
 ${P.loading?`<div class="note" style="margin-top:10px">Đang tải nhạc… (lần đầu khoảng vài giây)</div>`:''}${P.err?`<div class="note" style="margin-top:10px">${e2(P.err)}</div>`:''}
 ${ls.some(l=>l.t==null)?`<div class="note" style="margin-top:10px">Bài chưa khớp nhạc đủ${isAdm()?'. Bấm “Sửa” ở danh sách → “Chạm theo nhịp”.':', lời sẽ chưa tự sáng.'}</div>`:''}
 <div class="ps-lyr ${P.hide?'hide':''}" id="pslyr">${ls.map((l,k)=>`<div class="ps-l" id="psl${k}" onclick="PSONG.seek(${k})"><p class="ps-en ${sungText(l)?'':'ps-skip'}">${wordsHTML(l,k)}</p>${P.vi&&l.vi?`<p class="ps-vi">${e2(l.vi)}</p>`:''}${(l.words||[]).length?`<div class="ps-chips">${l.words.map(w=>`<span><b>${e2(w[0])}</b> · ${e2(w[1])}</span>`).join('')}</div>`:''}</div>`).join('')}</div>
 <div class="ps-dock"><div class="row" style="gap:8px;justify-content:center"><button class="chip" onclick="PSONG.rate()">Tốc độ ${P.rate}×</button><button class="chip ${P.vi?'on':''}" onclick="PSONG.tog('vi')">Hiện nghĩa</button><button class="chip ${P.hide?'on':''}" onclick="PSONG.tog('hide')">Ẩn lời</button></div>
 <div class="row" style="justify-content:space-between;align-items:center;margin-top:10px;flex-wrap:nowrap"><button class="ps-ib" aria-label="Câu trước" onclick="PSONG.step(-1)">${IC.prev}</button><button class="ps-ib ${P.loop?'on':''}" aria-label="Lặp lại câu này" aria-pressed="${P.loop}" onclick="PSONG.tog('loop')">${IC.loop}</button><button class="ps-pp" id="pspp" aria-label="Phát / tạm dừng" onclick="PSONG.pp()">${A&&!A.paused?IC.pause:IC.play}</button><button class="ps-ib" style="color:var(--bad)" aria-label="Học và hát câu này" onclick="PSONG.line(Math.max(0,PSONG.cur()))">${IC.mic}</button><button class="ps-ib" aria-label="Câu sau" onclick="PSONG.step(1)">${IC.next}</button></div></div>`}
let raf=0;function tick(){cancelAnimationFrame(raf);const f=()=>{syncUI();if(A&&!A.paused)raf=requestAnimationFrame(f)};f();uiBtn()}
function uiBtn(){const b=document.getElementById('pspp');if(b)b.innerHTML=A&&!A.paused?IC.pause:IC.play}
function syncUI(){if(!A||P.view!='play')return;const t=A.currentTime;
 if(P.loop&&P.i>=0&&startOf(P.i)!=null&&t>=endOf(P.i)-0.05){A.currentTime=startOf(P.i);return}
 const k=lineAt(t);const f=document.getElementById('psfill');if(f&&A.duration)f.style.width=(t/A.duration*100)+'%';
 const te=document.getElementById('pst');if(te)te.textContent=fmt(t);const de=document.getElementById('psd');if(de)de.textContent=fmt(A.duration);
 if(k!==P.i){const o=document.getElementById('psl'+P.i);o&&o.classList.remove('now');P.i=k;const n=document.getElementById('psl'+k);
  document.querySelectorAll('.ps-l').forEach((el,j)=>el.classList.toggle('past',j<k));
  if(n){n.classList.add('now');n.scrollIntoView({block:'center',behavior:'smooth'})}const c=document.getElementById('psn');if(c)c.textContent=(k+1)+'/'+L().length}
 if(k>=0){const s0=startOf(k),s1=endOf(k),ws=document.querySelectorAll(`#psl${k} .ps-w`);const fr=Math.min(1,Math.max(0,(t-s0)/Math.max(0.5,s1-s0)*1.08));const on=Math.ceil(fr*ws.length);
  ws.forEach((w,j)=>{w.classList.toggle('sung',j<on-1);w.classList.toggle('cur',j===on-1)})}}

/* ---------- học từng câu ---------- */
function vLine(){const k=P.i<0?0:P.i,l=L()[k];if(!l)return vPlay();const r=P.res[k];
 return `<div class="ps-top"><button class="ps-ib" aria-label="Quay lại bài hát" onclick="PSONG.toPlay()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button><div style="flex:1"><span class="lbl">CÂU ${k+1} / ${L().length}</span><b class="ps-tt" style="display:block">${e2(P.song.title)}</b></div></div>
 <div class="qbar" style="margin:8px 0 14px"><i style="width:${(k+1)/L().length*100}%"></i></div>
 <div class="card stack"><p class="ps-big">${e2(l.en)}</p>${l.vi?`<p class="mut" style="margin:0">${e2(l.vi)}</p>`:''}
 <div class="row" style="gap:8px;flex-wrap:nowrap"><button class="btn" style="flex:1" onclick="PSONG.clip(${k},1)" ${l.t==null?'disabled':''}>Nghe ca sĩ hát</button><button class="btn ghost" style="flex:1" onclick="PSONG.clip(${k},0.7)" ${l.t==null?'disabled':''}>Nghe chậm 0.7×</button></div></div>
 ${r?`<div class="card stack" style="margin-top:12px"><div class="row" style="justify-content:space-between;align-items:baseline;flex-wrap:nowrap"><b>Bạn vừa hát</b><span class="ps-score ${r.score>=80?'good':r.score>=60?'warn':'bad'}">${r.score}</span></div><p style="margin:0;font-size:1.1rem;line-height:1.6">${(r.words||[]).map(w=>`<span class="${w.s=='g'?'good':w.s=='y'?'warn':'bad'}" style="${w.s!='g'?'text-decoration:underline':''}">${e2(w.w)}</span>`).join(' ')}</p>${r.aiTip?`<p class="mut" style="margin:0;font-size:.86rem">${e2(r.aiTip)}</p>`:''}</div>`:''}
 ${P.err?`<div class="note" style="margin-top:12px">${e2(P.err)}</div>`:''}
 ${(l.words||[]).length?`<div class="lbl" style="margin:14px 0 8px">TỪ MỚI TRONG CÂU</div><div class="row" style="gap:8px">${l.words.map(w=>`<button class="chip" onclick="say('${e2(w[0]).replace(/'/g,'&#39;')}')"><b>${e2(w[0])}</b>&nbsp;· ${e2(w[1])}</button>`).join('')}</div>`:''}
 <div class="row" style="gap:12px;align-items:center;margin-top:18px;flex-wrap:nowrap"><button class="btn ghost" style="flex:1" onclick="PSONG.line(${k-1})" ${k<1?'disabled':''}>‹ Câu trước</button>
 ${sungText(l)?`<button class="ps-mic ${P.rec?'rec':''}" aria-label="${P.rec?'Dừng và chấm':'Bấm để hát'}" onclick="PSONG.sing(${k})" ${P.busy?'disabled':''}>${P.busy=='grade'?'…':P.rec?'■':IC.mic}</button>`:''}
 <button class="btn amber" style="flex:1" onclick="PSONG.line(${k+1})" ${k>=L().length-1?'disabled':''}>Câu sau ›</button></div>`}
let clipT=0;function clip(k,rate){const a=audio();clearTimeout(clipT);a.playbackRate=rate;a.currentTime=startOf(k);a.play().catch(()=>{});clipT=setTimeout(()=>a.pause(),(endOf(k)-startOf(k))/rate*1000+150)}
async function sing(k){if(P.rec){const r=P.rec;P.rec=null;await new Promise(ok=>{r.mr.onstop=ok;try{r.mr.stop()}catch(e){ok()}});try{r.st.getTracks().forEach(t=>t.stop())}catch(e){}
  const blob=new Blob(r.parts,{type:r.mime});if(blob.size<2000){P.err='Chưa nghe thấy gì, hát to hơn nhé.';return rr()}
  P.busy='grade';rr();const target=sungText(L()[k]);
  try{const b64=await new Promise((ok,no)=>{const f=new FileReader();f.onload=()=>ok(String(f.result).split(',')[1]);f.onerror=no;f.readAsDataURL(blob)});
   const res=await ai('pron',{audio:b64,mime:r.mime.split(';')[0],target});if(res.error)throw new Error(res.error);
   const g=gradeSpeech(target,String(res.heard||''),.9,false);if(res.tip)g.aiTip=res.tip;P.res[k]=g;
   if(g.score>=70&&!P.song._xp?.[k]){(P.song._xp=P.song._xp||{})[k]=1;try{S.xp+=5;save()}catch(e){}}}
  catch(e){P.err=e&&e.code=='login'?'Cần đăng nhập để AI chấm.':'Chưa chấm được: '+(e.message||e)}
  P.busy='';return rr()}
 P.err='';try{A&&A.pause()}catch(e){}
 let st;try{st=typeof micGet=='function'?await micGet():await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){P.err='Chưa được dùng micro.';try{window.MIC&&MIC.open()}catch(x){}return rr()}
 const mime=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(x=>window.MediaRecorder&&MediaRecorder.isTypeSupported(x))||'';const mr=new MediaRecorder(st,mime?{mimeType:mime}:{});const parts=[];mr.ondataavailable=e=>e.data.size&&parts.push(e.data);mr.start();
 P.rec={mr,st,parts,mime:mr.mimeType||mime||'audio/mp4'};rr();setTimeout(()=>{if(P.rec&&P.rec.mr===mr)sing(k)},15000)}

/* ---------- admin: thêm / sửa, khớp nhạc ---------- */
function vEdit(){const E=P.edit;if(!isAdm())return '<p class="mut">Chỉ admin.</p>';if(P.people==null){P.people=[];sb().rpc('psong_people').then(({data})=>{P.people=data||[];rr()})}
 if(P.sync>=0)return vSync();
 const ellyIds=P.people.filter(p=>/elly|hạnh|hanh/i.test(p.name+p.email)).map(p=>p.id);if(!E.id&&!E._def&&ellyIds.length){E.share=[...new Set([...E.share,...ellyIds])];E._def=1}
 return `<button class="link" onclick="PSONG.list()">‹ Danh sách bài hát</button><h1 style="margin-top:6px">${E.id?'Sửa bài hát':'Thêm bài hát riêng'}</h1>
 <div class="card stack"><label class="lbl" for="pst1">Tên bài</label><input id="pst1" value="${e2(E.title)}" oninput="PSONG.E.title=this.value"><label class="lbl" for="pst2">Ca sĩ</label><input id="pst2" value="${e2(E.artist)}" oninput="PSONG.E.artist=this.value">
 <label class="lbl" for="psf">File nhạc (MP3, M4A · tối đa 30 MB)</label><input id="psf" type="file" accept="audio/*" onchange="PSONG.E.file=this.files[0];PSONG.redraw()">
 <small class="mut">${E.file?'Sẽ tải lên: '+e2(E.file.name)+' · '+(E.file.size/1048576).toFixed(1)+' MB':E.audio_path?'✓ Đã có file nhạc (riêng tư)':'Chưa có file nhạc'}</small>
 <label class="lbl" for="psly">Lời bài hát (mỗi dòng 1 câu, dòng trống bỏ qua)</label><textarea id="psly" rows="8" oninput="PSONG.E.text=this.value">${e2(E.text)}</textarea><small class="mut">Khi lưu, AI dịch nghĩa tiếng Việt và chọn từ mới cho từng câu. Dòng như “(Whistle)” không bị chấm.</small></div>
 <div class="card stack" style="margin-top:12px"><b>${IC.lock} Chia sẻ cho</b>${P.people.map(p=>`<label class="row" style="gap:10px;flex-wrap:nowrap;min-height:40px"><input type="checkbox" ${E.share.includes(p.id)?'checked':''} onchange="PSONG.share('${p.id}',this.checked)"><span style="flex:1;min-width:0"><b>${e2(p.name)}</b> <small class="mut">${e2(p.email)}</small></span></label>`).join('')||'<small class="mut">Đang tải danh sách…</small>'}<small class="mut">Người không được chọn sẽ không thấy bài và không mở được file nhạc.</small></div>
 ${P.err?`<div class="note" style="margin-top:12px">${e2(P.err)}</div>`:''}
 <button class="btn amber" style="width:100%;margin-top:12px" onclick="PSONG.save()" ${P.busy?'disabled':''}>${P.busy||'Lưu bài hát'}</button>
 ${E.id&&(E.audio_path||E.file)?`<button class="btn" style="width:100%;margin-top:8px" onclick="PSONG.syncStart()">♪ Chạm theo nhịp (khớp lời với nhạc)</button>`:''}${E.id&&E.lines.length&&E.lines.every(l=>l.t!=null)?`<button class="btn ghost" style="width:100%;margin-top:8px" onclick="PSONG.adjust()">Chỉnh thời gian từng câu (không chạm lại)</button>`:''}
 ${E.id?`<button class="link" style="margin-top:14px;color:var(--bad)" onclick="PSONG.del()">Xóa bài hát này</button>`:''}`}
function vSync(){const ls=P.edit.lines,k=P.sync,n=ls.length;
 const card=k>=n?`<div class="card" style="text-align:center"><b>✓ Đã khớp đủ ${n} câu</b><p class="mut" style="margin:6px 0 0">Bấm ▶ ở vài câu bên dưới để nghe thử, rồi bấm Lưu.</p></div>`
  :k==0?`<div class="card" style="text-align:center"><span class="lbl">BƯỚC 1 · CHỜ CA SĨ BẮT ĐẦU HÁT</span><p class="ps-big" style="margin:8px 0">${e2(ls[0].en)}</p><small class="mut">Chạm ngay khi nghe chữ đầu tiên của câu này (bỏ qua đoạn nhạc dạo).</small></div>`
  :`<div class="card" style="border:2px solid var(--steel)"><span class="lbl">ĐANG HÁT · CÂU ${k}/${n}</span><p class="ps-big" style="margin:6px 0">${e2(ls[k-1].en)}</p></div><div class="card" style="margin-top:8px;opacity:.75"><span class="lbl">CÂU TIẾP</span><p style="margin:4px 0 0;font-weight:600">${e2(ls[k].en)}</p></div>`;
 return `<button class="link" onclick="PSONG.syncStop()">‹ Dừng khớp</button><h1 style="margin-top:6px">Chạm theo nhịp</h1>
 <p class="mut" style="margin:0 0 10px">${k==0?'Nhạc đang phát.':'Nghe câu đang hát. Khi ca sĩ <b>hát xong câu này và sang câu tiếp</b>, chạm nút lớn.'}</p>
 ${card}
 <button class="ps-tap" onclick="PSONG.tap()" ${k>=n?'disabled':''}>${k>=n?'Xong':k==0?'▶ Ca sĩ bắt đầu hát':'Sang câu tiếp ›'}</button>
 <div class="row" style="gap:8px;margin:10px 0;flex-wrap:nowrap"><button class="btn ghost" style="flex:1" onclick="PSONG.syncBack()">↶ Lùi 1 câu</button><button class="btn ghost" style="flex:1" onclick="PSONG.pp()">Phát / dừng</button><button class="btn amber" style="flex:1" onclick="PSONG.syncSave()" ${P.busy?'disabled':''}>Lưu</button></div>
 <div class="card stack" style="gap:8px;margin-bottom:10px"><b>Chỉnh cả bài</b><div class="row" style="gap:8px"><button class="chip" onclick="PSONG.shift(-1)">Lời hiện chậm 1 câu → sửa</button><button class="chip" onclick="PSONG.shift(1)">Lời hiện sớm 1 câu → sửa</button><button class="chip" onclick="PSONG.all(-0.5)">Cả bài sớm 0,5s</button><button class="chip" onclick="PSONG.all(0.5)">Cả bài muộn 0,5s</button></div><small class="mut">Chỉnh xong bấm ▶ ở một câu để nghe thử, rồi bấm Lưu.</small></div>
 <div class="card" style="padding:0">${ls.map((l,j)=>`<div class="row" style="flex-wrap:nowrap;gap:8px;padding:8px 12px;border-bottom:1px solid var(--line);${j==k?'background:var(--soft)':''}"><span class="mono" style="width:44px;color:var(--steel)">${l.t==null?'–':fmt(l.t)+(l.t%1).toFixed(1).slice(1)}</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e2(l.en)}</span>${l.t!=null?`<button class="chip" aria-label="Sớm hơn" onclick="PSONG.nudge(${j},-0.2)">−</button><button class="chip" aria-label="Muộn hơn" onclick="PSONG.nudge(${j},0.2)">＋</button><button class="chip" aria-label="Nghe từ câu này" onclick="PSONG.from(${j})">▶</button>`:''}</div>`).join('')}</div>`}
const parse=t=>String(t||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
async function save(){const E=P.edit,c=sb();P.err='';if(!E.title.trim())return P.err='Nhập tên bài.',rr();const en=parse(E.text);if(!en.length)return P.err='Dán lời bài hát.',rr();
 try{P.busy='Đang lưu…';rr();let id=E.id;
  if(!id){const {data,error}=await c.from('private_songs').insert({title:E.title.trim(),artist:E.artist.trim(),share_with:E.share}).select().single();if(error)throw error;id=E.id=data.id}
  let path=E.audio_path;if(E.file){P.busy='Đang tải nhạc lên…';rr();path=id+'/audio.'+((E.file.name.split('.').pop()||'mp3').toLowerCase());const {error}=await c.storage.from('psong').upload(path,E.file,{upsert:true,contentType:E.file.type||'audio/mpeg'});if(error)throw error;E.file=null}
  const old=E.lines||[];let lines=en.map((x,j)=>{const o=old.find(l=>l.en===x&&!l._u)||null;if(o)o._u=1;return o?{en:x,vi:o.vi,words:o.words,t:o.t}:{en:x,vi:'',words:[],t:old[j]&&old.length===en.length?old[j].t:null}});old.forEach(l=>delete l._u);
  const need=lines.map((l,j)=>j).filter(j=>!lines[j].vi&&sungText(lines[j]));
  if(need.length){P.busy='AI đang dịch '+need.length+' câu…';rr();try{const r=await ai('song_vi',{lines:need.map(j=>lines[j].en)});(r.lines||[]).forEach((x,q)=>{const j=need[q];if(j!=null&&x){lines[j].vi=String(x.vi||'');lines[j].words=Array.isArray(x.words)?x.words.slice(0,3):[]}})}catch(e){P.err='Đã lưu, nhưng AI chưa dịch được ('+(e.message||e)+'). Bấm Lưu lần nữa để thử lại.'}}
  const {error}=await c.from('private_songs').update({title:E.title.trim(),artist:E.artist.trim(),audio_path:path,lines,share_with:E.share,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw error;
  Object.assign(E,{audio_path:path,lines});P.busy='';if(!P.err)toast('Đã lưu bài hát');await load()}
 catch(e){P.busy='';P.err='Chưa lưu được: '+(e.message||e)}rr()}
async function syncStart(){const E=P.edit;if(E.file||!E.lines?.length){await save();if(!E.id||!E.lines?.length)return}
 const a=audio();try{if(a._sid!==E.audio_path||!a.buf){a._sid=E.audio_path;await loadAudio(E)}a.playbackRate=1;a.currentTime=0;await a.play()}catch(e){P.err='Không phát được nhạc: '+(e.message||e);return rr()}
 P.sync=0;E.lines.forEach(l=>l.t=null);rr()}
function tap(){const E=P.edit;if(P.sync>=E.lines.length)return;E.lines[P.sync].t=Math.max(0,+(A.currentTime-0.15).toFixed(2));P.sync++;rr()}
async function syncSave(){const E=P.edit;P.busy='Đang lưu…';rr();const {error}=await sb().from('private_songs').update({lines:E.lines,updated_at:new Date().toISOString()}).eq('id',E.id);P.busy='';if(error)P.err=error.message;else{toast('Đã lưu thời gian từng câu');try{A.pause()}catch(e){}P.sync=-1;await load()}rr()}

/* ---------- điều hướng ---------- */
async function open(id){const s=(P.list||[]).find(x=>x.id===id);if(!s)return;P.song=s;P.view='play';P.i=-1;P.err='';P.res={};go('song');scrollTo(0,0);
 if(!s.audio_path){P.err='Bài này chưa có file nhạc.';return rr()}
 const a=audio();a.playbackRate=P.rate;if(a.url&&a.buf&&a._sid===s.audio_path)return;a._sid=s.audio_path;loadAudio(s).catch(()=>{})}
function vSong(){css();return P.view=='play'&&P.song?vPlay():P.view=='line'&&P.song?vLine():P.view=='edit'&&P.edit?vEdit():vList()}
window.vSong=vSong;
window.SONGL={count:()=>count()+(isAdm()&&!count()?1:0)};
window.PSONG={open,get E(){return P.edit},cur:()=>P.i,redraw:rr,
 back(){try{A&&A.pause()}catch(e){}P.view='list';rr()},list(){try{A&&A.pause()}catch(e){}P.view='list';P.edit=null;P.sync=-1;rr()},
 pp(){const a=audio();if(!a.buf)return;if(a.paused){a.play().catch(e=>{P.err='Không phát được: '+e.message;rr()})}else a.pause()},
 seek(k){const t=startOf(k);if(t==null)return;const a=audio();a.currentTime=t;if(a.paused)a.play().catch(()=>{});syncUI()},
 seekBar(ev){const a=audio();if(!a.duration)return;const r=ev.currentTarget.getBoundingClientRect();a.currentTime=(ev.clientX-r.left)/r.width*a.duration;syncUI()},
 step(d){let k=Math.min(L().length-1,Math.max(0,(P.i<0?0:P.i)+d));while(startOf(k)==null&&k>0&&k<L().length-1)k+=d;PSONG.seek(k)},
 rate(){P.rate=P.rate==1?0.75:P.rate==0.75?0.6:1;if(A)A.playbackRate=P.rate;rr()},
 tog(k){P[k]=!P[k];rr();setTimeout(syncUI,30)},
 line(k){if(k<0||k>=L().length)return;try{A&&A.pause()}catch(e){}P.i=k;P.view='line';P.err='';rr();scrollTo(0,0)},
 toPlay(){P.view='play';P.err='';rr();setTimeout(()=>{const n=document.getElementById('psl'+P.i);n&&n.scrollIntoView({block:'center'});syncUI()},60)},
 clip,sing,
 edit(id){const s=id&&(P.list||[]).find(x=>x.id===id);P.edit=s?{id:s.id,title:s.title,artist:s.artist||'',text:(s.lines||[]).map(l=>l.en).join('\n'),lines:JSON.parse(JSON.stringify(s.lines||[])),audio_path:s.audio_path,share:[...(s.share_with||[])],file:null}:{id:null,title:'',artist:'',text:'',lines:[],audio_path:null,share:[],file:null};P.view='edit';P.err='';P.sync=-1;go('song');scrollTo(0,0)},
 share(id,on){const E=P.edit;E.share=on?[...new Set([...E.share,id])]:E.share.filter(x=>x!==id)},
 save,syncStart,async adjust(){const E=P.edit,a=audio();try{if(a._sid!==E.audio_path||!a.buf){a._sid=E.audio_path;await loadAudio(E)}}catch(e){return}P.sync=E.lines.length;rr()},tap,syncSave,syncStop(){try{A.pause()}catch(e){}P.sync=-1;rr()},
 syncBack(){if(P.sync>0){P.sync--;P.edit.lines[P.sync].t=null;A.currentTime=Math.max(0,(P.sync>0?P.edit.lines[P.sync-1].t:0)||0)}rr()},
 shift(d){const ls=P.edit.lines,o=ls.map(l=>l.t);if(o.some(t=>t==null))return toast('Cần khớp đủ các câu trước');
  if(d<0){ls.forEach((l,k)=>l.t=k?o[k-1]:Math.max(0,+(o[0]-(o[1]-o[0])).toFixed(2)))}else{ls.forEach((l,k)=>l.t=k<o.length-1?o[k+1]:+(o[k]+(o[k]-o[k-1])).toFixed(2))}
  P.sync=ls.length;toast('Đã dời lời 1 câu. Nghe thử rồi bấm Lưu');rr()},
 all(d){P.edit.lines.forEach(l=>{if(l.t!=null)l.t=Math.max(0,+(l.t+d).toFixed(2))});P.sync=P.edit.lines.length;rr()},
 nudge(j,d){const l=P.edit.lines[j];l.t=Math.max(0,+(l.t+d).toFixed(2));rr()},
 from(j){const a=audio();a.currentTime=P.edit.lines[j].t;a.play().catch(()=>{})},
 async del(){if(!confirm('Xóa bài hát này và file nhạc?'))return;const E=P.edit;if(E.audio_path)await sb().storage.from('psong').remove([E.audio_path]);await sb().from('private_songs').delete().eq('id',E.id);P.edit=null;P.view='list';await load()}};
/* đổi bài đang phát khi rời trang */
(function hookGo(){if(typeof go!='function'||go._ps)return setTimeout(hookGo,300);const g0=go;const w=function(t){if(t==='song'&&P.view==='list')setTimeout(load,0);if(t!=='song'){try{A&&A.pause()}catch(e){}if(P.rec){try{P.rec.mr.stop();P.rec.st.getTracks().forEach(x=>x.stop())}catch(e){}P.rec=null}}return g0.apply(this,arguments)};Object.assign(w,g0);w._ps=1;window.go=w})();
function css(){if(document.getElementById('ps-css'))return;const s=document.createElement('style');s.id='ps-css';s.textContent=`
.ps-top{display:flex;align-items:center;gap:8px;margin-bottom:10px}.ps-tt{font:700 1.2rem var(--fd)}.ps-top .ps-tt{flex:1}
.ps-ib{width:46px;height:46px;flex:none;border:0;border-radius:50%;display:grid;place-items:center;background:var(--soft);color:var(--steel);cursor:pointer}.ps-ib.on{background:var(--steel);color:#fff}
.ps-priv{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:99px;border:1px solid var(--line);background:var(--card);font-size:.78rem;color:var(--mut)}
.ps-head{padding:14px;border-radius:18px;background:#1b3f61;color:#fff;display:flex;flex-direction:column;gap:10px}.ps-head small{color:#c9d8e6;font-size:.8rem}
.ps-cv,.ps-ic{width:50px;height:50px;flex:none;border-radius:14px;background:#214b72;color:#f0b347;display:grid;place-items:center}.ps-ic{width:44px;height:44px;background:var(--soft);color:var(--steel)}
.ps-name{display:block;font:700 1.2rem/1.2 var(--fd)}
.ps-bar{height:8px;border-radius:99px;background:#214b72;cursor:pointer;position:relative}.ps-bar i{position:absolute;inset:0 auto 0 0;width:0;border-radius:99px;background:#f0b347}
.ps-lyr{display:flex;flex-direction:column;gap:6px;padding:14px 2px 210px}
.ps-l{padding:8px 12px;border-radius:14px;border:2px solid transparent;cursor:pointer;transition:background .2s}
.ps-en{margin:0;font-size:1.08rem;line-height:1.45;color:var(--ink)}.ps-l.past .ps-en{color:var(--mut);opacity:.7}.ps-skip{font-style:italic;color:var(--mut)!important}
.ps-vi,.ps-chips{display:none}.ps-l.now{background:var(--card);border-color:var(--steel)}.ps-l.now .ps-en{font:700 1.5rem/1.25 var(--fd);color:var(--mut)}
.ps-l.now .ps-vi{display:block;margin:6px 0 0;font-size:.9rem;color:var(--mut)}.ps-l.now .ps-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.ps-chips span{padding:3px 10px;border-radius:99px;background:var(--soft);font-size:.8rem}
.ps-w{transition:color .15s}.ps-l.now .ps-w.sung{color:var(--steel)}.ps-l.now .ps-w.cur{color:var(--steel);background:color-mix(in srgb,var(--amber) 35%,transparent);border-radius:6px}
.ps-lyr.hide .ps-l:not(.past) .ps-en{color:transparent!important;text-shadow:0 0 9px color-mix(in srgb,var(--ink) 55%,transparent)}
.ps-dock{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom) + 72px);width:min(480px,calc(100% - 16px));box-sizing:border-box;padding:10px 14px 12px;border-radius:20px;background:var(--card);border:1px solid var(--line);box-shadow:0 8px 28px rgba(0,0,0,.14);z-index:20}
.ps-pp{width:66px;height:66px;border:0;border-radius:50%;background:var(--amber);color:#14212e;display:grid;place-items:center;cursor:pointer}
.ps-big{margin:0;font:700 1.6rem/1.2 var(--fd)}.ps-score{font:700 2.2rem var(--fd)}
.ps-mic{width:76px;height:76px;flex:none;border:0;border-radius:50%;background:var(--bad);color:#fff;display:grid;place-items:center;font-size:1.4rem;cursor:pointer}.ps-mic.rec{animation:cvp 1.2s infinite}
.ps-tap{width:100%;min-height:120px;border:0;border-radius:20px;margin-top:12px;background:var(--steel);color:#fff;font:700 1.6rem var(--fd);cursor:pointer}.ps-tap:active{transform:scale(.98)}
.ps-list{display:flex;flex-direction:column;gap:10px}
.ps-item{display:flex;align-items:stretch;border:1px solid var(--line);border-radius:16px;background:var(--card);overflow:hidden}
.ps-open{flex:1;min-width:0;display:flex;align-items:center;gap:12px;padding:12px 12px 12px 14px;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
.ps-open:active{background:var(--soft)}
.ps-meta{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.ps-meta b{font:700 1.08rem/1.25 var(--fd);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ps-meta small{color:var(--mut);font-size:.84rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ps-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}.ps-tags span{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;background:var(--soft);font-size:.74rem;color:var(--mut)}.ps-tags .warn{background:color-mix(in srgb,var(--amber) 22%,transparent);color:#946014}
.ps-go{width:38px;height:38px;flex:none;border-radius:50%;display:grid;place-items:center;background:var(--amber);color:#14212e;padding-left:2px}
.ps-edit{width:48px;flex:none;border:0;border-left:1px solid var(--line);background:none;color:var(--mut);display:grid;place-items:center;cursor:pointer}.ps-edit:active{background:var(--soft)}
body:has(.ps-dock) #msgfab{display:none!important}
@media (prefers-reduced-motion:reduce){.ps-mic.rec{animation:none}}`;document.head.appendChild(s)}
})();
