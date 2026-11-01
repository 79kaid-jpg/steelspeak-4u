/* ===================== TRỢ LÝ BẬT MICRO =====================
 Nhận biết thiết bị/trình duyệt (iPhone, Android, máy tính, trình duyệt trong Zalo/Facebook…),
 kiểm tra quyền micro, đo âm lượng khi nói thử, và hướng dẫn từng bước theo đúng máy người dùng. */
(function(){
const ua=navigator.userAgent||'';
function env(){
 const ios=/iPhone|iPad|iPod/.test(ua)||(navigator.platform=='MacIntel'&&navigator.maxTouchPoints>1);
 const android=/Android/i.test(ua);
 const inapp=/Zalo/i.test(ua)?'Zalo':/FBAN|FBAV|FB_IAB/i.test(ua)?'Facebook':/Messenger/i.test(ua)?'Messenger':/Instagram/i.test(ua)?'Instagram':/Line\//i.test(ua)?'LINE':/TikTok|musical_ly|Bytedance/i.test(ua)?'TikTok':(android&&/; wv\)/.test(ua))?'ứng dụng':'';
 const browser=ios?(/CriOS/.test(ua)?'Chrome':/FxiOS/.test(ua)?'Firefox':/EdgiOS/.test(ua)?'Edge':'Safari'):/Edg\//.test(ua)?'Edge':/SamsungBrowser/.test(ua)?'Samsung Internet':/Firefox/.test(ua)?'Firefox':/Chrome/.test(ua)?'Chrome':/Safari/.test(ua)?'Safari':'trình duyệt';
 const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 return {ios,android,desktop:!ios&&!android,inapp,browser,standalone,secure:isSecureContext,api:!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)};}
async function perm(){try{const p=await navigator.permissions.query({name:'microphone'});return p.state}catch(e){return 'unknown'}}

function steps(e,err){
 if(e.inapp)return {t:`Bạn đang mở app bên trong ${e.inapp}`,s:[`${e.inapp} thường chặn micro. Hãy mở bằng ${e.ios?'Safari':'Chrome'}:`,`Chạm nút <b>•••</b> hoặc <b>⋮</b> ở góc trên`,`Chọn <b>Mở bằng trình duyệt</b> (Open in browser)`,`Hoặc chạm <b>Chép link</b> bên dưới rồi dán vào ${e.ios?'Safari':'Chrome'}`],copy:true};
 if(!e.secure)return {t:'Trang chưa dùng kết nối bảo mật',s:['Micro chỉ hoạt động trên địa chỉ bắt đầu bằng <b>https://</b>.','Hãy mở app bằng đường link chính thức.'],copy:true};
 if(err=='NotFoundError')return {t:'Không tìm thấy micro',s:['Kiểm tra tai nghe/micro đã cắm chắc chưa.','Máy tính: thử cắm tai nghe có micro, hoặc chọn đúng micro trong cài đặt âm thanh.','Rồi bấm <b>Kiểm tra lại</b>.']};
 if(err=='NotReadableError'||err=='AbortError')return {t:'Micro đang bị ứng dụng khác dùng',s:['Kết thúc cuộc gọi Zalo/Messenger/Teams đang mở.','Đóng các app ghi âm, quay video.','Rồi bấm <b>Kiểm tra lại</b>. Nếu vẫn lỗi, khởi động lại máy.']};
 if(e.ios&&e.browser=='Safari')return {t:'Bật micro cho Safari trên iPhone',s:[`Chạm <b>aA</b> (hoặc biểu tượng trang) ở thanh địa chỉ Safari`,`Chọn <b>Cài đặt trang web</b> → <b>Micrô</b> → <b>Cho phép</b>`,`Nếu không thấy: mở <b>Cài đặt</b> iPhone → <b>Safari</b> → <b>Micrô</b> → chọn <b>Hỏi</b> hoặc <b>Cho phép</b>`,`Quay lại app, <b>tải lại trang</b> rồi bấm Kiểm tra lại`,...(e.standalone?['App mở từ màn hình chính dùng cài đặt của Safari ở trên.']:[])]};
 if(e.ios)return {t:`Bật micro cho ${e.browser} trên iPhone`,s:[`Mở <b>Cài đặt</b> iPhone → kéo xuống chọn <b>${e.browser}</b>`,`Bật công tắc <b>Micrô</b>`,`Quay lại app, tải lại trang rồi bấm Kiểm tra lại`,`Mẹo: dùng <b>Safari</b> thường ổn định nhất trên iPhone`]};
 if(e.android)return {t:`Bật micro cho ${e.browser} trên Android`,s:[`Chạm biểu tượng <b>ổ khóa / ⚙</b> bên trái thanh địa chỉ`,`Chọn <b>Quyền</b> (Permissions) → <b>Micrô</b> → <b>Cho phép</b>`,`Nếu vẫn bị chặn: <b>Cài đặt</b> điện thoại → <b>Ứng dụng</b> → <b>${e.browser}</b> → <b>Quyền</b> → <b>Micrô</b> → Cho phép`,`Quay lại app, tải lại trang rồi bấm Kiểm tra lại`]};
 return {t:`Bật micro cho ${e.browser} trên máy tính`,s:[`Bấm biểu tượng <b>ổ khóa</b> bên trái thanh địa chỉ`,`Tìm <b>Micrô</b> → chọn <b>Cho phép</b>, rồi tải lại trang`,`Windows: <b>Settings</b> → <b>Privacy &amp; security</b> → <b>Microphone</b> → bật cho trình duyệt`,`macOS: <b>Cài đặt hệ thống</b> → <b>Quyền riêng tư</b> → <b>Micrô</b> → bật cho trình duyệt`]};}

let ST={stream:null,ctx:null,raf:0,peak:0};
function stop(){try{cancelAnimationFrame(ST.raf)}catch(e){}try{ST.stream&&ST.stream.getTracks().forEach(t=>t.stop())}catch(e){}try{ST.ctx&&ST.ctx.close()}catch(e){}ST={stream:null,ctx:null,raf:0,peak:0}}
function close(){stop();document.querySelectorAll('.mic-ov').forEach(x=>x.remove())}
function sheet(inner){document.querySelectorAll('.mic-ov').forEach(x=>x.remove());const ov=document.createElement('div');ov.className='mic-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Kiểm tra micro');
 ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(8,14,20,.62);display:flex;align-items:flex-end;justify-content:center;padding:10px;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))';
 ov.innerHTML=`<div class="card stack" id="micbox" style="width:min(460px,100%);max-height:calc(100dvh - 20px);overflow:auto;border-radius:20px;padding:16px;gap:10px">${inner}</div>`;
 ov.onclick=e=>{if(e.target===ov)close()};document.body.appendChild(ov);return ov}
const MICIC='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
function guideHTML(e,err){const g=steps(e,err);return `<div class="note" style="margin:0"><b>${g.t}</b></div><ol style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px;line-height:1.45">${g.s.map(x=>`<li>${x}</li>`).join('')}</ol>${g.copy?`<button class="btn ghost" onclick="navigator.clipboard&&navigator.clipboard.writeText(location.href.split('#')[0]).then(()=>toast('Đã chép link'))">Chép link app</button>`:''}`}
async function open(reason){const e=env(),p=await perm();
 const head=`<div class="row" style="justify-content:space-between;flex-wrap:nowrap"><div class="row" style="gap:8px;flex-wrap:nowrap"><span style="width:40px;height:40px;border-radius:12px;background:var(--soft);color:var(--steel);display:grid;place-items:center">${MICIC}</span><h2 style="margin:0">Kiểm tra micro</h2></div><button class="chip" onclick="MIC.close()" aria-label="Đóng">✕</button></div>
 <div class="mut" style="font-size:.82rem">Máy của bạn: ${e.ios?'iPhone/iPad':e.android?'Android':'Máy tính'} · ${e.inapp?'trong '+e.inapp:e.browser}${p!='unknown'?' · quyền micro: <b>'+({granted:'đã cho phép',denied:'đang bị chặn',prompt:'chưa hỏi'}[p]||p)+'</b>':''}</div>`;
 if(e.inapp||!e.secure||!e.api){sheet(head+guideHTML(e)+`<button class="btn ghost" onclick="MIC.close()">Đóng</button>`);return}
 if(p=='denied'){sheet(head+guideHTML(e,'NotAllowedError')+`<button class="btn" onclick="MIC.test()">Kiểm tra lại</button>`);return}
 sheet(head+`<p style="margin:0">${reason||'Bấm nút bên dưới. Khi máy hỏi quyền dùng micro, chọn <b>Cho phép</b>.'}</p><div id="micbody"></div><button class="btn" id="mictest" onclick="MIC.test()">${MICIC.replace('26','20').replace('26','20')} Bắt đầu kiểm tra</button>`)}
async function test(){const e=env();stop();const body=document.getElementById('micbody')||document.getElementById('micbox');const btn=document.getElementById('mictest');if(btn)btn.disabled=true;
 if(body)body.innerHTML='<p class="mut" style="margin:0">Đang xin quyền micro… nếu máy hỏi, chọn <b>Cho phép</b>.</p>';
 try{ST.stream=await navigator.mediaDevices.getUserMedia({audio:true})}catch(err){
  if(btn)btn.remove();const box=document.getElementById('micbox');
  box.innerHTML=box.innerHTML.split('<div id="micbody">')[0]+`<div class="note" style="margin:0;border-color:var(--bad)">Chưa dùng được micro (${esc(err.name||'lỗi')}).</div>`+guideHTML(e,err.name)+`<button class="btn" onclick="MIC.test()">Kiểm tra lại</button>`;return}
 const A=window.AudioContext||window.webkitAudioContext;let meter='';
 if(body)body.innerHTML=`<div class="note" style="margin:0;border-color:var(--good)"><b>✓ Micro đã được cho phép.</b></div><p style="margin:0">Giờ hãy nói thử: <b>“Hello, I am learning English”</b></p>
 <div style="height:16px;border-radius:99px;background:var(--line);overflow:hidden" role="meter" aria-label="Âm lượng micro" aria-valuemin="0" aria-valuemax="100"><i id="miclv" style="display:block;height:100%;width:0;background:var(--good);transition:width .08s"></i></div><p class="mut" id="micst" style="margin:0;font-size:.86rem">Đang nghe…</p>`;
 if(btn){btn.disabled=false;btn.textContent='Xong';btn.onclick=close}
 try{ST.ctx=new A();const src=ST.ctx.createMediaStreamSource(ST.stream),an=ST.ctx.createAnalyser();an.fftSize=512;src.connect(an);const d=new Uint8Array(an.fftSize);let heard=0;const t0=Date.now();
  const tick=()=>{an.getByteTimeDomainData(d);let m=0;for(const v of d)m=Math.max(m,Math.abs(v-128));const lv=Math.min(100,Math.round(m/128*260));ST.peak=Math.max(ST.peak,lv);
   const el=document.getElementById('miclv'),st=document.getElementById('micst');if(!el){stop();return}el.style.width=lv+'%';
   if(lv>18)heard++;if(heard>12&&st&&!st.dataset.ok){st.dataset.ok=1;st.innerHTML='<b style="color:var(--good)">🎉 Micro hoạt động tốt!</b> Bạn có thể luyện phát âm rồi.';try{localStorage.setItem('ss-mic-ok','1')}catch(e){}}
   else if(!st.dataset.ok&&Date.now()-t0>6000)st.innerHTML='Chưa nghe rõ. Nói to hơn, để điện thoại gần miệng, kiểm tra không bật chế độ <b>im lặng/tắt tiếng micro</b> trên tai nghe.';
   ST.raf=requestAnimationFrame(tick)};tick()}catch(e){const st=document.getElementById('micst');if(st)st.textContent='Micro đã được cho phép.'}}
window.MIC={open,test,close,env};

/* ---------- móc vào phần luyện phát âm ---------- */
const help=`<button class="link" style="display:block;margin:6px auto 0;min-height:36px" onclick="MIC.open()">Không ghi âm được? Xem hướng dẫn bật micro</button>`;
function hook(){
 // lỗi trong recListen / listen: gắn nút hướng dẫn ngay dưới dòng báo lỗi
 const obs=new MutationObserver(()=>{const st=document.getElementById('mst');if(!st||st.dataset.mh)return;const tx=st.textContent||'';
  if(/micro|Micro|Micrô|micrô|cho dùng|không hỗ trợ|ghi âm/.test(tx)&&/Chưa|chưa|không|Không|Lỗi|lỗi/.test(tx)&&!/Đang/.test(tx)){st.dataset.mh=1;st.insertAdjacentHTML('afterend',help)}});
 obs.observe(document.body,{subtree:true,childList:true,characterData:true});
 // lần đầu chạm mic trong trình duyệt của Zalo/Facebook: hướng dẫn mở bằng trình duyệt
 const L=window.listen;if(typeof L=='function'&&!L._mic){const w=function(...a){const e=env();if(e.inapp&&!sessionStorage.getItem('ss-mic-inapp')){sessionStorage.setItem('ss-mic-inapp','1');open();return}return L.apply(this,a)};Object.assign(w,L);w._mic=1;window.listen=w}}
setTimeout(hook,0);setTimeout(hook,1500);
})();
