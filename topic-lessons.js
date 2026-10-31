/* ===================== BÀI HỌC THEO CHỦ ĐỀ (General English) =====================
 Mỗi bài có 4 phần: Từ vựng · Đọc hiểu · Nghe · Phát âm.
 Thêm bài mới: thêm 1 object vào TOPIC_LESSONS theo đúng mẫu bên dưới.
 Tiến độ lưu trên máy (localStorage 'sstl'). */
const TOPIC_LESSONS=[{
 id:'heavy-heart-a2',level:'A2',title:'Sad but Still Strong',vi:'Buồn nhưng vẫn mạnh mẽ (bản dễ của “Carrying a Heavy Heart”)',
 text:[
  ['Sometimes you feel sad, but you can still go on.','Đôi khi bạn thấy buồn, nhưng bạn vẫn có thể bước tiếp.'],
  ['It is OK to feel sad or tired.','Cảm thấy buồn hay mệt cũng không sao.'],
  ['You can feel sad and still do your work every day.','Bạn có thể buồn mà vẫn làm việc của mình mỗi ngày.'],
  ['Crying does not mean you are weak.','Khóc không có nghĩa là bạn yếu đuối.'],
  ['Sad people can be strong people too.','Người đang buồn cũng có thể là người mạnh mẽ.'],
  ['Think of a bird in the wind.','Hãy nghĩ đến một chú chim trong gió.'],
  ['Flying is hard, but the bird keeps flying.','Bay rất khó, nhưng chú chim vẫn tiếp tục bay.'],
  ['You do not need to wait for a happy day to start again.','Bạn không cần đợi một ngày vui mới bắt đầu lại.'],
  ['Take one small step today.','Hôm nay hãy bước một bước nhỏ.'],
  ['When you keep going on a sad day, you are very brave.','Khi bạn vẫn bước tiếp vào một ngày buồn, bạn rất dũng cảm.']],
 vocab:[
  {en:'sad',ipa:'/sæd/',pos:'adj.',vi:'buồn',ex:'I feel sad today.',exvi:'Hôm nay tôi thấy buồn.'},
  {en:'tired',ipa:'/ˈtaɪəd/',pos:'adj.',vi:'mệt',ex:'She is tired after work.',exvi:'Cô ấy mệt sau giờ làm.'},
  {en:'go on',ipa:'/ɡəʊ ɒn/',pos:'phr. v.',vi:'tiếp tục',ex:'Please go on with your story.',exvi:'Bạn kể tiếp câu chuyện đi.'},
  {en:'keep going',ipa:'/kiːp ˈɡəʊɪŋ/',pos:'v.',vi:'tiếp tục, không dừng lại',ex:'It is hard, but keep going!',exvi:'Khó đấy, nhưng đừng dừng lại!'},
  {en:'weak',ipa:'/wiːk/',pos:'adj.',vi:'yếu',ex:'I felt weak when I was ill.',exvi:'Tôi thấy yếu khi bị ốm.'},
  {en:'strong',ipa:'/strɒŋ/',pos:'adj.',vi:'mạnh mẽ',ex:'You are stronger than you think.',exvi:'Bạn mạnh mẽ hơn bạn nghĩ.'},
  {en:'cry',ipa:'/kraɪ/',pos:'v.',vi:'khóc',ex:'The baby is crying.',exvi:'Em bé đang khóc.'},
  {en:'wind',ipa:'/wɪnd/',pos:'n.',vi:'gió',ex:'The wind is very strong today.',exvi:'Hôm nay gió rất mạnh.'},
  {en:'step',ipa:'/step/',pos:'n.',vi:'bước',ex:'Take one step at a time.',exvi:'Đi từng bước một.'},
  {en:'brave',ipa:'/breɪv/',pos:'adj.',vi:'dũng cảm',ex:'The brave boy helped his friend.',exvi:'Cậu bé dũng cảm đã giúp bạn mình.'}],
 fill:[
  ['I am very ___ after a long day.','tired'],
  ['Don\'t stop. ___!','keep going'],
  ['The baby started to ___.','cry'],
  ['The ___ moved the trees.','wind'],
  ['He saved the cat. He is ___.','brave']],
 tf:[
  ['It is OK to feel tired.',true],
  ['Crying means you are weak.',false],
  ['The bird stops flying in the wind.',false],
  ['You must wait for a happy day to start again.',false]],
 mcq:[
  ['What can you do on a sad day?',['Stop everything','Take one small step','Wait for a happy day'],1],
  ['Why does the text talk about a bird?',['To show that hard things can still be done','To teach about animals','To talk about the weather'],0],
  ['Who is brave in the text?',['People who never cry','People who keep going on a sad day','People who are always happy'],1]],
 discuss:'What do you do to feel better on a sad day? Say 3 sentences.',
 gaps:[[0,'sad'],[1,'tired'],[3,'weak'],[4,'strong'],[5,'wind'],[8,'step'],[9,'brave']],
 gist:['What is the main idea?',['Never feel sad','You can be sad and keep going','Birds like the wind'],1],
 dictation:[1,8],
 sounds:[
  {ipa:'/æ/',tip:'Mở miệng rộng, giữa “a” và “e”.',words:['sad','can','that']},
  {ipa:'/aɪ/',tip:'Âm đôi trượt từ /a/ sang /ɪ/.',words:['tired','cry','fly']},
  {ipa:'/iː/',tip:'Âm “i” dài, kéo môi sang hai bên.',words:['weak','keep','need']},
  {ipa:'/ŋ/',tip:'Âm mũi cuối từ, không bật thêm /g/.',words:['strong','going','flying']},
  {ipa:'/st/',tip:'Hai phụ âm liền nhau, không chèn “ơ” vào giữa (không đọc “sơ-tép”).',words:['step','strong','still']}],
 linking:[['feel sad','/fiːl sæd/'],['go on','/ɡəʊ‿wɒn/'],['keep going','/kiːp ˈɡəʊɪŋ/'],['step today','/step‿təˈdeɪ/']],
 stress:['It is OK to feel SAD or TIRED.','CRYING does NOT mean you are WEAK.','Take ONE SMALL STEP today.'],
 shadow:[0,3,8,9]
},{
 id:'heavy-heart',level:'B1',title:'Carrying a Heavy Heart',vi:'Mang nỗi buồn mà vẫn bước tiếp · từ vựng A2, nghĩa bóng B1',
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
function tlLesson(){return tlAll().find(x=>x.id==TLS.id)||TOPIC_LESSONS[0]}
function tlDone(id,p){return !!TLP.done[id+':'+p]}
function tlMark(p){const L=tlLesson();if(!TLP.done[L.id+':'+p]){TLP.done[L.id+':'+p]=1;tlSave();S.xp+=20;try{tick()}catch(e){}toast('+20 XP · Xong phần '+TL_PARTS.find(x=>x[0]==p)[1])}save();render()}
function tlOpen(id,p){SH.on=false;TLS={id,part:p||'vocab',a:{}};S.res=null;go('tl')}
function tlPart(p){SH.on=false;TLS.part=p;TLS.a={};S.res=null;render();scrollTo(0,0)}
const tlNorm=s=>String(s||'').toLowerCase().replace(/[^a-z' ]/g,' ').replace(/\s+/g,' ').trim();

/* Thẻ hiển thị trên trang Học */
function vTopicHome(){if(typeof tkSlug=='function'&&tkSlug()=='steel')return '';
 return `<div class="sec-h"><h2>Bài học theo chủ đề</h2><span class="mut">${tlAll().filter(x=>String(x.id)[0]!='p').length} bài</span></div><div class="stack">${tlAll().filter(x=>String(x.id)[0]!='p').map(L=>{const n=TL_PARTS.filter(([p])=>tlDone(L.id,p)).length;
 return `<button class="card lesson2" onclick="tlOpen('${L.id}')"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b>${esc(L.title)}</b><span class="chip">${L.level}</span></div><div class="mut" style="font-size:.84rem">${L.mine?'Bài của bạn'+(L.shared=='live'?' · ✓ đã chia sẻ':L.shared=='pending'?' · ⏳ chờ duyệt':L.shared=='rejected'?' · ✕ chưa được duyệt':'')+' · ':L.author?'Chia sẻ bởi '+esc(L.author)+' · ':''}${esc(L.vi)} · ${n}/4 phần xong</div><div class="row" style="gap:6px;margin-top:6px">${TL_PARTS.map(([p,nm])=>`<span class="chip ${tlDone(L.id,p)?'on':''}" style="font-size:.74rem">${tlDone(L.id,p)?'✓ ':''}${nm}</span>`).join('')}</div></button>`}).join('')}<button class="btn ghost" onclick="TLN.msg='';TLS={id:'__new',part:'vocab',a:{}};go('tl')">＋ Tạo bài từ truyện ngắn</button></div>`}

function vTopic(){if(TLS.id=='__new')return vStoryForm();const L=tlLesson();if(typeof CATS!='undefined'&&!CATS.tl)CATS.tl={n:'Bài học chủ đề'};
 const tabs=`<div class="chips" style="margin:10px 0;flex-wrap:nowrap;overflow-x:auto">${TL_PARTS.map(([p,n])=>`<button class="chip ${TLS.part==p?'on':''}" onclick="tlPart('${p}')">${tlDone(L.id,p)?'✓ ':''}${n}</button>`).join('')}</div>`;
 const head=`<div class="row" style="justify-content:space-between"><button class="link" onclick="go('home')">‹ Trang Học</button>${L.mine?`<span>${!L.shared||L.shared=='rejected'?`<button class="link" onclick="tlShare('${L.id}')">↗ Chia sẻ cho khóa</button> · `:''}<button class="link" onclick="tlDel('${L.id}')">Xóa</button></span>`:''}</div><h1 style="margin-top:6px">${esc(L.title)}</h1><p class="mut">${esc(L.vi)} · General English ${L.level}</p>${tabs}`;
 const body={vocab:tlVocab,read:tlRead,listen:tlListen,pron:tlPron}[TLS.part](L);
 const i=TL_PARTS.findIndex(x=>x[0]==TLS.part);
 const foot=`<div class="row" style="flex-wrap:nowrap;margin-top:16px">${i>0?`<button class="btn ghost" style="flex:1" onclick="tlPart('${TL_PARTS[i-1][0]}')">‹ ${TL_PARTS[i-1][1]}</button>`:''}${i<3?`<button class="btn" style="flex:1" onclick="tlPart('${TL_PARTS[i+1][0]}')">${TL_PARTS[i+1][1]} ›</button>`:`<button class="btn" style="flex:1" onclick="go('home')">Hoàn thành bài</button>`}</div>`;
 return head+body+foot}

/* ---- Bài tập chọn đáp án dùng chung ---- */
function tlChoice(key,opts,right){const a=TLS.a[key];return `<div class="stack" style="margin-top:8px">${opts.map((o,k)=>`<button class="opt ${a!=null?(k===right?'ok':k===a?'no':''):''}" ${a!=null?'disabled':''} onclick="TLS.a['${key}']=${k};render()">${esc(o)}</button>`).join('')}</div>`}
function tlScore(keys,rights){const got=keys.filter((k,i)=>TLS.a[k]===rights[i]).length;return {got,all:keys.length,done:keys.every(k=>TLS.a[k]!=null)}}
function tlResult(s,part){if(!s.done)return '';const pass=!s.all||s.got/s.all>=.7;return `<div class="card" style="margin-top:12px"><b>${s.got}/${s.all} câu đúng</b> · <span class="${pass?'good':'bad'}">${pass?'Đạt':'Cần đúng 70% để qua'}</span>${pass&&!tlDone(tlLesson().id,part)?`<button class="btn" style="width:100%;margin-top:8px" onclick="tlMark('${part}')">Hoàn thành phần này (+20 XP)</button>`:''}${!pass?`<button class="btn ghost" style="width:100%;margin-top:8px" onclick="TLS.a={};render()">Làm lại</button>`:''}</div>`}

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
 const passed=(!L.gaps.length||TLS.a.gchk&&gs/L.gaps.length>=.7)&&TLS.a.gist===gr;
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

/* ===================== NGƯỜI HỌC TỰ TẠO BÀI TỪ TRUYỆN NGẮN =====================
 Dán truyện 40–400 từ → AI (task 'story') soạn đủ 4 phần → kiểm tra, sửa lỗi → lưu trên máy (TLP.mine). */
TLP.mine=TLP.mine||[];
function tlAll(){let sh=[];try{sh=tlShared()}catch(e){}return [...TOPIC_LESSONS,...TLP.mine,...sh,...(TLC.preview&&TLC.preview.id==TLS.id?[TLC.preview]:[])]}
const tlArr=(x,n)=>Array.isArray(x)?x.slice(0,n):[];
function tlClean(r,src){const S2=s=>String(s??'').trim();
 const text=tlArr(r.text,14).map(x=>Array.isArray(x)?[S2(x[0]),S2(x[1])]:[S2(x.en||x),S2(x.vi)]).filter(x=>x[0].length>2);if(text.length<3)throw new Error('AI chưa tách được câu');
 const N=text.length,okI=i=>Number.isInteger(+i)&&+i>=0&&+i<N;
 const vocab=tlArr(r.vocab,12).map(v=>({en:S2(v.en),ipa:S2(v.ipa),pos:S2(v.pos),vi:S2(v.vi),ex:S2(v.ex),exvi:S2(v.exvi)})).filter(v=>v.en&&v.vi);if(vocab.length<4)throw new Error('AI chưa chọn đủ từ vựng');
 const ens=vocab.map(v=>v.en.toLowerCase());
 const fill=tlArr(r.fill,6).map(x=>[S2(x[0]),S2(x[1])]).filter(([q,a])=>q.includes('___')&&ens.includes(a.toLowerCase())).map(([q,a])=>[q,vocab[ens.indexOf(a.toLowerCase())].en]);
 const tf=tlArr(r.tf,5).map(x=>[S2(x[0]),x[1]===true||String(x[1]).toLowerCase()=='true']).filter(x=>x[0]);
 const mcq=tlArr(r.mcq,4).map(x=>[S2(x[0]),tlArr(x[1],4).map(S2),+x[2]]).filter(x=>x[0]&&x[1].length>=2&&x[2]>=0&&x[2]<x[1].length);
 const gaps=tlArr(r.gaps,8).map(x=>[+x[0],S2(x[1]).toLowerCase().replace(/[^a-z']/g,'')]).filter(([i,w])=>okI(i)&&w.length>1&&new RegExp('\\b'+w+'\\b').test(text[i][0]));
 const g=Array.isArray(r.gist)?r.gist:[];const gist=[S2(g[0])||'What is the main idea?',tlArr(g[1],4).map(S2),+g[2]||0];
 const idx=(a,n,def)=>{const v=[...new Set(tlArr(a,n).map(Number).filter(okI))];return v.length?v:def};
 const sounds=tlArr(r.sounds,5).map(x=>({ipa:S2(x.ipa),tip:S2(x.tip),words:tlArr(x.words,4).map(S2).filter(Boolean)})).filter(x=>x.ipa&&x.words.length);
 const linking=tlArr(r.linking,4).map(x=>[S2(x[0]),S2(x[1])]).filter(x=>x[0]);
 const stress=tlArr(r.stress,3).map(S2).filter(Boolean);
 const lv=['A1','A2','B1','B2','C1','C2'].includes(S2(r.level).toUpperCase())?S2(r.level).toUpperCase():'B1';
 return {id:'u'+Date.now(),mine:1,src,level:lv,title:S2(r.title)||'Truyện của tôi',vi:(S2(r.vi)||'Bài tự tạo')+' · AI soạn',text,vocab,fill,tf,mcq,
  discuss:S2(r.discuss)||'Retell the story in your own words.',gaps,gist:gist[1].length>=2?gist:['What is the main idea?',['—','—'],0],
  dictation:idx(r.dictation,2,[0]),sounds,linking,stress,shadow:idx(r.shadow,4,[0,1,2].filter(okI))}}
let TLN={busy:false,msg:''};
async function tlBuild(){const ta=document.getElementById('tlstory');const txt=(ta&&ta.value||'').replace(/\s+/g,' ').trim();const n=txt.split(' ').length;
 if(n<40)return TLN.msg='Truyện cần ít nhất 40 từ (hiện có '+n+').',render();if(n>400)return TLN.msg='Truyện tối đa khoảng 400 từ (hiện có '+n+'). Hãy cắt bớt.',render();
 if(/[À-ỹ]/.test(txt)&&txt.replace(/[^À-ỹ]/g,'').length>20)return TLN.msg='Hãy dán truyện bằng tiếng Anh.',render();
 TLN.busy=true;TLN.draft=txt;TLN.msg='AI đang soạn bài (khoảng 20–40 giây)…';render();
 try{const r=await ai('story',{text:txt});if(r&&r.error)throw new Error(r.error);const L=tlClean(r,txt.slice(0,60));TLP.mine.unshift(L);tlSave();TLN={busy:false,msg:''};toast('Đã tạo bài “'+L.title+'”');tlOpen(L.id)}
 catch(e){TLN.busy=false;TLN.msg=e&&e.code=='login'?'Hãy đăng nhập ở trang Tài khoản để dùng AI.':e&&e.code=='rate_limited'?'AI đang bận, thử lại sau ít phút.':'AI chưa soạn được bài: '+(e.message||e)+'. Bấm tạo lại.';render()}}
function tlDel(id){if(!confirm('Xóa bài này khỏi máy?'))return;TLP.mine=TLP.mine.filter(x=>x.id!=id);tlSave();go('home')}
function vStoryForm(){return `<button class="link" onclick="go('home')">‹ Trang Học</button><h1 style="margin-top:6px">Tạo bài từ truyện ngắn</h1>
 <p class="mut">Dán một truyện hoặc đoạn văn tiếng Anh 40–400 từ. AI soạn đủ 4 phần: Từ vựng, Đọc hiểu, Nghe, Phát âm, kèm Shadowing.</p>
 <textarea id="tlstory" rows="10" style="width:100%" placeholder="Paste your English story here…" ${TLN.busy?'disabled':''}>${esc(TLN.draft||'')}</textarea>
 <div class="mut" style="font-size:.84rem;margin:6px 0">${esc(TLN.msg)}</div>
 <button class="btn" style="width:100%" ${TLN.busy?'disabled':''} onclick="tlBuild()">${TLN.busy?'Đang soạn…':'✨ AI tạo bài học'}</button>
 <p class="mut" style="font-size:.8rem;margin-top:8px">Bài lưu trên máy này. Câu hỏi và bản dịch do AI soạn, có thể chưa hoàn hảo.</p>`}

/* ===================== CHIA SẺ BÀI TRUYỆN CHO KHÓA (admin duyệt) =====================
 Bảng supabase/topic_lessons.sql. Bài đã duyệt hiện cho mọi người trong khóa, cạnh các bài có sẵn. */
let TLC={for:null,list:[],pend:null,pfor:null,err:''};
const tlStrip=L=>{const o={...L};['mine','shared','sid','id','author','status'].forEach(k=>delete o[k]);return o};
async function tlcLoad(){const tr=typeof curTrack=='function'&&curTrack();TLC.for=tr?.id||'x';TLC.list=[];if(!tr||typeof SB=='undefined'||!USER)return;
 const {data,error}=await SB.from('topic_lessons').select('id,title,level,data,author,status,created_by').eq('track_id',tr.id).order('id',{ascending:false}).limit(60);
 if(error){TLC.err=/topic_lessons/.test(error.message)?'need_sql':error.message;return}
 TLC.list=(data||[]).map(r=>({...r.data,id:'s'+r.id,sid:r.id,status:r.status,author:r.author,own:r.created_by==USER.id,title:r.title||r.data.title}));
 /* cập nhật trạng thái bài của mình */let ch=0;for(const L of TLP.mine)if(L.sid){const s=TLC.list.find(x=>x.sid==L.sid);const st=s?s.status:'rejected';if(L.shared!=st){L.shared=st;ch=1}}if(ch)tlSave();render()}
function tlShared(){const tid=(typeof curTrack=='function'&&curTrack()?.id)||'x';if(TLC.for!==tid)tlcLoad();const mine=new Set(TLP.mine.map(x=>x.sid).filter(Boolean));return TLC.list.filter(x=>x.status=='live'&&!mine.has(x.sid))}
async function tlShare(id){const L=TLP.mine.find(x=>x.id==id);const tr=curTrack();if(!L||!tr)return;if(!USER)return toast('Hãy đăng nhập để chia sẻ');
 if(!confirm('Chia sẻ bài “'+L.title+'” cho mọi người trong khóa '+tr.name+'? Admin sẽ xem và duyệt trước khi hiện.'))return;
 const {data,error}=await SB.from('topic_lessons').insert({track_id:tr.id,title:L.title.slice(0,120),level:L.level,data:tlStrip(L),author:PROF?.full_name||USER.email.split('@')[0]}).select('id').single();
 if(error)return toast(/topic_lessons/.test(error.message)?'Admin cần chạy supabase/topic_lessons.sql':'Lỗi: '+error.message);
 L.sid=data.id;L.shared='pending';tlSave();toast('Đã gửi, chờ admin duyệt');render()}
/* Admin */
async function tlaLoad(){const tr=curTrack();TLC.pfor=tr?.id;const {data,error}=await SB.from('topic_lessons').select('*').eq('track_id',tr.id).eq('status','pending').order('id');TLC.pend=error?[]:(data||[]);TLC.perr=error&&/topic_lessons/.test(error.message);render()}
async function tlaSet(id,st){let note='';if(st=='rejected'){note=prompt('Lý do từ chối (không bắt buộc):')||'';}
 const {error}=await SB.from('topic_lessons').update({status:st,note,reviewed_at:new Date().toISOString()}).eq('id',id);if(error)return toast(error.message);
 TLC.pend=TLC.pend.filter(x=>x.id!==id);TLC.for=null;toast(st=='live'?'Đã duyệt':'Đã từ chối');render()}
function tlaPreview(id){const r=TLC.pend.find(x=>x.id==id);if(!r)return;TLS={id:'p'+id,part:'read',a:{}};TLC.preview={...r.data,id:'p'+id,title:r.title,vi:'Xem trước · chờ duyệt'};go('tl')}
function vTopicAdmin(){const tr=curTrack();if(!tr)return '';if(TLC.pfor!==tr.id){TLC.pend=null;tlaLoad()}const L=TLC.pend||[];
 if(TLC.perr)return `<h2>Bài truyện chờ duyệt</h2><p class="note">Chạy <b>supabase/topic_lessons.sql</b> trong Supabase → SQL Editor để bật chia sẻ bài truyện.</p>`;
 return `<h2>Bài truyện chờ duyệt · ${esc(shortName(tr))}</h2>${!L.length?'<p class="mut">Không có bài nào chờ duyệt.</p>':`<div class="stack">${L.map(r=>{const d=r.data||{};return `<div class="card stack" style="gap:6px"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b>${esc(r.title)}</b><span class="chip">${esc(r.level||'')}</span></div><small class="mut">${esc(r.author||'')} · ${(d.text||[]).length} câu · ${(d.vocab||[]).length} từ · ${(d.tf||[]).length+(d.mcq||[]).length} câu hỏi</small>
 <details><summary class="link">Xem truyện & từ vựng</summary><div style="margin-top:6px">${(d.text||[]).map(x=>`<p style="margin:4px 0">${esc(x[0])}<br><small class="mut">${esc(x[1])}</small></p>`).join('')}<div class="stack" style="gap:2px;margin-top:6px">${(d.vocab||[]).map(v=>`<small><b>${esc(v.en)}</b> ${esc(v.ipa||'')} · ${esc(v.vi)}</small>`).join('')}</div></div></details>
 <div class="row"><button class="chip" onclick="tlaPreview(${r.id})">👁 Mở thử bài</button><button class="chip" onclick="tlaSet(${r.id},'live')">✓ Duyệt</button><button class="chip danger" onclick="tlaSet(${r.id},'rejected')">Từ chối</button></div></div>`}).join('')}</div>`}`}
