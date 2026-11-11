/* ===================== GAME NƯỚC DÂNG =====================
 Thách đấu 1-1 thời gian thực. Người mời (chủ phòng) tạo 10 câu từ bài đang học, gửi lời mời.
 Diễn biến từng câu đi qua kênh Supabase Realtime broadcast 'flood-<id>'; chủ phòng là trọng tài:
 mỗi câu ai ĐÚNG và NHANH hơn thắng; người thua câu (hoặc sai) bị nước dâng 1 nấc. Hết 5 nấc hơi = thua.
 Đấu với Kaka (máy) chạy ngay trong máy, không cần người kia online. Cần supabase/flood.sql. */
(function(){
if(window._floodJs)return;window._floodJs=1;
const AIR=10,NQ=10,TLIM=15000,TPRON=20000;/* mỗi bên 10 câu → trận 20 câu */
const F={v:'pick',m:null,me:null,op:null,q:[],i:-1,air:{a:AIR,b:AIR},ans:{},shown:0,pick:null,res:null,ch:null,timer:0,host:false,bot:false,targets:null,inv:null,off:false,err:''};
window.FLD=F;
const esc2=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>(typeof USER!='undefined'&&USER)?USER.id:null;
const rr=()=>{if(S.tab=='flood')render()};
const needSql=e=>/flood_|does not exist|schema cache/i.test(e?.message||'');
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};

/* ---------- câu hỏi: AI chọn từ bài đang học, đổi kiểu ngẫu nhiên ---------- */
/* chủ đề = nhóm từ (cat) trong bài đang học */
/* ===== khóa học & chủ đề: chỉ các khóa ĐỐI THỦ đã đăng ký (STEEL, CEFR, IELTS…) ===== */
const CRS={};/* target → [{id,slug,name,kind,cats,mine}] */
async function courses(target){const k=target||'me';if(CRS[k])return CRS[k];
 const {data,error}=await SB.rpc('flood_courses',{target:target||null});
 if(error){if(needSql(error)){CRS[k]=null;F.needCourses=true}else CRS[k]=[];return CRS[k]||[]}
 return CRS[k]=data||[]}
const WRD={};async function wordsOf(c,target){const k=c.id+'|'+(target||'me');if(WRD[k])return WRD[k];
 let W=[];try{const {data}=await SB.rpc('flood_words',{track:c.id,target:target||null,lim:300});W=(data||[]).map(w=>({cat:w.cat||'misc',en:w.term,vi:w.meaning_vi,ex:w.example||'',exvi:w.example_vi||''}))}catch(e){}
 if(!W.length&&c.slug=='steel'&&typeof STEEL_TERMS!='undefined')W=STEEL_TERMS;
 return WRD[k]=W.filter(t=>t&&t.en&&t.vi)}
function topics(W,c){W=W||[];const m={};W.forEach(t=>{(m[t.cat]=m[t.cat]||[]).push(t)});const cats=(c&&c.cats)||{};
 const nm=x=>cats[x]||(typeof CATS!='undefined'&&CATS[x]&&CATS[x].n)||x;return [{id:'*',n:'Cả khóa',c:W.length},...Object.keys(m).filter(x=>m[x].length>=4).map(x=>({id:x,n:nm(x),c:m[x].length}))]}
/* 10 câu từ 1 chủ đề, đủ các kiểu: nghĩa, điền từ, nghe, từ tiếng Anh, phát âm (AI chấm) */
function makeQ(cat,n,W){n=n||NQ;const ALL=(W||((typeof TERMS!='undefined'&&TERMS)||[])).filter(t=>t&&t.en&&t.vi);let T=cat&&cat!='*'?ALL.filter(t=>t.cat==cat):ALL;if(T.length<4)T=ALL;if(ALL.length<4)return [];
 const fillOf=t=>{const ex=String(t.ex||'');if(!ex||ex.length>160)return null;const i=ex.toLowerCase().indexOf(String(t.en).toLowerCase());if(i<0)return null;return ex.slice(0,i)+'_____'+ex.slice(i+t.en.length)};
 const pool=shuf(T),withFill=pool.filter(fillOf),order=['mean','fill','listen','pron','rev','fill','mean','pron','listen','fill'];
 const used=new Set(),out=[];
 for(let j=0;j<n;j++){let k=order[j%order.length];let t;
  if(k=='fill'){t=withFill.find(x=>!used.has(x.en));if(!t)k='mean'}
  if(!t)t=pool.find(x=>!used.has(x.en))||pool[j%pool.length];used.add(t.en);
  const others=shuf(ALL.filter(x=>x.en!==t.en&&x.vi!==t.vi)).slice(0,3);let q,o;
  if(k=='pron'){const tg=String(t.en).replace(/\s*\([^)]*\)/g,'').trim()||t.en;out.push({k,q:tg,vi:t.vi,say:'',target:tg,o:[],a:-1});continue}
  if(k=='mean'){q=`“${t.en}” nghĩa là gì?`;o=[t.vi,...others.map(x=>x.vi)]}
  else if(k=='rev'){q=`Từ tiếng Anh của “${String(t.vi).replace(/\s*\([^)]*[A-Za-z]{2,}[^)]*\)/g,'').trim()||t.vi}”?`;o=[t.en,...others.map(x=>x.en)]}
  else if(k=='listen'){q='Nghe và chọn từ đúng';o=[t.en,...others.map(x=>x.en)]}
  else {q=fillOf(t);o=[t.en,...others.map(x=>x.en)]}
  const opts=shuf(o.map((x,z)=>({x,ok:z==0})));out.push({k,q,say:k=='listen'?t.en:'',hint:k=='fill'?(t.exvi||''):'',o:opts.map(z=>z.x),a:opts.findIndex(z=>z.ok)})}
 return shuf(out)}
/* trộn xen kẽ câu của 2 người: 1 câu chủ đề người mời, 1 câu chủ đề người nhận */
const mix=(A,B)=>{const r=[];for(let i=0;i<Math.max(A.length,B.length);i++){if(A[i])r.push({...A[i],by:'a'});if(B[i])r.push({...B[i],by:'b'})}return r.slice(0,NQ*2)};
const KL={mean:'NGHĨA TỪ',rev:'TỪ TIẾNG ANH',listen:'NGHE CHỌN TỪ',fill:'ĐIỀN VÀO CHỖ TRỐNG',pron:'PHÁT ÂM · AI CHẤM'};

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

function onMsg(p){if(!p||!F.m)return;F.lastOp=Date.now();if(p.t=='hb')return;if(p.t=='emo'){showEmo(p.e,'op');return}if(p.t=='txt'){showTxt(p.m,'op');return}if(p.t=='sleep'){sleepAsk();return}if(p.t=='sleepok'){goSleep(false);return}if(p.t=='sleepno'){F.sleepWait=false;clearTimeout(F.sleepT);rr();toast((F.op&&F.op.name||'Đối thủ')+' chưa cho ngủ: đấu tiếp nào! 💪');return}
 if(p.t=='hello'&&F.host&&F.v=='wait'){clearTimeout(F.timer);F.q=mix(F.myQ,Array.isArray(p.q)&&p.q.length?p.q:makeQ('*',NQ,F.words));F.opTopic=p.topic||'';
  send({t:'qs',q:F.q,ta:F.myTopic});F.v='play';rr();try{window.ttsPrefetch&&ttsPrefetch(F.q.filter(x=>x.say).map(x=>x.say))}catch(e){}setTimeout(()=>next(),1200)}
 else if(p.t=='qs'&&!F.host){clearInterval(F.hello);F.q=p.q;F.opTopic=p.ta||'';try{window.ttsPrefetch&&ttsPrefetch(F.q.filter(x=>x.say).map(x=>x.say))}catch(e){}rr()}
 else if(p.t=='seen'&&F.host){F.seen=true;try{sfx.tap()}catch(e){}}
 else if(p.t=='decline'&&F.host){toast('Đối thủ từ chối lời mời');F.v='pick';leave();rr()}
 else if(p.t=='q'&&!F.host){clearInterval(F.hello);showQ(p.i)}
 else if(p.t=='ans'){F.ans[p.i]=F.ans[p.i]||{};F.ans[p.i][p.s]={ok:p.ok,ms:p.ms};if(p.i===F.i)F.opAns=true;if(F.host)judge(p.i);else rr()}
 else if(p.t=='res'&&!F.host){applyRes(p)}
 else if(p.t=='end'&&!F.host){F.air=p.air;finish(p.win)}
 else if(p.t=='bye'){if(F.v=='play'){F.air[other()]=0;finish(side())}}}

/* đối thủ rớt mạng / tắt app: nhịp tim 3 giây; im lặng quá 20 giây thì xử thắng cho người còn lại */
setInterval(()=>{if(F.v!=='play'||F.bot||!F.ch)return;send({t:'hb'});if(!F.lastOp)F.lastOp=Date.now();
 if(Date.now()-F.lastOp>20000&&F.q.length){F.air[other()]=0;toast((F.op&&F.op.name||'Đối thủ')+' đã mất kết nối, bạn thắng!');if(F.host)send({t:'end',air:F.air,win:side()});finish(side())}},3000);
/* ===== thả biểu cảm chọc đối thủ (realtime) =====
 Bấm 1 biểu cảm: bay lên trên phần màn hình của ĐỐI THỦ ở máy họ, và trên phần của mình ở máy mình.
 Giới hạn 3 lần / 5 giây để không spam. Kaka thỉnh thoảng cũng chọc lại. */
const EMOS=['😜','🐢','🫧','🦈','😂','😎','🤡','👋'];
const TAUNT={'🐌':'Ốc sên còn nhanh hơn!','🥶':'Nước lạnh không?','🤡':'Hề quá đi!','👻':'Hù!','😴':'Ngủ gật à?','🏊':'Bơi lẹ lên!','⚓':'Chìm như mỏ neo!','🧜':'Hóa tiên cá luôn!','🏆':'Cúp là của tui!','🐢':'Chậm như rùa!','🦈':'Cá mập tới kìa!','🫧':'Sắp chìm rồi!','💦':'Nước lên rồi nha!','👋':'Bye bye!','😎':'Dễ ợt!'};
let emoT=[];
function sendEmo(e){if(F.v!=='play')return;const now=Date.now();emoT=emoT.filter(t=>now-t<5000);if(emoT.length>=3){toast('Từ từ thôi, chọc nhiều quá rồi 😆');return}emoT.push(now);
 if(!F.bot)send({t:'emo',e});if(F.tray){F.tray=false;rr()}showEmo(e,'me');try{navigator.vibrate&&navigator.vibrate(10)}catch(_){}}
function showEmo(e,who){if(!EMOS.includes(e))return;/* chỉ nhận biểu cảm trong danh sách */
 const sides=document.querySelectorAll('.fl-side');const box=(who=='me'?sides[1]:sides[0])||document.querySelector('.fl-top');/* 'me' = mình chọc → bay ở cột đối thủ; 'op' = bị chọc → bay ở cột mình */
 const r=box?box.getBoundingClientRect():{left:innerWidth/2-60,width:120,top:120,height:200};
 const el=document.createElement('div');el.className='fl-emo';el.setAttribute('aria-hidden','true');
 el.innerHTML=`<span class="e">${e}</span>${TAUNT[e]?`<span class="t">${TAUNT[e]}</span>`:''}`;
 el.style.left=(r.left+r.width*(.25+Math.random()*.5))+'px';el.style.top=(r.top+r.height*.62)+'px';document.body.appendChild(el);setTimeout(()=>el.remove(),2300);
 if(who=='op'){try{const t=ac()?.currentTime;if(t!=null){tone(1046,t,.08,{type:'square',g:.06});tone(784,t+.07,.12,{type:'square',g:.06})}}catch(_){}
  const live=document.getElementById('fl-emo-live');if(live)live.textContent=(F.op&&F.op.name||'Đối thủ')+' thả '+e+(TAUNT[e]?' '+TAUNT[e]:'')}}
function botTaunt(win){if(!F.bot||Math.random()>.45)return;const L=win?['😎','😜','🐢','🫧','👋']:['🙈','💪','😂'];setTimeout(()=>showEmo(L[Math.random()*L.length|0],'op'),600+Math.random()*900)}
function emoBar(){return `<div class="fl-emobar" role="group" aria-label="Thả biểu cảm chọc đối thủ">${EMOS.map(e=>`<button onclick="FLX.emo('${e}')" aria-label="Thả ${e}${TAUNT[e]?' '+TAUNT[e]:''}">${e}</button>`).join('')}</div><span id="fl-emo-live" class="sr-only" role="status" aria-live="polite"></span>`}

/* ===== "Xin đi ngủ": xin dừng trận một cách dễ thương; đối thủ đồng ý (hoặc 15 giây không trả lời) thì cả hai cùng nghỉ, hiện lời chúc ngủ ngon ===== */
function sleepReq(){if(F.v!=='play'||F.sleepWait)return;F.sleepWait=true;rr();
 if(F.bot){setTimeout(()=>{showEmo('👋','op');goSleep(true)},1200);return}
 send({t:'sleep'});clearTimeout(F.sleepT);F.sleepT=setTimeout(()=>{if(F.sleepWait&&F.v=='play')goSleep(true)},15000)}
function sleepAsk(){if(F.v!=='play')return;document.getElementById('fl-sleep')?.remove();const d=document.createElement('div');d.id='fl-sleep';d.setAttribute('role','alertdialog');d.setAttribute('aria-label','Đối thủ xin đi ngủ');
 d.innerHTML=`<div class="fs-card"><div class="fs-moon" aria-hidden="true">😴</div><b>${esc2(F.op&&F.op.name||'Đối thủ')} xin đi ngủ</b><p>Dừng trận ở đây nhé? Cả hai cùng được XP tham gia.</p><div class="fs-act"><button class="btn" onclick="FLX.sleepAns(true)">Cho đi ngủ 🌙</button><button class="btn ghost" onclick="FLX.sleepAns(false)">Chưa! Đấu tiếp 💪</button></div></div>`;
 document.body.appendChild(d);try{navigator.vibrate&&navigator.vibrate(40)}catch(e){}setTimeout(()=>{if(document.getElementById('fl-sleep')===d)sleepAns(true)},14000)}
function sleepAns(ok){document.getElementById('fl-sleep')?.remove();if(ok){send({t:'sleepok'});goSleep(true)}else send({t:'sleepno'})}
async function goSleep(me){if(F.v!=='play')return;clearTimeout(F.sleepT);F.sleepWait=false;F.slept=true;F.sleepBy=me?'me':'op';
 clearTimeout(F.timer);clearInterval(F.clk);F.v='end';F.win=null;music(false);
 try{const t=ac()?.currentTime;if(t!=null)[784,659,523,392].forEach((f,k)=>tone(f,t+k*.28,.5,{type:'sine',g:.12}))}catch(e){}
 const xp=10;try{S.xp=(S.xp||0)+xp;window.tick&&tick();save()}catch(e){}F.xp=xp;
 if(F.host&&F.m&&F.m.id)try{await SB.rpc('flood_finish',{mid:F.m.id,a_left:F.air.a,b_left:F.air.b,win:null})}catch(e){}
 setTimeout(leave,1500);rr()}
function vSleep(){const me=side(),myOk=Object.values(F.ans).filter(a=>a&&a[me]&&a[me].ok).length,n=Object.keys(F.ans).length,nm=esc2(F.op&&F.op.name||'bạn');
 const h=new Date().getHours(),night=h>=21||h<5;
 return `<div class="fs-night" aria-hidden="true">${Array.from({length:26},(_,k)=>`<i style="left:${(k*37)%100}%;top:${(k*53)%70}%;animation-delay:${(k%7)*.3}s"></i>`).join('')}</div>
 <div class="fs-page"><div class="fs-big" aria-hidden="true">🌙</div><span class="fi-tag" style="color:#ffd257">TRẬN ĐẤU ĐÃ NGHỈ</span>
 <h1 style="margin:4px 0;color:#fff">Chúc ngủ ngon, ${nm}! 😴</h1>
 <p style="margin:0;color:#c9d6f2">${F.sleepBy=='me'?nm+' đã cho bạn đi ngủ.':'Bạn đã cho '+nm+' đi ngủ.'} Mơ thấy toàn từ vựng tiếng Anh nha 💤</p>
 <div class="fs-stats"><span><b>${myOk}/${n}</b> câu đúng</span><span><b>+${F.xp} XP</b> tham gia</span></div>
 <button class="btn" style="width:100%" onclick="FLX.cancel()">Hẹn mai đấu tiếp 👋</button></div>`}

/* ===== nhắn nhanh trong trận: bong bóng chữ hiện trên cột người gửi ở cả 2 máy (không lưu lại) ===== */
const QUICK=['GG! 👍','Hay đó!','Đợi tui chút…','Run quá 😅','Bạn giỏi ghê','Trận nữa nha!'];
function sendTxt(m){m=String(m||'').replace(/\s+/g,' ').trim().slice(0,80);if(!m||F.v!=='play')return;const now=Date.now();emoT=emoT.filter(t=>now-t<5000);if(emoT.length>=3){toast('Từ từ thôi nha 😆');return}emoT.push(now);
 if(!F.bot)send({t:'txt',m});F.chat=false;rr();showTxt(m,'me');
 if(F.bot&&Math.random()<.8)setTimeout(()=>showTxt(['Haha, còn lâu! 😎','Kaka đang tập trung…','GG nha!','Bơi nhanh lên bạn ơi 🏊','Hehe 🤭'][Math.random()*5|0],'op'),1200+Math.random()*1200)}
function showTxt(m,who){m=String(m||'').slice(0,80);if(!m)return;const sides=document.querySelectorAll('.fl-side');const box=(who=='me'?sides[0]:sides[1])||document.querySelector('.fl-top');/* bong bóng nằm trên cột người nói */
 const r=box?box.getBoundingClientRect():{left:20,width:160,top:120,height:200};document.querySelectorAll(`.fl-bub.${who}`).forEach(x=>x.remove());
 const el=document.createElement('div');el.className='fl-bub '+who;el.textContent=m;el.style.left=(r.left+r.width/2)+'px';el.style.top=(r.top+r.height*.5)+'px';document.body.appendChild(el);setTimeout(()=>el.remove(),3600);
 if(who=='op'){try{const t=ac()?.currentTime;if(t!=null)tone(1318,t,.07,{type:'sine',g:.07})}catch(_){}const live=document.getElementById('fl-emo-live');if(live)live.textContent=(F.op&&F.op.name||'Đối thủ')+' nhắn: '+m}}

/* ---------- vòng câu hỏi ---------- */
function next(){if(!F.host)return;const i=F.i+1;
 if(i>=F.q.length||F.air.a<=0||F.air.b<=0){const w=F.air.a==F.air.b?null:(F.air.a>F.air.b?'a':'b');send({t:'end',air:F.air,win:w});return finish(w)}
 send({t:'q',i});showQ(i);
 if(F.bot){const ok=Math.random()<.7,ms=2200+Math.random()*5500,extra=F.q[i]&&F.q[i].say?3500:F.q[i]&&F.q[i].k=='pron'?2500:0;setTimeout(()=>{if(F.i!==i||F.v!='play')return;F.ans[i]=F.ans[i]||{};F.ans[i].b={ok,ms:Math.round(ms)};F.opAns=true;judge(i)},ms+extra)}
 clearTimeout(F.timer);F.timer=setTimeout(()=>{F.ans[i]=F.ans[i]||{};for(const s of['a','b'])if(!F.ans[i][s])F.ans[i][s]={ok:false,ms:lim(i)};judge(i)},lim(i)+2500+(F.q[i]&&F.q[i].say?4500:0))}
const lim=i=>F.q[i]&&F.q[i].k=='pron'?TPRON:TLIM;
function showQ(i){if(i===0)music(true);sfx.q();F.i=i;F.pick=null;F.heard='';F.pscore=null;F.grading=false;F.res=null;F.opAns=false;F.shown=performance.now();F.v='play';const q=F.q[i];F.lock=!!(q&&q.say);rr();
 /* câu nghe: tự đọc trước, đọc xong mới mở đáp án và bắt đầu tính giờ; không nghe rõ thì bấm Nghe lại */
 if(F.lock){let done=false;const open=()=>{if(done||F.i!==i)return;done=true;F.lock=false;F.shown=performance.now();rr();tickClock()};
  setTimeout(()=>{try{Promise.resolve(say(q.say,0.9)).then(()=>setTimeout(open,250),open)}catch(e){open()}},300);setTimeout(open,4500)}
 else tickClock()}
function tickClock(){clearInterval(F.clk);F.clk=setInterval(()=>{const el=document.getElementById('fl-clock');if(!el||F.res){clearInterval(F.clk);return}const left=Math.max(0,lim(F.i)-(performance.now()-F.shown));const sec=Math.ceil(left/1000);if(sec<=5&&sec!==F.lastTick&&F.pick==null){F.lastTick=sec;sfx.tick()}el.textContent='0:'+String(sec).padStart(2,'0')},250)}
function answer(k){if(F.pick!=null||F.res||F.v!='play'||F.lock)return;if(performance.now()-F.shown<350)return;
 const q=F.q[F.i],ok=k===q.a,ms=Math.round(performance.now()-F.shown);F.pick=k;sfx.tap();
 F.ans[F.i]=F.ans[F.i]||{};F.ans[F.i][side()]={ok,ms};send({t:'ans',i:F.i,s:side(),ok,ms});
 try{navigator.vibrate&&navigator.vibrate(ok?15:[30,40,30])}catch(e){}
 if(F.host)judge(F.i);else rr()}
/* câu phát âm: bấm micro, đọc to, AI nghe và chấm (đúng khi đọc rõ cả từ) */
async function pron(){if(F.pick!=null||F.res||F.v!='play')return;const q=F.q[F.i];if(!q||q.k!='pron')return;
 if(F.rec){try{F.rec.stop()}catch(e){}return}
 let stream;try{stream=typeof micGet=='function'?await micGet():await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){if(window.MIC&&MIC.open)MIC.open();return toast('Cần cho phép micro để đọc')}
 const mt=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(x=>window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(x))||'';
 const mr=new MediaRecorder(stream,mt?{mimeType:mt}:{}),ch=[],i=F.i;mr.ondataavailable=e=>{if(e.data.size)ch.push(e.data)};
 mr.onstop=async()=>{stream.getTracks().forEach(t=>t.stop());F.rec=null;const ms=Math.round(performance.now()-F.shown);F.pick=0;F.grading=true;rr();
  let ok=false,heard='';try{const blob=new Blob(ch,{type:mr.mimeType||mt||'audio/mp4'});const b64=await new Promise((r,j)=>{const fr=new FileReader();fr.onload=()=>r(String(fr.result).split(',')[1]);fr.onerror=j;fr.readAsDataURL(blob)});
   const r=await ai('pron',{audio:b64,mime:(blob.type||'audio/mp4').split(';')[0],target:q.target});heard=String(r&&r.heard||'');
   const N=x=>x.toLowerCase().replace(/[^a-z' ]+/g,' ').split(/\s+/).filter(Boolean),T=N(q.target),H=N(heard);const hit=T.filter(w=>H.includes(w)).length;F.pscore=T.length?Math.round(hit/T.length*100):0;ok=F.pscore>=70}catch(e){F.pscore=0}
  F.heard=heard;F.grading=false;if(F.i!==i||F.res)return;
  F.ans[i]=F.ans[i]||{};F.ans[i][side()]={ok,ms};send({t:'ans',i,s:side(),ok,ms});sfx[ok?'ok':'bad']();if(F.host)judge(i);else rr()};
 mr.start();F.rec=mr;sfx.tap();rr();setTimeout(()=>{if(F.rec===mr)try{mr.stop()}catch(e){}},3500)}
function judge(i){if(!F.host||i!==F.i||F.res)return;const A=F.ans[i]||{};if(!A.a||!A.b){rr();return}
 clearTimeout(F.timer);let lose=[],win=null;
 if(A.a.ok&&A.b.ok){win=A.a.ms<=A.b.ms?'a':'b';lose=[win=='a'?'b':'a']}
 else if(A.a.ok){win='a';lose=['b']}else if(A.b.ok){win='b';lose=['a']}else lose=['a','b'];
 lose.forEach(s=>F.air[s]=Math.max(0,F.air[s]-1));
 const p={t:'res',i,win,lose,air:{...F.air},A};send(p);applyRes(p)}
function applyRes(p){F.res=p;F.air=p.air;F.ans[p.i]=p.A;rr();if(F.bot)botTaunt(p.win==='b');{const me=side();if(p.win===me)sfx.ok();else sfx.bad();setTimeout(()=>sfx.splash(),350)}
 const mine=side(),lostMe=p.lose.includes(mine);try{navigator.vibrate&&lostMe&&navigator.vibrate([60,40,60])}catch(e){}
 if(F.host)setTimeout(()=>{if(F.v=='play')next()},2200)}
async function finish(w){clearTimeout(F.timer);clearInterval(F.clk);F.v='end';F.win=w;music(false);setTimeout(()=>{w===side()?sfx.win():w==null?sfx.ok():sfx.lose()},500);
 const me=side(),won=w===me,draw=w==null;const xp=won?30:draw?15:10;try{S.xp=(S.xp||0)+xp;window.tick&&tick();save()}catch(e){}F.xp=xp;
 if(F.host&&F.m&&F.m.id)try{await SB.rpc('flood_finish',{mid:F.m.id,a_left:F.air.a,b_left:F.air.b,win:w=='a'?F.m.a:w=='b'?F.m.b:null})}catch(e){}
 setTimeout(leave,1500);rr()}

/* ---------- mời / nhận lời ---------- */
async function loadTargets(){if(F.targets)return;const {data,error}=await SB.rpc('challenge_targets');F.targets=error?[]:(data||[]);
 try{const ids=F.targets.map(t=>t.user_id);const {data:P}=await SB.from('presence').select('user_id,last_seen').in('user_id',ids);const now=Date.now();(P||[]).forEach(p=>{const t=F.targets.find(x=>x.user_id==p.user_id);if(t)t.seen=new Date(p.last_seen).getTime()});F.targets.sort((x,y)=>(y.seen||0)-(x.seen||0))}catch(e){}rr()}
async function invite(target){try{ac();window.actx&&actx().resume()}catch(e){}if(!uid()){toast('Đăng nhập để chơi');return go('me')}
 if(!F.course||!F.words){toast('Chọn khóa học trước nhé');return}
 const q=makeQ(F.topic||'*',NQ,F.words);if(q.length<5)return toast('Khóa này chưa đủ từ, chọn khóa khác nhé');
 const tp=topics(F.words,F.course).find(x=>x.id==(F.topic||'*'));const topic=F.course.name+((F.topic||'*')=='*'?'':' · '+(tp?tp.n:''));F.myQ=q;F.myTopic=topic;
 const {data,error}=await SB.rpc('flood_invite',{target:target||null,q,topic});
 if(error){if(needSql(error)){F.off=true;rr();return}return toast(error.message)}
 if(target)try{lobby&&lobby.send({type:'broadcast',event:'inv',payload:{to:target,m:data,op:{user_id:uid(),name:(PROF&&PROF.full_name)||'Bạn bè'}}})}catch(e){}
 start(data,true,target?F.targets.find(t=>t.user_id==target):{name:'Kaka',bot:true})}
function start(m,host,op){F.lastOp=0;F.slept=false;F.sleepWait=false;try{window.ttsPrefetch&&ttsPrefetch((m.q||[]).filter(x=>x.say).map(x=>x.say))}catch(e){}F.m=m;F.host=host;F.bot=!m.b;F.q=host?m.q:[];if(host)F.myQ=m.q;F.i=-1;F.air={a:AIR,b:AIR};F.ans={};F.res=null;F.pick=null;F.win=undefined;
 F.me={name:(PROF&&PROF.full_name)||'Bạn',avatar:PROF&&PROF.avatar,id:uid()};F.op=op||{name:'Đối thủ'};
 if(F.bot){F.q=mix(F.myQ||m.q,makeQ('*',NQ,F.words));F.opTopic=(F.course?F.course.name+' · ':'')+'Kaka chọn ngẫu nhiên';F.v='play';go('flood');setTimeout(next,900);return}
 join(m.id);
 if(host){F.v='wait';F.waitUntil=Date.now()+60000;go('flood');F.timer=setTimeout(()=>{if(F.v=='wait'){toast('Đối thủ chưa nhận lời');F.v='pick';leave();rr()}},60000);waitClock()}
 else{F.myTopic=F.rName||'Cả khóa';F.myQ=F.rQ&&F.rQ.length?F.rQ:makeQ('*');F.v='play';go('flood');const h=()=>send({t:'hello',q:F.myQ,topic:F.myTopic});F.hello=setInterval(h,1000);h()}}
function waitClock(){F.seen=false;const t=setInterval(()=>{if(F.v!='wait'){clearInterval(t);return}const left=Math.max(0,(F.waitUntil-Date.now()));const el=document.getElementById('fl-wait');if(el)el.textContent=Math.ceil(left/1000)+' giây';const arc=document.getElementById('fw-arc');if(arc)arc.setAttribute('stroke-dashoffset',String(RING*(1-left/60000)));const sn=document.getElementById('fw-seen');if(sn)sn.textContent=F.seen?'👀 '+F.op.name+' đã thấy lời mời…':'Đang gõ cửa nhà '+F.op.name+'…'},250)}
function cancel(){music(false);if(F.v=='play'&&!F.bot)send({t:'bye'});leave();F.v='pick';F.m=null;rr()}

/* lời mời đến: hộp thoại nổi trên mọi màn hình */
/* đường nhanh: lời mời tới thẳng qua kênh realtime (không chờ ghi DB) */
function fastInv(p){if(!p||p.to!==uid()||!p.m||p.m.status!=='invite')return;if(F.seenInv&&F.seenInv[p.m.id])return;(F.seenInv=F.seenInv||{})[p.m.id]=1;
 F.rTopic='*';F.inv={m:p.m,op:p.op||{name:'Bạn bè'},until:Date.now()+60000};showInv();
 SB.rpc('flood_people',{mid:p.m.id}).then(({data})=>{const o=(data||[]).find(x=>x.user_id==p.m.a);if(o&&F.inv&&F.inv.m.id==p.m.id){F.inv.op=o;showInv()}}).catch(()=>{})}
async function incoming(n){if(n.kind!=='flood')return;const id=+n.body;if(!id)return;if(F.seenInv&&F.seenInv[id])return;(F.seenInv=F.seenInv||{})[id]=1;
 const {data}=await SB.from('flood_matches').select('*').eq('id',id).maybeSingle();if(!data||data.status!=='invite')return;
 const {data:pp}=await SB.rpc('flood_people',{mid:id});const op=(pp||[]).find(p=>p.user_id==data.a)||{name:'Bạn bè'};
 F.inv={m:data,op,until:Date.now()+60000};showInv()}
/* ===== hộp lời mời "fun": ở yên trên màn hình suốt 60 giây cho tới khi nhận / từ chối ===== */
const RING=2*Math.PI*30;
async function invCourses(I){F.rCourses=null;const L=await courses(I.m.a);F.rCourses=(L||[]).slice().sort((x,y)=>(y.mine?1:0)-(x.mine?1:0));F.rCourse=F.rCourses[0]&&F.rCourses[0].id;
 const sel=document.getElementById('fi-crs');if(sel&&F.inv===I)sel.innerHTML=F.rCourses.length?F.rCourses.map(c=>`<option value="${esc2(c.id)}">${esc2(c.name)}${c.mine?'':' (bạn chưa học)'}</option>`).join(''):'<option value="">Khóa của bạn</option>'}
function showInv(){document.getElementById('fl-inv')?.remove();const I=F.inv;if(!I)return;
 const d=document.createElement('div');d.id='fl-inv';d.setAttribute('role','alertdialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-labelledby','fl-inv-t');
 const nm=esc2(I.op.name||'Bạn bè'),n=(I.m.q||[]).length||10;
 d.innerHTML=`<div class="fi-card">
  <div class="fi-sea" aria-hidden="true"><svg viewBox="0 0 400 40" preserveAspectRatio="none"><path d="M0 20 Q25 6 50 20 T100 20 T150 20 T200 20 T250 20 T300 20 T350 20 T400 20 V40 H0Z" fill="rgba(255,255,255,.25)"/></svg><svg viewBox="0 0 400 40" preserveAspectRatio="none" style="animation-duration:4.5s;opacity:.6"><path d="M0 22 Q25 34 50 22 T100 22 T150 22 T200 22 T250 22 T300 22 T350 22 T400 22 V40 H0Z" fill="rgba(255,255,255,.35)"/></svg>${'<i></i>'.repeat(6)}</div>
  <div class="fi-av"><svg class="fi-ring" viewBox="0 0 68 68" aria-hidden="true"><circle cx="34" cy="34" r="30" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="5"/><circle id="fi-arc" cx="34" cy="34" r="30" fill="none" stroke="#ffd257" stroke-width="5" stroke-linecap="round" stroke-dasharray="${RING}" stroke-dashoffset="0" transform="rotate(-90 34 34)"/></svg><span class="fi-face">${window.avatarHTML?avatarHTML(I.op.avatar,I.op.user_id||I.op.name,84):''}</span><span class="fi-sw" aria-hidden="true">⚔️</span></div>
  <div class="fi-body"><span class="fi-tag">THÁCH ĐẤU NƯỚC DÂNG</span>
   <h2 id="fl-inv-t">${nm} rủ bạn<br>xuống nước! 🌊</h2>
   <p>Chủ đề của ${nm}: <b>${esc2(I.m.topic||'Trộn tất cả')}</b> · trận ${n*2} câu</p>
   <label class="fi-sel"><span>Chủ đề của bạn (10 câu) · chỉ các khóa ${nm} đang học</span><select id="fi-crs" onchange="FLX.rc(this.value)">${F.rCourses?F.rCourses.length?F.rCourses.map(c=>`<option value="${esc2(c.id)}" ${c.id==F.rCourse?'selected':''}>${esc2(c.name)}${c.mine?'':' (bạn chưa học)'}</option>`).join(''):'<option value="">Khóa của bạn</option>':'<option>Đang tải khóa học…</option>'}</select></label>
   <div class="fi-time" role="timer" aria-live="off"><b id="fi-sec">60</b> giây để nhận lời</div>
   <button class="fi-yes" onclick="FLX.respond(true)">🏊 Nhận lời, chiến luôn!</button>
   <button class="fi-no" onclick="FLX.respond(false)">Để lần sau</button></div></div>`;
 document.body.appendChild(d);setTimeout(()=>d.querySelector('.fi-yes')?.focus(),300);if(F.rCourses===undefined||F.invFor!==I.m.id){F.invFor=I.m.id;invCourses(I)}
 /* rung + chuông mỗi 4 giây để người nhận để ý */
 const ring=()=>{try{navigator.vibrate&&navigator.vibrate([120,80,120])}catch(e){}try{const t=ac()?.currentTime;if(t!=null){[880,1175,1568].forEach((f,k)=>tone(f,t+k*.11,.22,{type:'triangle',g:.14}));sfx.splash()}}catch(e){}};
 ring();clearInterval(F.invRing);F.invRing=setInterval(()=>{if(F.inv!==I){clearInterval(F.invRing);return}ring()},4000);
 clearInterval(F.invClk);F.invClk=setInterval(()=>{if(F.inv!==I){clearInterval(F.invClk);return}const left=Math.max(0,I.until-Date.now());
  const el=document.getElementById('fi-sec');if(el)el.textContent=Math.ceil(left/1000);const arc=document.getElementById('fi-arc');if(arc)arc.setAttribute('stroke-dashoffset',String(RING*(1-left/60000)));
  if(left<=10000)d.classList.add('fi-hurry');
  if(left<=0){clearInterval(F.invClk);F.inv=null;d.classList.add('fi-out');setTimeout(()=>d.remove(),300);toast('Lời mời của '+(I.op.name||'bạn bè')+' đã hết hạn')}},250);
 /* báo người mời là mình đã thấy lời mời */
 if(F.v!='play'&&!F.ch){join(I.m.id);setTimeout(()=>send({t:'seen'}),700)}}
async function respond(ok){if(ok)try{ac();window.actx&&actx().resume()}catch(e){}const I=F.inv;F.inv=null;clearInterval(F.invRing);clearInterval(F.invClk);
 const d=document.getElementById('fl-inv');if(d){d.classList.add(ok?'fi-go':'fi-out');setTimeout(()=>d.remove(),ok?450:300)}if(!I)return;
 if(!ok){send({t:'decline'});setTimeout(leave,500);SB.rpc('flood_respond',{mid:I.m.id,accept:false}).catch(()=>{});return}
 let rc=(F.rCourses||[]).find(c=>c.id==F.rCourse)||(F.rCourses||[])[0];F.rQ=null;F.rName='';
 if(rc){const W=await wordsOf(rc,I.m.a);F.rQ=makeQ('*',NQ,W);F.rName=rc.name}
 const {data,error}=await SB.rpc('flood_respond',{mid:I.m.id,accept:true});
 if(error){leave();return toast(error.message)}leave();start(data||I.m,false,I.op)}
/* người mời: thẻ chờ nổi trên mọi màn hình suốt thời gian chờ nhận lời */
function waitFab(){let el=document.getElementById('fl-wfab');if(F.v!=='wait'||S.tab==='flood'){el&&el.remove();return}
 if(!el){el=document.createElement('button');el.id='fl-wfab';el.onclick=()=>go('flood');document.body.appendChild(el)}
 const left=Math.max(0,Math.ceil((F.waitUntil-Date.now())/1000));
 el.innerHTML=`<span class="fw-av">${window.avatarHTML?avatarHTML(F.op.avatar,F.op.user_id||F.op.name,36):''}</span><span class="fw-t"><b>Đang chờ ${esc2(F.op.name)}</b><small>${F.seen?'👀 Đã thấy lời mời · ':'Đang gõ cửa · '}${left}s</small></span><span class="fw-w" aria-hidden="true">🌊</span>`;
 el.setAttribute('aria-label',`Đang chờ ${F.op.name} nhận lời, còn ${left} giây. Chạm để mở`)}
setInterval(waitFab,500);
/* phòng chờ chung: biết ai đang mở app (Realtime Presence, tức thì) + nhận lời mời nhanh */
let lobby=null;F.online=new Set();
function joinLobby(){if(lobby||!uid()||typeof SB=='undefined')return;
 lobby=SB.channel('ss-lobby',{config:{presence:{key:uid()},broadcast:{self:false}}});
 lobby.on('presence',{event:'sync'},()=>{try{F.online=new Set(Object.keys(lobby.presenceState()))}catch(e){}if(F.v=='pick')rr()})
  .on('broadcast',{event:'inv'},({payload})=>fastInv(payload))
  .subscribe(st=>{if(st==='SUBSCRIBED')lobby.track({at:Date.now()}).catch(()=>{})});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&lobby)lobby.track({at:Date.now()}).catch(()=>{})})}
let sub=null;function listen(){joinLobby();if(sub||!uid()||typeof SB=='undefined')return;
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
const css2=`#fl-inv{position:fixed;inset:0;z-index:2147483100;display:grid;place-items:center;padding:16px;background:rgba(6,20,36,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:fiBg .3s both}
@keyframes fiBg{from{opacity:0}}
.fi-card{position:relative;width:min(380px,100%);border-radius:28px;overflow:hidden;background:linear-gradient(170deg,#1e88e5 0%,#0b5cab 45%,#073b72 100%);color:#fff;text-align:center;box-shadow:0 30px 60px rgba(0,0,0,.45);animation:fiPop .55s cubic-bezier(.2,1.4,.4,1) both}
@keyframes fiPop{from{transform:translateY(60px) scale(.8);opacity:0}}
.fi-sea{position:absolute;left:0;right:0;bottom:0;height:46%;background:linear-gradient(180deg,rgba(64,170,230,.0),rgba(64,170,230,.35));pointer-events:none}
.fi-sea svg{position:absolute;left:0;top:-14px;width:200%;height:30px;animation:flw 3.2s linear infinite}
.fi-sea i{position:absolute;bottom:8px;width:10px;height:10px;border-radius:50%;border:2px solid rgba(255,255,255,.7);animation:flb 3s ease-in infinite}
.fi-sea i:nth-child(3){left:12%}.fi-sea i:nth-child(4){left:30%;animation-delay:.6s}.fi-sea i:nth-child(5){left:55%;animation-delay:1.2s}.fi-sea i:nth-child(6){left:72%;animation-delay:.3s}.fi-sea i:nth-child(7){left:86%;animation-delay:1.7s}.fi-sea i:nth-child(8){left:44%;animation-delay:2.1s}
.fi-av{position:relative;width:112px;height:112px;margin:26px auto 4px}.fi-ring{position:absolute;inset:0;width:100%;height:100%}
.fi-face{position:absolute;inset:14px;display:grid;place-items:center;animation:fiBob 1.6s ease-in-out infinite}.fi-face .av-img,.fi-face .av-wrap{border-radius:50%;border:3px solid #fff}
@keyframes fiBob{50%{transform:translateY(-6px) rotate(-4deg)}}
.fi-sw{position:absolute;right:-6px;bottom:2px;font-size:30px;animation:fiSw .9s ease-in-out infinite}@keyframes fiSw{50%{transform:rotate(-18deg) scale(1.15)}}
.fi-body{position:relative;padding:4px 20px 20px;display:flex;flex-direction:column;gap:8px}
.fi-tag{font:800 .72rem var(--fd);letter-spacing:.12em;color:#ffd257}
.fi-body h2{margin:0;font:800 1.65rem/1.15 var(--fd);color:#fff}.fi-body p{margin:0;color:#d6e8fb;font-size:.9rem}
.fi-time{align-self:center;padding:4px 12px;border-radius:99px;background:rgba(0,0,0,.25);font-size:.85rem}.fi-time b{font:800 1.05rem var(--fd);color:#ffd257}
.fi-yes{min-height:56px;border:0;border-radius:16px;background:#ffd257;color:#14212e;font:800 1.12rem var(--fd);box-shadow:0 6px 0 #c99a1c,0 10px 20px rgba(0,0,0,.25);cursor:pointer;animation:fiJig 2.4s ease-in-out infinite}
.fi-yes:active{transform:translateY(4px);box-shadow:0 2px 0 #c99a1c}
@keyframes fiJig{0%,80%,100%{transform:none}84%{transform:rotate(-2deg) scale(1.03)}88%{transform:rotate(2deg) scale(1.03)}92%{transform:rotate(-1deg)}}
.fi-sel{display:flex;flex-direction:column;gap:4px;text-align:left;font-size:.82rem;color:#d6e8fb}.fi-sel select{min-height:44px;border-radius:12px;border:0;padding:0 10px;font:600 .95rem inherit;color:#14212e;background:#fff}
.fl-mic{width:84px;height:84px;border-radius:50%;border:0;background:var(--bad);color:#fff;display:grid;place-items:center;box-shadow:0 8px 20px rgba(200,67,58,.35);cursor:pointer}.fl-mic.rec{animation:flmic 1.2s infinite}.fl-mic:disabled{opacity:.5}@keyframes flmic{0%{box-shadow:0 0 0 0 rgba(200,67,58,.6)}100%{box-shadow:0 0 0 22px rgba(200,67,58,0)}}
.fi-no{min-height:44px;border:0;background:none;color:#d6e8fb;font:600 .95rem inherit;text-decoration:underline;cursor:pointer}
.fi-hurry .fi-time{background:#c8433a;animation:fiBlink .5s steps(1) infinite}@keyframes fiBlink{50%{opacity:.6}}
.fi-out .fi-card{animation:fiOut .3s both}@keyframes fiOut{to{transform:translateY(40px) scale(.9);opacity:0}}
.fi-go .fi-card{animation:fiGo .45s both}@keyframes fiGo{to{transform:scale(1.15);opacity:0}}
#fl-wfab{position:fixed;left:50%;transform:translateX(-50%);top:calc(10px + env(safe-area-inset-top,0px));z-index:2147483000;display:flex;align-items:center;gap:10px;max-width:calc(100% - 24px);min-height:52px;padding:6px 14px 6px 6px;border:0;border-radius:99px;background:linear-gradient(120deg,#1e88e5,#0b3b6e);color:#fff;box-shadow:0 10px 26px rgba(0,0,0,.35);cursor:pointer;animation:fiPop .45s both}
#fl-wfab .fw-av .av-img,#fl-wfab .fw-av .av-wrap{border-radius:50%;border:2px solid #ffd257}
#fl-wfab .fw-t{display:flex;flex-direction:column;text-align:left;min-width:0}#fl-wfab b{font:800 .9rem var(--fd);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#fl-wfab small{font-size:.76rem;color:#d6e8fb}
#fl-wfab .fw-w{font-size:1.3rem;animation:fiBob 1.4s ease-in-out infinite}
.fw-page{text-align:center;padding-top:24px;display:flex;flex-direction:column;align-items:center;gap:6px}
.fw-big{position:relative;width:150px;height:150px}.fw-big svg{position:absolute;inset:0;width:100%;height:100%}.fw-big>span{position:absolute;inset:23px;display:grid;place-items:center;animation:fiBob 1.6s ease-in-out infinite}
.fw-dots{display:flex;gap:6px;justify-content:center;margin:0}.fw-dots i{width:8px;height:8px;border-radius:50%;background:var(--steel);animation:fwD 1.2s infinite}.fw-dots i:nth-child(2){animation-delay:.2s}.fw-dots i:nth-child(3){animation-delay:.4s}
@keyframes fwD{0%,80%,100%{opacity:.25;transform:none}40%{opacity:1;transform:translateY(-5px)}}
@media (prefers-reduced-motion:reduce){#fl-inv *,#fl-wfab,#fl-wfab *,.fw-page *{animation:none!important}}`;
const css3=`.fl-air{display:inline-block;vertical-align:middle;width:46px;height:7px;border-radius:99px;background:rgba(255,255,255,.25);overflow:hidden}.fl-air i{display:block;height:100%;border-radius:inherit;transition:width .5s}
.fl-q.play{min-height:calc(100dvh - min(44vh,360px) - 104px - env(safe-area-inset-bottom,0px))}.fl-ans{margin-top:auto;display:flex;flex-direction:column;gap:8px}
.fl-act{position:relative;display:flex;gap:8px;margin-top:2px}.fl-sl{flex:1;min-height:48px;border:1px solid var(--line);border-radius:14px;background:var(--soft);color:var(--ink);font:700 .92rem var(--fd);cursor:pointer}.fl-sl:disabled{opacity:.6}
.fl-tbtn{flex:1;min-height:48px;padding:0 16px;border:0;border-radius:14px;background:#ff5f8f;color:#fff;font:800 1rem var(--fd);box-shadow:0 4px 12px rgba(255,95,143,.35);cursor:pointer}
.fl-chat{position:absolute;left:0;right:0;bottom:56px;z-index:5;padding:10px;border-radius:18px;background:var(--card);border:1px solid var(--line);box-shadow:0 10px 30px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:8px;animation:fiPop .22s both}
.fl-qk{display:flex;flex-wrap:wrap;gap:6px}.fl-qk button{min-height:38px;padding:0 12px;border-radius:99px;border:1px solid var(--line);background:var(--soft);color:var(--ink);font:600 .88rem inherit;cursor:pointer}
.fl-cin{display:flex;gap:6px}.fl-cin input{flex:1;min-width:0;min-height:44px;border-radius:12px;border:1px solid var(--line);padding:0 12px;font-size:16px;background:var(--soft);color:var(--ink)}.fl-cin button{width:48px;min-height:44px;border:0;border-radius:12px;background:var(--steel);color:#fff;font-size:1.1rem}
.fl-bub{position:fixed;z-index:2147483200;pointer-events:none;transform:translate(-50%,-50%);max-width:170px;padding:8px 12px;border-radius:16px;background:#fff;color:#14212e;font:700 .92rem/1.3 var(--fd);text-align:center;box-shadow:0 8px 20px rgba(0,0,0,.35);animation:flBub 3.5s both}
.fl-bub::after{content:"";position:absolute;left:50%;bottom:-7px;margin-left:-7px;border:7px solid transparent;border-bottom:0;border-top-color:#fff}
@keyframes flBub{0%{opacity:0;transform:translate(-50%,-30%) scale(.6)}8%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}12%{transform:translate(-50%,-50%) scale(1)}85%{opacity:1}100%{opacity:0;transform:translate(-50%,-70%)}}
.fl-pie{position:absolute;left:50%;top:-6px;width:0;height:0;z-index:5}
.fl-pie::before{content:"";position:absolute;left:-170px;top:-170px;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(10,20,40,.55) 0 38%,rgba(10,20,40,.35) 60%,transparent 71%);pointer-events:none;animation:fiBg .2s both}
.fl-pie button{position:absolute;left:-24px;top:-24px;width:48px;height:48px;border-radius:50%;border:2px solid #fff;background:#fff;font-size:1.65rem;line-height:1;box-shadow:0 6px 14px rgba(0,0,0,.3);cursor:pointer;transform:translate(var(--x),var(--y));animation:flPie .28s cubic-bezier(.2,1.5,.4,1) both}
.fl-pie button:active{transform:translate(var(--x),var(--y)) scale(1.25)}
@keyframes flPie{from{transform:translate(0,0) scale(.2);opacity:0}}
.fl-tray-old{position:absolute;left:0;right:0;bottom:56px;z-index:4;display:grid;grid-template-columns:repeat(6,1fr);gap:6px;padding:10px;border-radius:18px;background:rgba(10,20,40,.88);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 10px 30px rgba(0,0,0,.45);animation:fiPop .25s both}
.fl-tray button{aspect-ratio:1;min-height:44px;border:0;border-radius:12px;background:rgba(255,255,255,.1);font-size:1.6rem;cursor:pointer}.fl-tray button:active{transform:scale(1.25)}
#fl-sleep{position:fixed;inset:0;z-index:2147483300;display:grid;place-items:center;padding:16px;background:rgba(10,14,40,.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
.fs-card{width:min(340px,100%);border-radius:24px;padding:20px;text-align:center;color:#fff;background:linear-gradient(170deg,#2a2f6b,#141a3f);box-shadow:0 20px 50px rgba(0,0,0,.5);display:flex;flex-direction:column;gap:8px;animation:fiPop .45s both}
.fs-card b{font:800 1.3rem var(--fd)}.fs-card p{margin:0;color:#c9d6f2;font-size:.92rem}.fs-act{display:flex;flex-direction:column;gap:8px;margin-top:6px}.fs-act .ghost{color:#fff;border-color:rgba(255,255,255,.4)}
.fs-moon{font-size:52px;animation:fiBob 1.8s ease-in-out infinite}
.fs-night{position:fixed;inset:0;z-index:0;background:linear-gradient(180deg,#0b1030,#1b2160 70%,#2b2f6b);pointer-events:none}
.fs-night i{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff;animation:fsTw 2.2s ease-in-out infinite}@keyframes fsTw{50%{opacity:.2;transform:scale(.6)}}
.fs-page{position:relative;z-index:1;text-align:center;padding-top:40px;display:flex;flex-direction:column;align-items:center;gap:8px}
.fs-big{font-size:96px;line-height:1;filter:drop-shadow(0 0 30px rgba(255,230,140,.6));animation:fiBob 3s ease-in-out infinite}
.fs-stats{display:flex;gap:10px;margin:8px 0}.fs-stats span{padding:8px 14px;border-radius:14px;background:rgba(255,255,255,.1);color:#c9d6f2;font-size:.85rem}.fs-stats b{color:#ffd257;font:800 1.05rem var(--fd)}
.fl-emobar{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 -16px;padding:4px 16px 2px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 16px,#000 calc(100% - 16px),transparent)}.fl-emobar::-webkit-scrollbar{display:none}
.fl-emobar button{flex:none;width:44px;height:44px;border-radius:50%;border:1px solid var(--line);background:var(--soft);font-size:1.4rem;line-height:1;cursor:pointer;transition:transform .12s}.fl-emobar button:active{transform:scale(1.25)}
.fl-emo{position:fixed;z-index:2147483200;pointer-events:none;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:2px;animation:flEmo 2.2s cubic-bezier(.2,.9,.3,1) both}
.fl-emo .e{font-size:64px;line-height:1;filter:drop-shadow(0 4px 8px rgba(0,0,0,.4))}
.fl-emo .t{font:800 .9rem var(--fd);color:#fff;background:rgba(0,0,0,.6);padding:3px 10px;border-radius:99px;white-space:nowrap}
@keyframes flEmo{0%{opacity:0;transform:translate(-50%,-10%) scale(.3) rotate(-20deg)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.25) rotate(8deg)}30%{transform:translate(-50%,-60%) scale(1) rotate(-6deg)}45%{transform:translate(-50%,-70%) rotate(6deg)}100%{opacity:0;transform:translate(-50%,-190%) scale(.9)}}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (prefers-reduced-motion:reduce){.fl-emo{animation:flEmoR 2.2s both}@keyframes flEmoR{0%,100%{opacity:0}10%,80%{opacity:1}}}`;
const st=document.createElement('style');st.textContent=css+css2+css3;document.head.appendChild(st);

function sideHTML(p,s,dir){const air=F.air[s],h=Math.round(16+(AIR-air)*(84/AIR));const img=p&&p.avatar&&/^data:image\//.test(p.avatar);
 const dots=`<span class="fl-air"><i style="width:${air/AIR*100}%;background:${air<=3?'#ff6b5e':air<=6?'#ffd257':'#5fe39a'}"></i></span> ${air}/${AIR}`;const hit=F.res&&F.res.lose.includes(s);
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
  <div class="card" style="margin-top:8px;color:#fff;border:0;background:repeating-linear-gradient(100deg,#1b3f61 0 14px,#214b72 14px 28px)"><div class="lbl" style="color:#dbe6f0">GAME · 1 ĐẤU 1</div><h1 style="margin:2px 0;color:#fff">Nước Dâng</h1><p style="margin:0;color:#dbe6f0;font-size:.92rem">Trả lời nhanh và đúng hơn bạn đấu. Ai chậm hay sai bị nước dâng lên, hết ${AIR} nấc hơi là thua. Trận ${NQ*2} câu: ${NQ} câu chủ đề của bạn + ${NQ} câu chủ đề đối thủ chọn.</p></div>
  <p class="mut" style="font-size:.85rem;margin:10px 0 0">Bước 1: chọn đối thủ. Bước 2: chọn chủ đề trong các khóa đối thủ đang học (STEEL, CEFR, IELTS…).</p>
  <div class="sec-h"><h2>Chọn đối thủ</h2></div><div class="stack">
  <button class="card row" style="flex-wrap:nowrap;gap:12px;text-align:left;width:100%" onclick="FLX.choose(null)"><span class="tile2-ic">🤖</span><span style="flex:1"><b>Kaka (máy)</b><small class="mut" style="display:block">Luôn sẵn sàng · đúng khoảng 70%</small></span><span class="chip">Đấu ngay</span></button>
  ${F.targets==null?'<p class="mut">Đang tải bạn bè…</p>':F.targets.length?F.targets.map(t=>{const on=F.online.has(t.user_id)||t.online===true||(t.seen&&now-t.seen<120000);return `<button class="card row" style="flex-wrap:nowrap;gap:12px;text-align:left;width:100%" onclick="FLX.choose('${t.user_id}')">${window.avatarHTML?avatarHTML(t.avatar,t.user_id,44):''}<span style="flex:1;min-width:0"><b>${esc2(t.name)}</b><small style="display:block;color:${on?'var(--good)':'var(--mut)'}">${on?'● Đang online':'Không online · có thể không kịp nhận lời'}</small></span><span class="chip">Mời</span></button>`}).join(''):'<p class="mut">Chưa có bạn bè. Kết bạn trong mục Thách đấu để mời nhé.</p>'}</div>`}
 if(F.v=='topic'){const tg=F.target,opName=tg?((F.targets||[]).find(t=>t.user_id==tg)||{}).name||'đối thủ':'Kaka',L=CRS[tg||'me'];
  if(F.needCourses)return `<button class="link" onclick="FLX.back()">‹ Chọn đối thủ</button><div class="note">Admin cần chạy lại <b>supabase/flood.sql</b> (bản mới có phần chọn khóa học).</div>`;
  return `<button class="link" onclick="FLX.back()">‹ Chọn đối thủ</button><h1 style="margin-top:6px">Đấu với ${esc2(opName)}</h1>
  <div class="sec-h"><h2>Khóa học</h2><span class="mut">${tg?'khóa '+esc2(opName)+' đang học':'khóa của bạn'}</span></div>
  ${L==null?'<p class="mut">Đang tải khóa học…</p>':L.length?`<div class="row" style="gap:8px;flex-wrap:wrap">${L.map(c=>`<button class="chip ${F.course&&F.course.id==c.id?'on':''}" aria-pressed="${!!(F.course&&F.course.id==c.id)}" onclick="FLX.pickCourse('${c.id}')">${esc2(c.name)}${c.mine?'':' · bạn chưa học'}</button>`).join('')}</div>`:`<div class="note">${esc2(opName)} chưa đăng ký khóa học nào nên chưa đấu được. Rủ họ vào Tài khoản để chọn khóa nhé.</div>`}
  ${F.course?`<div class="sec-h"><h2>Chủ đề của bạn</h2><span class="mut">10 câu</span></div>${F.words==null?'<p class="mut">Đang tải từ vựng…</p>':`<div class="row" style="gap:8px;flex-wrap:wrap">${topics(F.words,F.course).map(t=>`<button class="chip ${(F.topic||'*')==t.id?'on':''}" aria-pressed="${(F.topic||'*')==t.id}" onclick="FLX.tp('${esc2(t.id)}')">${esc2(t.n)} · ${t.c}</button>`).join('')}</div>`}
  <p class="mut" style="font-size:.85rem;margin:8px 0">${tg?esc2(opName)+' sẽ chọn 10 câu từ khóa bạn đang học khi nhận lời. ':''}Trận ${NQ*2} câu trộn xen kẽ.</p>
  <button class="btn" style="width:100%" ${F.words&&F.words.length>=4?'':'disabled'} onclick="FLX.invite(${tg?`'${tg}'`:'null'})">${tg?'Gửi lời thách đấu':'Đấu ngay với Kaka'}</button>`:''}`}
 if(F.v=='wait')return `<div class="fw-page"><div class="fw-big"><svg viewBox="0 0 68 68" aria-hidden="true"><circle cx="34" cy="34" r="30" fill="none" stroke="var(--line)" stroke-width="4"/><circle id="fw-arc" cx="34" cy="34" r="30" fill="none" stroke="#e39b1a" stroke-width="4" stroke-linecap="round" stroke-dasharray="${RING}" stroke-dashoffset="0" transform="rotate(-90 34 34)"/></svg><span>${window.avatarHTML?avatarHTML(F.op.avatar,F.op.user_id||F.op.name,104):''}</span></div>
  <span class="fi-tag" style="color:var(--steel)">ĐÃ GỬI LỜI THÁCH ĐẤU</span><h1 style="margin:4px 0">Chờ ${esc2(F.op.name)} xuống nước…</h1>
  <p id="fw-seen" class="mut" role="status" style="margin:0">Đang gõ cửa nhà ${esc2(F.op.name)}…</p><p class="fw-dots" aria-hidden="true"><i></i><i></i><i></i></p>
  <p class="mut" style="margin:0">Còn <b id="fl-wait">60 giây</b>. Bạn cứ đi học trang khác, thẻ chờ sẽ đi theo bạn.</p>
  <div class="row" style="gap:8px;justify-content:center;margin-top:8px"><button class="btn ghost" onclick="go('home')">Đi học trong lúc chờ</button><button class="btn ghost" style="color:var(--bad)" onclick="FLX.cancel()">Hủy lời mời</button></div></div>`;
 if(F.v=='end'&&F.slept)return vSleep();
 if(F.v=='end'){const me=side(),won=F.win===me,draw=F.win==null;const myOk=Object.values(F.ans).filter(a=>a&&a[me]&&a[me].ok).length,n=Object.keys(F.ans).length;
  const msA=Object.values(F.ans).map(a=>a&&a[me]).filter(x=>x&&x.ok).map(x=>x.ms);const avg=msA.length?(msA.reduce((a,b)=>a+b,0)/msA.length/1000).toFixed(1).replace('.',','):'–';
  const wrong=F.q.filter((q,i)=>F.ans[i]&&F.ans[i][me]&&!F.ans[i][me].ok).slice(0,4);
  return `${top()}<div class="fl-q"><div class="lbl" style="text-align:center">KẾT QUẢ</div><h1 style="margin:0;text-align:center">${draw?'Hòa!':won?'Bạn thắng!':esc2(F.op.name)+' thắng'}</h1>
  <p class="mut" style="margin:0;text-align:center">${draw?'Hai bạn còn số hơi bằng nhau.':won?esc2(F.op.name)+' đã hết hơi.':'Bạn đã hết hơi. Phục thù nhé!'}</p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center"><div class="card" style="padding:10px"><b style="font:800 1.4rem var(--fd);color:var(--good)">${myOk}/${n}</b><small class="mut" style="display:block">câu đúng</small></div><div class="card" style="padding:10px"><b style="font:800 1.4rem var(--fd)">${avg}s</b><small class="mut" style="display:block">trung bình</small></div><div class="card" style="padding:10px"><b style="font:800 1.4rem var(--fd);color:var(--warn)">+${F.xp} XP</b><small class="mut" style="display:block">${won?'thắng':draw?'hòa':'tham gia'}</small></div></div>
  ${wrong.length?`<div class="card stack" style="gap:6px;padding:12px"><b>Ôn lại câu bạn trả lời sai</b>${wrong.map(q=>`<span class="mut">${q.k=='pron'?'Đọc lại: ':esc2(q.q)+' → '}<b style="color:var(--ink)">${esc2(q.k=='pron'?q.target+' ('+(q.vi||'')+')':q.o[q.a])}</b></span>`).join('')}</div>`:''}
  <button class="btn" onclick="FLX.again()">${F.bot?'Đấu lại với Kaka':'Phục thù · mời lại'}</button><button class="btn ghost" onclick="FLX.cancel()">Chọn đối thủ khác</button></div>`}
 /* đang chơi */
 const q=F.q[F.i];
 if(!q)return `${top()}<div class="fl-q"><h2 style="text-align:center;margin:20px 0">${F.host||F.bot?'Chuẩn bị…':'Đang kết nối với '+esc2(F.op.name)+'…'}</h2><button class="btn ghost" onclick="FLX.cancel()">Rời trận</button></div>`;
 const R=F.res;const me=side();
 const fb=R?(R.lose.length==2?'Cả hai đều sai, cùng dâng nước!':R.win===me?`✓ Bạn thắng câu này${R.A[other()]&&R.A[other()].ok?` · nhanh hơn ${((R.A[other()].ms-R.A[me].ms)/1000).toFixed(1).replace('.',',')} giây`:''}`:(R.A[me]&&R.A[me].ok?`${esc2(F.op.name)} nhanh hơn ${((R.A[me].ms-R.A[other()].ms)/1000).toFixed(1).replace('.',',')} giây`:'✗ Sai rồi, nước bên bạn dâng lên')):(F.pick!=null?'Đã chọn · chờ đối thủ…':'');
 return `${top()}<div class="fl-q play"><div class="row" style="justify-content:space-between"><span class="lbl">${KL[q.k]||''}</span><span class="row" style="gap:6px;flex-wrap:nowrap"><button class="ic" onclick="FLX.snd()" aria-label="${SND.on?'Tắt':'Bật'} nhạc" aria-pressed="${SND.on}">${SND.on?'🔊':'🔇'}</button><button class="link" style="font-size:.85rem" onclick="FLX.cancel()">Rời trận</button></span></div>
 ${q.by?`<small class="mut" style="margin-top:-6px">Chủ đề của ${q.by===me?'bạn':esc2(F.op.name)}: ${esc2(q.by=='a'?(me=='a'?F.myTopic:F.opTopic):(me=='b'?F.myTopic:F.opTopic))||''}</small>`:''}
 ${q.k=='pron'?`<div style="text-align:center"><h2 style="margin:0;font:800 2rem/1.15 var(--fd)">${esc2(q.target)}</h2><div class="mut">${esc2(q.vi||'')}</div></div>`:`<h2 style="margin:0;font-size:1.45rem;line-height:1.25;text-wrap:balance">${esc2(q.q)}</h2>${q.hint?`<small class="mut">${esc2(q.hint)}</small>`:''}`}${q.say?`<button class="chip" style="align-self:flex-start;min-height:44px;${F.lock?'background:var(--steel);color:#fff':''}" onclick="say(${esc2(JSON.stringify(q.say))},0.8)" aria-label="Nghe lại chậm">${F.lock?'🔊 Đang đọc… nghe kỹ nhé':'🔊 Nghe lại (chậm)'}</button>`:''}
 <div class="fl-ans">${q.k=='pron'?`<div style="display:flex;flex-direction:column;align-items:center;gap:8px"><button class="fl-mic ${F.rec?'rec':''}" onclick="FLX.pron()" ${F.pick!=null||R||F.grading?'disabled':''} aria-label="${F.rec?'Dừng và chấm':'Bấm để đọc'}"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4"/></svg></button><small class="mut">${F.rec?'● Đang nghe… đọc to rồi chạm để dừng':F.grading?'AI đang chấm…':F.pscore!=null?`AI nghe: “${esc2(F.heard||'…')}” · <b style="color:${F.pscore>=70?'var(--good)':'var(--bad)'}">${F.pscore} điểm</b>`:'Bấm micro, đọc to từ trên · đạt 70 điểm là đúng'}</small><button class="chip" onclick="say(${esc2(JSON.stringify(q.target))},0.85)">🔊 Nghe mẫu</button></div>`:`<div class="fl-opts">${q.o.map((o,k)=>{const cls=R?(k===q.a?'ok':k===F.pick?'no':''):(k===F.pick?'ok':'');return `<button class="${cls}" ${F.pick!=null||R||F.lock?'disabled':''} style="${F.lock?'opacity:.45':''}" onclick="FLX.answer(${k})">${esc2(o)}</button>`}).join('')}</div>`}
 <div role="status" style="min-height:44px;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:600;color:${R&&R.win===me?'var(--good)':R?'var(--bad)':'var(--mut)'}">${fb}</div>
 <div class="fl-act">${F.chat?`<div class="fl-chat" role="group" aria-label="Nhắn nhanh"><div class="fl-qk">${QUICK.map(q=>`<button onclick="FLX.say(${esc2(JSON.stringify(q))})">${esc2(q)}</button>`).join('')}</div><form class="fl-cin" onsubmit="event.preventDefault();FLX.say(this.m.value)"><input name="m" maxlength="80" autocomplete="off" placeholder="Nhắn gì đó cho ${esc2(F.op&&F.op.name||'đối thủ')}…" aria-label="Nội dung nhắn"><button aria-label="Gửi">➤</button></form></div>`:''}${F.tray?`<div class="fl-pie" role="group" aria-label="Chọn biểu cảm chọc đối thủ">${EMOS.map((e,k)=>{const a=(168-k*(156/(EMOS.length-1)))*Math.PI/180,R=134;return `<button style="--x:${Math.round(Math.cos(a)*R)}px;--y:${Math.round(-Math.sin(a)*R)}px;animation-delay:${k*25}ms" onclick="FLX.emo('${e}')" aria-label="Thả ${e}${TAUNT[e]?' '+TAUNT[e]:''}">${e}</button>`}).join('')}</div>`:''}<button class="fl-sl" onclick="FLX.sleep()" ${F.sleepWait?'disabled':''} aria-label="Xin đối thủ dừng trận để đi ngủ">${F.sleepWait?'😴 Đang xin…':'😴 Xin ngủ'}</button><button class="fl-sl fl-cbtn" onclick="FLX.chat()" aria-expanded="${!!F.chat}" aria-label="Nhắn nhanh cho đối thủ">${F.chat?'✕ Đóng':'💬 Nhắn'}</button><button class="fl-tbtn" onclick="FLX.tray()" aria-expanded="${!!F.tray}" aria-label="Chọc đối thủ">${F.tray?'✕ Đóng':'😜 Chọc'}</button></div></div></div>`}
function again(){const b=F.m&&F.m.b;const t=F.bot?null:(F.host?b:F.m.a);if(F.course&&(F.target||null)===(t||null))invite(t);else choose(t)}
window.vFlood=vFlood; async function choose(t){F.target=t;F.course=null;F.words=null;F.topic='*';F.v='topic';rr();const L=await courses(t);
 const pref=(L||[]).find(c=>c.mine)||(L||[])[0];if(pref)await pickCourse(pref.id);else rr()}
async function pickCourse(id){const L=CRS[F.target||'me']||[];F.course=L.find(c=>c.id==id)||null;F.words=null;F.topic='*';rr();if(F.course){F.words=await wordsOf(F.course,F.target);rr()}}
window.FLX={chat:()=>{F.chat=!F.chat;F.tray=false;rr();if(F.chat)setTimeout(()=>document.querySelector('.fl-cin input')?.focus({preventScroll:true}),50)},say:sendTxt,tray:()=>{F.tray=!F.tray;F.chat=false;rr()},sleep:sleepReq,sleepAns,emo:sendEmo,choose,pickCourse,back:()=>{F.v='pick';rr()},rc:v=>{F.rCourse=v},pron,tp:v=>{F.topic=v;rr()},rt:v=>{F.rTopic=v},_fast:fastInv,snd:sndToggle,invite,answer,cancel,respond,again};
/* thẻ vào game ở trang Thách đấu */
window.floodCard=()=>`<button class="card login-nudge" onclick="FLD.v='pick';go('flood')" style="background:linear-gradient(140deg,#1e88e5,#0b3b6e);color:#fff;border:0"><span class="tile2-ic" style="background:rgba(255,255,255,.2)">🌊</span><span style="flex:1;text-align:left"><b style="color:#fff">Nước Dâng · đấu 1-1</b><small style="color:#dbe6f0">Ai chậm bị nước dâng · realtime</small></span><span class="chev" style="color:#fff">›</span></button>`;
})();
