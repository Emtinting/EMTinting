(()=>{
  const q=s=>document.querySelector(s);
  function ensureCalendar(){
    const nav=q('#nav'), bookings=nav?.querySelector('[data-view="bookings"]');
    if(!nav||!bookings)return;
    let btn=nav.querySelector('[data-view="calendar"]');
    if(!btn){btn=document.createElement('button');btn.type='button';btn.className='nav-item';btn.dataset.view='calendar';btn.textContent='Calendar';bookings.insertAdjacentElement('afterend',btn);}
    if(btn.previousElementSibling!==bookings)bookings.insertAdjacentElement('afterend',btn);
    btn.style.display='';btn.hidden=false;
    if(!btn.dataset.guardBound){btn.dataset.guardBound='1';btn.addEventListener('click',()=>{const view=q('#calendarView');if(!view){if(typeof toast==='function')toast('Loading calendar…');setTimeout(()=>btn.click(),250);return;}document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));view.classList.add('active');const title=q('#pageTitle');if(title)title.textContent='Calendar';setTimeout(()=>window.dispatchEvent(new Event('resize')),0);});}
  }
  const obs=new MutationObserver(ensureCalendar);obs.observe(document.documentElement,{childList:true,subtree:true});
  setInterval(ensureCalendar,750);ensureCalendar();
})();