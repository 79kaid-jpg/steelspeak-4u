/* ===================== GHI LỖI & TÌNH TRẠNG HỆ THỐNG =====================
 - Lỗi JS trên máy người dùng được gửi về bảng app_errors (cần supabase/system.sql; GitHub Action tự chạy).
 - Một màn hình lỗi không làm trắng cả app: hiện "Có lỗi" + nút thử lại.
 - Admin: Quản trị → "Tình trạng hệ thống" xem lỗi gần đây và bảng/hàm còn thiếu. */
(function(){
if(window._errJs)return;window._errJs=1;
const esc2=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ver=()=>(window.UPD&&UPD.base)||'?';
const tab=()=>{try{return (S.game?'game:':'')+S.tab}catch(e){return ''}};
const NOISE=/ResizeObserver|Script error\.?$|Load failed|NetworkError|Failed to fetch|AbortError|The operation was aborted|play\(\) request was interrupted|NotAllowedError/i;
const seen=new Set();let sent=0;
function report(msg,stack){msg=String(msg||'').slice(0,600);if(!msg||NOISE.test(msg))return;const k=msg+'|'+tab();if(seen.has(k)||sent>=20)return;seen.add(k);sent++;
 try{console.warn('[app_error]',msg)}catch(e){}
 try{if(typeof SB=='undefined')return;SB.from('app_errors').insert({ver:ver(),tab:tab().slice(0,40),msg,stack:String(stack||'').slice(0,2000),ua:navigator.userAgent.slice(0,300)}).then(()=>{},()=>{})}catch(e){}}
window.reportError=report;
addEventListener('error',e=>{if(e&&e.message)report(e.message,(e.error&&e.error.stack)||(e.filename+':'+e.lineno))});
addEventListener('unhandledrejection',e=>{const r=e&&e.reason;report(r&&r.message||String(r),r&&r.stack)});

/* màn hình lỗi thay vì trắng trang */
function guard(){if(typeof render!='function'||render._guard)return setTimeout(guard,300);const r0=render;
 const w=function(){try{return r0.apply(this,arguments)}catch(e){report('render '+tab()+': '+(e&&e.message),e&&e.stack);
  try{document.getElementById('app').innerHTML=`<div class="card" style="margin-top:24px;text-align:center;padding:24px"><div style="font-size:2rem" aria-hidden="true">🛠️</div><h2 style="margin:8px 0">Trang này đang gặp lỗi</h2><p class="mut" style="margin:0 0 14px">Lỗi đã được gửi cho Admin. Bạn thử lại hoặc về trang Học nhé.</p><div class="row" style="gap:8px;justify-content:center"><button class="btn" onclick="S.game=null;go('home')">Về trang Học</button><button class="btn ghost" onclick="location.reload()">Tải lại app</button></div></div>`}catch(_){} }};
 Object.assign(w,r0);w._guard=1;window.render=w}
guard();

/* phiên bản ở cuối trang Tài khoản */
function hookMe(){if(typeof vMe!='function')return setTimeout(hookMe,300);if(vMe._ver)return;const v0=vMe;
 const w=function(){const h=v0.apply(this,arguments);return h+`<p class="mut" style="text-align:center;font-size:.78rem;margin:18px 0 4px">SteelSpeak · phiên bản <span class="mono">${esc2(ver())}</span></p>`};Object.assign(w,v0);w._ver=1;window.vMe=w}
hookMe();

/* trang Tình trạng hệ thống (admin) */
const SY={err:null,health:null,need:false};
async function load(){const [a,b]=await Promise.all([SB.from('app_errors').select('*').order('id',{ascending:false}).limit(60),SB.rpc('sys_health')]);
 SY.need=!!(a.error&&/app_errors|does not exist|schema cache/i.test(a.error.message));SY.err=a.error?[]:(a.data||[]);SY.health=b.error?[]:(b.data||[]);if(S.tab=='sys')render()}
async function clear(){if(!confirm('Xóa toàn bộ lỗi đã ghi?'))return;await SB.from('app_errors').delete().gt('id',0);SY.err=null;load()}
function vSys(){if(!(typeof PROF!='undefined'&&PROF&&PROF.is_admin))return '<h1>Tình trạng hệ thống</h1><p class="mut">Chỉ admin.</p>';
 if(SY.err==null){load();return '<button class="link" onclick="go(\'admin\')">‹ Quản trị</button><h1>Tình trạng hệ thống</h1><p class="mut">Đang tải…</p>'}
 const miss=(SY.health||[]).filter(h=>!h.ok);const grp={};SY.err.forEach(e=>{const k=e.msg;(grp[k]=grp[k]||[]).push(e)});
 const G=Object.entries(grp).sort((x,y)=>y[1].length-x[1].length);
 return `<button class="link" onclick="go('admin')">‹ Quản trị</button><h1 style="margin-top:6px">Tình trạng hệ thống</h1>
 <p class="mut" style="margin:0">Phiên bản app: <b class="mono">${esc2(ver())}</b></p>
 ${SY.need?`<div class="note">Chưa có bảng ghi lỗi. GitHub Action <b>Run SQL</b> sẽ tự chạy <b>supabase/system.sql</b>; nếu chưa, chạy tay file đó trong SQL Editor.</div>`:''}
 <div class="sec-h"><h2>Database</h2><span class="mut">${SY.health.length?`${SY.health.length-miss.length}/${SY.health.length} đủ`:''}</span></div>
 ${SY.health.length?(miss.length?`<div class="card stack" style="gap:6px;padding:12px">${miss.map(h=>`<div class="row" style="justify-content:space-between;flex-wrap:nowrap"><span>✗ <b>${esc2(h.feature)}</b></span><span class="mono mut" style="font-size:.8rem">${esc2(h.object)}</span></div>`).join('')}<small class="mut">Chạy file SQL tương ứng (hoặc Actions → Run SQL → "all").</small></div>`:'<div class="card" style="padding:12px;color:var(--good)"><b>✓ Đủ tất cả bảng và hàm cần thiết</b></div>'):'<p class="mut">Chưa kiểm tra được (cần system.sql).</p>'}
 <div class="sec-h"><h2>Lỗi gần đây</h2>${SY.err.length?`<button class="link" onclick="SYSX.clear()">Xóa hết</button>`:''}</div>
 ${G.length?`<div class="stack">${G.map(([m,L])=>{const e=L[0];return `<details class="card" style="padding:10px 12px"><summary style="cursor:pointer;list-style:none"><div class="row" style="justify-content:space-between;flex-wrap:nowrap;gap:8px"><b style="font-size:.9rem;min-width:0;overflow:hidden;text-overflow:ellipsis">${esc2(m)}</b><span class="chip" style="flex:none">${L.length}×</span></div><small class="mut">Trang ${esc2(e.tab||'?')} · bản ${esc2(e.ver||'?')} · ${new Date(e.at).toLocaleString('vi-VN')}</small></summary><pre style="white-space:pre-wrap;font-size:.72rem;max-height:200px;overflow:auto;margin:8px 0 0">${esc2(e.stack||'')}\n${esc2(e.ua||'')}</pre></details>`}).join('')}</div>`:'<div class="card" style="padding:12px;color:var(--good)"><b>✓ Chưa ghi nhận lỗi nào</b></div>'}`}
window.vSys=vSys;window.SYSX={clear,reload:()=>{SY.err=null;render()}};
window.sysCard=()=>`<button class="card login-nudge" onclick="SYSX.reload();go('sys')"><span class="tile2-ic">🩺</span><span style="flex:1;text-align:left"><b>Tình trạng hệ thống</b><small>Lỗi trên máy học viên · bảng/hàm database còn thiếu</small></span><span class="chev">›</span></button>`;
})();
