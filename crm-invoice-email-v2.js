(()=>{
  const norm=v=>String(v||'').replace(/\D/g,'');
  const getMeta=label=>{const detail=document.getElementById('crmAppointmentDetail');const block=[...(detail?.querySelectorAll('.crm-appt-meta>div')||[])].find(x=>x.querySelector('small')?.textContent.trim()===label);if(!block)return'';const clone=block.cloneNode(true);clone.querySelector('small')?.remove();return clone.textContent.trim();};
  const fmtTime=v=>{const raw=String(v||'').slice(0,5),[h,m]=raw.split(':').map(Number);if(Number.isNaN(h))return raw;return `${h%12||12}:${String(m||0).padStart(2,'0')} ${h>=12?'PM':'AM'}`;};
  const currentBooking=()=>{
    let saved=window.__crmWarrantyBookingId;try{saved=saved||sessionStorage.getItem('crmWarrantyBookingId');}catch(_){}
    let b=(state.bookings||[]).find(x=>x.id===saved);if(b)return b;
    const date=getMeta('Date'),time=getMeta('Time'),vehicle=getMeta('Vehicle'),phone=norm(getMeta('Phone'));
    return (state.bookings||[]).find(x=>{const c=customerById(x.customer_id),v=[x.vehicle_year,x.vehicle_make,x.vehicle_model].filter(Boolean).join(' ');return(!date||dateFmt(x.appointment_date)===date)&&(!time||fmtTime(x.appointment_time)===time)&&(!vehicle||v===vehicle)&&(!phone||norm(c?.phone)===phone);})||null;
  };
  const val=id=>document.getElementById(id)?.value||'';
  document.addEventListener('click',async e=>{
    const btn=e.target.closest?.('#invoiceEmail');if(!btn)return;
    e.preventDefault();e.stopImmediatePropagation();
    const booking=currentBooking();if(!booking)return toast('Could not match this invoice to the appointment. Reopen the appointment and try again.');
    const invoice={customer:val('invCustomer').trim(),email:val('invEmail').trim(),vehicle:val('invVehicle').trim(),date:val('invDate'),service:val('invService').trim(),price:Number(val('invPrice')||0),discount:Number(val('invDiscount')||0),tax:Number(val('invTax')||0),paid:Number(val('invPaid')||0),notes:val('invNotes').trim()};
    invoice.total=Math.max(0,invoice.price-invoice.discount+invoice.tax);invoice.balance=Math.max(0,invoice.total-invoice.paid);
    if(!invoice.email)return toast('Customer email address is missing');
    const invoiceNo=`EM-${String(booking.id||'').replace(/-/g,'').slice(0,8).toUpperCase()}`;
    const original=btn.textContent;btn.disabled=true;btn.textContent='Sending invoice...';
    try{
      const {data,error}=await db.functions.invoke('send-crm-email',{body:{mode:'invoice',booking_id:booking.id,email:invoice.email,subject:`EM Tinting Invoice ${invoiceNo}`,invoice}});
      if(error||data?.error)throw new Error(data?.error||error?.message||'Invoice email failed');
      btn.textContent='Invoice Sent ✓';setTimeout(()=>{btn.disabled=false;btn.textContent=original;},1800);
      if(typeof window.refreshCrmActivity==='function')window.refreshCrmActivity(booking.id);
      toast(`Invoice emailed to ${invoice.email}`);
    }catch(err){btn.disabled=false;btn.textContent=original;toast(err?.message||'Invoice email failed');}
  },true);
})();