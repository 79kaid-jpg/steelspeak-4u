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
 /* luôn hiện (khi đã đăng nhập) để nhắn tin nhanh; có tin mới thì nở to kèm tên người gửi */
 const hide=typeof USER=='undefined'||!USER||(typeof S!='undefined'&&(S.tab=='msg'||S.game));
 if(hide){if(el)el.remove();return}
 if(!document.getElementById('fabcss')){const st=document.createElement('style');st.id='fabcss';st.textContent=`
#msgfab{position:fixed;left:max(16px,calc(50vw - 224px));bottom:calc(88px + env(safe-area-inset-bottom,0px));z-index:60;display:flex;align-items:center;gap:8px;min-height:52px;padding:0 16px 0 12px;border-radius:999px;border:0;background:var(--steel);color:var(--onsteel);font:inherit;font-weight:700;box-shadow:0 8px 22px color-mix(in srgb,var(--steel) 45%,transparent);animation:mfin .35s cubic-bezier(.2,1.3,.4,1)}
#msgfab .n{position:absolute;top:-6px;left:30px;min-width:22px;height:22px;padding:0 6px;border-radius:99px;background:var(--bad);color:#fff;font-size:.78rem;line-height:22px;text-align:center;box-shadow:0 0 0 2px var(--bg)}
#msgfab.buzz{background:var(--bad);box-shadow:0 8px 22px color-mix(in srgb,var(--bad) 50%,transparent);animation:mfin .35s cubic-bezier(.2,1.3,.4,1),mfbz 1.6s ease-in-out .4s infinite}
#msgfab.buzz .n{background:var(--amber);color:#1a1205}
@keyframes mfin{from{transform:scale(.4);opacity:0}}
@keyframes mfbz{0%,60%,100%{transform:none}64%{transform:translateX(-4px) rotate(-6deg)}68%{transform:translateX(4px) rotate(6deg)}72%{transform:translateX(-4px) rotate(-5deg)}76%{transform:translateX(3px) rotate(4deg)}80%{transform:none}}
@media (prefers-reduced-motion:reduce){#msgfab,#msgfab.buzz{animation:none}}
body.ch-open #msgfab,body.in-game #msgfab{display:none}
#msgfab.mini{width:56px;height:56px;min-height:56px;padding:0;justify-content:center;border-radius:50%;opacity:.92}
#msgfab.mini span:not(.n){display:none}#msgfab.drag{transition:none;opacity:.8;cursor:grabbing}
#msgfab{touch-action:none;transition:left .25s cubic-bezier(.2,1.2,.4,1),top .25s cubic-bezier(.2,1.2,.4,1)}
#msgfab.pos{bottom:auto}`;document.head.appendChild(st)}
 const bz=L.some(n=>isBuzz(n.body)),who=[...new Set(L.map(n=>n.title))];
 if(!el){el=document.createElement('button');el.id='msgfab';el.onclick=()=>{if(el._moved&&Date.now()-el._moved<400)return;const refs=[...new Set(NT.list.filter(n=>!n.read_at&&n.kind=='msg').map(n=>n.ref))];if(isAdm()&&refs.length!==1)openInbox();else openChat(isAdm()?refs[0]:USER.id)};document.body.appendChild(el);fabDrag(el)}
 el.className=(bz?'buzz':'')+(L.length?'':' mini')+(el._pos?' pos':'');
 el.setAttribute('aria-label',L.length?(bz?'BUZZ! ':'')+L.length+' tin nhắn mới từ '+who.join(', '):(isAdm()?'Mở tin nhắn học viên':'Nhắn tin cho Admin'));
 el.innerHTML=`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${bz?'<rect x="8" y="3" width="8" height="18" rx="2"/><path d="M4 8v8M20 8v8"/>':'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>'}</svg>${L.length?`<span class="n">${L.length>9?'9+':L.length}</span><span>${bz?'BUZZ!':esc(who.length==1?who[0]:'Tin nhắn mới')}</span>`:''}`;if(el._pos)fabPlace(el)}
/* kéo nút chat đi đâu cũng được, thả ra tự dính vào mép trái/phải gần nhất; nhớ vị trí */
function fabPlace(el){const p=el._pos,w=el.offsetWidth||56,h=el.offsetHeight||56,W=innerWidth,H=innerHeight;const x=p.side=='r'?W-w-12:12,y=Math.min(H-h-90,Math.max(70,p.y*H));el.style.left=x+'px';el.style.top=y+'px';el.style.right='auto';el.style.bottom='auto'}
function fabDrag(el){try{el._pos=JSON.parse(localStorage.getItem('ss-fab')||'null')}catch(e){}
 let sx,sy,ox,oy,on=false,mv=false;
 el.addEventListener('pointerdown',e=>{on=true;mv=false;sx=e.clientX;sy=e.clientY;const r=el.getBoundingClientRect();ox=r.left;oy=r.top});
 addEventListener('pointermove',e=>{if(!on)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(!mv&&Math.hypot(dx,dy)<8)return;mv=true;el.classList.add('drag','pos');el.style.left=(ox+dx)+'px';el.style.top=(oy+dy)+'px';el.style.bottom='auto';el.style.right='auto'});
 addEventListener('pointerup',e=>{if(!on)return;on=false;if(!mv)return;el.classList.remove('drag');el._moved=Date.now();const r=el.getBoundingClientRect();
  el._pos={side:r.left+r.width/2>innerWidth/2?'r':'l',y:r.top/innerHeight};try{localStorage.setItem('ss-fab',JSON.stringify(el._pos))}catch(_){}fabPlace(el)});
 addEventListener('resize',()=>{if(el._pos)fabPlace(el)})}
setInterval(()=>{try{fab()}catch(e){}},1500);
function onNote(n){if(NT.list.some(x=>x.id==n.id))return;
 /* đang quay vòng may mắn: giữ thông báo trúng quà lại, chỉ hiện sau khi bảng kết quả đã ra */
 if(n.kind=='lucky'&&window.LK&&(LK.spinning||Date.now()<(LK.quietUntil||0))){setTimeout(()=>onNote(n),500);return}NT.list.unshift(n);count();if(n.kind=='msg'&&isBuzz(n.body)&&!seenBuzz(n.id))buzzFx();
 if(n.kind=='lucky'&&window.LKX)LKX.pendLoad(true);const open=S.tab=='msg'&&n.kind=='msg'&&NT.thread==n.ref;
 if(open){loadThread(n.ref,1);return}
 try{toast((n.kind=='study'?'📚 ':'✉ ')+n.title+(n.body?': '+disp(n.body):''))}catch(e){}
 if(document.visibilityState!=='visible'&&'Notification' in window&&Notification.permission=='granted'){try{const x=new Notification(n.title,{body:disp(n.body),vibrate:[200,80,200],icon:'icon.svg',tag:'ss'+n.id});x.onclick=()=>{window.focus();NT.thread=n.kind=='msg'?n.ref:null;go('msg')}}catch(e){}}
 if(n.kind=='msg'&&S.tab=='msg'&&!NT.thread&&isAdm())loadThreads();rr()}
function subscribe(){try{if(NT.ch)SB.removeChannel(NT.ch)}catch(e){}
 try{NT.ch=SB.channel('nt-'+USER.id).on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:'to_id=eq.'+USER.id},p=>onNote(p.new)).subscribe()}catch(e){}}
async function readNotes(kind,ref){const ids=NT.list.filter(n=>!n.read_at&&(!kind||n.kind==kind)&&(!ref||n.ref==ref)).map(n=>n.id);if(!ids.length)return;
 NT.list.forEach(n=>{if(ids.includes(n.id))n.read_at=new Date().toISOString()});count();await SB.from('notifications').update({read_at:new Date().toISOString()}).in('id',ids)}

/* --- tin nhắn --- */
async function loadThread(uid,inc){NT.thread=uid;const near=innerHeight+scrollY>=document.documentElement.scrollHeight-220,y=scrollY;const {data}=await SB.from('messages').select('*').eq('user_id',uid).order('id').limit(300);NT.msgs=data||[];
 await SB.rpc('msg_read',{thread:uid});NT.list.forEach(n=>{if(n.kind=='msg'&&n.ref==uid)n.read_at=n.read_at||new Date().toISOString()});count();rr();
 if(inc&&!near){NT.newPill=(NT.newPill||0)+1;rr();setTimeout(()=>{fitDock();scrollTo(0,y)},30)}else{NT.newPill=0;[30,180,500,1200].forEach(t=>setTimeout(()=>{fitDock();toEnd()},t));setTimeout(()=>document.querySelectorAll('.cx-msgs img,.cx img').forEach(im=>{if(!im.complete)im.addEventListener('load',()=>{if(innerHeight+scrollY>=document.documentElement.scrollHeight-400)toEnd()},{once:true})}),60)}}
function fitDock(){const d=document.querySelector('.cx-dock'),n=document.querySelector('nav'),sp=document.getElementById('cxsp');if(!d)return;if(n&&n.offsetHeight)d.style.bottom=n.offsetHeight+'px';if(sp)sp.style.height=(d.offsetHeight+8)+'px'}
function toEnd(sm){if(NT.newPill){NT.newPill=0;document.querySelector('.cx-new')?.remove()}fitDock();window.scrollTo({top:document.documentElement.scrollHeight,behavior:sm?'smooth':'auto'})}
addEventListener('resize',()=>fitDock());addEventListener('scroll',()=>{if(NT.newPill&&innerHeight+scrollY>=document.documentElement.scrollHeight-60){NT.newPill=0;document.querySelector('.cx-new')?.remove()}},{passive:true});
async function loadThreads(){const {data,error}=await SB.rpc('admin_threads');NT.threads=error?[]:(data||[]);NT.terr=error&&error.message;rr()}
/* Ký tự nhanh → emoji, ví dụ :) → 🙂 */
const EMO=[[':-)','🙂'],[':)','🙂'],[':-D','😄'],[':D','😄'],['=))','🤣'],[':))','😆'],[';)','😉'],[';-)','😉'],[':(','🙁'],[':-(','🙁'],[":'(",'😢'],[':P','😛'],[':p','😛'],[':O','😮'],[':o','😮'],['<3','❤️'],['</3','💔'],[':*','😘'],['^^','😊'],['^_^','😊'],['-_-','😑'],['B)','😎'],['8)','😎'],[':v','😝'],['xD','😆'],['XD','😆'],[':|','😐'],['>:(','😠'],[':3','😺'],['(y)','👍'],['(Y)','👍'],[':ok:','👌']].sort((a,b)=>b[0].length-a[0].length);
const emoRe=new RegExp('(^|\\s)('+EMO.map(([k])=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?=\\s|$)','g');
const EMOM=Object.fromEntries(EMO);
const emoText=t=>t.replace(emoRe,(m,a,k)=>a+EMOM[k]);
function emoLive(el){const sel=getSelection();if(!sel.rangeCount)return;const n=sel.anchorNode;if(!n||n.nodeType!==3||!el.contains(n))return;const off=sel.anchorOffset,before=n.data.slice(0,off);
 const m=before.match(new RegExp('(^|\\s)('+EMO.map(([k])=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')([\\s\\u00a0])$'));if(!m)return;
 const k=m[2],start=off-k.length-1,e=EMOM[k];n.data=n.data.slice(0,start)+e+n.data.slice(off-1);const r=document.createRange();r.setStart(n,start+e.length+1);r.collapse(true);sel.removeAllRanges();sel.addRange(r)}
async function send(){const ta=document.getElementById('msgin');const body=emoText((ta?(ta.innerText??ta.value):'').replace(/\u00a0/g,' ').trim());if(!body||NT.sending)return;if(body.length>2000)return toast('Tin nhắn tối đa 2000 ký tự');
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
const BZ='[[buzz]]';const isBuzz=s=>String(s||'').startsWith(BZ);const IMG='[[img]]';const isImg=s=>String(s||'').startsWith(IMG);const disp=s=>isBuzz(s)?'📳 BUZZ!!!':isImg(s)?'🖼️ Hình ảnh':String(s||'');
function buzzFx(){try{if(!document.getElementById('bzcss')){const st=document.createElement('style');st.id='bzcss';st.textContent='@keyframes bz{0%,100%{transform:translate(0,0)}10%{transform:translate(-14px,6px) rotate(-1deg)}20%{transform:translate(12px,-8px) rotate(1deg)}30%{transform:translate(-10px,-6px)}40%{transform:translate(14px,8px) rotate(1deg)}50%{transform:translate(-12px,4px) rotate(-1deg)}60%{transform:translate(10px,-6px)}70%{transform:translate(-8px,6px)}80%{transform:translate(6px,-4px)}90%{transform:translate(-4px,2px)}}.bzz{animation:bz .7s ease-in-out 2}@media (prefers-reduced-motion:reduce){.bzz{animation:none;outline:6px solid var(--amber);outline-offset:-6px}}';document.head.appendChild(st)}
 const el=document.getElementById('app')||document.body;el.classList.remove('bzz');void el.offsetWidth;el.classList.add('bzz');setTimeout(()=>el.classList.remove('bzz'),1500)}catch(e){}
 try{navigator.vibrate&&navigator.vibrate([200,80,200,80,400])}catch(e){}
 try{const A=window.AudioContext||window.webkitAudioContext;if(A){const c=new A(),now=c.currentTime;[0,.18,.36].forEach((d,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.value=i%2?520:880;g.gain.setValueAtTime(.0001,now+d);g.gain.exponentialRampToValueAtTime(.18,now+d+.02);g.gain.exponentialRampToValueAtTime(.0001,now+d+.15);o.connect(g).connect(c.destination);o.start(now+d);o.stop(now+d+.16)});setTimeout(()=>c.close(),900)}}catch(e){}}
function seenBuzz(id){try{const k='ss-bz-seen',a=JSON.parse(localStorage.getItem(k)||'[]');if(a.includes(id))return true;a.push(id);localStorage.setItem(k,JSON.stringify(a.slice(-50)))}catch(e){}return false}
async function buzz(){if(Date.now()-(NT.lastBuzz||0)<30000)return toast('Đợi 30 giây rồi mới BUZZ tiếp nhé');NT.lastBuzz=Date.now();
 const adm=isAdm()&&NT.thread!==USER.id;const {error}=await SB.from('messages').insert({user_id:NT.thread,from_admin:adm,body:BZ});
 if(error)return toast('Chưa BUZZ được: '+error.message);buzzFx();await loadThread(NT.thread)}

/* --- giao diện --- */
const SEAS=()=>document.documentElement.dataset.season||'';
const SEMO={noel:['🎄','🎅','🤶','⛄','❄️','🦌','🎁','🔔','🍪','🧦','🕯️','🌟','🧣','🍫'],tet:['🧧','🌼','🌸','🏮','🎆','🐉','🍊','🎋','🥮','💰','🐱','🎇']};
const FAV={noel:['⛄','👸','🎅','🤶','🦌','❄️','🧝','🐧','🍪','🎄','🐻‍❄️','🌟'],tet:['🐉','🧧','🏮','🌸','🐱','🦁','🍊','🎆','🐲','🧨'],'':['🦊','🐼','🐨','🦁','🐯','🐸','🦄','🐵','🐰','🐻']};
const funAv=id=>{const L=FAV[SEAS()]||FAV[''];let h=0;for(const c of String(id||'x'))h=(h*31+c.charCodeAt(0))>>>0;return L[h%L.length]};
const EMO0=['👍','❤️','😂','😍','🥰','😊','👏','🎉','🔥','💪','🌟','🙏','😢','😮','🤗','✅','📚','🏆','☕','🌸'];const emoList=()=>[...(SEMO[SEAS()]||[]),...EMO0];
const emojiOnly=s=>{const x=String(s).trim();if(!x||x.length>40)return 0;try{if(!/\p{Extended_Pictographic}/u.test(x)||/[0-9#*]/.test(x))return 0;if(!/^(?:\p{Extended_Pictographic}|\p{Emoji_Component}|\u200d|\ufe0f|\s)+$/u.test(x))return 0;const n=[...new Intl.Segmenter('vi',{granularity:'grapheme'}).segment(x.replace(/\s/g,''))].length;return n<=6?n:0}catch(e){return 0}};
async function upImg(file){if(!file||!/^image\//.test(file.type))return toast('Chỉ gửi được hình ảnh');if(NT.sending)return;NT.sending=true;NT.pend=URL.createObjectURL(file);rr();setTimeout(()=>toEnd(1),40);
 try{let blob=file,ext=(file.type.split('/')[1]||'png').replace('jpeg','jpg');
  if(file.type!=='image/gif'){const bm=await createImageBitmap(file);const k=Math.min(1,1024/Math.max(bm.width,bm.height));const c=document.createElement('canvas');c.width=Math.round(bm.width*k);c.height=Math.round(bm.height*k);c.getContext('2d').drawImage(bm,0,0,c.width,c.height);
   const b=await new Promise(r=>c.toBlob(r,'image/webp',.85));if(b&&b.type=='image/webp'){blob=b;ext='webp'}else{blob=await new Promise(r=>c.toBlob(r,'image/png'));ext='png'}}
  if(blob.size>5242880)throw new Error('Hình quá lớn (tối đa 5MB)');
  const path=NT.thread+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,10)+'.'+ext;
  const up=await SB.storage.from('chat-images').upload(path,blob,{contentType:blob.type||'image/'+ext,upsert:false});if(up.error)throw new Error(/bucket|not found/i.test(up.error.message)?'Admin cần chạy supabase/chat_images.sql':up.error.message);
  const url=SB.storage.from('chat-images').getPublicUrl(path).data.publicUrl;const adm=isAdm()&&NT.thread!==USER.id;
  const {error}=await SB.from('messages').insert({user_id:NT.thread,from_admin:adm,body:IMG+url});if(error)throw error;NT.sending=false;await loadThread(NT.thread);clearPend()}
 catch(e){NT.sending=false;clearPend();toast('Chưa gửi được hình: '+(e.message||e))}}
function clearPend(){if(NT.pend){try{URL.revokeObjectURL(NT.pend)}catch(e){}NT.pend=null;rr()}}
function pasteImg(ev){const cd=ev.clipboardData;ev.preventDefault();const it=[...(cd?.items||[])].find(i=>i.kind=='file'&&/^image\//.test(i.type));if(it)return upImg(it.getAsFile());
 const h=cd?.getData('text/html')||'',m=h.match(/<img[^>]+src="([^"]+)"/i);if(m)return imgFromSrc(m[1]);const t=cd?.getData('text/plain')||'';if(t)document.execCommand('insertText',false,t)}
async function imgFromSrc(src){try{const b=await (await fetch(src)).blob();await upImg(new File([b],'sticker',{type:b.type||'image/png'}))}catch(e){toast('Không đọc được sticker này')}}
function edIn(el){try{emoLive(el)}catch(e){}const imgs=[...el.querySelectorAll('img')];imgs.forEach(i=>{const src=i.src;i.remove();if(src)imgFromSrc(src)});fitDock();NT.draft=el.innerText;el.dataset.empty=el.innerText.trim()?'':'1'}
function addEmo(e){const ta=document.getElementById('msgin');if(!ta){NT.draft=(NT.draft||'')+e;return}ta.focus();document.execCommand('insertText',false,e);NT.draft=ta.innerText}
async function sendEmo(e){const ta=document.getElementById('msgin');const keep=ta?ta.innerText:NT.draft||'';if(ta)ta.innerText=e;await send();NT.draft=keep}
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
.cx-dock{position:fixed;left:0;right:0;margin:0 auto;max-width:480px;box-sizing:border-box;bottom:calc(76px + env(safe-area-inset-bottom,0px));z-index:4;padding:14px 12px 10px;background:linear-gradient(to top,var(--bg) 70%,color-mix(in srgb,var(--bg) 0%,transparent))}
.cx-emo{display:flex;gap:2px;overflow-x:auto;padding:0 2px 6px;scrollbar-width:none}.cx-emo::-webkit-scrollbar{display:none}
.cx-emo button{flex:none;width:42px;height:42px;border-radius:50%;font-size:1.45rem;transition:transform .15s}.cx-emo button:active{transform:scale(1.25)}
.cx-bar{display:flex;align-items:flex-end;gap:8px;padding:6px;border-radius:26px;background:var(--card);border:1px solid var(--line);box-shadow:0 8px 24px rgba(0,0,0,.12)}
.cx-bar:focus-within{border-color:color-mix(in srgb,var(--steel) 60%,var(--line));box-shadow:0 0 0 3px color-mix(in srgb,var(--steel) 18%,transparent),0 8px 24px rgba(0,0,0,.12)}
.cx-bar textarea{flex:1;min-width:0;min-height:40px;max-height:38vh;padding:9px 6px;border:0;outline:0;resize:none;background:transparent;color:inherit;font:inherit;font-size:16px;line-height:1.4}
.cx-ed{flex:1;min-width:0;min-height:22px;max-height:38vh;overflow-y:auto;padding:9px 6px;outline:0;white-space:pre-wrap;overflow-wrap:anywhere;font-size:16px;line-height:1.4;-webkit-user-select:text;user-select:text}
.cx-ed[data-empty="1"]:before{content:attr(data-ph);color:var(--mut);pointer-events:none}.cx-ed img{max-height:60px}
.cx-ib{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center}
.cx-buzzb{color:var(--bad);background:color-mix(in srgb,var(--bad) 12%,transparent)}
.cx-send{color:#fff;background:linear-gradient(135deg,var(--steel2),var(--steel));box-shadow:0 6px 14px color-mix(in srgb,var(--steel) 40%,transparent);transition:transform .15s}
.cx-send:active{transform:scale(.9)}.cx-send:disabled{opacity:.5}
.cx-av.fun{font-size:1.6rem;background:var(--soft)!important;box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--steel) 40%,transparent)}.cx-row .mini.fun{font-size:1.05rem;background:var(--soft)!important}
.cx-img{display:block;max-width:min(46vw,170px);max-height:200px;border-radius:14px;filter:drop-shadow(0 4px 8px rgba(0,0,0,.28));animation:cxpop .35s both}
.cx-imgb{color:var(--steel);background:color-mix(in srgb,var(--steel) 10%,transparent);cursor:pointer}
.cx-scene{display:none}
.cx-new{position:absolute;left:50%;top:-40px;transform:translateX(-50%);min-height:36px;padding:0 16px;border-radius:99px;font:700 .86rem var(--fd);color:#fff;background:var(--steel);box-shadow:0 6px 18px rgba(0,0,0,.3);animation:cxin .25s both}
.cx-pend{position:relative}.cx-pend .cx-img{opacity:.55}
.cx-spin{position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;border:3px solid rgba(255,255,255,.4);border-top-color:#fff;animation:cxsp .8s linear infinite}
@keyframes cxsp{to{transform:rotate(360deg)}}
.cx-note{margin:8px 0 0;font-size:.74rem;color:var(--mut);text-align:center}
@keyframes cxin{from{opacity:0;transform:translateY(8px) scale(.97)}}
@keyframes cxpop{from{opacity:0;transform:scale(.3)}}
@media (prefers-reduced-motion:reduce){.cx-b,.cx-big{animation:none}}
html:is([data-season="noel"],[data-season="tet"]) body:has(.cx-scene){background:radial-gradient(120% 70% at 50% 35%,#d11f2b,#a3111b 55%,#6e0911) fixed!important}
html[data-season="tet"] body:has(.cx-scene){background:radial-gradient(120% 70% at 50% 35%,#e0302a,#b0141c 55%,#6a0a10) fixed!important}
html:is([data-season="noel"],[data-season="tet"]) .cx-scene{display:block;position:fixed;left:0;right:0;top:0;height:300px;z-index:0;pointer-events:none}.cx-scene svg{width:100%;height:100%}
html:is([data-season="noel"],[data-season="tet"]) :is(.cx-list,.cx-note){position:relative;z-index:1}
html:is([data-season="noel"],[data-season="tet"]) .cx-head{position:sticky;top:0;z-index:6;background:rgba(120,8,16,.55);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:2px solid rgba(255,140,140,.5);color:#fff}
html:is([data-season="noel"],[data-season="tet"]) .cx-head .cx-sub{color:#ffe1d6}html:is([data-season="noel"],[data-season="tet"]) .cx-back{background:rgba(255,255,255,.15);color:#fff}
html:is([data-season="noel"],[data-season="tet"]) .cx-list{margin:12px -6px 0;padding:14px 10px;border-radius:30px;border:2px solid rgba(255,120,120,.55);background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02))}
html[data-season="tet"] .cx-list,html[data-season="tet"] .cx-head{border-color:rgba(255,210,87,.6)!important}
html:is([data-season="noel"],[data-season="tet"]) .cx-b.them{background:#f4eeea;border:0;color:#b3122e;font-weight:700;font-family:'Poppins',var(--fd),sans-serif;border-radius:24px}
html[data-season="noel"] .cx-b.me{background:#0f5a32!important;color:#fff!important;font-weight:600;border-radius:24px}
html[data-season="tet"] .cx-b.me{background:linear-gradient(135deg,#ffd257,#f2a900)!important;color:#7a0a10!important;font-weight:700;border-radius:24px}
html:is([data-season="noel"],[data-season="tet"]) :is(.cx-day,.cx-note,.cx-t[style*="--mut"]){color:#ffe7dc!important}html:is([data-season="noel"],[data-season="tet"]) .cx-day{background:rgba(0,0,0,.2);border:0}
html:is([data-season="noel"],[data-season="tet"]) .cx-dock{background:linear-gradient(to top,#6e0911 72%,rgba(110,9,17,0))}
html:is([data-season="noel"],[data-season="tet"]) .cx-emo button{background:rgba(255,255,255,.12)}
html:is([data-season="noel"],[data-season="tet"]) .cx-bar{background:#f4eeea;color:#3a0a0a;border:0}
html:is([data-season="noel"],[data-season="tet"]) .cx-list>p.mut{color:#ffe7dc}
html[data-season="tet"] .cx-send{background:linear-gradient(135deg,#ffd257,#f2a900)!important;color:#7a0a10!important}
html[data-season="noel"] .cx-send{background:linear-gradient(135deg,#d42a45,#9f0f28)!important;color:#fff!important}
html[data-season="noel"] .cx-av,html[data-season="noel"] .cx-row .mini{background:linear-gradient(135deg,#1f6f43,#0f3d27)}
html[data-season="noel"] .cx-head,html[data-season="tet"] .cx-head{padding-top:30px}
html[data-season="noel"] .cx-bar{box-shadow:0 0 0 1px color-mix(in srgb,#f2c14e 30%,transparent),0 8px 24px rgba(0,0,0,.25)}`;document.head.appendChild(s)}
function scene(){const se=SEAS();if(se=='noel')return `<div class="cx-scene" aria-hidden="true"><svg viewBox="0 0 390 300" preserveAspectRatio="xMidYMin slice"><g stroke="#0f3d22" stroke-width="7" stroke-linecap="round" fill="none"><path d="M-10 40 C 60 20 120 60 170 30"/><path d="M400 30 C 330 14 270 56 220 26"/></g><g stroke="#2f7d46" stroke-width="3" stroke-linecap="round">${[20,45,70,95,120,145].map(x=>`<path d="M${x} ${38-x/9} l-8 -14 M${x} ${38-x/9} l10 -12 M${x} ${38-x/9} l-6 14 M${x} ${38-x/9} l9 12"/>`).join('')}${[370,345,320,295,270,245].map(x=>`<path d="M${x} ${30-(390-x)/12} l-8 -14 M${x} ${30-(390-x)/12} l10 -12 M${x} ${30-(390-x)/12} l-6 14 M${x} ${30-(390-x)/12} l9 12"/>`).join('')}</g><circle cx="62" cy="58" r="11" fill="#e8b23a"/><circle cx="130" cy="52" r="9" fill="#c8102e" stroke="#f6d27a" stroke-width="2"/><circle cx="300" cy="50" r="11" fill="#c8102e" stroke="#f6d27a" stroke-width="2"/><circle cx="350" cy="56" r="8" fill="#e8b23a"/><ellipse cx="200" cy="40" rx="8" ry="12" fill="#7a4a24"/></svg></div>`;
 if(se=='tet')return `<div class="cx-scene" aria-hidden="true"><svg viewBox="0 0 390 300" preserveAspectRatio="xMidYMin slice"><g stroke="#5a2d14" stroke-width="3" fill="none" stroke-linecap="round"><path d="M-10 50 C 40 40 80 70 140 50"/><path d="M400 40 C 350 36 310 66 250 52"/></g>${[[30,46],[110,54],[80,80],[360,42],[280,56],[310,82]].map(([x,y])=>`<g fill="#ffcf2e"><circle cx="${x}" cy="${y-7}" r="6"/><circle cx="${x+7}" cy="${y}" r="6"/><circle cx="${x}" cy="${y+7}" r="6"/><circle cx="${x-7}" cy="${y}" r="6"/></g><circle cx="${x}" cy="${y}" r="3.5" fill="#e8590c"/>`).join('')}<path d="M195 0v18" stroke="#ffd257" stroke-width="2"/><ellipse cx="195" cy="42" rx="22" ry="24" fill="#ff3b30"/><path d="M176 42h38" stroke="#ffd257" stroke-width="2"/><rect x="186" y="16" width="18" height="6" rx="2" fill="#ffd257"/><rect x="186" y="62" width="18" height="6" rx="2" fill="#ffd257"/></svg></div>`;return ''}
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
  const av=mine?'':last?`<span class="mini fun" aria-hidden="true">${funAv(adm?NT.thread:'admin')}</span>`:'<span class="ph"></span>';
  if(isImg(m.body)){const u=m.body.slice(IMG.length);out+=`<div class="cx-row ${mine?'me':'them'} ${last?'last':''}" style="${last?'margin-bottom:6px':''}">${av}<div style="text-align:${mine?'right':'left'}"><a href="${esc(u)}" target="_blank" rel="noopener"><img class="cx-img" src="${esc(u)}" alt="Hình ảnh" loading="lazy"></a>${last?`<div class="cx-t" style="justify-content:${mine?'flex-end':'flex-start'};color:var(--mut)">${hm(m.created_at)} ${seen}</div>`:''}</div></div>`;return}
  const big=emojiOnly(m.body);
  out+=`<div class="cx-row ${mine?'me':'them'} ${last?'last':''}" style="${last?'margin-bottom:6px':''}">${av}${big?`<div style="text-align:${mine?'right':'left'}"><div class="cx-big" style="font-size:${big==1?'4rem':big<=3?'3rem':'2.3rem'}">${esc(m.body.trim())}</div>${last?`<div class="cx-t" style="justify-content:${mine?'flex-end':'flex-start'};color:var(--mut)">${hm(m.created_at)} ${seen}</div>`:''}</div>`:`<div class="cx-b ${mine?'me':'them'}">${esc(m.body)}${last?`<div class="cx-t">${hm(m.created_at)} ${seen}</div>`:''}</div>`}</div>`});
 const sub=adm?(th&&th.last_seen?(live?'Đang học: '+esc(th.activity||''):'Học lần cuối '+ago(th.last_seen)):'Học viên'):'Thường trả lời trong ngày';
 return `${scene()}<div class="cx-head"><button class="cx-back" aria-label="Quay lại" onclick="${adm?"NT.thread=null;NTX.threads();go('msg')":"go('me')"}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>
 <span class="cx-av fun ${live?'on':''}" aria-hidden="true">${funAv(adm?NT.thread:'admin')}</span><div style="min-width:0"><div class="cx-name">${esc(who)}</div><div class="cx-sub">${sub}</div></div></div>
 <div class="cx-list">${out||'<p class="mut" style="text-align:center;margin:40px 0">Chưa có tin nhắn nào. Gửi lời chào đầu tiên nhé! 👋</p>'}${NT.pend?`<div class="cx-row me last"><div class="cx-pend"><img class="cx-img" src="${NT.pend}" alt="Đang gửi hình"><span class="cx-spin" role="status" aria-label="Đang gửi hình"></span></div></div>`:''}<div id="msgend"></div></div>
 ${adm&&th&&!live?`<p class="cx-note">Người này đang không mở app. Tin nhắn vẫn được lưu và hiện khi họ mở app.</p>`:''}
 <div id="cxsp" style="height:150px"></div><div class="cx-dock">${NT.newPill?`<button class="cx-new" onclick="NTX.toEnd(1)">↓ ${NT.newPill} tin mới</button>`:''}<div class="cx-emo" aria-label="Gửi nhanh emoji">${emoList().map(e=>`<button onclick="NTX.sendEmo('${e}')" aria-label="Gửi ${e}">${e}</button>`).join('')}</div>
 <div class="cx-bar"><button class="cx-ib cx-buzzb" aria-label="BUZZ: rung màn hình người nhận" title="BUZZ" onclick="NTX.buzz()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="3" width="8" height="18" rx="2"/><path d="M4 8v8M20 8v8M1.5 10v4M22.5 10v4"/></svg></button>
 <label class="cx-ib cx-imgb" aria-label="Gửi hình hoặc sticker" title="Gửi hình"><input type="file" accept="image/*" hidden onchange="NTX.upImg(this.files[0]);this.value=''"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg></label>
 <div id="msgin" class="cx-ed" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Nội dung tin nhắn" data-ph="Nhắn tin…" data-empty="${(NT.draft||'').trim()?'':'1'}" oninput="NTX.edIn(this)" onpaste="NTX.pasteImg(event)" enterkeyhint="send" onkeydown="if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();NTX.send()}" onfocus="setTimeout(()=>NTX.toEnd(1),300)">${esc(NT.draft||'')}</div>
 <button class="cx-ib cx-send" aria-label="Gửi" ${NT.sending?'disabled':''} onclick="NTX.send()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg></button></div></div>`}
/* ===== Hộp thư admin, gọn: 3 tab (Tin nhắn · Hoạt động · Quà), mỗi dòng 1 hàng kiểu Messenger ===== */
const IBX={tab:'msg',q:''};
function ibxDay(d){const x=new Date(d),t=new Date();const k=v=>v.toDateString();if(k(x)==k(t))return 'Hôm nay';const y=new Date(t);y.setDate(t.getDate()-1);if(k(x)==k(y))return 'Hôm qua';return x.toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit'})}
function vInbox(){if(!NT.threads){loadThreads();return '<button class="link" onclick="go(\'me\')">‹ Tài khoản</button><h1 style="margin-top:6px">Tin nhắn</h1><p class="mut">Đang tải…</p>'}
 if(!document.getElementById('ibxcss')){const st=document.createElement('style');st.id='ibxcss';st.textContent=`
.ibx-tabs{display:flex;gap:4px;padding:4px;border-radius:14px;background:var(--soft);margin:10px 0 12px}
.ibx-tabs button{flex:1;min-height:40px;border:0;border-radius:10px;background:transparent;color:var(--mut);font:700 .9rem var(--fd);display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}
.ibx-tabs button[aria-selected="true"]{background:var(--card);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.12)}
.ibx-tabs .b{min-width:18px;height:18px;padding:0 5px;border-radius:99px;background:var(--bad);color:#fff;font-size:.7rem;line-height:18px}
.ibx-list{border:1px solid var(--line);border-radius:16px;background:var(--card);overflow:hidden}
.ibx-row{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:10px 12px;border:0;border-bottom:1px solid var(--line);background:none;color:var(--ink);font:inherit;text-align:left;cursor:pointer}
.ibx-row:last-child{border-bottom:0}.ibx-row:active{background:var(--soft)}
.ibx-av{position:relative;flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--soft);font-size:1.4rem}
.ibx-av.on::after{content:"";position:absolute;right:0;bottom:0;width:12px;height:12px;border-radius:50%;background:var(--good);box-shadow:0 0 0 2px var(--card)}
.ibx-mid{flex:1;min-width:0}.ibx-mid b{display:block;font-size:.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ibx-mid small{display:block;color:var(--mut);font-size:.84rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ibx-row.unread .ibx-mid b,.ibx-row.unread .ibx-mid small{color:var(--ink);font-weight:700}
.ibx-end{flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:4px;font-size:.75rem;color:var(--mut)}
.ibx-end .n{min-width:20px;height:20px;padding:0 6px;border-radius:99px;background:var(--steel);color:var(--onsteel,#fff);font-weight:800;line-height:20px;text-align:center}
.ibx-day{padding:8px 12px 4px;font:700 .72rem var(--fd);letter-spacing:.08em;text-transform:uppercase;color:var(--mut);background:var(--soft)}
.ibx-search{width:100%;min-height:44px;box-sizing:border-box;border:1px solid var(--line);border-radius:12px;padding:0 12px;background:var(--card);color:var(--ink);font:inherit;margin-bottom:10px}
.ibx-perm{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:12px;background:var(--soft);font-size:.85rem;margin-top:8px}`;document.head.appendChild(st)}
 const study=NT.list.filter(n=>n.kind=='study').slice(0,40),sU=study.filter(n=>!n.read_at).length;
 const pend=(window.LA&&LA.pend)||[];try{window.LKX&&LKX.pendLoad()}catch(e){}
 const mU=NT.threads.reduce((a,t)=>a+(t.unread||0),0),perm='Notification' in window?Notification.permission:'na';
 const tab=(id,lbl,n)=>`<button role="tab" aria-selected="${IBX.tab==id}" onclick="NTX.ibx('${id}')">${lbl}${n?`<span class="b">${n>99?'99+':n}</span>`:''}</button>`;
 let body='';
 if(IBX.tab=='msg'){const q=IBX.q.trim().toLowerCase();const T=[...NT.threads].sort((x,y)=>(y.unread>0)-(x.unread>0)||new Date(y.last_at)-new Date(x.last_at)).filter(t=>!q||String(t.name||t.email||'').toLowerCase().includes(q));
  body=`${NT.threads.length>6?`<input class="ibx-search" type="search" placeholder="Tìm học viên…" aria-label="Tìm học viên" value="${esc(IBX.q)}" oninput="NTX.ibxq(this.value)">`:''}
  ${NT.terr?`<p class="note">Cần chạy supabase/messaging.sql</p>`:''}
  ${T.length?`<div class="ibx-list" role="list">${T.map(t=>`<button class="ibx-row ${t.unread?'unread':''}" role="listitem" onclick="NTX.openChat('${t.user_id}')"><span class="ibx-av ${onlineNow(t.last_seen)?'on':''}" aria-hidden="true">${funAv(t.user_id)}</span><span class="ibx-mid"><b>${esc(t.name||t.email||'')}</b><small>${t.last_from_admin?'Bạn: ':''}${esc(disp(t.last_body))}</small></span><span class="ibx-end"><span>${ago(t.last_at)}</span>${t.unread?`<span class="n" aria-label="${t.unread} tin chưa đọc">${t.unread}</span>`:''}</span></button>`).join('')}</div>`
   :`<p class="mut">${q?'Không tìm thấy học viên.':'Chưa có cuộc trò chuyện. Bấm ✉ Nhắn cạnh tên học viên trong Quản trị người dùng để bắt đầu.'}</p>`}`}
 else if(IBX.tab=='study'){let last='';
  body=`${sU?`<div class="row" style="justify-content:flex-end;margin-bottom:8px"><button class="link" onclick="NTX.readNotes('study').then(()=>render())">Đánh dấu đã xem tất cả</button></div>`:''}
  ${study.length?`<div class="ibx-list">${study.map(n=>{const d=ibxDay(n.created_at),h=d!==last?(last=d,`<div class="ibx-day">${d}</div>`):'';
   return h+`<button class="ibx-row ${n.read_at?'':'unread'}" onclick="NTX.openChat('${n.ref}')" aria-label="${esc(n.title)}, nhắn tin"><span class="ibx-av" aria-hidden="true">${funAv(n.ref)}</span><span class="ibx-mid"><b>${esc(n.title)}</b><small>${esc(disp(n.body))}</small></span><span class="ibx-end"><span>${new Date(n.created_at).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</span><span style="color:var(--steel);font-weight:700">Nhắn ›</span></span></button>`}).join('')}</div>`
   :`<p class="mut" style="font-size:.9rem">Chưa có. Bật 🔔 cạnh tên học viên trong <b>Quản trị người dùng</b> để biết khi họ bắt đầu học.</p>`}`}
 else body=(window.LKX&&LKX.pendList?LKX.pendList():'')||'<p class="mut">Không có quà nào chờ trao.</p>';
 return `<button class="link" onclick="go('me')">‹ Tài khoản</button><h1 style="margin:6px 0 0">Tin nhắn</h1>
 ${perm=='default'?`<div class="ibx-perm"><span style="flex:1">🔔 Bật thông báo để không lỡ tin nhắn</span><button class="chip" onclick="NTX.askPerm()">Bật</button></div>`:''}
 <div class="ibx-tabs" role="tablist">${tab('msg','Tin nhắn',mU)}${tab('study','Hoạt động',sU)}${pend.length||IBX.tab=='gift'?tab('gift','Quà',pend.length):''}</div>
 ${body}`}
function vMsg(){if(!on())return '<h1>Tin nhắn</h1><p class="mut">Đăng nhập để nhắn tin.</p>';return NT.thread?vChat():isAdm()?vInbox():(NT.thread=USER.id,loadThread(USER.id),vChat())}
async function livePoll(){if(NT.liveAt&&Date.now()-NT.liveAt<60000)return;NT.liveAt=Date.now();
 const {data,error}=await SB.from('presence').select('user_id,last_seen').gte('last_seen',new Date(Date.now()-3*60*1000).toISOString());
 const L=error?null:(data||[]).filter(r=>r.user_id!==USER.id);const ch=JSON.stringify(L)!==JSON.stringify(NT.live);NT.live=L;if(ch)rr()}
function meCard(){if(!on()||NT.off)return '';const adm=isAdm();const n=NT.msgUnread;if(adm){livePoll();try{window.LKX&&LKX.pendLoad()}catch(e){}}const L=NT.live;
 return `<button class="card login-nudge" style="margin-top:12px" onclick="NTX.openInbox()"><span class="tile2-ic">✉</span><span style="flex:1;text-align:left"><b>${adm?'Thông báo & tin nhắn':'Nhắn tin với Admin'}${n?` · <span style="color:var(--bad)">${n} mới</span>`:''}</b><small>${adm?(L==null?'Học viên đang học, tin nhắn từ học viên':L.length?`🟢 ${L.length} học viên đang học`:'Không có học viên nào đang học')+((window.LA&&LA.pend&&LA.pend.length)?` · <b style="color:var(--bad)">🎁 ${LA.pend.length} quà chờ trao</b>`:''):'Hỏi bài, góp ý. Admin có thể được báo khi bạn bắt đầu học.'}</small></span><span class="chev">›</span></button>`}
function userBtns(u){if(!on()||!isAdm()||u.id==USER.id)return '';const w=NT.watch.has(u.id),nm=esc(JSON.stringify(u.full_name||u.email));
 return `<button class="chip ${w?'on':''}" title="Báo khi người này bắt đầu học" onclick="NTX.toggleWatch('${u.id}',${nm})">${w?'🔔 Đang theo dõi':'🔕 Báo khi học'}</button><button class="chip" onclick="NTX.openChat('${u.id}')">✉ Nhắn</button>`}

window.NTX={ibx:t=>{IBX.tab=t;rr()},ibxq:v=>{IBX.q=v;clearTimeout(IBX.t);IBX.t=setTimeout(()=>{rr();const i=document.querySelector('.ibx-search');if(i){i.focus();i.setSelectionRange(v.length,v.length)}},250)},toEnd,upImg,pasteImg,edIn,buzz,sendEmo,addEmo,send,toggleWatch,askPerm,openChat,openInbox,readNotes,threads:loadThreads,vMsg,meCard,userBtns};
window.vMsg=vMsg;

/* --- khởi động / theo dõi đăng nhập --- */
function init(){NT.uid=USER.id;NT.lastBeat=0;NT.off=false;NT.list=[];NT.thread=null;NT.threads=null;loadNotes();subscribe();loadWatch();beat()}
setInterval(()=>{const u=on()?USER.id:null;if(u!==NT.uid){if(u)init();else{NT.uid=null;try{NT.ch&&SB.removeChannel(NT.ch)}catch(e){}NT.ch=null;NT.list=[];count()}}},2000);
setInterval(beat,60000);
let lastTab='';setInterval(()=>{try{const k=(S.game?'g':'')+S.tab;if(k!==lastTab){lastTab=k;beat()}}catch(e){}},3000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&on()){beat();loadNotes()}});
})();
