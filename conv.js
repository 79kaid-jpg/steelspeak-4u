/* ===================== HỘI THOẠI VỚI AI (Conversation) =====================
 Học viên và AI mỗi bên đọc 1 câu, lần lượt. AI đọc vai của mình bằng giọng đọc,
 học viên bấm micro đọc câu của mình → AI chấm phát âm → sang câu tiếp.
 Dữ liệu: conv-data.js (CONV_LESSONS). Tiến độ: localStorage 'ssconv'. */
(function(){
if(window._convJs)return;window._convJs=1;
const LV=['A1','A2','B1','B2','C1'];
let P={done:{}};try{P=JSON.parse(localStorage.getItem('ssconv'))||P}catch(e){}
const psave=()=>{try{localStorage.setItem('ssconv',JSON.stringify(P))}catch(e){}};
const CV={id:null,me:1,i:-1,mode:'idle',sc:{},err:'',hide:false,lv:null,rec:null,stream:null,parts:[],stop:false};
const lessons=()=>window.CONV_LESSONS||[];
const cur=()=>lessons().find(x=>x.id==CV.id);
const e2=s=>typeof esc=='function'?esc(s):String(s??'');
const rr=()=>{if(S.tab=='conv'&&!S.game)render()};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const focus=()=>setTimeout(()=>{const el=document.getElementById('cvl'+CV.i);el&&el.scrollIntoView({block:'center',behavior:'smooth'})},50);
const nameOf=(L,w)=>w===CV.me?'Bạn':(w?L.b:L.a)=='You'?'AI':(w?L.b:L.a);

function css(){if(document.getElementById('cv-css'))return;const s=document.createElement('style');s.id='cv-css';s.textContent=`
.cv-lv{display:flex;gap:6px;margin:0 0 10px}.cv-lv .chip.on{background:var(--steel);color:#fff;border-color:var(--steel)}
.cv-ln{display:flex;flex-direction:column;gap:4px;max-width:86%;transition:opacity .2s}
.cv-ln.ai{align-self:flex-start}.cv-ln.me{align-self:flex-end;align-items:flex-end}
.cv-ln .who{font-size:.74rem;color:var(--mut);font-weight:600;padding:0 6px}
.cv-b{padding:10px 14px;border-radius:18px;background:var(--card);border:1px solid var(--line);line-height:1.4}
.cv-ln.ai .cv-b{border-bottom-left-radius:6px}.cv-ln.me .cv-b{border-bottom-right-radius:6px;background:var(--soft)}
.cv-ln.now .cv-b{border-color:var(--steel);box-shadow:0 0 0 3px color-mix(in srgb,var(--steel) 22%,transparent)}
.cv-ln.later{opacity:.35}.cv-b small{display:block;color:var(--mut);font-size:.8rem;margin-top:3px}
.cv-sc{font-size:.76rem;font-weight:700;padding:0 6px}.cv-sc.good{color:var(--good)}.cv-sc.warn{color:#d18b00}.cv-sc.bad{color:var(--bad)}
.cv-mask{letter-spacing:.06em;color:var(--mut)}
.cv-dock{position:sticky;bottom:calc(env(safe-area-inset-bottom) + 76px);display:flex;gap:8px;align-items:center;justify-content:center;padding:10px;margin-top:14px;border-radius:20px;background:var(--card);border:1px solid var(--line);box-shadow:0 6px 24px rgba(0,0,0,.12)}
.cv-mic{width:64px;height:64px;border-radius:50%;border:0;background:var(--amber);color:#1a1205;display:grid;place-items:center;font-size:1.6rem;cursor:pointer}
.cv-mic.rec{background:var(--bad);color:#fff;animation:cvp 1.2s ease-in-out infinite}
@keyframes cvp{50%{box-shadow:0 0 0 10px color-mix(in srgb,var(--bad) 25%,transparent)}}
@media (prefers-reduced-motion:reduce){.cv-mic.rec{animation:none}}`;document.head.appendChild(s)}

/* ---------- Danh sách bài trên trang Học ---------- */
function home(){css();const A=lessons();if(!A.length)return '';
 const lv=CV.lv||LV.find(l=>A.some(x=>x.lv==l&&P.done[x.id]==null))||'A1';CV.lv=lv;
 const list=A.filter(x=>x.lv==lv);const nd=A.filter(x=>P.done[x.id]!=null).length;
 return `<div class="sec-h"><h2>Hội thoại với AI</h2><span class="mut" style="font-size:.84rem">${nd}/${A.length} bài</span></div>
 <div class="cv-lv" role="tablist">${LV.map(l=>`<button class="chip ${l==lv?'on':''}" role="tab" aria-selected="${l==lv}" onclick="CONV.lv('${l}')">${l}</button>`).join('')}</div>
 <div class="tlc-row">${list.map(L=>{const d=P.done[L.id];return `<button class="tlc" onclick="CONV.open('${L.id}')"><span class="tlc-top"><span class="chip">${L.lv}</span>${d!=null?`<span class="tlc-ok">✓</span>`:''}</span><b>${e2(L.t)}</b><small>${e2(L.vi)}</small><small class="tlc-m">${L.L.length} câu${d!=null?' · '+d+' điểm':' · bạn & AI thay phiên'}</small></button>`}).join('')}</div>`}

/* ---------- Màn bài hội thoại ---------- */
function view(){css();const L=cur();if(!L)return `<button class="link" onclick="go('home')">‹ Về trang Học</button><p class="mut">Không tìm thấy bài.</p>`;
 const running=CV.i>=0&&CV.mode!='done';
 const lines=L.L.map((x,k)=>{const mine=x[0]===CV.me,s=CV.sc[k],later=running&&k>CV.i||CV.i<0&&CV.mode!='done';
  const txt=mine&&CV.hide&&k>=CV.i&&s==null?`<span class="cv-mask">${e2(x[1].replace(/[A-Za-z]/g,'•'))}</span>`:e2(x[1]);
  return `<div id="cvl${k}" class="cv-ln ${mine?'me':'ai'} ${k===CV.i&&running?'now':''} ${later?'later':''}"><span class="who">${e2(nameOf(L,x[0]))}</span><div class="cv-b" ${!mine?`role="button" tabindex="0" onclick="CONV.hear(${k})"`:''}>${txt}<small>${e2(x[2])}</small></div>${s!=null?`<span class="cv-sc ${s>=80?'good':s>=60?'warn':'bad'}">${s>=80?'✓ ':''}${s} điểm</span>`:''}</div>`}).join('');
 const line=L.L[CV.i],myTurn=running&&line&&line[0]===CV.me;
 let dock='';
 if(CV.mode=='idle'&&CV.i<0)dock=`<button class="btn amber" style="flex:1" onclick="CONV.start()">▶ Bắt đầu hội thoại</button>`;
 else if(CV.mode=='ai')dock=`<span class="mut">🔊 ${e2(nameOf(L,line?line[0]:0))} đang nói…</span><button class="btn ghost" onclick="CONV.stopAll()">Dừng</button>`;
 else if(myTurn&&CV.mode=='grade')dock=`<span class="mut">AI đang chấm…</span>`;
 else if(myTurn)dock=`<button class="btn ghost" onclick="CONV.hear(${CV.i})" aria-label="Nghe mẫu">🔊</button><button class="cv-mic ${CV.mode=='rec'?'rec':''}" onclick="CONV.mic()" aria-label="${CV.mode=='rec'?'Dừng và chấm':'Bấm để nói'}">${CV.mode=='rec'?'■':'🎙'}</button>${CV.sc[CV.i]!=null?`<button class="btn" onclick="CONV.next()">Tiếp ›</button>`:`<button class="btn ghost" onclick="CONV.next()">Bỏ qua</button>`}`;
 else if(CV.mode=='done'){const v=Object.values(CV.sc),avg=v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):0;
  dock=`<div style="flex:1;text-align:center"><b style="font-size:1.1rem">${v.length?`Trung bình ${avg} điểm`:'Xong hội thoại'}</b><div class="row" style="gap:8px;justify-content:center;margin-top:8px"><button class="btn ghost" onclick="CONV.swap()">⇄ Đổi vai</button><button class="btn" onclick="CONV.start()">Làm lại</button></div></div>`}
 return `<button class="link" onclick="CONV.stopAll();go('home')">‹ Về trang Học</button>
 <div class="row" style="justify-content:space-between;flex-wrap:nowrap;margin-top:6px"><h1 style="margin:0">${e2(L.t)}</h1><span class="chip">${L.lv}</span></div>
 <p class="mut" style="margin:4px 0 8px">${e2(L.sc)} Bạn đóng vai <b>${e2(CV.me?L.b=='You'?'chính mình':L.b:L.a)}</b>, AI đóng vai còn lại.</p>
 <div class="row" style="gap:8px;margin-bottom:12px">${CV.mode=='idle'||CV.mode=='done'?`<button class="chip" onclick="CONV.swap()">⇄ Đổi vai</button>`:''}<button class="chip ${CV.hide?'on':''}" onclick="CONV.hide()">${CV.hide?'🙈 Đang ẩn câu của bạn':'👁 Ẩn câu của bạn (khó hơn)'}</button></div>
 ${CV.err?`<div class="note" style="border-color:var(--bad)">${e2(CV.err)}</div>`:''}
 <div class="stack" style="gap:10px">${lines}</div>
 <div class="cv-dock">${dock}</div>`}

/* ---------- Luồng hội thoại ---------- */
async function speak(t){try{audioWake&&audioWake()}catch(e){}try{await say(t,.92)}catch(e){}}
async function run(){const L=cur();if(!L)return;
 while(CV.i<L.L.length&&!CV.stop){const x=L.L[CV.i];
  if(x[0]===CV.me){CV.mode='turn';rr();focus();return}
  CV.mode='ai';rr();focus();await speak(x[1]);if(CV.stop)return;await wait(350);CV.i++}
 if(!CV.stop)finish()}
function start(){killRec();CV.stop=false;CV.sc={};CV.err='';CV.i=0;
 try{typeof ttsPrefetch=='function'&&ttsPrefetch(cur().L.filter(x=>x[0]!==CV.me).map(x=>x[1]))}catch(e){}run()}
function next(){killRec();if(CV.mode=='grade')return;CV.err='';CV.i++;CV.stop=false;run()}
function finish(){const L=cur(),v=Object.values(CV.sc);CV.mode='done';CV.i=L.L.length;
 const avg=v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):0;
 if(v.length){const first=P.done[L.id]==null;P.done[L.id]=Math.max(P.done[L.id]||0,avg);psave();
  if(first||avg>=70){const xp=first?20+Math.round(avg/10):5;try{S.xp+=xp;tick();save()}catch(e){}toast(`+${xp} XP · Hoàn thành “${L.t}”`)}}
 rr();setTimeout(()=>scrollTo({top:document.body.scrollHeight,behavior:'smooth'}),60)}
function stopAll(){CV.stop=true;killRec();try{speechSynthesis.cancel()}catch(e){}try{TTSSRC&&TTSSRC.stop()}catch(e){}if(CV.mode=='ai')CV.mode='turn'}

/* ---------- Ghi âm và chấm ---------- */
function killRec(){try{CV.rec&&CV.rec.state!='inactive'&&(CV.rec.onstop=null,CV.rec.stop())}catch(e){}try{CV.stream&&CV.stream.getTracks().forEach(t=>t.stop())}catch(e){}CV.rec=null;CV.stream=null;if(CV.mode=='rec')CV.mode='turn'}
async function mic(){if(CV.mode=='rec')return grade();if(CV.mode!='turn')return;CV.err='';
 if(!navigator.mediaDevices||!window.MediaRecorder){CV.err='Trình duyệt này không ghi âm được. Hãy dùng Safari (iPhone) hoặc Chrome.';return rr()}
 let st;try{st=typeof micGet=='function'?await micGet():await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){CV.err='Chưa được dùng micro. Hãy cho phép micro rồi thử lại.';rr();try{window.MIC&&MIC.open()}catch(x){}return}
 const mt=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(x=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(x))||'';
 const r=new MediaRecorder(st,mt?{mimeType:mt}:{});CV.parts=[];r.ondataavailable=e=>e.data.size&&CV.parts.push(e.data);
 CV.rec=r;CV.stream=st;CV.mime=r.mimeType||mt||'audio/mp4';r.start();CV.mode='rec';rr();
 clearTimeout(CV.lim);CV.lim=setTimeout(()=>{if(CV.mode=='rec')grade()},20000)}
async function grade(){const r=CV.rec,k=CV.i,L=cur();if(!r)return;clearTimeout(CV.lim);
 await new Promise(ok=>{r.onstop=ok;try{r.stop()}catch(e){ok()}});try{CV.stream.getTracks().forEach(t=>t.stop())}catch(e){}CV.rec=null;CV.stream=null;
 const blob=new Blob(CV.parts,{type:CV.mime});if(blob.size<2000){CV.mode='turn';CV.err='Chưa nghe thấy gì. Bấm micro, đọc to rồi bấm dừng.';return rr()}
 CV.mode='grade';rr();const target=L.L[k][1];
 try{const b64=await new Promise((ok,no)=>{const f=new FileReader();f.onload=()=>ok(String(f.result).split(',')[1]);f.onerror=no;f.readAsDataURL(blob)});
  const res=await ai('pron',{audio:b64,mime:CV.mime.split(';')[0],target});if(res.error)throw new Error(res.error);
  const heard=String(res.heard||'');if(!/[a-z]/i.test(heard))throw new Error('AI chưa nghe rõ. Đọc to và gần máy hơn.');
  const g=gradeSpeech(target,heard,.9,false);CV.sc[k]=g.score;CV.mode='turn';rr();
  if(g.score>=60){await wait(900);if(CV.i===k&&CV.mode=='turn')next()}else{CV.err='Chưa rõ lắm ('+g.score+' điểm). Nghe mẫu 🔊 rồi thử lại, hoặc bấm Tiếp.';rr()}}
 catch(e){CV.mode='turn';CV.err=e&&e.code=='login'?'Cần đăng nhập để AI chấm phát âm. Bạn vẫn có thể bấm Bỏ qua để luyện tiếp.':'Chưa chấm được: '+(e.message||e);rr()}}

window.vConv=view;window.convHome=home;
window.CONV={open(id){stopAll();Object.assign(CV,{id,i:-1,mode:'idle',sc:{},err:'',stop:false});go('conv');scrollTo(0,0)},
 lv(l){CV.lv=l;render()},start,next,mic,stopAll,
 hear(k){const L=cur();if(L&&CV.mode!='rec'&&CV.mode!='ai')speak(L.L[k][1])},
 swap(){stopAll();CV.me=CV.me?0:1;CV.i=-1;CV.mode='idle';CV.sc={};CV.err='';rr()},
 hide(){CV.hide=!CV.hide;rr()}};

/* gắn vào trang Học, ngay trên "Bài học theo chủ đề" */
function hook(){if(typeof vTopicHome!='function')return setTimeout(hook,300);if(vTopicHome._cv)return;const v0=vTopicHome;
 const w=function(){let h='';try{h=home()}catch(e){}return h+v0.apply(this,arguments)};Object.assign(w,v0);w._cv=1;window.vTopicHome=w}
hook();
})();
