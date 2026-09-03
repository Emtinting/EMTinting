window.addEventListener('load',()=>{
  const firstName=c=>String(c?.first_name||customerName(c)||'there').trim().split(/\s+/)[0]||'there';
  const normalizePhone=v=>String(v||'').replace(/\D/g,'');
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

  const getMeta=label=>{
    const detail=document.getElementById('crmAppointmentDetail');
    const block=[...(detail?.querySelectorAll('.crm-appt-meta>div')||[])].find(x=>x.querySelector('small')?.textContent.trim()===label);
    if(!block) return '';
    const clone=block.cloneNode(true); clone.querySelector('small')?.remove(); return clone.textContent.trim();
  };
  const rememberBooking=id=>{if(!id)return;window.__crmWarrantyBookingId=id;try{sessionStorage.setItem('crmWarrantyBookingId',id);}catch(_){}};
  document.addEventListener('click',e=>{
    const view=e.target.closest?.('.crm-view-btn'); if(!view)return;
    const row=view.closest('tr');
    const check=[...(row?.querySelectorAll('button')||[])].find(b=>(b.getAttribute('onclick')||'').includes("checkIn('"));
    const m=(check?.getAttribute('onclick')||'').match(/checkIn\('([^']+)'\)/); if(m) rememberBooking(m[1]);
  },true);
  const currentBooking=()=>{
    let saved=window.__crmWarrantyBookingId; try{saved=saved||sessionStorage.getItem('crmWarrantyBookingId');}catch(_){}
    let booking=(state.bookings||[]).find(b=>b.id===saved); if(booking)return booking;
    const date=getMeta('Date'),time=getMeta('Time'),vehicle=getMeta('Vehicle'),service=getMeta('Service'),phone=normalizePhone(getMeta('Phone'));
    booking=(state.bookings||[]).find(b=>{
      const c=customerById(b.customer_id), v=[b.vehicle_year,b.vehicle_make,b.vehicle_model].filter(Boolean).join(' ');
      return (!date||dateFmt(b.appointment_date)===date)&&(!time||displayTime(b.appointment_time)===time)&&(!vehicle||v===vehicle)&&(!service||String(b.service||'')===service)&&(!phone||normalizePhone(c?.phone)===phone);
    })||null;
    if(booking)rememberBooking(booking.id); return booking;
  };
  const warrantyForBooking=async booking=>{
    let r=await db.from('warranties').select('id,warranty_emailed_at,booking_id,customer_id').eq('booking_id',booking.id).order('installation_date',{ascending:false}).limit(1).maybeSingle();
    if(r.error) throw r.error; if(r.data?.id)return r.data;
    r=await db.from('warranties').select('id,warranty_emailed_at,booking_id,customer_id').eq('customer_id',booking.customer_id).order('installation_date',{ascending:false}).limit(1).maybeSingle();
    if(r.error) throw r.error; return r.data||null;
  };
  const showWarrantySentStatus=sentAt=>{
    const top=document.querySelector('.crm-warranty-v2-top'); if(!top||!sentAt)return;
    let status=top.querySelector('.crm-warranty-email-status');
    if(!status){status=document.createElement('div');status.className='crm-warranty-email-status';status.style.cssText='margin-left:auto;align-self:center;color:#aeb6bf;font-size:12px;white-space:nowrap';const button=top.querySelector('#crmWarrantyEmailV2');if(button)top.insertBefore(status,button);else top.appendChild(status);}
    const d=new Date(sentAt);status.textContent=`Warranty emailed ${d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} ${d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})} ✓`;
    const mainBtn=top.querySelector('#crmWarrantyEmailV2');if(mainBtn)mainBtn.innerHTML='✉ &nbsp; Email Warranty Again';
  };
  const addWarrantyEmailButton=()=>{
    document.querySelectorAll('.crm-ewarranty-actions').forEach(actions=>{
      if(actions.querySelector('[data-warranty-email]')) return;
      const card=document.getElementById('crmWarrantyCard');
      if(!card||card.querySelector('#crmWarrantyForm')||card.querySelector('.empty'))return;
      const btn=document.createElement('button');btn.type='button';btn.dataset.warrantyEmail='1';btn.textContent='Email Warranty';
      btn.addEventListener('click',async()=>{
        const booking=currentBooking(); if(!booking)return toast('Could not match this warranty to the appointment. Reopen the appointment and try again.');
        const customer=customerById(booking.customer_id); if(!customer?.email)return toast('Customer email address is missing');
        let warranty;try{warranty=await warrantyForBooking(booking);}catch(err){return toast(err?.message||'Could not load warranty');}
        if(!warranty?.id)return toast('No saved HITEK warranty is linked to this appointment');
        const v2=document.getElementById('crmWarrantyEmailV2');btn.disabled=true;btn.textContent='Sending...';if(v2){v2.disabled=true;v2.textContent='Sending warranty...';}
        const {data,error}=await db.functions.invoke('send-warranty',{body:{warranty_id:warranty.id}});
        btn.disabled=false;if(v2)v2.disabled=false;
        if(error||data?.error){btn.textContent='Email Warranty';if(v2)v2.innerHTML='✉ &nbsp; Email Warranty';return toast(data?.error||error?.message||'Warranty email failed');}
        btn.textContent='Email Warranty Again';showWarrantySentStatus(data?.sent_at||new Date().toISOString());toast(`Warranty emailed to ${customer.email}`);
      });
      const textBtn=actions.querySelector('#crmTextWarranty');if(textBtn?.nextSibling)actions.insertBefore(btn,textBtn.nextSibling);else actions.appendChild(btn);
      (async()=>{const booking=currentBooking();if(!booking)return;try{const w=await warrantyForBooking(booking);if(w?.warranty_emailed_at){btn.textContent='Email Warranty Again';setTimeout(()=>showWarrantySentStatus(w.warranty_emailed_at),100);}}catch(_){}})();
    });
  };
  const start=()=>{addButtons();addWarrantyEmailButton();const table=document.getElementById('bookingsTable');if(table)new MutationObserver(()=>addButtons()).observe(table,{childList:true,subtree:true});new MutationObserver(()=>addWarrantyEmailButton()).observe(document.body,{childList:true,subtree:true});};
  setTimeout(start,700);
  if(!document.querySelector('script[data-crm-reschedule]')){const script=document.createElement('script');script.src='crm-reschedule.js?v=20260828-1';script.dataset.crmReschedule='1';document.body.appendChild(script);}
  if(!document.querySelector('script[data-crm-warranty-v2]')){const script=document.createElement('script');script.src='crm-warranty-v2.js?v=20260903-2';script.dataset.crmWarrantyV2='1';document.body.appendChild(script);}
});