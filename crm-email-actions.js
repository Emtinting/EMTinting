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

  const normalizePhone=v=>String(v||'').replace(/\D/g,'');
  const showWarrantySentStatus=sentAt=>{
    const top=document.querySelector('.crm-warranty-v2-top');
    if(!top||!sentAt) return;
    let status=top.querySelector('.crm-warranty-email-status');
    if(!status){
      status=document.createElement('div');
      status.className='crm-warranty-email-status';
      status.style.cssText='margin-left:auto;align-self:center;color:#aeb6bf;font-size:12px;white-space:nowrap';
      const button=top.querySelector('#crmWarrantyEmailV2');
      if(button) top.insertBefore(status,button); else top.appendChild(status);
    }
    const d=new Date(sentAt);
    status.textContent=`Warranty emailed ${d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} ${d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})} ✓`;
    const mainBtn=top.querySelector('#crmWarrantyEmailV2');
    if(mainBtn) mainBtn.innerHTML='✉ &nbsp; Email Warranty Again';
  };

  const addWarrantyEmailButton=()=>{
    document.querySelectorAll('.crm-ewarranty-actions').forEach(actions=>{
      if(actions.querySelector('[data-warranty-email]')) return;
      const card=document.getElementById('crmWarrantyCard');
      if(!card || card.querySelector('#crmWarrantyForm') || card.querySelector('.empty')) return;
      const btn=document.createElement('button');
      btn.type='button';
      btn.dataset.warrantyEmail='1';
      btn.textContent='Email Warranty';
      btn.addEventListener('click',async()=>{
        const detail=document.getElementById('crmAppointmentDetail');
        const phoneBlock=[...(detail?.querySelectorAll('.crm-appt-meta>div')||[])].find(x=>x.querySelector('small')?.textContent.trim()==='Phone');
        const phone=phoneBlock?phoneBlock.textContent.replace('Phone','').trim():'';
        const customer=(state.customers||[]).find(c=>normalizePhone(c.phone)===normalizePhone(phone));
        if(!customer?.email) return toast('Customer email address is missing');
        const {data:warranty,error:warrantyError}=await db.from('warranties').select('id,warranty_emailed_at').eq('customer_id',customer.id).order('installation_date',{ascending:false}).limit(1).maybeSingle();
        if(warrantyError) return toast(warrantyError.message);
        if(!warranty?.id) return toast('Create and save the HITEK warranty first');
        btn.disabled=true;
        const v2=document.getElementById('crmWarrantyEmailV2');
        if(v2){v2.disabled=true;v2.textContent='Sending warranty...';}
        btn.textContent='Sending...';
        const {data,error}=await db.functions.invoke('send-warranty',{body:{warranty_id:warranty.id}});
        btn.disabled=false;
        if(v2) v2.disabled=false;
        if(error||data?.error){
          const msg=data?.error||error?.message||'Warranty email failed';
          btn.textContent='Email Warranty';
          if(v2) v2.innerHTML='✉ &nbsp; Email Warranty';
          return toast(msg);
        }
        btn.textContent='Email Warranty Again';
        showWarrantySentStatus(data?.sent_at||new Date().toISOString());
        toast(`Warranty emailed to ${customer.email}`);
      });
      const textBtn=actions.querySelector('#crmTextWarranty');
      if(textBtn?.nextSibling) actions.insertBefore(btn,textBtn.nextSibling); else actions.appendChild(btn);

      (async()=>{
        const detail=document.getElementById('crmAppointmentDetail');
        const phoneBlock=[...(detail?.querySelectorAll('.crm-appt-meta>div')||[])].find(x=>x.querySelector('small')?.textContent.trim()==='Phone');
        const phone=phoneBlock?phoneBlock.textContent.replace('Phone','').trim():'';
        const customer=(state.customers||[]).find(c=>normalizePhone(c.phone)===normalizePhone(phone));
        if(!customer) return;
        const {data:w}=await db.from('warranties').select('warranty_emailed_at').eq('customer_id',customer.id).order('installation_date',{ascending:false}).limit(1).maybeSingle();
        if(w?.warranty_emailed_at){btn.textContent='Email Warranty Again';setTimeout(()=>showWarrantySentStatus(w.warranty_emailed_at),100);}
      })();
    });
  };

  const start=()=>{
    addButtons();
    addWarrantyEmailButton();
    const table=document.getElementById('bookingsTable');
    if(table) new MutationObserver(()=>addButtons()).observe(table,{childList:true,subtree:true});
    new MutationObserver(()=>addWarrantyEmailButton()).observe(document.body,{childList:true,subtree:true});
  };
  setTimeout(start,700);

  if(!document.querySelector('script[data-crm-reschedule]')){
    const script=document.createElement('script');
    script.src='crm-reschedule.js?v=20260828-1';
    script.dataset.crmReschedule='1';
    document.body.appendChild(script);
  }
  if(!document.querySelector('script[data-crm-warranty-v2]')){
    const script=document.createElement('script');
    script.src='crm-warranty-v2.js?v=20260903-2';
    script.dataset.crmWarrantyV2='1';
    document.body.appendChild(script);
  }
});
