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
 if(error){if(/notifications/.test(error.message))NT.off=true;return}NT.list=data||[];count();rr()}
function count(){NT.unread=NT.list.filter(n=>!n.read_at).length;NT.msgUnread=NT.list.filter(n=>!n.read_at&&n.kind=='msg').length;window.MSGU=NT.unread}
function onNote(n){if(NT.list.some(x=>x.id==n.id))return;NT.list.unshift(n);count();
 const open=S.tab=='msg'&&n.kind=='msg'&&NT.thread==n.ref;
 if(open){loadThread(n.ref);return}
 try{toast((n.kind=='study'?'📚 ':'✉ ')+n.title+(n.body?': '+n.body:''))}catch(e){}
 if(document.visibilityState!=='visible'&&'Notification' in window&&Notification.permission=='granted'){try{const x=new Notification(n.title,{body:n.body,icon:'icon.svg',tag:'ss'+n.id});x.onclick=()=>{window.focus();NT.thread=n.kind=='msg'?n.ref:null;go('msg')}}catch(e){}}
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

/* --- giao diện --- */
const ago=t=>{if(!t)return '';const s=(Date.now()-new Date(t))/1000;return s<60?'vừa xong':s<3600?Math.floor(s/60)+' phút trước':s<86400?Math.floor(s/3600)+' giờ trước':new Date(t).toLocaleDateString('vi')};
const onlineNow=t=>t&&Date.now()-new Date(t)<3*60*1000;
function vChat(){const adm=isAdm()&&NT.thread!==USER.id;const th=adm&&(NT.threads||[]).find(x=>x.user_id==NT.thread);
 const who=adm?(th?.name||(typeof ADM!='undefined'&&ADM.list||[]).find(u=>u.id==NT.thread)?.full_name||'Học viên'):'Admin SteelSpeak';
 const b=NT.msgs.map(m=>{const mine=adm?m.from_admin:!m.from_admin;return `<div style="display:flex;justify-content:${mine?'flex-end':'flex-start'}"><div style="max-width:82%;padding:9px 12px;border-radius:16px;${mine?'background:var(--steel);color:var(--onsteel);border-bottom-right-radius:4px':'background:var(--card);border:1px solid var(--line);border-bottom-left-radius:4px'}"><div style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(m.body)}</div><div style="font-size:.7rem;opacity:.7;text-align:right;margin-top:2px">${new Date(m.created_at).toLocaleString('vi',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})}${mine&&m.read_at?' · đã xem':''}</div></div></div>`}).join('');
 return `<button class="link" onclick="${adm?"NT.thread=null;NTX.threads();go('msg')":"go('me')"}">‹ ${adm?'Tất cả cuộc trò chuyện':'Tài khoản'}</button>
 <h1 style="margin-top:6px">${esc(who)}</h1>${th&&th.last_seen?`<p class="mut" style="font-size:.84rem">${onlineNow(th.last_seen)?'🟢 Đang học: '+esc(th.activity||''):'Học lần cuối '+ago(th.last_seen)}</p>`:adm?'':'<p class="mut" style="font-size:.84rem">Hỏi bài, góp ý hay báo lỗi, admin sẽ trả lời tại đây.</p>'}
 <div class="stack" style="gap:8px;margin-top:12px">${b||'<p class="mut">Chưa có tin nhắn nào. Gửi lời chào đầu tiên nhé!</p>'}<div id="msgend"></div></div>
 <div class="card" style="position:sticky;bottom:84px;margin-top:12px;padding:8px;display:flex;gap:8px;align-items:flex-end"><textarea id="msgin" rows="2" maxlength="2000" placeholder="Nhập tin nhắn…" style="flex:1;resize:none;border:0;background:transparent;color:inherit;font:inherit" oninput="NT.draft=this.value">${esc(NT.draft||'')}</textarea><button class="btn" style="flex:none" ${NT.sending?'disabled':''} onclick="NTX.send()">Gửi</button></div>`}
function vInbox(){if(!NT.threads){loadThreads();return '<h1>Tin nhắn</h1><p class="mut">Đang tải…</p>'}
 const study=NT.list.filter(n=>n.kind=='study').slice(0,15);
 const perm='Notification' in window?Notification.permission:'na';
 return `<button class="link" onclick="go('me')">‹ Tài khoản</button><h1 style="margin-top:6px">Thông báo & tin nhắn</h1>
 ${perm=='default'?`<button class="card login-nudge" onclick="NTX.askPerm()"><span class="tile2-ic">🔔</span><span style="flex:1;text-align:left"><b>Bật thông báo trên trình duyệt</b><small>Hiện thông báo cả khi bạn đang ở tab khác</small></span><span class="chev">›</span></button>`:''}
 <div class="sec-h"><h2>Hoạt động học</h2>${study.some(n=>!n.read_at)?`<button class="link" onclick="NTX.readNotes('study').then(()=>render())">Đánh dấu đã xem</button>`:''}</div>
 ${study.length?`<div class="card" style="padding:4px 14px">${study.map(n=>`<div class="row" style="justify-content:space-between;flex-wrap:nowrap;padding:8px 0;border-bottom:1px solid var(--line)"><div style="min-width:0">${n.read_at?'':'<b style="color:var(--amber)">● </b>'}<b>${esc(n.title)}</b><div class="mut" style="font-size:.84rem">${esc(n.body)} · ${ago(n.created_at)}</div></div><button class="chip" onclick="NTX.openChat('${n.ref}')">✉ Nhắn</button></div>`).join('')}</div>`:`<p class="mut" style="font-size:.88rem">Chưa có. Bật 🔔 cạnh tên học viên trong <b>Quản trị người dùng</b> để nhận thông báo khi họ bắt đầu học.</p>`}
 <div class="sec-h"><h2>Cuộc trò chuyện</h2><span class="mut">${NT.threads.length}</span></div>
 ${NT.terr?`<p class="note">Cần chạy supabase/messaging.sql</p>`:''}
 <div class="stack">${NT.threads.map(t=>`<button class="card lesson2" onclick="NTX.openChat('${t.user_id}')"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b>${onlineNow(t.last_seen)?'🟢 ':''}${esc(t.name||t.email||'')}</b>${t.unread?`<span class="chip on">${t.unread} mới</span>`:`<span class="mut" style="font-size:.78rem">${ago(t.last_at)}</span>`}</div><div class="mut" style="font-size:.84rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.last_from_admin?'Bạn: ':''}${esc(t.last_body)}</div></button>`).join('')||'<p class="mut">Chưa có cuộc trò chuyện nào. Bấm ✉ cạnh tên học viên để bắt đầu.</p>'}</div>`}
function vMsg(){if(!on())return '<h1>Tin nhắn</h1><p class="mut">Đăng nhập để nhắn tin.</p>';return NT.thread?vChat():isAdm()?vInbox():(NT.thread=USER.id,loadThread(USER.id),vChat())}
function meCard(){if(!on()||NT.off)return '';const adm=isAdm();const n=adm?NT.unread:NT.msgUnread;
 return `<button class="card login-nudge" style="margin-top:12px" onclick="NTX.openInbox()"><span class="tile2-ic">✉</span><span style="flex:1;text-align:left"><b>${adm?'Thông báo & tin nhắn':'Nhắn tin với Admin'}${n?` · <span style="color:var(--bad)">${n} mới</span>`:''}</b><small>${adm?'Học viên đang học, tin nhắn từ học viên':'Hỏi bài, góp ý. Admin có thể được báo khi bạn bắt đầu học.'}</small></span><span class="chev">›</span></button>`}
function userBtns(u){if(!on()||!isAdm()||u.id==USER.id)return '';const w=NT.watch.has(u.id),nm=esc(JSON.stringify(u.full_name||u.email));
 return `<button class="chip ${w?'on':''}" title="Báo khi người này bắt đầu học" onclick="NTX.toggleWatch('${u.id}',${nm})">${w?'🔔 Đang theo dõi':'🔕 Báo khi học'}</button><button class="chip" onclick="NTX.openChat('${u.id}')">✉ Nhắn</button>`}

window.NTX={send,toggleWatch,askPerm,openChat,openInbox,readNotes,threads:loadThreads,vMsg,meCard,userBtns};
window.vMsg=vMsg;

/* --- khởi động / theo dõi đăng nhập --- */
function init(){NT.uid=USER.id;NT.lastBeat=0;NT.off=false;NT.list=[];NT.thread=null;NT.threads=null;loadNotes();subscribe();loadWatch();beat()}
setInterval(()=>{const u=on()?USER.id:null;if(u!==NT.uid){if(u)init();else{NT.uid=null;try{NT.ch&&SB.removeChannel(NT.ch)}catch(e){}NT.ch=null;NT.list=[];count()}}},2000);
setInterval(beat,60000);
let lastTab='';setInterval(()=>{try{const k=(S.game?'g':'')+S.tab;if(k!==lastTab){lastTab=k;beat()}}catch(e){}},3000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&on()){beat();loadNotes()}});
})();
