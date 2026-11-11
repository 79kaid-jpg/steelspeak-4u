/* ===================== HUY HIỆU (kiểu Garmin) =====================
 Trao huy hiệu bất ngờ khi người học đạt mốc: chuỗi ngày, XP, số bài, điểm tuyệt đối, phát âm,
 shadowing, bài truyện, chứng chỉ… và vài huy hiệu bí ẩn (cú đêm, chim sớm, mùa lễ…).
 Lưu trên máy (localStorage 'ssbadge') và đồng bộ lên tài khoản (bảng user_badges, supabase/badges.sql).
 Huy hiệu mới nhất hiện cạnh ảnh đại diện. */
(function(){
/* ---------- biểu tượng (nét trắng, khung 24) ---------- */
const IC={
 fire:'<path d="M12 3c1 3 4 4.5 4 8.5A4 4 0 0 1 8 12c0-1.5.6-2.6 1.3-3.4C9.5 10 10.5 10.5 11 10c.5-2.5 0-5 1-7z"/><path d="M10 17.5a2 2 0 0 0 4 0c0-1.5-1-2.2-2-3.5-1 1.3-2 2-2 3.5z"/>',
 bolt:'<path d="M13 2 5 13h6l-1 9 8-11h-6z"/>',
 book:'<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z"/><path d="M4 20a2 2 0 0 0 2 2h13v-4"/><path d="M9 7h6"/>',
 target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8"/>',
 mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
 phones:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
 layers:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
 pen:'<path d="M15 4l5 5L9 20H4v-5z"/><path d="M13 6l5 5"/>',
 share:'<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>',
 medal:'<circle cx="12" cy="14" r="6"/><path d="M8.5 3h7L14 9h-4z"/><path d="m12 11.5.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z"/>',
 goal:'<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
 moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/><path d="M16 4.5h3M17.5 3v3"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>',
 rocket:'<path d="M5 19c0-3 1-5 3-6l3 3c-1 2-3 3-6 3z"/><path d="M8 13C10 7 14 4 20 4c0 6-3 10-9 12z"/><circle cx="15" cy="9" r="1.5"/>',
 chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
 vibe:'<rect x="8" y="3" width="8" height="18" rx="2"/><path d="M4 8v8M20 8v8M1.5 10v4M22.5 10v4"/>',
 tree:'<path d="M12 2 6 10h3l-4 6h14l-4-6h3z"/><path d="M12 16v5"/>',
 flower:'<circle cx="12" cy="12" r="2.5"/><path d="M12 9.5C10 6 10 3.5 12 3c2 .5 2 3 0 6.5M14.5 12c3.5-2 6-2 6.5 0-.5 2-3 2-6.5 0M12 14.5c2 3.5 2 6 0 6.5-2-.5-2-3 0-6.5M9.5 12C6 14 3.5 14 3 12c.5-2 3-2 6.5 0"/>',
 crown:'<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>'};

/* ---------- danh mục huy hiệu ---------- */
const T={b:['#f3c49c','#b86b34','#6e3a14'],s:['#f4f7fa','#a9b5c2','#56626f'],g:['#ffe58a','#d6a21a','#7d5a05'],p:['#e9f6ff','#8fc3e6','#2c5f86'],x:['#ffd6f0','#c85aa6','#6a1f57']};
const TN={b:'Đồng',s:'Bạc',g:'Vàng',p:'Bạch kim',x:'Đặc biệt'};
const CATS=[['streak','Chuỗi ngày học'],['xp','Kinh nghiệm'],['lesson','Bài học'],['skill','Kỹ năng'],['create','Sáng tạo & chia sẻ'],['cert','Chứng chỉ'],['secret','Bí ẩn & mùa lễ']];
// [id, cat, tên, mô tả, hạng, hình, màu lõi, icon, chỉ số, mốc, bí ẩn?, gợi ý]
const B=[
 ['streak3','streak','Khởi động','Học 3 ngày liên tiếp','b','shield','#e8590c','fire','streak',3],
 ['streak7','streak','Một tuần bền bỉ','Học 7 ngày liên tiếp','s','shield','#e8590c','fire','streak',7],
 ['streak30','streak','Tháng thép','Học 30 ngày liên tiếp','g','shield','#d9480f','fire','streak',30],
 ['streak100','streak','Bất khuất','Học 100 ngày liên tiếp','p','shield','#c92a2a','fire','streak',100],
 ['xp500','xp','Tia lửa','Đạt 500 XP','b','circle','#f08c00','bolt','xp',500],
 ['xp2000','xp','Dòng điện','Đạt 2.000 XP','s','circle','#f08c00','bolt','xp',2000],
 ['xp10000','xp','Cao áp','Đạt 10.000 XP','g','circle','#e67700','bolt','xp',10000],
 ['xp50000','xp','Nhà máy điện','Đạt 50.000 XP','p','circle','#d9480f','bolt','xp',50000],
 ['lesson1','lesson','Bước đầu tiên','Hoàn thành bài học đầu tiên','b','circle','#1f4e79','book','lesson',1],
 ['lesson10','lesson','Chăm chỉ','Hoàn thành 10 bài học','s','circle','#1f4e79','book','lesson',10],
 ['lesson50','lesson','Mọt sách','Hoàn thành 50 bài học','g','circle','#1864ab','book','lesson',50],
 ['lesson200','lesson','Học giả','Hoàn thành 200 bài học','p','circle','#1971c2','book','lesson',200],
 ['goal1','lesson','Về đích','Đạt mục tiêu XP trong ngày lần đầu','b','circle','#2b8a3e','goal','goalDays',1],
 ['goal7','lesson','Kỷ luật thép','Đạt mục tiêu XP ngày 7 lần','g','circle','#2b8a3e','goal','goalDays',7],
 ['perfect1','skill','Không tì vết','Đúng 100% một bài học','b','hex','#2f9e44','target','perfect',1],
 ['perfect10','skill','Xạ thủ','Đúng 100% ở 10 bài học','g','hex','#2b8a3e','target','perfect',10],
 ['speak1','skill','Giọng chuẩn','Đạt từ 90 điểm phát âm','b','hex','#7048e8','mic','speak90',1],
 ['speak20','skill','Giọng vàng','Đạt từ 90 điểm phát âm 20 lần','g','hex','#6741d9','mic','speak90',20],
 ['shadow1','skill','Cái bóng','Hoàn thành đủ 4 vòng Shadowing','s','hex','#0c8599','phones','shadow',1],
 ['topic1','skill','Trọn vẹn 4 kỹ năng','Xong cả 4 phần của một bài chủ đề','s','hex','#1098ad','layers','topicFull',1],
 ['story1','create','Người kể chuyện','Tự tạo bài học từ truyện ngắn','b','hex','#c2255c','pen','stories',1],
 ['share1','create','Lan tỏa','Bài truyện được chia sẻ cho cả khóa','g','hex','#a61e4d','share','shared',1],
 ['cert1','cert','Có bằng cấp','Nhận chứng chỉ đầu tiên','s','circle','#5c3d9e','medal','certs',1],
 ['cert5','cert','Bộ sưu tập vàng','Nhận 5 chứng chỉ','p','circle','#4c2a85','medal','certs',5],
 ['night','secret','Cú đêm','Học sau 23 giờ','x','burst','#364fc7','moon','night',1,1,'Học vào một thời điểm ít ai học'],
 ['early','secret','Chim sớm','Học trước 6 giờ 30 sáng','x','burst','#f59f00','sun','early',1,1,'Thử học khi mọi người còn ngủ'],
 ['weekend','secret','Chiến binh cuối tuần','Học cả thứ Bảy và Chủ nhật trong cùng một tuần','x','burst','#0b7285','cal','weekend',1,1,'Cuối tuần cũng không nghỉ'],
 ['comeback','secret','Trở lại mạnh mẽ','Quay lại học sau 7 ngày vắng','x','burst','#e03131','rocket','comeback',1,1,'Ai cũng có lúc chững lại…'],
 ['hello','secret','Xin chào Admin','Gửi tin nhắn đầu tiên','x','burst','#1c7ed6','chat','msg',1,1,'Kết nối với người đồng hành'],
 ['buzz','secret','Rung chuyển','Gửi BUZZ đầu tiên','x','burst','#f03e3e','vibe','buzz',1,1,'Một cách gây chú ý rất… thời Yahoo'],
 ['noel','secret','Giáng sinh an lành','Học trong tháng 12','x','burst','#2b8a3e','tree','noel',1,1,'Huy hiệu giới hạn theo mùa'],
 ['tet','secret','Xuân Như Ý','Học trong dịp Tết Nguyên đán','x','burst','#e03131','flower','tet',1,1,'Huy hiệu giới hạn theo mùa'],
 ['all4','secret','Toàn năng','Sở hữu 20 huy hiệu','p','burst','#495057','crown','badges',20,1,'Sưu tầm thật nhiều huy hiệu']
].map(a=>({id:a[0],cat:a[1],name:a[2],desc:a[3],tier:a[4],shape:a[5],core:a[6],icon:a[7],key:a[8],goal:a[9],hidden:!!a[10],hint:a[11]||''}));
const BY=Object.fromEntries(B.map(b=>[b.id,b]));

/* ---------- vẽ huy hiệu ---------- */
let uid=0;
function shapePath(s){if(s=='hex')return 'M32 3 57 17.5v29L32 61 7 46.5v-29z';if(s=='shield')return 'M32 3 56 11v20c0 15-10 25-24 30C18 56 8 46 8 31V11z';
 if(s=='burst'){let d='';for(let i=0;i<24;i++){const r=i%2?26:30.5,a=Math.PI*2*i/24-Math.PI/2;d+=(i?'L':'M')+(32+r*Math.cos(a)).toFixed(1)+' '+(32+r*Math.sin(a)).toFixed(1)}return d+'Z'}
 return 'M32 2a30 30 0 1 0 .01 0z'}
function badgeSVG(b,sz=56,locked=false){const t=T[b.tier],id='bg'+(++uid),sh=shapePath(b.shape);
 const inner=b.shape=='circle'?'M32 9a23 23 0 1 0 .01 0z':b.shape=='hex'?'M32 10 51 21v22L32 54 13 43V21z':b.shape=='shield'?'M32 10 49 16v15c0 11-7 19-17 23-10-4-17-12-17-23V16z':'M32 10a22 22 0 1 0 .01 0z';
 const glyph=locked&&b.hidden?'<path d="M9.5 9a2.6 2.6 0 1 1 3.6 2.4c-.8.4-1.1.9-1.1 1.8M12 16.5v.1"/>':(IC[b.icon]||IC.medal);
 return `<svg width="${sz}" height="${sz}" viewBox="0 0 64 64" aria-hidden="true" style="flex:none;${locked?'filter:grayscale(1);opacity:.38':''}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t[0]}"/><stop offset=".55" stop-color="${t[1]}"/><stop offset="1" stop-color="${t[0]}"/></linearGradient><radialGradient id="${id}c" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
 <path d="${sh}" fill="url(#${id})" stroke="${t[2]}" stroke-width="1.5"/><path d="${inner}" fill="${locked?'#868e96':b.core}" stroke="${t[2]}" stroke-opacity=".5"/><path d="${inner}" fill="url(#${id}c)"/>
 <g transform="translate(20 20)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glyph}</g></svg>`}

/* ---------- trạng thái ---------- */
const K='ssbadge';let ST={earned:{},cnt:{},last:null,seen:{}};
try{const x=JSON.parse(localStorage.getItem(K)||'null');if(x)ST={...ST,...x}}catch(e){}
const saveST=()=>{try{localStorage.setItem(K,JSON.stringify(ST))}catch(e){}};
const g=v=>{try{return v()}catch(e){return undefined}};
function stats(){const c=ST.cnt;return {
 streak:g(()=>S.streak)||0,xp:g(()=>S.xp)||0,lesson:c.lesson||0,goalDays:c.goalDays||0,perfect:c.perfect||0,speak90:c.speak90||0,shadow:c.shadow||0,
 topicFull:g(()=>{const n={};for(const k of Object.keys(TLP.done)){const id=k.split(':')[0];n[id]=(n[id]||0)+1}return Object.values(n).filter(v=>v>=4).length})||0,
 stories:g(()=>TLP.mine.length)||0,shared:g(()=>TLP.mine.filter(x=>x.shared=='live').length)||0,certs:g(()=>(CERT.list||[]).length)||0,
 night:c.night||0,early:c.early||0,weekend:c.weekend||0,comeback:c.comeback||0,msg:c.msg||0,buzz:c.buzz||0,noel:c.noel||0,tet:c.tet||0,badges:Object.keys(ST.earned).length}}
const TET=[['2027-01-30','2027-02-15'],['2028-01-19','2028-02-04'],['2029-02-05','2029-02-22']];
/* một lần học: ghi nhận thời điểm, cuối tuần, quay lại, mùa lễ */
function studied(){const d=new Date(),h=d.getHours()+d.getMinutes()/60,ymd=d.toISOString().slice(0,10),c=ST.cnt;
 if(h>=23||h<4)c.night=(c.night||0)+1;if(h>=4&&h<6.5)c.early=(c.early||0)+1;
 const wk=(()=>{const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x.toISOString().slice(0,10)})();
 const dw=d.getDay();if(dw==6||dw==0){c.wk=c.wk&&c.wk.w==wk?c.wk:{w:wk,sat:0,sun:0};if(dw==6)c.wk.sat=1;else c.wk.sun=1;if(c.wk.sat&&c.wk.sun)c.weekend=1}
 if(ST.last&&Date.now()-ST.last>=7*864e5)c.comeback=1;ST.last=Date.now();
 if(ymd.slice(5,7)=='12')c.noel=1;if(TET.some(([a,b])=>ymd>=a&&ymd<=b))c.tet=1}
function evt(type,v){const c=ST.cnt;
 if(type=='lesson'){c.lesson=(c.lesson||0)+1;if(v>=100)c.perfect=(c.perfect||0)+1;studied()}
 else if(type=='speak'){if(v>=90)c.speak90=(c.speak90||0)+1;studied()}
 else if(type=='study')studied();
 else c[type]=(c[type]||0)+1;
 saveST();check()}

/* ---------- trao huy hiệu ---------- */
let Q=[],first=true;
function check(){if(g(()=>typeof S=='undefined'))return;const s=stats();
 const c=ST.cnt,today=(window.ymdLocal?ymdLocal():new Date().toISOString().slice(0,10));
 if(g(()=>S.goal&&S.tdate==today&&(S.txp||0)>=S.goal)&&c.goalDay!==today){c.goalDay=today;c.goalDays=(c.goalDays||0)+1;s.goalDays=c.goalDays}
 const fresh=[];for(let pass=0;pass<2;pass++)for(const b of B){if(ST.earned[b.id])continue;const val=b.key=='badges'?Object.keys(ST.earned).length:s[b.key];if(val>=b.goal){ST.earned[b.id]=Date.now();fresh.push(b)}}
 if(!fresh.length){saveST();return}
 saveST();syncUp(fresh);
 const silent=first&&fresh.length>3; // lần đầu bật tính năng: không dồn quá nhiều hộp chúc mừng
 first=false;Q.push(...(silent?[{summary:fresh}]:fresh));showNext();try{if(S.tab!=='msg')render()}catch(e){}}
setTimeout(()=>{first=true;check();first=false},2500);
setInterval(check,6000);

/* ---------- hộp chúc mừng ---------- */
let showing=false;
function chime(){try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const c=new A(),n=c.currentTime;[523,659,784,1047].forEach((f,i)=>{const o=c.createOscillator(),gn=c.createGain();o.type='triangle';o.frequency.value=f;gn.gain.setValueAtTime(.0001,n+i*.09);gn.gain.exponentialRampToValueAtTime(.16,n+i*.09+.02);gn.gain.exponentialRampToValueAtTime(.0001,n+i*.09+.45);o.connect(gn).connect(c.destination);o.start(n+i*.09);o.stop(n+i*.09+.5)});setTimeout(()=>c.close(),1200)}catch(e){}}
function css(){if(document.getElementById('bdgcss'))return;const st=document.createElement('style');st.id='bdgcss';st.textContent=`
.bdg-ov{position:fixed;inset:0;z-index:2147483647;background:rgba(8,14,20,.72);display:flex;align-items:center;justify-content:center;padding:20px;animation:bdgf .25s ease-out}
.bdg-card{position:relative;width:min(340px,100%);background:var(--card);color:var(--ink);border-radius:24px;padding:28px 22px 20px;text-align:center;box-shadow:0 20px 60px #0007;overflow:hidden}
.bdg-card .rays{position:absolute;left:50%;top:92px;width:420px;height:420px;margin:-210px 0 0 -210px;background:repeating-conic-gradient(from 0deg,color-mix(in srgb,var(--amber) 22%,transparent) 0 10deg,transparent 10deg 20deg);border-radius:50%;animation:bdgr 14s linear infinite;pointer-events:none;mask:radial-gradient(circle,#000 30%,transparent 70%);-webkit-mask:radial-gradient(circle,#000 30%,transparent 70%)}
.bdg-pop{position:relative;display:inline-block;animation:bdgp .9s cubic-bezier(.2,1.4,.4,1) both;filter:drop-shadow(0 8px 14px #0005)}
.bdg-card h2{margin:14px 0 4px;font-size:1.5rem}.bdg-card .k{font-family:var(--fd);text-transform:uppercase;letter-spacing:.12em;font-size:.76rem;color:var(--warn);font-weight:700}
.bdg-cf{position:absolute;top:-12px;width:8px;height:14px;border-radius:2px;animation:bdgc 2.2s ease-in forwards;pointer-events:none}
.bdg-mini{display:inline-flex;align-items:center}.bdg-mini>span{display:inline-flex;margin-left:-8px;border-radius:50%;filter:drop-shadow(0 1px 2px #0004)}.bdg-mini>span:first-child{margin-left:0}
@keyframes bdgf{from{opacity:0}}@keyframes bdgr{to{transform:rotate(360deg)}}
@keyframes bdgp{0%{transform:scale(.2) rotate(-200deg);opacity:0}60%{transform:scale(1.15) rotate(10deg);opacity:1}100%{transform:scale(1) rotate(0)}}
@keyframes bdgc{to{transform:translateY(520px) rotate(540deg);opacity:0}}
@media (prefers-reduced-motion:reduce){.bdg-ov,.bdg-pop,.bdg-card .rays,.bdg-cf{animation:none!important}.bdg-cf{display:none}}`;document.head.appendChild(st)}
function showNext(){if(showing||!Q.length)return;if(document.querySelector('.saga-modal,.bdg-ov'))return setTimeout(showNext,1500);
 const it=Q.shift();showing=true;css();const sum=it.summary;const b=sum?sum[sum.length-1]:it;
 const ov=document.createElement('div');ov.className='bdg-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','bdgt');
 const conf=Array.from({length:26},(_,i)=>`<i class="bdg-cf" style="left:${Math.random()*100}%;background:${['#f59f00','#e64980','#228be6','#40c057','#fab005','#7950f2'][i%6]};animation-delay:${Math.random()*.6}s"></i>`).join('');
 ov.innerHTML=`<div class="bdg-card"><div class="rays"></div>${conf}<div class="k">${sum?'Bộ sưu tập huy hiệu':'Huy hiệu mới!'}</div>
 <div style="margin-top:14px">${sum?`<div class="bdg-pop" style="display:flex;justify-content:center;gap:4px;flex-wrap:wrap">${sum.slice(-6).map(x=>badgeSVG(x,58)).join('')}</div>`:`<div class="bdg-pop">${badgeSVG(b,128)}</div>`}</div>
 <h2 id="bdgt">${sum?'Bạn đã có '+sum.length+' huy hiệu!':esc(b.name)}</h2>
 <p class="mut" style="margin:0 0 4px">${sum?'Từ quá trình học trước đây. Xem từng huy hiệu trong bộ sưu tập.':esc(b.desc)}</p>
 ${sum?'':`<p style="margin:0;font-size:.8rem;color:var(--mut)">Hạng ${TN[b.tier]}${b.hidden?' · Huy hiệu bí ẩn':''}</p>`}
 <div class="stack" style="margin-top:16px"><button class="btn" id="bdgok">Tuyệt vời!</button><button class="btn ghost" id="bdgall">Xem bộ sưu tập</button></div></div>`;
 document.body.appendChild(ov);chime();try{navigator.vibrate&&navigator.vibrate([60,40,120])}catch(e){}
 const close=go2=>{ov.remove();showing=false;document.removeEventListener('keydown',kd);if(go2){BDG.sel=null;go('badges')}setTimeout(showNext,350)};
 const kd=e=>{if(e.key==='Escape')close()};document.addEventListener('keydown',kd);
 ov.querySelector('#bdgok').onclick=()=>close();ov.querySelector('#bdgall').onclick=()=>close(true);ov.onclick=e=>{if(e.target===ov)close()};
 setTimeout(()=>ov.querySelector('#bdgok').focus(),50)}

/* ---------- đồng bộ tài khoản ---------- */
async function syncUp(list){try{if(!USER||!SB)return;await SB.from('user_badges').upsert(list.map(b=>({user_id:USER.id,badge:b.id,earned_at:new Date(ST.earned[b.id]).toISOString()})),{onConflict:'user_id,badge',ignoreDuplicates:true})}catch(e){}}
let syncedFor=null;
async function syncDown(){try{if(!USER||!SB||syncedFor===USER.id)return;syncedFor=USER.id;
 const {data,error}=await SB.from('user_badges').select('badge,earned_at').eq('user_id',USER.id);if(error)return;
 let ch=0;for(const r of data||[])if(BY[r.badge]&&!ST.earned[r.badge]){ST.earned[r.badge]=new Date(r.earned_at).getTime();ch=1}
 const missing=Object.keys(ST.earned).filter(k=>!(data||[]).some(r=>r.badge==k));if(missing.length)syncUp(missing.map(k=>BY[k]).filter(Boolean));
 if(ch){saveST();try{render()}catch(e){}}}catch(e){}}
setInterval(()=>{try{if(USER&&syncedFor!==USER.id)syncDown()}catch(e){}},3000);

/* ---------- móc vào các sự kiện của app ---------- */
function wrap(name,after){const f=window[name];if(typeof f!='function'||f._bdg)return false;const w=function(...a){const r=f.apply(this,a);try{after(r,a)}catch(e){}return r};Object.assign(w,f);w._bdg=1;window[name]=w;return true}
function hook(){
 wrap('vDone',()=>{const gm=S.game;if(gm&&!gm.bdg&&gm.pool&&gm.pool.length){gm.bdg=1;evt('lesson',Math.round(gm.ok/gm.pool.length*100))}});
 wrap('gradeSpeech',(r,a)=>{if(!a[3]&&r&&r.score!=null)evt('speak',r.score)});
 wrap('tlMark',()=>evt('study'));
 if(window.NTX&&!NTX._bdg){NTX._bdg=1;const s=NTX.send,bz=NTX.buzz;NTX.send=async(...a)=>{const r=await s(...a);evt('msg');return r};NTX.buzz=async(...a)=>{const r=await bz(...a);evt('buzz');return r}}}
setTimeout(hook,0);setTimeout(hook,1500);
window.addEventListener('ss-shadow-done',()=>evt('shadow'));

/* ---------- giao diện ---------- */
const latest=n=>Object.entries(ST.earned).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([k])=>BY[k]).filter(Boolean);
function mini(n=3,sz=24){const L=latest(n);if(!L.length)return '';return `<span class="bdg-mini" aria-hidden="true">${L.map(b=>`<span>${badgeSVG(b,sz)}</span>`).join('')}</span>`}
function topBar(){css();const L=latest(3);if(!L.length)return '';return `<button onclick="BDG.sel=null;go('badges')" aria-label="Huy hiệu mới nhất: ${L.map(b=>esc(b.name)).join(', ')}" style="position:absolute;right:-8px;bottom:-12px;display:inline-flex;align-items:flex-end;justify-content:flex-end;min-width:44px;min-height:30px;padding:0">${mini(3,19)}</button>`}
function meRow(){css();const n=Object.keys(ST.earned).length;
 return `<div class="sec-h" style="align-items:baseline"><h2>Huy hiệu</h2><span class="mut" style="font-size:.84rem">${n}/${B.length}</span></div>
 <button class="card" onclick="BDG.sel=null;go('badges')" style="width:100%;display:flex;align-items:center;gap:10px;text-align:left;min-height:64px">${n?`<span style="display:flex;gap:4px">${latest(4).map(b=>badgeSVG(b,46)).join('')}</span>`:badgeSVG(B[8],46,true)}<span style="flex:1;min-width:0"><b style="display:block">${n?esc(latest(1)[0].name):'Chưa có huy hiệu'}</b><small class="mut">${n?'Mới nhất · '+new Date(latest(1).length?ST.earned[latest(1)[0].id]:0).toLocaleDateString('vi-VN'):'Hoàn thành bài học đầu tiên để nhận'}</small></span><span class="chev">›</span></button>`}
function progress(b){const s=stats();const v=b.key=='badges'?Object.keys(ST.earned).length:(s[b.key]||0);return {v:Math.min(v,b.goal),pct:Math.min(100,Math.round(v/b.goal*100))}}
function vBadgeShelf(){css();const n=Object.keys(ST.earned).length;const sel=BDG.sel&&BY[BDG.sel];
 const tile=b=>{const e=ST.earned[b.id],lockedHidden=!e&&b.hidden;return `<button onclick="BDG.sel='${b.id}';render()" aria-label="${lockedHidden?'Huy hiệu bí ẩn':esc(b.name)}${e?' · đã đạt':''}" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;min-height:44px;border-radius:14px;${sel&&sel.id==b.id?'background:var(--soft)':''}">${badgeSVG(b,62,!e)}<small style="font-size:.74rem;line-height:1.2;font-weight:600;${e?'':'color:var(--mut)'}">${lockedHidden?'???':esc(b.name)}</small>${!e&&!b.hidden&&b.goal>1?`<span style="display:block;width:46px;height:4px;border-radius:9px;background:var(--line);overflow:hidden"><i style="display:block;height:100%;width:${progress(b).pct}%;background:var(--amber)"></i></span>`:''}</button>`};
 const det=sel?(()=>{const e=ST.earned[sel.id],hid=!e&&sel.hidden,p=progress(sel);return `<div class="card" style="display:flex;gap:14px;align-items:center;margin-top:12px">${badgeSVG(sel,84,!e)}<div style="min-width:0"><div class="lbl">${hid?'Huy hiệu bí ẩn':'Hạng '+TN[sel.tier]}</div><b style="font-size:1.1rem">${hid?'???':esc(sel.name)}</b><p class="mut" style="margin:2px 0 0;font-size:.88rem">${hid?esc(sel.hint):esc(sel.desc)}</p><p style="margin:4px 0 0;font-size:.82rem">${e?'✓ Đạt ngày '+new Date(e).toLocaleDateString('vi-VN'):hid?'':sel.goal>1?'Tiến độ: '+p.v.toLocaleString('vi')+' / '+sel.goal.toLocaleString('vi'):'Chưa đạt'}</p></div></div>`})():'';
 return `<button class="link" onclick="go('me')">‹ Tài khoản</button><h1 style="margin-top:6px">Huy hiệu</h1>
 <div class="row" style="justify-content:space-between;margin-top:6px"><span class="mut">${n} / ${B.length} đã mở khóa</span><span class="mono mut" style="font-size:.8rem">${Math.round(n/B.length*100)}%</span></div>
 <div style="height:6px;border-radius:9px;background:var(--line);overflow:hidden;margin-top:6px"><i style="display:block;height:100%;width:${n/B.length*100}%;background:var(--amber)"></i></div>
 ${det}
 ${CATS.map(([c,nm])=>{const L=B.filter(b=>b.cat==c);const k=L.filter(b=>ST.earned[b.id]).length;return `<div class="sec-h" style="align-items:baseline"><h2>${nm}</h2><span class="mut" style="font-size:.84rem">${k}/${L.length}</span></div><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2px">${L.map(tile).join('')}</div>`}).join('')}
 <p class="mut" style="font-size:.8rem;margin-top:16px">Huy hiệu bí ẩn chỉ lộ diện khi bạn đạt được. Một số huy hiệu mùa lễ chỉ có trong thời gian giới hạn.</p>`}

window.BDG={sel:null,svg:badgeSVG,mini,topBar,meRow,evt,check,list:B};
window.vBadgeShelf=vBadgeShelf;
})();
