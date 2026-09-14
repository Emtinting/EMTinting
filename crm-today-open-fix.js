(()=>{
  function getBookingId(button){
    const code=button.getAttribute('onclick')||'';
    const m=code.match(/includes\('([^']+)'\)/);
    return m?.[1]||null;
  }
  function openBooking(id){
    document.querySelector('[data-view="bookings"]')?.click();
    setTimeout(()=>{
      const rows=[...document.querySelectorAll('#bookingsTable tbody tr')];
      const row=rows.find(r=>[...r.querySelectorAll('button')].some(b=>(b.getAttribute('onclick')||'').includes(id)));
      if(!row){if(typeof toast==='function')toast('Appointment not found');return;}
      const details=[...row.querySelectorAll('button')].find(b=>b.classList.contains('crm-view-btn')||b.textContent.trim()==='View Details');
      if(details){details.click();return;}
      if(typeof window.openAppointmentWorkspace==='function'){window.openAppointmentWorkspace(id);return;}
      if(typeof toast==='function')toast('Appointment details are still loading. Try again in a second.');
    },100);
  }
  document.addEventListener('click',e=>{
    const button=e.target.closest('#opsTodayContent .ops-actions button');
    if(!button||button.textContent.trim()!=='Open')return;
    const id=getBookingId(button);if(!id)return;
    e.preventDefault();e.stopImmediatePropagation();openBooking(id);
  },true);
})();