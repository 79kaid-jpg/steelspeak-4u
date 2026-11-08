/* ===================== HỌC THEO BÀI HÁT =====================
 Học một mình với 10 bài hát có sẵn (assets/duet/): nghe ca sĩ từng câu, xem nghĩa tiếng Việt và từ mới,
 hát theo nhạc beat, AI chấm từng câu. Tiến độ lưu trong máy (localStorage). Mỗi câu ≥70 điểm lần đầu: +10 XP. */
(function(){
const VI={
 twinkle:{lines:['Lấp lánh, lấp lánh, ngôi sao nhỏ','Tôi tự hỏi bạn là gì','Trên cao, cao hơn cả thế gian','Như viên kim cương trên bầu trời','Lấp lánh, lấp lánh, ngôi sao nhỏ','Tôi tự hỏi bạn là gì'],words:[['twinkle','lấp lánh'],['wonder','tự hỏi'],['above','phía trên'],['diamond','kim cương'],['sky','bầu trời']]},
 mary:{lines:['Mary có một chú cừu non','Cừu non, cừu non','Mary có một chú cừu non','Bộ lông của nó trắng như tuyết'],words:[['lamb','cừu non'],['fleece','bộ lông cừu'],['white','trắng'],['snow','tuyết']]},
 baa:{lines:['Be be, cừu đen ơi, bạn có len không?','Có ạ, có ạ, ba túi đầy','Một cho ông chủ, một cho bà chủ','Và một cho cậu bé sống cuối ngõ','Be be, cừu đen ơi, bạn có len không?','Có ạ, có ạ, ba túi đầy'],words:[['sheep','con cừu'],['wool','len'],['bag','túi'],['master','ông chủ'],['dame','bà chủ'],['lane','ngõ, đường nhỏ']]},
 london:{lines:['Cầu London đang sập xuống','Sập xuống, sập xuống','Cầu London đang sập xuống','Thưa quý cô xinh đẹp'],words:[['bridge','cây cầu'],['fall down','sập, đổ xuống'],['fair','xinh đẹp'],['lady','quý cô']]},
 sleeping:{lines:['Anh đang ngủ à, anh đang ngủ à','Anh John ơi, anh John ơi?','Chuông buổi sáng đang reo, chuông buổi sáng đang reo','Đinh, đang, đông. Đinh, đang, đông.'],words:[['sleep','ngủ'],['brother','anh/em trai'],['morning','buổi sáng'],['bell','cái chuông'],['ring','reo, rung']]},
 hotcross:{lines:['Bánh bao chữ thập nóng hổi','Bánh bao chữ thập nóng hổi','Một xu một cái, một xu hai cái','Bánh bao chữ thập nóng hổi'],words:[['hot','nóng'],['cross','chữ thập'],['bun','bánh bao ngọt'],['penny','đồng xu']]},
 macdonald:{lines:['Ông MacDonald có một nông trại','E-I-E-I-O','Và trong trại ông có một con bò','E-I-E-I-O','Bò kêu "moo moo" chỗ này, "moo moo" chỗ kia','Chỗ này "moo", chỗ kia "moo", khắp nơi "moo moo"','Ông MacDonald có một nông trại','E-I-E-I-O'],words:[['farm','nông trại'],['cow','con bò'],['here','ở đây'],['there','ở kia'],['everywhere','khắp nơi']]},
 row:{lines:['Chèo, chèo, chèo thuyền đi','Nhẹ nhàng xuôi theo dòng suối','Vui vẻ, vui vẻ, vui vẻ, vui vẻ','Cuộc đời chỉ là một giấc mơ'],words:[['row','chèo (thuyền)'],['boat','con thuyền'],['gently','nhẹ nhàng'],['stream','dòng suối'],['merrily','vui vẻ'],['dream','giấc mơ']]},
 jingle:{lines:['Chuông reo, chuông reo','Reo vang suốt đường đi','Ôi vui biết bao khi được ngồi','Trên chiếc xe trượt tuyết một ngựa, hây!','Chuông reo, chuông reo','Reo vang suốt đường đi','Ôi vui biết bao khi được ngồi','Trên chiếc xe trượt tuyết một ngựa'],words:[['jingle','tiếng leng keng'],['all the way','suốt chặng đường'],['fun','niềm vui'],['ride','đi (xe), cưỡi'],['sleigh','xe trượt tuyết']]},
 joyful:{lines:['Hân hoan, hân hoan, chúng con tôn thờ Ngài','Chúa vinh quang, Chúa của tình yêu','Trái tim mở ra như hoa trước Ngài','Hé nở đón ánh mặt trời trên cao','Xua tan mây u ám của tội lỗi và nỗi buồn','Đẩy lùi bóng tối của hoài nghi','Đấng ban niềm vui bất tận','Lấp đầy chúng con bằng ánh sáng ban ngày!'],words:[['joyful','hân hoan'],['adore','tôn thờ, yêu mến'],['glory','vinh quang'],['unfold','mở ra'],['sadness','nỗi buồn'],['doubt','sự nghi ngờ'],['gladness','niềm vui']]}
};
const SG={id:null,cat:null,err:'',rec:null,busy:false,cur:-1,res:{},play:-1};
const LS='ss-song-'+'v1';
const prog=()=>{try{return JSON.parse(localStorage.getItem(LS)||'{}')}catch(e){return {}}};
const saveProg=p=>{try{localStorage.setItem(LS,JSON.stringify(p))}catch(e){}};
fetch('assets/duet/songs.json').then(r=>r.json()).then(c=>{SG.cat=c;if(S.tab=='song')render()}).catch(()=>{SG.err='Không tải được danh sách bài hát'});
const esc2=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let _ac=null;const AC=()=>{if(!_ac)_ac=new (window.AudioContext||window.webkitAudioContext)();if(_ac.state=='suspended')_ac.resume();return _ac};
const BUF={};async function buf(id,kind){const k=id+'-'+kind;if(BUF[k])return BUF[k];const r=await fetch('assets/duet/'+k+'.mp3');if(!r.ok)throw new Error('Không tải được nhạc');return BUF[k]=await AC().decodeAudioData(await r.arrayBuffer())}
let PL=null,PT=0;function stop(){try{PL&&PL.stop()}catch(e){}PL=null;clearTimeout(PT);if(SG.play>=0){SG.play=-1;mark()}}
function seg(b,from,to,delay=0){stop();const ac=AC(),s=ac.createBufferSource();s.buffer=b;s.connect(ac.destination);const at=ac.currentTime+delay;s.start(at,Math.max(0,from/1000),Math.max(.1,(to-from)/1000));PL=s;return at}
const song=()=>SG.cat&&SG.cat.find(c=>c.id==SG.id);
function mark(){document.querySelectorAll('.sl-line').forEach(el=>el.classList.toggle('on',+el.dataset.i===SG.play))}

/* nghe một câu (ca sĩ) */
async function hear(i){const c=song();if(!c)return;AC();try{const b=await buf(c.id,'voc');const t=c.times[i];seg(b,t.start,t.end+150);SG.play=i;mark();PT=setTimeout(()=>{SG.play=-1;mark()},t.end-t.start+200)}catch(e){toast(e.message)}}
/* nghe cả bài, câu đang hát sáng lên */
async function hearAll(){const c=song();if(!c)return;if(PL){stop();render();return}AC();try{const b=await buf(c.id,'voc');const at0=_ac.currentTime;seg(b,0,c.secs*1000);
 const step=()=>{if(!PL)return;const ms=(_ac.currentTime-at0)*1000;const i=c.times.findIndex(t=>ms>=t.start&&ms<=t.end+300);if(i!==SG.play){SG.play=i;mark();if(i>=0)document.querySelector(`.sl-line[data-i="${i}"]`)?.scrollIntoView({block:'center',behavior:'smooth'})}
  if(ms>c.secs*1000){stop();render();return}PT=setTimeout(step,120)};step();render()}catch(e){toast(e.message)}}

/* hát theo beat một câu, thu âm, AI chấm */
const norm=s=>s.toLowerCase().replace(/[’']/g,"'").replace(/[^a-z' ]+/g,' ').split(/\s+/).filter(Boolean);
function scoreW(target,heard){const T=norm(target),P=norm(heard),wrong=[];for(const w of T){const k=P.indexOf(w);if(k>=0)P.splice(k,1);else wrong.push(w)}return {score:T.length?Math.round((T.length-wrong.length)/T.length*100):0,wrong:[...new Set(wrong)]}}
async function sing(i){const c=song();if(!c||SG.busy)return;
 if(SG.rec){return finish()}
 if(typeof USER=='undefined'||!USER){toast('Đăng nhập để AI chấm điểm');return go('me')}
 AC();let beat;try{beat=await buf(c.id,'beat')}catch(e){return toast(e.message)}
 stop();try{_ac.state==='running'&&await _ac.suspend()}catch(e){}
 let stream;try{stream=typeof micGet=='function'?await micGet():await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){try{await _ac.resume()}catch(_){}if(window.MIC&&MIC.open)MIC.open();return toast('Chưa dùng được micro')}
 const mt=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(x=>window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(x))||'';
 const mr=new MediaRecorder(stream,mt?{mimeType:mt}:{}),ch=[];mr.ondataavailable=e=>{if(e.data.size)ch.push(e.data)};mr.start();
 try{await _ac.resume()}catch(e){}
 const t=c.times[i],lead=Math.min(1500,t.start);seg(beat,t.start-lead,t.end+400,.15);
 SG.rec={mr,stream,ch,i,mt,cue:Date.now()+150+lead};SG.cur=i;render();
 SG.rec.auto=setTimeout(()=>{if(SG.rec)finish()},150+lead+(t.end-t.start)+800);
 const tick=()=>{if(!SG.rec)return;const el=document.getElementById('sl-st');if(el){const d=SG.rec.cue-Date.now();el.textContent=d>0?`Nhạc dạo… hát sau ${Math.ceil(d/1000)}`:'● Hát đi! Chạm lại để dừng'}setTimeout(tick,150)};tick()}
async function finish(){const R=SG.rec;if(!R)return;SG.rec=null;clearTimeout(R.auto);stop();SG.busy=true;render();
 const blob=await new Promise(res=>{R.mr.onstop=()=>{R.stream.getTracks().forEach(t=>t.stop());res(new Blob(R.ch,{type:R.mr.mimeType||R.mt||'audio/mp4'}))};try{R.mr.stop()}catch(e){R.stream.getTracks().forEach(t=>t.stop());res(new Blob(R.ch))}});
 const c=song(),line=c.lines[R.i];
 try{if(blob.size<1500)throw new Error('Bản thu quá ngắn, hát to hơn nhé');
  const b64=await new Promise((ok,no)=>{const fr=new FileReader();fr.onload=()=>ok(String(fr.result).split(',')[1]);fr.onerror=no;fr.readAsDataURL(blob)});
  const r=await ai('pron',{audio:b64,mime:(blob.type||'audio/mp4').split(';')[0],target:line});if(r&&r.error)throw new Error(r.error);
  const sc=scoreW(line,String(r?.heard||''));SG.res[R.i]={...sc,heard:String(r?.heard||''),url:URL.createObjectURL(blob)};
  const P=prog(),k=c.id;P[k]=P[k]||{best:{}};const old=P[k].best[R.i]||0;
  if(sc.score>old)P[k].best[R.i]=sc.score;
  if(sc.score>=70&&old<70){S.xp+=10;try{tick()}catch(e){}save()}
  saveProg(P);
 }catch(e){toast(e.message||'Chưa chấm được')}
 SG.busy=false;render()}
/* hát cả bài: phát beat từ đầu, chữ đang hát sáng lên, thu một lần rồi AI chấm cả bài và chia điểm từng câu */
async function singAll(){const c=song();if(!c||SG.busy)return;
 if(SG.all){return finishAll()}
 if(SG.rec)return;if(typeof USER=='undefined'||!USER){toast('Đăng nhập để AI chấm điểm');return go('me')}
 AC();let beat;try{beat=await buf(c.id,'beat')}catch(e){return toast(e.message)}
 stop();try{_ac.state==='running'&&await _ac.suspend()}catch(e){}
 let stream;try{stream=typeof micGet=='function'?await micGet():await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){try{await _ac.resume()}catch(_){}if(window.MIC&&MIC.open)MIC.open();return toast('Chưa dùng được micro')}
 const mt=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(x=>window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(x))||'';
 const mr=new MediaRecorder(stream,mt?{mimeType:mt}:{}),ch=[];mr.ondataavailable=e=>{if(e.data.size)ch.push(e.data)};mr.start();
 try{await _ac.resume()}catch(e){}
 const at0=seg(beat,0,c.secs*1000,.15);SG.all={mr,stream,ch,mt};SG.allRes=null;render();
 const step=()=>{if(!SG.all)return;const ms=(_ac.currentTime-at0)*1000;const i=c.times.findIndex(t=>ms>=t.start-250&&ms<=t.end+150);
  if(i!==SG.play){SG.play=i;mark();if(i>=0)document.querySelector(`.sl-line[data-i="${i}"]`)?.scrollIntoView({block:'center',behavior:'smooth'})}
  const el=document.getElementById('sl-all-st');if(el){const nx=c.times.find(t=>t.start>ms);el.textContent=ms<c.times[0].start?`Nhạc dạo… vào sau ${Math.ceil((c.times[0].start-ms)/1000)} giây`:`● Đang hát câu ${Math.max(1,i+1)}/${c.lines.length} · chạm để dừng`}
  if(ms>c.secs*1000+300){finishAll();return}setTimeout(step,120)};step()}
async function finishAll(){const R=SG.all;if(!R)return;SG.all=null;try{PL&&PL.stop()}catch(e){}PL=null;SG.play=-1;SG.busy=true;render();
 const blob=await new Promise(res=>{R.mr.onstop=()=>{R.stream.getTracks().forEach(t=>t.stop());res(new Blob(R.ch,{type:R.mr.mimeType||R.mt||'audio/mp4'}))};try{R.mr.stop()}catch(e){R.stream.getTracks().forEach(t=>t.stop());res(new Blob(R.ch))}});
 const c=song();
 try{if(blob.size<4000)throw new Error('Bản thu quá ngắn, thử hát lại cả bài nhé');
  const b64=await new Promise((ok,no)=>{const fr=new FileReader();fr.onload=()=>ok(String(fr.result).split(',')[1]);fr.onerror=no;fr.readAsDataURL(blob)});
  const r=await ai('pron',{audio:b64,mime:(blob.type||'audio/mp4').split(';')[0],target:c.lines.join('. ')});if(r&&r.error)throw new Error(r.error);
  /* chia điểm: dò lần lượt từng câu trên lời AI nghe được, từ đã dùng thì bỏ ra */
  const pool=norm(String(r?.heard||''));let tot=0,okw=0;const P=prog();P[c.id]=P[c.id]||{best:{}};let gain=0;
  c.lines.forEach((l,i)=>{const T=norm(l),wrong=[];for(const w of T){const k=pool.indexOf(w);if(k>=0&&k<40)pool.splice(k,1);else wrong.push(w)}
   const sc=T.length?Math.round((T.length-wrong.length)/T.length*100):0;tot+=T.length;okw+=T.length-wrong.length;
   SG.res[i]={score:sc,wrong:[...new Set(wrong)]};const old=P[c.id].best[i]||0;if(sc>old)P[c.id].best[i]=sc;if(sc>=70&&old<70)gain+=10});
  const total=tot?Math.round(okw/tot*100):0;SG.allRes={total,url:URL.createObjectURL(blob)};
  if(total>((P[c.id].full)||0))P[c.id].full=total;saveProg(P);
  if(gain){S.xp+=gain;try{tick()}catch(e){}save()}
  toast(`Cả bài: ${total} điểm${gain?` · +${gain} XP`:''}`);
 }catch(e){toast(e.message||'Chưa chấm được')}
 SG.busy=false;render()}
function playMine(i){const r=i=='all'?SG.allRes:SG.res[i];if(!r||!r.url)return;stop();const a=new Audio(r.url);a.play().catch(()=>{})}

function open(id){stop();SG.id=id;SG.res={};SG.allRes=undefined;SG.cur=-1;go('song');scrollTo(0,0)}
function back(){stop();if(SG.rec)finish();if(SG.all)finishAll();SG.id=null;render();scrollTo(0,0)}

const css=`.sl-hero{border-radius:20px;padding:18px;color:#fff;background:linear-gradient(140deg,#14b8a6,#0e6aa8);display:flex;flex-direction:column;gap:6px}
.sl-hero h1{margin:0;color:#fff;font-size:1.4rem}.sl-hero p{margin:0;opacity:.92;font-size:.88rem}
.sl-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.sl-c{display:flex;flex-direction:column;gap:6px;text-align:left;padding:14px;border-radius:18px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;cursor:pointer;min-height:118px}
.sl-c b{font:700 .95rem/1.25 var(--fd)}.sl-c small{color:var(--mut);font-size:.78rem}
.sl-c .sl-n{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,#14b8a6 16%,transparent);color:#0e7c72;font-size:1.2rem}
.sl-bar{height:6px;border-radius:99px;background:var(--soft);overflow:hidden;margin-top:auto}.sl-bar i{display:block;height:100%;background:#14b8a6;border-radius:inherit}
.sl-line{border-radius:16px;border:1px solid var(--line);background:var(--card);padding:12px;display:flex;flex-direction:column;gap:6px;transition:background .2s,border-color .2s}
.sl-line.on{border-color:#14b8a6;background:color-mix(in srgb,#14b8a6 12%,var(--card))}
.sl-en{font:700 1.02rem/1.35 var(--fd)}.sl-vi{color:var(--mut);font-size:.88rem}
.sl-act{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.sl-act button{min-height:40px}
.sl-sc{font:800 .82rem var(--fd);padding:4px 10px;border-radius:99px}.sl-sc.ok{background:color-mix(in srgb,var(--good) 18%,transparent);color:var(--good)}.sl-sc.no{background:color-mix(in srgb,var(--bad) 15%,transparent);color:var(--bad)}
.sl-rec{background:var(--bad)!important;color:#fff!important;animation:slp 1s infinite}@keyframes slp{50%{opacity:.7}}
.sl-words{display:flex;flex-wrap:wrap;gap:6px}.sl-words span{padding:6px 10px;border-radius:12px;background:var(--soft);font-size:.86rem}
@media (prefers-reduced-motion:reduce){.sl-rec{animation:none}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

function vSong(){
 if(!SG.cat)return `<button class="link" onclick="go('home')">‹ Trang Học</button><p class="mut">${SG.err||'Đang tải bài hát…'}</p>`;
 const P=prog();const pc=c=>{const b=(P[c.id]||{}).best||{};return Math.round(c.lines.filter((_,i)=>(b[i]||0)>=70).length/c.lines.length*100)};
 const c=song();
 if(!c)return `<button class="link" onclick="go('home')">‹ Trang Học</button>
  <div class="sl-hero" style="margin-top:8px"><h1>Học theo bài hát</h1><p>Nghe ca sĩ hát từng câu, hiểu nghĩa, rồi hát theo nhạc. AI chấm từng câu, đạt 70 điểm được +10 XP.</p></div>
  <div class="sl-grid">${SG.cat.map(s=>`<button class="sl-c" onclick="SONGL.open('${s.id}')"><span class="row" style="justify-content:space-between;flex-wrap:nowrap"><span class="sl-n" aria-hidden="true">♪</span><span class="chip" style="font-size:.72rem">${s.level}</span></span><b>${esc2(s.title)}</b><small>${s.lines.length} câu · ${pc(s)}% thuộc</small><span class="sl-bar"><i style="width:${pc(s)}%"></i></span></button>`).join('')}</div>
  <button class="card login-nudge" style="margin-top:14px" onclick="go('duet')"><span class="tile2-ic">🎤</span><span style="flex:1;text-align:left"><b>Hát nối cùng bạn bè</b><small>Thuộc bài rồi? Rủ bạn hát mỗi người một câu</small></span><span class="chev">›</span></button>`;
 const V=VI[c.id]||{lines:[],words:[]},best=(P[c.id]||{}).best||{};
 return `<button class="link" onclick="SONGL.back()">‹ Danh sách bài hát</button>
 <div class="sl-hero" style="margin-top:8px"><span class="chip" style="align-self:flex-start;background:rgba(255,255,255,.2);color:#fff;border:0">${c.level} · ${c.lines.length} câu · ${pc(c)}% thuộc</span><h1>${esc2(c.title)}</h1>
  <div class="row" style="flex-wrap:nowrap;gap:8px;margin-top:6px"><button class="btn" style="flex:1;background:#fff;color:#0e6aa8" onclick="SONGL.hearAll()" ${SG.all||SG.busy?'disabled':''}>${PL&&!SG.rec&&!SG.all?'■ Dừng':'▶ Nghe cả bài'}</button><button class="btn ${SG.all?'sl-rec':''}" style="flex:1;background:#0b3b5e;color:#fff" onclick="SONGL.singAll()" ${SG.rec||(SG.busy&&!SG.all)?'disabled':''}>${SG.all?'■ Dừng & chấm':SG.busy&&SG.allRes===null?'AI đang chấm…':'🎤 Hát cả bài'}</button></div>
  ${SG.all?`<div id="sl-all-st" role="status" style="font-weight:700">Nhạc dạo…</div>`:''}
  ${SG.allRes&&!SG.all?`<div class="row" style="gap:8px;align-items:center;flex-wrap:nowrap"><span class="sl-sc ${SG.allRes.total>=70?'ok':'no'}" style="background:#fff">Cả bài: ${SG.allRes.total} điểm</span><button class="chip" style="background:rgba(255,255,255,.2);color:#fff;border:0" onclick="SONGL.playMine('all')">▶ Nghe lại</button></div>`:((prog()[c.id]||{}).full?`<small style="opacity:.9">Cả bài tốt nhất: ${(prog()[c.id]).full} điểm</small>`:'')}</div>
 ${V.words.length?`<div class="sec-h"><h2>Từ mới trong bài</h2></div><div class="sl-words">${V.words.map(([e,v])=>`<span><b>${esc2(e)}</b> · ${esc2(v)}</span>`).join('')}</div>`:''}
 <div class="sec-h"><h2>Từng câu</h2><span class="mut">Nghe → Hát theo</span></div>
 <div class="stack">${c.lines.map((l,i)=>{const r=SG.res[i],b=best[i]||0,recNow=SG.rec&&SG.rec.i===i,busy=SG.busy&&SG.cur===i;
  return `<div class="sl-line" data-i="${i}"><div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:flex-start"><div style="min-width:0"><div class="sl-en">${esc2(l)}</div><div class="sl-vi">${esc2(V.lines[i]||'')}</div></div>${b?`<span class="sl-sc ${b>=70?'ok':'no'}" title="Điểm cao nhất">${b>=70?'✓ ':''}${b}</span>`:''}</div>
  <div class="sl-act"><button class="chip" onclick="SONGL.hear(${i})" aria-label="Nghe câu ${i+1}">🔊 Nghe</button><button class="chip ${recNow?'sl-rec':''}" onclick="SONGL.sing(${i})" ${SG.busy||SG.all||(SG.rec&&!recNow)?'disabled':''} aria-label="Hát theo câu ${i+1}">${recNow?'■ Dừng':busy?'AI đang chấm…':'🎤 Hát theo'}</button>${r&&r.url?`<button class="chip" onclick="SONGL.playMine(${i})">▶ Giọng tôi</button>`:''}</div>
  ${recNow?`<div id="sl-st" class="mut" style="font-size:.86rem" role="status">Nhạc dạo…</div>`:''}
  ${r?`<div style="font-size:.86rem"><span class="sl-sc ${r.score>=70?'ok':'no'}">${r.score} điểm</span> ${r.wrong.length?`<span class="mut">Luyện lại: <b style="color:var(--bad)">${r.wrong.map(esc2).join(', ')}</b></span>`:'<span style="color:var(--good)">Chuẩn từng từ!</span>'}</div>`:''}</div>`}).join('')}</div>
 <p class="mut" style="font-size:.8rem;margin-top:12px">Mẹo: đeo tai nghe để micro không thu tiếng nhạc. Câu đạt từ 70 điểm được tính là đã thuộc.</p>`}
window.vSong=vSong;window.SONGL={singAll,open,back,hear,hearAll,sing,playMine,count:()=>SG.cat?SG.cat.length:10};
})();
