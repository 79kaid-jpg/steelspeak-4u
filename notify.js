/* ===================== THÔNG BÁO HỌC TẬP & TIN NHẮN ADMIN ↔ HỌC VIÊN =====================
 Bảng: supabase/messaging.sql.
 - Khi người học đang ở màn hình học, app gọi study_heartbeat mỗi phút. Bắt đầu phiên mới (nghỉ > 15 phút)
   → máy chủ tạo thông báo cho admin đang theo dõi người đó.
 - Thông báo đến ngay khi app đang mở (realtime), kèm thông báo của trình duyệt nếu đã cho phép.
 - Tin nhắn: mỗi học viên có một cuộc trò chuyện với ban admin. */
(function(){
const NT={uid:null,unread:0,msgUnread:0,list:[],thread:null,msgs:[],threads:null,watch:new Set(),ch:null,hb:null,off:false,sending:false};
window.NT=NT;
const on=()=>{try{return typeof USER!='undefined'&&USER&&typeof SB!='undefined'}catch(e){return false}};
const rr=()=>{try{render()}catch(e){}};
const isAdm=()=>{try{return !!PROF?.is_admin}catch(e){return false}};

/* --- đang học gì? (rỗng = không phải màn hình học) --- */
function activity(){try{
 if(S.game){const g=S.game;return g.saga?'Đua level':'Làm bài “'+String(g.l?.name||'bài học').slice(0,60)+'”'}
 const T={home:'',vocab:'Ôn từ vựng',saga:'Đua level',read:'Đọc truyện',speak:'Luyện phát âm',ielts:'Luyện IELTS',tl:'',make:''};
 if(S.tab=='tl'&&typeof tlLesson=='function'&&TLS.id!='__new')return 'Bài chủ đề “'+tlLesson().title+'”';
 if(S.tab=='read'&&typeof RD!='undefined'&&RD.book)return 'Đọc truyện “'+String(RD.book.title||'').slice(0,60)+'”';
 return T[S.tab]||''}catch(e){return ''}}
async function beat(){if(!on()||NT.off||document.visibilityState!=='visible')return;const a=activity();if(!a||Date.now()-(NT.lastBeat||0)<50000)return;NT.lastBeat=Date.now();
 let trk='';try{trk=curTrack()?.name||''}catch(e){}
 const {error}=await SB.rpc('study_heartbeat',{act:a,trk});if(error&&/study_heartbeat|function/.test(error.message))NT.off=true}

/* --- thông báo --- */
async function loadNotes(){const {data,error}=await SB.from('notifications').select('*').eq('to_id',USER.id).order('id',{ascending:false}).limit(40);
 if(error){if(/notifications/.test(error.message))NT.off=true;return}NT.list=data||[];count();
 const bz=NT.list.find(n=>n.kind=='msg'&&!n.read_at&&isBuzz(n.body)&&Date.now()-new Date(n.created_at)<86400000&&!seenBuzz(n.id));if(bz){setTimeout(buzzFx,600);try{toast('📳 '+bz.title+' vừa BUZZ bạn!')}catch(e){}}rr()}
function count(){NT.unread=NT.list.filter(n=>!n.read_at).length;NT.msgUnread=NT.list.filter(n=>!n.read_at&&n.kind=='msg').length;window.MSGU=NT.unread;try{fab()}catch(e){}}
/* --- Nút tin nhắn nổi: chỉ hiện khi có tin chưa đọc; rung + chữ BUZZ khi có BUZZ --- */
function fab(){let el=document.getElementById('msgfab');const L=NT.list.filter(n=>!n.read_at&&n.kind=='msg');
 const hide=!L.length||(typeof S!='undefined'&&S.tab=='msg');
 if(hide){if(el)el.remove();return}
 if(!document.getElementById('fabcss')){const st=document.createElement('style');st.id='fabcss';st.textContent=`
#msgfab{position:fixed;left:max(16px,calc(50vw - 224px));bottom:calc(88px + env(safe-area-inset-bottom,0px));z-index:60;display:flex;align-items:center;gap:8px;min-height:52px;padding:0 16px 0 12px;border-radius:999px;border:0;background:var(--steel);color:var(--onsteel);font:inherit;font-weight:700;box-shadow:0 8px 22px color-mix(in srgb,var(--steel) 45%,transparent);animation:mfin .35s cubic-bezier(.2,1.3,.4,1)}
#msgfab .n{position:absolute;top:-6px;left:30px;min-width:22px;height:22px;padding:0 6px;border-radius:99px;background:var(--bad);color:#fff;font-size:.78rem;line-height:22px;text-align:center;box-shadow:0 0 0 2px var(--bg)}
#msgfab.buzz{background:var(--bad);box-shadow:0 8px 22px color-mix(in srgb,var(--bad) 50%,transparent);animation:mfin .35s cubic-bezier(.2,1.3,.4,1),mfbz 1.6s ease-in-out .4s infinite}
#msgfab.buzz .n{background:var(--amber);color:#1a1205}
@keyframes mfin{from{transform:scale(.4);opacity:0}}
@keyframes mfbz{0%,60%,100%{transform:none}64%{transform:translateX(-4px) rotate(-6deg)}68%{transform:translateX(4px) rotate(6deg)}72%{transform:translateX(-4px) rotate(-5deg)}76%{transform:translateX(3px) rotate(4deg)}80%{transform:none}}
@media (prefers-reduced-motion:reduce){#msgfab,#msgfab.buzz{animation:none}}
body.ch-open #msgfab,body.in-game #msgfab{display:none}`;document.head.appendChild(st)}
 const bz=L.some(n=>isBuzz(n.body)),who=[...new Set(L.map(n=>n.title))];
 if(!el){el=document.createElement('button');el.id='msgfab';el.onclick=()=>{const refs=[...new Set(NT.list.filter(n=>!n.read_at&&n.kind=='msg').map(n=>n.ref))];if(isAdm()&&refs.length!==1)openInbox();else openChat(isAdm()?refs[0]:USER.id)};document.body.appendChild(el)}
 el.className=bz?'buzz':'';
 el.setAttribute('aria-label',(bz?'BUZZ! ':'')+L.length+' tin nhắn mới từ '+who.join(', '));
 el.innerHTML=`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${bz?'<rect x="8" y="3" width="8" height="18" rx="2"/><path d="M4 8v8M20 8v8"/>':'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>'}</svg><span class="n">${L.length>9?'9+':L.length}</span><span>${bz?'BUZZ!':esc(who.length==1?who[0]:'Tin nhắn mới')}</span>`}
setInterval(()=>{try{fab()}catch(e){}},1500);
function onNote(n){if(NT.list.some(x=>x.id==n.id))return;NT.list.unshift(n);count();if(n.kind=='msg'&&isBuzz(n.body)&&!seenBuzz(n.id))buzzFx();
 const open=S.tab=='msg'&&n.kind=='msg'&&NT.thread==n.ref;
 if(open){loadThread(n.ref);return}
 try{toast((n.kind=='study'?'📚 ':'✉ ')+n.title+(n.body?': '+disp(n.body):''))}catch(e){}
 if(document.visibilityState!=='visible'&&'Notification' in window&&Notification.permission=='granted'){try{const x=new Notification(n.title,{body:disp(n.body),vibrate:[200,80,200],icon:'icon.svg',tag:'ss'+n.id});x.onclick=()=>{window.focus();NT.thread=n.kind=='msg'?n.ref:null;go('msg')}}catch(e){}}
 if(n.kind=='msg'&&S.tab=='msg'&&!NT.thread&&isAdm())loadThreads();rr()}
function subscribe(){try{if(NT.ch)SB.removeChannel(NT.ch)}catch(e){}
 try{NT.ch=SB.channel('nt-'+USER.id).on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:'to_id=eq.'+USER.id},p=>onNote(p.new)).subscribe()}catch(e){}}
async function readNotes(kind,ref){const ids=NT.list.filter(n=>!n.read_at&&(!kind||n.kind==kind)&&(!ref||n.ref==ref)).map(n=>n.id);if(!ids.length)return;
 NT.list.forEach(n=>{if(ids.includes(n.id))n.read_at=new Date().toISOString()});count();await SB.from('notifications').update({read_at:new Date().toISOString()}).in('id',ids)}

/* --- tin nhắn --- */
async function loadThread(uid){NT.thread=uid;const {data}=await SB.from('messages').select('*').eq('user_id',uid).order('id').limit(300);NT.msgs=data||[];
 await SB.rpc('msg_read',{thread:uid});NT.list.forEach(n=>{if(n.kind=='msg'&&n.ref==uid)n.read_at=n.read_at||new Date().toISOString()});count();rr();
 setTimeout(()=>{const b=document.getElementById('msgend');b&&b.scrollIntoView({block:'end'})},30)}
async function loadThreads(){const {data,error}=await SB.rpc('admin_threads');NT.threads=error?[]:(data||[]);NT.terr=error&&error.message;rr()}
async function send(){const ta=document.getElementById('msgin');const body=(ta?.value||'').trim();if(!body||NT.sending)return;if(body.length>2000)return toast('Tin nhắn tối đa 2000 ký tự');
 NT.sending=true;const adm=isAdm()&&NT.thread!==USER.id;
 const {error}=await SB.from('messages').insert({user_id:NT.thread,from_admin:adm,body});NT.sending=false;
 if(error)return toast(/messages/.test(error.message)?'Admin cần chạy supabase/messaging.sql':'Chưa gửi được: '+error.message);
 NT.draft='';await loadThread(NT.thread)}
async function toggleWatch(uid,name){const w=NT.watch.has(uid);
 const q=w?SB.from('study_watches').delete().eq('admin_id',USER.id).eq('user_id',uid):SB.from('study_watches').insert({admin_id:USER.id,user_id:uid});
 const {error}=await q;if(error)return toast(/study_watches/.test(error.message)?'Admin cần chạy supabase/messaging.sql':'Lỗi: '+error.message);
 w?NT.watch.delete(uid):NT.watch.add(uid);toast(w?'Đã tắt thông báo học của '+name:'Sẽ báo khi '+name+' bắt đầu học');
 if(!w&&'Notification' in window&&Notification.permission=='default')askPerm();rr()}
async function loadWatch(){if(!isAdm())return;const {data}=await SB.from('study_watches').select('user_id').eq('admin_id',USER.id);NT.watch=new Set((data||[]).map(x=>x.user_id));rr()}
async function askPerm(){if(!('Notification' in window))return toast('Trình duyệt này không hỗ trợ thông báo');const p=await Notification.requestPermission();toast(p=='granted'?'Đã bật thông báo trên trình duyệt':'Chưa được phép hiện thông báo');rr()}
function openChat(uid){NT.thread=uid||USER.id;NT.msgs=[];go('msg');loadThread(NT.thread)}
function openInbox(){NT.thread=isAdm()?null:USER.id;go('msg');if(isAdm())loadThreads();else loadThread(USER.id)}

/* --- BUZZ (rung màn hình như Yahoo Messenger) --- */
const BZ='[[buzz]]';const isBuzz=s=>String(s||'').startsWith(BZ);const disp=s=>isBuzz(s)?'📳 BUZZ!!!':String(s||'');
function buzzFx(){try{if(!document.getElementById('bzcss')){const st=document.createElement('style');st.id='bzcss';st.textContent='@keyframes bz{0%,100%{transform:translate(0,0)}10%{transform:translate(-14px,6px) rotate(-1deg)}20%{transform:translate(12px,-8px) rotate(1deg)}30%{transform:translate(-10px,-6px)}40%{transform:translate(14px,8px) rotate(1deg)}50%{transform:translate(-12px,4px) rotate(-1deg)}60%{transform:translate(10px,-6px)}70%{transform:translate(-8px,6px)}80%{transform:translate(6px,-4px)}90%{transform:translate(-4px,2px)}}.bzz{animation:bz .7s ease-in-out 2}@media (prefers-reduced-motion:reduce){.bzz{animation:none;outline:6px solid var(--amber);outline-offset:-6px}}';document.head.appendChild(st)}
 const el=document.getElementById('app')||document.body;el.classList.remove('bzz');void el.offsetWidth;el.classList.add('bzz');setTimeout(()=>el.classList.remove('bzz'),1500)}catch(e){}
 try{navigator.vibrate&&navigator.vibrate([200,80,200,80,400])}catch(e){}
 try{const A=window.AudioContext||window.webkitAudioContext;if(A){const c=new A(),now=c.currentTime;[0,.18,.36].forEach((d,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.value=i%2?520:880;g.gain.setValueAtTime(.0001,now+d);g.gain.exponentialRampToValueAtTime(.18,now+d+.02);g.gain.exponentialRampToValueAtTime(.0001,now+d+.15);o.connect(g).connect(c.destination);o.start(now+d);o.stop(now+d+.16)});setTimeout(()=>c.close(),900)}}catch(e){}}
function seenBuzz(id){try{const k='ss-bz-seen',a=JSON.parse(localStorage.getItem(k)||'[]');if(a.includes(id))return true;a.push(id);localStorage.setItem(k,JSON.stringify(a.slice(-50)))}catch(e){}return false}
async function buzz(){if(Date.now()-(NT.lastBuzz||0)<30000)return toast('Đợi 30 giây rồi mới BUZZ tiếp nhé');NT.lastBuzz=Date.now();
 const adm=isAdm()&&NT.thread!==USER.id;const {error}=await SB.from('messages').insert({user_id:NT.thread,from_admin:adm,body:BZ});
 if(error)return toast('Chưa BUZZ được: '+error.message);buzzFx();await loadThread(NT.thread)}

/* --- giao diện --- */
const EMO=['👍','❤️','😂','😍','🥰','😊','👏','🎉','🔥','💪','🌟','🙏','😢','😮','🤗','✅','📚','🏆','☕','🌸'];
const emojiOnly=s=>{const x=String(s).trim();if(!x||x.length>40)return 0;try{if(!/\p{Extended_Pictographic}/u.test(x)||/[0-9#*]/.test(x))return 0;if(!/^(?:\p{Extended_Pictographic}|\p{Emoji_Component}|\u200d|\ufe0f|\s)+$/u.test(x))return 0;const n=[...new Intl.Segmenter('vi',{granularity:'grapheme'}).segment(x.replace(/\s/g,''))].length;return n<=6?n:0}catch(e){return 0}};
function addEmo(e){const ta=document.getElementById('msgin');if(!ta){NT.draft=(NT.draft||'')+e;return}const p=ta.selectionStart??ta.value.length;ta.value=ta.value.slice(0,p)+e+ta.value.slice(p);NT.draft=ta.value;ta.focus();try{ta.setSelectionRange(p+e.length,p+e.length)}catch(x){}}
async function sendEmo(e){NT.draft=e;const ta=document.getElementById('msgin');if(ta)ta.value=e;await send()}
const ago=t=>{if(!t)return '';const s=(Date.now()-new Date(t))/1000;return s<60?'vừa xong':s<3600?Math.floor(s/60)+' phút trước':s<86400?Math.floor(s/3600)+' giờ trước':new Date(t).toLocaleDateString('vi')};
const onlineNow=t=>t&&Date.now()-new Date(t)<3*60*1000;
function chatCss(){if(document.getElementById('chatcss'))return;const s=document.createElement('style');s.id='chatcss';s.textContent=`
.cx-head{position:sticky;top:0;z-index:4;display:flex;align-items:center;gap:10px;margin:-12px -16px 0;padding:10px 16px;background:color-mix(in srgb,var(--bg) 82%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid color-mix(in srgb,var(--line) 70%,transparent)}
.cx-back{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:var(--steel);background:var(--soft)}
.cx-av{position:relative;flex:none;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font:700 1rem var(--fd);color:#fff;background:linear-gradient(135deg,var(--steel),var(--steel2))}
.cx-av.on::after{content:"";position:absolute;right:0;bottom:0;width:11px;height:11px;border-radius:50%;background:#2fb344;box-shadow:0 0 0 2px var(--bg)}
.cx-name{font:700 1.05rem/1.2 var(--fd)}.cx-sub{font-size:.76rem;color:var(--mut)}
.cx-list{display:flex;flex-direction:column;gap:3px;padding:14px 0 10px}
.cx-day{align-self:center;margin:10px 0 6px;padding:3px 12px;border-radius:99px;font-size:.72rem;color:var(--mut);background:color-mix(in srgb,var(--card) 85%,transparent);border:1px solid var(--line)}
.cx-row{display:flex;align-items:flex-end;gap:6px}.cx-row.me{justify-content:flex-end}
.cx-row .mini{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font:700 .72rem var(--fd);color:#fff;background:linear-gradient(135deg,var(--steel),var(--steel2))}
.cx-row .ph{flex:none;width:28px}
.cx-b{position:relative;max-width:76%;padding:9px 13px 7px;border-radius:20px;line-height:1.42;white-space:pre-wrap;overflow-wrap:anywhere;animation:cxin .28s cubic-bezier(.2,.9,.3,1.2) both}
.cx-b.me{color:#fff;background:linear-gradient(135deg,var(--steel2),var(--steel) 70%);box-shadow:0 6px 16px color-mix(in srgb,var(--steel) 30%,transparent)}
.cx-b.them{background:color-mix(in srgb,var(--card) 92%,transparent);border:1px solid var(--line);box-shadow:0 2px 8px rgba(0,0,0,.06)}
.cx-row.me.last .cx-b{border-bottom-right-radius:6px}.cx-row.them.last .cx-b{border-bottom-left-radius:6px}
.cx-t{display:flex;justify-content:flex-end;align-items:center;gap:4px;margin-top:2px;font-size:.66rem;opacity:.75}
.cx-big{font-size:3.2rem;line-height:1.1;animation:cxpop .45s cubic-bezier(.2,1.5,.4,1) both}
.cx-buzz{align-self:center;margin:6px 0;padding:6px 14px;border-radius:99px;background:color-mix(in srgb,var(--bad) 14%,var(--card));color:var(--bad);font:700 .86rem var(--fd);letter-spacing:.06em}
.cx-dock{position:sticky;bottom:calc(76px + env(safe-area-inset-bottom,0px));z-index:3;margin:0 -16px;padding:8px 12px 10px;background:linear-gradient(to top,var(--bg) 70%,color-mix(in srgb,var(--bg) 0%,transparent))}
.cx-emo{display:flex;gap:2px;overflow-x:auto;padding:0 2px 6px;scrollbar-width:none}.cx-emo::-webkit-scrollbar{display:none}
.cx-emo button{flex:none;width:42px;height:42px;border-radius:50%;font-size:1.45rem;transition:transform .15s}.cx-emo button:active{transform:scale(1.25)}
.cx-bar{display:flex;align-items:flex-end;gap:8px;padding:6px;border-radius:26px;background:var(--card);border:1px solid var(--line);box-shadow:0 8px 24px rgba(0,0,0,.12)}
.cx-bar:focus-within{border-color:color-mix(in srgb,var(--steel) 60%,var(--line));box-shadow:0 0 0 3px color-mix(in srgb,var(--steel) 18%,transparent),0 8px 24px rgba(0,0,0,.12)}
.cx-bar textarea{flex:1;min-width:0;min-height:40px;max-height:38vh;padding:9px 6px;border:0;outline:0;resize:none;background:transparent;color:inherit;font:inherit;font-size:16px;line-height:1.4}
.cx-ib{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center}
.cx-buzzb{color:var(--bad);background:color-mix(in srgb,var(--bad) 12%,transparent)}
.cx-send{color:#fff;background:linear-gradient(135deg,var(--steel2),var(--steel));box-shadow:0 6px 14px color-mix(in srgb,var(--steel) 40%,transparent);transition:transform .15s}
.cx-send:active{transform:scale(.9)}.cx-send:disabled{opacity:.5}
.cx-note{margin:8px 0 0;font-size:.74rem;color:var(--mut);text-align:center}
@keyframes cxin{from{opacity:0;transform:translateY(8px) scale(.97)}}
@keyframes cxpop{from{opacity:0;transform:scale(.3)}}
@media (prefers-reduced-motion:reduce){.cx-b,.cx-big{animation:none}}
html[data-season="noel"] .cx-b.me,html[data-season="tet"] .cx-b.me{background:linear-gradient(135deg,#d42a45,#9f0f28)!important;color:#fff!important}
html[data-season="noel"] .cx-send,html[data-season="tet"] .cx-send{background:linear-gradient(135deg,#d42a45,#9f0f28)!important;color:#fff!important}
html[data-season="noel"] .cx-av,html[data-season="noel"] .cx-row .mini{background:linear-gradient(135deg,#1f6f43,#0f3d27)}
html[data-season="noel"] .cx-head,html[data-season="tet"] .cx-head{padding-top:30px}
html[data-season="noel"] .cx-bar{box-shadow:0 0 0 1px color-mix(in srgb,#f2c14e 30%,transparent),0 8px 24px rgba(0,0,0,.25)}`;document.head.appendChild(s)}
const ini=n=>String(n||'?').trim().split(/\s+/).map(w=>w[0]).slice(-2).join('').toUpperCase();
const hm=d=>new Date(d).toLocaleTimeString('vi',{hour:'2-digit',minute:'2-digit'});
const dayLbl=d=>{const x=new Date(d),t=new Date();const y=new Date(t-864e5);return x.toDateString()==t.toDateString()?'Hôm nay':x.toDateString()==y.toDateString()?'Hôm qua':x.toLocaleDateString('vi',{weekday:'long',day:'2-digit',month:'2-digit'})};
function vChat(){chatCss();const adm=isAdm()&&NT.thread!==USER.id;const th=adm&&(NT.threads||[]).find(x=>x.user_id==NT.thread);
 const who=adm?(th?.name||(typeof ADM!='undefined'&&ADM.list||[]).find(u=>u.id==NT.thread)?.full_name||'Học viên'):'Admin SteelSpeak';
 const live=th&&onlineNow(th.last_seen),M=NT.msgs;let lastDay='',out='';
 M.forEach((m,k)=>{const mine=adm?m.from_admin:!m.from_admin,dl=dayLbl(m.created_at);if(dl!==lastDay){out+=`<div class="cx-day">${dl}</div>`;lastDay=dl}
  if(isBuzz(m.body)){out+=`<div class="cx-buzz">📳 ${mine?'Bạn đã BUZZ':esc(adm?who:'Admin')+' đã BUZZ bạn'}!!! · ${hm(m.created_at)}</div>`;return}
  const nx=M[k+1],nxMine=nx&&(adm?nx.from_admin:!nx.from_admin),last=!nx||nxMine!==mine||isBuzz(nx.body)||dayLbl(nx.created_at)!==dl;
  const seen=mine&&m.read_at?'<svg width="14" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-label="đã xem" role="img"><path d="m1 5 3 3 6-7M7 8l1 1 6-8"/></svg>':'';
  const av=mine?'':last?`<span class="mini" aria-hidden="true">${esc(ini(who))}</span>`:'<span class="ph"></span>';
  const big=emojiOnly(m.body);
  out+=`<div class="cx-row ${mine?'me':'them'} ${last?'last':''}" style="${last?'margin-bottom:6px':''}">${av}${big?`<div style="text-align:${mine?'right':'left'}"><div class="cx-big" style="font-size:${big==1?'4rem':big<=3?'3rem':'2.3rem'}">${esc(m.body.trim())}</div>${last?`<div class="cx-t" style="justify-content:${mine?'flex-end':'flex-start'};color:var(--mut)">${hm(m.created_at)} ${seen}</div>`:''}</div>`:`<div class="cx-b ${mine?'me':'them'}">${esc(m.body)}${last?`<div class="cx-t">${hm(m.created_at)} ${seen}</div>`:''}</div>`}</div>`});
 const sub=adm?(th&&th.last_seen?(live?'Đang học: '+esc(th.activity||''):'Học lần cuối '+ago(th.last_seen)):'Học viên'):'Thường trả lời trong ngày';
 return `<div class="cx-head"><button class="cx-back" aria-label="Quay lại" onclick="${adm?"NT.thread=null;NTX.threads();go('msg')":"go('me')"}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>
 <span class="cx-av ${live?'on':''}" aria-hidden="true">${esc(ini(who))}</span><div style="min-width:0"><div class="cx-name">${esc(who)}</div><div class="cx-sub">${sub}</div></div></div>
 <div class="cx-list">${out||'<p class="mut" style="text-align:center;margin:40px 0">Chưa có tin nhắn nào. Gửi lời chào đầu tiên nhé! 👋</p>'}<div id="msgend"></div></div>
 ${adm&&th&&!live?`<p class="cx-note">Người này đang không mở app. Tin nhắn vẫn được lưu và hiện khi họ mở app.</p>`:''}
 <div class="cx-dock"><div class="cx-emo" aria-label="Gửi nhanh emoji">${EMO.map(e=>`<button onclick="NTX.sendEmo('${e}')" aria-label="Gửi ${e}">${e}</button>`).join('')}</div>
 <div class="cx-bar"><button class="cx-ib cx-buzzb" aria-label="BUZZ: rung màn hình người nhận" title="BUZZ" onclick="NTX.buzz()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="3" width="8" height="18" rx="2"/><path d="M4 8v8M20 8v8M1.5 10v4M22.5 10v4"/></svg></button>
 <textarea id="msgin" rows="1" maxlength="2000" placeholder="Nhắn tin…" aria-label="Nội dung tin nhắn" oninput="NT.draft=this.value;this.style.height='auto';this.style.height=Math.min(this.scrollHeight,innerHeight*.38)+'px'" onkeydown="if(event.key==='Enter'&&!event.shiftKey&&!('ontouchstart' in window)){event.preventDefault();NTX.send()}" onfocus="setTimeout(()=>document.getElementById('msgend')?.scrollIntoView({block:'end',behavior:'smooth'}),300)">${esc(NT.draft||'')}</textarea>
 <button class="cx-ib cx-send" aria-label="Gửi" ${NT.sending?'disabled':''} onclick="NTX.send()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg></button></div></div>`}
function vInbox(){if(!NT.threads){loadThreads();return '<h1>Tin nhắn</h1><p class="mut">Đang tải…</p>'}
 const study=NT.list.filter(n=>n.kind=='study').slice(0,15);
 const perm='Notification' in window?Notification.permission:'na';
 return `<button class="link" onclick="go('me')">‹ Tài khoản</button><h1 style="margin-top:6px">Thông báo & tin nhắn</h1>
 ${perm=='default'?`<button class="card login-nudge" onclick="NTX.askPerm()"><span class="tile2-ic">🔔</span><span style="flex:1;text-align:left"><b>Bật thông báo trên trình duyệt</b><small>Hiện thông báo cả khi bạn đang ở tab khác</small></span><span class="chev">›</span></button>`:''}
 <div class="sec-h"><h2>Hoạt động học</h2>${study.some(n=>!n.read_at)?`<button class="link" onclick="NTX.readNotes('study').then(()=>render())">Đánh dấu đã xem</button>`:''}</div>
 ${study.length?`<div class="card" style="padding:4px 14px">${study.map(n=>`<div class="row" style="justify-content:space-between;flex-wrap:nowrap;padding:8px 0;border-bottom:1px solid var(--line)"><div style="min-width:0">${n.read_at?'':'<b style="color:var(--amber)">● </b>'}<b>${esc(n.title)}</b><div class="mut" style="font-size:.84rem">${esc(disp(n.body))} · ${ago(n.created_at)}</div></div><button class="chip" onclick="NTX.openChat('${n.ref}')">✉ Nhắn</button></div>`).join('')}</div>`:`<p class="mut" style="font-size:.88rem">Chưa có. Bật 🔔 cạnh tên học viên trong <b>Quản trị người dùng</b> để nhận thông báo khi họ bắt đầu học.</p>`}
 <div class="sec-h"><h2>Cuộc trò chuyện</h2><span class="mut">${NT.threads.length}</span></div>
 ${NT.terr?`<p class="note">Cần chạy supabase/messaging.sql</p>`:''}
 <div class="stack">${NT.threads.map(t=>`<button class="card lesson2" onclick="NTX.openChat('${t.user_id}')"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b>${onlineNow(t.last_seen)?'🟢 ':''}${esc(t.name||t.email||'')}</b>${t.unread?`<span class="chip on">${t.unread} mới</span>`:`<span class="mut" style="font-size:.78rem">${ago(t.last_at)}</span>`}</div><div class="mut" style="font-size:.84rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.last_from_admin?'Bạn: ':''}${esc(disp(t.last_body))}</div></button>`).join('')||'<p class="mut">Chưa có cuộc trò chuyện nào. Bấm ✉ cạnh tên học viên để bắt đầu.</p>'}</div>`}
function vMsg(){if(!on())return '<h1>Tin nhắn</h1><p class="mut">Đăng nhập để nhắn tin.</p>';return NT.thread?vChat():isAdm()?vInbox():(NT.thread=USER.id,loadThread(USER.id),vChat())}
function meCard(){if(!on()||NT.off)return '';const adm=isAdm();const n=adm?NT.unread:NT.msgUnread;
 return `<button class="card login-nudge" style="margin-top:12px" onclick="NTX.openInbox()"><span class="tile2-ic">✉</span><span style="flex:1;text-align:left"><b>${adm?'Thông báo & tin nhắn':'Nhắn tin với Admin'}${n?` · <span style="color:var(--bad)">${n} mới</span>`:''}</b><small>${adm?'Học viên đang học, tin nhắn từ học viên':'Hỏi bài, góp ý. Admin có thể được báo khi bạn bắt đầu học.'}</small></span><span class="chev">›</span></button>`}
function userBtns(u){if(!on()||!isAdm()||u.id==USER.id)return '';const w=NT.watch.has(u.id),nm=esc(JSON.stringify(u.full_name||u.email));
 return `<button class="chip ${w?'on':''}" title="Báo khi người này bắt đầu học" onclick="NTX.toggleWatch('${u.id}',${nm})">${w?'🔔 Đang theo dõi':'🔕 Báo khi học'}</button><button class="chip" onclick="NTX.openChat('${u.id}')">✉ Nhắn</button>`}

window.NTX={buzz,sendEmo,addEmo,send,toggleWatch,askPerm,openChat,openInbox,readNotes,threads:loadThreads,vMsg,meCard,userBtns};
window.vMsg=vMsg;

/* --- khởi động / theo dõi đăng nhập --- */
function init(){NT.uid=USER.id;NT.lastBeat=0;NT.off=false;NT.list=[];NT.thread=null;NT.threads=null;loadNotes();subscribe();loadWatch();beat()}
setInterval(()=>{const u=on()?USER.id:null;if(u!==NT.uid){if(u)init();else{NT.uid=null;try{NT.ch&&SB.removeChannel(NT.ch)}catch(e){}NT.ch=null;NT.list=[];count()}}},2000);
setInterval(beat,60000);
let lastTab='';setInterval(()=>{try{const k=(S.game?'g':'')+S.tab;if(k!==lastTab){lastTab=k;beat()}}catch(e){}},3000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&on()){beat();loadNotes()}});
})();
