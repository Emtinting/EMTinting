window.addEventListener('load',()=>{
  const REVIEW_KEY='em_tinting_google_review_url';
  const getReviewUrl=()=>localStorage.getItem(REVIEW_KEY)||'';
  const safeText=v=>String(v??'');
  const smsLink=(phone,body)=>{
    const p=safeText(phone).replace(/[^0-9+]/g,'');
    const sep=/Mac|iPhone|iPad/.test(navigator.userAgent)?'&':'?';
    return `sms:${p}${sep}body=${encodeURIComponent(body)}`;
  };
  const timeLabel=t=>{if(!t)return'';const [h,m]=String(t).slice(0,5).split(':').map(Number);const d=new Date();d.setHours(h,m||0,0,0);return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});};
  const tomorrowISO=()=>{const d=new Date();d.setDate(d.getDate()+1);return d.toISOString().slice(0,10);};

  function ensureGrowthUI(){
    const dash=document.querySelector('#dashboardView');
    if(dash&&!document.querySelector('#growthPanel')){
      const panel=document.createElement('section');panel.id='growthPanel';panel.className='panel';panel.style.marginTop='18px';
      panel.innerHTML=`<div class="panel-head"><div><h3>Follow-up Center</h3><small>Confirmations, deposits, quotes, warranties & reviews</small></div><button id="setReviewLink" class="btn ghost small" type="button">Google review link</button></div><div id="growthSummary" class="list"></div>`;
      dash.appendChild(panel);
      panel.querySelector('#setReviewLink').addEventListener('click',()=>{const current=getReviewUrl();const url=prompt('Paste your Google review link here:',current);if(url!==null){localStorage.setItem(REVIEW_KEY,url.trim());toast(url.trim()?'Google review link saved':'Google review link cleared');renderGrowthSummary();}});
    }
    if(!document.querySelector('#historyDialog')){
      const d=document.createElement('dialog');d.id='historyDialog';d.className='modal wide';d.innerHTML=`<div><header><div><p class="eyebrow">CUSTOMER RECORD</p><h3 id="historyTitle">Customer history</h3></div><button type="button" class="x" id="historyClose">×</button></header><div id="historyBody" class="stack"></div></div>`;document.body.appendChild(d);d.querySelector('#historyClose').onclick=()=>d.close();
    }
  }

  function renderGrowthSummary(){
    ensureGrowthUI();const box=document.querySelector('#growthSummary');if(!box||!window.state)return;
    const tomorrow=tomorrowISO();
    const tomorrowBookings=(state.bookings||[]).filter(b=>b.appointment_date===tomorrow&&!['cancelled','completed','no_show'].includes(b.status));
    const unconfirmed=tomorrowBookings.filter(b=>!b.appointment_confirmed);
    const unpaid=(state.bookings||[]).filter(b=>!['cancelled','completed','no_show'].includes(b.status)&&Number(b.deposit_amount||0)<=0&&Number(b.total_amount||b.quoted_price||0)>0);
    const now=Date.now();
    const followups=(state.quotes||[]).filter(q=>['sent','pending_review'].includes(q.status)&&(!q.follow_up_due_at||new Date(q.follow_up_due_at).getTime()<=now));
    const completed=(state.jobs||[]).filter(j=>j.status==='completed'&&!j.review_requested_at);
    box.innerHTML=`<div class="list-item"><div><strong>${unconfirmed.length} appointment${unconfirmed.length===1?'':'s'} need confirmation</strong><small>${tomorrowBookings.length} scheduled tomorrow</small></div></div><div class="list-item"><div><strong>${unpaid.length} active appointment${unpaid.length===1?'':'s'} without a recorded deposit</strong><small>Use Deposit from the appointment actions</small></div></div><div class="list-item"><div><strong>${followups.length} quote follow-up${followups.length===1?'':'s'} due</strong><small>Quotes still waiting on a decision</small></div></div><div class="list-item"><div><strong>${completed.length} completed job${completed.length===1?'':'s'} ready for a review request</strong><small>${getReviewUrl()?'Google review link is configured':'Set your Google review link above'}</small></div></div>`;
  }

  async function markDeposit(id){
    const b=(state.bookings||[]).find(x=>x.id===id);if(!b)return;const c=customerById(b.customer_id);const raw=prompt(`Deposit received from ${customerName(c)}:`,String(b.deposit_amount||''));if(raw===null)return;const amount=Number(raw);if(!Number.isFinite(amount)||amount<0)return toast('Enter a valid deposit amount');
    const method=prompt('Payment method (cash, card, zelle, cashapp, apple_pay, other):','cash')||'cash';
    const {error:pe}=await db.from('payments').insert({customer_id:b.customer_id,booking_id:b.id,amount,payment_type:'deposit',method,status:'paid',paid_at:new Date().toISOString()});if(pe)return toast(pe.message);
    const {error}=await db.from('bookings').update({deposit_amount:amount,updated_at:new Date().toISOString()}).eq('id',id);if(error)return toast(error.message);toast('Deposit recorded');await loadAll();renderGrowthSummary();
  }
  async function markNoShow(id){if(!confirm('Mark this appointment as a no-show?'))return;const {error}=await db.from('bookings').update({status:'no_show',no_show_at:new Date().toISOString(),appointment_confirmed:false}).eq('id',id);if(error)return toast(error.message);toast('Marked no-show');await loadAll();renderGrowthSummary();}
  async function createWarranty(id){
    const b=(state.bookings||[]).find(x=>x.id===id);if(!b)return;const c=customerById(b.customer_id);
    const film=prompt('Film package:',b.tint_package||'Ceramic IR');if(film===null)return;const shade=prompt('Tint shade (example: 20%, 35%, 70%):','');if(shade===null)return;const coverage=prompt('Coverage (example: full vehicle + windshield):',b.service||'Window Tint');if(coverage===null)return;
    const payload={customer_id:b.customer_id,booking_id:b.id,vehicle_year:b.vehicle_year,vehicle_make:b.vehicle_make,vehicle_model:b.vehicle_model,vin:b.vin,film_brand:'HITEK',film_package:film.trim(),shade:shade.trim(),coverage:coverage.trim(),installation_date:new Date().toISOString().slice(0,10)};
    const {error}=await db.from('warranties').insert(payload);if(error)return toast(error.message);toast(`Warranty saved for ${customerName(c)}`);
  }
  function sendTemplate(id,type){
    const b=(state.bookings||[]).find(x=>x.id===id);if(!b)return;const c=customerById(b.customer_id);if(!c?.phone)return toast('Customer has no phone number');const first=c.first_name||'there';const when=`${dateFmt(b.appointment_date)} at ${timeLabel(b.appointment_time)}`;
    const templates={confirmation:`Hi ${first}, this is EM Tinting confirming your appointment for ${when}. Please reply to confirm. Thank you!`,reminder:`Hi ${first}, this is EM Tinting. Just a reminder that your appointment is tomorrow at ${timeLabel(b.appointment_time)}. Please reply to confirm. Thank you!`,review:`Hi ${first}, thank you for choosing EM Tinting! If you were happy with your service, we'd really appreciate a Google review: ${getReviewUrl()}`};
    if(type==='review'&&!getReviewUrl())return toast('Set your Google review link in the Follow-up Center first');location.href=smsLink(c.phone,templates[type]);
    if(type==='reminder')db.from('bookings').update({reminder_sent_at:new Date().toISOString()}).eq('id',id).then(()=>{});if(type==='review')db.from('bookings').update({review_requested_at:new Date().toISOString()}).eq('id',id).then(()=>{});
  }
  async function showHistory(customerId){
    const c=customerById(customerId);if(!c)return;const dialog=document.querySelector('#historyDialog');const body=document.querySelector('#historyBody');document.querySelector('#historyTitle').textContent=customerName(c);
    const [w]=await Promise.all([db.from('warranties').select('*').eq('customer_id',customerId).order('installation_date',{ascending:false})]);
    const bookings=(state.bookings||[]).filter(x=>x.customer_id===customerId);const quotes=(state.quotes||[]).filter(x=>x.customer_id===customerId);const jobs=(state.jobs||[]).filter(x=>x.customer_id===customerId);const payments=(state.payments||[]).filter(x=>x.customer_id===customerId);const warranties=w.data||[];
    const section=(title,items,fn)=>`<section class="form-section"><h4>${title}</h4>${items.length?items.map(fn).join(''):'<div class="empty">None yet</div>'}</section>`;
    body.innerHTML=`<div class="list-item"><div><strong>${customerName(c)}</strong><small>${safeText(c.phone)} · ${safeText(c.email||'No email')}</small></div></div>${section('Appointments',bookings,b=>`<div class="list-item"><div><strong>${dateFmt(b.appointment_date)} · ${safeText(b.service)}</strong><small>${[b.vehicle_year,b.vehicle_make,b.vehicle_model].filter(Boolean).join(' ')} · ${safeText(b.status)}</small></div></div>`)}${section('Quotes',quotes,q=>`<div class="list-item"><div><strong>${safeText(q.service)} · ${money(q.amount)}</strong><small>${safeText(q.status)} · ${safeText(q.film_package||'')}</small></div></div>`)}${section('Jobs',jobs,j=>`<div class="list-item"><div><strong>${safeText(j.service)} · ${money(j.total_amount)}</strong><small>${safeText(j.status)} · ${dateFmt(j.scheduled_date)}</small></div></div>`)}${section('Payments',payments,p=>`<div class="list-item"><div><strong>${money(p.amount)} · ${safeText(p.payment_type)}</strong><small>${safeText(p.method||'')} · ${safeText(p.status)}</small></div></div>`)}${section('Digital warranties',warranties,x=>`<div class="list-item"><div><strong>${safeText(x.film_brand)} ${safeText(x.film_package)} ${safeText(x.shade)}</strong><small>${safeText(x.coverage||'')} · ${dateFmt(x.installation_date)} · ${[x.vehicle_year,x.vehicle_make,x.vehicle_model].filter(Boolean).join(' ')}</small></div></div>`)}`;
    dialog.showModal();
  }
  window.crmGrowth={markDeposit,markNoShow,createWarranty,sendTemplate,showHistory,renderGrowthSummary};

  function enhanceBookings(){document.querySelectorAll('#bookingsTable tbody tr').forEach(row=>{const actions=row.querySelector('.table-actions');if(!actions||actions.dataset.growth)return;const any=[...actions.querySelectorAll('button')].find(b=>(b.getAttribute('onclick')||'').includes("checkIn('"));if(!any)return;const m=(any.getAttribute('onclick')||'').match(/checkIn\('([^']+)'\)/);if(!m)return;const id=m[1];const booking=(state.bookings||[]).find(b=>b.id===id);if(!booking)return;actions.dataset.growth='1';const add=(txt,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=txt;b.onclick=fn;actions.appendChild(b);};add('Deposit',()=>markDeposit(id));add('No-show',()=>markNoShow(id));add('Warranty',()=>createWarranty(id));add('Confirm text',()=>sendTemplate(id,'confirmation'));add('24h text',()=>sendTemplate(id,'reminder'));add('Review text',()=>sendTemplate(id,'review'));});}
  function enhanceCustomers(){document.querySelectorAll('#customersTable tbody tr').forEach(row=>{const actions=row.querySelector('.table-actions');if(!actions||actions.dataset.history)return;const tel=actions.querySelector('a[href^="tel:"]');if(!tel)return;const phone=tel.getAttribute('href').replace('tel:','');const c=(state.customers||[]).find(x=>safeText(x.phone).replace(/[^0-9+]/g,'')===phone);if(!c)return;actions.dataset.history='1';const b=document.createElement('button');b.type='button';b.textContent='History';b.onclick=()=>showHistory(c.id);actions.appendChild(b);});}
  function enhanceQuotes(){document.querySelectorAll('#quotesTable tbody tr').forEach(row=>{const actions=row.querySelector('.table-actions');if(!actions||actions.dataset.followup)return;const sent=[...actions.querySelectorAll('button')].find(b=>(b.getAttribute('onclick')||'').includes("updateQuoteStatus('"));if(!sent)return;const m=(sent.getAttribute('onclick')||'').match(/updateQuoteStatus\('([^']+)'/);if(!m)return;const id=m[1];actions.dataset.followup='1';const b=document.createElement('button');b.type='button';b.textContent='Follow-up due';b.onclick=async()=>{const due=new Date(Date.now()+24*60*60*1000).toISOString();const q=(state.quotes||[]).find(x=>x.id===id);const {error}=await db.from('quotes').update({follow_up_due_at:due,follow_up_count:Number(q?.follow_up_count||0)+1,last_follow_up_at:new Date().toISOString()}).eq('id',id);if(error)return toast(error.message);toast('Quote follow-up tracked');await loadAll();renderGrowthSummary();};actions.appendChild(b);});}
  const refresh=()=>{ensureGrowthUI();renderGrowthSummary();enhanceBookings();enhanceCustomers();enhanceQuotes();};
  const obs=new MutationObserver(()=>setTimeout(refresh,0));['bookingsTable','customersTable','quotesTable','dashboardView'].forEach(id=>{const n=document.getElementById(id);if(n)obs.observe(n,{childList:true,subtree:true});});
  setTimeout(refresh,600);
});