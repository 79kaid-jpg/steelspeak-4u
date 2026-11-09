/* ===================== VÒNG QUAY MAY MẮN THEO MÙA =====================
 Học viên: nhận lượt khi học (xong bài, chuỗi 7 ngày, thắng Kaka) → quay → quà do máy chủ chọn theo tỉ lệ.
 Admin: tạo vòng quay, chọn quà từ bộ ảnh theo mùa, đặt tỉ lệ %, số lượng, xem người trúng & đánh dấu đã trao.
 Máy chủ: supabase/lucky.sql */
(function(){
/* ---------- bộ ảnh quà (SVG, khung 64) ---------- */
const P={
candy:'<path d="M24 56V24a10 10 0 0 1 20 0v3" fill="none" stroke="#f1d2d2" stroke-width="12" stroke-linecap="round"/><path d="M24 56V24a10 10 0 0 1 20 0v3" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M24 56V24a10 10 0 0 1 20 0v3" fill="none" stroke="#e03131" stroke-width="9" stroke-dasharray="6 6"/>',
ginger:'<circle cx="32" cy="16" r="9" fill="#c47a3f"/><path d="M20 28h24l8 8-4 4-6-5v9l6 13-6 3-8-12-8 12-6-3 6-13v-9l-6 5-4-4z" fill="#c47a3f"/><circle cx="29" cy="15" r="1.6" fill="#3b2314"/><circle cx="35" cy="15" r="1.6" fill="#3b2314"/><path d="M28 19q4 3 8 0" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="32" cy="33" r="2" fill="#fff"/><circle cx="32" cy="40" r="2" fill="#2f9e44"/>',
cocoa:'<path d="M14 26h30v18a10 10 0 0 1-10 10h-10a10 10 0 0 1-10-10z" fill="#e03131"/><path d="M44 30h4a6 6 0 0 1 0 12h-4" fill="none" stroke="#e03131" stroke-width="4"/><path d="M14 27h30" stroke="#7a4419" stroke-width="5"/><path d="M22 20c0-4 4-4 4-8M32 20c0-4 4-4 4-8" stroke="#adb5bd" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="29" cy="41" r="4" fill="#fff"/>',
socks:'<path d="M24 16h16v24l7 5a7 7 0 0 1-4 13H31a9 9 0 0 1-9-9V16z" fill="#e03131"/><rect x="21" y="8" width="22" height="10" rx="3" fill="#fff" stroke="#ced4da" stroke-width="1.5"/><circle cx="34" cy="34" r="3" fill="#fab005"/>',
bauble:'<circle cx="32" cy="38" r="18" fill="#1c7ed6"/><rect x="27" y="14" width="10" height="7" rx="2" fill="#fab005"/><path d="M14 38h36" stroke="#fff" stroke-width="3" stroke-dasharray="2 4" stroke-linecap="round"/><circle cx="25" cy="31" r="4" fill="#fff" fill-opacity=".45"/>',
lixi:'<rect x="16" y="8" width="32" height="48" rx="5" fill="#e03131"/><path d="M16 20q16 12 32 0V13a5 5 0 0 0-5-5H21a5 5 0 0 0-5 5z" fill="#c92a2a"/><circle cx="32" cy="27" r="7" fill="#fcc419"/><path d="M29 27h6" stroke="#e03131" stroke-width="2"/>',
banhchung:'<rect x="12" y="12" width="40" height="40" rx="4" fill="#2b8a3e"/><rect x="16" y="16" width="32" height="32" rx="2" fill="#40c057"/><path d="M12 32h40M32 12v40" stroke="#f1d29a" stroke-width="3"/>',
mai:'<g fill="#fcc419"><circle cx="32" cy="18" r="9"/><circle cx="45" cy="28" r="9"/><circle cx="40" cy="44" r="9"/><circle cx="24" cy="44" r="9"/><circle cx="19" cy="28" r="9"/></g><circle cx="32" cy="32" r="6" fill="#e8590c"/>',
mut:'<rect x="10" y="24" width="44" height="28" rx="5" fill="#e03131"/><rect x="8" y="16" width="48" height="11" rx="4" fill="#c92a2a"/><circle cx="32" cy="38" r="8" fill="#fcc419"/><path d="M32 32v12M26 38h12" stroke="#e03131" stroke-width="2"/>',
cupcake:'<path d="M18 34h28l-4 20H22z" fill="#4dabf7"/><path d="M22 34l2 20M29 34l1 20M36 34l-1 20M42 34l-2 20" stroke="#1c7ed6" stroke-width="1.5"/><path d="M14 35a18 14 0 0 1 36 0z" fill="#f783ac"/><circle cx="32" cy="16" r="4" fill="#e03131"/><path d="M22 27h2M30 23h2M38 28h2" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>',
cake:'<path d="M12 32h40v18a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4z" fill="#f783ac"/><path d="M12 39q5 4 10 0t10 0 10 0 10 0" fill="none" stroke="#fff" stroke-width="3"/><rect x="29" y="18" width="6" height="14" rx="2" fill="#4dabf7"/><path d="M32 7c3 3 3 7 0 9-3-2-3-6 0-9z" fill="#fab005"/>',
milktea:'<path d="M18 20h28l-3 34H21z" fill="#e9c9a0"/><path d="M18 20h28" stroke="#495057" stroke-width="3" stroke-linecap="round"/><path d="M36 20l6-14" stroke="#e8590c" stroke-width="3" stroke-linecap="round"/><g fill="#3b2314"><circle cx="26" cy="47" r="2.6"/><circle cx="32" cy="49" r="2.6"/><circle cx="38" cy="46" r="2.6"/><circle cx="29" cy="42" r="2.6"/><circle cx="35" cy="41" r="2.6"/></g>',
balloon:'<ellipse cx="30" cy="26" rx="15" ry="18" fill="#e64980"/><path d="M27 44l3-3 3 3z" fill="#c2255c"/><path d="M30 46c-4 6 4 8 0 14" stroke="#868e96" stroke-width="1.5" fill="none"/><ellipse cx="24" cy="19" rx="4" ry="6" fill="#fff" fill-opacity=".4"/>',
xp200:'<circle cx="32" cy="32" r="24" fill="#fab005"/><circle cx="32" cy="32" r="18" fill="#ffd43b"/><path d="M34 18 24 34h8l-2 12 10-16h-8z" fill="#e8590c"/>',
frame:'<circle cx="32" cy="36" r="20" fill="#ede7ff"/><circle cx="32" cy="36" r="20" fill="none" stroke="#7048e8" stroke-width="5"/><circle cx="32" cy="32" r="6" fill="#7048e8"/><path d="M22 48a10 10 0 0 1 20 0" fill="#7048e8"/><path d="M22 10l5 5 5-8 5 8 5-5-2 9H24z" fill="#fab005"/>',
sticker:'<path d="M32 6l7.6 15.4 17 2.5-12.3 12 2.9 16.9L32 44.8l-15.2 8 2.9-16.9-12.3-12 17-2.5z" fill="#fab005" stroke="#e67700" stroke-width="2" stroke-linejoin="round"/><circle cx="27" cy="29" r="2" fill="#3b2314"/><circle cx="37" cy="29" r="2" fill="#3b2314"/><path d="M27 35q5 4 10 0" stroke="#3b2314" stroke-width="2" fill="none" stroke-linecap="round"/>',
notebook:'<rect x="16" y="8" width="34" height="48" rx="4" fill="#4263eb"/><rect x="16" y="8" width="8" height="48" rx="2" fill="#364fc7"/><rect x="29" y="16" width="16" height="8" rx="2" fill="#fff"/><path d="M44 8v14l-3-2-3 2V8" fill="#fab005"/>',
highlighter:'<path d="M10 54h26" stroke="#ffe066" stroke-width="7" stroke-linecap="round"/><g transform="rotate(35 32 30)"><rect x="25" y="4" width="14" height="32" rx="3" fill="#fab005"/><rect x="25" y="34" width="14" height="8" fill="#495057"/><path d="M27 42h10l-3 10h-4z" fill="#fcc419"/></g>',
bookmark:'<path d="M20 6h24v52L32 48 20 58z" fill="#12b886"/><circle cx="32" cy="22" r="6" fill="#fff"/>',
coffee:'<path d="M16 24h28v20a10 10 0 0 1-10 10h-8a10 10 0 0 1-10-10z" fill="#fff" stroke="#7a4419" stroke-width="3"/><path d="M44 28h3a6 6 0 0 1 0 12h-3" fill="none" stroke="#7a4419" stroke-width="3"/><path d="M18 31h24" stroke="#7a4419" stroke-width="6" stroke-opacity=".6"/><path d="M24 18c0-3 3-3 3-6M33 18c0-3 3-3 3-6" stroke="#adb5bd" stroke-width="3" fill="none" stroke-linecap="round"/>',
snack:'<path d="M18 10h28l-3 6 3 6v22l-3 6 3 6H18l3-6-3-6V22l3-6z" fill="#fab005"/><circle cx="32" cy="32" r="8" fill="#e8590c"/>',
none:'<g fill="#40c057"><circle cx="25" cy="25" r="9"/><circle cx="39" cy="25" r="9"/><circle cx="25" cy="39" r="9"/><circle cx="39" cy="39" r="9"/></g><path d="M32 34c2 10 6 16 10 20" stroke="#2b8a3e" stroke-width="3" fill="none" stroke-linecap="round"/>',
custom:'<rect x="10" y="26" width="44" height="28" rx="4" fill="#e64980"/><rect x="7" y="18" width="50" height="11" rx="3" fill="#f06595"/><path d="M32 18v36" stroke="#fcc419" stroke-width="6"/><path d="M32 18c-4-10-16-10-14-2 1 3 8 2 14 2 6 0 13 1 14-2 2-8-10-8-14 2z" fill="#fcc419"/>'};
const PACK=[
 ['xmas','Giáng sinh',[['candy','Kẹo gậy Noel',10000],['ginger','Bánh quy gừng',20000],['cocoa','Voucher ca cao',30000],['socks','Tất Noel',35000],['bauble','Quả châu',15000]]],
 ['tet','Tết Nguyên đán',[['lixi','Lì xì 20.000đ',20000],['banhchung','Bánh chưng mini',25000],['mai','Cành mai mini',40000],['mut','Hộp mứt Tết',45000]]],
 ['bday','Sinh nhật',[['cupcake','Cupcake',25000],['cake','Bánh sinh nhật mini',50000],['milktea','Voucher trà sữa',30000],['balloon','Bóng bay',5000]]],
 ['star','Ngôi sao học tập',[['xp200','+200 XP',0],['frame','Khung avatar vàng 7 ngày',0],['sticker','Bộ sticker',20000],['notebook','Sổ tay',30000],['highlighter','Bút highlight',15000],['bookmark','Bookmark',10000]]],
 ['daily','Hằng ngày',[['coffee','Voucher cà phê',25000],['snack','Gói snack',15000],['none','Chúc may mắn lần sau',0],['custom','Quà khác',0]]]];
const SEASON={xmas:{n:'Giáng sinh',a:'#c8102e',b:'#0f2a1f',c:['#c8102e','#fff4e6','#1f6f43','#fff4e6']},tet:{n:'Tết',a:'#d6336c',b:'#7a0e1c',c:['#e03131','#fff3bf','#f59f00','#fff3bf']},bday:{n:'Sinh nhật',a:'#d6336c',b:'#3b1d5e',c:['#e64980','#fff0f6','#7048e8','#fff0f6']},star:{n:'Ngôi sao học tập',a:'#1f4e79',b:'#14304d',c:['#1f4e79','#e7f5ff','#e39b1a','#e7f5ff']},daily:{n:'Hằng ngày',a:'#1a7d4d',b:'#123d2a',c:['#1a7d4d','#ebfbee','#1c7ed6','#ebfbee']}};
const gsvg=(k,s=40)=>`<svg width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true">${P[k]||P.custom}</svg>`;
const money=n=>(+n||0).toLocaleString('vi-VN')+'đ';
const on=()=>{try{return typeof USER!='undefined'&&USER&&typeof SB!='undefined'}catch(e){return false}};
const rr=()=>{try{render()}catch(e){}};
const adm=()=>{try{return !!PROF?.is_admin}catch(e){return false}};
const needSql=e=>/lucky|function|does not exist/i.test(e?.message||'');

/* ---------- dữ liệu học viên ---------- */
const LK={camp:undefined,prizes:[],tickets:0,mine:null,rot:0,spinning:false,res:null,off:false,uid:null};window.LK=LK;
async function load(){if(!on())return;const {data:c,error}=await SB.rpc('lucky_current');if(error){if(needSql(error))LK.off=true;LK.camp=null;return rr()}
 LK.camp=c&&c.id?c:null;if(!LK.camp){LK.prizes=[];LK.tickets=0;return rr()}
 const [{data:p},{data:w}]=await Promise.all([SB.from('lucky_prizes').select('*').eq('campaign_id',c.id).order('sort').order('id'),SB.from('lucky_wallet').select('tickets').eq('campaign_id',c.id).eq('user_id',USER.id).maybeSingle()]);
 LK.prizes=(p||[]).filter(x=>+x.rate>0);LK.tickets=w?.tickets||0;rr()}
async function loadMine(){const {data}=await SB.from('lucky_spins').select('*').eq('user_id',USER.id).order('id',{ascending:false}).limit(40);LK.mine=data||[];rr()}
async function grant(why){if(!on()||LK.off||!LK.camp)return;const {data,error}=await SB.rpc('lucky_grant',{why});if(error){if(needSql(error))LK.off=true;return}
 if(data>0){LK.tickets+=data;try{toast('🎡 +'+data+' lượt quay '+LK.camp.name)}catch(e){}rr()}}

/* ---------- vòng quay ---------- */
function wheel(){hcCss();const L=LK.prizes,n=L.length||1,seg=360/n,S2=SEASON[LK.camp.season]||SEASON.xmas;
 const stops=L.map((p,i)=>`${S2.c[i%4]} ${i*seg}deg ${(i+1)*seg}deg`).join(',');
 const icons=L.map((p,i)=>`<span class="lk-ico" data-i="${i}" style="transform:rotate(${i*seg+seg/2}deg) translateY(-100px)">${gsvg(p.gift,30)}</span>`).join('');
 /* vạch chia + chốt (peg) ở mỗi ranh giới ô, kim gõ vào chốt khi quay */
 const lines=L.map((p,i)=>`<line x1="150" y1="150" x2="150" y2="4" stroke="rgba(255,255,255,.55)" stroke-width="2" transform="rotate(${i*seg} 150 150)"/><circle cx="150" cy="9" r="4.5" fill="#fff6d5" stroke="#9a6b00" stroke-width="1.5" transform="rotate(${i*seg} 150 150)"/>`).join('');
 const bulbs=Array.from({length:20},(_,k)=>`<i style="transform:rotate(${k*18}deg) translateY(-161px)"></i>`).join('');
 return `<div class="lk-wrap" style="position:relative;width:300px;height:330px;margin:4px auto 0">
 <div class="lk-rim" style="background:${S2.b}">${bulbs}</div>
 <div id="lkw" style="position:absolute;left:0;top:24px;width:300px;height:300px;border-radius:50%;background:conic-gradient(${stops});transform:rotate(${LK.rot}deg);touch-action:none;cursor:grab;will-change:transform" role="slider" aria-label="Vuốt vòng quay để quay" tabindex="0">
  <svg width="300" height="300" viewBox="0 0 300 300" aria-hidden="true" style="position:absolute;inset:0">${lines}<circle cx="150" cy="150" r="146" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="3"/></svg>
  <div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 50% 50%,transparent 55%,rgba(0,0,0,.12) 100%)"></div>${icons}</div>
 <div style="position:absolute;left:0;top:24px;width:300px;height:300px;border-radius:50%;pointer-events:none;background:linear-gradient(160deg,rgba(255,255,255,.28),transparent 45%)"></div>
 <svg id="lkptr" width="36" height="46" viewBox="0 0 36 46" aria-hidden="true" style="position:absolute;left:132px;top:2px;z-index:3;transform-origin:18px 10px;transition:transform .14s cubic-bezier(.3,1.6,.5,1);filter:drop-shadow(0 3px 3px rgba(0,0,0,.35))"><circle cx="18" cy="10" r="9" fill="#f2c14e" stroke="#7d5a05" stroke-width="2"/><path d="M10 12h16L18 44z" fill="#f2c14e" stroke="#7d5a05" stroke-width="2" stroke-linejoin="round"/><circle cx="18" cy="10" r="3.5" fill="#7d5a05"/></svg>
 <div style="position:absolute;left:116px;top:140px;width:68px;height:68px;border-radius:50%;background:${S2.b};border:4px solid #f2c14e;box-sizing:border-box;display:grid;place-items:center;box-shadow:0 4px 10px rgba(0,0,0,.35),inset 0 2px 4px rgba(255,255,255,.3)">${gsvg('custom',34)}</div></div>`}
/* ---- vật lý vòng quay: tăng tốc → quay đều chờ máy chủ → giảm tốc mượt tới đúng ô, kim gõ chốt có tiếng ---- */
let _lac=null;function click(v){try{_lac=_lac||new (window.AudioContext||window.webkitAudioContext)();const ac=_lac;if(ac.state=='suspended')ac.resume();
 const len=Math.floor(ac.sampleRate*.018),b=ac.createBuffer(1,len,ac.sampleRate),d=b.getChannelData(0);for(let k=0;k<len;k++)d[k]=(Math.random()*2-1)*Math.pow(1-k/len,3);
 const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;f.type='bandpass';f.frequency.value=2400;f.Q.value=1.2;g.gain.value=Math.min(.55,.18+v*.35);s.connect(f).connect(g).connect(ac.destination);s.start()}catch(e){}}
let ptrT=0;function kick(v){const p=document.getElementById('lkptr');if(!p)return;p.style.transition='none';p.style.transform=`rotate(${-Math.min(28,8+v*22)}deg)`;void p.getBoundingClientRect();
 clearTimeout(ptrT);ptrT=setTimeout(()=>{p.style.transition='transform .14s cubic-bezier(.3,1.6,.5,1)';p.style.transform='rotate(0)'},Math.max(25,60-v*30));click(v);
 if(v<.25)try{navigator.vibrate&&navigator.vibrate(4)}catch(e){}}
let lastPeg=null;function pegs(){const seg=360/(LK.prizes.length||1);const k=Math.floor((LK.rot)/seg);return k}
function draw(v){const w=document.getElementById('lkw');if(w)w.style.transform=`rotate(${LK.rot}deg)`;const k=pegs();if(lastPeg===null)lastPeg=k;if(k!==lastPeg){lastPeg=k;kick(Math.abs(v||0))}}
async function spin(vel){if(LK.spinning||LK.tickets<=0)return;LK.spinning=true;LK.res=null;
 const rm=matchMedia('(prefers-reduced-motion:reduce)').matches,dir=vel<0?-1:1,VMAX=1.15;// độ/ms
 const btn=document.querySelector('[onclick="LKX.spin()"]');if(btn){btn.disabled=true;btn.textContent='ĐANG QUAY…'}
 document.querySelector('.lk-wrap')?.classList.add('lk-run');document.querySelectorAll('.lk-ico.win').forEach(x=>x.classList.remove('win'));
 let v=Math.min(VMAX,Math.max(.25,Math.abs(vel||.3))),data=null,err=null,phase='up',t0=performance.now(),last=t0,dec=null;lastPeg=pegs();
 SB.rpc('lucky_spin').then(r=>{if(r.error)err=r.error;else data=r.data}).catch(e=>err=e);
 await new Promise(done=>{const frame=now=>{const dt=Math.min(48,now-last);last=now;
  if(err){done();return}
  if(phase=='up'){v=Math.min(VMAX,v+dt*.0035);LK.rot+=dir*v*dt;if(v>=VMAX&&now-t0>700)phase='cruise'}
  else if(phase=='cruise'){LK.rot+=dir*v*dt;if(data&&now-t0>1100){
    /* giảm tốc kiểu ease-out bậc 3: vận tốc đầu = 3D/T → nối liền mạch với vận tốc hiện tại */
    const n=LK.prizes.length,seg=360/n,i=Math.max(0,LK.prizes.findIndex(p=>p.id==data.prize_id));
    const target=(360-(i*seg+seg/2)+(Math.random()-.5)*seg*.7+3600)%360,cur=((LK.rot%360)+360)%360;
    const want=v*(rm?900:6200)/3;const off=dir>0?(target-cur+360)%360:(cur-target+360)%360;const D=Math.max(1,Math.round((want-off)/360))*360+off;
    dec={from:LK.rot,D,T:3*D/v,s:now,i};phase='down'}}
  else if(phase=='down'){const t=Math.min(1,(now-dec.s)/dec.T),e=1-Math.pow(1-t,3);LK.rot=dec.from+dir*dec.D*e;v=3*dec.D/dec.T*Math.pow(1-t,2);
   if(t>=1){phase='settle';dec.s2=now}}
  else if(phase=='settle'){/* nảy nhẹ ngược lại khi kim tì vào chốt rồi đứng hẳn */const t=(now-dec.s2)/420;LK.rot=dec.from+dir*(dec.D-Math.sin(Math.min(1,t)*Math.PI)*1.6);if(t>=1){LK.rot=dec.from+dir*dec.D;draw(0);done();return}}
  draw(v);requestAnimationFrame(frame)};requestAnimationFrame(frame)});
 document.querySelector('.lk-wrap')?.classList.remove('lk-run');
 if(err){LK.spinning=false;toast(err.message||String(err));return load()}
 LK.tickets=data.tickets??Math.max(0,LK.tickets-1);
 document.querySelector(`.lk-ico[data-i="${dec?dec.i:0}"]`)?.classList.add('win');
 try{navigator.vibrate&&navigator.vibrate(data.code?[60,40,140]:30)}catch(e){}
 LK.quietUntil=Date.now()+1200+2500;
 setTimeout(()=>{LK.spinning=false;LK.res=data;LK.mine=null;if(data.gift=='xp200'){try{S.xp=(S.xp||0)+200;save()}catch(e){}}rr();resultSheet(data)},1200)}
/* Vuốt vòng quay: bánh xe đi theo ngón tay, thả ra đủ mạnh thì quay thật */
(function(){let drag=null;
 const ang=(e,c)=>Math.atan2(e.clientY-c.y,e.clientX-c.x)*180/Math.PI;
 document.addEventListener('pointerdown',e=>{const w=e.target.closest&&e.target.closest('#lkw');if(!w||LK.spinning)return;
  if(LK.tickets<=0){toast('Hết lượt quay · học thêm để nhận lượt');return}
  const r=w.getBoundingClientRect(),c={x:r.left+r.width/2,y:r.top+r.height/2};drag={w,c,a:ang(e,c),base:LK.rot,hist:[{t:performance.now(),r:LK.rot}]};
  w.style.transition='none';w.style.cursor='grabbing';try{w.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()});
 document.addEventListener('pointermove',e=>{if(!drag)return;let d=ang(e,drag.c)-drag.a;if(d>180)d-=360;if(d<-180)d+=360;drag.a+=d;LK.rot+=d;
  draw(Math.abs(d)/16);const now=performance.now();drag.hist.push({t:now,r:LK.rot});while(drag.hist.length>2&&now-drag.hist[0].t>120)drag.hist.shift()});
 const up=()=>{if(!drag)return;const h=drag.hist,a=h[0],b=h[h.length-1],dt=Math.max(16,b.t-a.t),v=(b.r-a.r)/dt;// độ/ms
  const w=drag.w,drag0=drag.base;w.style.cursor='grab';drag=null;
  if(Math.abs(v)>=.35&&Math.abs(b.r-a.r)>12)spin(v);
  else if(Math.abs(b.r-drag0)>12)toast('Vuốt mạnh tay hơn để quay nhé')};
 document.addEventListener('pointerup',up);document.addEventListener('pointercancel',up);
 document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&document.activeElement&&document.activeElement.id==='lkw'){e.preventDefault();spin(1.2)}})})();
function resultSheet(d){document.querySelectorAll('.lk-ov').forEach(x=>x.remove());const none=d.gift=='none';const ov=document.createElement('div');ov.className='lk-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
 ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(8,14,20,.66);display:flex;align-items:center;justify-content:center;padding:20px';
 ov.innerHTML=`<div class="card stack" style="width:min(380px,100%);text-align:center;align-items:center;gap:8px;padding:24px 20px 18px;border-radius:22px">
 <div class="lbl" style="color:var(--warn)">${none?'Lần này chưa trúng':'Chúc mừng bạn!'}</div>
 <div style="width:132px;height:132px;border-radius:50%;background:var(--soft);display:grid;place-items:center">${gsvg(d.gift,96)}</div>
 <h2 style="margin:4px 0 0;font-size:1.8rem">${esc(d.name)}</h2>
 <p class="mut" style="margin:0">${none?'Học thêm một bài để có lượt quay mới nhé.':d.gift=='xp200'?'Đã cộng 200 XP vào tài khoản của bạn.':d.code?'Admin đã được báo và sẽ nhắn tin hẹn trao quà'+(d.pickup?' · '+esc(d.pickup):'')+'.':'Quà đã được lưu.'}</p>
 ${d.code?`<div style="width:100%;box-sizing:border-box;border:1.5px dashed var(--bad);border-radius:14px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center"><span class="mut" style="font-size:.8rem;text-align:left">Mã nhận quà<br><b class="mono" style="font-size:1.1rem;color:var(--bad);letter-spacing:.06em">${esc(d.code)}</b></span><button class="chip" onclick="navigator.clipboard&&navigator.clipboard.writeText('${esc(d.code)}');toast('Đã chép mã')">Sao chép</button></div>`:''}
 <div class="stack" style="width:100%;margin-top:6px">${LK.tickets>0?`<button class="btn" onclick="this.closest('.lk-ov').remove();LKX.spin()">Quay tiếp · còn ${LK.tickets} lượt</button>`:''}<button class="btn ghost" onclick="this.closest('.lk-ov').remove()">Đóng</button></div></div>`;
 ov.onclick=e=>{if(e.target===ov)ov.remove()};document.body.appendChild(ov)}

function vLucky(){if(!on())return '<h1>Vòng quay may mắn</h1><p class="mut">Đăng nhập để tham gia.</p>';
 if(LK.camp===undefined){load();return '<h1>Vòng quay may mắn</h1><p class="mut">Đang tải…</p>'}
 const back=`<button class="link" onclick="go('home')">‹ Trang Học</button>`;
 if(!LK.camp)return back+`<h1 style="margin-top:6px">Vòng quay may mắn</h1><div class="card" style="margin-top:12px"><p class="mut" style="margin:0">Hiện chưa có vòng quay nào. Admin sẽ mở vào các dịp lễ, sinh nhật hay thử thách học tập.</p></div>${mineList()}`;
 const c=LK.camp,S2=SEASON[c.season]||SEASON.xmas,e=c.earn||{};
 const earn=[['lesson','Xong 1 bài học'],['streak7','Chuỗi 7 ngày học'],['kaka','Thắng Kaka']].filter(([k])=>+e[k]>0);
 return back+`<div style="border-radius:18px;padding:16px;color:#fff;background:${S2.b};display:flex;gap:12px;align-items:center;margin-top:8px">
 <div style="flex:1;min-width:0"><div class="lbl" style="color:#f2c14e">Đến hết ${new Date(c.ends_on).toLocaleDateString('vi-VN')}</div><h1 style="margin:2px 0;font-size:1.7rem;color:#fff">${esc(c.name)}</h1><small style="color:#e6eef0">Tối đa ${c.daily_max} lượt mỗi ngày</small></div>
 <div style="flex:none;width:72px;height:72px;border-radius:16px;background:${S2.a};display:flex;flex-direction:column;align-items:center;justify-content:center"><b style="font-family:var(--fd);font-size:1.9rem;line-height:1">${LK.tickets}</b><small style="font-size:.7rem">lượt quay</small></div></div>
 ${earn.length?`<div style="display:grid;grid-template-columns:repeat(${earn.length},minmax(0,1fr));gap:8px;margin-top:10px">${earn.map(([k,n])=>`<div class="card" style="padding:8px"><b style="color:var(--good);font-size:.86rem">+${e[k]} lượt</b><div class="mut" style="font-size:.76rem;line-height:1.3">${n}</div></div>`).join('')}</div>`:''}
 ${LK.prizes.length?wheel():'<p class="note">Vòng quay chưa có quà.</p>'}
 <button class="btn" style="width:100%;min-height:54px;margin-top:12px;background:${S2.a};font-family:var(--fd);font-size:1.3rem;letter-spacing:.05em" ${LK.spinning||LK.tickets<=0||!LK.prizes.length?'disabled':''} onclick="LKX.spin()">${LK.spinning?'ĐANG QUAY…':LK.tickets>0?'↻ VUỐT VÒNG QUAY HOẶC BẤM ĐÂY':'HẾT LƯỢT · HỌC THÊM ĐỂ NHẬN'}</button>
 ${e.show_odds?`<div class="card" style="margin-top:12px;padding:10px 12px"><div class="row" style="justify-content:space-between"><b style="font-size:.88rem">Tỉ lệ trúng</b><small class="mut">Admin công bố</small></div>
 <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:14px;row-gap:2px;font-size:.8rem;margin-top:4px">${LK.prizes.map(p=>`<span>${esc(p.name)} · ${+p.rate}%${p.stock!=null&&p.given>=p.stock?' (hết)':''}</span>`).join('')}</div></div>`:''}${mineList()}`}
function mineList(){if(!LK.mine){loadMine();return ''}const L=LK.mine.filter(x=>x.gift!='none');if(!L.length)return '';
 return `<div class="sec-h"><h2>Quà của tôi</h2><span class="mut">${L.length}</span></div><div class="stack">${L.map(s=>`<div class="card row" style="flex-wrap:nowrap;gap:10px;padding:10px 12px">${gsvg(s.gift,40)}<div style="flex:1;min-width:0"><b>${esc(s.name)}</b><div class="mut" style="font-size:.8rem">${new Date(s.created_at).toLocaleDateString('vi-VN')}${s.code?' · Mã <b class="mono">'+esc(s.code)+'</b>':''}</div></div>${s.code?`<span class="chip ${s.delivered?'on':''}">${s.delivered?'Đã nhận':'Chờ trao'}</span>`:''}</div>`).join('')}</div>`}
function hcCss(){if(document.getElementById('lkhc'))return;const s=document.createElement('style');s.id='lkhc';s.textContent=`
.lk-hc{position:relative;display:flex;align-items:center;gap:12px;width:100%;margin-top:12px;padding:14px 14px 14px 12px;border-radius:18px;border:0;color:#fff;text-align:left;overflow:hidden;cursor:pointer;
 background:radial-gradient(120% 140% at 0% 0%,color-mix(in srgb,var(--hca) 55%,transparent),transparent 60%),linear-gradient(135deg,var(--hcb),color-mix(in srgb,var(--hcb) 70%,#000));
 box-shadow:0 0 0 2px color-mix(in srgb,#f2c14e 70%,transparent),0 10px 26px color-mix(in srgb,var(--hca) 45%,transparent);animation:lkglow 2.4s ease-in-out infinite}
.lk-hc:active{transform:scale(.98)}
.lk-hc::after{content:"";position:absolute;inset:-40% auto -40% -60%;width:45%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.38),transparent);transform:skewX(-18deg);animation:lkshine 3.2s ease-in-out infinite;pointer-events:none}
.lk-hc .bulbs{position:absolute;left:10px;right:10px;top:4px;display:flex;justify-content:space-between;pointer-events:none}
.lk-hc .bulbs i{width:6px;height:6px;border-radius:50%;background:var(--c);box-shadow:0 0 6px var(--c),0 0 12px var(--c);animation:lkbulb 1.2s steps(1) infinite;animation-delay:var(--d)}
.lk-hc .wh{position:relative;flex:none;width:58px;height:58px}
.lk-hc .wh svg.w{animation:lkspin 6s linear infinite;filter:drop-shadow(0 3px 6px rgba(0,0,0,.35))}
.lk-hc .wh .pin{position:absolute;left:24px;top:-5px}
.lk-hc .tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;position:relative;z-index:1}
.lk-hc .tx b{font-family:var(--fd);font-size:1.18rem;line-height:1.1}
.lk-hc .tx small{color:#f3efe6;font-size:.82rem}
.lk-hc .go{position:relative;z-index:1;flex:none;display:flex;flex-direction:column;align-items:center;gap:3px}
.lk-hc .tk{min-width:48px;padding:5px 10px;border-radius:12px;background:#f2c14e;color:#3a2600;font:800 1.05rem/1 var(--fd);text-align:center;animation:lkpop 1.2s ease-in-out infinite}
.lk-hc .tk small{display:block;font:700 .62rem var(--fb);letter-spacing:.04em;margin-top:2px}
.lk-hc .cta{font:800 .72rem var(--fd);letter-spacing:.12em;color:#fff;animation:lkblink 1s steps(1) infinite}
.lk-hc .sp{position:absolute;width:12px;height:12px;pointer-events:none;animation:lktw 1.8s ease-in-out infinite;animation-delay:var(--d)}
.lk-hc.empty{animation:none;box-shadow:0 0 0 1px color-mix(in srgb,#f2c14e 45%,transparent)}.lk-hc.empty .tk,.lk-hc.empty .cta,.lk-hc.empty .bulbs i{animation:none}.lk-hc.empty .tk{background:rgba(255,255,255,.2);color:#fff}
@keyframes lkglow{0%,100%{box-shadow:0 0 0 2px color-mix(in srgb,#f2c14e 55%,transparent),0 8px 20px color-mix(in srgb,var(--hca) 35%,transparent)}50%{box-shadow:0 0 0 3px #f2c14e,0 10px 32px color-mix(in srgb,var(--hca) 75%,transparent)}}
@keyframes lkshine{0%,55%{left:-60%}100%{left:130%}}
@keyframes lkbulb{0%{opacity:1}50%{opacity:.25}}
@keyframes lkspin{to{transform:rotate(360deg)}}
.lk-ico{position:absolute;left:calc(50% - 21px);top:calc(50% - 21px);width:42px;height:42px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.22);transition:box-shadow .3s}
.lk-ico.win{box-shadow:0 0 0 4px #ffe066,0 0 22px 6px rgba(255,224,102,.9);animation:lkwin .6s ease-in-out 4}
@keyframes lkwin{50%{box-shadow:0 0 0 6px #fff,0 0 30px 10px rgba(255,224,102,1)}}
.lk-rim{position:absolute;left:-12px;top:12px;width:324px;height:324px;border-radius:50%;box-shadow:0 12px 30px rgba(0,0,0,.35),inset 0 0 0 3px #f2c14e,0 0 0 3px #f2c14e}
.lk-rim i{position:absolute;left:calc(50% - 4px);top:calc(50% - 4px);width:8px;height:8px;border-radius:50%;background:#fff3b0;box-shadow:0 0 6px 2px rgba(255,236,150,.8);animation:lkbl 1.2s steps(1) infinite}
.lk-rim i:nth-child(odd){animation-delay:.6s}.lk-run .lk-rim i{animation-duration:.25s}.lk-run .lk-rim i:nth-child(odd){animation-delay:.125s}
@keyframes lkbl{50%{background:#a8853a;box-shadow:none}}
@media (prefers-reduced-motion:reduce){.lk-rim i,.lk-ico.win{animation:none}}
@keyframes lkpop{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
@keyframes lkblink{0%{opacity:1}50%{opacity:.35}}
@keyframes lktw{0%,100%{transform:scale(.2) rotate(0);opacity:0}50%{transform:scale(1) rotate(90deg);opacity:1}}
@media (prefers-reduced-motion:reduce){.lk-hc,.lk-hc::after,.lk-hc *{animation:none!important}}`;document.head.appendChild(s)}
function homeCard(){if(!on()||!LK.camp)return '';hcCss();const S2=SEASON[LK.camp.season]||SEASON.xmas,n=LK.tickets,cols=['#ff6b6b','#ffd43b','#69db7c','#4dabf7','#f783ac'];
 const L=LK.prizes.length?LK.prizes:[{gift:'custom'}],seg=360/L.length;
 const wheel=`<svg class="w" width="58" height="58" viewBox="0 0 58 58" aria-hidden="true"><circle cx="29" cy="29" r="28" fill="#f2c14e"/>${L.map((p,i)=>{const a0=(i*seg-90)*Math.PI/180,a1=((i+1)*seg-90)*Math.PI/180,r=25;return `<path d="M29 29L${(29+r*Math.cos(a0)).toFixed(2)} ${(29+r*Math.sin(a0)).toFixed(2)}A${r} ${r} 0 ${seg>180?1:0} 1 ${(29+r*Math.cos(a1)).toFixed(2)} ${(29+r*Math.sin(a1)).toFixed(2)}Z" fill="${S2.c[i%4]}"/>`}).join('')}<circle cx="29" cy="29" r="7" fill="${S2.b}" stroke="#f2c14e" stroke-width="2.5"/></svg><svg class="pin" width="10" height="12" viewBox="0 0 10 12" aria-hidden="true"><path d="M1 1h8L5 11z" fill="#fff" stroke="#7d5a05" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
 const star=(x,y,d,s=12)=>`<svg class="sp" style="left:${x};top:${y};width:${s}px;height:${s}px;--d:${d}s" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill="#fff8d6"/></svg>`;
 return `<button class="lk-hc ${n>0?'':'empty'}" style="--hca:${S2.a};--hcb:${S2.b}" onclick="go('lucky')" aria-label="${esc(LK.camp.name)}: ${n>0?'bạn có '+n+' lượt quay':'học 1 bài để nhận lượt quay'}">
 <span class="bulbs" aria-hidden="true">${Array.from({length:14},(_,k)=>`<i style="--c:${cols[k%5]};--d:${(k%2)*.6}s"></i>`).join('')}</span>
 ${n>0?star('46%','14%',0)+star('62%','62%',.6,10)+star('8%','70%',1.1,9)+star('80%','12%',.9,8):''}
 <span class="wh">${wheel}</span>
 <span class="tx"><b>${esc(LK.camp.name)}</b><small>${n>0?'Quà đang chờ bạn! Chạm để quay ngay':'Học 1 bài để nhận lượt quay'}</small></span>
 <span class="go"><span class="tk">${n}<small>LƯỢT</small></span>${n>0?'<span class="cta">QUAY NGAY</span>':''}</span></button>`}

/* ---------- admin ---------- */
const LA={list:null,ed:null,win:null,pick:null};window.LA=LA;
async function aLoad(){const {data,error}=await SB.from('lucky_campaigns').select('*').order('id',{ascending:false});if(error){LA.err=needSql(error)?'Cần chạy supabase/lucky.sql trên Supabase':error.message;LA.list=[];return rr()}LA.list=data||[];rr()}
async function aEdit(id){if(!id){const s='xmas';LA.ed={c:{name:'Vòng quay '+SEASON[s].n,season:s,starts_on:(window.ymdLocal?ymdLocal():new Date().toISOString().slice(0,10)),ends_on:new Date(Date.now()+30*864e5).toISOString().slice(0,10),active:false,earn:{lesson:1,streak7:2,kaka:1},daily_max:3,pickup:''},p:[],del:[]};LA.win=null;return rr()}
 const c=LA.list.find(x=>x.id==id);const {data}=await SB.from('lucky_prizes').select('*').eq('campaign_id',id).order('sort').order('id');LA.ed={c:{...c},p:(data||[]).map(x=>({...x})),del:[]};LA.win=null;rr();loadWin(id)}
async function loadWin(id){const {data}=await SB.rpc('lucky_winners',{cid:id});LA.win=data||[];rr()}
function totals(){const p=LA.ed.p,sum=Math.round(p.reduce((a,x)=>a+(+x.rate||0),0)*100)/100,cost=Math.round(p.reduce((a,x)=>a+(+x.rate||0)/100*(+x.value||0),0)/100)*100;return {sum,cost,ok:Math.abs(sum-100)<.01}}
function paintTot(){const t=totals(),el=document.getElementById('latot');if(!el)return;const c=t.ok?'var(--good)':'var(--bad)';
 el.innerHTML=`<div style="height:10px;border-radius:99px;background:var(--line);overflow:hidden"><i style="display:block;height:100%;width:${Math.min(t.sum,100)}%;background:${c}"></i></div><div class="row" style="justify-content:space-between;font-size:.86rem;margin-top:4px"><b style="color:${c}">Tổng ${t.sum}%</b><b style="color:${c}">${t.ok?'Hợp lệ':t.sum<100?'Thiếu '+(Math.round((100-t.sum)*100)/100)+'%':'Thừa '+(Math.round((t.sum-100)*100)/100)+'%'}</b></div><p class="mut" style="margin:6px 0 0;font-size:.82rem">Chi phí ước tính ~${money(t.cost)} / lượt quay · 200 lượt ≈ ${money(t.cost*200)}</p>`;
 const sv=document.getElementById('lasave');if(sv)sv.disabled=!t.ok}
function setC(k,v){LA.ed.c[k]=v}
function setE(k,v){LA.ed.c.earn={...(LA.ed.c.earn||{}),[k]:Math.max(0,parseInt(v,10)||0)}}
function setP(i,k,v){const p=LA.ed.p[i];if(k=='rate')p.rate=Math.max(0,Math.min(100,parseFloat(String(v).replace(',','.'))||0));else if(k=='value')p.value=Math.max(0,parseInt(String(v).replace(/\D/g,''),10)||0);else if(k=='stock')p.stock=v===''?null:Math.max(0,parseInt(v,10)||0);else p[k]=v;paintTot()}
function delP(i){const p=LA.ed.p.splice(i,1)[0];if(p&&p.id)LA.ed.del.push(p.id);rr()}
function season(s){LA.ed.c.season=s;rr()}
function packOpen(i){LA.pick={i,sel:new Set()};packSheet()}
function packSheet(){document.querySelectorAll('.lk-ov').forEach(x=>x.remove());const pk=LA.pick,single=pk.i!=null;const ov=document.createElement('div');ov.className='lk-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
 ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(8,14,20,.6);display:flex;align-items:flex-end;justify-content:center;padding:10px';
 const cur=LA.ed.c.season,order=[...PACK].sort((a,b)=>(b[0]==cur)-(a[0]==cur));
 ov.innerHTML=`<div class="card" style="width:min(480px,100%);max-height:calc(100dvh - 20px);overflow:auto;border-radius:20px;padding:14px">
 <div class="row" style="justify-content:space-between"><h2 style="margin:0">${single?'Đổi ảnh quà':'Bộ quà theo mùa'}</h2><button class="chip" onclick="this.closest('.lk-ov').remove()" aria-label="Đóng">✕</button></div>
 <p class="mut" style="margin:4px 0 0;font-size:.84rem">${single?'Chạm để chọn ảnh.':'Chạm để chọn nhiều quà, giá chỉ là gợi ý.'}</p>
 ${order.map(([k,n,L])=>`<h3 style="margin:14px 0 6px">${n}</h3><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">${L.map(([g,nm,v])=>`<button data-g="${g}" onclick="LKX.pk('${g}',this)" aria-pressed="${pk.sel.has(g)}" style="min-height:116px;display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;border-radius:14px;background:var(--card);border:${pk.sel.has(g)?'2px solid var(--steel)':'1px solid var(--line)'}">${gsvg(g,50)}<b style="font-size:.78rem;line-height:1.2">${esc(nm)}</b><small class="mut" style="font-size:.72rem">${v?'~'+money(v):g=='none'?'Ô trống':'Miễn phí'}</small></button>`).join('')}</div>`).join('')}
 ${single?'':`<button class="btn" id="lkadd" style="width:100%;margin-top:14px;position:sticky;bottom:0" onclick="LKX.pkAdd()">Thêm quà đã chọn</button>`}</div>`;
 ov.onclick=e=>{if(e.target===ov)ov.remove()};document.body.appendChild(ov)}
function pk(g,btn){const pk=LA.pick;if(pk.i!=null){const p=LA.ed.p[pk.i];const it=PACK.flatMap(x=>x[2]).find(x=>x[0]==g);p.gift=g;if(!p.name||p.name=='Quà mới')p.name=it[1];document.querySelectorAll('.lk-ov').forEach(x=>x.remove());return rr()}
 pk.sel.has(g)?pk.sel.delete(g):pk.sel.add(g);btn.style.border=pk.sel.has(g)?'2px solid var(--steel)':'1px solid var(--line)';btn.setAttribute('aria-pressed',pk.sel.has(g));const a=document.getElementById('lkadd');if(a)a.textContent=pk.sel.size?'Thêm '+pk.sel.size+' quà':'Thêm quà đã chọn'}
function pkAdd(){const all=PACK.flatMap(x=>x[2]);for(const g of LA.pick.sel){const it=all.find(x=>x[0]==g);LA.ed.p.push({gift:g,name:it[1],value:it[2],rate:0,stock:g=='none'||g=='xp200'||g=='frame'?null:20,given:0})}document.querySelectorAll('.lk-ov').forEach(x=>x.remove());rr()}
async function aSave(){const t=totals();if(!t.ok)return toast('Tổng tỉ lệ phải bằng 100%');const c={...LA.ed.c};delete c.created_at;
 if(!c.name.trim())return toast('Nhập tên vòng quay');if(c.ends_on<c.starts_on)return toast('Ngày kết thúc phải sau ngày bắt đầu');
 const {data:cc,error}=c.id?await SB.from('lucky_campaigns').update(c).eq('id',c.id).select().single():await SB.from('lucky_campaigns').insert(c).select().single();
 if(error)return toast(needSql(error)?'Cần chạy supabase/lucky.sql':error.message);
 if(LA.ed.del.length)await SB.from('lucky_prizes').delete().in('id',LA.ed.del);
 const rows=LA.ed.p.map((p,i)=>({...(p.id?{id:p.id}:{}),campaign_id:cc.id,gift:p.gift,name:p.name||'Quà',value:+p.value||0,rate:+p.rate||0,stock:p.stock,sort:i}));
 const ins=rows.filter(r=>!r.id),upd=rows.filter(r=>r.id);
 for(const r of upd){const {error:e}=await SB.from('lucky_prizes').update(r).eq('id',r.id);if(e)return toast(e.message)}
 if(ins.length){const {error:e}=await SB.from('lucky_prizes').insert(ins);if(e)return toast(e.message)}
 toast('Đã lưu vòng quay');LA.list=null;LK.camp=undefined;await aLoad();aEdit(cc.id)}
async function deliver(id,v){const {error}=await SB.from('lucky_spins').update({delivered:v}).eq('id',id);if(error)return toast(error.message);pendAt=0;LA.pend=(LA.pend||[]).filter(w=>w.id!=id||!v);const w=LA.win.find(x=>x.id==id);if(w)w.delivered=v;rr()}
function vLuckyAdmin(){if(!adm())return '<h1>Vòng quay may mắn</h1><p class="mut">Chỉ admin.</p>';if(!LA.list){aLoad();return '<h1>Vòng quay may mắn</h1><p class="mut">Đang tải…</p>'}
 if(!LA.ed)return `<button class="link" onclick="go('admin')">‹ Quản trị</button><h1 style="margin-top:6px">Vòng quay may mắn</h1>${LA.err?`<p class="note">${esc(LA.err)}</p>`:''}
 <button class="btn" style="width:100%;margin-top:10px" onclick="LKX.aEdit()">＋ Tạo vòng quay mới</button>
 <div class="stack" style="margin-top:12px">${LA.list.map(c=>{const live=c.active&&(window.ymdLocal?ymdLocal():new Date().toISOString().slice(0,10))>=c.starts_on&&(window.ymdLocal?ymdLocal():new Date().toISOString().slice(0,10))<=c.ends_on;return `<button class="card lesson2" onclick="LKX.aEdit(${c.id})"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b>${esc(c.name)}</b><span class="chip ${live?'on':''}">${live?'Đang chạy':c.active?'Đã bật · ngoài thời gian':'Tắt'}</span></div><div class="mut" style="font-size:.84rem">${(SEASON[c.season]||{}).n||''} · ${new Date(c.starts_on).toLocaleDateString('vi-VN')} – ${new Date(c.ends_on).toLocaleDateString('vi-VN')}</div></button>`}).join('')||'<p class="mut">Chưa có vòng quay nào.</p>'}</div>`;
 const c=LA.ed.c,e=c.earn||{},fld=(lab,html)=>`<label class="stack" style="gap:4px;font-size:.84rem;color:var(--mut)">${lab}${html}</label>`;
 const inp=(v,on,type='text',extra='')=>`<input type="${type}" value="${esc(v??'')}" oninput="${on}" ${extra} style="min-height:44px;width:100%;box-sizing:border-box">`;
 setTimeout(paintTot,0);
 return `<button class="link" onclick="LA.ed=null;render()">‹ Danh sách vòng quay</button><h1 style="margin-top:6px">${c.id?'Sửa vòng quay':'Vòng quay mới'}</h1>
 <div class="card stack" style="margin-top:10px"><div class="lbl">Chiến dịch</div>
 ${fld('Tên vòng quay',inp(c.name,"LKX.setC('name',this.value)"))}
 <div class="stack" style="gap:6px"><span style="font-size:.84rem;color:var(--mut)">Chủ đề mùa</span><div class="row" style="gap:6px">${Object.entries(SEASON).map(([k,s])=>`<button class="chip ${c.season==k?'on':''}" onclick="LKX.season('${k}')">${s.n}</button>`).join('')}</div></div>
 <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">${fld('Bắt đầu',inp(c.starts_on,"LKX.setC('starts_on',this.value)",'date'))}${fld('Kết thúc',inp(c.ends_on,"LKX.setC('ends_on',this.value)",'date'))}</div>
 ${fld('Nơi / cách nhận quà',inp(c.pickup,"LKX.setC('pickup',this.value)",'text','placeholder="VD: Phòng HR, tầng 3"'))}
 <label class="row" style="min-height:44px;gap:10px"><input type="checkbox" ${(c.earn||{}).show_odds?'checked':''} onchange="LKX.setE('show_odds',this.checked?1:0)" style="width:22px;height:22px"> <b>Hiện tỉ lệ trúng cho học viên</b></label>
 <label class="row" style="min-height:44px;gap:10px"><input type="checkbox" ${c.active?'checked':''} onchange="LKX.setC('active',this.checked)" style="width:22px;height:22px"> <b>Bật vòng quay</b> <small class="mut">(chỉ chạy trong thời gian trên)</small></label></div>
 <div class="card stack" style="margin-top:10px"><div class="lbl">Cách nhận lượt quay</div>
 ${[['lesson','Xong 1 bài học'],['streak7','Chuỗi 7 ngày học'],['kaka','Thắng thách đấu Kaka']].map(([k,n])=>`<div class="row" style="justify-content:space-between;flex-wrap:nowrap"><span>${n}</span><input type="number" min="0" max="5" aria-label="${n}" value="${+e[k]||0}" oninput="LKX.setE('${k}',this.value)" style="width:70px;min-height:44px;text-align:right"></div>`).join('')}
 <div class="row" style="justify-content:space-between;flex-wrap:nowrap;border-top:1px solid var(--line);padding-top:8px"><span>Tối đa mỗi người / ngày</span><input type="number" min="1" max="20" aria-label="Tối đa mỗi ngày" value="${c.daily_max}" oninput="LKX.setC('daily_max',Math.max(1,Math.min(20,parseInt(this.value,10)||1)))" style="width:70px;min-height:44px;text-align:right"></div></div>
 <div class="card stack" style="margin-top:10px;gap:6px"><div class="row" style="justify-content:space-between"><div class="lbl">Quà &amp; tỉ lệ trúng</div><small class="mut">${LA.ed.p.length} ô · nên 4–10</small></div>
 ${LA.ed.p.map((p,i)=>`<div style="border-bottom:1px solid var(--line);padding:8px 0;display:grid;grid-template-columns:52px minmax(0,1fr) auto;gap:8px;align-items:center">
  <button onclick="LKX.packOpen(${i})" aria-label="Đổi ảnh quà" style="width:52px;height:52px;border-radius:12px;background:var(--soft);display:grid;place-items:center">${gsvg(p.gift,38)}</button>
  <div class="stack" style="gap:4px"><input value="${esc(p.name)}" aria-label="Tên quà" oninput="LKX.setP(${i},'name',this.value)" style="min-height:40px;width:100%;box-sizing:border-box">
  <div class="row" style="gap:6px;flex-wrap:nowrap"><input inputmode="numeric" aria-label="Giá trị (đồng)" value="${p.value||0}" oninput="LKX.setP(${i},'value',this.value)" style="min-height:36px;width:50%;box-sizing:border-box" placeholder="Giá trị"><input type="number" min="0" aria-label="Số lượng (trống = không giới hạn)" value="${p.stock??''}" placeholder="∞" oninput="LKX.setP(${i},'stock',this.value)" style="min-height:36px;width:50%;box-sizing:border-box"></div>
  <small class="mut" style="font-size:.72rem">Giá trị (đ) · Số lượng${p.id&&p.stock!=null?' · đã trao '+p.given:''}</small></div>
  <div class="stack" style="gap:4px;align-items:flex-end"><label class="row" style="gap:2px;flex-wrap:nowrap;font-weight:600"><input type="number" min="0" max="100" step="0.5" aria-label="Tỉ lệ %" value="${+p.rate||0}" oninput="LKX.setP(${i},'rate',this.value)" style="width:64px;min-height:44px;text-align:right">%</label><button class="link" style="color:var(--bad);min-height:32px" onclick="LKX.delP(${i})">Xóa</button></div></div>`).join('')||'<p class="mut">Chưa có quà. Thêm từ bộ quà bên dưới.</p>'}
 <div id="latot" style="margin-top:6px"></div>
 <button class="btn ghost" style="width:100%;border-style:dashed" onclick="LKX.packOpen(null)">＋ Thêm quà từ bộ quà</button>
 <p class="mut" style="margin:0;font-size:.78rem">Quà hết số lượng: tỉ lệ của nó tự chuyển sang ô “Chúc may mắn lần sau”.</p></div>
 <button class="btn" id="lasave" style="width:100%;margin-top:12px" onclick="LKX.aSave()">Lưu vòng quay</button>
 ${c.id?`<div class="sec-h"><h2>Người trúng quà</h2><span class="mut">${LA.win?LA.win.filter(w=>!w.delivered).length+' chờ trao':''}</span></div><div class="stack">${(LA.win||[]).map(w=>`<div class="card row" style="flex-wrap:wrap;gap:10px;padding:10px 12px">${gsvg(w.gift,36)}<div style="flex:1 1 180px;min-width:0"><b>${esc(w.who)}</b> · ${esc(w.name)}<div class="mut" style="font-size:.78rem">Mã <b class="mono">${esc(w.code)}</b> · ${new Date(w.created_at).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</div></div><button class="chip ${w.delivered?'on':''}" onclick="LKX.deliver(${w.id},${!w.delivered})">${w.delivered?'✓ Đã trao':'Đánh dấu đã trao'}</button><button class="chip" aria-label="Nhắn tin" onclick="window.NTX&&NTX.openChat('${w.user_id}')">✉</button></div>`).join('')||(LA.win?'<p class="mut">Chưa có ai trúng quà.</p>':'<p class="mut">Đang tải…</p>')}</div>`:''}`}
/* quà chờ trao: dùng cho chấm đỏ ở Tài khoản và mục trong Thông báo */
let pendAt=0;async function pendLoad(force){if(!adm()||(!force&&Date.now()-pendAt<60000))return;pendAt=Date.now();
 try{let c=LK.camp;if(c===undefined||c===null){const r=await SB.rpc('lucky_current');c=r.data&&r.data.id?r.data:null}if(!c){LA.pend=[];return}
  const {data}=await SB.rpc('lucky_winners',{cid:c.id});const P=(data||[]).filter(w=>!w.delivered&&w.code);const ch=JSON.stringify(P.map(w=>w.id))!==JSON.stringify((LA.pend||[]).map(w=>w.id));LA.pend=P;LA.pendCid=c.id;if(ch)rr()}catch(e){}}
function pendList(){if(!adm())return '';pendLoad();const P=LA.pend||[];if(!P.length)return '';
 return `<div class="sec-h"><h2>🎁 Quà chờ trao</h2><button class="link" onclick="LKX.openWin()">Mở danh sách ›</button></div><div class="stack">${P.slice(0,6).map(w=>`<button class="card row" style="flex-wrap:nowrap;gap:10px;padding:10px 12px;text-align:left;width:100%" onclick="LKX.openWin()">${gsvg(w.gift,34)}<span style="flex:1;min-width:0"><b>${esc(w.who)}</b> · ${esc(w.name)}<small class="mut" style="display:block">Mã <b class="mono">${esc(w.code)}</b> · ${new Date(w.created_at).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</small></span><span class="chip" style="color:var(--warn)">Chờ trao</span></button>`).join('')}</div>`}
async function openWin(){LA.ed=null;go('luckyadm');if(!LA.list)await aLoad();if(LA.pendCid&&LA.list)await aEdit(LA.pendCid);setTimeout(()=>{const h=[...document.querySelectorAll('.sec-h h2')].find(x=>/Người trúng/.test(x.textContent));h&&h.scrollIntoView({block:'start',behavior:'smooth'})},400)}
function adminCard(){if(!adm())return '';pendLoad();const np=(LA.pend||[]).length;return `<button class="card login-nudge" style="position:relative" onclick="${np?'LKX.openWin()':"LA.ed=null;LA.list=null;go('luckyadm')"}"><span class="tile2-ic" style="background:#fff">${gsvg('custom',28)}</span><span style="flex:1;text-align:left"><b>Vòng quay may mắn</b><small>${np?`<b style="color:var(--bad)">${np} quà chờ trao</b> · bấm để xem`:'Tạo vòng quay theo mùa, quà &amp; tỉ lệ, người trúng'}</small></span>${np?`<span style="position:absolute;top:10px;right:34px;min-width:22px;height:22px;padding:0 6px;border-radius:99px;background:var(--bad);color:#fff;font:800 .75rem/22px var(--fd);text-align:center" aria-label="${np} quà chờ trao">${np}</span>`:''}<span class="chev">›</span></button>`}

window.LKX={pendList,pendLoad,openWin,spin,load,grant,aEdit,setC,setE,setP,delP,season,packOpen,pk,pkAdd,aSave,deliver,homeCard,adminCard,gsvg};
window.vLucky=vLucky;window.vLuckyAdmin=vLuckyAdmin;

/* ---------- móc vào app ---------- */
function hook(){
 const h=window.vHome;if(typeof h=='function'&&!h._lk){const w=function(...a){const s=h.apply(this,a);try{const b='';if(b){const i=s.indexOf('</div>',s.indexOf('class="topbar"'));if(i>0){const j=s.indexOf('</div>',i+6)+6;return s.slice(0,j)+b+s.slice(j)}return b+s}}catch(e){}return s};Object.assign(w,h);w._lk=1;window.vHome=w}
 const d=window.vDone;if(typeof d=='function'&&!d._lk){const w=function(...a){const s=d.apply(this,a);try{const g=S.game;if(g&&!g.lk&&g.pool&&g.pool.length&&g.ok/g.pool.length>=.7){g.lk=1;grant('lesson')}}catch(e){}return s};Object.assign(w,d);w._lk=1;window.vDone=w}}
setTimeout(hook,0);setTimeout(hook,1600);
/* ---------- nút hộp quà nổi (kéo thả được) thay cho thẻ lớn trên trang Học ---------- */
function fabCss(){if(document.getElementById('lkfabcss'))return;const s=document.createElement('style');s.id='lkfabcss';s.textContent=`
#lkfab{position:fixed;z-index:60;width:58px;height:58px;padding:0;border:0;border-radius:18px;display:grid;place-items:center;touch-action:none;cursor:grab;
 background:radial-gradient(circle at 30% 25%,color-mix(in srgb,var(--fa) 70%,#fff),var(--fa) 60%,color-mix(in srgb,var(--fa) 70%,#000));
 box-shadow:0 0 0 2px #f2c14e,0 8px 20px color-mix(in srgb,var(--fa) 55%,transparent)}
#lkfab.has{animation:lkfw 2.2s ease-in-out infinite}
#lkfab .n{position:absolute;top:-7px;right:-7px;min-width:22px;height:22px;padding:0 6px;border-radius:99px;background:#f2c14e;color:#3a2600;font:800 .8rem/22px var(--fd);text-align:center;box-shadow:0 0 0 2px var(--bg)}
#lkfab.has .n{animation:lkfp 1.2s ease-in-out infinite}
#lkfab .sp{position:absolute;width:10px;height:10px;animation:lkft 1.8s ease-in-out infinite}
#lkfab:not(.has) .sp{display:none}
@keyframes lkfw{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg) translateY(-3px)}}
@keyframes lkfp{50%{transform:scale(1.18)}}
@keyframes lkft{0%,100%{opacity:0;transform:scale(.3)}50%{opacity:1;transform:scale(1)}}
@media (prefers-reduced-motion:reduce){#lkfab,#lkfab *{animation:none!important}}
body.in-game #lkfab,body.ch-open #lkfab{display:none}`;document.head.appendChild(s)}
const FK='ss-lkfab-pos';
function fab(){let el=document.getElementById('lkfab');const show=on()&&LK.camp&&LK.tickets>0&&!(typeof S!='undefined'&&(S.tab=='lucky'||S.tab=='luckyadm'));
 if(!show){if(el)el.remove();return}
 fabCss();const S2=SEASON[LK.camp.season]||SEASON.xmas,n=LK.tickets;
 if(!el){el=document.createElement('button');el.id='lkfab';document.body.appendChild(el);place(el,null);drag(el)}
 const key=n+'|'+LK.camp.id;if(el.dataset.k!==key){el.dataset.k=key;el.style.setProperty('--fa',S2.a);
  el.className=n>0?'has':'';el.setAttribute('aria-label',esc(LK.camp.name)+(n>0?': bạn có '+n+' lượt quay':': học thêm để nhận lượt quay'));
  const st=(x,y,d)=>`<svg class="sp" style="left:${x}px;top:${y}px;animation-delay:${d}s" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill="#fff8d6"/></svg>`;
  el.innerHTML=`<svg width="40" height="40" viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="28" width="44" height="28" rx="4" fill="#fff"/><rect x="7" y="19" width="50" height="12" rx="3" fill="#ffe8a3"/><path d="M32 19v37" stroke="#e03131" stroke-width="7"/><path d="M7 25h50" stroke="#e03131" stroke-width="0"/><path d="M32 19c-5-11-18-11-15-2 1 3 9 2 15 2 6 0 14 1 15-2 3-9-10-9-15 2z" fill="#e03131"/></svg>${n>0?`<span class="n">${n>9?'9+':n}</span>`:''}${st(-4,-4,0)}${st(48,44,.7)}${st(46,-2,1.2)}`}}
function place(el,p){const w=58,m=8,sb=0;let x,y;try{p=p||JSON.parse(localStorage.getItem(FK)||'null')}catch(e){}
 if(p){x=p.fx*innerWidth;y=p.fy*innerHeight}else{x=Math.max(16,innerWidth/2-224);y=innerHeight-150-w-80}
 x=Math.min(Math.max(x,m),innerWidth-w-m);y=Math.min(Math.max(y,m),innerHeight-w-80);el.style.left=x+'px';el.style.top=y+'px';return {x,y}}
function drag(el){let sx,sy,ox,oy,moved=false,id=null;
 el.addEventListener('pointerdown',e=>{if(e.button>0)return;id=e.pointerId;moved=false;const r=el.getBoundingClientRect();sx=e.clientX;sy=e.clientY;ox=r.left;oy=r.top;try{el.setPointerCapture(id)}catch(_){}});
 el.addEventListener('pointermove',e=>{if(e.pointerId!==id)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(!moved&&Math.hypot(dx,dy)<8)return;if(!moved){moved=true;el.style.animation='none';el.style.transform='scale(1.12)'}
  const p=place(el,{fx:(ox+dx)/innerWidth,fy:(oy+dy)/innerHeight});e.preventDefault()});
 const end=e=>{if(e.pointerId!==id)return;id=null;if(!moved){go('lucky');return}el.style.animation='';el.style.transform='';const r=el.getBoundingClientRect();try{localStorage.setItem(FK,JSON.stringify({fx:r.left/innerWidth,fy:r.top/innerHeight}))}catch(_){}try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}};
 el.addEventListener('pointerup',end);el.addEventListener('pointercancel',e=>{id=null});
 el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go('lucky');return}const s=e.shiftKey?40:12,d={ArrowLeft:[-s,0],ArrowRight:[s,0],ArrowUp:[0,-s],ArrowDown:[0,s]}[e.key];if(!d)return;e.preventDefault();const r=el.getBoundingClientRect();place(el,{fx:(r.left+d[0])/innerWidth,fy:(r.top+d[1])/innerHeight});const q=el.getBoundingClientRect();try{localStorage.setItem(FK,JSON.stringify({fx:q.left/innerWidth,fy:q.top/innerHeight}))}catch(_){}})}
setInterval(()=>{try{fab()}catch(e){}},1000);
addEventListener('resize',()=>{const el=document.getElementById('lkfab');if(el)place(el,null)});

addEventListener('ss-kaka-win',()=>grant('kaka'));
setInterval(()=>{const u=on()?USER.id:null;if(u!==LK.uid){LK.uid=u;LK.camp=undefined;LK.mine=null;if(u)load().then(()=>{try{if((S.streak||0)>=7)grant('streak7')}catch(e){}})}},2000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&on()&&!LK.spinning)load()});
})();
