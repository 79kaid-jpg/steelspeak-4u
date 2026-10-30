/* Giao diện mùa lễ: Giáng sinh "Silent Night" & Tết "Xuân Như Ý".
   Admin chọn trong Tài khoản › Quản trị (lưu app_settings key 'season'). */
(function(){
const TET=[['2027-01-30','2027-02-15'],['2028-01-19','2028-02-04'],['2029-02-05','2029-02-22']];
const DEF={mode:'auto',fx:true,sound:true,optout:true};
let CFG={...DEF},CUR='',loaded=false;try{const c=JSON.parse(localStorage.getItem('ss-season-cfg'));if(c)CFG={...DEF,...c}}catch(e){}
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}};
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
function autoSeason(){const t=ymd(new Date());if(t.slice(5,7)==='12')return 'noel';for(const [a,b] of TET)if(t>=a&&t<=b)return 'tet';return ''}
function pick(){const pv=sessionStorage.getItem('ss-season-preview');if(pv!=null)return pv;if(CFG.optout&&ls.get('ss-season-off')==='1')return '';return CFG.mode==='auto'?autoSeason():CFG.mode==='off'?'':CFG.mode}

/* ---------- SVG nhỏ ---------- */
const svgURI=s=>`url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const HAT=svgURI('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24"><path d="M3 20 C8 6 18 2 27 7 L24 12 C20 9 14 11 11 20Z" fill="#c8102e"/><circle cx="26" cy="9" r="3.4" fill="#fff"/><rect x="1" y="18" width="16" height="5" rx="2.5" fill="#fff"/></svg>');
const LANTERN=svgURI('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 30"><rect x="8" y="0" width="4" height="4" fill="#ffc72c"/><ellipse cx="10" cy="14" rx="9" ry="10" fill="#c8102e"/><path d="M4 7v14M10 4v20M16 7v14" stroke="#ffc72c" stroke-width="1" opacity=".7"/><rect x="6" y="23" width="8" height="3" fill="#ffc72c"/><path d="M8 26v4M10 26v4M12 26v4" stroke="#ffc72c"/></svg>');
const MAI=`<svg viewBox="0 0 120 90" aria-hidden="true"><path d="M0 18 C30 22 50 34 70 56 M30 24 C38 12 46 8 56 6 M52 40 C62 34 74 34 86 38" stroke="#5b3a1e" stroke-width="3.2" fill="none" stroke-linecap="round"/>${[[56,6],[70,56],[86,38],[40,28],[22,20],[62,46],[78,36]].map(([x,y],i)=>`<g transform="translate(${x} ${y}) rotate(${i*23})">${[0,72,144,216,288].map(a=>`<ellipse rx="3.3" ry="5.4" cy="-4.6" transform="rotate(${a})" fill="#ffc72c"/>`).join('')}<circle r="2" fill="#e8742a"/></g>`).join('')}</svg>`;
const DAO=`<svg viewBox="0 0 120 90" aria-hidden="true"><path d="M120 14 C90 20 70 34 52 56 M90 22 C82 10 72 6 62 4 M66 40 C56 34 44 34 32 40" stroke="#4a2a1c" stroke-width="3.2" fill="none" stroke-linecap="round"/>${[[62,4],[52,56],[32,40],[80,26],[100,18],[58,46],[44,36]].map(([x,y],i)=>`<g transform="translate(${x} ${y}) rotate(${i*31})">${[0,72,144,216,288].map(a=>`<ellipse rx="3.4" ry="5.2" cy="-4.4" transform="rotate(${a})" fill="#f48fb1"/>`).join('')}<circle r="1.9" fill="#c2185b"/></g>`).join('')}</svg>`;

/* ---------- CSS ---------- */
const CSS=`
/* chung */
.ss-deco{position:fixed;left:0;right:0;top:0;height:0;z-index:4;pointer-events:none}
.ss-fx{position:fixed;inset:0;z-index:3;pointer-events:none;transition:opacity .6s}
body.in-game .ss-fx{opacity:.18}body.in-game .ss-deco{opacity:.35}
.ss-gift{position:fixed;left:14px;bottom:calc(86px + env(safe-area-inset-bottom));z-index:50;width:56px;height:56px;border-radius:50%;display:grid;place-items:center;font-size:28px;border:2px solid #fff;box-shadow:0 8px 22px #0006;animation:ssbob 2.2s ease-in-out infinite}
body.in-game .ss-gift{display:none}
@keyframes ssbob{50%{transform:translateY(-6px) rotate(-6deg)}}
.ss-modal{position:fixed;inset:0;z-index:2147483500;display:grid;place-items:center;background:#000a;padding:20px;animation:ssin .3s}
@keyframes ssin{from{opacity:0}}
.ss-card{width:min(360px,100%);border-radius:22px;padding:24px 20px 20px;text-align:center;position:relative;box-shadow:0 30px 70px #000a;animation:sspop .5s cubic-bezier(.2,1.5,.4,1)}
@keyframes sspop{from{transform:scale(.6) rotate(-4deg);opacity:0}}
.ss-card h3{font-size:1.5rem;margin:6px 0 2px}.ss-card .big{font-size:3.4rem;line-height:1}
.ss-card .en{font-family:var(--fd);font-size:1.45rem;font-weight:700;margin-top:12px}.ss-card .vi{margin-top:6px;opacity:.85}
.ss-card .xp{display:inline-block;margin-top:14px;padding:6px 14px;border-radius:99px;font-weight:800}
.ss-card .btn{width:100%;margin-top:16px}
.ss-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:14px}
.ss-grid span{aspect-ratio:1;border-radius:8px;display:grid;place-items:center;font-size:.78rem;font-weight:700}
@media (prefers-reduced-motion:reduce){.ss-gift,.ss-bulb,.ss-card{animation:none!important}}

/* ===== GIÁNG SINH ===== */
html:root[data-season="noel"]{--bg:#f4efe6;--card:#fffdf8;--line:#e3d8c6;--soft:#efe6d6;--steel:#b3122e;--steel2:#d2283f;--amber:#e0a526;--good:#1f7a4a;--onsteel:#fff;--ink:#1d1a16;--mut:#6d6255}
@media (prefers-color-scheme:dark){html:root[data-season="noel"]:not([data-theme="light"]){--bg:#0b1d16;--card:#12291f;--line:#1f3d30;--soft:#183528;--steel:#e04a5f;--steel2:#f06a7c;--amber:#f2c14e;--good:#4fc98a;--ink:#f7f4ee;--mut:#a9bfb2;--onsteel:#0b1d16}}
html:root[data-season="noel"][data-theme="dark"]{--bg:#0b1d16;--card:#12291f;--line:#1f3d30;--soft:#183528;--steel:#e04a5f;--steel2:#f06a7c;--amber:#f2c14e;--good:#4fc98a;--ink:#f7f4ee;--mut:#a9bfb2;--onsteel:#0b1d16}
html[data-season="noel"] :is(.coil,.hero2){box-shadow:0 8px 22px #0003;background:radial-gradient(circle at 85% 0,#ffffff22 0 2px,transparent 3px) 0 0/26px 26px,radial-gradient(circle at 30% 60%,#ffffff1c 0 1.5px,transparent 2.5px) 0 0/34px 34px,linear-gradient(135deg,#0f2a1f,#174a33 60%,#0f2a1f)}
html[data-season="noel"] .coil::after{border-color:#f2c14e33;box-shadow:inset 0 0 0 14px #b3122e22}
html[data-season="noel"] .btn:not(.ghost):not(.amber){background:var(--steel);box-shadow:inset 0 0 0 2px #ffffff30}
html[data-season="noel"] .card{position:relative}
html[data-season="noel"] .card::before{content:"";position:absolute;left:10px;right:10px;top:-3px;height:7px;border-radius:7px;background:radial-gradient(ellipse at 20% 100%,#fff 0 40%,transparent 41%) 0 0/34px 7px repeat-x;opacity:.9;pointer-events:none}
@media (prefers-color-scheme:dark){html[data-season="noel"] .card::before{opacity:.55}}
html[data-season="noel"] nav button.on::before{content:"";position:absolute;top:2px;left:50%;margin-left:-2px;width:22px;height:16px;background:${HAT} center/contain no-repeat;transform:rotate(18deg)}
html[data-season="noel"] .ring svg circle:last-of-type{stroke:#1f7a4a}
html[data-season="noel"] .ring::after{content:"★";position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:18px;color:#f2c14e;text-shadow:0 0 8px #f2c14e}
.ss-lights{position:absolute;left:0;right:0;top:env(safe-area-inset-top,0);height:26px;display:flex;justify-content:space-around;align-items:flex-start;background:radial-gradient(ellipse 60% 100% at 50% 0,transparent 70%,#2b3a2b 71% 74%,transparent 75%) 0 -8px/70px 22px repeat-x}
.ss-bulb{width:8px;height:12px;border-radius:50% 50% 50% 50%/40% 40% 60% 60%;margin-top:9px;animation:sstw 1.6s infinite;box-shadow:0 0 10px currentColor}
@keyframes sstw{50%{opacity:.3;box-shadow:none}}
html[data-season="noel"] .ss-gift{background:radial-gradient(circle at 35% 30%,#ff6b7d,#a80f2c)}
html[data-season="noel"] .saga-map::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(#ffffff26,transparent 30%,transparent 80%,#ffffff40);mix-blend-mode:screen}
.ss-card.noel{background:linear-gradient(160deg,#12291f,#0b1d16);color:#f7f4ee;border:2px solid #f2c14e66}.ss-card.noel .xp{background:#f2c14e;color:#3a2600}
.ss-card.noel .ss-grid span{background:#183528;color:#a9bfb2}.ss-card.noel .ss-grid span.op{background:#b3122e;color:#fff}.ss-card.noel .ss-grid span.td{background:#f2c14e;color:#3a2600;box-shadow:0 0 12px #f2c14e}

/* ===== TẾT ===== */
html:root[data-season="tet"]{--bg:#fff6e5;--card:#fffdf7;--line:#f0d9b5;--soft:#fbe9c9;--steel:#c8102e;--steel2:#e0303f;--amber:#ffc72c;--good:#2e7d32;--ink:#4a1c0f;--mut:#7d5a45;--onsteel:#fff}
@media (prefers-color-scheme:dark){html:root[data-season="tet"]:not([data-theme="light"]){--bg:#2a0b0b;--card:#3a1212;--line:#5a2020;--soft:#4a1818;--steel:#ff5a5f;--steel2:#ff7b7f;--amber:#ffc72c;--good:#66bb6a;--ink:#fff3dc;--mut:#e3b9a0;--onsteel:#2a0b0b}}
html:root[data-season="tet"][data-theme="dark"]{--bg:#2a0b0b;--card:#3a1212;--line:#5a2020;--soft:#4a1818;--steel:#ff5a5f;--steel2:#ff7b7f;--amber:#ffc72c;--good:#66bb6a;--ink:#fff3dc;--mut:#e3b9a0;--onsteel:#2a0b0b}
html[data-season="tet"] :is(.coil,.hero2){box-shadow:0 8px 22px #0003;background:radial-gradient(circle at 100% 100%,#ffc72c33 0 22px,transparent 23px),repeating-radial-gradient(circle at 100% 100%,transparent 0 30px,#ffc72c18 30px 32px),linear-gradient(135deg,#9e0b22,#c8102e 55%,#8a0a1d)}
html[data-season="tet"] .coil::after{border-color:#ffc72c40;box-shadow:inset 0 0 0 14px #ffc72c14}
html[data-season="tet"] :is(.coil,.hero2) :is(h1,b){color:#fff3c4}html[data-season="tet"] .hero2 .lbl{color:#ffe08a}html[data-season="noel"] .hero2 .lbl{color:#f2c14e}
html[data-season="tet"] .card{background-image:linear-gradient(135deg,#ffc72c22 0 12px,transparent 12px),linear-gradient(315deg,#ffc72c22 0 12px,transparent 12px)}
html[data-season="tet"] nav button.on::before{content:"";position:absolute;top:0;right:22%;width:13px;height:20px;background:${LANTERN} center/contain no-repeat;animation:sssw 2.4s ease-in-out infinite;transform-origin:50% 0}
@keyframes sssw{50%{transform:rotate(10deg)}}
html[data-season="tet"] .ring svg circle:last-of-type{stroke:#c8102e}
html[data-season="tet"] .ring::after{content:"";position:absolute;top:-12px;left:50%;margin-left:-8px;width:16px;height:24px;background:${LANTERN} center/contain no-repeat;animation:sssw 2.4s ease-in-out infinite;transform-origin:50% 0}
.ss-branch{position:absolute;top:env(safe-area-inset-top,0);width:min(22vw,96px);opacity:.95}.ss-branch.l{left:0}.ss-branch.r{right:0}
html[data-season="tet"] .ss-gift{background:radial-gradient(circle at 35% 30%,#ff5a5f,#a50d22);border-color:#ffc72c}
html[data-season="tet"] .saga-map::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(#ffc72c1f,transparent 30%,transparent 75%,#c8102e22)}
.ss-card.tet{background:linear-gradient(160deg,#c8102e,#8a0a1d);color:#fff3dc;border:2px solid #ffc72c}.ss-card.tet .xp{background:#ffc72c;color:#5a1500}.ss-card.tet .en{color:#ffe08a}
html[data-season="noel"] #sgme::after{content:"";position:absolute;left:50%;top:-14px;width:30px;height:22px;margin-left:-8px;background:${HAT} center/contain no-repeat;transform:rotate(14deg);pointer-events:none;z-index:3}
html[data-season="noel"] .saga-node-wrap.boss::after{content:"";position:absolute;left:50%;top:-12px;width:34px;height:24px;margin-left:-10px;background:${HAT} center/contain no-repeat;transform:rotate(16deg);pointer-events:none}
html[data-season="tet"] #sgme::after{content:"";position:absolute;right:-12px;top:-14px;width:18px;height:28px;background:${LANTERN} center/contain no-repeat;animation:sssw 2.4s ease-in-out infinite;transform-origin:50% 0;pointer-events:none;z-index:3}
html[data-season="tet"] .saga-node-wrap.boss::after{content:"";position:absolute;left:50%;top:-16px;width:18px;height:28px;margin-left:-9px;background:${LANTERN} center/contain no-repeat;animation:sssw 2.4s ease-in-out infinite;transform-origin:50% 0;pointer-events:none}
html[data-season] .saga-map::before{display:none}
/* ===== Khung đăng nhập theo mùa ===== */
html[data-season="noel"] .auth3d{background:linear-gradient(180deg,color-mix(in srgb,var(--good) 10%,var(--bg)),var(--bg) 45%);position:relative;overflow:visible}
html[data-season="noel"] .auth3d::before{content:"";position:absolute;left:18px;right:18px;top:14px;height:12px;background:radial-gradient(circle,#e04a5f 0 3px,transparent 4px) 0 50%/36px 12px repeat-x,radial-gradient(circle,#f2c14e 0 3px,transparent 4px) 12px 50%/36px 12px repeat-x,radial-gradient(circle,#4fc98a 0 3px,transparent 4px) 24px 50%/36px 12px repeat-x;animation:auTwinkle 1.6s steps(2) infinite}
@keyframes auTwinkle{50%{filter:brightness(1.6) saturate(1.3)}}
html[data-season="noel"] .au-badge{color:var(--amber);box-shadow:7px 7px 14px var(--au-lo),-7px -7px 14px var(--au-hi),0 0 0 3px color-mix(in srgb,var(--amber) 55%,transparent)}
html[data-season="noel"] .au-badge::after{content:"";position:absolute;width:40px;height:30px;margin:-46px 0 0 22px;transform:rotate(18deg);background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 30'%3E%3Cpath d='M4 24 Q14 2 30 6 Q34 14 36 22Z' fill='%23d2283f'/%3E%3Crect x='2' y='21' width='34' height='7' rx='3.5' fill='%23fff'/%3E%3Ccircle cx='36' cy='21' r='4' fill='%23fff'/%3E%3C/svg%3E") no-repeat center/contain}
html[data-season="noel"] .au-badge{position:relative}
html[data-season="noel"] .auth3d h2{color:var(--steel)}
html[data-season="noel"] .au-btn{color:var(--steel);border:2px solid transparent;background:linear-gradient(var(--bg),var(--bg)) padding-box,repeating-linear-gradient(135deg,#d2283f 0 8px,#fff 8px 16px) border-box}
html[data-season="noel"] .au-btn:hover,html[data-season="noel"] .au-btn:focus-visible{color:#fff;background:linear-gradient(#c01a35,#c01a35) padding-box,repeating-linear-gradient(135deg,#d2283f 0 8px,#fff 8px 16px) border-box}
html[data-season="noel"] .au-soc svg{color:var(--good)}
html[data-season="noel"] .au-soc:hover,html[data-season="noel"] .au-soc:focus-visible{box-shadow:8px 8px 16px var(--au-lo),-8px -8px 16px var(--au-hi),0 0 0 2px var(--amber)}
html[data-season="noel"] .au-switch{color:var(--good)}
html[data-season="noel"] .au-switch:hover,html[data-season="noel"] .au-switch:focus-visible{background:var(--good);color:#fff;box-shadow:0 8px 25px color-mix(in srgb,var(--good) 40%,transparent)}
html[data-season="tet"] .auth3d{background:linear-gradient(180deg,color-mix(in srgb,#ffc72c 12%,var(--bg)),var(--bg) 45%)}
html[data-season="tet"] .au-badge{color:#c8102e;box-shadow:7px 7px 14px var(--au-lo),-7px -7px 14px var(--au-hi),0 0 0 3px #ffc72c99}
html[data-season="tet"] .au-btn:hover,html[data-season="tet"] .au-btn:focus-visible{background:#c8102e;color:#ffe08a}
html[data-season="tet"] .au-soc svg{color:#c8102e}
@media (prefers-reduced-motion:reduce){html[data-season] .auth3d::before{animation:none}}
`;

/* ---------- Nội dung ---------- */
const ADVENT=[['Merry Christmas!','Giáng sinh vui vẻ!'],['Season\'s greetings','Lời chúc mùa lễ'],['Deck the halls','Trang hoàng nhà cửa'],['Year-end shutdown','Đợt nghỉ bảo trì cuối năm'],['Stock-take','Kiểm kê tồn kho'],['Wrap up the year','Tổng kết năm'],['Secret Santa','Trò tặng quà bí mật'],['Mistletoe','Cây tầm gửi'],['Stocking stuffer','Quà nhỏ bỏ vào tất'],['Ugly Christmas sweater','Áo len Noel "xấu" vui nhộn'],['Snowed in','Bị tuyết chặn không ra được'],['Gingerbread','Bánh gừng'],['Carol singing','Hát thánh ca'],['Peace on earth','Bình an dưới thế'],['Make a wish','Ước một điều'],['Holiday rush','Cao điểm mùa lễ'],['Wrap a present','Gói quà'],['Fairy lights','Đèn nháy trang trí'],['Cozy by the fire','Ấm áp bên lò sưởi'],['Year in review','Nhìn lại một năm'],['Thank you for your support this year','Cảm ơn sự hỗ trợ của anh/chị trong năm qua'],['Wishing you a restful break','Chúc anh/chị kỳ nghỉ thư thái'],['Christmas Eve','Đêm Giáng sinh'],['All is calm, all is bright','Mọi thứ bình yên và rạng rỡ']];
const LOC=[['Happy Lunar New Year!','Chúc mừng năm mới!'],['Wishing you good health and happiness','An khang thịnh vượng'],['May all your wishes come true','Vạn sự như ý'],['Prosperity and good fortune','Phát tài phát lộc'],['Peace and success all year round','Bình an, thành công quanh năm'],['A year of smooth sailing','Thuận buồm xuôi gió'],['Lucky money','Tiền lì xì'],['Family reunion','Đoàn tụ gia đình'],['First-footing','Xông đất'],['Sticky rice cake','Bánh chưng'],['Peach blossom & apricot blossom','Hoa đào & hoa mai'],['Out with the old, in with the new','Tống cựu nghênh tân'],['May your business boom','Buôn may bán đắt'],['Wishing our partnership another great year','Chúc hợp tác của chúng ta thêm một năm thành công']];
const XP_TET=[66,68,86,88,99];

/* ---------- Hiệu ứng rơi ---------- */
let cv,raf=0,parts=[];
function fxStart(kind){fxStop();if(!CFG.fx||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 cv=document.createElement('canvas');cv.className='ss-fx';cv.setAttribute('aria-hidden','true');document.body.appendChild(cv);const ctx=cv.getContext('2d');
 const dpr=Math.min(2,devicePixelRatio||1);function rs(){cv.width=innerWidth*dpr;cv.height=innerHeight*dpr}rs();addEventListener('resize',rs);
 const N=innerWidth<500?18:26;
 const mk=(y)=>({x:Math.random()*innerWidth,y:y??Math.random()*innerHeight,r:kind=='noel'?1.5+Math.random()*2.6:4+Math.random()*3,vy:kind=='noel'?.35+Math.random()*.6:.5+Math.random()*.6,ph:Math.random()*6.28,rot:Math.random()*6.28,c:kind=='tet'?(Math.random()<.55?'#ffc72c':Math.random()<.85?'#f48fb1':'#c8102e'):'#fff',env:kind=='tet'&&Math.random()<.12});
 parts=Array.from({length:N},()=>mk());if(kind=='noel')parts.forEach(p=>p.r*=2.2);
 const flake=(p,col)=>{const R=p.r*dpr;ctx.save();ctx.translate(p.x*dpr,p.y*dpr);ctx.rotate(p.rot);ctx.strokeStyle=col;ctx.lineWidth=Math.max(1,R*.14);ctx.lineCap='round';ctx.beginPath();for(let k=0;k<6;k++){ctx.rotate(Math.PI/3);ctx.moveTo(0,0);ctx.lineTo(0,-R);ctx.moveTo(0,-R*.55);ctx.lineTo(R*.28,-R*.8);ctx.moveTo(0,-R*.55);ctx.lineTo(-R*.28,-R*.8)}ctx.stroke();ctx.restore()};
 const petal=(p)=>{ctx.save();ctx.translate(p.x*dpr,p.y*dpr);ctx.rotate(p.rot);if(p.env){ctx.fillStyle='#c8102e';ctx.fillRect(-4*dpr,-6*dpr,8*dpr,12*dpr);ctx.fillStyle='#ffc72c';ctx.fillRect(-2*dpr,-1*dpr,4*dpr,2*dpr)}else{ctx.fillStyle=p.c;ctx.globalAlpha=.85;ctx.beginPath();ctx.ellipse(0,0,p.r*.6*dpr,p.r*dpr,0,0,6.28);ctx.fill()}ctx.restore()};
 let last=0;const loop=t=>{raf=requestAnimationFrame(loop);if(document.hidden||t-last<30)return;last=t;ctx.clearRect(0,0,cv.width,cv.height);
  for(const p of parts){p.ph+=.015;p.y+=p.vy;p.x+=Math.sin(p.ph)*.5;p.rot+=.012;if(p.y>innerHeight+12)Object.assign(p,mk(-12));
   if(kind=='noel'){const dk=document.documentElement.dataset.theme=='dark'||(document.documentElement.dataset.theme!='light'&&matchMedia('(prefers-color-scheme: dark)').matches);ctx.globalAlpha=dk?.8:.95;flake(p,dk?'#ffffff':'#9fbad3')}else petal(p)}};
 raf=requestAnimationFrame(loop)}
function fxStop(){cancelAnimationFrame(raf);if(cv)cv.remove();cv=null}

/* ---------- Trang trí ---------- */
function deco(kind){document.querySelectorAll('.ss-deco,.ss-gift').forEach(e=>e.remove());if(!kind)return;
 const d=document.createElement('div');d.className='ss-deco';d.setAttribute('aria-hidden','true');
 if(kind=='noel'){const cols=['#ff4d4d','#ffd34d','#4dd17a','#4db8ff','#ff8ad8'];const n=Math.ceil(innerWidth/38);d.innerHTML=`<div class="ss-lights">${Array.from({length:n},(_,i)=>`<i class="ss-bulb" style="background:${cols[i%5]};color:${cols[i%5]};animation-delay:${(i%5)*.3}s"></i>`).join('')}</div>`}
 else d.innerHTML=`<div class="ss-branch l">${MAI}</div><div class="ss-branch r">${DAO}</div>`;
 document.body.appendChild(d);giftBtn(kind)}

/* ---------- Quà mỗi ngày ---------- */
const uid=()=>{try{return USER&&USER.id||'anon'}catch(e){return 'anon'}};
function giftKey(kind){return 'ss-gift-'+kind+'-'+uid()+'-'+ymd(new Date())}
function giftBtn(kind){const today=new Date();if(kind=='noel'&&(today.getMonth()!=11||today.getDate()>24))return;
 try{if(!USER)return}catch(e){return}
 if(ls.get(giftKey(kind)))return;
 const b=document.createElement('button');b.className='ss-gift';b.textContent=kind=='noel'?'🎁':'🧧';b.setAttribute('aria-label',kind=='noel'?'Mở ô quà Giáng sinh hôm nay':'Hái lộc đầu xuân');b.onclick=()=>openGift(kind);document.body.appendChild(b)}
function addXP(n){try{S.xp=(S.xp||0)+n;S.txp=(S.txp||0)+n;tick();save();render()}catch(e){}}
function openGift(kind){const d=new Date();let html,xp;
 if(kind=='noel'){const day=d.getDate(),[en,vi]=ADVENT[(day-1)%24];xp=20;
  html=`<div class="lbl" style="color:#f2c14e">Lịch Mùa Vọng · ngày ${day}/24</div><div class="big">🎄</div><div class="en">${en}</div><div class="vi">${vi}</div><span class="xp">+${xp} XP</span><div class="ss-grid">${Array.from({length:24},(_,i)=>`<span class="${i+1<day?'op':i+1==day?'td':''}">${i+1}</span>`).join('')}</div>`}
 else{const [en,vi]=LOC[Math.floor(Math.random()*LOC.length)];xp=XP_TET[Math.floor(Math.random()*XP_TET.length)];
  html=`<div class="lbl" style="color:#ffe08a">Hái lộc đầu xuân</div><div class="big">🧧</div><div class="en">${en}</div><div class="vi">${vi}</div><span class="xp">Lộc +${xp} XP</span>`}
 ls.set(giftKey(kind),'1');addXP(xp);sound(kind,true);
 const m=document.createElement('div');m.className='ss-modal';m.innerHTML=`<div class="ss-card ${kind}" role="dialog" aria-modal="true">${html}<button class="btn amber">${kind=='noel'?'Cảm ơn ông già Noel!':'Nhận lộc'}</button></div>`;
 m.onclick=e=>{if(e.target===m||e.target.tagName=='BUTTON')m.remove()};document.body.appendChild(m);
 try{const say=new SpeechSynthesisUtterance(html.match(/class="en">([^<]+)/)[1]);say.lang='en-US';speechSynthesis.speak(say)}catch(e){}
 document.querySelector('.ss-gift')?.remove()}

/* ---------- Âm thanh ---------- */
let AC;function ac(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();return AC}catch(e){return null}}
function bell(f,t,d,v){const c=ac();if(!c)return;const t0=c.currentTime+t,lp=c.createBiquadFilter(),g=c.createGain();lp.type='lowpass';lp.frequency.value=2600;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+.01);g.gain.exponentialRampToValueAtTime(.0001,t0+d);[[1,1],[2.76,.18]].forEach(([m,a])=>{const o=c.createOscillator(),og=c.createGain();o.type='sine';o.frequency.value=f*m;og.gain.value=a;o.connect(og).connect(g);o.start(t0);o.stop(t0+d+.02)});g.connect(lp).connect(c.destination)}
function crack(t){const c=ac();if(!c)return;const len=c.sampleRate*.05,b=c.createBuffer(1,len,c.sampleRate),x=b.getChannelData(0);for(let i=0;i<len;i++)x[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);const s=c.createBufferSource(),g=c.createGain();g.gain.value=.12;s.buffer=b;s.connect(g).connect(c.destination);s.start(c.currentTime+t)}
function sound(kind,big){if(!CFG.sound)return;try{if(typeof MUSIC!=='undefined'&&!MUSIC.on)return}catch(e){}
 if(kind=='noel'){[784,988,1175].forEach((f,i)=>bell(f,i*.08,.7,.045));if(big)[[659,0],[659,.2],[659,.4],[659,.8],[659,1],[659,1.2],[659,1.6],[784,1.8],[523,2],[587,2.2],[659,2.4]].forEach(([f,t])=>bell(f,t+.3,.8,.06))}
 else{for(let i=0;i<(big?14:5);i++)crack(i*.06+Math.random()*.05);if(big)[[392,.9],[440,1.1],[523,1.3],[587,1.5],[659,1.7],[587,2],[523,2.2]].forEach(([f,t])=>bell(f,t,.6,.06))}}
/* Nhạc Đua level theo mùa: Jingle Bells (dân gian, PD) cho Noel, giai điệu ngũ cung cho Tết */
const SEQ={noel:{bpm:200,notes:[[64,2],[64,2],[64,4],[64,2],[64,2],[64,4],[64,2],[67,2],[60,3],[62,1],[64,8],[65,2],[65,2],[65,3],[65,1],[65,2],[64,2],[64,2],[64,1],[64,1],[64,2],[62,2],[62,2],[64,2],[62,4],[67,4],[64,2],[64,2],[64,4],[64,2],[64,2],[64,4],[64,2],[67,2],[60,3],[62,1],[64,8],[65,2],[65,2],[65,3],[65,1],[65,2],[64,2],[64,2],[64,1],[64,1],[67,2],[67,2],[65,2],[62,2],[60,8]],bass:[48,55,53,55],kind:'bell'},
 tet:{bpm:168,notes:[[67,2],[69,2],[72,4],[74,2],[72,2],[69,4],[67,2],[64,2],[62,2],[64,2],[67,8],[69,2],[72,2],[74,4],[76,2],[74,2],[72,4],[69,2],[72,2],[67,2],[64,2],[62,8],[64,2],[67,2],[69,4],[72,2],[69,2],[67,4],[64,2],[62,2],[60,2],[62,2],[64,8],[67,2],[64,2],[62,2],[60,2],[62,4],[64,2],[67,2],[60,8]],bass:[48,55,50,55],kind:'pluck'}};
let SM={timer:null,bus:null,on:false};
function seasonMusic(k){const c=ac();if(!c)return;if(c.state=='suspended')c.resume();seasonMusicStop();const Q=SEQ[k],st=60/Q.bpm/2;SM.bus=c.createGain();SM.bus.gain.value=.9;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;SM.bus.connect(lp).connect(c.destination);
 const flat=[];Q.notes.forEach(([n,len])=>{flat.push([n,len]);for(let i=1;i<len;i++)flat.push(null)});let step=0,next=c.currentTime+.1;SM.on=true;
 const v=(()=>{try{return S.game?.55:1}catch(e){return 1}});
 SM.timer=setInterval(()=>{while(next<c.currentTime+.25){const it=flat[step%flat.length],vol=v();
  if(it){const f=440*Math.pow(2,(it[0]-69)/12),d=Math.min(1.2,st*it[1]+.25);voice(Q.kind,f,next,d,.055*vol)}
  if(step%4==0){const b=Q.bass[Math.floor(step/8)%4];voice('bass',440*Math.pow(2,(b-69)/12),next,st*3.5,.07*vol)}
  if(k=='noel'&&step%2==1)shaker(next,.018*vol);if(k=='tet'&&step%4==2)wood(next,.05*vol);
  next+=st;step++}},60)}
function voice(kind,f,t0,d,v){const c=AC,g=c.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+(kind=='bass'?.02:.008));g.gain.exponentialRampToValueAtTime(.0001,t0+d);g.connect(SM.bus);
 const parts=kind=='bell'?[[1,1,'sine'],[2,.25,'sine'],[3.01,.08,'sine']]:kind=='pluck'?[[1,1,'triangle'],[2,.15,'sine']]:[[1,1,'triangle']];
 parts.forEach(([m,a,w])=>{const o=c.createOscillator(),og=c.createGain();o.type=w;o.frequency.value=f*m;og.gain.value=a;o.connect(og).connect(g);o.start(t0);o.stop(t0+d+.02)})}
function shaker(t0,v){const c=AC,len=c.sampleRate*.05,b=c.createBuffer(1,len,c.sampleRate),x=b.getChannelData(0);for(let i=0;i<len;i++)x[i]=(Math.random()*2-1)*(1-i/len);const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type='bandpass';f.frequency.value=4500;f.Q.value=.8;g.gain.value=v;s.connect(f).connect(g).connect(SM.bus);s.start(t0)}
function wood(t0,v){const c=AC,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(900,t0);o.frequency.exponentialRampToValueAtTime(600,t0+.05);g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.08);o.connect(g).connect(SM.bus);o.start(t0);o.stop(t0+.1)}
function seasonMusicStop(){clearInterval(SM.timer);SM.timer=null;SM.on=false;if(SM.bus){const b=SM.bus;try{b.gain.setTargetAtTime(0,AC.currentTime,.1)}catch(e){}setTimeout(()=>{try{b.disconnect()}catch(e){}},400)}SM.bus=null}
function hookMusic(){try{if(typeof musicStart!=='function'||musicStart.__ss)return;const ms=musicStart,mx=musicStop;
 window.musicStart=function(theme){if(CUR&&CFG.sound&&SEQ[CUR]){if(MUSIC.playing==='ss-'+CUR)return;mx();MUSIC.playing='ss-'+CUR;seasonMusic(CUR);return}seasonMusicStop();return ms.apply(this,arguments)};window.musicStart.__ss=1;
 window.musicStop=function(){seasonMusicStop();if(MUSIC.playing&&String(MUSIC.playing).startsWith('ss-'))MUSIC.playing=null;return mx.apply(this,arguments)}}catch(e){}}
function hookSFX(){hookMusic();try{if(!SFX||SFX.__ss)return;SFX.__ss=1;const ok=SFX.ok,win=SFX.win;if(ok)SFX.ok=function(){const r=ok.apply(this,arguments);if(CUR)sound(CUR,false);return r};if(win)SFX.win=function(){const r=win.apply(this,arguments);if(CUR)sound(CUR,true);return r}}catch(e){}}


/* ---------- Bản đồ Đua level theo mùa ---------- */
const MAP_SCN={
 noel:[
  {city:'Làng tuyết Bắc Cực',sky:['#1b2a52','#41608f'],hill:['#eef4fb','#d3e1ef'],props:['xtree','cabin','snowman','gifts'],night:true,stars:28,bush:false},
  {city:'Chợ phiên Giáng sinh',sky:['#0f2a1f','#2a5b44'],hill:['#f4f8fc','#dbe6f0'],props:['cabin','xtree','gifts','xtree'],night:true,stars:20,bush:false},
  {city:'Rừng thông tuyết',sky:['#cfe3f5','#f5fbff'],hill:['#ffffff','#dde9f4'],props:['pine','snowman','pine','xtree'],bush:false},
  {city:'Xưởng quà ông già Noel',sky:['#3a1630','#7a2a4a'],hill:['#f6f1f4','#e2d6dc'],props:['gifts','cabin','gifts','snowman'],night:true,stars:24,bush:false}],
 tet:[
  {city:'Chợ hoa ngày Tết',sky:['#ffd9a8','#fff4e0'],hill:['#9fd07a','#6fae4f'],props:['mai','lanterns','dao','banhchung']},
  {city:'Phố ông đồ',sky:['#ffe0b2','#fff8ec'],hill:['#c9a46a','#a78449'],props:['caudoi','lanterns','caudoi','mai'],bush:false},
  {city:'Làng quê đón xuân',sky:['#bfe6ff','#f0faff'],hill:['#7cc47a','#4f9e57'],props:['dao','banhchung','mai','lanterns']},
  {city:'Đêm giao thừa',sky:['#2a0b2e','#6a1838'],hill:['#7a1a2a','#5a1020'],props:['lanterns','fireworks','lanterns','fireworks'],night:true,stars:20,bush:false}]};
function seasonProp(t,x,y,s,i){const g=c=>`<g transform="translate(${x} ${y}) scale(${s})" class="pp pp-${t}" style="--d:${(i%5)*0.6}s">${c}</g>`;
 const cols=['#ff4d4d','#ffd34d','#4dd17a','#4db8ff','#ff8ad8'];
 switch(t){
 case 'xtree':return g(`<rect x="-4" y="12" width="8" height="12" fill="#6b4a2a"/>${[0,1,2].map(k=>`<path d="M${-22+k*5} ${14-k*13}h${44-k*10}l${-22+k*5} -20z" fill="#1f6b45"/>`).join('')}${Array.from({length:9},(_,k)=>`<circle class="twk" style="--d:${k*.25}s" cx="${[-14,6,14,-8,8,-4,4,-10,12][k]}" cy="${[8,6,10,-4,-6,-16,-20,2,-2][k]}" r="2.6" fill="${cols[k%5]}"/>`).join('')}<path d="M0 -50l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#f2c14e"/>`);
 case 'snowman':return g(`<circle cy="10" r="13" fill="#fff" stroke="#c9d8e6"/><circle cy="-10" r="9" fill="#fff" stroke="#c9d8e6"/><path d="M0 -10l9 2-9 2z" fill="#f08a24"/><circle cx="-3" cy="-13" r="1.3" fill="#222"/><circle cx="3" cy="-13" r="1.3" fill="#222"/><rect x="-8" y="-24" width="16" height="4" fill="#222"/><rect x="-5" y="-33" width="10" height="10" fill="#222"/><path d="M-9 -3h18" stroke="#c8102e" stroke-width="3"/>`);
 case 'cabin':return g(`<rect x="-24" y="-8" width="48" height="30" fill="#7a4a2a"/><path d="M-30 -8l30 -22 30 22z" fill="#fff"/><rect class="twk" style="--d:.4s" x="-14" y="0" width="10" height="10" fill="#ffd56a"/><rect class="twk" x="4" y="0" width="10" height="10" fill="#ffd56a"/><path d="M-30 -8h60" stroke="#ff4d4d" stroke-width="2" stroke-dasharray="3 4"/>`);
 case 'gifts':return g(`${[[-14,6,'#c8102e','#f2c14e'],[6,8,'#1f6b45','#fff'],[-4,-8,'#f2c14e','#c8102e']].map(([a,b,c,d])=>`<rect x="${a-9}" y="${b-9}" width="18" height="18" rx="2" fill="${c}"/><path d="M${a} ${b-9}v18M${a-9} ${b}h18" stroke="${d}" stroke-width="3"/>`).join('')}`);
 case 'mai':case 'dao':{const f=t=='mai'?'#ffc72c':'#f48fb1',c=t=='mai'?'#e8742a':'#c2185b';return g(`<path d="M0 22v-24M0 0l-14-16M0 -4l12-18M-6 -8l-10 -2M4 -14l10 -6" stroke="#5b3a1e" stroke-width="3" stroke-linecap="round"/>${[[-14,-16],[12,-22],[-16,-10],[14,-20],[0,-26],[-8,-6],[6,-10],[-4,-18],[10,-4]].map(([a,b],k)=>`<g transform="translate(${a} ${b}) rotate(${k*31})">${[0,72,144,216,288].map(r=>`<ellipse rx="2.4" ry="3.8" cy="-3.2" transform="rotate(${r})" fill="${f}"/>`).join('')}<circle r="1.4" fill="${c}"/></g>`).join('')}<rect x="-9" y="16" width="18" height="10" rx="2" fill="#c8102e"/>`)}
 case 'lanterns':return g(`<path d="M-34 -30q34 14 68 0" stroke="#5b3a1e" fill="none"/>${[-24,0,24].map((a,k)=>`<g class="swing" style="transform-origin:${a}px -24px"><path d="M${a} -24v6" stroke="#5b3a1e"/><ellipse cx="${a}" cy="-8" rx="9" ry="11" fill="#c8102e"/><rect x="${a-4}" y="2" width="8" height="3" fill="#ffc72c"/><path d="M${a} 5v8" stroke="#ffc72c"/></g>`).join('')}`);
 case 'banhchung':return g(`<rect x="-14" y="-6" width="28" height="28" fill="#3f8f3f"/><path d="M-14 3h28M-14 13h28M-5 -6v28M5 -6v28" stroke="#e8d9a6" stroke-width="2"/><rect x="-14" y="-6" width="28" height="28" fill="none" stroke="#2a6a2a" stroke-width="2"/>`);
 case 'caudoi':return g(`<rect x="-8" y="-34" width="16" height="58" rx="2" fill="#c8102e"/><rect x="-6" y="-32" width="12" height="54" fill="none" stroke="#ffc72c"/>${[0,1,2].map(k=>`<path d="M-3 ${-24+k*16}q3 -4 6 0q-3 4 -6 0" stroke="#1a1a1a" stroke-width="2" fill="none"/>`).join('')}`);
 case 'fireworks':return g(`${Array.from({length:12},(_,k)=>{const a=k*30*Math.PI/180;return `<path class="twk" style="--d:${k*.15}s" d="M0 -20L${Math.cos(a)*22} ${-20+Math.sin(a)*22}" stroke="${['#ffc72c','#ff5a5f','#f48fb1'][k%3]}" stroke-width="2.4" stroke-linecap="round"/>`}).join('')}<circle cy="-20" r="3" fill="#fff"/>`);
 }return null}
function hookMap(){try{if(typeof sceneSVG!=='function'||sceneSVG.__ss)return;
 const oScene=sceneSVG,oProp=prop,oBottom=mapBottomColor;
 THEME_SCN.noel=MAP_SCN.noel;THEME_SCN.tet=MAP_SCN.tet;
 window.prop=prop=function(t,x,y,s,i){return seasonProp(t,x,y,s,i)??oProp(t,x,y,s,i)};
 window.sceneSVG=sceneSVG=function(ci,h,theme){return oScene(ci,h,CUR||theme)};sceneSVG.__ss=1;
 window.mapBottomColor=mapBottomColor=function(){if(CUR){const s=MAP_SCN[CUR][0];return s.hill[1]}return oBottom()};
}catch(e){console.warn('season map',e)}}
/* ---------- Áp dụng ---------- */
function apply(){const k=pick();if(k===CUR&&document.querySelector(k?'.ss-deco':'body'))return;CUR=k;try{if(typeof render=='function'&&S&&S.tab=='saga')render()}catch(e){}
 const root=document.documentElement;if(k)root.setAttribute('data-season',k);else root.removeAttribute('data-season');ls.set('ss-season-cur',k||'');
 const mt=document.querySelector('meta[name=theme-color]');if(mt){mt.dataset.orig=mt.dataset.orig||mt.content;mt.content=k=='noel'?'#0f2a1f':k=='tet'?'#c8102e':mt.dataset.orig}
 if(k){deco(k);fxStart(k);hookSFX();hookMap()}else{deco('');fxStop()}}
async function load(){try{const {data}=await SB.from('app_settings').select('value').eq('key','season').maybeSingle();if(data&&data.value){CFG={...DEF,...JSON.parse(data.value)};ls.set('ss-season-cfg',data.value)}}catch(e){}loaded=true;CUR='?';apply()}

/* ---------- Giao diện quản trị & người dùng ---------- */
const MODES=[['auto','Tự động','Noel: tháng 12 · Tết: 23 tháng Chạp → mùng 10'],['off','Tắt','Giao diện gốc'],['noel','🎄 Giáng sinh','Silent Night'],['tet','🧧 Tết','Xuân Như Ý']];
async function saveCfg(p){const n={...CFG,...p};const {error}=await SB.from('app_settings').upsert({key:'season',value:JSON.stringify(n),updated_at:new Date().toISOString()});if(error){toast('Lỗi: '+error.message);return}CFG=n;ls.set('ss-season-cfg',JSON.stringify(n));sessionStorage.removeItem('ss-season-preview');apply();toast('Đã áp dụng cho mọi người dùng');render()}
const sw=(k,l)=>`<label class="row" style="justify-content:space-between;padding:8px 0;border-top:1px solid var(--line)"><span>${l}</span><input type="checkbox" ${CFG[k]?'checked':''} onchange="SEASON.save({${k}:this.checked})" style="width:22px;height:22px"></label>`;
window.SEASON={
 get current(){return CUR},
 save:saveCfg,
 preview(k){sessionStorage.setItem('ss-season-preview',k);CUR='?';apply();toast(k?'Đang xem thử trên máy này':'Đã tắt xem thử');render()},
 endPreview(){sessionStorage.removeItem('ss-season-preview');CUR='?';apply();render()},
 toggleMine(){ls.set('ss-season-off',ls.get('ss-season-off')==='1'?null:'1');CUR='?';apply();render()},
 admin(){if(!loaded)return '';const pv=sessionStorage.getItem('ss-season-preview');const auto=autoSeason();
  return `<h2>Giao diện mùa lễ</h2><p class="mut">Áp dụng cho <b>mọi người dùng</b>. ${CFG.mode=='auto'?`Hôm nay tự động: <b>${auto=='noel'?'Giáng sinh':auto=='tet'?'Tết':'giao diện gốc'}</b>.`:''}</p>
  <div class="card" style="margin-top:8px"><div class="stack">${MODES.map(([k,n,d])=>`<button class="course-row" onclick="SEASON.save({mode:'${k}'})" aria-pressed="${CFG.mode==k}" style="${CFG.mode==k?'outline:2px solid var(--steel);':''}"><span style="flex:1;text-align:left"><b>${n}</b><small>${d}</small></span>${CFG.mode==k?'<span style="color:var(--steel);font-weight:800">✓</span>':''}</button>`).join('')}</div>
  <div style="margin-top:10px">${sw('fx','Hiệu ứng rơi (tuyết / hoa mai)')}${sw('sound','Âm thanh mùa lễ')}${sw('optout','Cho người dùng tự tắt')}</div>
  <div class="lbl" style="margin-top:12px">Xem thử chỉ trên máy này</div><div class="chips" style="margin-top:6px"><button class="chip ${pv=='noel'?'on':''}" onclick="SEASON.preview('noel')">🎄 Noel</button><button class="chip ${pv=='tet'?'on':''}" onclick="SEASON.preview('tet')">🧧 Tết</button>${pv!=null?`<button class="chip" onclick="SEASON.endPreview()">Thôi xem thử</button>`:''}</div></div>`},
 user(){if(!loaded||!CFG.optout)return '';const on=ls.get('ss-season-off')!=='1';const a=CFG.mode=='auto'?autoSeason():CFG.mode=='off'?'':CFG.mode;if(!a)return '';
  return `<label class="card row" style="justify-content:space-between;margin-top:10px"><span><b>${a=='noel'?'🎄 Giao diện Giáng sinh':'🧧 Giao diện Tết'}</b><br><small class="mut">Tắt nếu bạn thích giao diện gốc</small></span><input type="checkbox" ${on?'checked':''} onchange="SEASON.toggleMine()" style="width:22px;height:22px"></label>`},
 gift(){if(CUR)openGift(CUR)}
};
let st=document.getElementById('ss-season-css');if(!st){st=document.createElement('style');st.id='ss-season-css';document.head.appendChild(st)}st.textContent=CSS;ls.set('ss-season-css',CSS);
// áp dụng xem thử ngay (không cần chờ mạng), rồi tải cài đặt
if(sessionStorage.getItem('ss-season-preview')!=null)apply();
setTimeout(load,300);let n=0;const w=setInterval(()=>{let ok=false;try{ok=!!USER}catch(e){}if(ok||++n>30){clearInterval(w);load()}},500);
setInterval(()=>{if(CUR&&!document.querySelector('.ss-gift')&&loaded)giftBtn(CUR)},60000);
})();
