(()=>{
  function localToday(){
    const d=new Date();
    d.setMinutes(d.getMinutes()-d.getTimezoneOffset());
    return d.toISOString().slice(0,10);
  }
  function todayBookings(){
    const bookings=(window.state?.bookings||[]).filter(b=>b.appointment_date===localToday()&&b.status!=='cancelled');
    return bookings.sort((a,b)=>(a.appointment_time||'').localeCompare(b.appointment_time||''));
  }
  async function openBooking(id){
    if(!id)return;
    if(typeof window.openAppointmentWorkspace==='function'){
      await window.openAppointmentWorkspace(id);
      return;
    }
    document.querySelector('[data-view="bookings"]')?.click();
    await new Promise(r=>setTimeout(r,350));
    if(typeof window.openAppointmentWorkspace==='function'){
      await window.openAppointmentWorkspace(id);
      return;
    }
    if(typeof window.toast==='function')window.toast('Could not open appointment details.');
  }
  function bindButtons(){
    const rows=[...document.querySelectorAll('#opsTodayContent .ops-today-card')];
    const bookings=todayBookings();
    rows.forEach((row,index)=>{
      const button=[...row.querySelectorAll('.ops-actions button')].find(b=>b.textContent.trim()==='Open');
      const booking=bookings[index];
      if(!button||!booking)return;
      button.dataset.bookingId=booking.id;
      button.removeAttribute('onclick');
      button.onclick=e=>{
        e.preventDefault();
        e.stopPropagation();
        openBooking(booking.id);
      };
    });
  }
  document.addEventListener('click',e=>{
    const button=e.target.closest('#opsTodayContent .ops-actions button');
    if(!button||button.textContent.trim()!=='Open')return;
    const id=button.dataset.bookingId;
    if(!id)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openBooking(id);
  },true);
  new MutationObserver(bindButtons).observe(document.documentElement,{childList:true,subtree:true});
  bindButtons();
  setInterval(bindButtons,700);
})();