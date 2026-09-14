(()=>{
  const extractId=button=>{
    if(button.dataset.bookingId)return button.dataset.bookingId;
    const code=button.getAttribute('onclick')||'';
    const patterns=[/includes\('([^']+)'\)/,/openAppointmentWorkspace\('([^']+)'\)/,/\('([^']+)'\)/];
    for(const p of patterns){const m=code.match(p);if(m?.[1])return m[1];}
    return null;
  };
  async function openBooking(id){
    if(!id)return;
    if(typeof window.openAppointmentWorkspace!=='function'){
      const nav=document.querySelector('[data-view="bookings"]');
      nav?.click();
      await new Promise(r=>setTimeout(r,300));
    }
    if(typeof window.openAppointmentWorkspace==='function'){
      await window.openAppointmentWorkspace(id);
      return;
    }
    if(typeof toast==='function')toast('Appointment details are still loading. Refresh once and try again.');
  }
  function bindButtons(){
    document.querySelectorAll('#opsTodayContent .ops-actions button').forEach(button=>{
      if(button.textContent.trim()!=='Open'||button.dataset.openBound==='1')return;
      const id=extractId(button);if(!id)return;
      button.dataset.bookingId=id;
      button.dataset.openBound='1';
      button.removeAttribute('onclick');
      button.onclick=e=>{e.preventDefault();e.stopPropagation();openBooking(id);};
    });
  }
  const observer=new MutationObserver(bindButtons);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',e=>{
    const button=e.target.closest('#opsTodayContent .ops-actions button');
    if(!button||button.textContent.trim()!=='Open')return;
    const id=extractId(button);if(!id)return;
    e.preventDefault();e.stopImmediatePropagation();openBooking(id);
  },true);
  bindButtons();setInterval(bindButtons,800);
})();