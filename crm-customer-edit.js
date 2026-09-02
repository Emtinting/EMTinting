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
    const c=(window.state?.customers||state?.customers||[]).find(x=>x.id===id);
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
