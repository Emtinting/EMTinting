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
function addButtons(){
  document.querySelectorAll('#quotesTable tbody tr').forEach(row=>{
    const actions=row.querySelector('.table-actions');if(!actions)return;
    const any=[...actions.querySelectorAll('button')].find(b=>{const s=b.getAttribute('onclick')||'';return s.includes("quoteToJob('")||s.includes("updateQuoteStatus('")});if(!any)return;
    const m=(any.getAttribute('onclick')||'').match(/\('([^']+)'/);if(!m)return;const id=m[1];
    if(actions.querySelector(`[data-edit-customer-email="${id}"]`))return;
    const b=document.createElement('button');b.type='button';b.textContent='Edit customer email';b.dataset.editCustomerEmail=id;b.onclick=()=>editQuoteCustomerEmail(id);actions.insertBefore(b,actions.firstChild);
  });
}
function start(){addButtons();const t=document.getElementById('quotesTable');if(t)new MutationObserver(addButtons).observe(t,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,900));else setTimeout(start,900);
})();