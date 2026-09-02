(()=>{
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let editingId=null;

  function ensureDialog(){
    let dlg=qs('#editCustomerModal');
    if(dlg)return dlg;
    dlg=document.createElement('dialog');
    dlg.id='editCustomerModal';
    dlg.className='modal';
    dlg.innerHTML=`<form id="editCustomerForm">
      <header><div><p class="eyebrow">EM TINTING</p><h3>Edit customer</h3></div><button type="button" class="x" id="closeEditCustomer">×</button></header>
      <label>First name<input id="editCustomerFirst" required></label>
      <label>Last name<input id="editCustomerLast"></label>
      <label>Phone<input id="editCustomerPhone" required></label>
      <label>Email<input id="editCustomerEmail" type="email"></label>
      <label>Company<input id="editCustomerCompany"></label>
      <button class="btn primary save-wide" type="submit">Save changes</button>
    </form>`;
    document.body.appendChild(dlg);
    qs('#closeEditCustomer',dlg).onclick=()=>dlg.close();
    qs('#editCustomerForm',dlg).onsubmit=saveCustomer;
    return dlg;
  }

  window.openCustomerEditor=function(id){
    const c=(state?.customers||[]).find(x=>x.id===id);
    if(!c)return typeof toast==='function'?toast('Customer not found'):null;
    editingId=id;
    const dlg=ensureDialog();
    qs('#editCustomerFirst',dlg).value=c.first_name||'';
    qs('#editCustomerLast',dlg).value=c.last_name||'';
    qs('#editCustomerPhone',dlg).value=c.phone||'';
    qs('#editCustomerEmail',dlg).value=c.email||'';
    qs('#editCustomerCompany',dlg).value=c.company||'';
    dlg.showModal();
  };

  async function saveCustomer(e){
    e.preventDefault();
    if(!editingId)return;
    const dlg=ensureDialog();
    const payload={
      first_name:qs('#editCustomerFirst',dlg).value.trim(),
      last_name:qs('#editCustomerLast',dlg).value.trim(),
      phone:qs('#editCustomerPhone',dlg).value.trim(),
      email:qs('#editCustomerEmail',dlg).value.trim()||null,
      company:qs('#editCustomerCompany',dlg).value.trim()||null,
      updated_at:new Date().toISOString()
    };
    const btn=qs('button[type="submit"]',dlg);btn.disabled=true;btn.textContent='Saving…';
    const {error}=await db.from('customers').update(payload).eq('id',editingId);
    btn.disabled=false;btn.textContent='Save changes';
    if(error)return typeof toast==='function'?toast(error.message):alert(error.message);
    dlg.close();
    if(typeof toast==='function')toast('Customer updated');
    if(typeof loadAll==='function')await loadAll();
    setTimeout(addAppointmentEditButton,100);
  }

  function addCustomerTableButtons(){
    const table=qs('#customersTable table');if(!table)return;
    qsa('tbody tr',table).forEach(row=>{
      if(qs('.crm-edit-customer',row))return;
      const cells=qsa('td',row);if(cells.length<5)return;
      const phone=(cells[1].textContent||'').trim();
      const email=(cells[2].textContent||'').trim();
      const c=(state.customers||[]).find(x=>String(x.phone||'').trim()===phone || (email&&email!=='—'&&String(x.email||'').trim()===email));
      if(!c)return;
      const actions=qs('.table-actions',cells[cells.length-1])||cells[cells.length-1];
      const b=document.createElement('button');
      b.type='button';b.className='crm-edit-customer';b.textContent='Edit';b.onclick=()=>window.openCustomerEditor(c.id);
      actions.appendChild(b);
    });
  }

  function addAppointmentEditButton(){
    const detail=qs('#crmAppointmentDetail.active');if(!detail)return;
    if(qs('#crmEditCustomer',detail))return;
    const meta=qsa('.crm-appt-meta>div',detail);
    let phone='';
    meta.forEach(x=>{if((qs('small',x)?.textContent||'').trim()==='Phone')phone=(x.textContent||'').replace('Phone','').trim();});
    const c=(state.customers||[]).find(x=>String(x.phone||'').trim()===phone);
    if(!c)return;
    const title=qs('.crm-appt-title',detail);if(!title)return;
    const b=document.createElement('button');b.id='crmEditCustomer';b.type='button';b.className='btn ghost small';b.textContent='Edit Customer';b.onclick=()=>window.openCustomerEditor(c.id);
    title.appendChild(b);
  }

  function patchRender(){
    if(typeof window.renderCustomers==='function'&&!window.renderCustomers.__editPatched){
      const original=window.renderCustomers;
      const wrapped=function(...args){const out=original.apply(this,args);setTimeout(addCustomerTableButtons,0);return out;};
      wrapped.__editPatched=true;window.renderCustomers=wrapped;
    }
  }

  function init(){ensureDialog();patchRender();addCustomerTableButtons();addAppointmentEditButton();
    const customers=qs('#customersTable');if(customers)new MutationObserver(addCustomerTableButtons).observe(customers,{childList:true,subtree:true});
    const bookings=qs('#bookingsView');if(bookings)new MutationObserver(addAppointmentEditButton).observe(bookings,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,700));else setTimeout(init,700);
})();

// EM Tinting — Customer 360 + sales analytics
(()=>{
  const qs=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const cash=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n||0));
  const dateOnly=v=>v?new Date(v.includes?.('T')?v:`${v}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—';
  const customerName2=c=>c?`${c.first_name||''} ${c.last_name||''}`.trim():'Customer';
  const startOfWeek=()=>{const n=new Date(),d=n.getDay(),diff=(d+6)%7;n.setHours(0,0,0,0);n.setDate(n.getDate()-diff);return n;};
  const startOfMonth=()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth(),1);};
  const sameLocalDate=(v,d=new Date())=>{if(!v)return false;const x=new Date(v.includes?.('T')?v:`${v}T12:00:00`);return x.getFullYear()===d.getFullYear()&&x.getMonth()===d.getMonth()&&x.getDate()===d.getDate();};

  function ensure360Dialog(){let d=qs('#customer360Modal');if(d)return d;d=document.createElement('dialog');d.id='customer360Modal';d.className='modal wide';d.innerHTML='<div><header><div><p class="eyebrow">CUSTOMER 360</p><h3 id="customer360Title">Customer</h3></div><button class="x" type="button" id="customer360Close">×</button></header><div id="customer360Body"></div></div>';document.body.appendChild(d);qs('#customer360Close',d).onclick=()=>d.close();return d;}

  async function open360(id){const c=(state.customers||[]).find(x=>x.id===id);if(!c)return toast('Customer not found');const dlg=ensure360Dialog(),body=qs('#customer360Body',dlg);qs('#customer360Title',dlg).textContent=customerName2(c);body.innerHTML='<div class="empty">Loading full customer history…</div>';dlg.showModal();const [{data:warranties},{data:services}]=await Promise.all([db.from('warranties').select('*').eq('customer_id',id).order('installation_date',{ascending:false}),db.from('booking_services').select('*,bookings!inner(customer_id)').eq('bookings.customer_id',id).order('created_at',{ascending:false})]);const bookings=(state.bookings||[]).filter(x=>x.customer_id===id).sort((a,b)=>String(b.appointment_date).localeCompare(String(a.appointment_date)));const quotes=(state.quotes||[]).filter(x=>x.customer_id===id);const jobs=(state.jobs||[]).filter(x=>x.customer_id===id);const payments=(state.payments||[]).filter(x=>x.customer_id===id);const vehicles=[];for(const b of bookings){const key=[b.vehicle_year,b.vehicle_make,b.vehicle_model,b.vin].filter(Boolean).join('|');if(!key)continue;if(!vehicles.some(v=>v.key===key))vehicles.push({key,label:[b.vehicle_year,b.vehicle_make,b.vehicle_model].filter(Boolean).join(' '),vin:b.vin,last:b.appointment_date});}const paid=payments.filter(p=>p.status==='paid').reduce((n,p)=>n+(p.payment_type==='refund'?-Number(p.amount):Number(p.amount)),0);const section=(title,html)=>`<section class="form-section"><h4>${title}</h4>${html||'<div class="empty">None yet</div>'}</section>`;body.innerHTML=`<div class="stats" style="margin-bottom:18px"><article><span>Vehicles</span><strong>${vehicles.length}</strong><small>on file</small></article><article><span>Appointments</span><strong>${bookings.length}</strong><small>total</small></article><article><span>Paid</span><strong>${cash(paid)}</strong><small>lifetime</small></article><article><span>Warranties</span><strong>${(warranties||[]).length}</strong><small>records</small></article></div><div class="quick-actions" style="margin-bottom:18px"><a class="btn ghost" href="tel:${esc(c.phone||'')}">Call</a><a class="btn ghost" href="sms:${esc(c.phone||'')}">Text</a>${c.email?`<a class="btn ghost" href="mailto:${esc(c.email)}">Email</a>`:''}<button class="btn primary" type="button" id="customer360Edit">Edit Customer</button></div>${section('Vehicles',vehicles.map(v=>`<div class="list-item"><div><strong>${esc(v.label)}</strong><small>${v.vin?'VIN '+esc(v.vin)+' · ':''}Last visit ${dateOnly(v.last)}</small></div></div>`).join(''))}${section('Appointments',bookings.map(b=>`<div class="list-item"><div><strong>${dateOnly(b.appointment_date)} · ${esc(b.service||'')}</strong><small>${esc([b.vehicle_year,b.vehicle_make,b.vehicle_model].filter(Boolean).join(' '))} · ${esc(b.status||'')}</small></div><strong>${cash(b.total_amount||b.quoted_price||0)}</strong></div>`).join(''))}${section('Quotes',quotes.map(q=>`<div class="list-item"><div><strong>${esc(q.service||'Quote')} · ${esc(q.film_package||'')}</strong><small>${esc(q.status||'')} · ${q.sent_at?'Sent '+dateOnly(q.sent_at):'Not sent'}</small></div><strong>${cash(q.accepted_amount||q.amount||0)}</strong></div>`).join(''))}${section('Jobs',jobs.map(j=>`<div class="list-item"><div><strong>${esc(j.service||'Job')}</strong><small>${dateOnly(j.scheduled_date)} · ${esc(j.status||'')}</small></div><strong>${cash(j.total_amount||0)}</strong></div>`).join(''))}${section('Payments',payments.map(p=>`<div class="list-item"><div><strong>${esc((p.payment_type||'payment').replaceAll('_',' '))}</strong><small>${esc((p.method||'').replaceAll('_',' '))} · ${dateOnly(p.paid_at||p.created_at)}</small></div><strong>${cash(p.payment_type==='refund'?-Number(p.amount):p.amount)}</strong></div>`).join(''))}${section('HITEK Warranties',(warranties||[]).map(w=>`<div class="list-item"><div><strong>${esc([w.film_brand,w.film_package,w.shade].filter(Boolean).join(' '))}</strong><small>${esc(w.coverage||'')} · ${dateOnly(w.installation_date)} · ${esc([w.vehicle_year,w.vehicle_make,w.vehicle_model].filter(Boolean).join(' '))}</small></div></div>`).join(''))}${section('Service Lines',(services||[]).map(s=>`<div class="list-item"><div><strong>${esc(s.description||'Service')}</strong><small>${esc(s.film_package||'')} · Qty ${esc(s.quantity||1)}</small></div><strong>${cash(s.line_total||0)}</strong></div>`).join(''))}`;qs('#customer360Edit',dlg).onclick=()=>window.openCustomerEditor?.(id);}
  window.openCustomer360=open360;

  function add360Buttons(){const table=qs('#customersTable table');if(!table)return;qsa('tbody tr',table).forEach(row=>{if(qs('.crm-customer-360',row))return;const cells=qsa('td',row);if(cells.length<5)return;const phone=(cells[1].textContent||'').trim(),email=(cells[2].textContent||'').trim();const c=(state.customers||[]).find(x=>String(x.phone||'').trim()===phone||(email&&email!=='—'&&String(x.email||'').trim()===email));if(!c)return;const actions=qs('.table-actions',row)||cells[cells.length-1];const b=document.createElement('button');b.className='crm-customer-360';b.type='button';b.textContent='360°';b.onclick=()=>open360(c.id);actions.appendChild(b);});}

  async function renderAnalytics(){const dash=qs('#dashboardView');if(!dash||typeof state==='undefined')return;let panel=qs('#crmSalesAnalytics');if(!panel){panel=document.createElement('section');panel.id='crmSalesAnalytics';panel.className='panel';panel.style.marginTop='22px';dash.insertBefore(panel,qs('#growthPanel')||qs('#bookingAttemptsPanel')||null);}const now=new Date(),week=startOfWeek(),month=startOfMonth();const active=(state.bookings||[]).filter(b=>!['cancelled','no_show'].includes(b.status));const todayAppts=active.filter(b=>sameLocalDate(b.appointment_date,now)).length;const weekAppts=active.filter(b=>new Date(`${b.appointment_date}T12:00:00`)>=week).length;const monthAppts=active.filter(b=>new Date(`${b.appointment_date}T12:00:00`)>=month).length;const monthRevenue=(state.payments||[]).filter(p=>p.status==='paid'&&new Date(p.paid_at||p.created_at)>=month).reduce((n,p)=>n+(p.payment_type==='refund'?-Number(p.amount):Number(p.amount)),0);const ticketRows=(state.jobs||[]).filter(j=>Number(j.total_amount)>0);const avgTicket=ticketRows.length?ticketRows.reduce((n,j)=>n+Number(j.total_amount),0)/ticketRows.length:0;const decided=(state.quotes||[]).filter(q=>['accepted','declined'].includes(q.status));const conversion=decided.length?Math.round(decided.filter(q=>q.status==='accepted').length/decided.length*100):0;let webTotal=0,webCompleted=0,alerted=0;try{const since=new Date(Date.now()-30*24*60*60*1000).toISOString();const {data}=await db.from('booking_attempts').select('completed,abandoned_alert_sent_at').gte('first_seen_at',since);webTotal=(data||[]).length;webCompleted=(data||[]).filter(x=>x.completed).length;alerted=(data||[]).filter(x=>x.abandoned_alert_sent_at).length;}catch(_){ }const webConversion=webTotal?Math.round(webCompleted/webTotal*100):0;const reminderSent=(state.bookings||[]).filter(b=>b.reminder_sent_at&&sameLocalDate(b.reminder_sent_at,now)).length;const followSent=(state.quotes||[]).filter(q=>q.follow_up_sent_at&&sameLocalDate(q.follow_up_sent_at,now)).length;panel.innerHTML=`<div class="panel-head"><div><h3>Sales & Booking Analytics</h3><small class="muted">Live performance from appointments, quotes, payments and website leads.</small></div></div><div class="stats"><article><span>Today</span><strong>${todayAppts}</strong><small>appointments</small></article><article><span>This Week</span><strong>${weekAppts}</strong><small>appointments</small></article><article><span>This Month</span><strong>${monthAppts}</strong><small>appointments</small></article><article><span>Month Revenue</span><strong>${cash(monthRevenue)}</strong><small>collected</small></article></div><div class="stats" style="margin-top:14px"><article><span>Avg Ticket</span><strong>${cash(avgTicket)}</strong><small>jobs with totals</small></article><article><span>Quote Conversion</span><strong>${conversion}%</strong><small>accepted vs declined</small></article><article><span>Website Conversion</span><strong>${webConversion}%</strong><small>${webCompleted}/${webTotal} forms</small></article><article><span>Lead Alerts</span><strong>${alerted}</strong><small>last 30 days</small></article></div><div class="list" style="margin-top:16px"><div class="list-item"><div><strong>Automation status</strong><small>${reminderSent} reminder${reminderSent===1?'':'s'} sent today · ${followSent} quote follow-up${followSent===1?'':'s'} sent today</small></div><span class="pill confirmed">Active</span></div></div>`;}

  function init(){ensure360Dialog();add360Buttons();renderAnalytics();const t=qs('#customersTable');if(t)new MutationObserver(add360Buttons).observe(t,{childList:true,subtree:true});qs('#refreshBtn')?.addEventListener('click',()=>setTimeout(renderAnalytics,800));qs('#nav')?.addEventListener('click',()=>setTimeout(()=>{add360Buttons();renderAnalytics();},120));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,1100));else setTimeout(init,1100);
})();