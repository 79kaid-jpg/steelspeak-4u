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
   st.innerHTML=`<div class="gx-ring">${g.image?`<img src="${g.image}" alt="">`:''}${tas}</div><div class="gx-t">${esc(g.title)}</div><div class="gx-n">${esc(g.name||'')}</div><div class="gx-m"></div><div class="gx-f">— ${esc(g.from_name)} —</div>`;
   el.appendChild(st);requestAnimationFrame(()=>el.classList.add('show'));tune();petals(el,60);
   const m=st.querySelector('.gx-m'),txt=g.message||'';let i=0;setTimeout(function ty(){m.textContent=txt.slice(0,++i);if(i<txt.length)setTimeout(ty,txt[i-1]=='\n'?260:38);else el.classList.add('done')},2200);
   const loop=setInterval(()=>{if(!document.body.contains(el))return clearInterval(loop);petals(el,8);sparks(el,Math.random()*innerWidth,Math.random()*innerHeight*.6,10)},2500);
  },1100)};
 box.onclick=go;box.onkeydown=e=>{if(e.key=='Enter'||e.key==' ')go()};}
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
let busy=false;
async function check(){const USER=window.__ss&&window.__ss.USER,SB=window.__ss&&window.__ss.SB;if(busy||!USER||!SB)return;busy=true;try{
 const prev=new URLSearchParams(location.search).get('gift');
 let q=SB.from('greetings').select('*');q=prev?q.eq('id',+prev):q.order('show_on',{ascending:false});
 const T=today(),until=x=>x.show_until||x.show_on;
 let {data}=await q.limit(30);data=(data||[]).filter(x=>prev||until(x)>=T);const me=(USER.email||'').toLowerCase();
 // của mình & đúng ngày; admin xem trước được lời chúc sắp tới của người khác (chỉ hiện nút, không tự mở)
 let g=(data||[]).find(x=>x.to_email.toLowerCase()==me&&x.show_on<=T&&until(x)>=T)||(prev&&data&&data[0]);
 if(!g){const pv=(data||[]).find(x=>x.to_email.toLowerCase()!=me);if(pv&&!document.querySelector('.gx-replay')){if(!document.getElementById('gx-css')){const st=document.createElement('style');st.id='gx-css';st.textContent=css;document.head.appendChild(st)}const b=document.createElement('button');b.className='gx-replay';b.title='Xem trước quà cho '+pv.to_email;b.setAttribute('aria-label',b.title);b.textContent='🎁';b.onclick=()=>open(pv);document.body.appendChild(b)}return}
 const k='gx-seen-'+g.id+'-'+T;let seen=false;try{seen=localStorage.getItem(k)}catch(e){}
 if(!document.querySelector('.gx-replay')){const b=document.createElement('button');b.className='gx-replay';b.setAttribute('aria-label','Mở lại quà sinh nhật');b.textContent='🎁';b.onclick=()=>open(g);
  if(!document.getElementById('gx-css')){const st=document.createElement('style');st.id='gx-css';st.textContent=css;document.head.appendChild(st)}document.body.appendChild(b)}
 if(!seen||prev){try{localStorage.setItem(k,'1')}catch(e){}open(g)}
}catch(e){console.warn('greet',e)}finally{busy=false}}
window.greetCheck=check;
let tries=0;const t=setInterval(()=>{if(window.__ss&&window.__ss.USER){clearInterval(t);check()}else if(++tries>40)clearInterval(t)},700);
})();
