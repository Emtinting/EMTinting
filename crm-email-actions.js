window.addEventListener('load',()=>{
  const firstName=c=>String(c?.first_name||customerName(c)||'there').trim().split(/\s+/)[0]||'there';
  const displayTime=v=>{
    const raw=String(v||'').slice(0,5), [hh,mm]=raw.split(':').map(Number);
    if(Number.isNaN(hh)) return raw||'your scheduled time';
    return `${hh%12||12}:${String(mm||0).padStart(2,'0')} ${hh>=12?'PM':'AM'}`;
  };
  const emailContent=(type,b,c)=>{
    const name=firstName(c), date=dateFmt(b.appointment_date), time=displayTime(b.appointment_time), service=b.service||'appointment';
    if(type==='confirmation') return {subject:'EM Tinting Appointment Confirmation',body:`Hi ${name},\n\nThis is EM Tinting. Your ${service} appointment is scheduled for ${date} at ${time}. Please reply to confirm.\n\nThank you,\nEM Tinting`};
    if(type==='reminder') return {subject:'EM Tinting Appointment Reminder',body:`Hi ${name},\n\nThis is EM Tinting. Just a reminder that your ${service} appointment is tomorrow, ${date}, at ${time}. Please reply to confirm.\n\nThank you,\nEM Tinting`};
    if(type==='reschedule') return {subject:'EM Tinting - Reschedule Appointment',body:`Hi ${name},\n\nThis is EM Tinting. We need to reschedule your appointment currently set for ${date} at ${time}. Please reply so we can find a new time that works for you.\n\nThank you,\nEM Tinting`};
    if(type==='cancellation') return {subject:'EM Tinting Appointment Cancellation',body:`Hi ${name},\n\nThis is EM Tinting. Your appointment scheduled for ${date} at ${time} has been cancelled. Please reply if you would like to reschedule.\n\nThank you,\nEM Tinting`};
    return {subject:'EM Tinting Appointment',body:`Hi ${name},\n\nThis is EM Tinting regarding your appointment on ${date} at ${time}.\n\nThank you,\nEM Tinting`};
  };
  window.openAppointmentEmail=(id,type)=>{
    const booking=(state.bookings||[]).find(b=>b.id===id);
    if(!booking) return toast('Appointment not found');
    const customer=customerById(booking.customer_id);
    if(!customer?.email) return toast('Customer email address is missing');
    const msg=emailContent(type,booking,customer);
    window.location.href=`mailto:${encodeURIComponent(customer.email)}?subject=${encodeURIComponent(msg.subject)}&body=${encodeURIComponent(msg.body)}`;
  };
  const addButtons=()=>{
    document.querySelectorAll('#bookingsTable tbody tr').forEach(row=>{
      const actions=row.querySelector('.table-actions'); if(!actions) return;
      const check=[...actions.querySelectorAll('button')].find(b=>b.textContent.trim()==='Check-in'); if(!check) return;
      const match=(check.getAttribute('onclick')||'').match(/checkIn\('([^']+)'\)/); if(!match) return;
      const id=match[1];
      [['confirmation','Email confirmation'],['reminder','Email 24h reminder'],['reschedule','Email reschedule'],['cancellation','Email cancellation']].forEach(([type,label])=>{
        if(actions.querySelector(`[data-email-${type}="${id}"]`)) return;
        const btn=document.createElement('button'); btn.type='button'; btn.textContent=label; btn.dataset[`email${type[0].toUpperCase()+type.slice(1)}`]=id;
        btn.addEventListener('click',()=>window.openAppointmentEmail(id,type)); actions.appendChild(btn);
      });
    });
  };
  const start=()=>{ addButtons(); const table=document.getElementById('bookingsTable'); if(table) new MutationObserver(()=>addButtons()).observe(table,{childList:true,subtree:true}); };
  setTimeout(start,700);
});
