/* Quay lại: lưu lịch sử màn hình + vuốt từ cạnh trái để về màn trước (app trên màn hình chính) */
(function(){
 if(window._backJs)return;window._backJs=1;
 let restoring=false;
 const snap=()=>({t:S.tab,th:(window.NT&&NT.thread)||null});
 function hook(){
  if(typeof window.go!=='function'||typeof S=='undefined')return setTimeout(hook,200);
  const g0=window.go;
  window.go=function(t){const before=S.tab;const r=g0.apply(this,arguments);
   if(!restoring&&t!==before)try{history.pushState(snap(),'')}catch(e){}return r};
  try{history.replaceState(snap(),'')}catch(e){}
  addEventListener('popstate',ev=>{const st=ev.state;if(!st||!st.t)return;restoring=true;
   try{if(window.NT)NT.thread=st.th||null;S.game=null;S.tab=st.t;render();scrollTo(0,0)}finally{restoring=false}});
 }
 hook();
 /* Mở chat từ inbox cũng lưu lịch sử để vuốt về inbox */
 const hookChat=()=>{if(!window.NTX||!NTX.openChat)return setTimeout(hookChat,300);if(NTX._bk)return;NTX._bk=1;
  const oc=NTX.openChat;NTX.openChat=function(u){const r=oc.apply(this,arguments);try{history.pushState(snap(),'')}catch(e){}return r}};
 hookChat();

 /* Cử chỉ vuốt cạnh: chỉ khi chạy như app (Safari thường đã có sẵn vuốt quay lại) */
 const standalone=navigator.standalone||matchMedia('(display-mode: standalone)').matches;
 if(!standalone)return;
 const css=document.createElement('style');css.textContent=`#bk-ind{position:fixed;left:0;top:50%;z-index:2147483000;width:44px;height:44px;margin-top:-22px;border-radius:50%;display:grid;place-items:center;background:var(--card,#fff);color:var(--steel,#1f4e79);box-shadow:0 6px 18px rgba(0,0,0,.25);transform:translateX(-60px);pointer-events:none;transition:opacity .15s}#bk-ind.go{background:var(--steel,#1f4e79);color:#fff}`;document.head.appendChild(css);
 let sx=0,sy=0,act=false,dx=0,ind=null;
 addEventListener('touchstart',e=>{const t=e.touches[0];if(e.touches.length>1||t.clientX>24||history.length<2){act=false;return}
  if(document.querySelector('.saga-modal,.ss-modal,#rd-ov,#rd-zoom'))return;
  act=true;sx=t.clientX;sy=t.clientY;dx=0},{passive:true});
 addEventListener('touchmove',e=>{if(!act)return;const t=e.touches[0];dx=t.clientX-sx;const dy=Math.abs(t.clientY-sy);
  if(dy>60&&dy>dx){act=false;ind&&ind.remove();ind=null;return}
  if(dx>10){if(!ind){ind=document.createElement('div');ind.id='bk-ind';ind.setAttribute('aria-hidden','true');ind.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';document.body.appendChild(ind)}
   const p=Math.min(dx,120);ind.style.transform=`translateX(${p*.75-50}px)`;ind.style.top=t.clientY+'px';ind.classList.toggle('go',dx>90)}},{passive:true});
 addEventListener('touchend',()=>{if(!act)return;act=false;const ok=dx>90;if(ind){ind.remove();ind=null}if(ok){try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}history.back()}},{passive:true});
})();
