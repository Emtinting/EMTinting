(()=>{
  const norm=v=>String(v||'').replace(/\D/g,'');
  const bookings=()=>typeof state!=='undefined'?(state.bookings||[]):[];
  const getMeta=(label)=>{
    const detail=document.getElementById('crmAppointmentDetail');
    const block=[...(detail?.querySelectorAll('.crm-appt-meta>div')||[])].find(x=>x.querySelector('small')?.textContent.trim()===label);
    if(!block) return '';
    const clone=block.cloneNode(true);
    clone.querySelector('small')?.remove();
    return clone.textContent.trim();
  };
  const fmtTime=v=>{
    const raw=String(v||'').slice(0,5), [hh,mm]=raw.split(':').map(Number);
    if(Number.isNaN(hh)) return raw;
    return `${hh%12||12}:${String(mm||0).padStart(2,'0')} ${hh>=12?'PM':'AM'}`;
  };
  const rememberBookingFromRow=target=>{
    const row=target.closest('tr');
    if(!row) return;
    const check=[...row.querySelectorAll('button')].find(b=>(b.getAttribute('onclick')||'').includes("checkIn('"));
    const match=(check?.getAttribute('onclick')||'').match(/checkIn\('([^']+)'\)/);
    if(match){window.__crmWarrantyBookingId=match[1];sessionStorage.setItem('crmWarrantyBookingId',match[1]);}
  };
  const resolveBooking=()=>{
    const saved=window.__crmWarrantyBookingId||sessionStorage.getItem('crmWarrantyBookingId');
    let booking=bookings().find(b=>b.id===saved);
    if(booking) return booking;
    const date=getMeta('Date'), time=getMeta('Time'), vehicle=getMeta('Vehicle'), service=getMeta('Service'), phone=norm(getMeta('Phone'));
    const candidates=bookings().filter(b=>{
      const bd=typeof dateFmt==='function'?dateFmt(b.appointment_date):String(b.appointment_date||'');
      const bv=[b.vehicle_year,b.vehicle_make,b.vehicle_model].filter(Boolean).join(' ');
      const customer=typeof customerById==='function'?customerById(b.customer_id):null;
      return (!date||bd===date)&&(!time||fmtTime(b.appointment_time)===time)&&(!vehicle||bv===vehicle)&&(!service||String(b.service||'')===service)&&(!phone||norm(customer?.phone)===phone);
    });
    booking=candidates[0]||null;
    if(booking){window.__crmWarrantyBookingId=booking.id;sessionStorage.setItem('crmWarrantyBookingId',booking.id);}
    return booking;
  };
  const sentStatus=sentAt=>{
    const top=document.querySelector('.crm-warranty-v2-top');
    if(!top||!sentAt) return;
    let status=top.querySelector('.crm-warranty-email-status');
    if(!status){
      status=document.createElement('div');
      status.className='crm-warranty-email-status';
      status.style.cssText='margin-left:auto;align-self:center;color:#aeb6bf;font-size:12px;white-space:nowrap';
      const main=top.querySelector('#crmWarrantyEmailV2');
      if(main) top.insertBefore(status,main); else top.appendChild(status);
    }
    const d=new Date(sentAt);
    status.textContent=`Warranty emailed ${d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} ${d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})} ✓`;
    const main=top.querySelector('#crmWarrantyEmailV2');
    if(main) main.innerHTML='✉ &nbsp; Email Warranty Again';
  };
  const findWarranty=async booking=>{
    let result=await db.from('warranties').select('id,warranty_emailed_at,booking_id,customer_id').eq('booking_id',booking.id).order('installation_date',{ascending:false}).limit(1).maybeSingle();
    if(result.error) throw result.error;
    if(result.data?.id) return result.data;
    result=await db.from('warranties').select('id,warranty_emailed_at,booking_id,customer_id').eq('customer_id',booking.customer_id).order('installation_date',{ascending:false}).limit(1).maybeSingle();
    if(result.error) throw result.error;
    return result.data||null;
  };
  let sending=false;
  const sendWarranty=async clicked=>{
    if(sending) return;
    const booking=resolveBooking();
    if(!booking) return typeof toast==='function'?toast('Could not match this warranty to the appointment. Reopen the appointment and try again.'):null;
    const customer=typeof customerById==='function'?customerById(booking.customer_id):null;
    if(!customer?.email) return typeof toast==='function'?toast('Customer email address is missing'):null;
    let warranty;
    try{warranty=await findWarranty(booking);}catch(err){return typeof toast==='function'?toast(err?.message||'Could not load warranty'):null;}
    if(!warranty?.id) return typeof toast==='function'?toast('No saved HITEK warranty is linked to this appointment'):null;
    sending=true;
    const buttons=[clicked,document.getElementById('crmWarrantyEmailV2'),document.querySelector('[data-warranty-email]')].filter((b,i,a)=>b&&a.indexOf(b)===i);
    buttons.forEach(b=>{b.disabled=true;b.textContent='Sending warranty...';});
    try{
      const {data,error}=await db.functions.invoke('send-warranty',{body:{warranty_id:warranty.id}});
      if(error||data?.error) throw new Error(data?.error||error?.message||'Warranty email failed');
      buttons.forEach(b=>{b.disabled=false;b.textContent='Email Warranty Again';});
      sentStatus(data?.sent_at||new Date().toISOString());
      if(typeof toast==='function') toast(`Warranty emailed to ${customer.email}`);
    }catch(err){
      buttons.forEach(b=>{b.disabled=false;b.textContent='Email Warranty';});
      const main=document.getElementById('crmWarrantyEmailV2');if(main) main.innerHTML='✉ &nbsp; Email Warranty';
      if(typeof toast==='function') toast(err?.message||'Warranty email failed');
    }finally{sending=false;}
  };
  document.addEventListener('click',e=>{
    const view=e.target.closest?.('.crm-view-btn');
    if(view) rememberBookingFromRow(view);
  },true);
  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('#crmWarrantyEmailV2,[data-warranty-email]');
    if(!btn) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    sendWarranty(btn);
  },true);
})();