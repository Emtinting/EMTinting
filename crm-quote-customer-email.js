(()=>{
function toastMsg(msg){if(typeof toast==='function')return toast(msg);alert(msg)}
async function editQuoteCustomerEmail(quoteId){
  const q=(window.state?.quotes||state?.quotes||[]).find(x=>x.id===quoteId);if(!q)return toastMsg('Quote not found');
  const c=(window.state?.customers||state?.customers||[]).find(x=>x.id===q.customer_id);if(!c)return toastMsg('Customer not found');
  const current=c.email||'';
  const next=prompt(`Edit customer email for ${(c.first_name||'')+' '+(c.last_name||'')}`.trim(),current);
  if(next===null)return;
  const email=next.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return toastMsg('Enter a valid email address');
  try{
    const {error}=await db.rpc('owner_update_customer_email',{p_customer_id:c.id,p_email:email});if(error)throw error;
    c.email=email.toLowerCase();
    toastMsg('Customer email updated');
    if(typeof renderQuotes==='function')renderQuotes();
  }catch(e){console.error(e);toastMsg(e?.message||'Could not update customer email')}
}
window.editQuoteCustomerEmail=editQuoteCustomerEmail;

async function scheduleAcceptedQuote(id){
  const q=state.quotes.find(x=>x.id===id);if(!q)return toastMsg('Quote not found');
  if(!(q.accepted_at||q.status==='accepted'))return toastMsg('Accept the quote before scheduling it');
  const existing=state.bookings.find(b=>b.quote_id===id||String(b.notes||'').includes(`Quote ID: ${id}`));
  if(existing){toastMsg('This quote is already scheduled');const cal=document.querySelector('[data-view="calendar"]');if(cal)cal.click();return}
  const c=customerById(q.customer_id);
  let opt=null;
  try{const {data}=await db.from('quote_options').select('*').eq('quote_id',id).order('sort_order');const opts=data||[];opt=opts.find(o=>o.accepted_at||o.status==='accepted'||Number(o.amount)===Number(q.accepted_amount))||opts.find(o=>o.recommended)||opts[0]||null}catch(_){ }
  prepareAppointment();
  $('#apptExistingCustomer').value=q.customer_id||'';
  $('#apptFirst').value=c?.first_name||'';$('#apptLast').value=c?.last_name||'';$('#apptPhone').value=c?.phone||'';$('#apptEmail').value=c?.email||'';$('#apptCompany').value=c?.company||'';
  $('#apptYear').value=q.vehicle_year||'';$('#apptMake').value=q.vehicle_make||'';$('#apptModel').value=q.vehicle_model||'';$('#apptColor').value=q.vehicle_color||'';
  const service=opt?.service||q.service||'Window Tint',film=opt?.film_package||q.film_package||'',amount=Number(opt?.amount||q.accepted_amount||q.amount||0);
  $('#apptSummary').value=[film,service].filter(Boolean).join(' · ');
  $('#apptNotes').value=[q.notes||'',`Scheduled from accepted quote. Quote ID: ${q.id}`].filter(Boolean).join('\n');
  $('#serviceLines').innerHTML='<div class="empty">No services added</div>';
  addServiceRow({description:service,film_package:film,quantity:1,unit_price:amount});calculateAppointment();updatePhoneLinks();
  const title=$('#appointmentModal')?.querySelector('h3');if(title)title.textContent='Schedule accepted quote';
  $('#appointmentModal')?.showModal();
}
window.scheduleAcceptedQuote=scheduleAcceptedQuote;

function addButtons(){
  document.querySelectorAll('#quotesTable tbody tr').forEach(row=>{
    const actions=row.querySelector('.table-actions');if(!actions)return;
    const any=[...actions.querySelectorAll('button')].find(b=>{const s=b.getAttribute('onclick')||'';return s.includes("quoteToJob('")||s.includes("updateQuoteStatus('")});if(!any)return;
    const m=(any.getAttribute('onclick')||'').match(/\('([^']+)'/);if(!m)return;const id=m[1];
    if(!actions.querySelector(`[data-edit-customer-email="${id}"]`)){const b=document.createElement('button');b.type='button';b.textContent='Edit customer email';b.dataset.editCustomerEmail=id;b.onclick=()=>editQuoteCustomerEmail(id);actions.insertBefore(b,actions.firstChild)}
    const q=state.quotes.find(x=>x.id===id);
    if(q&&(q.accepted_at||q.status==='accepted')&&!actions.querySelector(`[data-schedule-accepted="${id}"]`)){
      const b=document.createElement('button');b.type='button';b.textContent='Schedule Appointment';b.className='primary-inline';b.dataset.scheduleAccepted=id;b.onclick=()=>scheduleAcceptedQuote(id);actions.insertBefore(b,actions.firstChild)
    }
  });
}
function start(){addButtons();const t=document.getElementById('quotesTable');if(t)new MutationObserver(addButtons).observe(t,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,900));else setTimeout(start,900);
})();