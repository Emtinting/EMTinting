(()=>{
  const DEFAULT_SUBJECT='Your EM Tinting Quote';
  const DEFAULT_BODY='Hi,\n\nThank you for choosing EM Tinting. Your quote details and available HITEK film options are below.\n\nIf you have any questions, reply to this email or call/text 346.804.9135.\n\nThank you,\nEM Tinting';
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const getDb=()=>window.db||window.supabase?.createClient?.('https://neuginokjfvnkmlzhwoa.supabase.co','sb_publishable_T-XFCPWnkn_meQPK0AKA6A_hRvfRXGk');
  const notify=m=>{const t=document.querySelector('#toast');if(t){t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3200)}else alert(m)};
  function ensureDialog(){
    if(document.querySelector('#quoteEmailModal'))return;
    const d=document.createElement('dialog');
    d.id='quoteEmailModal';d.className='modal wide';
    d.innerHTML=`<form id="quoteEmailForm" method="dialog"><header><div><p class="eyebrow">QUOTE EMAIL</p><h3>Edit customer email</h3></div><button type="button" class="x" id="quoteEmailClose">×</button></header><input type="hidden" id="quoteEmailId"><section class="form-section"><label>Subject<input id="quoteEmailSubject" maxlength="240" placeholder="Your EM Tinting Quote"></label><label>Email message<textarea id="quoteEmailBody" rows="12" maxlength="12000" placeholder="Message customers receive with their quote"></textarea></label><div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn ghost" id="quoteEmailReset">Use default message</button><button type="submit" class="btn primary" id="quoteEmailSave">Save email</button></div></section></form>`;
    document.body.appendChild(d);
    d.querySelector('#quoteEmailClose').onclick=()=>d.close();
    d.querySelector('#quoteEmailReset').onclick=()=>{d.querySelector('#quoteEmailSubject').value=DEFAULT_SUBJECT;d.querySelector('#quoteEmailBody').value=DEFAULT_BODY};
    d.querySelector('#quoteEmailForm').addEventListener('submit',async e=>{e.preventDefault();const id=d.querySelector('#quoteEmailId').value;const subject=d.querySelector('#quoteEmailSubject').value.trim();const body=d.querySelector('#quoteEmailBody').value.trim();if(!subject||!body)return notify('Subject and email message are required.');const btn=d.querySelector('#quoteEmailSave');btn.disabled=true;btn.textContent='Saving...';try{const db=getDb();const now=new Date().toISOString();const {error}=await db.from('quotes').update({email_subject:subject,email_body:body,updated_at:now}).eq('id',id);if(error)throw error;const q=window.state?.quotes?.find?.(x=>x.id===id);if(q){q.email_subject=subject;q.email_body=body;q.updated_at=now}notify('Quote email saved');d.close()}catch(err){console.error(err);notify('Could not save email: '+(err?.message||String(err)))}finally{btn.disabled=false;btn.textContent='Save email'}});
  }
  window.editQuoteEmail=async id=>{
    ensureDialog();const d=document.querySelector('#quoteEmailModal');
    try{const db=getDb();const {data,error}=await db.from('quotes').select('id,email_subject,email_body,status,sent_at').eq('id',id).single();if(error)throw error;d.querySelector('#quoteEmailId').value=id;d.querySelector('#quoteEmailSubject').value=data.email_subject||DEFAULT_SUBJECT;d.querySelector('#quoteEmailBody').value=data.email_body||DEFAULT_BODY;d.showModal()}catch(err){console.error(err);notify('Could not open quote email: '+(err?.message||String(err)))}
  };
  function enhance(){
    ensureDialog();
    const table=document.querySelector('#quotesTable table');if(!table)return;
    table.querySelectorAll('tbody tr').forEach(tr=>{const actions=tr.querySelector('.table-actions');if(!actions||actions.querySelector('.quote-email-edit'))return;const match=actions.innerHTML.match(/quoteToJob\('([^']+)'\)|updateQuoteStatus\('([^']+)'/);const id=match?.[1]||match?.[2];if(!id)return;const b=document.createElement('button');b.type='button';b.className='quote-email-edit';b.textContent='Edit email';b.onclick=()=>window.editQuoteEmail(id);actions.prepend(b)})
  }
  const obs=new MutationObserver(enhance);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{ensureDialog();enhance();const q=document.querySelector('#quotesTable');if(q)obs.observe(q,{childList:true,subtree:true})});else{ensureDialog();enhance();const q=document.querySelector('#quotesTable');if(q)obs.observe(q,{childList:true,subtree:true})}
})();
