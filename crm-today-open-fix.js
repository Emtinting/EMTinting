(()=>{
  function getBookingId(button){
    const code=button.getAttribute('onclick')||'';
    const m=code.match(/includes\('([^']+)'\)/);
    return m?.[1]||null;
  }
  function openBooking(id){
    if(typeof window.openAppointmentWorkspace==='function'){
      window.openAppointmentWorkspace(id);
      return;
    }
    const nav=document.querySelector('[data-view="bookings"]');
    if(nav) nav.click();
    setTimeout(()=>{
      if(typeof window.openAppointmentWorkspace==='function'){
        window.openAppointmentWorkspace(id);
        return;
      }
      const rows=[...document.querySelectorAll('#bookingsTable tbody tr')];
      const row=rows.find(r=>[...r.querySelectorAll('button')].some(b=>(b.getAttribute('onclick')||'').includes(id)));
      const details=row&&[...row.querySelectorAll('button')].find(b=>b.classList.contains('crm-view-btn')||b.textContent.trim()==='View Details');
      if(details){details.click();return;}
      if(typeof toast==='function')toast('Appointment details could not open. Refresh and try again.');
    },250);
  }
  document.addEventListener('click',e=>{
    const button=e.target.closest('#opsTodayContent .ops-actions button');
    if(!button||button.textContent.trim()!=='Open')return;
    const id=getBookingId(button);if(!id)return;
    e.preventDefault();e.stopImmediatePropagation();openBooking(id);
  },true);
})();