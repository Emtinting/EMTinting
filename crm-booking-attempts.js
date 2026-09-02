(()=>{
  const qs=(s,r=document)=>r.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const cleanPhone=v=>String(v||'').replace(/[^0-9+]/g,'');
  const fmtWhen=v=>v?new Date(v).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'—';
  const isToday=v=>{if(!v)return false;const d=new Date(v),n=new Date();return d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth()&&d.getDate()===n.getDate();};
  let attempts=[];

  function ensureUI(){
    const dash=qs('#dashboardView');if(!dash)return null;
    let panel=qs('#bookingAttemptsPanel');
    if(!panel){
      panel=document.createElement('section');
      panel.id='bookingAttemptsPanel';panel.className='panel';panel.style.marginTop='22px';
      panel.innerHTML=`<div class="panel-head"><div><h3>Website Booking Attempts</h3><small class="muted">People who started your quote/booking form, even if they did not finish.</small></div><button id="refreshBookingAttempts" class="btn ghost small" type="button">Refresh leads</button></div><div id="bookingAttemptStats" class="stats" style="margin:0 0 18px"></div><div id="bookingAttemptsTable" class="table-wrap"><div class="empty">Loading booking attempts…</div></div>`;
      dash.appendChild(panel);
      qs('#refreshBookingAttempts').onclick=loadAttempts;
    }
    if(!qs('#bookingLeadsNav')){
      const nav=qs('#nav');
      if(nav){const b=document.createElement('button');b.id='bookingLeadsNav';b.type='button';b.className='nav-item';b.textContent='Booking Leads';b.onclick=()=>{qs('[data-view="dashboard"]')?.click();setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'start'}),100);};nav.appendChild(b);}
    }
    return panel;
  }

  function render(){
    ensureUI();
    const stats=qs('#bookingAttemptStats'),table=qs('#bookingAttemptsTable');if(!stats||!table)return;
    const today=attempts.filter(x=>isToday(x.first_seen_at)).length;
    const completed=attempts.filter(x=>x.completed).length;
    const abandoned=attempts.filter(x=>!x.completed&&x.last_event!=='error').length;
    stats.innerHTML=`<article><span>Today</span><strong>${today}</strong><small>started forms</small></article><article><span>Not Finished</span><strong>${abandoned}</strong><small>possible leads</small></article><article><span>Completed</span><strong>${completed}</strong><small>submitted</small></article>`;
    if(!attempts.length){table.innerHTML='<div class="empty">No website booking attempts yet. New form starts will appear here automatically.</div>';return;}
    const rows=attempts.map(a=>{
      const name=[a.first_name,a.last_name].filter(Boolean).join(' ')||'Anonymous visitor';
      const vehicle=[a.vehicle_year,a.vehicle_make,a.vehicle_model].filter(Boolean).join(' ')||a.vehicle_type||'—';
      const interest=[a.service,a.tint_coverage,a.tint_package,a.preferred_shade].filter(Boolean).join(' · ')||'Form started';
      const status=a.completed?'Completed':a.last_event==='error'?'Error':a.last_event==='submit_clicked'?'Submit clicked':'Not finished';
      const contact=[];
      if(a.phone){const p=cleanPhone(a.phone);contact.push(`<a href="tel:${p}">Call</a><a href="sms:${p}">Text</a>`);}
      if(a.email)contact.push(`<a href="mailto:${esc(a.email)}">Email</a>`);
      return `<tr><td><strong>${esc(name)}</strong><br><small>${esc(a.phone||a.email||'No contact entered yet')}</small></td><td>${esc(vehicle)}</td><td>${esc(interest)}</td><td>${esc(a.appointment_date||'—')} ${esc((a.appointment_time||'').slice(0,5))}</td><td><span class="pill ${a.completed?'confirmed':a.last_event==='error'?'cancelled':'pending'}">${esc(status)}</span><br><small>${esc(fmtWhen(a.last_seen_at))}</small></td><td><div class="table-actions">${contact.join('')||'<span class="muted">No contact yet</span>'}</div></td></tr>`;
    }).join('');
    table.innerHTML=`<table><thead><tr><th>Lead</th><th>Vehicle</th><th>Interested In</th><th>Preferred Time</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  async function loadAttempts(){
    ensureUI();
    const btn=qs('#refreshBookingAttempts');if(btn)btn.textContent='Loading…';
    try{
      const {data:{session}}=await db.auth.getSession();
      if(!session){if(btn)btn.textContent='Refresh leads';return;}
      const {data,error}=await db.from('booking_attempts').select('*').order('last_seen_at',{ascending:false}).limit(50);
      if(error)throw error;attempts=data||[];render();
    }catch(e){const table=qs('#bookingAttemptsTable');if(table)table.innerHTML=`<div class="empty">Unable to load booking attempts: ${esc(e.message||'Unknown error')}</div>`;}
    if(btn)btn.textContent='Refresh leads';
  }

  function init(){if(typeof db==='undefined')return;ensureUI();loadAttempts();qs('#refreshBtn')?.addEventListener('click',()=>setTimeout(loadAttempts,250));db.auth.onAuthStateChange((event)=>{if(event==='SIGNED_IN')setTimeout(loadAttempts,300);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,400));else setTimeout(init,400);
})();