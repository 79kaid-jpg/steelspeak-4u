/* ===================== ĐƯA APP RA MÀN HÌNH CHÍNH =====================
 Android/máy tính (Chrome, Edge, Samsung): dùng nút cài đặt có sẵn của trình duyệt.
 iPhone/iPad: hướng dẫn Chia sẻ → Thêm vào MH chính (Safari không có nút cài tự động).
 Đang mở trong Zalo/Facebook: hướng dẫn mở bằng trình duyệt trước. */
(function(){
try{if('serviceWorker' in navigator&&isSecureContext)navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){}
let deferred=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;try{render()}catch(_){}});
addEventListener('appinstalled',()=>{deferred=null;try{localStorage.setItem('ss-installed','1');toast('Đã thêm SteelSpeak vào màn hình chính 🎉');render()}catch(_){}});
const ua=navigator.userAgent||'';
const ios=/iPhone|iPad|iPod/.test(ua)||(navigator.platform=='MacIntel'&&navigator.maxTouchPoints>1);
const android=/Android/i.test(ua);
const inapp=/Zalo/i.test(ua)?'Zalo':/FBAN|FBAV|FB_IAB/i.test(ua)?'Facebook':/Messenger/i.test(ua)?'Messenger':/Instagram/i.test(ua)?'Instagram':/Line\//i.test(ua)?'LINE':/TikTok|musical_ly/i.test(ua)?'TikTok':'';
const iosBrowser=/CriOS/.test(ua)?'Chrome':/FxiOS/.test(ua)?'Firefox':/EdgiOS/.test(ua)?'Edge':'Safari';
const installed=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

const SHARE='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1c7ed6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="biểu tượng Chia sẻ" role="img" style="vertical-align:-4px"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/></svg>';
const PLUSBOX='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="vertical-align:-4px"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
const DOTS='<b style="letter-spacing:1px">⋮</b>';
const PHONE='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/><path d="M12 7v6M9 10h6"/></svg>';

function steps(){
 if(inapp)return {t:`Bạn đang mở app bên trong ${inapp}`,s:[`Chạm <b>•••</b> hoặc ${DOTS} ở góc trên`,`Chọn <b>Mở bằng trình duyệt</b> (${ios?'Safari':'Chrome'})`,`Trong ${ios?'Safari':'Chrome'}, mở lại mục này để thêm app ra màn hình chính`],copy:true};
 if(ios&&iosBrowser!='Safari'&&iosBrowser!='Chrome'&&iosBrowser!='Edge')return {t:'Hãy dùng Safari',s:['Chép link bên dưới, mở bằng <b>Safari</b>','Rồi làm theo hướng dẫn thêm vào màn hình chính'],copy:true};
 if(ios)return {t:`Thêm vào màn hình chính trên iPhone (${iosBrowser})`,s:[
   iosBrowser=='Safari'?`Chạm nút <b>Chia sẻ</b> ${SHARE} ở thanh dưới cùng (iPhone) hoặc góc trên (iPad). Nếu không thấy thanh, chạm vào thanh địa chỉ trước.`:`Chạm nút <b>Chia sẻ</b> ${SHARE} ở thanh địa chỉ`,
   `Kéo danh sách lên, chọn <b>Thêm vào MH chính</b> ${PLUSBOX} (Add to Home Screen)`,
   `Giữ tên <b>SteelSpeak</b>, bật <b>Mở dưới dạng ứng dụng web</b> nếu có, rồi chạm <b>Thêm</b>`,
   `Biểu tượng SteelSpeak xuất hiện trên màn hình chính. Từ nay mở app bằng biểu tượng này`]};
 if(android)return {t:'Thêm vào màn hình chính trên Android',s:[`Chạm ${DOTS} ở góc trên bên phải của Chrome`,`Chọn <b>Cài đặt ứng dụng</b> hoặc <b>Thêm vào màn hình chính</b>`,`Chạm <b>Cài đặt</b> / <b>Thêm</b> để xác nhận`,`Mở app bằng biểu tượng SteelSpeak trên màn hình chính`]};
 return {t:'Cài app trên máy tính',s:[`Chrome/Edge: bấm biểu tượng <b>cài đặt</b> ${PLUSBOX} ở cuối thanh địa chỉ`,`Hoặc menu ${DOTS} → <b>Lưu và chia sẻ</b> → <b>Cài đặt trang dưới dạng ứng dụng</b>`,`Bấm <b>Cài đặt</b>`]};}

function sheet(){document.querySelectorAll('.inst-ov').forEach(x=>x.remove());const ov=document.createElement('div');ov.className='inst-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Thêm app ra màn hình chính');
 ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(8,14,20,.62);display:flex;align-items:flex-end;justify-content:center;padding:10px;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))';
 const g=steps();
 ov.innerHTML=`<div class="card stack" style="width:min(460px,100%);max-height:calc(100dvh - 20px);overflow:auto;border-radius:20px;padding:16px;gap:10px">
 <div class="row" style="justify-content:space-between;flex-wrap:nowrap"><div class="row" style="gap:10px;flex-wrap:nowrap"><img src="icon-180.png" alt="" width="44" height="44" style="border-radius:11px"><div><h2 style="margin:0">Mở app nhanh hơn</h2><small class="mut">Thêm SteelSpeak ra màn hình chính</small></div></div><button class="chip" onclick="this.closest('.inst-ov').remove()" aria-label="Đóng">✕</button></div>
 ${installed()?`<div class="note" style="margin:0;border-color:var(--good)"><b>✓ Bạn đang dùng app từ màn hình chính.</b></div>`:`
 <p class="mut" style="margin:0;font-size:.88rem">Mở bằng một chạm như app thật, toàn màn hình, nhớ đăng nhập và micro ổn định hơn.</p>
 ${deferred?`<button class="btn" onclick="INST.prompt()">${PHONE} Thêm vào màn hình chính</button><p class="mut" style="margin:0;font-size:.8rem;text-align:center">Hoặc làm thủ công:</p>`:''}
 <div class="note" style="margin:0"><b>${g.t}</b></div>
 <ol style="margin:0;padding-left:22px;display:flex;flex-direction:column;gap:8px;line-height:1.5">${g.s.map(x=>`<li>${x}</li>`).join('')}</ol>
 ${ios&&!inapp?`<div class="row" style="gap:8px;justify-content:center;padding:10px;border-radius:12px;background:var(--soft);font-size:.86rem;flex-wrap:nowrap">${SHARE}<span>→</span><b>Thêm vào MH chính</b>${PLUSBOX}<span>→</span><b>Thêm</b></div>`:''}
 ${g.copy?`<button class="btn ghost" onclick="navigator.clipboard&&navigator.clipboard.writeText(location.origin+location.pathname).then(()=>toast('Đã chép link'))">Chép link app</button>`:''}`}
 <button class="btn ghost" onclick="this.closest('.inst-ov').remove()">Để sau</button></div>`;
 ov.onclick=e=>{if(e.target===ov)ov.remove()};document.body.appendChild(ov)}
async function prompt(){if(!deferred)return sheet();deferred.prompt();const r=await deferred.userChoice.catch(()=>({}));deferred=null;document.querySelectorAll('.inst-ov').forEach(x=>x.remove());if(r&&r.outcome=='accepted')ls.set('ss-installed','1');try{render()}catch(e){}}

/* thẻ gợi ý: Tài khoản luôn có; trang Học hiện nhẹ nhàng từ lần mở thứ 2, ẩn khi đã cài hoặc bấm Ẩn */
function meCard(){if(installed())return '';return `<button class="card login-nudge" style="margin-top:12px" onclick="INST.open()"><span class="tile2-ic">${PHONE}</span><span style="flex:1;text-align:left"><b>Thêm app ra màn hình chính</b><small>Mở SteelSpeak bằng một chạm như app thật</small></span><span class="chev">›</span></button>`}
function homeTip(){if(installed()||ls.get('ss-inst-hide')||ls.get('ss-installed'))return '';if((+ls.get('ss-visits')||0)<2)return '';
 return `<div class="card row" style="margin-top:12px;flex-wrap:nowrap;gap:10px;padding:10px 12px"><img src="icon-180.png" alt="" width="40" height="40" style="border-radius:10px;flex:none"><div style="flex:1;min-width:0"><b style="font-size:.92rem">Thêm SteelSpeak ra màn hình chính</b><div class="mut" style="font-size:.8rem">Mở nhanh bằng một chạm</div></div><button class="btn" style="flex:none;min-height:40px;padding:0 12px" onclick="INST.open()">Xem cách</button><button class="chip" aria-label="Ẩn gợi ý" onclick="localStorage.setItem('ss-inst-hide','1');render()">✕</button></div>`}
try{if(!sessionStorage.getItem('ss-v')){sessionStorage.setItem('ss-v','1');ls.set('ss-visits',String((+ls.get('ss-visits')||0)+1))}}catch(e){}
window.INST={open:sheet,prompt,meCard,homeTip,installed};
function hook(){const h=window.vHome;if(typeof h=='function'&&!h._inst){const w=function(...a){const s=h.apply(this,a);try{const b=homeTip();if(b){const i=s.indexOf('</div>',s.indexOf('class="topbar"'));if(i>0){const j=s.indexOf('</div>',i+6)+6;return s.slice(0,j)+b+s.slice(j)}}}catch(e){}return s};Object.assign(w,h);w._inst=1;window.vHome=w}}
setTimeout(hook,0);setTimeout(hook,1700);
})();
