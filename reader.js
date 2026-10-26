/* ===================== ĐỌC TRUYỆN (thư viện truyện tiếng Anh, lật trang) =====================
 Dữ liệu: stories/library.json (truyện public domain từ Project Gutenberg).
 Mỗi truyện: {id, kind:'text'|'picture', kids, title, author, year, level, words, added, source, url, blurb, paras | cover+pages}
 Tiến độ đọc và trình độ lưu trên máy (localStorage 'ssread'). */
const RD_LEVELS=['Pre-A1','A1','A2','B1','B2','C1'];
const RD_LVNAME={'Pre-A1':'Mới bắt đầu','A1':'Sơ cấp','A2':'Sơ trung cấp','B1':'Trung cấp','B2':'Trung cao cấp','C1':'Cao cấp'};
const RD={lib:null,err:'',filter:'for',quiz:null,book:null,flip:null};
function rdState(){try{return JSON.parse(localStorage.getItem('ssread')||'{}')}catch(e){return{}}}
function rdSet(k,v){const s=rdState();s[k]=v;try{localStorage.setItem('ssread',JSON.stringify(s))}catch(e){}}
async function rdLoad(){try{const r=await fetch('stories/library.json?v='+Date.now());if(!r.ok)throw 0;RD.lib=await r.json()}catch(e){RD.err='Chưa tải được thư viện truyện. Kiểm tra mạng rồi thử lại.';RD.lib=[]}if(S.tab=='read')render()}
const rdIdx=l=>Math.max(0,RD_LEVELS.indexOf(l));
const rdMins=b=>Math.max(1,Math.round(b.words/(b.kids?60:150)));

/* ---- kiểm tra trình độ đọc: 3 câu mỗi cấp, A1 → C1 ---- */
const RD_Q=[
 ['A1','The cat is ___ the box.',['in','at','of'],0],
 ['A1','I ___ a student.',['am','is','are'],0],
 ['A1','"Apple" is a kind of ___.',['fruit','animal','color'],0],
 ['A2','She ___ to school by bus every day.',['goes','go','going'],0],
 ['A2','We didn\'t go out ___ it was raining.',['because','but','so'],0],
 ['A2','"Hungry" means you want to ___.',['eat','sleep','run'],0],
 ['B1','If I ___ more time, I would read more books.',['had','have','will have'],0],
 ['B1','He has lived here ___ 2015.',['since','for','from'],0],
 ['B1','"Reluctant" means ___.',['not wanting to do something','very happy','extremely tired'],0],
 ['B2','By the time we arrived, the film ___.',['had already started','already started','has already started'],0],
 ['B2','Her explanation was so ___ that nobody understood it.',['convoluted','concise','candid'],0],
 ['B2','"To make ends meet" means ___.',['to have just enough money to live','to finish a project','to meet old friends'],0],
 ['C1','___ had she sat down than the phone rang.',['No sooner','Hardly','Scarcely'],0],
 ['C1','The minister\'s remarks were seen as an attempt to ___ public anger.',['assuage','aggravate','articulate'],0],
 ['C1','"Ubiquitous" means ___.',['found everywhere','very rare','extremely old'],0]];
function rdQuizStart(){const qs=RD_Q.map((q,i)=>{const o=q[2].map((t,j)=>({t,ok:j===q[3]}));for(let k=o.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[o[k],o[j]]=[o[j],o[k]]}return{lv:q[0],s:q[1],o,i}});RD.quiz={qs,i:0,ans:[]};render();scrollTo(0,0)}
function rdQuizPick(j){const q=RD.quiz;q.ans.push(q.qs[q.i].o[j].ok?1:0);q.i++;if(q.i>=q.qs.length){let lv='Pre-A1';for(const L of ['A1','A2','B1','B2','C1']){const sc=q.qs.reduce((n,x,k)=>n+(x.lv==L?q.ans[k]:0),0);if(sc>=2)lv=L;else break}rdSet('level',lv);rdSet('tested',new Date().toISOString().slice(0,10));RD.quiz=null;RD.filter='for';toast('Trình độ đọc của bạn: '+lv)}render();scrollTo(0,0)}
function vReadQuiz(){const q=RD.quiz,x=q.qs[q.i];return `<div class="stack"><div class="row" style="justify-content:space-between"><span class="lbl">Kiểm tra trình độ đọc · ${q.i+1}/${q.qs.length}</span><button class="chip" onclick="RD.quiz=null;render()">Thoát</button></div>
 <div class="bar"><i style="width:${q.i/q.qs.length*100}%"></i></div>
 <div class="card"><p style="font-size:1.15rem;margin:0">${esc(x.s)}</p></div>
 ${x.o.map((o,j)=>`<button class="opt" onclick="rdQuizPick(${j})">${esc(o.t)}</button>`).join('')}
 <p class="mut" style="font-size:.84rem">Không chắc thì cứ chọn đáp án bạn nghĩ đúng nhất. Kết quả chỉ dùng để gợi ý truyện.</p></div>`}

/* ---- thư viện ---- */
function rdRecommend(books,lv){const u=rdIdx(lv);return books.filter(b=>{const d=rdIdx(b.level)-u;return lv=='Pre-A1'?b.kids:(d===0||d===-1)})}
function rdCard(b,tag){const st=rdState(),p=(st.pos||{})[b.id],done=(st.done||{})[b.id];
 const cov=b.cover?`<img src="${esc(b.cover)}" alt="" loading="lazy">`:`<span>${esc(b.title)}</span>`;
 return `<button class="rd-book" onclick="rdOpen('${esc(b.id)}')"><div class="rd-cov ${b.cover?'pic':''}">${cov}</div>
  <div class="rd-info"><div class="row" style="gap:6px"><span class="rd-lv">${esc(b.level)}</span>${b.kids?'<span class="rd-tag kid">Thiếu nhi</span>':''}${tag?`<span class="rd-tag">${tag}</span>`:''}</div>
  <b>${esc(b.title)}</b><span class="mut" style="font-size:.82rem">${esc(b.author)}, ${b.year} · ~${rdMins(b)} phút</span>
  <span style="font-size:.86rem">${esc(b.blurb)}</span>
  ${done?'<span class="rd-prog ok">Đã đọc xong</span>':p?'<span class="rd-prog">Đang đọc dở · trang '+(p+1)+'</span>':''}</div></button>`}
function vRead(){if(RD.quiz)return vReadQuiz();if(!RD.lib){rdLoad();return `<div class="card mut">Đang tải thư viện truyện…</div>`}
 const st=rdState(),lv=st.level,all=RD.lib.slice().sort((a,b)=>(b.added||'').localeCompare(a.added||''));
 const newest=all[0];
 const lvCard=lv?`<div class="rd-lvcard"><div><div class="lbl" style="color:inherit;opacity:.8">Trình độ đọc của bạn</div><div class="rd-big">${esc(lv)} <small>${esc(RD_LVNAME[lv])}</small></div><div style="font-size:.85rem;opacity:.9">Nên đọc truyện cấp ${lv=='Pre-A1'?'thiếu nhi có hình':esc(RD_LEVELS[Math.max(1,rdIdx(lv)-1)])+'–'+esc(lv)} để đọc trôi chảy. Muốn thử sức thì chọn cấp ${esc(RD_LEVELS[Math.min(5,rdIdx(lv)+1)])}.</div></div><button class="chip" onclick="rdQuizStart()">Kiểm tra lại</button></div>`
  :`<div class="rd-lvcard"><div><div class="lbl" style="color:inherit;opacity:.8">Chưa biết nên đọc truyện nào?</div><div style="font-family:var(--fd);font-size:1.25rem;font-weight:600">Kiểm tra trình độ đọc trong 2 phút</div><div style="font-size:.85rem;opacity:.9">15 câu ngắn từ A1 đến C1. Xong sẽ gợi ý truyện vừa sức.</div></div><button class="btn amber" onclick="rdQuizStart()">Bắt đầu</button></div>`;
 const F=[['for','Gợi ý cho bạn'],['kids','Thiếu nhi'],['all','Tất cả'],...['A1','A2','B1','B2','C1'].map(l=>[l,l])];
 let list=all;if(RD.filter=='for')list=lv?rdRecommend(all,lv):all;else if(RD.filter=='kids')list=all.filter(b=>b.kids);else if(RD.filter!='all')list=all.filter(b=>b.level==RD.filter);
 const tag=b=>lv&&!b.kids&&rdIdx(b.level)>rdIdx(lv)?'Thử thách':'';
 return `<div class="stack"><div><div class="lbl">Thư viện truyện</div><h1>Đọc truyện</h1><p class="mut" style="margin:4px 0 0">Mỗi tuần thêm một truyện tiếng Anh. Lật trang như sách thật, bấm loa để nghe đọc.</p></div>
 ${lvCard}
 ${newest?`<div><div class="lbl" style="margin-bottom:6px">Truyện mới tuần này</div>${rdCard(newest,'Mới')}</div>`:''}
 <div class="hscroll">${F.map(([k,n])=>`<button class="chip ${RD.filter==k?'on':''}" onclick="RD.filter='${k}';render()">${n}</button>`).join('')}</div>
 ${RD.err?`<div class="card" style="color:var(--bad)">${esc(RD.err)}</div>`:''}
 <div class="stack">${list.length?list.map(b=>rdCard(b,tag(b))).join(''):`<div class="card mut">Chưa có truyện ở mục này. Truyện mới được thêm mỗi thứ Hai.</div>`}</div>
 ${vReadPrivate()}
 <p class="mut" style="font-size:.78rem">Truyện thuộc phạm vi công cộng (public domain), lấy từ Project Gutenberg.</p></div>`}

/* ---- trình đọc lật trang ---- */
function rdLib(){return new Promise((ok,no)=>{if(window.St)return ok();const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
/* Kích thước trang theo khung còn trống. Điện thoại: một trang lấp đầy màn hình. Máy tính: hai trang tỉ lệ sách. */
function rdStageBox(){const s=document.getElementById('rd-stage');return{W:Math.floor(Math.min(s?s.clientWidth:innerWidth-16,1300)),H:Math.floor(s?s.clientHeight:innerHeight-120)}}
function rdSize(){const{W,H}=rdStageBox();const single=W<720;if(single){const pw=W,ph=Math.min(H,Math.round(W*1.9));return{pw,ph,single}}let pw=Math.floor(W/2),ph=Math.round(pw*1.42);if(ph>H){ph=H;pw=Math.round(ph/1.42)}return{pw,ph,single}}
function rdPaginate(b,pw,ph,fs){const m=document.createElement('div');m.style.cssText='position:absolute;left:-9999px;top:0;visibility:hidden';document.body.appendChild(m);
 const pg=document.createElement('div');pg.className='rd-page';pg.style.cssText=`position:relative;width:${pw}px;height:${ph}px;font-size:${fs}px`;const inner=document.createElement('div');inner.className='rd-in';pg.appendChild(inner);m.appendChild(pg);
 const over=()=>inner.scrollHeight>inner.clientHeight+1,pages=[];const flush=()=>{pages.push(inner.innerHTML);inner.innerHTML=''};
 b.paras.forEach((t,i)=>{let p=document.createElement('p');if(i===0)p.className='first';p.textContent=t;inner.appendChild(p);if(!over())return;
  const w=t.split(' ');p.textContent='';for(let k=0;k<w.length;k++){p.textContent+=(p.textContent?' ':'')+w[k];if(over()){const a=p.textContent.split(' ');a.pop();p.textContent=a.join(' ');if(!p.textContent)p.remove();flush();p=document.createElement('p');p.className='cont';p.textContent=w[k];inner.appendChild(p)}}});
 if(inner.innerHTML)flush();m.remove();return pages}
async function rdOpen(id){const b=RD.lib.find(x=>x.id==id);if(!b)return;RD.book=b;
 let ov=document.getElementById('rd-ov');if(!ov){ov=document.createElement('div');ov.id='rd-ov';document.body.appendChild(ov)}
 ov.innerHTML=`<div class="rd-top"><button class="chip" onclick="rdClose()">← Thư viện</button><b class="rd-ttl">${esc(b.title)}</b><span id="rd-pos" class="mono"></span></div>
  <div id="rd-stage"><div class="mut" style="color:#cfc6b5">Đang mở sách…</div></div>
  <div class="rd-bot"><button class="chip" onclick="RD.flip&&RD.flip.flipPrev()" aria-label="Trang trước">←</button><button class="chip" id="rd-say" onclick="rdSpeak()">${svg('spk')} Nghe</button><button class="chip rd-auto ${rdState().auto?'on':''}" id="rd-auto" role="switch" aria-checked="${rdState().auto?'true':'false'}" onclick="rdAutoToggle()"><i class="rd-sw" aria-hidden="true"></i>Tự đọc</button><button class="chip" onclick="RD.flip&&RD.flip.flipNext()" aria-label="Trang sau">→</button></div>`;
 document.body.classList.add('rd-open');try{await rdLib()}catch(e){document.getElementById('rd-stage').innerHTML='<div style="color:#f3b0a8">Không tải được bộ lật trang. Kiểm tra mạng rồi mở lại.</div>';return}rdBuild()}
function rdBuild(){const b=RD.book;if(!b)return;const{pw,ph,single}=rdSize();const fs=b.kids?Math.max(15,Math.min(22,pw/20)):Math.max(13,Math.min(17,pw/26));
 if(RD.flip){try{RD.flip.destroy()}catch(e){}RD.flip=null}
 const stg=document.getElementById('rd-stage');stg.innerHTML='<div id="rd-book"></div>';const el=document.getElementById('rd-book');el.style.fontSize=fs+'px';
 const mk=(cls,html,hard)=>{const d=document.createElement('div');d.className='rd-page '+cls;if(hard)d.dataset.density='hard';d.innerHTML=html;el.appendChild(d);return d};
 mk('rd-cover',`<div class="rd-cvin">${b.cover?`<img src="${esc(b.cover)}" alt="">`:''}<div class="k">${esc(b.level)}${b.kids?' · Thiếu nhi':''}</div><h2>${esc(b.title)}</h2><div class="a">${esc(b.author)}, ${b.year}</div><div class="src">${esc(b.source)} · Public domain</div></div>`,1);
 let n=0;const folio=()=>`<div class="rd-folio">${++n}</div>`;
 if(b.kind=='picture')b.pages.forEach(p=>mk('rd-pic',`<div class="rd-in kid">${p.img?`<img src="${esc(p.img)}" alt="">`:''}${p.text.map(t=>`<p>${esc(t)}</p>`).join('')}</div>${folio()}`));
 else rdPaginate(b,pw,ph,fs).forEach(h=>mk('',`<div class="rd-in">${h}</div>${folio()}`));
 mk('rd-end',`<div class="rd-in end"><p class="te">The End</p><p>${esc(b.blurb)}</p><p><a href="${esc(b.url)}" target="_blank" rel="noopener">Xem bản gốc trên Project Gutenberg</a></p></div>`);
 if(!single&&el.children.length%2)mk('','<div class="rd-in"></div>');
 mk('rd-cover','<div class="rd-cvin" style="justify-content:center;text-align:center"><div class="k">Hẹn gặp bạn với truyện tuần sau</div></div>',1);
 const f=new St.PageFlip(el,{width:pw,height:ph,size:'fixed',showCover:true,usePortrait:single,maxShadowOpacity:.4,mobileScrollSupport:false,flippingTime:700});
 f.loadFromHTML(el.querySelectorAll('.rd-page'));RD.flip=f;const tot=f.getPageCount();
 const pos=(rdState().pos||{})[b.id]||0;if(pos>0&&pos<tot)f.turnToPage(pos);
 const upd=()=>{const i=f.getCurrentPageIndex();const pe=document.getElementById('rd-pos');if(pe)pe.textContent=`${i+1}/${tot}`;const st=rdState();st.pos=st.pos||{};st.pos[b.id]=i;if(i>=tot-3){st.done=st.done||{};if(!st.done[b.id]){st.done[b.id]=1;S.xp+=20;try{save()}catch(e){}toast('Đọc xong truyện! +20 XP')}}try{localStorage.setItem('ssread',JSON.stringify(st))}catch(e){}rdAfterFlip()};
 f.on('flip',upd);upd()}
/* Tự đọc: bật một lần, mỗi lần lật trang app tự đọc trang mới (chờ hiệu ứng lật xong). */
let rdAT=null;
function rdAfterFlip(){try{speechSynthesis.cancel()}catch(e){}clearTimeout(rdAT);if(rdState().auto)rdAT=setTimeout(()=>rdSpeak(true),750)}
function rdAutoToggle(){const on=!rdState().auto;rdSet('auto',on);const b=document.getElementById('rd-auto');if(b){b.classList.toggle('on',on);b.setAttribute('aria-checked',on?'true':'false')}
 if(on){toast('Đã bật tự đọc khi lật trang');rdSpeak(true)}else{try{speechSynthesis.cancel()}catch(e){}clearTimeout(rdAT);toast('Đã tắt tự đọc')}}
function rdSpeak(force){const f=RD.flip;if(!f)return;if(!force&&speechSynthesis.speaking){speechSynthesis.cancel();return}const i=f.getCurrentPageIndex(),els=[...document.querySelectorAll('#rd-book .rd-page')];
 const vis=rdSize().single?[i]:[i,i+1];const txt=vis.map(k=>els[k]).filter(Boolean).map(e=>[...e.querySelectorAll('.rd-in p, h2')].map(p=>p.textContent).join(' ')).join(' ').trim();if(txt)say(txt,RD.book.kids?0.85:0.95);else toast('Trang này không có chữ')}
function rdClose(){clearTimeout(rdAT);try{speechSynthesis.cancel()}catch(e){}if(RD.flip){try{RD.flip.destroy()}catch(e){}RD.flip=null}document.getElementById('rd-ov')?.remove();if(RDP.pdf){try{RDP.pdf.destroy()}catch(e){}RDP.pdf=null}document.body.classList.remove('rd-open');RD.book=null;render()}
let rdRT;addEventListener('resize',()=>{if(!RD.book)return;clearTimeout(rdRT);rdRT=setTimeout(RD.book.pdf?rdpBuild:rdBuild,300)});
addEventListener('keydown',e=>{if(!RD.flip)return;if(e.key=='ArrowLeft')RD.flip.flipPrev();if(e.key=='ArrowRight')RD.flip.flipNext();if(e.key=='Escape')rdClose()});

/* ===================== TỦ SÁCH RIÊNG (PDF của chính người dùng, chỉ chủ tài khoản đọc được) =====================
 File nằm trong bucket riêng tư 'private-books' trên Supabase, thư mục <user id>/. Cần chạy supabase/private_books.sql. */
const RDP={list:null,err:'',busy:'',pdf:null,done:new Set()};
const rdpName=n=>n.replace(/^(\d+_)+/,'').replace(/\.pdf$/i,'').replace(/[_-]+/g,' ').trim();
async function rdpLoad(){if(!USER){RDP.list=[];return}RDP.list=RDP.list||[];const {data,error}=await SB.storage.from('private-books').list(USER.id,{limit:200,sortBy:{column:'created_at',order:'desc'}});
 RDP.err=error?(/not found|bucket/i.test(error.message)?'Tủ sách riêng chưa được bật: cần chạy supabase/private_books.sql trên Supabase.':error.message):'';RDP.list=(data||[]).filter(f=>/\.pdf$/i.test(f.name));if(S.tab=='read'&&!RD.book)render()}
function vReadPrivate(){if(!USER)return `<div class="card mut" style="font-size:.88rem">Đăng nhập để dùng Tủ sách riêng: tải PDF của bạn lên và đọc lật trang, chỉ mình bạn xem được.</div>`;
 if(RDP.list===null){RDP.list=[];rdpLoad()}
 return `<div class="rd-priv"><div class="row" style="justify-content:space-between"><div><div class="lbl">Chỉ mình bạn thấy</div><h3>Tủ sách riêng</h3></div>
  <label class="chip" style="cursor:pointer">${svg('plus')} Tải PDF lên<input type="file" id="rdp-up" accept="application/pdf" multiple hidden onchange="rdpUpload(this.files)"></label></div>
  <p class="mut" style="font-size:.82rem;margin:4px 0 8px">Sách bạn tự có, ví dụ truyện tranh. Không ai khác dùng app thấy hay mở được các file này.</p>
  ${RDP.busy?`<div class="card mut">${esc(RDP.busy)}</div>`:''}${RDP.err?`<div class="card" style="color:var(--bad)">${esc(RDP.err)}</div>`:''}
  <div class="stack">${RDP.list.map(f=>`<div class="rd-book" style="grid-template-columns:52px 1fr auto;align-items:center"><div class="rd-cov" style="width:52px;height:70px">PDF</div>
   <button style="text-align:left" onclick="rdpOpen(${esc(JSON.stringify(f.name))})"><b style="font-family:var(--fd);font-size:1.05rem">${esc(rdpName(f.name))}</b><div class="mut" style="font-size:.78rem">${((f.metadata?.size||0)/1048576).toFixed(1)} MB${(rdState().ppos||{})[f.name]?' · đang đọc trang '+((rdState().ppos||{})[f.name]+1):''}</div></button>
   <button class="ic" aria-label="Xóa ${esc(rdpName(f.name))}" onclick="rdpDel(${esc(JSON.stringify(f.name))})">✕</button></div>`).join('')||(RDP.err?'':'<div class="card mut" style="font-size:.86rem">Chưa có sách nào. Bấm "Tải PDF lên" để thêm.</div>')}</div></div>`}
async function rdpUpload(files){for(const f of files){if(f.size>50*1048576){toast(f.name+' lớn hơn 50 MB');continue}RDP.busy='Đang tải lên '+f.name+'…';render();
  const safe=f.name.normalize('NFD').replace(/[^\w.\-]+/g,'_');const {error}=await SB.storage.from('private-books').upload(`${USER.id}/${Date.now()}_${safe}`,f,{contentType:'application/pdf',upsert:false});
  if(error){RDP.err='Chưa tải lên được: '+(/bucket|not found/i.test(error.message)?'cần chạy supabase/private_books.sql trên Supabase.':error.message)}}
 RDP.busy='';await rdpLoad();render()}
async function rdpDel(n){if(RDP.confirm!==n){RDP.confirm=n;toast('Bấm ✕ lần nữa để xóa');setTimeout(()=>{if(RDP.confirm===n)RDP.confirm=null},3000);return}RDP.confirm=null;const {error}=await SB.storage.from('private-books').remove([`${USER.id}/${n}`]);if(error)return toast('Chưa xóa được: '+error.message);toast('Đã xóa');rdpLoad()}
function rdpLib(){return new Promise((ok,no)=>{if(window.pdfjsLib)return ok();const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=()=>{pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';ok()};s.onerror=no;document.head.appendChild(s)})}
async function rdpOpen(n){RD.book={id:'pdf:'+n,title:rdpName(n),pdf:n,kids:true};
 let ov=document.getElementById('rd-ov');if(!ov){ov=document.createElement('div');ov.id='rd-ov';document.body.appendChild(ov)}
 ov.innerHTML=`<div class="rd-top"><button class="chip" onclick="rdClose()">← Thư viện</button><b class="rd-ttl">${esc(RD.book.title)}</b><span id="rd-pos" class="mono"></span></div><div id="rd-stage"><div style="color:#cfc6b5">Đang mở sách…</div></div>
  <div class="rd-bot"><button class="chip" onclick="RD.flip&&RD.flip.flipPrev()" aria-label="Trang trước">←</button><button class="chip" onclick="RD.flip&&RD.flip.flipNext()" aria-label="Trang sau">→</button></div>`;
 document.body.classList.add('rd-open');
 try{await Promise.all([rdLib(),rdpLib()]);const {data,error}=await SB.storage.from('private-books').createSignedUrl(`${USER.id}/${n}`,3600);if(error)throw error;
  RDP.pdf=await pdfjsLib.getDocument(data.signedUrl).promise;RDP.done=new Set();rdpBuild()}
 catch(e){const st=document.getElementById('rd-stage');if(st)st.innerHTML=`<div style="color:#f3b0a8">Không mở được sách: ${esc(e.message||'lỗi mạng')}</div>`}}
async function rdpBuild(){const b=RD.book,pdf=RDP.pdf;if(!b||!pdf)return;const p1=await pdf.getPage(1),vp=p1.getViewport({scale:1}),ar=vp.height/vp.width;
 const{W,H}=rdStageBox(),single=W<720||ar<1;let pw=single?W:Math.floor(W/2),ph=Math.round(pw*ar);if(ph>H){ph=H;pw=Math.round(ph/ar)}
 if(RD.flip){try{RD.flip.destroy()}catch(e){}RD.flip=null}RDP.done=new Set();
 const st=document.getElementById('rd-stage');st.innerHTML='<div id="rd-book"></div>';const el=document.getElementById('rd-book');
 for(let i=1;i<=pdf.numPages;i++){const d=document.createElement('div');d.className='rd-page rd-pdf';if(i==1||i==pdf.numPages)d.dataset.density='hard';d.innerHTML=`<canvas data-p="${i}"></canvas>`;el.appendChild(d)}
 const f=new St.PageFlip(el,{width:pw,height:ph,size:'fixed',showCover:!single,usePortrait:single,maxShadowOpacity:.4,mobileScrollSupport:false,flippingTime:700});
 f.loadFromHTML(el.querySelectorAll('.rd-page'));RD.flip=f;const tot=f.getPageCount();
 const draw=async i=>{if(i<0||i>=tot||RDP.done.has(i))return;RDP.done.add(i);const c=el.querySelector(`canvas[data-p="${i+1}"]`);if(!c)return;const pg=await pdf.getPage(i+1);const sc=pw*Math.min(2,devicePixelRatio||1)/pg.getViewport({scale:1}).width;const v=pg.getViewport({scale:sc});c.width=v.width;c.height=v.height;await pg.render({canvasContext:c.getContext('2d'),viewport:v}).promise};
 const near=i=>{for(let k=-2;k<=3;k++)draw(i+k)};
 const pos=(rdState().ppos||{})[b.pdf]||0;if(pos>0&&pos<tot)f.turnToPage(pos);
 const upd=()=>{const i=f.getCurrentPageIndex();near(i);const pe=document.getElementById('rd-pos');if(pe)pe.textContent=`${i+1}/${tot}`;const s=rdState();s.ppos=s.ppos||{};s.ppos[b.pdf]=i;try{localStorage.setItem('ssread',JSON.stringify(s))}catch(e){}};
 f.on('flip',upd);upd()}
