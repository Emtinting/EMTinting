(()=>{
  const isMac=()=>/Macintosh|Mac OS X/i.test(navigator.userAgent)&&!/iPhone|iPad|iPod/i.test(navigator.userAgent);
  if(!isMac()) return;

  const cleanPhone=p=>String(p||'').replace(/[^0-9+]/g,'');
  const firstName=c=>String(c?.first_name||customerName(c)||'there').trim().split(/\s+/)[0]||'there';
  const fmtTime=v=>{const raw=String(v||'').slice(0,5);const [hh,mm]=raw.split(':').map(Number);if(Number.isNaN(hh))return raw||'your scheduled time';return `${hh%12||12}:${String(mm||0).padStart(2,'0')} ${hh>=12?'PM':'AM'}`;};
  const buildMessage=(type,b,c)=>{const name=firstName(c),date=dateFmt(b.appointment_date),time=fmtTime(b.appointment_time),service=b.service||'appointment';
    if(type==='confirmation')return `Hi ${name}, this is EM Tinting. Your ${service} appointment is scheduled for ${date} at ${time}. Please reply to confirm. Thank you!`;
    if(type==='reminder')return `Hi ${name}, this is EM Tinting. Just a reminder that your ${service} appointment is tomorrow, ${date}, at ${time}. Please reply to confirm. Thank you!`;
    if(type==='reschedule')return `Hi ${name}, this is EM Tinting. We need to reschedule your appointment currently set for ${date} at ${time}. Please reply so we can find a new time that works for you. Thank you!`;
    if(type==='cancellation')return `Hi ${name}, this is EM Tinting. Your appointment scheduled for ${date} at ${time} has been cancelled. Please reply if you would like to reschedule. Thank you!`;
    return `Hi ${name}, this is EM Tinting regarding your appointment on ${date} at ${time}.`;
  };

  async function copyText(text){
    try{await navigator.clipboard.writeText(text);return true;}catch(e){}
    try{const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok;}catch(e){return false;}
  }

  function ensureDialog(){
    let d=document.querySelector('#macSmsDialog'); if(d)return d;
    d=document.createElement('dialog');d.id='macSmsDialog';d.innerHTML=`<form method="dialog" style="min-width:min(620px,90vw);max-width:620px;background:#11151a;color:#fff;border:1px solid #333;border-radius:14px;padding:20px"><div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><div><div style="font-size:12px;letter-spacing:.12em;color:#ef4444;font-weight:800">EM TINTING</div><h3 style="margin:4px 0 0">Prepared text message</h3></div><button value="cancel" type="submit" style="background:none;border:0;color:#fff;font-size:26px;cursor:pointer">×</button></div><p style="color:#aab2bd;margin:12px 0 8px">Your Mac may not let Safari pre-fill the Messages compose box. The message is ready below.</p><textarea id="macSmsText" readonly style="width:100%;min-height:150px;box-sizing:border-box;background:#090c10;color:#fff;border:1px solid #343b45;border-radius:10px;padding:14px;font:inherit;line-height:1.45"></textarea><div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap"><button id="macSmsCopy" type="button" class="btn ghost">Copy message</button><button id="macSmsOpen" type="button" class="btn primary">Copy & Open Messages</button></div><div id="macSmsStatus" style="margin-top:10px;color:#9ee6a7;font-size:13px"></div></form>`;
    document.body.appendChild(d);return d;
  }

  window.openAppointmentText=async function(id,type){
    const booking=(state.bookings||[]).find(b=>b.id===id);if(!booking)return toast('Appointment not found');
    const customer=customerById(booking.customer_id);if(!customer?.phone)return toast('Customer phone number is missing');
    const msg=buildMessage(type,booking,customer), d=ensureDialog(), ta=d.querySelector('#macSmsText'), status=d.querySelector('#macSmsStatus');
    ta.value=msg;status.textContent='';
    d.querySelector('#macSmsCopy').onclick=async()=>{const ok=await copyText(msg);status.textContent=ok?'Message copied. Paste with Command + V.':'Copy was blocked — select the message above and press Command + C.';};
    d.querySelector('#macSmsOpen').onclick=async()=>{const ok=await copyText(msg);status.textContent=ok?'Copied — opening Messages. Paste with Command + V.':'Opening Messages — copy the prepared text above first.';window.location.href=`sms:${cleanPhone(customer.phone)}`;};
    if(!d.open)d.showModal();
  };
})();