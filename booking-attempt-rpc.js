(()=>{
  const form=document.querySelector('#bookingForm');
  if(!form||form.dataset.rpcAttemptTracking==='1')return;
  form.dataset.rpcAttemptTracking='1';
  const endpoint='https://neuginokjfvnkmlzhwoa.supabase.co/rest/v1/rpc/track_booking_attempt';
  const apiKey='sb_publishable_T-XFCPWnkn_meQPK0AKA6A_hRvfRXGk';
  const storageKey='em_booking_attempt_session';
  let sessionId=sessionStorage.getItem(storageKey);
  if(!sessionId){sessionId=(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`);sessionStorage.setItem(storageKey,sessionId);}
  let lastSnapshot={},timer=null,started=false;
  const val=name=>String(form.elements[name]?.value||'').trim();
  const clip=(value,max=500)=>String(value||'').slice(0,max)||null;
  function snapshot(){const data={first_name:clip(val('first_name'),80),last_name:clip(val('last_name'),80),phone:clip(val('phone'),40),email:clip(val('email'),160),vehicle_year:clip(val('vehicle_year'),10),vehicle_make:clip(val('vehicle_make'),80),vehicle_model:clip(val('vehicle_model'),80),vehicle_type:clip(val('vehicle_type'),60),service:clip(val('service'),100),tint_coverage:clip(val('tint_coverage'),100),tint_package:clip(val('tint_package'),100),preferred_shade:clip(val('preferred_shade'),20),appointment_date:val('appointment_date')||null,appointment_time:val('appointment_time')||null,windshield:Boolean(form.elements.windshield?.checked),eyebrow:Boolean(form.elements.eyebrow?.checked),notes:clip(val('notes'),1000)};lastSnapshot={...lastSnapshot,...data};return data;}
  async function send(event,extra={},saved=false){const fields=saved?lastSnapshot:snapshot();const p={session_id:sessionId,last_event:event,page_url:clip(location.href,500),referrer:clip(document.referrer,500),user_agent:clip(navigator.userAgent,500),...fields,...extra};try{await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','apikey':apiKey,'Authorization':`Bearer ${apiKey}`},body:JSON.stringify({p}),keepalive:true});}catch(_){}}
  const queue=(event='editing')=>{clearTimeout(timer);timer=setTimeout(()=>send(event),700);};
  form.addEventListener('focusin',()=>{if(started)return;started=true;send('started');},{once:true});
  form.addEventListener('input',()=>queue('editing'));
  form.addEventListener('change',()=>queue('editing'));
  form.addEventListener('submit',()=>{clearTimeout(timer);lastSnapshot=snapshot();send('submit_clicked',{},true);},true);
  const status=document.querySelector('#bookingStatus');if(status)new MutationObserver(()=>{const text=(status.textContent||'').trim();if(!text)return;if(text.startsWith('Thanks!'))send('completed',{completed:true,error_message:null},true);else if(!text.startsWith('Sending')&&(text.includes('Unable')||text.includes('also call')||text.toLowerCase().includes('error')))send('error',{completed:false,error_message:clip(text,500)},true);}).observe(status,{childList:true,subtree:true,characterData:true});
})();

// EM Tinting — same-day booking override
(()=>{
  const form=document.querySelector('#bookingForm');
  const dateEl=form?.elements?.appointment_date;
  const timeEl=document.querySelector('#appointmentTime');
  const statusEl=document.querySelector('#bookingStatus');
  if(!form||!dateEl||!timeEl)return;
  const zone='America/Chicago';
  const nowParts=()=>{const p=new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()).reduce((a,x)=>(a[x.type]=x.value,a),{});return{date:`${p.year}-${p.month}-${p.day}`,hour:Number(p.hour),minute:Number(p.minute)}};
  const today=nowParts();
  dateEl.min=today.date;
  function refill(){
    timeEl.innerHTML='<option value="">Choose appointment time</option>';
    if(!dateEl.value)return;
    const d=new Date(dateEl.value+'T12:00:00');
    const day=d.getDay();
    if(day===0){if(statusEl)statusEl.textContent='We are closed on Sundays. Please choose another date.';dateEl.value='';return;}
    if(statusEl)statusEl.textContent='';
    const end=day===6?14:18;
    let start=10;
    const now=nowParts();
    if(dateEl.value===now.date){start=Math.max(10,now.hour+(now.minute>0?1:0));if(start>end){if(statusEl)statusEl.textContent='There are no appointment times left today. Please choose another date.';return;}}
    for(let h=start;h<=end;h++){const value=String(h).padStart(2,'0')+':00';const label=new Date('2000-01-01T'+value+':00').toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});timeEl.insertAdjacentHTML('beforeend',`<option value="${value}">${label}</option>`);}
  }
  dateEl.addEventListener('change',()=>setTimeout(refill,0));
  setTimeout(()=>{dateEl.min=nowParts().date;if(dateEl.value)refill();},0);
})();