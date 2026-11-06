/* ===================== HÁT NỐI (DUET) =====================
 Hát nối từng câu với bạn bè: nghe câu mẫu → người được gọi hát → AI chấm → ráp cả bài → bảng điểm.
 Máy chủ: supabase/duet.sql (bảng duet_*, bucket 'duet').
 Bài 2: khung · Bài 3: tạo/vào phòng · Bài 5: bài hát, chia câu, thu âm, chấm điểm.
 Nhạc: admin tải bản có lời + beat, app tự tách câu (trừ beat → còn giọng → tìm chỗ ngắt), admin chỉnh mốc.
 Còn lại: bài 4 realtime (đang tạm hỏi lại máy chủ), bài 6 ráp bài + bảng điểm. */
(function(){
/* Trạng thái riêng của module, không lẫn với S của app */
const D={roomId:null,room:null,members:[],song:null,lines:[],assigns:[],takes:[],err:'',sig:''};
try{D.roomId=localStorage.getItem('duet.room')}catch(e){}

const ss=()=>window.__ss||{};              // cầu nối sang app chính: USER, PROF, SB
const user=()=>ss().USER;
const SB=()=>ss().SB;
const BUCKET='duet';
const pad=n=>String(n).padStart(2,'0');
const IC={
 mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
 stop:'<rect x="7" y="7" width="10" height="10" rx="2"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 vol:'<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>',
 play:'<path d="M7 4v16l13-8z"/>'
};
const ic=(k,s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;
const errBox=()=>D.err?`<div class="note" style="border-color:var(--bad)">${esc(D.err)}</div>`:'';

/* ==================== MÀN CHÍNH ==================== */
function vDuet(){
 if(!user())return `<h1>Hát nối</h1><p class="mut">Đăng nhập để hát cùng bạn bè và được AI chấm điểm.</p><button class="btn" style="width:100%" onclick="go('me')">Đăng nhập</button>`;
 if(D.roomId)return vRoom();
 return `<section class="duet-hero">
   <span class="duet-lbl">HÁT NỐI</span>
   <h1>Hát cùng bạn bè, AI chấm điểm</h1>
   <p>Mỗi người hát một câu. Hết bài, app ráp lại thành bản hoàn chỉnh và xếp hạng.</p>
  </section>
  <form class="card stack" onsubmit="event.preventDefault();DUET.join()">
   <b>Vào phòng có sẵn</b>
   <label class="mut" for="du-code" style="font-size:.86rem">Mã phòng 6 số (bạn bè gửi cho bạn)</label>
   <input id="du-code" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="Nhập 6 số" oninput="this.value=this.value.replace(/\\D/g,'')">
   <label class="mut" for="du-nick" style="font-size:.86rem">Tên hiển thị</label>
   <input id="du-nick" maxlength="20" placeholder="Tên của bạn" value="${esc(nickGuess())}">
   <button class="btn">${ic('users',18)} Vào phòng</button>
  </form>
  <form class="card stack" onsubmit="event.preventDefault();DUET.create()">
   <b>Tạo phòng mới</b>
   <label class="mut" for="du-name" style="font-size:.86rem">Tên phòng (bạn là admin)</label>
   <input id="du-name" maxlength="40" placeholder="Ví dụ: Tối thứ Sáu">
   <button class="btn ghost">${ic('plus',18)} Tạo phòng</button>
  </form>
  ${errBox()}
  <p class="mut" style="font-size:.82rem">Nên dùng Chrome hoặc Edge để AI chấm được lời hát.</p>`;
}

/* ==================== TRONG PHÒNG ==================== */
function vRoom(){
 const R=D.room;
 if(!R)return `<h1>Phòng hát nối</h1><div class="card"><p class="mut" style="margin:0">${D.err?esc(D.err):'Đang mở phòng…'}</p></div>
  <button class="btn ghost" style="width:100%;margin-top:12px" onclick="DUET.leave()">Về màn Hát nối</button>`;
 if(R.status==='singing')return vTurn();
 if(R.status==='mixing'||R.status==='done')return vDone();
 return vLobby();
}
const isAdmin=()=>D.room&&D.room.admin_id===user()?.id;
const member=uid=>D.members.find(m=>m.user_id===uid);
const assignOf=line=>D.assigns.find(a=>a.line_id===line.id);
// user_id null = cả nhóm (admin thu đại diện); undefined = chưa chia
const singerOf=line=>{const a=line&&assignOf(line);return a?a.user_id:undefined};
const nameOf=uid=>{if(uid===null)return 'Cả nhóm';const m=member(uid);return m?`${m.slot} · ${m.nickname}`:'—'};
const lastTake=line=>{for(let i=D.takes.length-1;i>=0;i--)if(line&&D.takes[i].line_id===line.id)return D.takes[i];return null};

/* ---------- 1 · Phòng chờ ---------- */
const SAMPLE={title:'Twinkle, Twinkle, Little Star',lyrics:'Twinkle, twinkle, little star\nHow I wonder what you are\nUp above the world so high\nLike a diamond in the sky\nTwinkle, twinkle, little star\nHow I wonder what you are'};
function vLobby(){
 const R=D.room,me=user().id,code=String(R.code);
 return `<section class="duet-hero">
   <span class="duet-lbl">PHÒNG HÁT NỐI</span>
   <h1>${esc(R.name)}</h1>
   <div class="duet-row"><span style="font-size:.86rem">Mã phòng</span>
    <span class="duet-code">${code.slice(0,3)} ${code.slice(3)}</span>
    <button class="duet-out" onclick="DUET.invite()">Mời bạn</button></div>
  </section>
  <section class="card stack">
   <b>Người chơi · ${D.members.length}</b>
   <div class="duet-chips">${D.members.map(m=>`<span class="duet-chip${m.user_id===R.admin_id?' on':''}">${esc(m.slot)} · ${esc(m.nickname)}${m.user_id===R.admin_id?' (admin)':''}${m.user_id===me?' · bạn':''}</span>`).join('')}</div>
   <p class="mut" style="margin:0;font-size:.82rem">Tối đa 6 người. Danh sách tự cập nhật khi có bạn vào.</p>
  </section>
  ${vSong()}
  ${errBox()}
  ${isAdmin()&&D.song&&D.lines.length?`<button class="btn amber" style="width:100%;margin-top:12px" onclick="DUET.start()">${ic('play',18)} Bắt đầu hát</button>`:''}
  <button class="btn ghost" style="width:100%;margin-top:12px" onclick="DUET.leave()">Rời phòng</button>`;
}
function vSong(){
 if(!D.song){
  if(!isAdmin())return `<section class="card"><b>Bài hát</b><p class="mut" style="margin:6px 0 0">Chờ admin chọn bài…</p></section>`;
  return `<form class="card stack" onsubmit="event.preventDefault();DUET.saveSong()">
   <b>Bài hát</b>
   <label class="mut" for="du-title" style="font-size:.86rem">Tên bài</label>
   <input id="du-title" maxlength="80" value="${esc(D.draft?.title??SAMPLE.title)}">
   <label class="mut" for="du-lyrics" style="font-size:.86rem">Lời bài hát, mỗi câu một dòng</label>
   <textarea id="du-lyrics" rows="7" class="duet-ta">${esc(D.draft?.lyrics??SAMPLE.lyrics)}</textarea>
   <label class="mut" for="du-voc" style="font-size:.86rem">Bản có lời (ca sĩ hát), mp3</label>
   <input id="du-voc" type="file" accept="audio/*">
   <label class="mut" for="du-beat" style="font-size:.86rem">Bản beat (không lời) của đúng bài đó</label>
   <input id="du-beat" type="file" accept="audio/*">
   <p class="mut" style="margin:0;font-size:.82rem">App tự tách câu theo bản có lời, sau đó bạn nghe lại và chỉnh. Không có file nhạc thì app dùng giọng máy đọc lời. Mỗi file tối đa 20 MB.</p>
   ${D.prog?`<div class="note" style="margin:0">${esc(D.prog)}</div>`:''}
   <button class="btn ghost" ${D.prog?'disabled':''}>Lưu bài và tách câu</button>
  </form>`;
 }
 const music=!!D.song.original_path,tune=D.tune&&isAdmin()&&music;
 return `<section class="card stack">
  <div class="duet-row"><b style="flex:1">${esc(D.song.title)}</b><span class="mut" style="font-size:.82rem">${D.lines.length} câu${music?' · có nhạc':''}</span></div>
  ${isAdmin()?`<div class="duet-row"><span class="mut" style="font-size:.82rem;flex:1">${tune?'Nghe từng câu, chỉnh mốc bắt đầu / kết thúc':'Chạm vào câu để đổi người hát'}</span>${music?`<button class="duet-link" onclick="DUET.toggleTune()">${tune?'Xong':'Chỉnh mốc'}</button>`:''}${tune?'':`<button class="duet-link" onclick="DUET.autoAssign()">Chia luân phiên</button>`}</div>`:''}
  <ol class="duet-lines">${D.lines.map(l=>{const u=singerOf(l);
   if(tune)return `<li class="duet-tune"><div class="duet-row"><button class="duet-play" onclick="DUET.preview(${l.idx})" aria-label="Nghe câu ${l.idx}">${ic('play',16)}</button><span class="duet-n">${pad(l.idx)}</span><span style="flex:1">${esc(l.text)}</span></div>
    <div class="duet-row duet-adj"><span class="duet-n">Bắt đầu ${fmt(l.start_ms)}</span><button onclick="DUET.nudge(${l.idx},'start',-200)" aria-label="Bắt đầu sớm hơn 0,2 giây">−</button><button onclick="DUET.nudge(${l.idx},'start',200)" aria-label="Bắt đầu muộn hơn 0,2 giây">+</button>
    <span class="duet-n" style="margin-left:auto">Kết thúc ${fmt(l.end_ms)}</span><button onclick="DUET.nudge(${l.idx},'end',-200)" aria-label="Kết thúc sớm hơn 0,2 giây">−</button><button onclick="DUET.nudge(${l.idx},'end',200)" aria-label="Kết thúc muộn hơn 0,2 giây">+</button></div></li>`;
   return `<li><button class="duet-line" ${isAdmin()?`onclick="DUET.cycle('${l.id}')"`:'disabled'}>
   <span class="duet-n">${pad(l.idx)}</span><span style="flex:1">${esc(l.text)}</span><span class="duet-who">${u===undefined?'—':u===null?'Cả nhóm':esc(member(u)?.slot||'?')}</span></button></li>`}).join('')}</ol>
  ${D.splitMode&&isAdmin()?`<p class="mut" style="margin:0;font-size:.82rem">${D.splitMode==='tách giọng'?'Đã tách giọng khỏi beat để tìm chỗ ngắt câu.':'Không trừ được beat (có thể hai file là hai bản phối khác nhau), app tìm chỗ ngắt trên bản có lời nên dễ lệch hơn.'} Nên bấm Chỉnh mốc và nghe lại vài câu trước khi hát.</p>`:''}
  ${isAdmin()?`<button class="duet-link" onclick="DUET.removeSong()">Đổi bài khác</button>`:''}
 </section>`;
}

/* ---------- 2 · Đến lượt hát ---------- */
function vTurn(){
 const R=D.room,me=user().id,idx=R.current_line;
 const line=D.lines.find(l=>l.idx===idx),prev=D.lines.find(l=>l.idx===idx-1),next=D.lines.find(l=>l.idx===idx+1);
 if(!line)return `<section class="duet-hero"><span class="duet-lbl">HẾT BÀI</span><h1>Đang tổng kết…</h1></section>`;
 const singer=singerOf(line),done=lastTake(line);
 const mine=singer===me||(singer===null&&isAdmin());
 const pt=prev&&lastTake(prev);
 return `<div class="duet-row" style="margin-bottom:10px"><span class="duet-n">Câu ${pad(idx)}/${pad(D.lines.length)}</span>
   <div class="duet-bar" role="progressbar" aria-label="Tiến độ bài hát" aria-valuemin="0" aria-valuemax="${D.lines.length}" aria-valuenow="${idx-1}"><i style="width:${(idx-1)/D.lines.length*100}%"></i></div></div>
  ${prev?`<section class="card" style="margin-bottom:10px"><span class="mut" style="font-size:.82rem">Vừa hát · ${esc(nameOf(pt?pt.user_id:singerOf(prev)))}</span>
   <div class="duet-row"><span class="mut" style="flex:1">${esc(prev.text)}</span>${pt?scoreTag(pt.score_total):''}</div></section>`:''}
  <section class="card duet-stage">
   <span class="duet-lbl mut">${mine?'ĐẾN LƯỢT BẠN':'ĐANG HÁT'} · ${esc(nameOf(singer).toUpperCase())}</span>
   <h1 class="duet-term">${esc(line.text)}</h1>
   <button class="btn ghost" style="border-radius:99px" onclick="DUET.say(${idx})">${ic('vol',18)} Nghe câu mẫu</button>
   <div class="duet-mic">${mine&&!done?micUI():done?`<span class="good">✓ Đã thu${done.score_total!=null?` · ${Math.round(done.score_total)} điểm`:''}. Chuyển câu…</span>`:`<span class="mut">Đang chờ ${esc(nameOf(singer))} hát…</span>`}</div>
   ${mine&&D.song?.beat_path&&!done?`<span class="mut" style="font-size:.82rem">Đeo tai nghe để micro không thu lẫn tiếng nhạc. Beat tự chạy khi bạn chạm micro.</span>`:''}
   ${mine&&!canScore?`<span class="mut" style="font-size:.82rem">Trình duyệt này chưa chấm lời được, vẫn thu âm bình thường. Dùng Chrome hoặc Edge để có điểm.</span>`:''}
  </section>
  ${next?`<section class="card duet-row" style="margin-top:10px;background:var(--soft)"><span class="mut" style="font-size:.82rem">Tiếp theo</span><span style="flex:1">${esc(next.text)}</span><span class="duet-who">${esc(nameOf(singerOf(next)))}</span></section>`:''}
  ${errBox()}
  ${isAdmin()&&!done?`<button class="duet-link" style="margin-top:8px" onclick="DUET.skip()">Bỏ qua câu này</button>`:''}
  ${isAdmin()?`<button class="duet-link" onclick="DUET.stopGame()">Dừng, về phòng chờ</button>`:''}
  <button class="btn ghost" style="width:100%;margin-top:12px" onclick="DUET.leave()">Rời phòng</button>`;
}
function micUI(){
 const live=!!REC.h,b=REC.busy;
 return `<span id="du-st" class="${live?'bad':'mut'}" style="font-size:.86rem">${live?'● Đang thu · 00:00':b?'Đang chấm…':'Sẵn sàng'}</span>
  <button class="duet-micbtn${live?' live':''}" onclick="DUET.rec()" ${b?'disabled':''} aria-label="${live?'Dừng thu âm':'Bắt đầu thu âm'}">${ic(live?'stop':'mic',32)}</button>
  <span class="mut" style="font-size:.82rem">${live?'Hát xong thì chạm để dừng':'Chạm micro rồi hát câu này'}</span>`;
}
function scoreTag(v){if(v==null)return '';const n=Math.round(+v),c=n>=80?'good':n>=60?'warn':'bad';return `<b class="${c}">${n>=80?'✓ ':''}${n}</b>`}

/* ---------- 3 · Hết bài (bài 6 làm bảng điểm + bản ráp) ---------- */
function vDone(){
 const rows=D.lines.map(l=>{const t=lastTake(l);return `<li class="duet-row" style="border-top:1px solid var(--line);padding:8px 0"><span class="duet-n">${pad(l.idx)}</span><span style="flex:1">${esc(l.text)}<br><small class="mut">${esc(nameOf(t?t.user_id:singerOf(l)))}${t&&t.wrong_words?.length?' · sai: '+esc(t.wrong_words.join(', ')):''}</small></span>${t?scoreTag(t.score_total):'<span class="mut">—</span>'}</li>`}).join('');
 return `<section class="duet-hero"><span class="duet-lbl">HOÀN THÀNH</span><h1>${esc(D.room.name)}</h1><p>Bài 6 sẽ ráp các đoạn thu thành một bài và xếp hạng từng người.</p></section>
  <section class="card"><b>Điểm từng câu</b><ol class="duet-lines">${rows}</ol></section>
  ${isAdmin()?`<button class="btn amber" style="width:100%;margin-top:12px" onclick="DUET.backToLobby()">Về phòng chờ, hát lại</button>`:''}
  <button class="btn ghost" style="width:100%;margin-top:12px" onclick="DUET.leave()">Rời phòng</button>`;
}

/* ==================== DỮ LIỆU ==================== */
function nickGuess(){const n=ss().PROF?.full_name||'';return n.split(' ').slice(-1)[0]||''}
function setRoom(id){Object.assign(D,{roomId:id,room:null,members:[],song:null,lines:[],assigns:[],takes:[],err:'',sig:''});try{id?localStorage.setItem('duet.room',id):localStorage.removeItem('duet.room')}catch(e){}watch();rerender()}
function rerender(){if(S.tab==='duet'&&!S.game)render()}

async function load(){
 if(!D.roomId||!user()||!SB())return;
 const r=await SB().from('duet_rooms').select('*').eq('id',D.roomId).maybeSingle();
 if(r.error){D.err='Không mở được phòng: '+r.error.message;return rerender()}
 // Không thấy phòng: đã bị xoá, hoặc bạn không còn là thành viên (RLS ẩn đi)
 if(!r.data){D.room=null;D.err='Phòng không còn hoặc bạn không ở trong phòng này.';return rerender()}
 const sid=r.data.song_id;
 const [m,s,l,a,t]=await Promise.all([
  SB().from('duet_members').select('*').eq('room_id',D.roomId).order('slot'),
  sid?SB().from('duet_songs').select('*').eq('id',sid).maybeSingle():{data:null},
  sid?SB().from('duet_lines').select('*').eq('song_id',sid).order('idx'):{data:[]},
  SB().from('duet_assignments').select('*').eq('room_id',D.roomId),
  (()=>{let q=SB().from('duet_takes').select('id,line_id,user_id,score_total,wrong_words,created_at').eq('room_id',D.roomId);if(r.data.round_at)q=q.gte('created_at',r.data.round_at);return q.order('created_at')})()
 ]);
 const next={room:r.data,members:m.data||[],song:s.data,lines:l.data||[],assigns:a.data||[],takes:t.data||[]};
 const sig=JSON.stringify(next);if(sig===D.sig)return; // không đổi thì không vẽ lại (giữ chữ đang gõ)
 Object.assign(D,next,{sig,err:''});
 if(!REC.h)rerender();
 adminStep();
}
// Tạm hỏi lại máy chủ: 2 giây khi đang hát, 5 giây khi chờ. Bài 4 thay bằng realtime.
let timer=null;
function watch(){clearTimeout(timer);timer=null;if(!D.roomId)return;
 const tick=async()=>{try{if(S.tab==='duet')await load()}catch(e){}timer=setTimeout(tick,D.room?.status==='singing'?2000:5000)};tick()}

/* Admin là "người điều khiển": thấy câu hiện tại đã có bản thu thì chuyển câu, hết câu thì kết thúc */
let stepping=false;
function adminStep(){
 if(!isAdmin()||stepping||D.room.status!=='singing')return;
 const idx=D.room.current_line,line=D.lines.find(l=>l.idx===idx);
 if(line&&lastTake(line)){stepping=true;setTimeout(async()=>{await SB().from('duet_rooms').update({current_line:idx+1}).eq('id',D.room.id).eq('current_line',idx);stepping=false;load()},1500)}
 else if(!line&&D.lines.length){stepping=true;SB().from('duet_rooms').update({status:'done'}).eq('id',D.room.id).then(()=>{stepping=false;load()})}
}

/* ==================== HÀNH ĐỘNG ==================== */
const val=id=>(document.getElementById(id)?.value||'').trim();
let busy=false;
const fail=(msg,e)=>{busy=false;D.err=msg+(e?.message?': '+e.message:'');rerender()};

async function create(){
 if(busy)return;D.err='';
 const name=val('du-name');
 if(!name)return fail('Đặt tên phòng trước nhé.');
 busy=true;
 // Mã 6 số ngẫu nhiên; trùng mã (lỗi 23505, hiếm) thì thử lại tối đa 3 lần
 for(let i=0;i<3;i++){
  const code=String(Math.floor(100000+Math.random()*900000));
  const {data,error}=await SB().from('duet_rooms').insert({code,name,admin_id:user().id}).select('id').single();
  if(!error){busy=false;toast('Đã tạo phòng');return setRoom(data.id)}
  if(error.code!=='23505')return fail('Chưa tạo được phòng',error);
 }
 fail('Chưa tạo được phòng, thử lại nhé.');
}
async function join(){
 if(busy)return;D.err='';
 const code=val('du-code'),nick=val('du-nick');
 if(!/^\d{6}$/.test(code))return fail('Mã phòng gồm 6 chữ số.');
 if(!nick)return fail('Nhập tên hiển thị của bạn.');
 busy=true;
 const {data,error}=await SB().rpc('duet_join_room',{p_code:code,p_nickname:nick});
 if(error)return fail(error.message);
 busy=false;toast('Đã vào phòng');setRoom(data);
}
async function invite(){
 const R=D.room;if(!R)return;
 const text=`Vào phòng Hát nối "${R.name}" trên SteelSpeak, mã phòng ${R.code}: ${location.origin+location.pathname}`;
 try{if(navigator.share){await navigator.share({text});return}}catch(e){if(e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(text);toast('Đã chép lời mời')}catch(e){toast('Mã phòng: '+R.code)}
}
async function leave(){
 stopRec(true);
 const R=D.room;
 // Admin rời thì phòng vẫn giữ; thành viên rời thì xoá tên khỏi phòng
 if(R&&R.admin_id!==user()?.id)await SB().from('duet_members').delete().eq('room_id',R.id).eq('user_id',user().id);
 setRoom(null);
}

/* ---- Bài hát và chia câu (admin) ---- */
async function saveSong(){
 if(busy)return;D.err='';
 const title=val('du-title'),lyrics=document.getElementById('du-lyrics')?.value||'';
 const rows=lyrics.split('\n').map(s=>s.trim()).filter(Boolean);
 const fv=document.getElementById('du-voc')?.files?.[0],fb=document.getElementById('du-beat')?.files?.[0];
 D.draft={title,lyrics};                                  // giữ lại chữ đã nhập nếu có lỗi
 if(!title)return fail('Nhập tên bài hát.');
 if(rows.length<2)return fail('Cần ít nhất 2 câu, mỗi câu một dòng.');
 if(rows.length>60)return fail('Tối đa 60 câu mỗi bài.');
 if(fb&&!fv)return fail('Cần thêm bản có lời để app tách câu.');
 for(const f of [fv,fb])if(f&&f.size>20*1024*1024)return fail('Mỗi file nhạc tối đa 20 MB.');
 busy=true;
 const prog=t=>{D.prog=t;rerender()};
 try{
  let times=rows.map((_,i)=>({start:i*4000,end:(i+1)*4000})),vBuf=null,bBuf=null,offset=0;
  if(fv){
   prog('Đang đọc file nhạc…');
   vBuf=await AC().decodeAudioData(await fv.arrayBuffer());
   if(fb)bBuf=await AC().decodeAudioData(await fb.arrayBuffer());
   prog(fb?'Đang tách giọng khỏi beat và tìm chỗ ngắt câu…':'Đang tìm chỗ ngắt câu…');
   await new Promise(r=>setTimeout(r,50));               // cho màn hình kịp hiện dòng trạng thái
   const sp=splitLines(vBuf,bBuf,rows.length);times=sp.times;offset=sp.offset;D.splitMode=sp.mode;
  }
  prog('Đang lưu bài…');
  const s=await SB().from('duet_songs').insert({room_id:D.room.id,title,source:fv?'upload':'public_domain',status:'ready'}).select('id').single();
  if(s.error)throw new Error('Chưa lưu được bài: '+s.error.message);
  if(fv){
   prog('Đang tải nhạc lên…');
   const base=`${D.room.id}/${user().id}/song-${s.data.id}`,ext=f=>(f.name.split('.').pop()||'mp3').toLowerCase().replace(/[^a-z0-9]/g,'');
   const pv=`${base}-voc.${ext(fv)}`,pb=fb?`${base}-beat.${ext(fb)}`:null;
   const uv=await SB().storage.from(BUCKET).upload(pv,fv,{contentType:fv.type||'audio/mpeg'});
   if(uv.error)throw new Error('Tải bản có lời lỗi: '+uv.error.message);
   if(fb){const ub=await SB().storage.from(BUCKET).upload(pb,fb,{contentType:fb.type||'audio/mpeg'});if(ub.error)throw new Error('Tải bản beat lỗi: '+ub.error.message)}
   BUF[pv]=vBuf;if(pb)BUF[pb]=bBuf;
   const us=await SB().from('duet_songs').update({original_path:pv,beat_path:pb,beat_offset_ms:offset}).eq('id',s.data.id);
   if(us.error)throw new Error('Chưa lưu được thông tin nhạc: '+us.error.message+'. Bạn đã chạy duet_music.sql chưa?');
  }
  const l=await SB().from('duet_lines').insert(rows.map((text,i)=>({song_id:s.data.id,idx:i+1,text,start_ms:times[i].start,end_ms:Math.max(times[i].start+100,times[i].end)}))).select('*');
  if(l.error)throw new Error('Chưa lưu được lời: '+l.error.message);
  const u=await SB().from('duet_rooms').update({song_id:s.data.id}).eq('id',D.room.id);
  if(u.error)throw new Error('Chưa gắn bài vào phòng: '+u.error.message);
  D.lines=l.data.sort((a,b)=>a.idx-b.idx);
  await autoAssign(true);
  D.prog='';D.draft=null;D.tune=!!fv;busy=false;
  toast(fv?'Đã tách câu. Nghe lại và chỉnh mốc nếu cần.':'Đã lưu bài và chia câu');load();
 }catch(e){D.prog='';fail(e.message)}
}
function toggleTune(){D.tune=!D.tune;stopPlay();rerender()}
async function preview(idx){
 const l=D.lines.find(x=>x.idx===idx);if(!l)return;
 try{const b=await getBuf(D.song.original_path);playSeg(b,l.start_ms,l.end_ms)}catch(e){fail(e.message)}
}
async function nudge(idx,key,d){
 const l=D.lines.find(x=>x.idx===idx);if(!l)return;
 const col=key==='start'?'start_ms':'end_ms',v=Math.max(0,l[col]+d);
 if(key==='start'&&v>=l.end_ms-100)return;if(key==='end'&&v<=l.start_ms+100)return;
 l[col]=v;rerender();                                     // hiện ngay, lưu sau
 const {error}=await SB().from('duet_lines').update({[col]:v}).eq('id',l.id);
 if(error)return fail('Chưa lưu được mốc. Bạn đã chạy duet_music.sql chưa?',error);
 preview(idx);
}
async function autoAssign(quiet){
 if(!D.members.length||!D.lines.length)return;
 const rows=D.lines.map((l,i)=>({room_id:D.room.id,line_id:l.id,user_id:D.members[i%D.members.length].user_id}));
 const {error}=await SB().from('duet_assignments').upsert(rows);
 if(error)return fail('Chưa chia được câu',error);
 if(quiet!==true){toast('Đã chia luân phiên');load()}
}
async function cycle(lineId){
 const line=D.lines.find(l=>l.id===lineId);if(!line||!isAdmin())return;
 const order=[...D.members.map(m=>m.user_id),null],cur=singerOf(line);
 const nextU=order[(order.indexOf(cur===undefined?null:cur)+1)%order.length];
 const {error}=await SB().from('duet_assignments').upsert({room_id:D.room.id,line_id:line.id,user_id:nextU});
 if(error)return fail('Chưa đổi được',error);
 load();
}
async function removeSong(){
 const {error}=await SB().from('duet_rooms').update({song_id:null}).eq('id',D.room.id);
 if(error)return fail('Chưa đổi được bài',error);
 load();
}
async function start(){
 D.err='';
 if(D.members.length<1)return fail('Phòng chưa có ai.');
 if(D.lines.some(l=>singerOf(l)===undefined))await autoAssign(true);
 const {error}=await SB().from('duet_rooms').update({status:'singing',current_line:1}).eq('id',D.room.id);
 if(error)return fail('Chưa bắt đầu được',error);
 load();
}
const setRoomRow=async(patch)=>{const {error}=await SB().from('duet_rooms').update(patch).eq('id',D.room.id);if(error)fail('Chưa cập nhật được phòng',error);else load()};
const skip=()=>setRoomRow({current_line:D.room.current_line+1});
const stopGame=()=>{stopRec(true);setRoomRow({status:'waiting',current_line:0})};
const backToLobby=()=>setRoomRow({status:'waiting',current_line:0});

/* ==================== NHẠC: TẢI, TÁCH CÂU, PHÁT ==================== */
let _ac=null;
const AC=()=>{if(!_ac)_ac=new (window.AudioContext||window.webkitAudioContext)();if(_ac.state==='suspended')_ac.resume();return _ac};
const BUF={};                       // bộ nhớ đệm: đường dẫn → AudioBuffer đã giải mã
async function getBuf(path){
 if(!path)return null;if(BUF[path])return BUF[path];
 const {data,error}=await SB().storage.from(BUCKET).download(path);
 if(error)throw new Error('Không tải được nhạc: '+error.message);
 return BUF[path]=await AC().decodeAudioData(await data.arrayBuffer());
}
function mono(buf){const n=buf.length,out=new Float32Array(n);for(let c=0;c<buf.numberOfChannels;c++){const d=buf.getChannelData(c);for(let i=0;i<n;i++)out[i]+=d[i]/buf.numberOfChannels}return out}

/* Đường bao năng lượng: tổng |mẫu| trong mỗi khung `f` mẫu */
function env(x,f){const n=Math.floor(x.length/f),e=new Float32Array(n);for(let i=0;i<n;i++){let s=0;for(let j=i*f,k=j+f;j<k;j++)s+=Math.abs(x[j]);e[i]=s/f}return e}

/* Bước 1: tìm độ lệch giữa bản có lời (v) và beat (b): v[t] ≈ g·b[t−lag] */
function align(v,b,sr){
 const f=Math.round(sr*0.01);                       // khung 10 ms
 const ev=env(v,f),eb=env(b,f),N=Math.min(ev.length,eb.length,6000);   // dùng 60 giây đầu
 const mean=a=>{let s=0;for(let i=0;i<N;i++)s+=a[i];return s/N},mv=mean(ev),mb=mean(eb);
 let best=-Infinity,lagF=0;
 for(let L=-300;L<=300;L++){                         // thử lệch ±3 giây
  let s=0;for(let i=Math.max(0,L);i<N&&i-L<N;i++)s+=(ev[i]-mv)*(eb[i-L]-mb);
  if(s>best){best=s;lagF=L}
 }
 // Tinh chỉnh tới từng mẫu trên 1,5 giây ở giữa bài
 const mid=Math.floor(Math.min(v.length,b.length)/2),W=Math.round(sr*1.5);
 let lag=lagF*f,bestS=-Infinity;
 for(let d=-f;d<=f;d++){const L=lagF*f+d;let s=0;for(let i=mid;i<mid+W;i+=2){const j=i-L;if(j>=0&&j<b.length)s+=v[i]*b[j]}if(s>bestS){bestS=s;lag=L}}
 // Hệ số âm lượng g (bình phương tối thiểu) trên 30 giây ở giữa
 let num=0,den=0;for(let i=mid,k=Math.min(v.length,mid+sr*30);i<k;i+=4){const j=i-lag;if(j<0||j>=b.length)continue;num+=v[i]*b[j];den+=b[j]*b[j]}
 return {lag,g:den?num/den:0};
}

/* Bước 2–4: lấy riêng giọng hát, tìm chỗ ngắt, khớp với số câu */
function splitLines(vBuf,bBuf,nLines){
 const sr=vBuf.sampleRate,v=mono(vBuf);
 let x=v,lag=0,mode='vocal';
 if(bBuf&&bBuf.sampleRate===sr){
  const b=mono(bBuf),a=align(v,b,sr);lag=a.lag;
  const r=new Float32Array(v.length);let ev=0,er=0;
  for(let i=0;i<v.length;i++){const j=i-lag,bv=j>=0&&j<b.length?b[j]:0;r[i]=v[i]-a.g*bv;ev+=v[i]*v[i];er+=r[i]*r[i]}
  if(er<ev*0.6){x=r;mode='tách giọng'}             // trừ beat làm năng lượng giảm rõ → tách giọng thành công
 }
 const F=Math.round(sr*0.02),e=env(x,F);            // khung 20 ms
 const db=Array.from(e,y=>20*Math.log10(y+1e-6));
 const sm=db.map((_,i)=>{let s=0,c=0;for(let k=i-3;k<=i+3;k++)if(k>=0&&k<db.length){s+=db[k];c++}return s/c});
 const sorted=[...sm].sort((p,q)=>p-q),pct=p=>sorted[Math.floor(p*(sorted.length-1))];
 const floor=pct(.2),peak=pct(.95),thr=floor+0.3*(peak-floor);
 let segs=[],on=-1;
 for(let i=0;i<=sm.length;i++){const up=i<sm.length&&sm[i]>thr;if(up&&on<0)on=i;if(!up&&on>=0){segs.push([on,i]);on=-1}}
 // Gộp khoảng nghỉ < 300 ms, bỏ tiếng ngắn < 250 ms
 segs=segs.reduce((o,s)=>{const l=o[o.length-1];if(l&&s[0]-l[1]<15)l[1]=s[1];else o.push(s);return o},[]).filter(s=>s[1]-s[0]>=13);
 if(!segs.length)segs=[[0,sm.length]];
 // Khớp số đoạn với số câu: thừa thì gộp chỗ nghỉ ngắn nhất, thiếu thì chia đoạn dài nhất tại chỗ nhỏ tiếng nhất
 while(segs.length>nLines){let k=0,g=Infinity;for(let i=0;i<segs.length-1;i++){const d=segs[i+1][0]-segs[i][1];if(d<g){g=d;k=i}}segs.splice(k,2,[segs[k][0],segs[k+1][1]])}
 while(segs.length<nLines){let k=0;segs.forEach((s,i)=>{if(s[1]-s[0]>segs[k][1]-segs[k][0])k=i});const [a,b]=segs[k],lo=a+Math.floor((b-a)*.2),hi=a+Math.ceil((b-a)*.8);let m=lo;for(let i=lo;i<hi;i++)if(sm[i]<sm[m])m=i;if(b-a<4)break;segs.splice(k,1,[a,m],[m,b])}
 while(segs.length<nLines){const l=segs[segs.length-1];segs.push([l[1],l[1]+100])}   // bài quá ngắn: thêm đoạn giả để admin chỉnh
 const ms=i=>Math.round(i*F/sr*1000),total=Math.round(vBuf.duration*1000);
 const out=segs.map(([a,b])=>({start:Math.max(0,ms(a)-150),end:Math.min(total,ms(b)+250)}));
 for(let i=0;i<out.length-1;i++)if(out[i].end>out[i+1].start)out[i].end=out[i+1].start;
 return {times:out,offset:Math.round(lag/sr*1000),mode};
}

/* Phát một đoạn của file nhạc. Trả về {node, at}: at = giờ AudioContext lúc bắt đầu */
let PLAY=null;
function stopPlay(){try{PLAY&&PLAY.stop()}catch(e){}PLAY=null}
function playSeg(buf,fromMs,toMs,delay=0){
 stopPlay();const ac=AC(),s=ac.createBufferSource();s.buffer=buf;s.connect(ac.destination);
 const from=Math.max(0,fromMs/1000),dur=Math.max(.1,(toMs-fromMs)/1000);
 const at=ac.currentTime+delay;s.start(at,from,dur);PLAY=s;return {node:s,at,from};
}
const fmt=ms=>{const s=Math.max(0,ms)/1000;return Math.floor(s/60)+':'+(s%60).toFixed(1).padStart(4,'0')};

/* ==================== THU ÂM + CHẤM ĐIỂM ==================== */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const canScore=!!SR;
const REC={h:null,busy:false,t:0,iv:0};

async function say(idx){
 const l=D.lines.find(x=>x.idx===idx);if(!l)return;
 AC();                                                    // mở khoá âm thanh ngay trong lúc chạm (iPhone cần)
 if(D.song?.original_path){                               // có bản ca sĩ hát: phát đúng đoạn câu này
  try{const b=await getBuf(D.song.original_path);playSeg(b,l.start_ms,l.end_ms);return}catch(e){D.err=e.message;rerender()}
 }
 if(!window.speechSynthesis)return;                       // không có nhạc: giọng máy đọc lời
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(l.text);u.lang='en-US';u.rate=.9;speechSynthesis.speak(u);
}
async function startRecording(){
 const stream=await navigator.mediaDevices.getUserMedia({audio:true});
 const mr=new MediaRecorder(stream),chunks=[];
 mr.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
 let text='',sr=null;
 if(SR){sr=new SR();sr.lang='en-US';sr.continuous=true;sr.interimResults=false;
  sr.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)text+=' '+e.results[i][0].transcript};
  sr.onerror=()=>{};try{sr.start()}catch(e){sr=null}}
 mr.start();
 return {stop:()=>new Promise(res=>{
  mr.onstop=()=>{stream.getTracks().forEach(t=>t.stop());const blob=new Blob(chunks,{type:mr.mimeType||'audio/webm'});
   setTimeout(()=>res({blob,text:text.trim()}),sr?700:0)};   // chờ nhận dạng trả nốt kết quả cuối
  try{sr&&sr.stop()}catch(e){}mr.stop()}),
  cancel:()=>{try{sr&&sr.abort()}catch(e){}try{mr.stop()}catch(e){}stream.getTracks().forEach(t=>t.stop())}};
}
// So từng từ của câu mẫu với lời nhận dạng được → điểm % và danh sách từ sai
const norm=s=>s.toLowerCase().replace(/[’']/g,"'").replace(/[^a-z' ]+/g,' ').split(/\s+/).filter(Boolean);
function scoreWords(target,heard){
 const T=norm(target),pool=norm(heard),wrong=[];
 for(const w of T){const i=pool.indexOf(w);if(i>=0)pool.splice(i,1);else wrong.push(w)}
 return {score:T.length?Math.round((T.length-wrong.length)/T.length*100):0,wrong:[...new Set(wrong)]};
}
function stopRec(cancel){clearInterval(REC.iv);if(cancel){clearTimeout(REC.auto);stopPlay()}if(REC.h&&cancel)REC.h.cancel();if(cancel)REC.h=null}

async function rec(){
 D.err='';
 const line=D.lines.find(l=>l.idx===D.room?.current_line);if(!line||REC.busy)return;
 if(!REC.h){
  const ac=AC();                                          // mở khoá âm thanh trong lúc chạm
  let beat=null;
  if(D.song?.beat_path){
   const el=document.getElementById('du-st');if(el)el.textContent='Đang tải nhạc…';
   try{beat=await getBuf(D.song.beat_path)}catch(e){D.err=e.message;rerender();return}
  }
  try{REC.h=await startRecording()}catch(e){D.err='Chưa dùng được micro. Cho phép micro rồi thử lại.';rerender();if(window.MIC&&MIC.open)MIC.open();return}
  const recAt=ac.currentTime;REC.t=Date.now();REC.off=0;REC.cue=0;
  if(beat){
   // Phát beat từ 1,5 giây trước câu (nhạc dạo) đến hết câu; tự dừng thu khi hết đoạn
   const off=D.song.beat_offset_ms||0,bs=line.start_ms-off,lead=Math.min(1500,Math.max(0,bs));
   const p=playSeg(beat,bs-lead,line.end_ms-off+400,0.15);
   REC.off=Math.round((p.at-recAt)*1000+lead);            // vị trí đầu câu trong bản thu, bài 6 dùng để ráp
   REC.cue=Date.now()+REC.off;
   REC.auto=setTimeout(()=>{if(REC.h)rec()},REC.off+(line.end_ms-line.start_ms)+700);
  }
  rerender();
  REC.iv=setInterval(()=>{const el=document.getElementById('du-st');if(!el)return;const now=Date.now();
   el.textContent=REC.cue&&now<REC.cue?`Nhạc dạo… vào sau ${Math.ceil((REC.cue-now)/1000)}`:REC.cue?'● Hát đi!':'● Đang thu · 00:'+pad(Math.min(59,Math.floor((now-REC.t)/1000)))},150);
  return;
 }
 const h=REC.h,off=REC.off||0;clearTimeout(REC.auto);stopRec(false);stopPlay();REC.h=null;REC.busy=true;rerender();
 try{
  const {blob,text}=await h.stop();
  const {score,wrong}=canScore?scoreWords(line.text,text):{score:null,wrong:[]};
  const ext=blob.type.includes('mp4')?'m4a':'webm';
  const path=`${D.room.id}/${user().id}/line-${pad(line.idx)}-${Date.now()}.${ext}`;
  const up=await SB().storage.from(BUCKET).upload(path,blob,{contentType:blob.type});
  if(up.error)throw new Error('Tải bản thu lỗi: '+up.error.message);
  const ins=await SB().from('duet_takes').insert({room_id:D.room.id,line_id:line.id,user_id:user().id,audio_path:path,offset_ms:off,score_words:score,score_total:score,wrong_words:wrong});
  if(ins.error)throw new Error(ins.error.message);
  toast(score==null?'Đã thu xong':`Được ${score} điểm${wrong.length?' · luyện lại: '+wrong.slice(0,3).join(', '):''}`);
 }catch(e){D.err=e.message||'Thu âm lỗi'}
 REC.busy=false;load().then(rerender);
}

/* ---------- Thẻ lối vào trên trang Học ---------- */
function duetCard(){
 return `<button class="card login-nudge" onclick="go('duet')"><span class="tile2-ic" style="background:var(--soft);color:var(--steel2)">${ic('mic',20)}</span><span style="flex:1;text-align:left"><b>Hát nối cùng bạn bè</b><small>Mỗi người một câu, AI chấm điểm từng người</small></span><span class="chev">›</span></button>`;
}

/* CSS riêng của module, chỉ dùng biến màu sẵn có của SteelSpeak */
const st=document.createElement('style');
st.textContent=`.duet-hero{border-radius:18px;padding:18px;color:#fff;background:repeating-linear-gradient(100deg,#1b3f61 0 14px,#214b72 14px 28px);display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
.duet-hero h1{margin:0;color:#fff;font-size:1.6rem;line-height:1.15;text-wrap:balance}.duet-hero p{margin:0;opacity:.9}
.duet-lbl{font-size:.78rem;font-weight:600;letter-spacing:.08em}
.duet-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.duet-code{font-family:ui-monospace,monospace;font-size:1rem;background:rgba(255,255,255,.14);padding:4px 10px;border-radius:99px}
.duet-out{margin-left:auto;min-height:44px;padding:0 14px;border-radius:12px;border:1px solid rgba(255,255,255,.45);background:transparent;color:#fff;font:inherit;cursor:pointer}
.duet-chips{display:flex;gap:8px;flex-wrap:wrap}
.duet-chip{padding:6px 12px;border-radius:99px;background:var(--soft);font-size:.86rem}
.duet-chip.on{background:var(--steel);color:var(--card)}
#app form.card input,.duet-ta{width:100%;min-height:44px;box-sizing:border-box;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink);font:inherit}
.duet-ta{resize:vertical;line-height:1.5}
.duet-lines{list-style:none;margin:0;padding:0}
.duet-line{width:100%;display:flex;gap:10px;align-items:center;min-height:44px;background:none;border:0;border-top:1px solid var(--line);color:inherit;font:inherit;text-align:left;padding:8px 0;cursor:pointer}
.duet-line:disabled{cursor:default;color:inherit}
.duet-n{font-family:ui-monospace,monospace;font-size:.82rem;color:var(--mut)}
.duet-who{font-size:.82rem;font-weight:600;color:var(--steel2)}
.duet-link{background:none;border:0;color:var(--steel2);font:inherit;font-weight:500;min-height:44px;padding:0;cursor:pointer;display:block}
.duet-bar{flex:1;height:6px;border-radius:99px;background:var(--line);overflow:hidden}.duet-bar i{display:block;height:100%;background:var(--amber);transition:width .3s ease-out}
.duet-stage{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;padding:22px 16px}
.duet-term{margin:0;font-size:1.7rem;line-height:1.15;text-wrap:balance}
.duet-mic{display:flex;flex-direction:column;align-items:center;gap:10px;min-height:150px;justify-content:flex-end}
.duet-micbtn{width:84px;height:84px;border-radius:99px;border:6px solid var(--soft);background:var(--bad);color:#fff;display:grid;place-items:center;cursor:pointer}
.duet-micbtn:disabled{opacity:.6}
.duet-micbtn.live{animation:duetwave 1.2s ease-out infinite}
@keyframes duetwave{from{box-shadow:0 0 0 0 rgba(200,67,58,.45)}to{box-shadow:0 0 0 22px rgba(200,67,58,0)}}
@media (prefers-reduced-motion:reduce){.duet-micbtn.live{animation:none}}
.duet-tune{border-top:1px solid var(--line);padding:8px 0;display:flex;flex-direction:column;gap:6px}
.duet-play{width:44px;height:44px;border-radius:99px;border:1px solid var(--line);background:var(--soft);color:var(--ink);display:grid;place-items:center;cursor:pointer;flex:none}
.duet-adj{gap:6px}.duet-adj button{min-width:44px;min-height:44px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:1.1rem;cursor:pointer}
#app form.card input[type=file]{padding:8px}`;
document.head.appendChild(st);

window.vDuet=vDuet;window.duetCard=duetCard;
window.DUET={toggleTune,preview,nudge,join,create,leave,invite,saveSong,autoAssign,cycle,removeSong,start,skip,stopGame,backToLobby,say,rec,reload:load,state:D};
watch();
})();
