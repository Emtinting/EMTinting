document.write('<script src="crm-ppf-core.js"><\/script>');
window.addEventListener('load',()=>{
  const approval=document.createElement('script');
  approval.src='crm-approval.js';
  document.body.appendChild(approval);

  const firstName=c=>String(c?.first_name||customerName(c)||'there').trim().split(/\s+/)[0]||'there';
  const displayTime=v=>{
    const raw=String(v||'').slice(0,5);
    const [hh,mm]=raw.split(':').map(Number);
    if(Number.isNaN(hh)) return raw||'your scheduled time';
    const suffix=hh>=12?'PM':'AM';
    const h=hh%12||12;
    return `${h}:${String(mm||0).padStart(2,'0')} ${suffix}`;
  };
  const cleanPhone=p=>String(p||'').replace(/[^0-9+]/g,'');
  const smsLink=(phone,message)=>`sms:${cleanPhone(phone)}?body=${encodeURIComponent(message)}`;
  const reminderMessage=(type,booking,customer)=>{
    const name=firstName(customer);
    const date=dateFmt(booking.appointment_date);
    const time=displayTime(booking.appointment_time);
    const service=booking.service||'appointment';
    if(type==='confirmation') return `Hi ${name}, this is EM Tinting. Your ${service} appointment is scheduled for ${date} at ${time}. Please reply to confirm. Thank you!`;
    if(type==='reminder') return `Hi ${name}, this is EM Tinting. Just a reminder that your ${service} appointment is tomorrow, ${date}, at ${time}. Please reply to confirm. Thank you!`;
    if(type==='reschedule') return `Hi ${name}, this is EM Tinting. We need to reschedule your appointment currently set for ${date} at ${time}. Please reply so we can find a new time that works for you. Thank you!`;
    if(type==='cancellation') return `Hi ${name}, this is EM Tinting. Your appointment scheduled for ${date} at ${time} has been cancelled. Please reply if you would like to reschedule. Thank you!`;
    return `Hi ${name}, this is EM Tinting regarding your appointment on ${date} at ${time}.`;
  };
  window.openAppointmentText=function(id,type){
    const booking=(state.bookings||[]).find(b=>b.id===id);
    if(!booking) return toast('Appointment not found');
    const customer=customerById(booking.customer_id);
    if(!customer?.phone) return toast('Customer phone number is missing');
    const message=reminderMessage(type,booking,customer);
    window.location.href=smsLink(customer.phone,message);
  };

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
        if(!booking) return;

        if(!actions.querySelector(`[data-text-confirmation="${id}"]`)){
          const confirmation=document.createElement('button');
          confirmation.type='button';
          confirmation.textContent='Text confirmation';
          confirmation.dataset.textConfirmation=id;
          confirmation.addEventListener('click',()=>window.openAppointmentText(id,'confirmation'));
          actions.appendChild(confirmation);
        }
        if(!actions.querySelector(`[data-text-reminder="${id}"]`)){
          const reminder=document.createElement('button');
          reminder.type='button';
          reminder.textContent='24h reminder';
          reminder.dataset.textReminder=id;
          reminder.addEventListener('click',()=>window.openAppointmentText(id,'reminder'));
          actions.appendChild(reminder);
        }
        if(!actions.querySelector(`[data-text-reschedule="${id}"]`)){
          const reschedule=document.createElement('button');
          reschedule.type='button';
          reschedule.textContent='Text reschedule';
          reschedule.dataset.textReschedule=id;
          reschedule.addEventListener('click',()=>window.openAppointmentText(id,'reschedule'));
          actions.appendChild(reschedule);
        }
        if(!actions.querySelector(`[data-text-cancellation="${id}"]`)){
          const cancellation=document.createElement('button');
          cancellation.type='button';
          cancellation.textContent='Text cancellation';
          cancellation.dataset.textCancellation=id;
          cancellation.addEventListener('click',()=>window.openAppointmentText(id,'cancellation'));
          actions.appendChild(cancellation);
        }

        if(booking.status==='cancelled') return;
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
