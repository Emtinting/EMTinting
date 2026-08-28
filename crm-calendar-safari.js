(()=>{
  const qs=(s,r=document)=>r.querySelector(s);
  const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  let drag=null;
  const addDays=(date,days)=>{const d=new Date(`${date}T12:00:00`);d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)};
  async function saveMove(id,date,time){
    const b=(state.bookings||[]).find(x=>x.id===id); if(!b||!date)return;
    const payload={appointment_date:date,updated_at:new Date().toISOString()}; if(time)payload.appointment_time=time;
    const {data,error}=await db.from('bookings').update(payload).eq('id',id).select().single();
    if(error)return toast(error.message);
    const i=state.bookings.findIndex(x=>x.id===id); if(i>=0)state.bookings[i]={...state.bookings[i],...data};
    toast('Appointment moved');
    if(typeof renderAll==='function')renderAll();
    setTimeout(()=>{document.querySelector('[data-view="calendar"]')?.click();},30);
  }
  function targetInfo(el,id){
    const slot=el?.closest?.('.cal-slot'); if(slot)return{date:slot.dataset.dropDate,time:slot.dataset.dropTime||null};
    const month=el?.closest?.('.cal-month-day'); if(month?.dataset.dropDate)return{date:month.dataset.dropDate,time:null};
    const days=qsa('#calendarBody .cal-day'); const day=el?.closest?.('.cal-day');
    if(day&&days.length){const targetIndex=days.indexOf(day);const src=qs(`.cal-event[data-booking="${id}"]`)?.closest('.cal-day');const srcIndex=src?days.indexOf(src):-1;const b=(state.bookings||[]).find(x=>x.id===id);if(b&&srcIndex>=0&&targetIndex>=0)return{date:addDays(b.appointment_date,targetIndex-srcIndex),time:null};}
    return null;
  }
  function bind(){
    qsa('#calendarBody .cal-event[data-booking]').forEach(card=>{
      if(card.dataset.safariBound)return; card.dataset.safariBound='1'; card.style.touchAction='none'; card.style.cursor='grab';
      card.addEventListener('click',e=>{if(card.dataset.justDragged==='1'){card.dataset.justDragged='0';e.preventDefault();e.stopPropagation();return;} e.preventDefault();e.stopPropagation();window.openReschedule?.(card.dataset.booking);});
      card.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:card.dataset.booking,card,startX:e.clientX,startY:e.clientY,moved:false,ghost:null};card.setPointerCapture?.(e.pointerId);});
      card.addEventListener('pointermove',e=>{if(!drag||drag.card!==card)return;const dist=Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY);if(dist<7&&!drag.moved)return;if(!drag.moved){drag.moved=true;drag.ghost=card.cloneNode(true);Object.assign(drag.ghost.style,{position:'fixed',zIndex:'99999',pointerEvents:'none',width:`${card.getBoundingClientRect().width}px`,opacity:'.85',boxShadow:'0 12px 30px rgba(0,0,0,.45)'});document.body.appendChild(drag.ghost);card.style.opacity='.35';}drag.ghost.style.left=`${e.clientX+10}px`;drag.ghost.style.top=`${e.clientY+10}px`;qsa('.cal-slot,.cal-month-day,.cal-day').forEach(x=>x.classList.remove('drag-over'));const hit=document.elementFromPoint(e.clientX,e.clientY);const t=hit?.closest?.('.cal-slot,.cal-month-day,.cal-day');t?.classList.add('drag-over');});
      const finish=async e=>{if(!drag||drag.card!==card)return;const d=drag;drag=null;card.releasePointerCapture?.(e.pointerId);card.style.opacity='';d.ghost?.remove();qsa('.cal-slot,.cal-month-day,.cal-day').forEach(x=>x.classList.remove('drag-over'));if(!d.moved)return;card.dataset.justDragged='1';const hit=document.elementFromPoint(e.clientX,e.clientY);const info=targetInfo(hit,d.id);if(info)await saveMove(d.id,info.date,info.time);};
      card.addEventListener('pointerup',finish);card.addEventListener('pointercancel',finish);
    });
  }
  const style=document.createElement('style');style.textContent='.cal-day.drag-over,.cal-slot.drag-over,.cal-month-day.drag-over{outline:2px solid #ef1b20!important;outline-offset:-2px;background:#2a1010!important}.cal-event[data-booking]{user-select:none;-webkit-user-select:none}';document.head.appendChild(style);
  const obs=new MutationObserver(bind);obs.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('DOMContentLoaded',bind);setInterval(bind,800);
})();