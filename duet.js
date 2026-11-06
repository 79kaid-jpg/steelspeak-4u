/* ===================== HÁT NỐI (DUET) =====================
 Hát nối từng câu với bạn bè: nghe câu mẫu → người được gọi hát → AI chấm → ráp cả bài → bảng điểm.
 Máy chủ: supabase/duet.sql (bảng duet_*, bucket 'duet').
 Bài 2: khung màn hình + đường vào. Các bài sau lấp dần từng phần (đánh dấu TODO). */
(function(){
/* Trạng thái riêng của module, không lẫn với S của app */
const D={view:'home',roomId:null,room:null,members:[],err:'',sig:''};
try{D.roomId=localStorage.getItem('duet.room')}catch(e){}

const ss=()=>window.__ss||{};              // cầu nối sang app chính: USER, SB
const user=()=>ss().USER;
const IC={
 mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
 plus:'<path d="M12 5v14M5 12h14"/>'
};
const ic=(k,s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;

/* ---------- Màn chính của tab ---------- */
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
   <label class="mut" for="du-code" style="font-size:.86rem">Mã phòng 6 số</label>
   <input id="du-code" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="482913" oninput="this.value=this.value.replace(/\\D/g,'')">
   <label class="mut" for="du-nick" style="font-size:.86rem">Tên hiển thị</label>
   <input id="du-nick" maxlength="20" placeholder="Minh" value="${esc(nickGuess())}">
   <button class="btn">${ic('users',18)} Vào phòng</button>
  </form>
  <form class="card stack" onsubmit="event.preventDefault();DUET.create()">
   <b>Tạo phòng mới</b>
   <label class="mut" for="du-name" style="font-size:.86rem">Tên phòng (bạn là admin)</label>
   <input id="du-name" maxlength="40" placeholder="Tối thứ Sáu">
   <button class="btn ghost">${ic('plus',18)} Tạo phòng</button>
  </form>
  ${D.err?`<div class="note" style="border-color:var(--bad)">${esc(D.err)}</div>`:''}
  <p class="mut" style="font-size:.82rem">Nên dùng Chrome hoặc Edge để AI chấm được lời hát.</p>`;
}

/* ---------- Màn trong phòng ---------- */
function vRoom(){
 const R=D.room;
 if(!R)return `<h1>Phòng hát nối</h1><div class="card"><p class="mut" style="margin:0">${D.err?esc(D.err):'Đang mở phòng…'}</p></div>
  <button class="btn ghost" style="width:100%;margin-top:12px" onclick="DUET.leave()">Về màn Hát nối</button>`;
 const me=user().id,isAdmin=R.admin_id===me,code=String(R.code);
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
  <section class="card stack">
   <b>Bài hát</b>
   <p class="mut" style="margin:0">${isAdmin?'Bài 5 sẽ thêm phần dán lời và chia câu ở đây.':'Chờ admin chọn bài…'}</p>
  </section>
  ${D.err?`<div class="note" style="border-color:var(--bad)">${esc(D.err)}</div>`:''}
  <button class="btn ghost" style="width:100%;margin-top:12px" onclick="DUET.leave()">Rời phòng</button>`;
 // TODO bài 4: realtime "đến lượt ai" · bài 5: bài hát + thu âm · bài 6: ráp bài + bảng điểm
}

function nickGuess(){const n=ss().PROF?.full_name||'';return n.split(' ').slice(-1)[0]||''}
function setRoom(id){D.roomId=id;D.room=null;D.members=[];D.err='';try{id?localStorage.setItem('duet.room',id):localStorage.removeItem('duet.room')}catch(e){}watch();rerender()}
function rerender(){if(S.tab==='duet'&&!S.game)render()}
const SB=()=>ss().SB;

/* ---------- Đọc dữ liệu phòng ---------- */
async function load(){
 if(!D.roomId||!user())return;
 const [r,m]=await Promise.all([
  SB().from('duet_rooms').select('*').eq('id',D.roomId).maybeSingle(),
  SB().from('duet_members').select('*').eq('room_id',D.roomId).order('slot')
 ]);
 if(r.error){D.err='Không mở được phòng: '+r.error.message;return rerender()}
 // Không có phòng: đã bị xoá, hoặc bạn không còn là thành viên (RLS ẩn đi)
 if(!r.data){D.room=null;D.err='Phòng không còn hoặc bạn không ở trong phòng này.';return rerender()}
 const sig=JSON.stringify([r.data,m.data]);if(sig===D.sig)return; // không đổi thì không vẽ lại (giữ chữ đang gõ)
 D.sig=sig;D.room=r.data;D.members=m.data||[];D.err='';rerender();
}
// Bài 3 dùng hỏi lại mỗi 5 giây; bài 4 thay bằng realtime
let timer=null;
function watch(){clearInterval(timer);timer=null;D.sig='';if(D.roomId){load();timer=setInterval(()=>{if(S.tab==='duet')load()},5000)}}

/* ---------- Hành động ---------- */
const val=id=>(document.getElementById(id)?.value||'').trim();
let busy=false;
async function create(){
 if(busy)return;D.err='';
 const name=val('du-name');
 if(!name){D.err='Đặt tên phòng trước nhé.';return rerender()}
 busy=true;
 // Mã 6 số ngẫu nhiên; trùng mã (hiếm) thì thử lại tối đa 3 lần
 for(let i=0;i<3;i++){
  const code=String(Math.floor(100000+Math.random()*900000));
  const {data,error}=await SB().from('duet_rooms').insert({code,name,admin_id:user().id}).select('id').single();
  if(!error){busy=false;toast('Đã tạo phòng');return setRoom(data.id)}
  if(error.code!=='23505'){busy=false;D.err='Chưa tạo được phòng: '+error.message;return rerender()}
 }
 busy=false;D.err='Chưa tạo được phòng, thử lại nhé.';rerender();
}
async function join(){
 if(busy)return;D.err='';
 const code=val('du-code'),nick=val('du-nick');
 if(!/^\d{6}$/.test(code)){D.err='Mã phòng gồm 6 chữ số.';return rerender()}
 if(!nick){D.err='Nhập tên hiển thị của bạn.';return rerender()}
 busy=true;
 const {data,error}=await SB().rpc('duet_join_room',{p_code:code,p_nickname:nick});
 busy=false;
 if(error){D.err=error.message;return rerender()}
 toast('Đã vào phòng');setRoom(data);
}
async function invite(){
 const R=D.room;if(!R)return;
 const text=`Vào phòng Hát nối "${R.name}" trên SteelSpeak, mã phòng ${R.code}: ${location.origin+location.pathname}`;
 try{if(navigator.share){await navigator.share({text});return}}catch(e){if(e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(text);toast('Đã chép lời mời')}catch(e){toast('Mã phòng: '+R.code)}
}
async function leave(){
 const R=D.room;
 // Admin rời thì phòng vẫn giữ; thành viên rời thì xoá tên khỏi phòng
 if(R&&R.admin_id!==user()?.id){await SB().from('duet_members').delete().eq('room_id',R.id).eq('user_id',user().id)}
 setRoom(null);
}
watch();

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
#app form.card input{width:100%;min-height:44px;box-sizing:border-box;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink);font:inherit}`;
document.head.appendChild(st);

window.vDuet=vDuet;window.duetCard=duetCard;
window.DUET={join,create,leave,invite,reload:load,state:D};
})();
