(()=>{
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const escSms=v=>String(v||'').trim();
  const moneySms=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(v||0));
  const timeSms=v=>{if(!v)return '';const [h,m]=String(v).slice(0,5).split(':').map(Number);return new Date(2000,0,1,h,m).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})};
  const dateSms=v=>v?new Date(v+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'}):'';
  function customer(b){return state.customers.find(c=>c.id===b.customer_id)}
  function dueLabel(b){
    if(b.sms_reminder_sent_at)return 'Reminder sent';
    if(b.sms_reminder_opened_at)return 'Ready to text';
    const appt=new Date(b.appointment_date+'T12:00:00'), now=new Date();
    const tomorrow=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
    return appt.toDateString()===tomorrow.toDateString()?'Reminder due':'Text reminder';
  }
  function messageFor(b,c){
    const name=escSms(c?.first_name)||'there';
    const vehicle=[b.vehicle_year,b.vehicle_make,b.vehicle_model].filter(Boolean).join(' ');
    const pkg=b.tint_package||b.film_package||b.service||'your service';
    const price=Number(b.total_amount||b.quoted_price||0);
    return `EM Tinting 🔥
Hey ${name}! Just a reminder about your appointment ${dateSms(b.appointment_date)} at ${timeSms(b.appointment_time)}.
${vehicle?'🚘 '+vehicle+'\n':''}🪟 ${pkg}
${price?'💰 '+moneySms(price)+'\n':''}
Need to make a change? Reply to this message.
— EM Tinting
346-804-9135`;
  }
  async function openReminder(id){
    const b=state.bookings.find(x=>x.id===id), c=b&&customer(b);
    if(!b||!c?.phone)return toast('Customer phone number is missing');
    const body=encodeURIComponent(messageFor(b,c));
    const phone=String(c.phone).replace(/[^0-9+]/g,'');
    const sep=/iPhone|iPad|iPod/i.test(navigator.userAgent)?'&':'?';
    await db.from('bookings').update({sms_reminder_opened_at:new Date().toISOString()}).eq('id',id);
    b.sms_reminder_opened_at=new Date().toISOString();
    window.location.href=`sms:${phone}${sep}body=${body}`;
  }
  async function markReminderSent(id){
    const at=new Date().toISOString();
    const {error}=await db.from('bookings').update({sms_reminder_sent_at:at}).eq('id',id);
    if(error)return toast(error.message);
    const b=state.bookings.find(x=>x.id===id);if(b)b.sms_reminder_sent_at=at;
    toast('Reminder marked sent'); enhance();
  }
  function enhance(){
    qsa('#bookingsTable tbody tr').forEach(row=>{
      const actions=qs('.table-actions',row); if(!actions)return;
      const onclick=qsa('button',actions).map(x=>x.getAttribute('onclick')||'').find(x=>x.includes("logConfirmationCall"));
      const id=onclick?.match(/\('([^']+)'/)?.[1]; if(!id)return;
      const b=state.bookings.find(x=>x.id===id); if(!b)return;
      let btn=qs('[data-sms-reminder]',actions);
      if(!btn){btn=document.createElement('button');btn.dataset.smsReminder='1';actions.prepend(btn)}
      btn.textContent='📲 '+dueLabel(b);
      btn.onclick=()=>openReminder(id);
      let sent=qs('[data-sms-sent]',actions);
      if(!b.sms_reminder_sent_at){
        if(!sent){sent=document.createElement('button');sent.dataset.smsSent='1';actions.appendChild(sent)}
        sent.textContent='✓ Mark reminder sent';sent.onclick=()=>markReminderSent(id);
      }else sent?.remove();
    });
  }
  window.emTextReminder=openReminder; window.emMarkReminderSent=markReminderSent;
  const obs=new MutationObserver(()=>setTimeout(enhance,0));obs.observe(document.documentElement,{childList:true,subtree:true});
  setInterval(()=>{if(qs('#app')&&!qs('#app').classList.contains('hidden'))enhance()},2000);
})();