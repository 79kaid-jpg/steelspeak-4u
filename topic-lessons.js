/* ===================== BÀI HỌC THEO CHỦ ĐỀ (General English) =====================
 Mỗi bài có 4 phần: Từ vựng · Đọc hiểu · Nghe · Phát âm.
 Thêm bài mới: thêm 1 object vào TOPIC_LESSONS theo đúng mẫu bên dưới.
 Tiến độ lưu trên máy (localStorage 'sstl'). */
const TOPIC_LESSONS=[{
 id:'heavy-heart',level:'B1',title:'Carrying a Heavy Heart',vi:'Mang nỗi buồn mà vẫn bước tiếp',
 text:[
  ['You can carry a heavy heart and still keep moving forward.','Bạn có thể mang nỗi buồn trong lòng mà vẫn tiếp tục bước về phía trước.'],
  ['It is okay to feel sad, tired, or hurt and still show up for your life.','Cảm thấy buồn, mệt hay tổn thương mà vẫn sống trọn cuộc đời mình là điều bình thường.'],
  ['Your pain does not take away your strength, and your tears do not mean you are failing.','Nỗi đau không lấy đi sức mạnh của bạn, và nước mắt không có nghĩa là bạn đang thất bại.'],
  ['Even when your wings feel too heavy to lift, you still have the will to rise.','Ngay cả khi đôi cánh nặng đến mức không nhấc lên nổi, bạn vẫn có ý chí để bay lên.'],
  ['You are still going, even when it feels like you are barely holding on.','Bạn vẫn đang bước tiếp, ngay cả khi cảm thấy mình chỉ vừa đủ sức gắng gượng.'],
  ['Flying does not always feel easy or joyful.','Bay không phải lúc nào cũng dễ dàng hay vui vẻ.'],
  ['Sometimes it means pushing through the wind even when your heart aches.','Đôi khi điều đó có nghĩa là vượt qua cơn gió ngay cả khi trái tim đang đau nhói.'],
  ['You do not have to wait until you feel better to keep going.','Bạn không cần đợi đến khi thấy khá hơn mới tiếp tục.'],
  ['You are strong enough to carry your sadness and still move toward what is ahead.','Bạn đủ mạnh mẽ để mang theo nỗi buồn và vẫn hướng về phía trước.'],
  ['Your ability to keep going, even when you are sad, is the bravest thing you can do.','Khả năng tiếp tục bước đi, ngay cả khi buồn, là điều dũng cảm nhất bạn có thể làm.']],
 vocab:[
  {en:'heavy heart',ipa:'/ˌhevi ˈhɑːt/',pos:'n.',vi:'nỗi buồn nặng trĩu',ex:'She left home with a heavy heart.',exvi:'Cô ấy rời nhà với nỗi buồn nặng trĩu.'},
  {en:'move forward',ipa:'/muːv ˈfɔːwəd/',pos:'v.',vi:'tiến về phía trước, tiếp tục tiến bộ',ex:'After the exam, he decided to move forward.',exvi:'Sau kỳ thi, anh ấy quyết định bước tiếp.'},
  {en:'show up',ipa:'/ʃəʊ ʌp/',pos:'phr. v.',vi:'có mặt, xuất hiện và tham gia',ex:'Show up for your friends when they need you.',exvi:'Hãy có mặt bên bạn bè khi họ cần bạn.'},
  {en:'strength',ipa:'/streŋθ/',pos:'n.',vi:'sức mạnh, nghị lực',ex:'Asking for help takes strength.',exvi:'Nhờ giúp đỡ cũng cần có nghị lực.'},
  {en:'fail',ipa:'/feɪl/',pos:'v.',vi:'thất bại',ex:'Crying does not mean you fail.',exvi:'Khóc không có nghĩa là bạn thất bại.'},
  {en:'wing',ipa:'/wɪŋ/',pos:'n.',vi:'đôi cánh',ex:'The bird spread its wings.',exvi:'Con chim dang rộng đôi cánh.'},
  {en:'rise',ipa:'/raɪz/',pos:'v.',vi:'bay lên, đứng dậy, vươn lên',ex:'The sun will rise tomorrow.',exvi:'Mặt trời sẽ mọc vào ngày mai.'},
  {en:'barely',ipa:'/ˈbeəli/',pos:'adv.',vi:'vừa đủ, hầu như không',ex:'I barely slept last night.',exvi:'Tối qua tôi hầu như không ngủ.'},
  {en:'hold on',ipa:'/həʊld ɒn/',pos:'phr. v.',vi:'gắng gượng, cố giữ vững',ex:'Hold on, things will get better.',exvi:'Cố lên, mọi chuyện sẽ tốt hơn.'},
  {en:'push through',ipa:'/pʊʃ θruː/',pos:'phr. v.',vi:'vượt qua khó khăn',ex:'We pushed through the storm.',exvi:'Chúng tôi đã vượt qua cơn bão.'},
  {en:'ache',ipa:'/eɪk/',pos:'v.',vi:'đau nhức, đau nhói',ex:'My legs ache after the run.',exvi:'Chân tôi đau nhức sau khi chạy.'},
  {en:'brave',ipa:'/breɪv/',pos:'adj.',vi:'dũng cảm',ex:'It was the bravest thing she did.',exvi:'Đó là điều dũng cảm nhất cô ấy từng làm.'}],
 fill:[
  ['I could ___ keep my eyes open.','barely'],
  ['Even when it is hard, try to ___ for your life.','show up'],
  ['She walked in with a ___ heart.','heavy'],
  ['You have to ___ the wind.','push through'],
  ['After falling, he had the will to ___.','rise']],
 tf:[
  ['You must feel better before you keep going.',false],
  ['Tears mean you are failing.',false],
  ['Flying is always easy and joyful.',false],
  ['You can be sad and strong at the same time.',true]],
 mcq:[
  ['What do "wings" represent in the text?',['Your ability to keep going in life','A real bird','A plane journey'],0],
  ['What is "the bravest thing you can do"?',['Hiding your tears','Keeping going even when you are sad','Waiting until you feel better'],1],
  ['Which word is closest to "barely holding on"?',['Easily winning','Almost giving up but still trying','Not trying at all'],1]],
 discuss:'Describe a time you kept going while feeling sad. What helped you?',
 gaps:[ /* [câu nghe, từ cần điền] — câu lấy đúng từ bài */
  [0,'heart'],[0,'forward'],[2,'strength'],[3,'wings'],[3,'rise'],[6,'wind'],[6,'aches']],
 gist:['What is the main idea?',['Sadness makes you weak','You can feel sad and still keep going','You should hide your tears'],1],
 dictation:[7,9],
 sounds:[
  {ipa:'/ɑː/',tip:'Âm “a” dài, mở miệng rộng, không bật “r” mạnh.',words:['heart','are','far']},
  {ipa:'/eɪk/',tip:'“ch” trong ache đọc là /k/, không phải /tʃ/.',words:['ache','aches','headache']},
  {ipa:'/aɪ/',tip:'Âm đôi trượt từ /a/ sang /ɪ/.',words:['rise','tired','fly','cry']},
  {ipa:'/θ/',tip:'Đặt đầu lưỡi giữa hai răng, thổi hơi, không đọc thành /t/ hay /s/.',words:['strength','through','thing']},
  {ipa:'/ŋ/',tip:'Âm mũi cuối từ, không bật thêm /g/.',words:['wings','going','strong']}],
 linking:[['carry a','/ˈkæri‿ə/'],['hold on','/həʊl‿dɒn/'],['keep on','/kiː‿pɒn/'],['push through','/pʊʃ‿θruː/']],
 stress:['Your PAIN does NOT take away your STRENGTH.','You do NOT have to WAIT until you feel BETTER to keep GOING.','You are STILL GOING.'],
 shadow:[0,2,7,9]
}];

const TL_PARTS=[['vocab','Từ vựng'],['read','Đọc hiểu'],['listen','Nghe'],['pron','Phát âm']];
let TLS={id:null,part:'vocab',a:{}};
const TLP=(()=>{try{return JSON.parse(localStorage.getItem('sstl')||'{}')}catch(e){return{}}})();TLP.done=TLP.done||{};TLP.best=TLP.best||{};
function tlSave(){try{localStorage.setItem('sstl',JSON.stringify(TLP))}catch(e){}}
function tlLesson(){return TOPIC_LESSONS.find(x=>x.id==TLS.id)||TOPIC_LESSONS[0]}
function tlDone(id,p){return !!TLP.done[id+':'+p]}
function tlMark(p){const L=tlLesson();if(!TLP.done[L.id+':'+p]){TLP.done[L.id+':'+p]=1;tlSave();S.xp+=20;try{tick()}catch(e){}toast('+20 XP · Xong phần '+TL_PARTS.find(x=>x[0]==p)[1])}save();render()}
function tlOpen(id,p){SH.on=false;TLS={id,part:p||'vocab',a:{}};S.res=null;go('tl')}
function tlPart(p){SH.on=false;TLS.part=p;TLS.a={};S.res=null;render();scrollTo(0,0)}
const tlNorm=s=>String(s||'').toLowerCase().replace(/[^a-z' ]/g,' ').replace(/\s+/g,' ').trim();

/* Thẻ hiển thị trên trang Học */
function vTopicHome(){if(typeof tkSlug=='function'&&tkSlug()=='steel')return '';
 return `<div class="sec-h"><h2>Bài học theo chủ đề</h2><span class="mut">${TOPIC_LESSONS.length} bài</span></div><div class="stack">${TOPIC_LESSONS.map(L=>{const n=TL_PARTS.filter(([p])=>tlDone(L.id,p)).length;
 return `<button class="card lesson2" onclick="tlOpen('${L.id}')"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b>${esc(L.title)}</b><span class="chip">${L.level}</span></div><div class="mut" style="font-size:.84rem">${esc(L.vi)} · ${n}/4 phần xong</div><div class="row" style="gap:6px;margin-top:6px">${TL_PARTS.map(([p,nm])=>`<span class="chip ${tlDone(L.id,p)?'on':''}" style="font-size:.74rem">${tlDone(L.id,p)?'✓ ':''}${nm}</span>`).join('')}</div></button>`}).join('')}</div>`}

function vTopic(){const L=tlLesson();if(typeof CATS!='undefined'&&!CATS.tl)CATS.tl={n:'Bài học chủ đề'};
 const tabs=`<div class="chips" style="margin:10px 0;flex-wrap:nowrap;overflow-x:auto">${TL_PARTS.map(([p,n])=>`<button class="chip ${TLS.part==p?'on':''}" onclick="tlPart('${p}')">${tlDone(L.id,p)?'✓ ':''}${n}</button>`).join('')}</div>`;
 const head=`<button class="link" onclick="go('home')">‹ Trang Học</button><h1 style="margin-top:6px">${esc(L.title)}</h1><p class="mut">${esc(L.vi)} · General English ${L.level}</p>${tabs}`;
 const body={vocab:tlVocab,read:tlRead,listen:tlListen,pron:tlPron}[TLS.part](L);
 const i=TL_PARTS.findIndex(x=>x[0]==TLS.part);
 const foot=`<div class="row" style="flex-wrap:nowrap;margin-top:16px">${i>0?`<button class="btn ghost" style="flex:1" onclick="tlPart('${TL_PARTS[i-1][0]}')">‹ ${TL_PARTS[i-1][1]}</button>`:''}${i<3?`<button class="btn" style="flex:1" onclick="tlPart('${TL_PARTS[i+1][0]}')">${TL_PARTS[i+1][1]} ›</button>`:`<button class="btn" style="flex:1" onclick="go('home')">Hoàn thành bài</button>`}</div>`;
 return head+body+foot}

/* ---- Bài tập chọn đáp án dùng chung ---- */
function tlChoice(key,opts,right){const a=TLS.a[key];return `<div class="stack" style="margin-top:8px">${opts.map((o,k)=>`<button class="opt ${a!=null?(k===right?'ok':k===a?'no':''):''}" ${a!=null?'disabled':''} onclick="TLS.a['${key}']=${k};render()">${esc(o)}</button>`).join('')}</div>`}
function tlScore(keys,rights){const got=keys.filter((k,i)=>TLS.a[k]===rights[i]).length;return {got,all:keys.length,done:keys.every(k=>TLS.a[k]!=null)}}
function tlResult(s,part){if(!s.done)return '';const pass=s.got/s.all>=.7;return `<div class="card" style="margin-top:12px"><b>${s.got}/${s.all} câu đúng</b> · <span class="${pass?'good':'bad'}">${pass?'Đạt':'Cần đúng 70% để qua'}</span>${pass&&!tlDone(tlLesson().id,part)?`<button class="btn" style="width:100%;margin-top:8px" onclick="tlMark('${part}')">Hoàn thành phần này (+20 XP)</button>`:''}${!pass?`<button class="btn ghost" style="width:100%;margin-top:8px" onclick="TLS.a={};render()">Làm lại</button>`:''}</div>`}

/* ---- 1. Từ vựng ---- */
function tlTerms(L){return L.vocab.map(v=>({en:v.en,vi:v.vi,ex:v.ex,exvi:v.exvi,cat:'tl'}))}
function tlVocab(L){
 const cards=L.vocab.map(v=>`<div class="card"><div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:flex-start"><div style="flex:1;min-width:0"><b style="font-size:1.1rem">${esc(v.en)}</b> <span class="mut" style="font-size:.84rem">${esc(v.pos)} ${esc(v.ipa)}</span><div>${esc(v.vi)}</div><i style="font-size:.9rem">${esc(v.ex)}</i><div class="mut" style="font-size:.82rem">${esc(v.exvi)}</div></div><div class="row" style="flex-wrap:nowrap">${spk(v.en)}${slow(v.ex)}</div></div></div>`).join('');
 const opts=[...new Set(L.fill.map(f=>f[1]))];
 const fill=L.fill.map(([q,a],k)=>{const key='f'+k,ans=TLS.a[key];return `<div class="card"><div>${k+1}. ${esc(q).replace('___','<b>____</b>')}</div><div class="row" style="gap:6px;margin-top:6px">${opts.map(o=>`<button class="chip ${ans!=null?(o==a?'on':o==ans?'bad':''):''}" ${ans!=null?'disabled':''} onclick="TLS.a['${key}']='${o}';render()">${esc(o)}</button>`).join('')}</div>${ans!=null&&ans!=a?`<div class="mut" style="font-size:.84rem;margin-top:4px">Đáp án: <b>${esc(a)}</b></div>`:''}</div>`}).join('');
 const s=tlScore(L.fill.map((_,k)=>'f'+k),L.fill.map(f=>f[1]));
 return `<p class="mut">Nghe, đọc nghĩa và ví dụ của ${L.vocab.length} từ trong bài.</p>
 <div class="row" style="flex-wrap:nowrap;margin:8px 0"><button class="btn ghost" style="flex:1" onclick="start({name:'${esc(L.title)} · Từ vựng',mode:'flash',terms:tlTerms(tlLesson()),src:'${esc(L.title)}'})">Flashcard</button><button class="btn ghost" style="flex:1" onclick="start({name:'${esc(L.title)} · Từ vựng',mode:'quiz',terms:tlTerms(tlLesson()),src:'${esc(L.title)}'})">Trắc nghiệm</button></div>
 <div class="stack">${cards}</div><div class="sec-h"><h2>Điền từ</h2></div><div class="stack">${fill}</div>${tlResult(s,'vocab')}`}

/* ---- 2. Đọc hiểu ---- */
function tlRead(L){const show=TLS.a.vi;
 const text=`<div class="card"><div class="row" style="justify-content:space-between"><div class="lbl">Bài đọc · chạm câu để nghe</div><button class="link" onclick="TLS.a.vi=!TLS.a.vi;render()">${show?'Ẩn':'Hiện'} bản dịch</button></div>${L.text.map(([en,vi])=>`<p style="margin:6px 0;cursor:pointer" onclick="say(${esc(JSON.stringify(en))})">${esc(en)}${show?`<br><span class="mut" style="font-size:.86rem">${esc(vi)}</span>`:''}</p>`).join('')}</div>`;
 const tf=L.tf.map(([q,r],k)=>{const key='t'+k;return `<div class="card"><div>${k+1}. ${esc(q)}</div>${tlChoice(key,['True','False'],r?0:1)}</div>`}).join('');
 const mc=L.mcq.map(([q,o,r],k)=>`<div class="card"><div>${k+1}. ${esc(q)}</div>${tlChoice('m'+k,o,r)}</div>`).join('');
 const keys=[...L.tf.map((_,k)=>'t'+k),...L.mcq.map((_,k)=>'m'+k)],rights=[...L.tf.map(x=>x[1]?0:1),...L.mcq.map(x=>x[2])];
 return `${text}<div class="sec-h"><h2>Đúng hay sai?</h2></div><div class="stack">${tf}</div><div class="sec-h"><h2>Hiểu bài</h2></div><div class="stack">${mc}</div>${tlResult(tlScore(keys,rights),'read')}
 <div class="card" style="margin-top:12px"><div class="lbl">Thảo luận</div><b>${esc(L.discuss)}</b><p class="mut" style="font-size:.84rem">Nói hoặc viết 3–5 câu trả lời, dùng ít nhất 3 từ mới.</p></div>`}

/* ---- 3. Nghe ---- */
function tlListen(L){const all=L.text.map(x=>x[0]).join(' ');
 const play=`<div class="card flash" style="min-height:120px"><div class="mut">Nghe cả bài, rồi làm bài tập bên dưới</div><div class="row" style="justify-content:center;gap:10px"><button class="btn" onclick="say(${esc(JSON.stringify(all))})">▶ Tốc độ thường</button><button class="btn ghost" onclick="say(${esc(JSON.stringify(all))},0.7)">▶ Chậm</button></div></div>`;
 const gaps=L.gaps.map(([si,w],k)=>{const sent=L.text[si][0];const re=new RegExp('\\b'+w+'\\b');const q=sent.replace(re,'_____');const key='g'+k,v=TLS.a[key],chk=TLS.a.gchk;const ok=chk&&tlNorm(v)==w;
  return `<div class="card"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div style="flex:1;min-width:0">${k+1}. ${esc(q)}</div>${spk(sent)}</div><input type="text" autocomplete="off" autocapitalize="off" value="${esc(v||'')}" oninput="TLS.a['${key}']=this.value" placeholder="Từ còn thiếu" style="margin-top:6px;${chk?`border-color:var(${ok?'--good':'--bad'})`:''}" ${chk?'disabled':''}>${chk&&!ok?`<div class="mut" style="font-size:.84rem">Đáp án: <b>${esc(w)}</b></div>`:''}</div>`}).join('');
 const gs=L.gaps.filter(([,w],k)=>tlNorm(TLS.a['g'+k])==w).length;
 const [gq,go2,gr]=L.gist;
 const dict=L.dictation.map((si,k)=>{const key='d'+k,v=TLS.a[key],chk=TLS.a['dc'+k];const tgt=L.text[si][0];let res='';
  if(chk){const T=tlNorm(tgt).split(' '),H=tlNorm(v).split(' ');const hit=T.filter(w=>H.includes(w)).length;res=`<div style="margin-top:6px">${T.map(w=>`<span class="${H.includes(w)?'good':'bad'}">${esc(w)}</span>`).join(' ')}</div><div class="mut" style="font-size:.84rem">${Math.round(hit/T.length*100)}% từ đúng</div>`}
  return `<div class="card"><div class="row" style="flex-wrap:nowrap"><div style="flex:1">Câu ${k+1}: nghe và chép lại</div>${spk(tgt)}${slow(tgt)}</div><textarea rows="2" oninput="TLS.a['${key}']=this.value" style="width:100%;margin-top:6px" ${chk?'disabled':''}>${esc(v||'')}</textarea>${chk?res:`<button class="btn ghost" style="width:100%;margin-top:6px" onclick="TLS.a['dc${k}']=1;render()">Kiểm tra</button>`}</div>`}).join('');
 const passed=TLS.a.gchk&&gs/L.gaps.length>=.7&&TLS.a.gist===gr;
 return `${play}<div class="sec-h"><h2>Điền từ còn thiếu</h2></div><div class="stack">${gaps}</div>
 ${TLS.a.gchk?`<div class="card" style="margin-top:10px"><b>${gs}/${L.gaps.length} từ đúng</b> <button class="link" onclick="TLS.a.gchk=0;render()">Sửa lại</button></div>`:`<button class="btn" style="width:100%;margin-top:10px" onclick="TLS.a.gchk=1;render()">Kiểm tra</button>`}
 <div class="sec-h"><h2>Ý chính</h2></div><div class="card"><div>${esc(gq)}</div>${tlChoice('gist',go2,gr)}</div>
 <div class="sec-h"><h2>Chép chính tả</h2></div><div class="stack">${dict}</div>
 ${passed&&!tlDone(L.id,'listen')?`<button class="btn" style="width:100%;margin-top:12px" onclick="tlMark('listen')">Hoàn thành phần này (+20 XP)</button>`:''}`}

/* ---- 4. Phát âm ---- */
function tlSpeak(i){const L=tlLesson();const s=L.text[i];S.speakItem={en:s[0],vi:s[1],ex:s[0],exvi:s[1],cat:'tl'};S.spMode='sent';TLS.a.sh=i;S.res=null;render();setTimeout(()=>{const m=document.getElementById('micb');m&&m.scrollIntoView({block:'center'})},60)}
function tlPron(L){if(SH.on)return vShadow(L);
 const snd=L.sounds.map(x=>`<div class="card"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b style="font-size:1.2rem">${esc(x.ipa)}</b></div><div class="mut" style="font-size:.86rem">${esc(x.tip)}</div><div class="row" style="gap:6px;margin-top:6px">${x.words.map(w=>`<button class="chip" onclick="say(${esc(JSON.stringify(w))},0.8)">🔊 ${esc(w)}</button>`).join('')}</div></div>`).join('');
 const link=`<div class="card">${L.linking.map(([a,b])=>`<div class="row" style="justify-content:space-between;flex-wrap:nowrap"><span><b>${esc(a.replace(' ','‿'))}</b> <span class="mut">${esc(b)}</span></span>${spk(a)}</div>`).join('')}</div>`;
 const st=`<div class="card">${L.stress.map(s=>`<div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:flex-start"><div style="flex:1;min-width:0">${esc(s).replace(/\b([A-Z]{2,})\b/g,'<b style="color:var(--amber,#d97706)">$1</b>').replace(/\b([A-Z]{2,})\b/g,m=>m)}</div>${spk(s.toLowerCase().replace(/^./,c=>c.toUpperCase()))}</div>`).join('')}<p class="mut" style="font-size:.84rem;margin-top:6px">Từ in đậm đọc mạnh và dài hơn. Câu khích lệ dùng ngữ điệu xuống ↘ ở cuối.</p></div>`;
 const cur=TLS.a.sh;
 if(cur!=null&&S.res&&S.res.score!=null){const k=L.id+':'+cur;if(S.res.score>(TLP.best[k]||0)){TLP.best[k]=S.res.score;tlSave()}}
 const sh=L.shadow.map(i=>{const best=TLP.best[L.id+':'+i];return `<div class="card" style="${cur===i?'border:2px solid var(--steel)':''}"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div style="flex:1;min-width:0"><b>${esc(L.text[i][0])}</b><div class="mut" style="font-size:.84rem">${esc(L.text[i][1])}</div></div>${spk(L.text[i][0])}${slow(L.text[i][0])}</div><div class="row" style="justify-content:space-between"><span class="mut" style="font-size:.84rem">${best!=null?'Điểm cao nhất: <b class="'+(best>=70?'good':'bad')+'">'+best+'</b>':'Chưa đọc'}</span><button class="btn ghost" onclick="tlSpeak(${i})">${cur===i?'Đang luyện':'🎤 Đọc câu này'}</button></div>${cur===i?`<button class="mic" id="micb" aria-label="Bắt đầu ghi âm" onclick="listen()">${svg('mic')}</button><p class="mut" style="text-align:center;font-size:.84rem" id="mst">Chạm mic, đọc to câu trên</p>${S.res?vRes(S.res):''}`:''}</div>`}).join('');
 const ok=L.shadow.filter(i=>(TLP.best[L.id+':'+i]||0)>=70).length;
 return `<div class="sec-h"><h2>Âm trọng tâm</h2></div><div class="stack">${snd}</div>
 <div class="sec-h"><h2>Nối âm</h2></div>${link}<div class="sec-h"><h2>Trọng âm câu</h2></div>${st}
 <button class="card login-nudge" style="margin-top:14px" onclick="shOpen()"><span class="tile2-ic">🎧</span><span style="flex:1;text-align:left"><b>Luyện Shadowing</b><small>4 vòng: nghe hiểu → đọc theo → chữ gợi ý → ẩn chữ, kèm ghi âm để so sánh</small></span><span class="chev">›</span></button>
 <div class="sec-h"><h2>Đọc nhại & chấm điểm AI</h2><span class="mut">${ok}/${L.shadow.length} câu ≥ 70</span></div><div class="stack">${sh}</div>
 ${ok>=Math.ceil(L.shadow.length*.75)&&!tlDone(L.id,'pron')?`<button class="btn" style="width:100%;margin-top:12px" onclick="tlMark('pron')">Hoàn thành phần này (+20 XP)</button>`:''}`}

/* ===================== SHADOWING (nói đuổi theo giọng mẫu) =====================
 4 vòng: 1 Nghe hiểu (chữ + dịch) · 2 Đọc theo nhìn chữ · 3 Chữ gợi ý (chỉ chữ cái đầu) · 4 Ẩn chữ.
 Mỗi câu: phát lặp N lần, ghi âm giọng mình trong lúc nói theo, nghe lại bản ghi rồi nghe lại mẫu để so. */
const SH_ROUNDS=[['Nghe hiểu','Nghe câu mẫu, đọc nghĩa. Chưa cần nói.'],['Đọc theo','Nhìn chữ, nói cùng lúc với giọng mẫu.'],['Chữ gợi ý','Chỉ còn chữ cái đầu. Nói đuổi theo, trễ khoảng nửa giây.'],['Ẩn chữ','Không nhìn chữ. Nói đuổi theo hoàn toàn bằng tai.']];
let SH={on:false,i:0,round:0,rate:0.9,reps:2,busy:false,rec:null,url:null,stop:false};
function shUtter(t,rate){return new Promise(res=>{if(!('speechSynthesis' in window))return res();try{if(typeof VOICE!='undefined'&&!VOICE&&typeof pickVoice=='function')pickVoice()}catch(e){}
 const u=new SpeechSynthesisUtterance(t);u.lang='en-US';try{if(VOICE)u.voice=VOICE}catch(e){}u.rate=rate;let ok=false;const fin=()=>{if(!ok){ok=true;res()}};u.onend=fin;u.onerror=fin;setTimeout(fin,1500+t.length*110/rate);speechSynthesis.speak(u)})}
const shWait=ms=>new Promise(r=>setTimeout(r,ms));
function shMask(s){return s.split(' ').map(w=>w.replace(/^([A-Za-z])([A-Za-z']*)/,(m,a,b)=>a+b.replace(/[A-Za-z']/g,'_'))).join(' ')}
function shOpen(){SH.on=true;SH.i=0;SH.round=0;shDrop();render();scrollTo(0,0)}
function shDrop(){if(SH.url){try{URL.revokeObjectURL(SH.url)}catch(e){}}SH.url=null}
function shSet(k,v){SH[k]=v;if(k=='i'||k=='round')shDrop();render()}
async function shPlay(withRec){const L=tlLesson(),s=L.text[L.shadow[SH.i]][0];if(SH.busy){SH.stop=true;try{speechSynthesis.cancel()}catch(e){}return}
 SH.busy=true;SH.stop=false;render();let rec=null,chunks=[],stream=null;
 if(withRec&&navigator.mediaDevices&&window.MediaRecorder){try{stream=await navigator.mediaDevices.getUserMedia({audio:true});rec=new MediaRecorder(stream);rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);rec.start()}catch(e){toast('Chưa mở được micro: hãy cho phép dùng micro rồi thử lại');rec=null}}
 for(let k=0;k<SH.reps&&!SH.stop;k++){const st=document.getElementById('shst');if(st)st.textContent=(rec?'● Đang ghi · ':'')+'Lần '+(k+1)+'/'+SH.reps;await shUtter(s,SH.rate);await shWait(rec?900:600)}
 if(rec){await new Promise(r=>{rec.onstop=r;rec.stop()});stream.getTracks().forEach(t=>t.stop());shDrop();SH.url=URL.createObjectURL(new Blob(chunks,{type:rec.mimeType||'audio/webm'}))}
 SH.busy=false;render()}
async function shCompare(){if(!SH.url)return;const L=tlLesson(),s=L.text[L.shadow[SH.i]][0];const a=new Audio(SH.url);await new Promise(r=>{a.onended=r;a.onerror=r;a.play().catch(r)});await shWait(400);await shUtter(s,SH.rate)}
function shNext(){const L=tlLesson();if(SH.i<L.shadow.length-1)shSet('i',SH.i+1);else if(SH.round<3){SH.i=0;shSet('round',SH.round+1);toast('Sang vòng '+(SH.round+1)+': '+SH_ROUNDS[SH.round][0])}else{SH.on=false;toast('Xong 4 vòng shadowing!');render()}}
function vShadow(L){const si=L.shadow[SH.i],[en,vi]=L.text[si],r=SH.round;
 const shown=r<2?en:r==2?shMask(en):'• • •';
 return `<button class="link" onclick="SH.on=false;try{speechSynthesis.cancel()}catch(e){};render()">‹ Về phần Phát âm</button><h2 style="margin-top:6px">Shadowing</h2>
 <div class="chips" style="margin:8px 0;flex-wrap:nowrap;overflow-x:auto">${SH_ROUNDS.map(([n],k)=>`<button class="chip ${r==k?'on':''}" onclick="shSet('round',${k})">${k+1}. ${n}</button>`).join('')}</div>
 <p class="mut" style="font-size:.88rem">${SH_ROUNDS[r][1]}</p>
 <div class="card flash" style="min-height:170px"><div class="lbl">Câu ${SH.i+1}/${L.shadow.length}</div><div class="big" style="font-size:1.25rem;letter-spacing:${r==2?'.04em':'0'}">${esc(shown)}</div>${r==0?`<div class="mut">${esc(vi)}</div>`:''}<div class="mut" id="shst" style="font-size:.84rem">${SH.busy?'Đang phát…':''}</div></div>
 <div class="row" style="flex-wrap:nowrap;margin-top:10px;gap:8px">
  <label class="mut" style="flex:1;font-size:.84rem">Tốc độ <select onchange="SH.rate=+this.value">${[[0.6,'Chậm'],[0.75,'Vừa'],[0.9,'Thường'],[1.05,'Nhanh']].map(([v,n])=>`<option value="${v}" ${SH.rate==v?'selected':''}>${n}</option>`).join('')}</select></label>
  <label class="mut" style="flex:1;font-size:.84rem">Lặp lại <select onchange="SH.reps=+this.value">${[1,2,3,5].map(v=>`<option value="${v}" ${SH.reps==v?'selected':''}>${v} lần</option>`).join('')}</select></label></div>
 <div class="stack" style="margin-top:12px">
  <button class="btn ${r==0?'':'ghost'}" onclick="shPlay(false)">${SH.busy?'■ Dừng':'▶ Nghe mẫu'}</button>
  ${r>0?`<button class="btn" onclick="shPlay(true)" ${SH.busy?'':''}>${SH.busy?'■ Dừng':'🎤 Nói theo & ghi âm'}</button>`:''}
  ${SH.url&&!SH.busy?`<button class="btn ghost" onclick="shCompare()">⇄ So sánh: giọng mình → giọng mẫu</button><button class="btn ghost" onclick="new Audio(SH.url).play()">▶ Nghe lại giọng mình</button>`:''}
 </div>
 ${r>0?`<p class="mut" style="font-size:.82rem;margin-top:8px">Mẹo: đeo tai nghe để micro chỉ thu giọng bạn. Nói to, bắt chước cả chỗ nhấn và ngữ điệu, không chỉ từng từ.</p>`:''}
 <div class="row" style="flex-wrap:nowrap;margin-top:12px"><button class="btn ghost" style="flex:1" ${SH.i==0?'disabled':''} onclick="shSet('i',SH.i-1)">‹ Câu trước</button><button class="btn" style="flex:1" onclick="shNext()">${SH.i<L.shadow.length-1?'Câu tiếp ›':SH.round<3?'Vòng tiếp ›':'Hoàn thành'}</button></div>
 <button class="btn ghost" style="width:100%;margin-top:8px" onclick="SH.on=false;tlSpeak(${si})">Chấm điểm AI câu này</button>`}
