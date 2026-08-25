(()=>{
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc2=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clean=p=>String(p||'').replace(/[^0-9+]/g,'');
  const fmtTime=t=>{if(!t)return '—';const [h,m]=String(t).slice(0,5).split(':').map(Number);const d=new Date();d.setHours(h,m||0,0,0);return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});};

  function modernSidebar(){
    const nav=qs('#nav'); if(!nav||nav.dataset.modernized)return; nav.dataset.modernized='1';
    const original=qsa('.nav-item[data-view]',nav);
    nav.innerHTML='';
    const group=t=>{const x=document.createElement('div');x.className='crm-nav-group';x.textContent=t;nav.appendChild(x);};
    const addExisting=(view,label)=>{const b=original.find(x=>x.dataset.view===view);if(!b)return;b.textContent=label||b.textContent;nav.appendChild(b);};
    const custom=(label,fn,badge)=>{const b=document.createElement('button');b.type='button';b.className='nav-item';b.innerHTML=`${label}${badge?` <span class="crm-nav-badge">${badge}</span>`:''}`;b.onclick=fn;nav.appendChild(b);};
    group('MAIN'); addExisting('dashboard'); addExisting('bookings','Appointments'); addExisting('quotes','Quotes'); addExisting('customers','Customers');
    group('COMMUNICATION'); custom('Follow-up Center',()=>{qs('[data-view="dashboard"]')?.click();setTimeout(()=>qs('#growthPanel')?.scrollIntoView({behavior:'smooth'}),100)},'•'); custom('Reminders',()=>qs('[data-view="bookings"]')?.click()); custom('Review Requests',()=>{qs('[data-view="dashboard"]')?.click();setTimeout(()=>qs('#growthPanel')?.scrollIntoView({behavior:'smooth'}),100)});
    group('FINANCIAL'); addExisting('payments','Payments'); custom('Deposits',()=>qs('[data-view="payments"]')?.click());
    group('REPORTS'); addExisting('jobs','Jobs'); custom('Reports',()=>toast('Reports dashboard coming next')); custom('Analytics',()=>toast('Analytics dashboard coming next'));
  }

  function modernTopbar(){
    const top=qs('.topbar'); if(!top||top.dataset.modernized)return; top.dataset.modernized='1';
    const left=qs('.topbar>div'); if(left&&!qs('.crm-global-search')){const input=document.createElement('input');input.className='crm-global-search';input.placeholder='Search customers, appointments, quotes...';input.addEventListener('keydown',e=>{if(e.key==='Enter'&&input.value.trim()){qs('[data-view="bookings"]')?.click();const s=qs('#bookingSearch');if(s){s.value=input.value.trim();s.dispatchEvent(new Event('input'));}}});left.prepend(input);}
  }

  function enhanceDashboard(){
    const dash=qs('#dashboardView'); if(!dash)return;
    dash.classList.add('crm-modern-dashboard');
    const stats=qs('.stats',dash); if(stats) stats.classList.add('crm-modern-stats');
  }

  function enhanceBookingButtons(){
    qsa('#bookingsTable tbody tr').forEach(row=>{
      const actions=qs('.table-actions',row); if(!actions||actions.dataset.details)return;
      const check=qsa('button',actions).find(b=>(b.getAttribute('onclick')||'').includes("checkIn('")); if(!check)return;
      const m=(check.getAttribute('onclick')||'').match(/checkIn\('([^']+)'\)/); if(!m)return;
      const id=m[1], booking=(state.bookings||[]).find(b=>b.id===id); if(!booking)return;
      const btn=document.createElement('button');btn.type='button';btn.textContent='View Details';btn.className='crm-view-btn';btn.onclick=()=>openAppointmentWorkspace(id);actions.prepend(btn);actions.dataset.details='1';
    });
  }

  async function getWarranties(customerId){const {data,error}=await db.from('warranties').select('*').eq('customer_id',customerId).order('installation_date',{ascending:false});return error?[]:(data||[]);}

  function warrantyCardHTML(w,c,b){
    const vin=w?.vin||b?.vin||'—';
    return `<div class="crm-card-head"><div><div class="crm-hitek">HITEK</div><small>AUTOMOTIVE WINDOW FILM</small></div><div class="crm-lifetime">LIFETIME WARRANTY<br><small>HITEK E-WARRANTY</small></div></div><div class="crm-card-body"><dl class="crm-card-fields"><dt>CUSTOMER:</dt><dd>${esc2(customerName(c))}</dd><dt>VEHICLE:</dt><dd>${esc2([w?.vehicle_year||b?.vehicle_year,w?.vehicle_make||b?.vehicle_make,w?.vehicle_model||b?.vehicle_model].filter(Boolean).join(' ')||'—')}</dd><dt>VIN #:</dt><dd>${esc2(vin)}</dd><dt>FILM TYPE:</dt><dd>${esc2(w?.film_package||b?.tint_package||'—')}</dd><dt>SHADE:</dt><dd>${esc2(w?.shade||'—')}</dd><dt>INSTALL DATE:</dt><dd>${esc2(w?.installation_date?dateFmt(w.installation_date):'—')}</dd><dt>DEALER:</dt><dd>EM Tinting</dd><dt>ROLL #:</dt><dd>${esc2(w?.film_roll_number||'—')}</dd></dl><div class="crm-card-copy"><strong>HITEK LIMITED LIFETIME WARRANTY</strong><p>Professionally installed HITEK automotive window film is covered according to HITEK's published warranty terms and applicable law.</p><div style="font-size:28px;font-weight:900;font-style:italic;margin-top:30px">HITEK</div><div style="color:#ef1b20;font-weight:800">AUTHORIZED DEALER</div></div></div><div class="crm-card-footer">COAST TO COAST WARRANTY &nbsp; | &nbsp; HITEKFILMS.COM</div>`;
  }

  async function openAppointmentWorkspace(id){
    const b=(state.bookings||[]).find(x=>x.id===id); if(!b)return toast('Appointment not found'); const c=customerById(b.customer_id); if(!c)return;
    const bookingsView=qs('#bookingsView'); if(!bookingsView)return;
    let detail=qs('#crmAppointmentDetail'); if(!detail){detail=document.createElement('section');detail.id='crmAppointmentDetail';detail.className='crm-appointment-detail';bookingsView.appendChild(detail);}
    const panel=qs('#bookingsView>.panel'); if(panel)panel.style.display='none'; detail.classList.add('active');
    const ws=await getWarranties(c.id); const w=ws[0]||null;
    detail.innerHTML=`<button class="crm-back-btn" id="crmBackAppointments">← Back to appointments</button><div class="crm-breadcrumb">Appointments &nbsp;›&nbsp; ${esc2(customerName(c))}</div><div class="crm-detail-grid"><section class="crm-appt-card"><div class="crm-appt-title"><h2>Appointment</h2><span class="crm-confirmed">${esc2(b.appointment_confirmed?'Confirmed':b.status)}</span></div><div class="crm-appt-meta"><div><small>Date</small>${dateFmt(b.appointment_date)}</div><div><small>Time</small>${fmtTime(b.appointment_time)}</div><div><small>Customer</small>${esc2(customerName(c))}</div><div><small>Phone</small>${esc2(c.phone||'—')}</div><div><small>Vehicle</small>${esc2([b.vehicle_year,b.vehicle_make,b.vehicle_model].filter(Boolean).join(' ')||'—')}</div><div><small>Service</small>${esc2(b.service||'—')}</div></div></section><section class="crm-action-card"><button onclick="window.openAppointmentText('${id}','confirmation')">Text Confirmation</button><button onclick="window.openAppointmentText('${id}','reminder')">24h Reminder</button><button onclick="window.openAppointmentText('${id}','reschedule')">Text Reschedule</button><button onclick="window.openAppointmentText('${id}','cancellation')">Text Cancellation</button><button onclick="checkIn('${id}')">Check-in</button><button onclick="checkOut('${id}')">Check-out</button><button class="danger" onclick="window.cancelAppointment('${id}')">Cancel Appointment</button></section></div><div class="crm-tabs"><button class="crm-tab" data-tab="details">Details</button><button class="crm-tab" data-tab="services">Services</button><button class="crm-tab" data-tab="payments">Payments</button><button class="crm-tab active" data-tab="warranty">E-Warranty (HITEK)</button><button class="crm-tab" data-tab="notes">Notes</button><button class="crm-tab" data-tab="activity">Activity</button></div><div id="crmTab_details" class="crm-tab-panel"><div class="crm-section-placeholder">Customer and vehicle details are shown above.</div></div><div id="crmTab_services" class="crm-tab-panel"><div class="crm-section-placeholder">${esc2(b.service||'No services listed')}</div></div><div id="crmTab_payments" class="crm-tab-panel"><div class="crm-section-placeholder">Deposit: ${money(b.deposit_amount||0)} &nbsp; · &nbsp; Total: ${money(b.total_amount||b.quoted_price||0)}</div></div><div id="crmTab_warranty" class="crm-tab-panel active"><div class="crm-ewarranty-layout"><aside class="crm-ewarranty-left"><h3>HITEK E-WARRANTY</h3><div class="crm-green">Lifetime Warranty</div><p class="muted">Create and manage HITEK warranty records for this customer.</p><button class="btn primary crm-warranty-create" id="crmCreateWarranty">+ Create HITEK Warranty</button><div class="crm-existing"><strong>EXISTING WARRANTIES</strong><div id="crmWarrantyList">${ws.length?ws.map(x=>`<div class="crm-warranty-item"><strong>${esc2(x.film_package||'HITEK Film')}</strong><small>${esc2(x.shade||'')} · ${x.installation_date?dateFmt(x.installation_date):''}</small></div>`).join(''):'<div class="empty">No warranty yet</div>'}</div></div></aside><section class="crm-ewarranty-card" id="crmWarrantyCard">${w?warrantyCardHTML(w,c,b):`<div class="empty" style="padding:80px 20px">Create a HITEK warranty to generate the warranty card.</div>`}</section><aside class="crm-ewarranty-actions"><button id="crmPrintWarranty">Print</button><button id="crmTextWarranty">Text Customer</button><a href="https://hitekfilms.com/e-warranty/" target="_blank" rel="noopener">Open Official HITEK E-Warranty</a></aside></div></div><div id="crmTab_notes" class="crm-tab-panel"><div class="crm-section-placeholder">${esc2(b.notes||'No notes')}</div></div><div id="crmTab_activity" class="crm-tab-panel"><div class="crm-section-placeholder">Appointment created ${b.created_at?new Date(b.created_at).toLocaleString():'—'}</div></div>`;
    qs('#crmBackAppointments').onclick=()=>{detail.classList.remove('active');if(panel)panel.style.display='';};
    qsa('.crm-tab',detail).forEach(t=>t.onclick=()=>{qsa('.crm-tab',detail).forEach(x=>x.classList.remove('active'));qsa('.crm-tab-panel',detail).forEach(x=>x.classList.remove('active'));t.classList.add('active');qs(`#crmTab_${t.dataset.tab}`,detail)?.classList.add('active');});
    qs('#crmCreateWarranty').onclick=()=>openWarrantyForm(b,c,detail);
    qs('#crmPrintWarranty').onclick=()=>window.print();
    qs('#crmTextWarranty').onclick=()=>{if(!c.phone)return toast('Customer phone missing');location.href=`sms:${clean(c.phone)}?body=${encodeURIComponent(`Hi ${c.first_name||'there'}, your HITEK warranty record from EM Tinting is on file for your ${[b.vehicle_year,b.vehicle_make,b.vehicle_model].filter(Boolean).join(' ')}.`)}`;};
  }

  function openWarrantyForm(b,c,detail){
    const card=qs('#crmWarrantyCard',detail); if(!card)return;
    card.innerHTML=`<form id="crmWarrantyForm" class="crm-warranty-form" style="padding:22px"><label>Film Type / Series<select id="cwFilm"><option>Standard</option><option>Hybrid</option><option>PPF Pro</option><option>PPF Ultra</option><option selected>Ceramic IR</option><option>Ceramic Plus</option><option>Carbon IR</option><option>Ceramic Black</option><option>Ceramic Ultra</option><option>Classic</option></select></label><label>Shade (%)<input id="cwShade" placeholder="20%"></label><label>Coverage<input id="cwCoverage" placeholder="Full vehicle"></label><label>Installation Date<input id="cwDate" type="date" value="${new Date().toISOString().slice(0,10)}"></label><label>Film Roll #<input id="cwRoll"></label><label>VIN #<input id="cwVin" value="${esc2(b.vin||'')}"></label><label>Customer Address<input id="cwAddress"></label><label>City<input id="cwCity" value="Houston"></label><label>State<input id="cwState" value="TX"></label><label>ZIP Code<input id="cwZip"></label><button class="btn primary span2" type="submit">Save HITEK Warranty</button></form>`;
    qs('#crmWarrantyForm',card).onsubmit=async e=>{e.preventDefault();const payload={customer_id:c.id,booking_id:b.id,vehicle_year:b.vehicle_year,vehicle_make:b.vehicle_make,vehicle_model:b.vehicle_model,vin:qs('#cwVin').value.trim()||null,film_brand:'HITEK',film_package:qs('#cwFilm').value,shade:qs('#cwShade').value.trim()||null,coverage:qs('#cwCoverage').value.trim()||null,installation_date:qs('#cwDate').value,film_roll_number:qs('#cwRoll').value.trim()||null,customer_address:qs('#cwAddress').value.trim()||null,customer_city:qs('#cwCity').value.trim()||null,customer_state:qs('#cwState').value.trim()||null,customer_zip:qs('#cwZip').value.trim()||null,warranty_status:'active',dealer_name:'EM Tinting'};const {error}=await db.from('warranties').insert(payload);if(error)return toast(error.message);toast('HITEK warranty saved');openAppointmentWorkspace(b.id);};
  }

  function init(){modernSidebar();modernTopbar();enhanceDashboard();enhanceBookingButtons();const target=qs('#bookingsTable');if(target)new MutationObserver(enhanceBookingButtons).observe(target,{childList:true,subtree:true});}
  init(); setTimeout(init,500); setTimeout(init,1500);
})();