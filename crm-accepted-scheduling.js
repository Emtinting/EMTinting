(()=>{
  let schedulingQuoteId=null;

  function accepted(q){return !!(q?.accepted_at||q?.status==='accepted')}
  function acceptedAmount(q){return Number(q?.accepted_amount||q?.amount||0)}

  async function getAcceptedOption(q){
    try{
      const {data}=await db.from('quote_options').select('*').eq('quote_id',q.id).order('sort_order');
      const opts=data||[];
      return opts.find(o=>o.accepted_at||o.status==='accepted'||Number(o.amount)===Number(q.accepted_amount))||opts.find(o=>o.recommended)||opts[0]||null;
    }catch(_){return null}
  }

  window.scheduleAcceptedQuote=async id=>{
    const q=state.quotes.find(x=>x.id===id);
    if(!q)return toast('Quote not found');
    if(!accepted(q))return toast('Accept the quote before scheduling it');

    const existing=state.bookings.find(b=>b.quote_id===id || String(b.notes||'').includes(`Quote ID: ${id}`));
    if(existing){
      toast('This accepted quote is already on your appointments calendar');
      const nav=document.querySelector('[data-view="calendar"]');
      if(nav)nav.click();
      return;
    }

    const c=customerById(q.customer_id);
    const opt=await getAcceptedOption(q);
    schedulingQuoteId=id;
    prepareAppointment();

    $('#apptExistingCustomer').value=q.customer_id||'';
    $('#apptFirst').value=c?.first_name||'';
    $('#apptLast').value=c?.last_name||'';
    $('#apptPhone').value=c?.phone||'';
    $('#apptEmail').value=c?.email||'';
    $('#apptCompany').value=c?.company||'';
    $('#apptYear').value=q.vehicle_year||'';
    $('#apptMake').value=q.vehicle_make||'';
    $('#apptModel').value=q.vehicle_model||'';
    $('#apptColor').value=q.vehicle_color||'';

    const service=opt?.service||q.service||'Window Tint';
    const film=opt?.film_package||q.film_package||'';
    const amount=Number(opt?.amount||q.accepted_amount||q.amount||0);
    $('#apptSummary').value=[film,service].filter(Boolean).join(' · ');
    $('#apptNotes').value=[q.notes||'',`Scheduled from accepted quote. Quote ID: ${q.id}`].filter(Boolean).join('\n');
    $('#serviceLines').innerHTML='<div class="empty">No services added</div>';
    addServiceRow({description:service,film_package:film,quantity:1,unit_price:amount});
    calculateAppointment();
    updatePhoneLinks();

    const modal=$('#appointmentModal');
    const title=modal?.querySelector('h3');
    if(title)title.textContent='Schedule accepted quote';
    modal?.showModal();
  };

  const nativePrepare=window.prepareAppointment;
  if(typeof nativePrepare==='function'){
    window.prepareAppointment=function(){
      schedulingQuoteId=null;
      nativePrepare();
      const title=$('#appointmentModal')?.querySelector('h3');
      if(title)title.textContent='New appointment';
    };
  }

  const form=$('#appointmentForm');
  if(form){
    form.addEventListener('submit',async()=>{
      if(!schedulingQuoteId)return;
      const quoteId=schedulingQuoteId;
      setTimeout(async()=>{
        try{
          const latest=[...state.bookings].filter(b=>b.customer_id===state.quotes.find(q=>q.id===quoteId)?.customer_id).sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0))[0];
          if(latest && !latest.quote_id){
            await db.from('bookings').update({quote_id:quoteId,updated_at:new Date().toISOString()}).eq('id',latest.id);
            latest.quote_id=quoteId;
          }
        }catch(_){ }
        schedulingQuoteId=null;
      },1200);
    },true);
  }

  const baseRender=window.renderQuotes;
  window.renderQuotes=function(){
    if(typeof baseRender==='function')baseRender();
    const table=$('#quotesTable');
    if(!table)return;
    const rows=[...table.querySelectorAll('tbody tr')];
    state.quotes.forEach((q,i)=>{
      if(!accepted(q)||!rows[i])return;
      const actions=rows[i].querySelector('.table-actions');
      if(!actions||actions.querySelector('[data-schedule-accepted]'))return;
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='primary-inline';
      btn.dataset.scheduleAccepted='1';
      btn.textContent='Schedule Appointment';
      btn.onclick=()=>scheduleAcceptedQuote(q.id);
      actions.prepend(btn);
    });
  };

  if(typeof renderQuotes==='function')renderQuotes();
})();