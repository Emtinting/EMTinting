document.write('<script src="crm-ppf-core.js"><\/script>');
window.addEventListener('load',()=>{
  const approval=document.createElement('script');
  approval.src='crm-approval.js';
  document.body.appendChild(approval);

  if(typeof window.renderBookings==='function'){
    const originalRenderBookings=window.renderBookings;
    window.cancelAppointment=async function(id){
      const booking=(window.state?.bookings||[]).find(b=>b.id===id);
      const customer=booking&&typeof window.customerById==='function'?window.customerById(booking.customer_id):null;
      const who=customer&&typeof window.customerName==='function'?window.customerName(customer):'this customer';
      const when=booking?.appointment_date?` on ${window.dateFmt?window.dateFmt(booking.appointment_date):booking.appointment_date}`:'';
      if(!confirm(`Cancel ${who}'s appointment${when}?`)) return;
      const {error}=await window.db.from('bookings').update({status:'cancelled',appointment_confirmed:false}).eq('id',id);
      if(error){window.toast?.(error.message);return;}
      window.toast?.('Appointment cancelled');
      await window.loadAll?.();
    };
    window.renderBookings=function(filter=''){
      originalRenderBookings(filter);
      document.querySelectorAll('#bookingsTable tbody tr').forEach(row=>{
        const buttons=row.querySelector('.table-actions');
        if(!buttons) return;
        const actionButtons=[...buttons.querySelectorAll('button')];
        const checkInButton=actionButtons.find(b=>b.textContent.trim()==='Check-in');
        if(!checkInButton) return;
        const match=(checkInButton.getAttribute('onclick')||'').match(/checkIn\('([^']+)'\)/);
        if(!match) return;
        const id=match[1];
        const booking=(window.state?.bookings||[]).find(b=>b.id===id);
        if(!booking||booking.status==='cancelled') return;
        if(buttons.querySelector(`[data-cancel-booking="${id}"]`)) return;
        const cancel=document.createElement('button');
        cancel.type='button';
        cancel.textContent='Cancel appointment';
        cancel.dataset.cancelBooking=id;
        cancel.className='cancel-appointment-btn';
        cancel.style.borderColor='#b42318';
        cancel.style.color='#ff6b6b';
        cancel.addEventListener('click',()=>window.cancelAppointment(id));
        buttons.appendChild(cancel);
      });
    };
    window.renderBookings();
  }
});
