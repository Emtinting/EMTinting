(()=>{
  const q=s=>document.querySelector(s);
  function ensureCalendar(){
    const nav=q('#nav'), bookings=q('[data-view="bookings"]'), view=q('#calendarView');
    if(!nav||!bookings||!view)return;
    let btn=nav.querySelector('[data-view="calendar"]');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.className='nav-item';
      btn.dataset.view='calendar';
      btn.textContent='Calendar';
      bookings.insertAdjacentElement('afterend',btn);
    }
    if(!btn.dataset.guardBound){
      btn.dataset.guardBound='1';
      btn.addEventListener('click',()=>{
        document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
        view.classList.add('active');
        const title=q('#pageTitle'); if(title) title.textContent='Calendar';
        setTimeout(()=>window.dispatchEvent(new Event('resize')),0);
      });
    }
  }
  const obs=new MutationObserver(()=>ensureCalendar());
  obs.observe(document.documentElement,{childList:true,subtree:true});
  [0,200,500,1000,1500,2500,4000].forEach(ms=>setTimeout(ensureCalendar,ms));
})();