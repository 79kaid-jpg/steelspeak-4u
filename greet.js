/* Lời chúc đặc biệt: hộp trang sức bạc mở ra, cánh hồng bay, ảnh trong khung bạc */
(function(){
const css=`.gx{position:fixed;inset:0;z-index:2147483600;background:radial-gradient(ellipse at 50% 35%,#4a0f1d 0%,#1d0610 60%,#0b0207 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;color:#f7e9ee;font-family:inherit;opacity:0;transition:opacity .6s}
.gx.on{opacity:1}.gx-x{position:absolute;top:calc(14px + env(safe-area-inset-top));right:16px;width:44px;height:44px;border-radius:50%;border:1px solid #ffffff40;background:#ffffff14;color:#fff;font-size:22px}
.gx-hint{margin-top:26px;letter-spacing:.2em;text-transform:uppercase;font-size:.78rem;color:#e9c7d2;animation:gxp 1.6s infinite}
@keyframes gxp{50%{opacity:.35}}
.gx-box{position:relative;width:200px;height:150px;cursor:pointer;perspective:700px;animation:gxw 2.4s ease-in-out infinite}
@keyframes gxw{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg) translateY(-6px)}}
.gx-base{position:absolute;bottom:0;left:0;right:0;height:100px;border-radius:10px;background:linear-gradient(135deg,#eef0f4,#9aa0ab 45%,#f6f7fa 55%,#8a909c);box-shadow:0 20px 50px #000a,inset 0 0 0 3px #ffffff60}
.gx-base:before{content:"";position:absolute;inset:12px;border-radius:6px;background:repeating-linear-gradient(45deg,#6b0f22 0 8px,#8e1a31 8px 16px);opacity:.85;-webkit-mask:linear-gradient(#000 0 0)}
.gx-lid{position:absolute;top:10px;left:-8px;right:-8px;height:46px;border-radius:12px;background:linear-gradient(135deg,#fff,#a5abb5 40%,#fbfcfd 60%,#8a909c);transform-origin:50% 100%;transition:transform 1s cubic-bezier(.3,1.6,.5,1);box-shadow:0 6px 16px #0007}
.gx-lid i{position:absolute;bottom:-14px;width:6px;height:16px;border-radius:0 0 4px 4px;background:linear-gradient(#eee,#9aa);animation:gxt 1.2s ease-in-out infinite;transform-origin:top}
@keyframes gxt{50%{transform:rotate(12deg)}}
.gx-gem{position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff8fa3,#b0102e 60%,#5a0616);box-shadow:0 0 14px #ff3a5c}
.gx.open .gx-lid{transform:rotateX(-115deg) translateY(-30px)}.gx.open .gx-box{animation:none}
.gx-stage{display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 22px;max-width:520px}
.gx-ring{position:relative;width:min(66vw,290px);height:min(66vw,290px);flex-shrink:0;box-sizing:border-box;border-radius:50%;padding:9px;background:conic-gradient(#fff,#9aa0ab,#f7f8fa,#80868f,#fff,#a3a9b3,#fff);box-shadow:0 0 0 3px #7a0f25,0 0 60px #ff4d6d55;transform:scale(.2);opacity:0;transition:transform 1.2s cubic-bezier(.2,1.4,.4,1),opacity .8s}
.gx-ring img{width:100%;height:100%;border-radius:50%;object-fit:cover;object-position:50% 22%;filter:blur(14px) saturate(.4);transition:filter 2.2s .4s}
.gx-ring b{position:absolute;bottom:-18px;width:5px;height:22px;border-radius:0 0 4px 4px;background:linear-gradient(#fff,#9aa0ab);transform-origin:50% -150px}
.gx.show .gx-ring{transform:none;opacity:1}.gx.show .gx-ring img{filter:none}
.gx-t{font-family:'Great Vibes','Brush Script MT',cursive;font-size:clamp(2.4rem,11vw,3.6rem);line-height:1;margin:34px 0 4px;background:linear-gradient(90deg,#fff,#d9dde3,#fff,#c3c8d0);-webkit-background-clip:text;color:transparent;text-shadow:0 0 30px #ffffff30;opacity:0;transition:opacity 1s 1.2s}
.gx-n{font-size:1.3rem;font-weight:800;letter-spacing:.06em;color:#ffd1dc;opacity:0;transition:opacity 1s 1.6s}
.gx-m{margin-top:14px;font-size:1rem;line-height:1.6;color:#f3dce3;min-height:4.8em;white-space:pre-line}
.gx-f{margin-top:10px;font-style:italic;color:#e9b9c6;opacity:0;transition:opacity 1s}
.gx.show .gx-t,.gx.show .gx-n{opacity:1}.gx.done .gx-f{opacity:1}
.gx-p{position:absolute;top:-40px;width:16px;height:13px;border-radius:13px 0;background:radial-gradient(circle at 30% 30%,#e8435f,#8e0e27);pointer-events:none;animation:gxf linear forwards}
.gx-s{position:absolute;width:4px;height:4px;border-radius:50%;background:#fff;box-shadow:0 0 8px #fff;pointer-events:none;animation:gxs 1.8s ease-out forwards}
@keyframes gxf{to{transform:translate(var(--dx),110vh) rotate(var(--r))}}
@keyframes gxs{0%{transform:scale(0)}30%{transform:scale(1.4)}100%{transform:translate(var(--dx),var(--dy)) scale(0)}}
.gx-replay{position:fixed;right:14px;bottom:calc(86px + env(safe-area-inset-bottom));z-index:50;width:54px;height:54px;border-radius:50%;border:2px solid #fff;background:radial-gradient(circle at 35% 30%,#ff8fa3,#a80f2c);font-size:26px;box-shadow:0 8px 24px #a80f2c88;animation:gxw 2s infinite}
.gx-spinbtn{margin-top:18px;border:2px solid #fff;border-radius:999px;padding:12px 22px;min-height:48px;font:800 1rem system-ui,sans-serif;color:#fff;background:linear-gradient(135deg,#ff6b8a,#a80f2c);box-shadow:0 10px 26px #a80f2c88;cursor:pointer;opacity:0;transition:opacity .8s,transform .25s}
.gx.done .gx-spinbtn{opacity:1}.gx-spinbtn:hover{transform:translateY(-2px) scale(1.03)}
.gw{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px 16px;background:radial-gradient(circle at 50% 40%,#5a1024,#1a0610);animation:gwIn .5s ease}
@keyframes gwIn{from{opacity:0;transform:scale(.96)}}
.gw h3{margin:0;font-family:'Great Vibes',cursive;font-size:2.6rem;color:#ffd1dc;font-weight:400}
.gw-wrap{position:relative;width:min(82vw,330px);aspect-ratio:1}
.gw-wheel{position:absolute;inset:0;border-radius:50%;border:6px solid #fff;box-shadow:0 0 0 4px #ffb3c1,0 16px 40px #0008;background:conic-gradient(#ff6b8a 0 72deg,#ffd166 72deg 144deg,#c77dff 144deg 216deg,#4cc9a0 216deg 288deg,#ff9f43 288deg 360deg);transition:transform 5.2s cubic-bezier(.12,.75,.12,1)}
.gw-wheel span{position:absolute;left:50%;top:50%;width:46%;transform-origin:0 50%;display:flex;align-items:center;gap:4px;padding-left:22%;font:800 .78rem/1.1 system-ui,sans-serif;color:#2a0812;text-shadow:0 1px 0 #fff8}
.gw-wheel span em{font-style:normal;font-size:1.5rem}
.gw-pin{position:absolute;left:50%;top:-14px;margin-left:-16px;width:32px;height:40px;z-index:2;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 40'%3E%3Cpath d='M16 40 L3 12 A13 13 0 1 1 29 12Z' fill='%23fff'/%3E%3Ccircle cx='16' cy='13' r='6' fill='%23a80f2c'/%3E%3C/svg%3E") no-repeat center/contain;filter:drop-shadow(0 3px 4px #0006)}
.gw-hub{position:absolute;left:50%;top:50%;width:64px;height:64px;margin:-32px;border-radius:50%;border:4px solid #fff;background:radial-gradient(circle at 35% 30%,#ff8fa3,#a80f2c);color:#fff;font:900 .9rem system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 16px #0007}
.gw-hub:disabled{opacity:.7;cursor:default}
.gw-msg{min-height:3.2em;text-align:center;color:#ffe3ea;font:600 1rem/1.5 system-ui,sans-serif;max-width:340px}
.gw-msg b{color:#ffd166;font-size:1.15rem}.gw-code{display:inline-block;margin-top:6px;padding:4px 12px;border:2px dashed #ffd166;border-radius:10px;font:800 1rem ui-monospace,monospace;color:#ffd166;letter-spacing:.08em}
.gw-left{color:#e9b9c6;font-size:.86rem}
@media (prefers-reduced-motion:reduce){.gx *{animation-duration:.01s!important;transition-duration:.01s!important}}`;
let AC;function ac(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();AC.resume();return AC}catch(e){return null}}
function bell(f,t,d=1.6,v=.12){const c=ac();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,c.currentTime+t);g.gain.linearRampToValueAtTime(v,c.currentTime+t+.01);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+t+d);o.connect(g).connect(c.destination);o.start(c.currentTime+t);o.stop(c.currentTime+t+d)}
function jingle(){for(let i=0;i<14;i++)bell(2200+Math.random()*1800,i*.045+Math.random()*.03,.5,.05)}
function tune(){/* Happy Birthday, hộp nhạc */const N={G:392,A:440,B:494,C:523,D:587,E:659,F:698,g:784};const s=[['G',0],['G',.3],['A',.6],['G',1.2],['C',1.8],['B',2.4],['G',3.4],['G',3.7],['A',4],['G',4.6],['D',5.2],['C',5.8],['G',6.8],['G',7.1],['g',7.4],['E',8],['C',8.6],['B',9.2],['A',9.8],['F',10.8],['F',11.1],['E',11.4],['C',12],['D',12.6],['C',13.2]];s.forEach(([n,t])=>{bell(N[n]*2,t+.2,1.4,.09);bell(N[n]*4,t+.2,.6,.02)})}
function petals(root,n){for(let i=0;i<n;i++){const p=document.createElement('i');p.className='gx-p';p.style.left=Math.random()*100+'%';p.style.setProperty('--dx',(Math.random()*160-80)+'px');p.style.setProperty('--r',(Math.random()*720-360)+'deg');p.style.animationDuration=(4+Math.random()*4)+'s';p.style.animationDelay=(Math.random()*3)+'s';p.style.opacity=.6+Math.random()*.4;p.style.transform=`scale(${.6+Math.random()*.8})`;root.appendChild(p);setTimeout(()=>p.remove(),12000)}}
function sparks(root,x,y,n){for(let i=0;i<n;i++){const s=document.createElement('i');s.className='gx-s';s.style.left=x+'px';s.style.top=y+'px';const a=Math.random()*6.28,r=60+Math.random()*140;s.style.setProperty('--dx',Math.cos(a)*r+'px');s.style.setProperty('--dy',Math.sin(a)*r+'px');root.appendChild(s);setTimeout(()=>s.remove(),2000)}}
function esc(s){return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function open(g){if(document.querySelector('.gx'))return;
 if(!document.getElementById('gx-css')){const st=document.createElement('style');st.id='gx-css';st.textContent=css;document.head.appendChild(st);const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap';document.head.appendChild(l)}
 const el=document.createElement('div');el.className='gx';el.setAttribute('role','dialog');el.setAttribute('aria-label',g.title);
 const tass=Array.from({length:9},(_,i)=>`<i style="left:${10+i*10}%;animation-delay:${i*.1}s"></i>`).join('');
 el.innerHTML=`<button class="gx-x" aria-label="Đóng">×</button><div class="gx-pre" style="display:flex;flex-direction:column;align-items:center"><div class="gx-box" tabindex="0" aria-label="Mở hộp quà"><div class="gx-base"></div><div class="gx-lid">${tass}<span class="gx-gem"></span></div></div><div class="gx-hint">Chạm để mở quà</div></div>`;
 document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('on'));
 el.querySelector('.gx-x').onclick=()=>{el.classList.remove('on');setTimeout(()=>el.remove(),600)};
 const box=el.querySelector('.gx-box');let opened=false;
 const go=()=>{if(opened)return;opened=true;jingle();el.classList.add('open');const r=box.getBoundingClientRect();sparks(el,r.left+r.width/2,r.top+30,40);petals(el,40);
  setTimeout(()=>{el.querySelector('.gx-pre').remove();const st=document.createElement('div');st.className='gx-stage';
   const tas=Array.from({length:11},(_,i)=>`<b style="left:calc(50% - 2px);transform:rotate(${(i-5)*9}deg)"></b>`).join('');
   st.innerHTML=`<div class="gx-ring">${g.image?`<img src="${g.image}" alt="">`:''}${tas}</div><div class="gx-t">${esc(g.title)}</div><div class="gx-n">${esc(g.name||'')}</div><div class="gx-m"></div><div class="gx-f">— ${esc(g.from_name)} —</div><button class="gx-spinbtn">🎡 Quay quà may mắn</button>`;
   el.appendChild(st);st.querySelector('.gx-spinbtn').onclick=()=>wheel(el,g);requestAnimationFrame(()=>el.classList.add('show'));tune();petals(el,60);
   const m=st.querySelector('.gx-m'),txt=g.message||'';let i=0;setTimeout(function ty(){m.textContent=txt.slice(0,++i);if(i<txt.length)setTimeout(ty,txt[i-1]=='\n'?260:38);else el.classList.add('done')},2200);
   const loop=setInterval(()=>{if(!document.body.contains(el))return clearInterval(loop);petals(el,8);sparks(el,Math.random()*innerWidth,Math.random()*innerHeight*.6,10)},2500);
  },1100)};
 box.onclick=go;box.onkeydown=e=>{if(e.key=='Enter'||e.key==' ')go()};}
/* Vòng quay may mắn sau lời chúc */
const PRIZES=[{e:'🧋',n:'Trà sữa size L full topping',s:'Trà sữa'},{e:'👑',n:'Danh hiệu "Nữ hoàng Thép phủ" 7 ngày',s:'Nữ hoàng'},{e:'🍻',n:'Một buổi nhậu, bạn chọn quán',s:'Buổi nhậu'},{e:'🍢',n:'Món ăn vặt tuỳ chọn',s:'Ăn vặt'},{e:'🍀',n:'Quay lại',s:'Quay lại'}];
const SPINS=2;
function wheel(el,g){if(el.querySelector('.gw'))return;const key='gx-spin-'+g.id;let st;try{st=JSON.parse(localStorage.getItem(key))||{n:0,won:[],turn:0}}catch(e){st={n:0,won:[],turn:0}}
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(st))}catch(e){}};
 const w=document.createElement('div');w.className='gw';
 w.innerHTML=`<h3>Vòng quay may mắn</h3><div class="gw-wrap"><div class="gw-pin"></div><div class="gw-wheel">${PRIZES.map((p,i)=>`<span style="transform:rotate(${i*72+36-90}deg)"><em>${p.e}</em>${p.s}</span>`).join('')}</div><button class="gw-hub">QUAY</button></div><div class="gw-msg"></div><div class="gw-left"></div>`;
 el.appendChild(w);const wh=w.querySelector('.gw-wheel'),hub=w.querySelector('.gw-hub'),msg=w.querySelector('.gw-msg'),left=w.querySelector('.gw-left');let rot=0;
 const code=i=>'HH-'+String(g.id).padStart(2,'0')+'-'+(['TS','NH','NHAU','AV'][i])+'-'+(1000+((g.id*37+i*91)%9000));
 const show=()=>{left.textContent=st.n>=SPINS?'Đã hết lượt quay. Chụp màn hình gửi người tặng để đổi quà nhé!':`Còn ${SPINS-st.n} lượt quay`;hub.disabled=st.n>=SPINS;
  if(st.won.length)msg.innerHTML='Quà đã trúng:<br>'+st.won.map(i=>`${PRIZES[i].e} <b>${PRIZES[i].n}</b><br><span class="gw-code">${code(i)}</span>`).join('<br>')};
 show();
 hub.onclick=()=>{if(st.n>=SPINS||hub.disabled)return;hub.disabled=true;msg.textContent='Đang quay…';
  // Lượt đầu tiên thường rơi vào "Quay lại" cho vui; sau đó ra quà thật chưa trúng
  let idx;if(st.turn==0&&Math.random()<.7)idx=4;else{const pool=[0,1,2,3].filter(i=>!st.won.includes(i));idx=pool[Math.floor(Math.random()*pool.length)]}
  st.turn++;const target=360-(idx*72+36)+(Math.random()*40-20);rot+=360*6+((target-rot%360)+360)%360;wh.style.transform=`rotate(${rot}deg)`;
  let t=0;const tick=setInterval(()=>{bell(900+Math.random()*200,0,.08,.04);if(++t>30)clearInterval(tick)},120+Math.random()*20);
  setTimeout(()=>{clearInterval(tick);const r=wh.getBoundingClientRect();
   if(idx==4){msg.innerHTML='🍀 <b>Quay lại!</b><br>Hôm nay may mắn quá nên được quay thêm, không mất lượt 😄';hub.disabled=false;save();return}
   st.n++;st.won.push(idx);save();jingle();sparks(el,r.left+r.width/2,r.top+r.height/2,50);petals(el,30);show();
   msg.innerHTML=`Chúc mừng! Bạn trúng<br>${PRIZES[idx].e} <b>${PRIZES[idx].n}</b><br><span class="gw-code">${code(idx)}</span>`+(st.won.length>1?'<br><small>Tất cả quà: '+st.won.map(i=>PRIZES[i].e).join(' ')+'</small>':'')},5400)}}
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
let busy=false;
async function check(){const USER=window.__ss&&window.__ss.USER,SB=window.__ss&&window.__ss.SB;if(busy||!USER||!SB)return;busy=true;try{
 const prev=new URLSearchParams(location.search).get('gift');
 let q=SB.from('greetings').select('*');q=prev?q.eq('id',+prev):q.order('show_on',{ascending:false});
 const T=today(),until=x=>x.show_until||x.show_on;
 let {data}=await q.limit(30);data=(data||[]).filter(x=>prev||until(x)>=T);const me=(USER.email||'').toLowerCase();
 // của mình & đúng ngày; admin xem trước được lời chúc sắp tới của người khác (chỉ hiện nút, không tự mở)
 let g=(data||[]).find(x=>x.to_email.toLowerCase()==me&&x.show_on<=T&&until(x)>=T)||(prev&&data&&data[0]);
 // Admin (người tạo lời chúc) trải nghiệm y như người nhận: tự bật hộp quà, có nút 🎁 và vòng quay
 if(!g&&!window.__ss.PROF&&(check.w=(check.w||0)+1)<8){busy=false;setTimeout(check,1500);return}
 if(!g&&window.__ss.PROF&&window.__ss.PROF.is_admin)g=(data||[]).find(x=>x.to_email.toLowerCase()!=me);
 if(!g){const pv=(data||[]).find(x=>x.to_email.toLowerCase()!=me);if(pv&&!document.querySelector('.gx-replay')){if(!document.getElementById('gx-css')){const st=document.createElement('style');st.id='gx-css';st.textContent=css;document.head.appendChild(st)}const b=document.createElement('button');b.className='gx-replay';b.title='Xem trước quà cho '+pv.to_email;b.setAttribute('aria-label',b.title);b.textContent='🎁';b.onclick=()=>open(pv);document.body.appendChild(b)}return}
 const k='gx-seen-'+g.id+'-'+T;let seen=false;try{seen=localStorage.getItem(k)}catch(e){}
 if(!document.querySelector('.gx-replay')){const b=document.createElement('button');b.className='gx-replay';b.setAttribute('aria-label','Mở lại quà sinh nhật');b.textContent='🎁';b.onclick=()=>open(g);
  if(!document.getElementById('gx-css')){const st=document.createElement('style');st.id='gx-css';st.textContent=css;document.head.appendChild(st)}document.body.appendChild(b)}
 if(!seen||prev){try{localStorage.setItem(k,'1')}catch(e){}open(g)}
}catch(e){console.warn('greet',e)}finally{busy=false}}
window.greetCheck=check;
let tries=0;const t=setInterval(()=>{if(window.__ss&&window.__ss.USER){clearInterval(t);check()}else if(++tries>40)clearInterval(t)},700);
})();
