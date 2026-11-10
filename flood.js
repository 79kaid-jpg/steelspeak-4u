/* ===================== GAME NƯỚC DÂNG =====================
 Thách đấu 1-1 thời gian thực. Người mời (chủ phòng) tạo 10 câu từ bài đang học, gửi lời mời.
 Diễn biến từng câu đi qua kênh Supabase Realtime broadcast 'flood-<id>'; chủ phòng là trọng tài:
 mỗi câu ai ĐÚNG và NHANH hơn thắng; người thua câu (hoặc sai) bị nước dâng 1 nấc. Hết 5 nấc hơi = thua.
 Đấu với Kaka (máy) chạy ngay trong máy, không cần người kia online. Cần supabase/flood.sql. */
(function(){
if(window._floodJs)return;window._floodJs=1;
const AIR=5,NQ=10,TLIM=15000;
const F={v:'pick',m:null,me:null,op:null,q:[],i:-1,air:{a:AIR,b:AIR},ans:{},shown:0,pick:null,res:null,ch:null,timer:0,host:false,bot:false,targets:null,inv:null,off:false,err:''};
window.FLD=F;
const esc2=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>(typeof USER!='undefined'&&USER)?USER.id:null;
const rr=()=>{if(S.tab=='flood')render()};
const needSql=e=>/flood_|does not exist|schema cache/i.test(e?.message||'');
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};

/* ---------- câu hỏi: AI chọn từ bài đang học, đổi kiểu ngẫu nhiên ---------- */
function makeQ(){const T=((typeof TERMS!='undefined'&&TERMS)||[]).filter(t=>t&&t.en&&t.vi);if(T.length<4)return [];
 const pool=shuf(T).slice(0,NQ),out=[];
 for(const t of pool){const others=shuf(T.filter(x=>x.en!==t.en&&x.vi!==t.vi)).slice(0,3);if(others.length<3)continue;
  const kinds=['mean','rev','listen'];const ex=String(t.ex||'');const re=new RegExp('\\b'+t.en.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i');if(ex&&re.test(ex)&&ex.length<140)kinds.push('fill');
  const k=kinds[Math.random()*kinds.length|0];let q,o;
  if(k=='mean'){q=`“${t.en}” nghĩa là gì?`;o=[t.vi,...others.map(x=>x.vi)]}
  else if(k=='rev'){q=`Từ tiếng Anh của “${t.vi}”?`;o=[t.en,...others.map(x=>x.en)]}
  else if(k=='listen'){q='Nghe và chọn từ đúng';o=[t.en,...others.map(x=>x.en)]}
  else {q=ex.replace(re,'_____');o=[t.en,...others.map(x=>x.en)]}
  const opts=shuf(o.map((x,j)=>({x,ok:j==0})));out.push({k,q,say:k=='listen'?t.en:'',o:opts.map(z=>z.x),a:opts.findIndex(z=>z.ok)})}
 return out}
const KL={mean:'NGHĨA TỪ',rev:'TỪ TIẾNG ANH',listen:'NGHE CHỌN TỪ',fill:'ĐIỀN TỪ'};

/* ---------- âm thanh: nhạc nền dưới nước (tự tạo bằng WebAudio, không dùng file) + hiệu ứng ----------
 Nhạc nền: bass nhịp tim + arpeggio "dưới nước"; nước càng cao nhạc càng nhanh và căng. Tắt/bật bằng nút loa. */
const SND={on:(()=>{try{return localStorage.getItem('fl-snd')!=='0'}catch(e){return true}})(),ac:null,bus:null,timer:0,step:0,next:0};
function ac(){if(!SND.ac){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;SND.ac=new A();SND.bus=SND.ac.createGain();SND.bus.gain.value=.55;
  const lp=SND.ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2200;SND.bus.connect(lp).connect(SND.ac.destination);SND.lp=lp}
 if(SND.ac.state=='suspended')SND.ac.resume();return SND.ac}
function tone(f,t,d,{type='sine',g=.2,to=null,at=.005}={}){const a=ac();if(!a||!SND.on)return;const o=a.createOscillator(),v=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);
 v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g,t+at);v.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(v).connect(SND.bus);o.start(t);o.stop(t+d+.05)}
function noise(t,d,{g=.25,f=900,q=.8,to=null}={}){const a=ac();if(!a||!SND.on)return;const n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),x=b.getChannelData(0);for(let i=0;i<n;i++)x[i]=Math.random()*2-1;
 const s=a.createBufferSource(),fl=a.createBiquadFilter(),v=a.createGain();s.buffer=b;fl.type='bandpass';fl.frequency.setValueAtTime(f,t);if(to)fl.frequency.exponentialRampToValueAtTime(to,t+d);fl.Q.value=q;
 v.gain.setValueAtTime(g,t);v.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl).connect(v).connect(SND.bus);s.start(t)}
const sfx={
 q(){const t=ac()?.currentTime;if(t==null)return;tone(660,t,.12,{g:.12});tone(990,t+.08,.16,{g:.1})},
 tap(){const t=ac()?.currentTime;if(t==null)return;tone(520,t,.06,{type:'triangle',g:.12})},
 ok(){const t=ac()?.currentTime;if(t==null)return;[784,988,1319].forEach((f,i)=>tone(f,t+i*.07,.28,{type:'triangle',g:.16}))},
 bad(){const t=ac()?.currentTime;if(t==null)return;tone(196,t,.32,{type:'sawtooth',g:.09,to:130});tone(185,t+.02,.3,{type:'square',g:.05,to:120})},
 /* nước dâng: tiếng "ồ" trầm + bọt khí lục bục */
 splash(){const t=ac()?.currentTime;if(t==null)return;noise(t,.7,{g:.35,f:500,to:180,q:.6});for(let k=0;k<6;k++){const s=t+.15+k*.09+Math.random()*.05;tone(380+Math.random()*500,s,.09,{g:.07,to:900+Math.random()*600})}},
 win(){const t=ac()?.currentTime;if(t==null)return;[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,t+i*.12,i==5?.7:.2,{type:'triangle',g:.18}))},
 lose(){const t=ac()?.currentTime;if(t==null)return;tone(440,t,1.4,{type:'sine',g:.16,to:110});for(let k=0;k<10;k++)tone(300+Math.random()*700,t+.2+k*.12,.08,{g:.06,to:1200})},
 tick(){const t=ac()?.currentTime;if(t==null)return;tone(1400,t,.04,{type:'square',g:.04})}};
/* nhạc nền: 8 nhịp lặp, giọng thứ (A minor), tốc độ theo mực nước nguy hiểm nhất */
const BASS=[110,110,131,98, 110,110,147,123],ARP=[440,523,659,523, 494,587,659,587];
function music(on){clearInterval(SND.timer);if(!on||!SND.on)return;const a=ac();if(!a)return;SND.next=a.currentTime+.1;
 SND.timer=setInterval(()=>{if(!SND.on||!(F.v=='play'))return;const a=SND.ac;const danger=AIR-Math.min(F.air.a,F.air.b);const bpm=96+danger*14,beat=60/bpm/2;
  while(SND.next<a.currentTime+.25){const k=SND.step%8,t=SND.next;
   tone(BASS[k]*(danger>=3?1:1),t,beat*1.8,{type:'triangle',g:.13});
   if(k%2==0)noise(t,.05,{g:.05,f:2500});
   tone(ARP[(SND.step+ (danger>=2?3:0))%8]*(SND.step%16<8?1:1.122),t+beat*.5,beat*.9,{type:'sine',g:.045});
   if(danger>=4&&k%4==0)tone(55,t,beat*3,{type:'sine',g:.12}); /* nhịp tim khi sắp hết hơi */
   SND.step++;SND.next+=beat}},60)}
function sndToggle(){SND.on=!SND.on;try{localStorage.setItem('fl-snd',SND.on?'1':'0')}catch(e){}if(SND.on){ac();music(F.v=='play')}else music(false);rr()}

/* ---------- kênh realtime ---------- */
function join(id){leave();F.ch=SB.channel('flood-'+id,{config:{broadcast:{self:false,ack:false}}});
 F.ch.on('broadcast',{event:'m'},({payload})=>onMsg(payload)).subscribe();}
function leave(){try{F.ch&&SB.removeChannel(F.ch)}catch(e){}F.ch=null;clearTimeout(F.timer);clearInterval(F.hello)}
const send=p=>{try{F.ch&&F.ch.send({type:'broadcast',event:'m',payload:p})}catch(e){}};
const side=()=>F.host?'a':'b',other=()=>F.host?'b':'a';

function onMsg(p){if(!p||!F.m)return;
 if(p.t=='hello'&&F.host&&F.v=='wait'){F.v='play';rr();setTimeout(()=>next(),900)}
 else if(p.t=='decline'&&F.host){toast('Đối thủ từ chối lời mời');F.v='pick';leave();rr()}
 else if(p.t=='q'&&!F.host){clearInterval(F.hello);showQ(p.i)}
 else if(p.t=='ans'){F.ans[p.i]=F.ans[p.i]||{};F.ans[p.i][p.s]={ok:p.ok,ms:p.ms};if(p.i===F.i)F.opAns=true;if(F.host)judge(p.i);else rr()}
 else if(p.t=='res'&&!F.host){applyRes(p)}
 else if(p.t=='end'&&!F.host){F.air=p.air;finish(p.win)}
 else if(p.t=='bye'){if(F.v=='play'){F.air[other()]=0;finish(side())}}}

/* ---------- vòng câu hỏi ---------- */
function next(){if(!F.host)return;const i=F.i+1;
 if(i>=F.q.length||F.air.a<=0||F.air.b<=0){const w=F.air.a==F.air.b?null:(F.air.a>F.air.b?'a':'b');send({t:'end',air:F.air,win:w});return finish(w)}
 send({t:'q',i});showQ(i);
 if(F.bot){const ok=Math.random()<.7,ms=2200+Math.random()*5500;setTimeout(()=>{if(F.i!==i||F.v!='play')return;F.ans[i]=F.ans[i]||{};F.ans[i].b={ok,ms:Math.round(ms)};F.opAns=true;judge(i)},ms)}
 clearTimeout(F.timer);F.timer=setTimeout(()=>{F.ans[i]=F.ans[i]||{};for(const s of['a','b'])if(!F.ans[i][s])F.ans[i][s]={ok:false,ms:TLIM};judge(i)},TLIM+800)}
function showQ(i){if(i===0)music(true);sfx.q();F.i=i;F.pick=null;F.res=null;F.opAns=false;F.shown=performance.now();F.v='play';rr();const q=F.q[i];if(q&&q.say)setTimeout(()=>{try{say(q.say)}catch(e){}},250);tickClock()}
function tickClock(){clearInterval(F.clk);F.clk=setInterval(()=>{const el=document.getElementById('fl-clock');if(!el||F.res){clearInterval(F.clk);return}const left=Math.max(0,TLIM-(performance.now()-F.shown));const sec=Math.ceil(left/1000);if(sec<=5&&sec!==F.lastTick&&F.pick==null){F.lastTick=sec;sfx.tick()}el.textContent='0:'+String(sec).padStart(2,'0')},250)}
function answer(k){if(F.pick!=null||F.res||F.v!='play')return;if(performance.now()-F.shown<350)return;
 const q=F.q[F.i],ok=k===q.a,ms=Math.round(performance.now()-F.shown);F.pick=k;sfx.tap();
 F.ans[F.i]=F.ans[F.i]||{};F.ans[F.i][side()]={ok,ms};send({t:'ans',i:F.i,s:side(),ok,ms});
 try{navigator.vibrate&&navigator.vibrate(ok?15:[30,40,30])}catch(e){}
 if(F.host)judge(F.i);else rr()}
function judge(i){if(!F.host||i!==F.i||F.res)return;const A=F.ans[i]||{};if(!A.a||!A.b){rr();return}
 clearTimeout(F.timer);let lose=[],win=null;
 if(A.a.ok&&A.b.ok){win=A.a.ms<=A.b.ms?'a':'b';lose=[win=='a'?'b':'a']}
 else if(A.a.ok){win='a';lose=['b']}else if(A.b.ok){win='b';lose=['a']}else lose=['a','b'];
 lose.forEach(s=>F.air[s]=Math.max(0,F.air[s]-1));
 const p={t:'res',i,win,lose,air:{...F.air},A};send(p);applyRes(p)}
function applyRes(p){F.res=p;F.air=p.air;F.ans[p.i]=p.A;rr();{const me=side();if(p.win===me)sfx.ok();else sfx.bad();setTimeout(()=>sfx.splash(),350)}
 const mine=side(),lostMe=p.lose.includes(mine);try{navigator.vibrate&&lostMe&&navigator.vibrate([60,40,60])}catch(e){}
 if(F.host)setTimeout(()=>{if(F.v=='play')next()},2200)}
async function finish(w){clearTimeout(F.timer);clearInterval(F.clk);F.v='end';F.win=w;music(false);setTimeout(()=>{w===side()?sfx.win():w==null?sfx.ok():sfx.lose()},500);
 const me=side(),won=w===me,draw=w==null;const xp=won?30:draw?15:10;try{S.xp=(S.xp||0)+xp;window.tick&&tick();save()}catch(e){}F.xp=xp;
 if(F.host&&F.m&&F.m.id)try{await SB.rpc('flood_finish',{mid:F.m.id,a_left:F.air.a,b_left:F.air.b,win:w=='a'?F.m.a:w=='b'?F.m.b:null})}catch(e){}
 setTimeout(leave,1500);rr()}

/* ---------- mời / nhận lời ---------- */
async function loadTargets(){if(F.targets)return;const {data,error}=await SB.rpc('challenge_targets');F.targets=error?[]:(data||[]);
 try{const ids=F.targets.map(t=>t.user_id);const {data:P}=await SB.from('presence').select('user_id,last_seen').in('user_id',ids);const now=Date.now();(P||[]).forEach(p=>{const t=F.targets.find(x=>x.user_id==p.user_id);if(t)t.seen=new Date(p.last_seen).getTime()});F.targets.sort((x,y)=>(y.seen||0)-(x.seen||0))}catch(e){}rr()}
async function invite(target){try{ac()}catch(e){}if(!uid()){toast('Đăng nhập để chơi');return go('me')}
 const q=makeQ();if(q.length<5)return toast('Bài đang học chưa đủ từ, chọn khóa khác nhé');
 const topic=(window.curTrack&&curTrack()?.name)||'Bài đang học';
 const {data,error}=await SB.rpc('flood_invite',{target:target||null,q,topic});
 if(error){if(needSql(error)){F.off=true;rr();return}return toast(error.message)}
 if(target)try{lobby&&lobby.send({type:'broadcast',event:'inv',payload:{to:target,m:data,op:{user_id:uid(),name:(PROF&&PROF.full_name)||'Bạn bè'}}})}catch(e){}
 start(data,true,target?F.targets.find(t=>t.user_id==target):{name:'Kaka',bot:true})}
function start(m,host,op){F.m=m;F.host=host;F.bot=!m.b;F.q=m.q;F.i=-1;F.air={a:AIR,b:AIR};F.ans={};F.res=null;F.pick=null;F.win=undefined;
 F.me={name:(PROF&&PROF.full_name)||'Bạn',avatar:PROF&&PROF.avatar,id:uid()};F.op=op||{name:'Đối thủ'};
 if(F.bot){F.v='play';go('flood');setTimeout(next,900);return}
 join(m.id);
 if(host){F.v='wait';F.waitUntil=Date.now()+60000;go('flood');F.timer=setTimeout(()=>{if(F.v=='wait'){toast('Đối thủ chưa nhận lời');F.v='pick';leave();rr()}},60000);waitClock()}
 else{F.v='play';go('flood');F.hello=setInterval(()=>send({t:'hello'}),900);send({t:'hello'})}}
function waitClock(){const t=setInterval(()=>{const el=document.getElementById('fl-wait');if(!el||F.v!='wait'){clearInterval(t);return}el.textContent=Math.max(0,Math.ceil((F.waitUntil-Date.now())/1000))+' giây'},500)}
function cancel(){music(false);if(F.v=='play'&&!F.bot)send({t:'bye'});leave();F.v='pick';F.m=null;rr()}

/* lời mời đến: hộp thoại nổi trên mọi màn hình */
/* đường nhanh: lời mời tới thẳng qua kênh realtime (không chờ ghi DB) */
function fastInv(p){if(!p||p.to!==uid()||!p.m||p.m.status!=='invite')return;if(F.seenInv&&F.seenInv[p.m.id])return;(F.seenInv=F.seenInv||{})[p.m.id]=1;
 F.inv={m:p.m,op:p.op||{name:'Bạn bè'},until:Date.now()+60000};showInv();
 SB.rpc('flood_people',{mid:p.m.id}).then(({data})=>{const o=(data||[]).find(x=>x.user_id==p.m.a);if(o&&F.inv&&F.inv.m.id==p.m.id){F.inv.op=o;showInv()}}).catch(()=>{})}
async function incoming(n){if(n.kind!=='flood')return;const id=+n.body;if(!id)return;if(F.seenInv&&F.seenInv[id])return;(F.seenInv=F.seenInv||{})[id]=1;
 const {data}=await SB.from('flood_matches').select('*').eq('id',id).maybeSingle();if(!data||data.status!=='invite')return;
 const {data:pp}=await SB.rpc('flood_people',{mid:id});const op=(pp||[]).find(p=>p.user_id==data.a)||{name:'Bạn bè'};
 F.inv={m:data,op,until:Date.now()+60000};showInv()}
function showInv(){document.getElementById('fl-inv')?.remove();const I=F.inv;if(!I)return;
 const d=document.createElement('div');d.id='fl-inv';d.setAttribute('role','dialog');d.setAttribute('aria-label','Lời mời đấu Nước Dâng');
 d.innerHTML=`<div class="fl-inv-card"><div class="fl-inv-av">${window.avatarHTML?avatarHTML(I.op.avatar,I.op.user_id||I.op.name,64):''}</div><div style="flex:1;min-width:0"><b>${esc2(I.op.name)} mời bạn đấu Nước Dâng</b><small>${esc2(I.m.topic||'')} · ${(I.m.q||[]).length} câu · ai chậm bị nước dâng</small></div></div>
 <div class="fl-inv-act"><button class="btn ghost" onclick="FLX.respond(false)">Để sau</button><button class="btn" onclick="FLX.respond(true)">Nhận lời</button></div>`;
 document.body.appendChild(d);try{navigator.vibrate&&navigator.vibrate([80,60,80])}catch(e){}
 setTimeout(()=>{if(F.inv===I){F.inv=null;d.remove()}},Math.max(0,I.until-Date.now()))}
async function respond(ok){if(ok)try{ac()}catch(e){}const I=F.inv;F.inv=null;document.getElementById('fl-inv')?.remove();if(!I)return;
 const {data,error}=await SB.rpc('flood_respond',{mid:I.m.id,accept:ok});
 if(!ok){if(F.ch==null){join(I.m.id);setTimeout(()=>{send({t:'decline'});leave()},700)}return}
 if(error)return toast(error.message);start(data||I.m,false,I.op)}
/* phòng chờ chung: biết ai đang mở app (Realtime Presence, tức thì) + nhận lời mời nhanh */
let lobby=null;F.online=new Set();
function joinLobby(){if(lobby||!uid()||!window.SB)return;
 lobby=SB.channel('ss-lobby',{config:{presence:{key:uid()},broadcast:{self:false}}});
 lobby.on('presence',{event:'sync'},()=>{try{F.online=new Set(Object.keys(lobby.presenceState()))}catch(e){}if(F.v=='pick')rr()})
  .on('broadcast',{event:'inv'},({payload})=>fastInv(payload))
  .subscribe(st=>{if(st==='SUBSCRIBED')lobby.track({at:Date.now()}).catch(()=>{})});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&lobby)lobby.track({at:Date.now()}).catch(()=>{})})}
let sub=null;function listen(){joinLobby();if(sub||!uid()||!window.SB)return;
 sub=SB.channel('fl-inv-'+uid()).on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:'to_id=eq.'+uid()},p=>incoming(p.new)).subscribe();
 /* lời mời gửi tới lúc chưa mở app (trong 1 phút gần nhất) */
 SB.from('flood_matches').select('*').eq('b',uid()).eq('status','invite').gte('created_at',new Date(Date.now()-60000).toISOString()).order('id',{ascending:false}).limit(1).then(({data})=>{if(data&&data[0])incoming({kind:'flood',body:String(data[0].id)})}).catch(()=>{})}
setInterval(listen,3000);

/* ---------- giao diện ---------- */
const css=`#fl-inv{position:fixed;left:12px;right:12px;top:calc(12px + env(safe-area-inset-top,0px));z-index:2147483100;max-width:460px;margin:0 auto;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:12px;box-shadow:0 14px 40px rgba(0,0,0,.35);display:flex;flex-direction:column;gap:10px;animation:flin .3s both}
@keyframes flin{from{transform:translateY(-30px);opacity:0}}
.fl-inv-card{display:flex;gap:12px;align-items:center}.fl-inv-card small{display:block;color:var(--mut);font-size:.82rem}.fl-inv-act{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.fl-top{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:3px;height:min(44vh,360px);margin:-12px -16px 0;background:#0e151c}
.fl-side{position:relative;overflow:hidden;background:#1b3f61}
.fl-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:saturate(1.1)}
.fl-av{position:absolute;left:50%;top:30%;transform:translate(-50%,-50%)}.fl-av .av-img,.fl-av .av-wrap{border:3px solid rgba(255,255,255,.85);border-radius:50%;box-shadow:0 6px 18px rgba(0,0,0,.35)}
.fl-water{position:absolute;left:0;right:0;bottom:0;transition:height .7s cubic-bezier(.2,.8,.2,1);background:linear-gradient(180deg,rgba(64,170,230,.74),rgba(16,78,146,.93))}
.fl-water svg{position:absolute;left:0;top:-13px;width:200%;height:14px;animation:flw 3s linear infinite}
.fl-water i{position:absolute;bottom:6px;width:8px;height:8px;border-radius:50%;border:2px solid rgba(255,255,255,.75);animation:flb 2.6s ease-in infinite}
@keyframes flw{to{transform:translateX(-50%)}}@keyframes flb{0%{transform:translateY(0);opacity:0}20%{opacity:.9}100%{transform:translateY(-110px);opacity:0}}
.fl-name{position:absolute;top:10px;display:flex;flex-direction:column;gap:3px;color:#fff;font:700 1rem var(--fd);text-shadow:0 1px 3px rgba(0,0,0,.6)}
.fl-pill{font:600 .74rem var(--fd);padding:2px 8px;border-radius:99px;background:rgba(0,0,0,.5);text-shadow:none;align-self:flex-start}
.fl-badge{position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:2;padding:4px 12px;border-radius:99px;background:#e39b1a;color:#14212e;font:800 .86rem var(--fd);white-space:nowrap}
.fl-hit{animation:flhit .5s}@keyframes flhit{30%{transform:translateX(-5px)}60%{transform:translateX(5px)}}
.fl-q{margin:0 -16px;padding:16px;border-radius:18px 18px 0 0;background:var(--card);margin-top:-12px;position:relative;z-index:2;display:flex;flex-direction:column;gap:12px}
.fl-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px}.fl-opts button{min-height:64px;border-radius:12px;border:2px solid var(--line);background:var(--soft);color:var(--ink);font:600 1rem var(--fb,inherit);padding:8px;cursor:pointer}
.fl-opts .ok{border-color:var(--good);background:color-mix(in srgb,var(--good) 16%,var(--card))}.fl-opts .no{border-color:var(--bad);background:color-mix(in srgb,var(--bad) 14%,var(--card))}
@media (prefers-reduced-motion:reduce){.fl-water svg,.fl-water i,#fl-inv{animation:none}.fl-water{transition:none}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

function sideHTML(p,s,dir){const air=F.air[s],h=Math.round(16+(AIR-air)*(84/AIR));const img=p&&p.avatar&&/^data:image\//.test(p.avatar);
 const dots='●'.repeat(air)+'○'.repeat(AIR-air);const hit=F.res&&F.res.lose.includes(s);
 return `<div class="fl-side ${hit?'fl-hit':''}">${img?`<div class="fl-bg" style="background-image:url('${p.avatar.replace(/'/g,'%27')}')"></div>`:`<div class="fl-av">${window.avatarHTML?avatarHTML(p&&p.avatar,(p&&(p.user_id||p.id||p.name))||s,110):''}</div>`}
 <div class="fl-water" style="height:${h}%"><svg viewBox="0 0 400 14" preserveAspectRatio="none" aria-hidden="true"><path d="M0 7 Q25 0 50 7 T100 7 T150 7 T200 7 T250 7 T300 7 T350 7 T400 7 V14 H0Z" fill="rgba(64,170,230,.74)"/></svg><i style="left:30%"></i><i style="left:64%;animation-delay:1s"></i></div>
 <div class="fl-name" style="${dir=='r'?'right:10px;align-items:flex-end':'left:10px'}"><span>${esc2(p&&p.name||'')}</span><span class="fl-pill" style="${dir=='r'?'align-self:flex-end':''}" aria-label="Còn ${air} trên ${AIR} hơi">Hơi ${dots}</span>${s==other()&&F.v=='play'&&!F.res?`<span class="fl-pill">${F.opAns?'đã trả lời':'đang suy nghĩ…'}</span>`:''}</div></div>`}
function top(){const me=side(),A=me=='a'?F.me:F.op,B=me=='a'?F.op:F.me;
 /* luôn để mình bên trái */
 return `<div class="fl-top">${sideHTML(F.me,me,'l')}${sideHTML(F.op,other(),'r')}<span class="fl-badge">CÂU ${Math.min(F.q.length,F.i+1)}/${F.q.length} · <span id="fl-clock">0:15</span></span></div>`}

function vFlood(){
 if(F.off)return `<button class="link" onclick="go('duel')">‹ Thách đấu</button><h1>Nước Dâng</h1><div class="note">Admin cần chạy <b>supabase/flood.sql</b> trên Supabase để mở game này.</div>`;
 if(F.v=='pick'){loadTargets();const now=Date.now();
  return `<button class="link" onclick="go('duel')">‹ Thách đấu</button>
  <div class="card" style="margin-top:8px;color:#fff;border:0;background:repeating-linear-gradient(100deg,#1b3f61 0 14px,#214b72 14px 28px)"><div class="lbl" style="color:#dbe6f0">GAME · 1 ĐẤU 1</div><h1 style="margin:2px 0;color:#fff">Nước Dâng</h1><p style="margin:0;color:#dbe6f0;font-size:.92rem">Trả lời nhanh và đúng hơn bạn đấu. Ai chậm hay sai bị nước dâng lên, hết ${AIR} nấc hơi là thua. ${NQ} câu lấy từ bài bạn đang học.</p></div>
  <div class="sec-h"><h2>Chọn đối thủ</h2></div><div class="stack">
  <button class="card row" style="flex-wrap:nowrap;gap:12px;text-align:left;width:100%" onclick="FLX.invite(null)"><span class="tile2-ic">🤖</span><span style="flex:1"><b>Kaka (máy)</b><small class="mut" style="display:block">Luôn sẵn sàng · đúng khoảng 70%</small></span><span class="chip">Đấu ngay</span></button>
  ${F.targets==null?'<p class="mut">Đang tải bạn bè…</p>':F.targets.length?F.targets.map(t=>{const on=F.online.has(t.user_id)||(t.seen&&now-t.seen<120000);return `<button class="card row" style="flex-wrap:nowrap;gap:12px;text-align:left;width:100%" onclick="FLX.invite('${t.user_id}')">${window.avatarHTML?avatarHTML(t.avatar,t.user_id,44):''}<span style="flex:1;min-width:0"><b>${esc2(t.name)}</b><small style="display:block;color:${on?'var(--good)':'var(--mut)'}">${on?'● Đang online':'Không online · có thể không kịp nhận lời'}</small></span><span class="chip">Mời</span></button>`}).join(''):'<p class="mut">Chưa có bạn bè. Kết bạn trong mục Thách đấu để mời nhé.</p>'}</div>`}
 if(F.v=='wait')return `<div style="text-align:center;padding-top:40px"><div style="display:inline-block">${window.avatarHTML?avatarHTML(F.op.avatar,F.op.user_id||F.op.name,96):''}</div><h1>Đang chờ ${esc2(F.op.name)}…</h1><p class="mut">Lời mời còn hiệu lực <b id="fl-wait">60 giây</b>. Khi đối thủ nhận lời, trận đấu bắt đầu ngay.</p><button class="btn ghost" onclick="FLX.cancel()">Hủy lời mời</button></div>`;
 if(F.v=='end'){const me=side(),won=F.win===me,draw=F.win==null;const myOk=Object.values(F.ans).filter(a=>a&&a[me]&&a[me].ok).length,n=Object.keys(F.ans).length;
  const msA=Object.values(F.ans).map(a=>a&&a[me]).filter(x=>x&&x.ok).map(x=>x.ms);const avg=msA.length?(msA.reduce((a,b)=>a+b,0)/msA.length/1000).toFixed(1).replace('.',','):'–';
  const wrong=F.q.filter((q,i)=>F.ans[i]&&F.ans[i][me]&&!F.ans[i][me].ok).slice(0,4);
  return `${top()}<div class="fl-q"><div class="lbl" style="text-align:center">KẾT QUẢ</div><h1 style="margin:0;text-align:center">${draw?'Hòa!':won?'Bạn thắng!':esc2(F.op.name)+' thắng'}</h1>
  <p class="mut" style="margin:0;text-align:center">${draw?'Hai bạn còn số hơi bằng nhau.':won?esc2(F.op.name)+' đã hết hơi.':'Bạn đã hết hơi. Phục thù nhé!'}</p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center"><div class="card" style="padding:10px"><b style="font:800 1.4rem var(--fd);color:var(--good)">${myOk}/${n}</b><small class="mut" style="display:block">câu đúng</small></div><div class="card" style="padding:10px"><b style="font:800 1.4rem var(--fd)">${avg}s</b><small class="mut" style="display:block">trung bình</small></div><div class="card" style="padding:10px"><b style="font:800 1.4rem var(--fd);color:var(--warn)">+${F.xp} XP</b><small class="mut" style="display:block">${won?'thắng':draw?'hòa':'tham gia'}</small></div></div>
  ${wrong.length?`<div class="card stack" style="gap:6px;padding:12px"><b>Ôn lại câu bạn trả lời sai</b>${wrong.map(q=>`<span class="mut">${esc2(q.q)} → <b style="color:var(--ink)">${esc2(q.o[q.a])}</b></span>`).join('')}</div>`:''}
  <button class="btn" onclick="FLX.again()">${F.bot?'Đấu lại với Kaka':'Phục thù · mời lại'}</button><button class="btn ghost" onclick="FLX.cancel()">Chọn đối thủ khác</button></div>`}
 /* đang chơi */
 const q=F.q[F.i];
 if(!q)return `${top()}<div class="fl-q"><h2 style="text-align:center;margin:20px 0">${F.host||F.bot?'Chuẩn bị…':'Đang kết nối với '+esc2(F.op.name)+'…'}</h2><button class="btn ghost" onclick="FLX.cancel()">Rời trận</button></div>`;
 const R=F.res;const me=side();
 const fb=R?(R.lose.length==2?'Cả hai đều sai, cùng dâng nước!':R.win===me?`✓ Bạn thắng câu này${R.A[other()]&&R.A[other()].ok?` · nhanh hơn ${((R.A[other()].ms-R.A[me].ms)/1000).toFixed(1).replace('.',',')} giây`:''}`:(R.A[me]&&R.A[me].ok?`${esc2(F.op.name)} nhanh hơn ${((R.A[me].ms-R.A[other()].ms)/1000).toFixed(1).replace('.',',')} giây`:'✗ Sai rồi, nước bên bạn dâng lên')):(F.pick!=null?'Đã chọn · chờ đối thủ…':'');
 return `${top()}<div class="fl-q"><div class="row" style="justify-content:space-between"><span class="lbl">${KL[q.k]||''}</span><span class="row" style="gap:6px;flex-wrap:nowrap"><button class="ic" onclick="FLX.snd()" aria-label="${SND.on?'Tắt':'Bật'} nhạc" aria-pressed="${SND.on}">${SND.on?'🔊':'🔇'}</button><button class="link" style="font-size:.85rem" onclick="FLX.cancel()">Rời trận</button></span></div>
 <h2 style="margin:0;font-size:1.45rem;line-height:1.25;text-wrap:balance">${esc2(q.q)}</h2>${q.say?`<button class="chip" style="align-self:flex-start" onclick="say(${esc2(JSON.stringify(q.say))})">🔊 Nghe lại</button>`:''}
 <div class="fl-opts">${q.o.map((o,k)=>{const cls=R?(k===q.a?'ok':k===F.pick?'no':''):(k===F.pick?'ok':'');return `<button class="${cls}" ${F.pick!=null||R?'disabled':''} onclick="FLX.answer(${k})">${esc2(o)}</button>`}).join('')}</div>
 <div role="status" style="min-height:44px;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:600;color:${R&&R.win===me?'var(--good)':R?'var(--bad)':'var(--mut)'}">${fb}</div></div>`}
function again(){const op=F.op,b=F.m&&F.m.b;F.v='pick';invite(F.bot?null:(F.host?b:F.m.a)).then(()=>{})}
window.vFlood=vFlood;window.FLX={snd:sndToggle,invite,answer,cancel,respond,again};
/* thẻ vào game ở trang Thách đấu */
window.floodCard=()=>`<button class="card login-nudge" onclick="FLD.v='pick';go('flood')" style="background:linear-gradient(140deg,#1e88e5,#0b3b6e);color:#fff;border:0"><span class="tile2-ic" style="background:rgba(255,255,255,.2)">🌊</span><span style="flex:1;text-align:left"><b style="color:#fff">Nước Dâng · đấu 1-1</b><small style="color:#dbe6f0">Ai chậm bị nước dâng · realtime</small></span><span class="chev" style="color:#fff">›</span></button>`;
})();
