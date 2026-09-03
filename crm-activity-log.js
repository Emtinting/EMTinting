(()=>{
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const norm=v=>String(v||'').replace(/\D/g,'');
  const fmt=v=>v?new Date(v).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}):'—';
  const label=t=>String(t||'email').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase());
  const bookingFromVisible=()=>{
    let id=window.__crmWarrantyBookingId;try{id=id||sessionStorage.getItem('crmWarrantyBookingId');}catch(_){}
    let b=(state.bookings||[]).find(x=>x.id===id);if(b)return b;
    const detail=document.getElementById('crmAppointmentDetail');if(!detail)return null;
    const meta=key=>{const block=[...(detail.querySelectorAll('.crm-appt-meta>div')||[])].find(x=>x.querySelector('small')?.textContent.trim()===key);if(!block)return'';const c=block.cloneNode(true);c.querySelector('small')?.remove();return c.textContent.trim();};
    const date=meta('Date'),vehicle=meta('Vehicle'),phone=norm(meta('Phone'));
    return (state.bookings||[]).find(x=>{const c=customerById(x.customer_id),v=[x.vehicle_year,x.vehicle_make,x.vehicle_model].filter(Boolean).join(' ');return(!date||dateFmt(x.appointment_date)===date)&&(!vehicle||v===vehicle)&&(!phone||norm(c?.phone)===phone);})||null;
  };
  function ensureEmailModal(){
    let m=document.getElementById('crmEmailHistoryModal');if(m)return m;
    m=document.createElement('div');m.id='crmEmailHistoryModal';m.style.cssText='display:none;position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.78);padding:24px;overflow:auto;box-sizing:border-box';
    m.innerHTML='<div style="max-width:820px;margin:20px auto;background:#11151a;border:1px solid #343a43;border-radius:14px;overflow:hidden"><div style="display:flex;justify-content:space-between;gap:12px;align-items:center;padding:16px 18px;color:#fff;border-bottom:1px solid #30353d"><div><strong id="crmEmailHistoryTitle">Sent Email</strong><div id="crmEmailHistoryMeta" style="font-size:12px;color:#aeb6bf;margin-top:4px"></div></div><button type="button" id="crmEmailHistoryClose" style="background:#20242a;color:#fff;border:1px solid #555;border-radius:7px;padding:8px 12px">Close</button></div><iframe id="crmEmailHistoryFrame" title="Sent email" style="display:block;width:100%;height:720px;border:0;background:#fff"></iframe></div>';
    document.body.appendChild(m);m.querySelector('#crmEmailHistoryClose').onclick=()=>m.style.display='none';m.addEventListener('click',e=>{if(e.target===m)m.style.display='none';});return m;
  }
  function viewEmail(row){const m=ensureEmailModal();m.querySelector('#crmEmailHistoryTitle').textContent=row.subject||'Sent Email';m.querySelector('#crmEmailHistoryMeta').textContent=`${label(row.email_type)} · To ${row.recipient_email} · ${fmt(row.sent_at)}`;m.querySelector('#crmEmailHistoryFrame').srcdoc=row.html_body||`<pre style="font-family:Arial,sans-serif;white-space:pre-wrap;padding:24px">${esc(row.text_body||'No saved body')}</pre>`;m.style.display='block';}
  async function loadAppointmentActivity(id){
    if(!id)return;
    const detail=document.getElementById('crmAppointmentDetail');if(!detail)return;
    let panel=detail.querySelector('#crmActivityPanel');if(!panel){panel=document.createElement('section');panel.id='crmActivityPanel';panel.className='form-section';panel.style.marginTop='18px';detail.appendChild(panel);}
    panel.dataset.bookingId=id;panel.innerHTML='<h4>ACTIVITY & SENT EMAILS</h4><div class="empty">Loading activity…</div>';
    const [{data:activity,error:aErr},{data:emails,error:eErr}]=await Promise.all([
      db.from('crm_activity').select('*').eq('booking_id',id).order('created_at',{ascending:false}).limit(30),
      db.from('crm_email_history').select('*').eq('booking_id',id).order('sent_at',{ascending:false}).limit(20)
    ]);
    if(panel.dataset.bookingId!==id)return;
    if(aErr||eErr){panel.innerHTML=`<h4>ACTIVITY & SENT EMAILS</h4><div class="empty">${esc(aErr?.message||eErr?.message||'Could not load activity')}</div>`;return;}
    const acts=(activity||[]).map(a=>`<div class="list-item"><div><strong>${esc(label(a.activity_type))}</strong><small>${esc(a.description||'')} · ${esc(fmt(a.created_at))}</small></div></div>`).join('')||'<div class="empty">No activity logged yet.</div>';
    const em=(emails||[]).map((x,i)=>`<div class="list-item"><div><strong>${esc(label(x.email_type))}</strong><small>${esc(x.subject||'')} · ${esc(x.recipient_email||'')} · ${esc(fmt(x.sent_at))}</small></div><button type="button" class="btn ghost small" data-appt-email-index="${i}">View</button></div>`).join('')||'<div class="empty">No emails sent for this appointment yet.</div>';
    panel.innerHTML=`<h4>ACTIVITY</h4><div>${acts}</div><h4 style="margin-top:18px">SENT EMAILS</h4><div>${em}</div>`;
    panel.querySelectorAll('[data-appt-email-index]').forEach(btn=>btn.onclick=()=>viewEmail((emails||[])[Number(btn.dataset.apptEmailIndex)]));
  }
  window.refreshCrmActivity=id=>loadAppointmentActivity(id||bookingFromVisible()?.id);
  document.addEventListener('click',e=>{const v=e.target.closest?.('.crm-view-btn');if(!v)return;const row=v.closest('tr'),check=[...(row?.querySelectorAll('button')||[])].find(b=>(b.getAttribute('onclick')||'').includes("checkIn('")),m=(check?.getAttribute('onclick')||'').match(/checkIn\('([^']+)'\)/);if(m){window.__crmWarrantyBookingId=m[1];try{sessionStorage.setItem('crmWarrantyBookingId',m[1]);}catch(_){}setTimeout(()=>loadAppointmentActivity(m[1]),250);}},true);

  async function renderGlobalHistory(){
    const body=document.getElementById('crmEmailHistoryBody');if(!body)return;body.innerHTML='<div class="empty">Loading sent email history…</div>';
    const {data,error}=await db.from('crm_email_history').select('*').order('sent_at',{ascending:false}).limit(100);
    if(error){body.innerHTML=`<div class="empty">${esc(error.message)}</div>`;return;}
    const rows=data||[];body.innerHTML=rows.length?`<div class="table-wrap"><table><thead><tr><th>Sent</th><th>Customer</th><th>Type</th><th>Recipient</th><th>Subject</th><th>Action</th></tr></thead><tbody>${rows.map((x,i)=>{const c=customerById(x.customer_id);return `<tr><td>${esc(fmt(x.sent_at))}</td><td>${esc(c?customerName(c):'—')}</td><td>${esc(label(x.email_type))}</td><td>${esc(x.recipient_email)}</td><td>${esc(x.subject)}</td><td><button type="button" class="btn ghost small" data-global-email-index="${i}">View</button></td></tr>`;}).join('')}</tbody></table></div>`:'<div class="empty">No CRM emails have been logged yet.</div>';
    body.querySelectorAll('[data-global-email-index]').forEach(btn=>btn.onclick=()=>viewEmail(rows[Number(btn.dataset.globalEmailIndex)]));
  }
  function ensureGlobalView(){
    const nav=document.getElementById('nav');if(nav&&!nav.querySelector('[data-view="emailHistory"]')){const b=document.createElement('button');b.className='nav-item';b.dataset.view='emailHistory';b.textContent='Email History';nav.appendChild(b);b.addEventListener('click',()=>setTimeout(renderGlobalHistory,0));}
    if(!document.getElementById('emailHistoryView')){const main=document.querySelector('.main');const s=document.createElement('section');s.id='emailHistoryView';s.className='view';s.innerHTML='<div class="panel"><div class="panel-head"><div><h3>Sent Email History</h3><small class="muted">Confirmations, reminders, invoices, quotes and warranties sent by the CRM.</small></div><button type="button" class="btn ghost small" id="crmRefreshEmailHistory">Refresh</button></div><div id="crmEmailHistoryBody"></div></div>';main?.appendChild(s);s.querySelector('#crmRefreshEmailHistory').onclick=renderGlobalHistory;}
  }
  const obs=new MutationObserver(()=>{ensureGlobalView();const b=bookingFromVisible();const detail=document.getElementById('crmAppointmentDetail');if(b&&detail?.classList.contains('active')&&!detail.querySelector('#crmActivityPanel'))loadAppointmentActivity(b.id);});obs.observe(document.body,{childList:true,subtree:true});setTimeout(ensureGlobalView,700);
})();