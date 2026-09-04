window.addEventListener('load',()=>{
  const labels={confirmation:'Email confirmation',reminder:'Email 24h reminder',reschedule:'Email reschedule',cancellation:'Email cancellation'};
  window.sendAppointmentEmail=async(id,type,button)=>{
    const booking=(state.bookings||[]).find(b=>b.id===id);
    if(!booking)return toast('Appointment not found');
    const customer=customerById(booking.customer_id);
    if(!customer?.email)return toast('Customer email address is missing');
    const original=button?.textContent||labels[type]||'Send email';
    if(button){button.disabled=true;button.textContent='Sending...';}
    try{
      const {data,error}=await db.functions.invoke('send-crm-email',{body:{mode:'appointment',booking_id:id,type}});
      if(error||data?.error)throw new Error(data?.error||error?.message||'Email failed');
      if(button){button.textContent='Sent ✓';setTimeout(()=>{button.textContent=original;button.disabled=false;},1800);}
      if(typeof window.refreshCrmActivity==='function')window.refreshCrmActivity(id);
      toast(`${type==='reminder'?'Reminder':'Email'} sent to ${customer.email}`);
    }catch(err){if(button){button.disabled=false;button.textContent=original;}toast(err?.message||'Email failed');}
  };
  window.openAppointmentEmail=(id,type)=>window.sendAppointmentEmail(id,type,null);
  const addButtons=()=>{
    document.querySelectorAll('#bookingsTable tbody tr').forEach(row=>{
      const actions=row.querySelector('.table-actions');if(!actions)return;
      const check=[...actions.querySelectorAll('button')].find(b=>(b.getAttribute('onclick')||'').includes("checkIn('"));if(!check)return;
      const match=(check.getAttribute('onclick')||'').match(/checkIn\('([^']+)'\)/);if(!match)return;
      const id=match[1];
      Object.entries(labels).forEach(([type,label])=>{
        if(actions.querySelector(`[data-email-${type}="${id}"]`))return;
        const btn=document.createElement('button');btn.type='button';btn.textContent=label;btn.dataset[`email${type[0].toUpperCase()+type.slice(1)}`]=id;
        btn.addEventListener('click',()=>window.sendAppointmentEmail(id,type,btn));actions.appendChild(btn);
      });
    });
  };
  const loadModule=(key,src)=>{if(document.querySelector(`script[data-${key}]`))return;const s=document.createElement('script');s.src=src;s.dataset[key.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]='1';document.body.appendChild(s);};
  const start=()=>{addButtons();const table=document.getElementById('bookingsTable');if(table)new MutationObserver(addButtons).observe(table,{childList:true,subtree:true});
    loadModule('crm-warranty-email-fix','crm-warranty-email-fix.js?v=20260903-clean1');
    loadModule('crm-invoice-email-v2','crm-invoice-email-v2.js?v=20260903-1');
    loadModule('crm-customer-dedupe','crm-customer-dedupe.js?v=20260903-1');
    loadModule('crm-activity-log','crm-activity-log.js?v=20260903-1');
    loadModule('crm-service-presets','crm-service-presets.js?v=20260904-1');
    loadModule('crm-business-upgrades','crm-business-upgrades.js?v=20260904-1');
  };
  setTimeout(start,700);
});