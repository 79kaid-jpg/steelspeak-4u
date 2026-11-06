/* ===================== HÁT NỐI (DUET) =====================
 Hát nối từng câu với bạn bè: nghe câu mẫu → người được gọi hát → AI chấm → ráp cả bài → bảng điểm.
 Máy chủ: supabase/duet.sql (bảng duet_*, bucket 'duet').
 Bài 2: khung màn hình + đường vào. Các bài sau lấp dần từng phần (đánh dấu TODO). */
(function(){
/* Trạng thái riêng của module, không lẫn với S của app */
const D={view:'home',roomId:null,err:''};
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

/* ---------- Màn trong phòng (bài 3–6 lấp tiếp) ---------- */
function vRoom(){
 return `<h1>Phòng hát nối</h1>
  <div class="card stack"><p class="mut" style="margin:0">Đang mở phòng…</p></div>
  <button class="btn ghost" style="width:100%" onclick="DUET.leave()">Rời phòng</button>`;
 // TODO bài 3: tải phòng, thành viên, bài hát → phòng chờ
 // TODO bài 4: realtime "đến lượt ai"
 // TODO bài 5: thu âm + chấm điểm · TODO bài 6: ráp bài + bảng điểm
}

function nickGuess(){const n=ss().PROF?.full_name||'';return n.split(' ').slice(-1)[0]||''}
function setRoom(id){D.roomId=id;D.err='';try{id?localStorage.setItem('duet.room',id):localStorage.removeItem('duet.room')}catch(e){}render()}

/* ---------- Hành động (bài 3 viết thật) ---------- */
async function join(){D.err='';toast('Bài 3 sẽ nối nút này với máy chủ');}
async function create(){D.err='';toast('Bài 3 sẽ nối nút này với máy chủ');}
function leave(){setRoom(null)}

/* ---------- Thẻ lối vào trên trang Học ---------- */
function duetCard(){
 return `<button class="card login-nudge" onclick="go('duet')"><span class="tile2-ic" style="background:var(--soft);color:var(--steel2)">${ic('mic',20)}</span><span style="flex:1;text-align:left"><b>Hát nối cùng bạn bè</b><small>Mỗi người một câu, AI chấm điểm từng người</small></span><span class="chev">›</span></button>`;
}

/* CSS riêng của module, chỉ dùng biến màu sẵn có của SteelSpeak */
const st=document.createElement('style');
st.textContent=`.duet-hero{border-radius:18px;padding:18px;color:#fff;background:repeating-linear-gradient(100deg,#1b3f61 0 14px,#214b72 14px 28px);display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
.duet-hero h1{margin:0;color:#fff;font-size:1.6rem;line-height:1.15;text-wrap:balance}.duet-hero p{margin:0;opacity:.9}
.duet-lbl{font-size:.78rem;font-weight:600;letter-spacing:.08em}
#app form.card input{width:100%;min-height:44px;box-sizing:border-box;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink);font:inherit}`;
document.head.appendChild(st);

window.vDuet=vDuet;window.duetCard=duetCard;
window.DUET={join,create,leave,state:D};
})();
