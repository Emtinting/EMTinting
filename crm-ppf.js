document.write('<script src="crm-ppf-core.js"><\/script>');
window.addEventListener('load',()=>{
  const approval=document.createElement('script');
  approval.src='crm-approval.js';
  document.body.appendChild(approval);

  if(typeof renderBookings==='function'){
    const originalRenderBookings=renderBookings;
    window.cancelAppointment=async function(id){
      const booking=(state.bookings||[]).find(b=>b.id===id);
      const customer=booking?customerById(booking.customer_id):null;
      const who=customer?customerName(customer):'this customer';
      const when=booking?.appointment_date?` on ${dateFmt(booking.appointment_date)}`:'';
      if(!confirm(`Cancel ${who}'s appointment${when}?`)) return;
      const {error}=await db.from('bookings').update({status:'cancelled',appointment_confirmed:false}).eq('id',id);
      if(error){toast(error.message);return;}
      toast('Appointment cancelled');
      await loadAll();
    };
    window.renderBookings=function(filter=''){
      originalRenderBookings(filter);
      document.querySelectorAll('#bookingsTable tbody tr').forEach(row=>{
        const actions=row.querySelector('.table-actions');
        if(!actions) return;
        const checkInButton=[...actions.querySelectorAll('button')].find(b=>b.textContent.trim()==='Check-in');
        if(!checkInButton) return;
        const match=(checkInButton.getAttribute('onclick')||'').match(/checkIn\('([^']+)'\)/);
        if(!match) return;
        const id=match[1];
        const booking=(state.bookings||[]).find(b=>b.id===id);
        if(!booking||booking.status==='cancelled') return;
        if(actions.querySelector(`[data-cancel-booking="${id}"]`)) return;
        const cancel=document.createElement('button');
        cancel.type='button';
        cancel.textContent='Cancel appointment';
        cancel.dataset.cancelBooking=id;
        cancel.className='cancel-appointment-btn';
        cancel.style.borderColor='#b42318';
        cancel.style.color='#ff6b6b';
        cancel.addEventListener('click',()=>window.cancelAppointment(id));
        actions.appendChild(cancel);
      });
    };
    renderBookings();
  }
});
