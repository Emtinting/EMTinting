(()=>{
  const buttons=row=>[...row.querySelectorAll('.table-actions button')];
  const bookingId=row=>{
    for(const b of buttons(row)){
      const code=b.getAttribute('onclick')||'';
      const m=code.match(/\('([^']+)'/);
      if(m?.[1])return m[1];
    }
    return null;
  };
  async function restore(id){
    if(!id)return;
    const {error}=await db.from('bookings').update({
      status:'booked',
      appointment_confirmed:true,
      cancelled_at:null,
      cancellation_reason:null,
      no_show_at:null,
      updated_at:new Date().toISOString()
    }).eq('id',id);
    if(error){toast(error.message);return;}
    toast('Appointment restored and confirmed');
    await loadAll();
  }
  window.restoreCancelledAppointment=restore;
  function enhance(){
    document.querySelectorAll('#bookingsTable tbody tr').forEach(row=>{
      const actions=row.querySelector('.table-actions');
      if(!actions)return;
      const id=bookingId(row);
      if(!id)return;
      const b=(state.bookings||[]).find(x=>x.id===id);
      const old=actions.querySelector('[data-restore-cancelled]');
      if(b?.status!=='cancelled'){old?.remove();return;}
      if(old)return;
      const btn=document.createElement('button');
      btn.type='button';
      btn.dataset.restoreCancelled='1';
      btn.textContent='Restore & Confirm';
      btn.style.fontWeight='800';
      btn.onclick=()=>restore(id);
      actions.prepend(btn);
    });
  }
  new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});
  enhance();
  setInterval(enhance,1000);
})();