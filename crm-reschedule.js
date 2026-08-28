(()=>{
  const $q=(s,r=document)=>r.querySelector(s);
  const $qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const fmtTime=t=>{if(!t)return '—';const [h,m]=String(t).slice(0,5).split(':').map(Number);const d=new Date();d.setHours(h,m||0,0,0);return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});};

  function ensureDialog(){
    if($q('#rescheduleModal')) return;
    const dialog=document.createElement('dialog');
    dialog.id='rescheduleModal';
    dialog.className='modal';
    dialog.innerHTML=`<form id="rescheduleForm">
      <header><div><p class="eyebrow">EM TINTING</p><h3>Edit appointment date & time</h3></div><button type="button" class="x" id="rescheduleClose">×</button></header>
      <div id="rescheduleCustomer" class="muted" style="margin-bottom:14px"></div>
      <label>Appointment date<input id="rescheduleDate" type="date" required></label>
      <label>Appointment time<input id="rescheduleTime" type="time" required></label>
      <p class="muted" style="margin:8px 0 16px">Customer, vehicle, service and price will stay the same.</p>
      <button class="btn primary save-wide" id="rescheduleSave" type="submit">Save new date & time</button>
    </form>`;
    document.body.appendChild(dialog);
    $q('#rescheduleClose').onclick=()=>dialog.close();
    dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
    $q('#rescheduleForm').addEventListener('submit',saveReschedule);
  }

  let activeBookingId=null;
  function openReschedule(id){
    ensureDialog();
    const b=(state.bookings||[]).find(x=>x.id===id);
    if(!b) return toast('Appointment not found');
    const c=customerById(b.customer_id);
    activeBookingId=id;
    $q('#rescheduleCustomer').textContent=`${customerName(c)} · ${[b.vehicle_year,b.vehicle_make,b.vehicle_model].filter(Boolean).join(' ')||'Vehicle not listed'}`;
    $q('#rescheduleDate').value=b.appointment_date||'';
    $q('#rescheduleTime').value=String(b.appointment_time||'').slice(0,5);
    $q('#rescheduleModal').showModal();
  }

  async function saveReschedule(e){
    e.preventDefault();
    const b=(state.bookings||[]).find(x=>x.id===activeBookingId);
    if(!b) return toast('Appointment not found');
    const appointment_date=$q('#rescheduleDate').value;
    const appointment_time=$q('#rescheduleTime').value;
    if(!appointment_date||!appointment_time) return toast('Choose a date and time');
    const btn=$q('#rescheduleSave');
    btn.disabled=true;btn.textContent='Saving...';
    const {data,error}=await db.from('bookings').update({appointment_date,appointment_time,updated_at:new Date().toISOString()}).eq('id',activeBookingId).select().single();
    btn.disabled=false;btn.textContent='Save new date & time';
    if(error) return toast(error.message);
    const i=state.bookings.findIndex(x=>x.id===activeBookingId);
    if(i>=0) state.bookings[i]={...state.bookings[i],...data};
    $q('#rescheduleModal').close();
    renderAll();
    toast(`Appointment moved to ${dateFmt(appointment_date)} at ${fmtTime(appointment_time)}`);
  }

  function addEditButtons(){
    $qa('#bookingsTable tbody tr').forEach(row=>{
      const actions=$q('.table-actions',row);
      if(!actions||actions.querySelector('.crm-reschedule-btn')) return;
      const check=$qa('button',actions).find(b=>(b.getAttribute('onclick')||'').includes("checkIn('"));
      const source=check?.getAttribute('onclick')||$qa('button',actions).map(b=>b.getAttribute('onclick')||'').find(x=>x.includes("toggleConfirmed('"));
      const match=source&&source.match(/\('([^']+)'/);
      if(!match) return;
      const btn=document.createElement('button');
      btn.type='button';btn.className='crm-reschedule-btn';btn.textContent='Edit Date/Time';
      btn.onclick=()=>openReschedule(match[1]);
      actions.prepend(btn);
    });
  }

  ensureDialog();
  addEditButtons();
  const table=$q('#bookingsTable');
  if(table)new MutationObserver(addEditButtons).observe(table,{childList:true,subtree:true});
  window.openReschedule=openReschedule;
})();