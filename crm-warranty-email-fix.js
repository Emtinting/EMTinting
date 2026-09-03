(()=>{
  const norm=v=>String(v||'').replace(/\D/g,'');
  const bookings=()=>typeof state!=='undefined'?(state.bookings||[]):[];
  const getMeta=(label)=>{
    const detail=document.getElementById('crmAppointmentDetail');
    const block=[...(detail?.querySelectorAll('.crm-appt-meta>div')||[])].find(x=>x.querySelector('small')?.textContent.trim()===label);
    if(!block) return '';
    const clone=block.cloneNode(true); clone.querySelector('small')?.remove(); return clone.textContent.trim();
  };
  const fmtTime=v=>{const raw=String(v||'').slice(0,5),[hh,mm]=raw.split(':').map(Number);if(Number.isNaN(hh))return raw;return `${hh%12||12}:${String(mm||0).padStart(2,'0')} ${hh>=12?'PM':'AM'}`;};
  const rememberBookingFromRow=target=>{
    const row=target.closest('tr'); if(!row)return;
    const check=[...row.querySelectorAll('button')].find(b=>(b.getAttribute('onclick')||'').includes("checkIn('"));
    const match=(check?.getAttribute('onclick')||'').match(/checkIn\('([^']+)'\)/);
    if(match){window.__crmWarrantyBookingId=match[1];sessionStorage.setItem('crmWarrantyBookingId',match[1]);}
  };
  const resolveBooking=()=>{
    const saved=window.__crmWarrantyBookingId||sessionStorage.getItem('crmWarrantyBookingId');
    let booking=bookings().find(b=>b.id===saved); if(booking)return booking;
    const date=getMeta('Date'),time=getMeta('Time'),vehicle=getMeta('Vehicle'),service=getMeta('Service'),phone=norm(getMeta('Phone'));
    booking=bookings().find(b=>{
      const bd=typeof dateFmt==='function'?dateFmt(b.appointment_date):String(b.appointment_date||'');
      const bv=[b.vehicle_year,b.vehicle_make,b.vehicle_model].filter(Boolean).join(' ');
      const customer=typeof customerById==='function'?customerById(b.customer_id):null;
      return (!date||bd===date)&&(!time||fmtTime(b.appointment_time)===time)&&(!vehicle||bv===vehicle)&&(!service||String(b.service||'')===service)&&(!phone||norm(customer?.phone)===phone);
    })||null;
    if(booking){window.__crmWarrantyBookingId=booking.id;sessionStorage.setItem('crmWarrantyBookingId',booking.id);} return booking;
  };
  const findWarranty=async booking=>{
    let r=await db.from('warranties').select('id,warranty_emailed_at,booking_id,customer_id').eq('booking_id',booking.id).order('installation_date',{ascending:false}).limit(1).maybeSingle();
    if(r.error)throw r.error; if(r.data?.id)return r.data;
    r=await db.from('warranties').select('id,warranty_emailed_at,booking_id,customer_id').eq('customer_id',booking.customer_id).order('installation_date',{ascending:false}).limit(1).maybeSingle();
    if(r.error)throw r.error; return r.data||null;
  };
  const getContext=async()=>{
    const booking=resolveBooking(); if(!booking)throw new Error('Could not match this warranty to the appointment. Reopen the appointment and try again.');
    const customer=typeof customerById==='function'?customerById(booking.customer_id):null;
    if(!customer?.email)throw new Error('Customer email address is missing');
    const warranty=await findWarranty(booking); if(!warranty?.id)throw new Error('No saved HITEK warranty is linked to this appointment');
    return {booking,customer,warranty};
  };
  const sentStatus=sentAt=>{
    const top=document.querySelector('.crm-warranty-v2-top'); if(!top||!sentAt)return;
    let status=top.querySelector('.crm-warranty-email-status');
    if(!status){status=document.createElement('div');status.className='crm-warranty-email-status';status.style.cssText='margin-left:auto;align-self:center;color:#aeb6bf;font-size:12px;white-space:nowrap';const main=top.querySelector('#crmWarrantyEmailV2');if(main)top.insertBefore(status,main);else top.appendChild(status);}
    const d=new Date(sentAt);status.textContent=`Warranty emailed ${d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} ${d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})} ✓`;
    const main=top.querySelector('#crmWarrantyEmailV2');if(main)main.innerHTML='✉ &nbsp; Email Warranty Again';
  };
  const ensureModal=()=>{
    let modal=document.getElementById('crmWarrantyEmailPreviewModal'); if(modal)return modal;
    modal=document.createElement('div'); modal.id='crmWarrantyEmailPreviewModal';
    modal.style.cssText='display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.78);padding:24px;box-sizing:border-box;overflow:auto';
    modal.innerHTML=`<div style="max-width:820px;margin:20px auto;background:#11151a;border:1px solid #343a43;border-radius:14px;box-shadow:0 24px 70px rgba(0,0,0,.5);overflow:hidden"><div style="display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid #30353d;color:#fff"><div><strong id="crmWarrantyPreviewTitle">Warranty Email Preview</strong><div id="crmWarrantyPreviewMeta" style="font-size:12px;color:#aeb6bf;margin-top:4px"></div></div><button id="crmWarrantyPreviewClose" type="button" style="background:#20242a;color:#fff;border:1px solid #555;border-radius:7px;padding:8px 12px;cursor:pointer">Close</button></div><iframe id="crmWarrantyPreviewFrame" title="Warranty email preview" style="display:block;width:100%;height:720px;border:0;background:#fff"></iframe></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#crmWarrantyPreviewClose').onclick=()=>modal.style.display='none';
    modal.addEventListener('click',e=>{if(e.target===modal)modal.style.display='none';});
    return modal;
  };
  const showPreview=(html,title,meta)=>{
    const modal=ensureModal(); modal.querySelector('#crmWarrantyPreviewTitle').textContent=title; modal.querySelector('#crmWarrantyPreviewMeta').textContent=meta||'';
    modal.querySelector('#crmWarrantyPreviewFrame').srcdoc=html; modal.style.display='block';
  };
  const previewWarranty=async useLast=>{
    try{
      const {warranty}=await getContext();
      const {data,error}=await db.functions.invoke('send-warranty',{body:{warranty_id:warranty.id,action:'preview'}});
      if(error||data?.error)throw new Error(data?.error||error?.message||'Could not load warranty email preview');
      if(useLast){
        if(!data?.last_sent?.html_body)throw new Error('No sent warranty email copy is saved yet');
        const d=new Date(data.last_sent.sent_at);showPreview(data.last_sent.html_body,'Last Sent Warranty Email',`Sent to ${data.last_sent.recipient_email} · ${d.toLocaleString()}`);
      }else showPreview(data.current_html,'Warranty Email Preview',`To: ${data.to} · Subject: ${data.subject}`);
    }catch(err){if(typeof toast==='function')toast(err?.message||'Could not load warranty email preview');}
  };
  const addPreviewButtons=()=>{
    const top=document.querySelector('.crm-warranty-v2-top'); if(!top||top.querySelector('[data-warranty-preview-email]'))return;
    const send=top.querySelector('#crmWarrantyEmailV2'); if(!send)return;
    const preview=document.createElement('button');preview.type='button';preview.dataset.warrantyPreviewEmail='1';preview.textContent='Preview Email';preview.style.cssText='background:#15181d;color:#fff;border:1px solid #666;border-radius:7px;padding:12px 16px;font-weight:700;cursor:pointer';preview.onclick=()=>previewWarranty(false);
    const last=document.createElement('button');last.type='button';last.dataset.warrantyLastEmail='1';last.textContent='View Last Sent';last.style.cssText=preview.style.cssText;last.onclick=()=>previewWarranty(true);
    top.insertBefore(last,send);top.insertBefore(preview,last);
  };
  let sending=false;
  const sendWarranty=async clicked=>{
    if(sending)return;
    let ctx;try{ctx=await getContext();}catch(err){return typeof toast==='function'?toast(err?.message||'Could not load warranty'):null;}
    sending=true;
    const buttons=[clicked,document.getElementById('crmWarrantyEmailV2'),document.querySelector('[data-warranty-email]')].filter((b,i,a)=>b&&a.indexOf(b)===i);
    buttons.forEach(b=>{b.disabled=true;b.textContent='Sending warranty...';});
    try{
      const {data,error}=await db.functions.invoke('send-warranty',{body:{warranty_id:ctx.warranty.id}});
      if(error||data?.error)throw new Error(data?.error||error?.message||'Warranty email failed');
      buttons.forEach(b=>{b.disabled=false;b.textContent='Email Warranty Again';}); sentStatus(data?.sent_at||new Date().toISOString());
      if(typeof toast==='function')toast(`Warranty emailed to ${ctx.customer.email}`);
    }catch(err){buttons.forEach(b=>{b.disabled=false;b.textContent='Email Warranty';});const main=document.getElementById('crmWarrantyEmailV2');if(main)main.innerHTML='✉ &nbsp; Email Warranty';if(typeof toast==='function')toast(err?.message||'Warranty email failed');}
    finally{sending=false;}
  };
  document.addEventListener('click',e=>{const view=e.target.closest?.('.crm-view-btn');if(view)rememberBookingFromRow(view);},true);
  document.addEventListener('click',e=>{const btn=e.target.closest?.('#crmWarrantyEmailV2,[data-warranty-email]');if(!btn)return;e.preventDefault();e.stopImmediatePropagation();sendWarranty(btn);},true);
  const observer=new MutationObserver(()=>addPreviewButtons());observer.observe(document.body,{childList:true,subtree:true});addPreviewButtons();
})();