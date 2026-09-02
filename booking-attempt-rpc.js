(()=>{
  const form=document.querySelector('#bookingForm');
  if(!form||form.dataset.rpcAttemptTracking==='1')return;
  form.dataset.rpcAttemptTracking='1';
  const endpoint='https://neuginokjfvnkmlzhwoa.supabase.co/functions/v1/track-booking-attempt';
  const storageKey='em_booking_attempt_session';
  let sessionId=sessionStorage.getItem(storageKey);
  if(!sessionId){sessionId=(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`);sessionStorage.setItem(storageKey,sessionId);}
  let lastSnapshot={},timer=null,started=false;
  const val=name=>String(form.elements[name]?.value||'').trim();
  const clip=(value,max=500)=>String(value||'').slice(0,max)||null;
  function snapshot(){const data={first_name:clip(val('first_name'),80),last_name:clip(val('last_name'),80),phone:clip(val('phone'),40),email:clip(val('email'),160),vehicle_year:clip(val('vehicle_year'),10),vehicle_make:clip(val('vehicle_make'),80),vehicle_model:clip(val('vehicle_model'),80),vehicle_type:clip(val('vehicle_type'),60),service:clip(val('service'),100),tint_coverage:clip(val('tint_coverage'),100),tint_package:clip(val('tint_package'),100),preferred_shade:clip(val('preferred_shade'),20),appointment_date:val('appointment_date')||null,appointment_time:val('appointment_time')||null,windshield:Boolean(form.elements.windshield?.checked),eyebrow:Boolean(form.elements.eyebrow?.checked),notes:clip(val('notes'),1000)};lastSnapshot={...lastSnapshot,...data};return data;}
  async function send(event,extra={},saved=false){const fields=saved?lastSnapshot:snapshot();const p={session_id:sessionId,last_event:event,page_url:clip(location.href,500),referrer:clip(document.referrer,500),user_agent:clip(navigator.userAgent,500),...fields,...extra};try{await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p}),keepalive:true});}catch(_){}}
  const queue=(event='editing')=>{clearTimeout(timer);timer=setTimeout(()=>send(event),700);};
  form.addEventListener('focusin',()=>{if(started)return;started=true;send('started');},{once:true});
  form.addEventListener('input',()=>queue('editing'));
  form.addEventListener('change',()=>queue('editing'));
  form.addEventListener('submit',()=>{clearTimeout(timer);lastSnapshot=snapshot();send('submit_clicked',{},true);},true);
  const status=document.querySelector('#bookingStatus');if(status)new MutationObserver(()=>{const text=(status.textContent||'').trim();if(!text)return;if(text.startsWith('Thanks!'))send('completed',{completed:true,error_message:null},true);else if(!text.startsWith('Sending')&&(text.includes('Unable')||text.includes('also call')||text.toLowerCase().includes('error')))send('error',{completed:false,error_message:clip(text,500)},true);}).observe(status,{childList:true,subtree:true,characterData:true});
})();

// EM Tinting — same-day booking + live availability
(()=>{
  const form=document.querySelector('#bookingForm');
  const dateEl=form?.elements?.appointment_date;
  const timeEl=document.querySelector('#appointmentTime');
  const statusEl=document.querySelector('#bookingStatus');
  if(!form||!dateEl||!timeEl)return;
  const zone='America/Chicago';
  const availability='https://neuginokjfvnkmlzhwoa.supabase.co/functions/v1/public-availability';
  const nowParts=()=>{const p=new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()).reduce((a,x)=>(a[x.type]=x.value,a),{});return{date:`${p.year}-${p.month}-${p.day}`,hour:Number(p.hour),minute:Number(p.minute)}};
  dateEl.min=nowParts().date;
  let requestId=0;
  async function refill(){
    const id=++requestId;
    timeEl.innerHTML='<option value="">Checking availability…</option>';
    if(!dateEl.value){timeEl.innerHTML='<option value="">Choose appointment time</option>';return;}
    const d=new Date(dateEl.value+'T12:00:00');
    const day=d.getDay();
    if(day===0){if(statusEl)statusEl.textContent='We are closed on Sundays. Please choose another date.';dateEl.value='';timeEl.innerHTML='<option value="">Choose appointment time</option>';return;}
    if(statusEl)statusEl.textContent='';
    let booked=new Set(),blocked=false,reason='';
    try{const r=await fetch(`${availability}?date=${encodeURIComponent(dateEl.value)}`,{cache:'no-store'});const data=await r.json();if(r.ok){booked=new Set(data.booked_times||[]);blocked=Boolean(data.blocked);reason=data.reason||'';}}catch(_){ }
    if(id!==requestId)return;
    if(blocked){timeEl.innerHTML='<option value="">No times available</option>';if(statusEl)statusEl.textContent=reason||'That date is unavailable. Please choose another date.';return;}
    timeEl.innerHTML='<option value="">Choose appointment time</option>';
    const end=day===6?14:18;
    let start=10;
    const now=nowParts();
    if(dateEl.value===now.date){start=Math.max(10,now.hour+(now.minute>0?1:0));}
    let shown=0;
    for(let h=start;h<=end;h++){
      const value=String(h).padStart(2,'0')+':00';
      if(booked.has(value))continue;
      const label=new Date('2000-01-01T'+value+':00').toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
      timeEl.insertAdjacentHTML('beforeend',`<option value="${value}">${label}</option>`);shown++;
    }
    if(!shown&&statusEl)statusEl.textContent=dateEl.value===now.date?'There are no appointment times left today. Please choose another date.':'That day is fully booked. Please choose another date.';
  }
  dateEl.addEventListener('change',()=>setTimeout(refill,0));
  setTimeout(()=>{dateEl.min=nowParts().date;if(dateEl.value)refill();},0);
})();