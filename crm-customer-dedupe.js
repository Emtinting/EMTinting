(()=>{
  const normPhone=v=>String(v||'').replace(/\D/g,'');
  const normEmail=v=>String(v||'').trim().toLowerCase();
  const normName=c=>`${c?.first_name||''} ${c?.last_name||''}`.trim().toLowerCase().replace(/\s+/g,' ');
  const name=c=>`${c?.first_name||''} ${c?.last_name||''}`.trim()||'Customer';
  const exactDuplicate=(first,last,phone,email)=>{
    const n=`${first||''} ${last||''}`.trim().toLowerCase().replace(/\s+/g,' '),p=normPhone(phone),em=normEmail(email);
    return (state.customers||[]).find(c=>normName(c)===n&&((p&&normPhone(c.phone)===p)||(em&&normEmail(c.email)===em)))||null;
  };
  document.addEventListener('submit',e=>{
    const form=e.target;
    if(form?.id==='customerForm'){
      const dup=exactDuplicate(document.getElementById('customerFirst')?.value,document.getElementById('customerLast')?.value,document.getElementById('customerPhone')?.value,document.getElementById('customerEmail')?.value);
      if(dup&&confirm(`This looks like an existing customer: ${name(dup)} (${dup.phone||dup.email||''}).\n\nClick OK to open the existing customer instead. Click Cancel only if this is a separate person.`)){
        e.preventDefault();e.stopImmediatePropagation();document.getElementById('customerModal')?.close();setTimeout(()=>window.openCustomer360?.(dup.id)||window.openCustomerEditor?.(dup.id),50);
      }
    }
    if(form?.id==='appointmentForm'&&!document.getElementById('apptExistingCustomer')?.value){
      const dup=exactDuplicate(document.getElementById('apptFirst')?.value,document.getElementById('apptLast')?.value,document.getElementById('apptPhone')?.value,document.getElementById('apptEmail')?.value);
      if(dup&&confirm(`This customer already exists as ${name(dup)}.\n\nClick OK to attach this appointment to the existing customer instead of creating a duplicate.`)){
        const sel=document.getElementById('apptExistingCustomer');if(sel)sel.value=dup.id;
      }
    }
  },true);

  function duplicateGroups(){
    const customers=state.customers||[],seen=new Set(),groups=[];
    customers.forEach(c=>{
      if(seen.has(c.id))return;
      const p=normPhone(c.phone),em=normEmail(c.email);
      const group=customers.filter(x=>x.id!==c.id&&((p&&normPhone(x.phone)===p)||(em&&normEmail(x.email)===em)));
      if(group.length){const all=[c,...group].filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i);all.forEach(x=>seen.add(x.id));groups.push(all);}
    });
    return groups;
  }
  function ensureDialog(){
    let d=document.getElementById('crmDuplicateCustomers');if(d)return d;
    d=document.createElement('dialog');d.id='crmDuplicateCustomers';d.className='modal wide';
    d.innerHTML='<div><header><div><p class="eyebrow">CUSTOMER CLEANUP</p><h3>Possible Duplicate Customers</h3></div><button class="x" type="button" id="crmDupClose">×</button></header><div id="crmDupBody"></div></div>';
    document.body.appendChild(d);document.getElementById('crmDupClose').onclick=()=>d.close();return d;
  }
  async function merge(keep,dup,btn){
    if(!confirm(`Merge ${name(dup)} into ${name(keep)}?\n\nAppointments, quotes, jobs, payments, warranties and activity will move to the kept record. The duplicate record will then be deleted.`))return;
    const old=btn.textContent;btn.disabled=true;btn.textContent='Merging...';
    const {data,error}=await db.functions.invoke('merge-customers',{body:{keep_id:keep.id,merge_id:dup.id}});
    if(error||data?.error){btn.disabled=false;btn.textContent=old;return toast(data?.error||error?.message||'Could not merge customers');}
    toast('Duplicate customer merged');await loadAll();renderDuplicates();
  }
  function renderDuplicates(){
    const d=ensureDialog(),body=document.getElementById('crmDupBody'),groups=duplicateGroups();
    if(!groups.length){body.innerHTML='<div class="empty">No possible duplicate customers found.</div>';return;}
    body.innerHTML=groups.map((g,gi)=>{const sorted=[...g].sort((a,b)=>String(a.created_at||'').localeCompare(String(b.created_at||''))),keep=sorted[0];return `<section class="form-section" data-dup-group="${gi}"><h4>Possible match</h4>${sorted.map((c,i)=>`<div class="list-item"><div><strong>${name(c)}</strong><small>${c.phone||'—'} · ${c.email||'—'}${i===0?' · Oldest record':''}</small></div>${i===0?'<span class="pill confirmed">KEEP</span>':`<button type="button" class="btn ghost small" data-merge-index="${i}">Merge into oldest</button>`}</div>`).join('')}</section>`;}).join('');
    groups.forEach((g,gi)=>{const sorted=[...g].sort((a,b)=>String(a.created_at||'').localeCompare(String(b.created_at||''))),keep=sorted[0];document.querySelectorAll(`[data-dup-group="${gi}"] [data-merge-index]`).forEach(btn=>{const dup=sorted[Number(btn.dataset.mergeIndex)];btn.onclick=()=>merge(keep,dup,btn);});});
  }
  function addButton(){
    const head=document.querySelector('#customersView .panel-head');if(!head||head.querySelector('#crmFindDuplicates'))return;
    const btn=document.createElement('button');btn.id='crmFindDuplicates';btn.type='button';btn.className='btn ghost small';btn.textContent='Find Duplicates';btn.onclick=()=>{renderDuplicates();ensureDialog().showModal();};
    const actions=head.querySelector('.head-actions');if(actions)actions.insertBefore(btn,actions.firstChild);else head.appendChild(btn);
  }
  const observer=new MutationObserver(addButton);observer.observe(document.body,{childList:true,subtree:true});setTimeout(addButton,700);
})();