(()=>{
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const escx=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const cleanPhone=p=>String(p||'').replace(/[^0-9+]/g,'');
  const fmtTime=t=>{if(!t)return '—';const [h,m]=String(t).slice(0,5).split(':').map(Number);const d=new Date();d.setHours(h,m||0,0,0);return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});};
  const today=()=>new Date().toISOString().slice(0,10);
  const isPaid=p=>p.status==='paid';
  const paidAmount=p=>isPaid(p)?(p.payment_type==='refund'?-Number(p.amount||0):Number(p.amount||0)):0;

  function injectStyles(){
    if(qs('#crmBusinessUpgradeStyles'))return;
    const s=document.createElement('style');s.id='crmBusinessUpgradeStyles';s.textContent=`
      .crm-today{margin:0 0 22px}.crm-today-head,.crm-pipeline-head,.crm-money-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.crm-today-head h3,.crm-pipeline-head h3,.crm-money-head h3{margin:0}.crm-today-head small,.crm-pipeline-head small,.crm-money-head small{color:#89919c}
      .crm-today-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.crm-today-card{background:linear-gradient(180deg,#12151a,#0e1014);border:1px solid #2b3037;border-radius:10px;padding:15px}.crm-today-card strong{display:block;font-size:24px;margin:4px 0}.crm-today-card span{font-size:11px;color:#9ba3ad;text-transform:uppercase;letter-spacing:.07em}.crm-today-card small{color:#727b86}.crm-today-list{margin-top:12px;border-top:1px solid #272c33;padding-top:8px}.crm-today-item{display:flex;justify-content:space-between;gap:10px;padding:7px 0;font-size:12px}.crm-today-item em{font-style:normal;color:#8d96a1;white-space:nowrap}
      .crm-pipeline-section{margin-top:22px}.crm-pipeline{display:grid;grid-template-columns:repeat(6,minmax(190px,1fr));gap:10px;overflow-x:auto;padding-bottom:8px}.crm-stage{min-width:190px;background:#0d0f12;border:1px solid #2b3037;border-radius:10px;padding:10px}.crm-stage-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#aab1ba}.crm-stage-title b{background:#1d2127;color:#fff;border-radius:999px;min-width:22px;height:22px;display:grid;place-items:center;font-size:10px}.crm-lead-card{width:100%;display:block;text-align:left;background:#14171c;border:1px solid #30353d;border-radius:8px;color:#f5f7fa;padding:10px;margin:0 0 8px;cursor:pointer}.crm-lead-card:hover{border-color:#ef1b20;background:#181b21}.crm-lead-card strong{display:block;font-size:12px}.crm-lead-card small{display:block;color:#8f98a3;margin-top:4px}.crm-lead-card .amount{color:#d9dde2;font-weight:700;margin-top:6px}
      .crm-money-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0 0 16px}.crm-money-card{background:#101318;border:1px solid #2c3138;border-radius:10px;padding:15px}.crm-money-card span{display:block;color:#8e97a2;font-size:10px;text-transform:uppercase;letter-spacing:.08em}.crm-money-card strong{display:block;font-size:22px;margin-top:5px}.crm-money-card small{color:#747d87}
      .crm-customer-view{width:min(980px,94vw);max-height:90vh;padding:0;background:#0d0f12;color:#f5f7fa;border:1px solid #343a43;border-radius:12px}.crm-customer-view::backdrop{background:rgba(0,0,0,.72)}.crm-customer-view header{position:sticky;top:0;z-index:2;background:#101318;border-bottom:1px solid #2c3138;padding:18px 22px;display:flex;align-items:flex-start;justify-content:space-between}.crm-customer-view header h2{margin:2px 0 4px}.crm-customer-view header small{color:#929aa4}.crm-profile-body{padding:20px 22px 26px}.crm-profile-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}.crm-profile-actions a,.crm-profile-actions button{background:#15181d;border:1px solid #343a43;color:#fff;border-radius:7px;padding:9px 12px;text-decoration:none;cursor:pointer}.crm-profile-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}.crm-profile-kpi{background:#111419;border:1px solid #2e333b;border-radius:9px;padding:12px}.crm-profile-kpi span{display:block;color:#89929d;font-size:10px;text-transform:uppercase}.crm-profile-kpi strong{font-size:18px}.crm-profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.crm-profile-section{background:#101318;border:1px solid #2d3239;border-radius:10px;padding:14px}.crm-profile-section h4{margin:0 0 10px}.crm-profile-row{padding:9px 0;border-top:1px solid #252a31;font-size:12px}.crm-profile-row:first-of-type{border-top:0}.crm-profile-row strong{display:block}.crm-profile-row small{color:#8f98a3}.crm-view-customer{white-space:nowrap}
      @media(max-width:1050px){.crm-today-grid,.crm-money-summary{grid-template-columns:1fr 1fr}.crm-profile-kpis{grid-template-columns:1fr 1fr}}@media(max-width:700px){.crm-today-grid,.crm-money-summary,.crm-profile-kpis,.crm-profile-grid{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  function customerMoney(customerId){
    const payments=(state.payments||[]).filter(p=>p.customer_id===customerId);
    const collected=payments.reduce((n,p)=>n+paidAmount(p),0);
    const bookings=(state.bookings||[]).filter(b=>b.customer_id===customerId&&!['cancelled','no_show'].includes(b.status));
    const bookingTotal=bookings.reduce((n,b)=>n+Number(b.total_amount||b.quoted_price||0),0);
    const unlinkedJobs=(state.jobs||[]).filter(j=>j.customer_id===customerId&&!j.booking_id&&!['cancelled','no_show'].includes(j.status));
    const jobTotal=unlinkedJobs.reduce((n,j)=>n+Number(j.total_amount||0),0);
    return{collected,total:bookingTotal+jobTotal,balance:Math.max(0,bookingTotal+jobTotal-collected)};
  }

  function renderToday(){
    const dash=qs('#dashboardView');if(!dash)return;
    let box=qs('#crmToday');if(!box){box=document.createElement('section');box.id='crmToday';box.className='crm-today';const stats=qs('.stats',dash);if(stats)stats.after(box);else dash.prepend(box);}
    const d=today();
    const todays=(state.bookings||[]).filter(b=>b.appointment_date===d&&!['cancelled','no_show'].includes(b.status));
    const needsConfirm=(state.bookings||[]).filter(b=>b.appointment_date>=d&&!b.appointment_confirmed&&!['cancelled','completed','no_show'].includes(b.status));
    const unpaid=(state.bookings||[]).filter(b=>b.appointment_date>=d&&!['cancelled','completed','no_show'].includes(b.status)&&Number(b.total_amount||b.quoted_price||0)>0&&Number(b.deposit_amount||0)<=0);
    const now=Date.now();
    const follow=(state.quotes||[]).filter(q=>['sent','draft'].includes(q.status)&&((q.follow_up_due_at&&new Date(q.follow_up_due_at).getTime()<=now)||(q.status==='sent'&&!q.last_follow_up_at)));
    const listTodays=todays.slice(0,4).map(b=>{const c=customerById(b.customer_id);return `<div class="crm-today-item"><span>${escx(customerName(c))}</span><em>${fmtTime(b.appointment_time)}</em></div>`}).join('')||'<div class="crm-today-item"><span>Nothing scheduled</span></div>';
    const listConfirm=needsConfirm.slice(0,4).map(b=>`<div class="crm-today-item"><span>${escx(customerName(customerById(b.customer_id)))}</span><em>${dateFmt(b.appointment_date)}</em></div>`).join('')||'<div class="crm-today-item"><span>All caught up</span></div>';
    box.innerHTML=`<div class="crm-today-head"><div><h3>Today</h3><small>Your shop priorities at a glance</small></div><small>${new Date().toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}</small></div><div class="crm-today-grid">
      <article class="crm-today-card"><span>Today's Appointments</span><strong>${todays.length}</strong><small>scheduled today</small><div class="crm-today-list">${listTodays}</div></article>
      <article class="crm-today-card"><span>Needs Confirmation</span><strong>${needsConfirm.length}</strong><small>upcoming appointments</small><div class="crm-today-list">${listConfirm}</div></article>
      <article class="crm-today-card"><span>No Deposit</span><strong>${unpaid.length}</strong><small>upcoming with $0 deposit</small></article>
      <article class="crm-today-card"><span>Quote Follow-ups</span><strong>${follow.length}</strong><small>customers to contact</small></article>
    </div>`;
  }

  function stageForCustomer(c){
    const jobs=(state.jobs||[]).filter(x=>x.customer_id===c.id);
    const bookings=(state.bookings||[]).filter(x=>x.customer_id===c.id);
    const quotes=(state.quotes||[]).filter(x=>x.customer_id===c.id);
    if(jobs.some(j=>j.status==='in_progress'))return'inprogress';
    if(jobs.some(j=>j.status==='completed')||bookings.some(b=>b.status==='completed'))return'completed';
    if(bookings.some(b=>!['cancelled','completed','no_show'].includes(b.status)))return'booked';
    if(quotes.some(q=>q.follow_up_count>0||q.last_follow_up_at))return'followup';
    if(quotes.some(q=>q.status==='sent'||q.sent_at))return'quoted';
    return'new';
  }
  function ensurePipeline(){
    let view=qs('#pipelineView');if(!view){view=document.createElement('section');view.id='pipelineView';view.className='view';view.innerHTML='<div class="panel"><div class="panel-head"><h3>Sales Pipeline</h3><small class="muted">Click any customer to open their profile</small></div><div id="crmPipelineWrap" style="padding:16px"></div></div>';qs('.main')?.appendChild(view);}
    const nav=qs('#nav');if(nav&&!qs('[data-business-pipeline]',nav)){
      const b=document.createElement('button');b.type='button';b.className='nav-item';b.dataset.businessPipeline='1';b.textContent='Pipeline';
      b.onclick=()=>{qsa('.nav-item').forEach(x=>x.classList.remove('active'));b.classList.add('active');qsa('.view').forEach(x=>x.classList.remove('active'));view.classList.add('active');const t=qs('#pageTitle');if(t)t.textContent='Pipeline';renderPipeline();};
      const customers=qs('[data-view="customers"]',nav);if(customers)customers.after(b);else nav.appendChild(b);
    }
  }
  function renderPipeline(){
    const wrap=qs('#crmPipelineWrap');if(!wrap)return;
    const stages=[['new','New Lead'],['quoted','Quote Sent'],['followup','Follow-up'],['booked','Booked'],['inprogress','In Progress'],['completed','Completed']];
    const groups=Object.fromEntries(stages.map(([k])=>[k,[]]));
    (state.customers||[]).forEach(c=>groups[stageForCustomer(c)].push(c));
    wrap.innerHTML=`<div class="crm-pipeline-head"><div><h3>Customer Pipeline</h3><small>${state.customers.length} customers across your current workflow</small></div></div><div class="crm-pipeline">${stages.map(([key,label])=>`<section class="crm-stage"><div class="crm-stage-title"><span>${label}</span><b>${groups[key].length}</b></div>${groups[key].slice(0,25).map(c=>{const m=customerMoney(c.id);const b=(state.bookings||[]).filter(x=>x.customer_id===c.id).at(-1);const q=(state.quotes||[]).filter(x=>x.customer_id===c.id).at(-1);const vehicle=b?[b.vehicle_year,b.vehicle_make,b.vehicle_model].filter(Boolean).join(' '):q?[q.vehicle_year,q.vehicle_make,q.vehicle_model].filter(Boolean).join(' '):'';return `<button class="crm-lead-card" data-customer-profile="${c.id}"><strong>${escx(customerName(c))}</strong><small>${escx(vehicle||c.phone||'No vehicle yet')}</small>${m.total?`<small class="amount">${money(m.total)}</small>`:''}</button>`}).join('')||'<div class="empty">No customers</div>'}</section>`).join('')}</div>`;
  }

  function decorateCustomerRows(){
    qsa('#customersTable tbody tr').forEach(row=>{
      if(qs('.crm-view-customer',row))return;
      const cells=qsa('td',row);if(cells.length<2)return;
      const name=cells[0].textContent.trim(),phone=cells[1].textContent.trim();
      const c=(state.customers||[]).find(x=>customerName(x)===name&&String(x.phone||'').trim()===phone)||(state.customers||[]).find(x=>customerName(x)===name);
      if(!c)return;const actions=qs('.table-actions',row);if(!actions)return;
      const btn=document.createElement('button');btn.type='button';btn.className='crm-view-customer';btn.textContent='View Profile';btn.onclick=()=>openCustomerProfile(c.id);actions.prepend(btn);
    });
  }

  function ensureProfileDialog(){
    let d=qs('#crmCustomerProfile');if(d)return d;
    d=document.createElement('dialog');d.id='crmCustomerProfile';d.className='crm-customer-view';d.innerHTML='<header><div><small>EM TINTING CUSTOMER</small><h2 id="crmProfileName">Customer</h2><small id="crmProfileContact"></small></div><button type="button" class="x" id="crmProfileClose">×</button></header><div class="crm-profile-body" id="crmProfileBody"></div>';
    document.body.appendChild(d);qs('#crmProfileClose',d).onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d)d.close()});return d;
  }
  function rowsHtml(items,render,empty='Nothing here yet'){return items.length?items.map(render).join(''):`<div class="empty">${empty}</div>`;}
  async function openCustomerProfile(id){
    const c=(state.customers||[]).find(x=>x.id===id);if(!c)return toast('Customer not found');const d=ensureProfileDialog(),body=qs('#crmProfileBody',d);qs('#crmProfileName',d).textContent=customerName(c);qs('#crmProfileContact',d).textContent=[c.phone,c.email,c.company].filter(Boolean).join(' · ');
    const bookings=(state.bookings||[]).filter(x=>x.customer_id===id).sort((a,b)=>String(b.appointment_date).localeCompare(String(a.appointment_date)));
    const quotes=(state.quotes||[]).filter(x=>x.customer_id===id).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
    const jobs=(state.jobs||[]).filter(x=>x.customer_id===id).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
    const payments=(state.payments||[]).filter(x=>x.customer_id===id).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
    const m=customerMoney(id);const vehicles=[...new Set(bookings.map(b=>[b.vehicle_year,b.vehicle_make,b.vehicle_model,b.vehicle_color].filter(Boolean).join(' ')).filter(Boolean))];
    body.innerHTML=`<div class="crm-profile-actions"><a href="tel:${cleanPhone(c.phone)}">Call</a><a href="sms:${cleanPhone(c.phone)}">Text</a>${c.email?`<a href="mailto:${escx(c.email)}">Email</a>`:''}<button type="button" id="crmProfileNewAppt">New Appointment</button></div><div class="crm-profile-kpis"><div class="crm-profile-kpi"><span>Lifetime Billed</span><strong>${money(m.total)}</strong></div><div class="crm-profile-kpi"><span>Collected</span><strong>${money(m.collected)}</strong></div><div class="crm-profile-kpi"><span>Balance</span><strong>${money(m.balance)}</strong></div><div class="crm-profile-kpi"><span>Appointments</span><strong>${bookings.length}</strong></div></div><div class="crm-profile-grid">
      <section class="crm-profile-section"><h4>Vehicles</h4>${rowsHtml(vehicles,v=>`<div class="crm-profile-row"><strong>${escx(v)}</strong></div>`,'No vehicles saved')}</section>
      <section class="crm-profile-section"><h4>Appointments</h4>${rowsHtml(bookings.slice(0,8),b=>`<div class="crm-profile-row"><strong>${dateFmt(b.appointment_date)} · ${escx(b.service||'Service')}</strong><small>${escx([b.vehicle_year,b.vehicle_make,b.vehicle_model].filter(Boolean).join(' '))} · ${escx(b.status||'')}</small></div>`,'No appointments')}</section>
      <section class="crm-profile-section"><h4>Quotes</h4>${rowsHtml(quotes.slice(0,8),q=>`<div class="crm-profile-row"><strong>${escx(q.service||'Quote')} · ${money(q.amount)}</strong><small>${escx(q.film_package||'')} · ${escx(q.status||'')}</small></div>`,'No quotes')}</section>
      <section class="crm-profile-section"><h4>Payments</h4>${rowsHtml(payments.slice(0,8),p=>`<div class="crm-profile-row"><strong>${money(p.amount)} · ${escx((p.method||'').replaceAll('_',' '))}</strong><small>${escx(p.payment_type||'payment')} · ${escx(p.status||'')}</small></div>`,'No payments')}</section>
      <section class="crm-profile-section"><h4>Jobs</h4>${rowsHtml(jobs.slice(0,8),j=>`<div class="crm-profile-row"><strong>${escx(j.service||'Job')} · ${money(j.total_amount)}</strong><small>${escx(j.status||'')} ${j.scheduled_date?'· '+dateFmt(j.scheduled_date):''}</small></div>`,'No jobs')}</section>
      <section class="crm-profile-section"><h4>Warranty & Communication</h4><div id="crmProfileRemote" class="empty">Loading history...</div></section>
    </div>`;
    qs('#crmProfileNewAppt',body).onclick=()=>{d.close();const btn=qs('[data-view="bookings"]');btn?.click();setTimeout(()=>{qs('[data-open="appointmentModal"]')?.click();setTimeout(()=>{const sel=qs('#apptExistingCustomer');if(sel){sel.value=id;sel.dispatchEvent(new Event('change'));}},50);},50);};
    d.showModal();
    try{
      const [w,e]=await Promise.all([db.from('warranties').select('id,film_package,shade,installation_date,warranty_status').eq('customer_id',id).order('installation_date',{ascending:false}).limit(5),db.from('crm_email_history').select('email_type,subject,sent_at').eq('customer_id',id).order('sent_at',{ascending:false}).limit(5)]);
      const remote=qs('#crmProfileRemote',body);if(remote)remote.innerHTML=`<strong style="display:block;margin-bottom:6px">Warranties</strong>${rowsHtml(w.data||[],x=>`<div class="crm-profile-row"><strong>${escx(x.film_package||'HITEK')}</strong><small>${escx(x.shade||'')} ${x.installation_date?'· '+dateFmt(x.installation_date):''}</small></div>`,'No warranty yet')}<strong style="display:block;margin:12px 0 6px">Recent Emails</strong>${rowsHtml(e.data||[],x=>`<div class="crm-profile-row"><strong>${escx(x.subject||x.email_type||'Email')}</strong><small>${x.sent_at?new Date(x.sent_at).toLocaleString():''}</small></div>`,'No email history')}`;
    }catch(_){const remote=qs('#crmProfileRemote',body);if(remote)remote.textContent='History unavailable';}
  }

  function renderMoneySummary(){
    const view=qs('#paymentsView');if(!view)return;let wrap=qs('#crmMoneySummary');if(!wrap){wrap=document.createElement('section');wrap.id='crmMoneySummary';wrap.className='crm-money-summary';const panel=qs('.panel',view);panel?.before(wrap);}
    const now=new Date(),month=now.getMonth(),year=now.getFullYear();
    const monthPayments=(state.payments||[]).filter(p=>{const d=new Date(p.paid_at||p.created_at);return isPaid(p)&&d.getMonth()===month&&d.getFullYear()===year});
    const collected=monthPayments.reduce((n,p)=>n+paidAmount(p),0),deposits=monthPayments.filter(p=>p.payment_type==='deposit').reduce((n,p)=>n+Number(p.amount||0),0),refunds=monthPayments.filter(p=>p.payment_type==='refund').reduce((n,p)=>n+Number(p.amount||0),0);
    const open=(state.bookings||[]).filter(b=>!['cancelled','completed','no_show'].includes(b.status));
    const outstanding=open.reduce((n,b)=>{const total=Number(b.total_amount||b.quoted_price||0);const linked=(state.payments||[]).filter(p=>p.booking_id===b.id&&isPaid(p)).reduce((s,p)=>s+paidAmount(p),0);const paid=linked||Number(b.deposit_amount||0);return n+Math.max(0,total-paid)},0);
    wrap.innerHTML=`<article class="crm-money-card"><span>Collected This Month</span><strong>${money(collected)}</strong><small>net of refunds</small></article><article class="crm-money-card"><span>Deposits This Month</span><strong>${money(deposits)}</strong><small>paid deposits</small></article><article class="crm-money-card"><span>Refunds This Month</span><strong>${money(refunds)}</strong><small>refunds recorded</small></article><article class="crm-money-card"><span>Estimated Outstanding</span><strong>${money(outstanding)}</strong><small>open appointment balances</small></article>`;
  }

  function sync(){injectStyles();ensurePipeline();renderToday();renderPipeline();renderMoneySummary();decorateCustomerRows();}
  document.addEventListener('click',e=>{const card=e.target.closest('[data-customer-profile]');if(card)openCustomerProfile(card.dataset.customerProfile);const nav=e.target.closest('[data-view]');if(nav)setTimeout(sync,30);});
  qs('#customerSearch')?.addEventListener('input',()=>setTimeout(decorateCustomerRows,20));
  qs('#refreshBtn')?.addEventListener('click',()=>setTimeout(sync,900));
  window.openCustomerProfile=openCustomerProfile;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,300));else setTimeout(sync,300);
  window.addEventListener('load',()=>{setTimeout(sync,800);setTimeout(sync,1800)});
})();