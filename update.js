/* ===================== TỰ PHÁT HIỆN BẢN MỚI & LÀM MỚI APP =====================
 Mỗi khi mở app, quay lại app, hoặc 10 phút một lần: tải lại index.html và các file .js của app (không dùng
 bộ nhớ đệm), so dấu vân tay với bản đang chạy. Có thay đổi → hiện thanh "Đã có bản mới" với nút Cập nhật.
 Cập nhật = nạp lại các file với cache:'reload' rồi tải lại trang, nên chắc chắn chạy bản mới nhất. */
(function(){
const files=()=>['index.html',...[...document.querySelectorAll('script[src]')].map(s=>s.getAttribute('src')).filter(s=>s&&!/^(https?:)?\/\//.test(s))];
async function hash(txt){try{const b=await crypto.subtle.digest('SHA-1',new TextEncoder().encode(txt));return [...new Uint8Array(b)].slice(0,6).map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){let h=0;for(let i=0;i<txt.length;i++)h=(h*31+txt.charCodeAt(i))|0;return (h>>>0).toString(16)}}
async function fingerprint(){const L=files();const parts=await Promise.all(L.map(f=>fetch(f+(f.includes('?')?'&':'?')+'_v='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.text():'').catch(()=>null)));
 if(parts.some(p=>p===null))return null;return hash(parts.join('\u0001'))}
/* dấu vân tay của chính trang ĐANG CHẠY (mã inline + danh sách file script) so với index.html trên mạng:
 bắt được trường hợp điện thoại mở app từ bộ nhớ đệm cũ (iPhone hay giữ index.html cũ nhiều ngày) */
const sig=doc=>[...doc.querySelectorAll('script')].map(x=>x.getAttribute('src')||x.textContent.trim()).join('\u0002');
async function staleIndex(){try{const t=await fetch('index.html?_v='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.text():null);if(!t)return false;
 const net=new DOMParser().parseFromString(t,'text/html');return (await hash(sig(net)))!==(await hash(sig(document)))}catch(e){return false}}
const U={base:null,latest:null,checking:false,last:0,shown:false};window.UPD=U;
async function check(manual){if(U.checking||!navigator.onLine)return;U.checking=true;try{const f=await fingerprint();U.last=Date.now();if(!f)return manual&&toast('Chưa kiểm tra được, thử lại khi có mạng');
 if(!U.base){U.base=f;try{localStorage.setItem('ss-ver',f)}catch(e){}if(await staleIndex()){U.latest=f;U.stale=true;banner();return}return manual&&toast('Bạn đang dùng bản mới nhất ✓')}
 if(f!==U.base){U.latest=f;banner()}else if(manual)toast('Bạn đang dùng bản mới nhất ✓')}finally{U.checking=false;if(manual)try{render()}catch(e){}}}
function busy(){try{return !!(S.game||document.querySelector('.lk-ov,.ch-ov,.saga-modal,.mic-ov,.inst-ov,.bdg-ov')||(document.activeElement&&/TEXTAREA|INPUT/.test(document.activeElement.tagName)&&document.activeElement.value))}catch(e){return false}}
function banner(){if(U.shown||document.getElementById('updbar'))return;U.shown=true;
 const st=document.createElement('style');st.textContent=`#updbar{position:fixed;left:50%;transform:translateX(-50%);top:calc(10px + env(safe-area-inset-top,0px));z-index:2147483647;width:min(440px,calc(100% - 20px));display:flex;align-items:center;gap:10px;padding:10px 10px 10px 14px;border-radius:16px;background:var(--card);color:var(--ink);border:1px solid var(--line);box-shadow:0 12px 30px rgba(0,0,0,.25);animation:updin .35s cubic-bezier(.2,1.2,.4,1)}
#updbar b{display:block;font-size:.92rem}#updbar small{color:var(--mut);font-size:.78rem}#updbar .ic{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--soft);color:var(--steel)}
#updbar button.go{flex:none;min-height:40px;padding:0 14px;border:0;border-radius:12px;background:var(--steel);color:var(--onsteel);font:inherit;font-weight:700}
#updbar button.x{flex:none;width:36px;height:36px;border:0;border-radius:50%;background:transparent;color:var(--mut);font-size:1.1rem}
@keyframes updin{from{transform:translate(-50%,-30px);opacity:0}}@media (prefers-reduced-motion:reduce){#updbar{animation:none}}`;document.head.appendChild(st);
 const b=document.createElement('div');b.id='updbar';b.setAttribute('role','status');
 b.innerHTML=`<span class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 4v5h-5"/></svg></span><span style="flex:1;min-width:0"><b>Đã có bản mới của app</b><small>Cập nhật để dùng tính năng mới nhất</small></span><button class="go" onclick="UPDX.apply()">Cập nhật</button><button class="x" aria-label="Để sau" onclick="this.parentNode.remove();UPD.shown=false;UPD.snooze=Date.now()">✕</button>`;
 document.body.appendChild(b)}
async function apply(){const g=document.querySelector('#updbar .go');if(g){g.disabled=true;g.textContent='Đang cập nhật…'}
 try{await Promise.all(files().concat(['manifest.webmanifest']).map(f=>fetch(f,{cache:'reload'}).catch(()=>{})))}catch(e){}
 try{const r=await navigator.serviceWorker?.getRegistration();r&&r.update()}catch(e){}
 try{sessionStorage.setItem('ss-updated','1')}catch(e){}
 /* thêm ?v= để iPhone không lấy lại index.html cũ trong bộ nhớ đệm */
 location.replace(location.pathname+'?v='+Date.now()+location.hash)}
// Sau khi cập nhật: báo nhẹ một câu, bỏ ?v= khỏi thanh địa chỉ
try{if(/[?&]v=\d/.test(location.search))history.replaceState(history.state,'',location.pathname+location.hash)}catch(e){}
try{if(sessionStorage.getItem('ss-updated')){sessionStorage.removeItem('ss-updated');setTimeout(()=>{try{toast('✓ Đã cập nhật lên bản mới nhất')}catch(e){}},1500)}}catch(e){}
setTimeout(()=>check(),4000);
setInterval(()=>{if(document.visibilityState==='visible'&&!(U.snooze&&Date.now()-U.snooze<30*60e3))check()},10*60e3);
let hiddenAt=0;
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){hiddenAt=Date.now();return}
 // quay lại app sau khi rời đi lâu và đã biết có bản mới, mà không đang làm dở gì → tự làm mới
 if(U.latest&&hiddenAt&&Date.now()-hiddenAt>15*60e3&&!busy())return apply();
 if(Date.now()-U.last>3*60e3)check()});
window.UPDX={stale:staleIndex,check:()=>check(true),apply,
 card:()=>`<button class="card login-nudge" style="margin-top:12px" onclick="UPD.latest?UPDX.apply():UPDX.check()"><span class="tile2-ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 4v5h-5"/></svg></span><span style="flex:1;text-align:left"><b>${U.latest?'Có bản mới · chạm để cập nhật':'Kiểm tra cập nhật'}</b><small>${U.checking?'Đang kiểm tra…':'Phiên bản '+(U.base||'…')+(U.last?' · kiểm tra lúc '+new Date(U.last).toLocaleTimeString('vi',{hour:'2-digit',minute:'2-digit'}):'')}</small></span><span class="chev">›</span></button>`};
})();
