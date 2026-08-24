(() => {
  const FILM_EMAIL = {
    'Carbon': 'HITEK Carbon offers heat reduction, 99% UV protection, color stability, and lifetime warranty coverage.',
    'Ceramic IR': 'HITEK Ceramic IR ⭐ Most Popular offers up to 75% infrared heat rejection, 99% UV protection, excellent clarity, and lifetime warranty coverage.',
    'Ceramic Plus': 'HITEK Ceramic Plus 🔥 Maximum Heat Rejection offers up to 92% infrared heat rejection, 99% UV protection, excellent clarity/color stability, and lifetime warranty coverage.'
  };

  function defaultSubject(q,c){
    const vehicle=[q.vehicle_year,q.vehicle_make,q.vehicle_model].filter(Boolean).join(' ');
    return `EM Tinting Quote${vehicle?' – '+vehicle:''}`;
  }

  function defaultBody(q,c){
    const first=c?.first_name||'there';
    const vehicle=[q.vehicle_year,q.vehicle_make,q.vehicle_model].filter(Boolean).join(' ')||'vehicle';
    if((q.quote_type||'Window Tint')==='PPF' || /PPF/i.test(q.service||'')){
      return `Hi ${first},\n\nThank you for contacting EM Tinting. Here is your PPF quote for your ${vehicle}:\n\n${q.service} — ${money(q.amount)}\n\nThis quote is for the selected paint protection film coverage. If you would like to adjust the protected areas or package, reply to this email and we can update it.\n\nThank you,\nEM Tinting\nHouston & Richmond, TX\n346-804-9135`;
    }
    const label=q.film_package==='Ceramic IR'?' ⭐ Most Popular':q.film_package==='Ceramic Plus'?' 🔥 Maximum Heat Rejection':'';
    const coverage=q.coverage||'Window Tint';
    const info=FILM_EMAIL[q.film_package]||'';
    return `Hi ${first},\n\nThank you for contacting EM Tinting. For your ${vehicle}, here is your tint quote:\n\n${coverage} — ${q.film_package||'Window Tint'}${label} — ${money(q.amount)}\n\n${info}\n\nIf you would like to make any changes to the film shade or quote details, reply to this email.\n\nThank you,\nEM Tinting\nHouston & Richmond, TX\n346-804-9135`;
  }

  const modal=document.createElement('dialog');
  modal.id='quoteReviewModal';
  modal.className='modal wide';
  modal.innerHTML=`<form id="quoteReviewForm">
    <header><div><p class="eyebrow">QUOTE APPROVAL</p><h3>Review before sending</h3></div><button type="button" class="x" id="closeQuoteReview">×</button></header>
    <div id="quoteReviewCustomer" class="form-section"></div>
    <div class="form-grid">
      <label>Quote amount<input id="reviewAmount" type="number" min="0" step="0.01" required></label>
      <label>Status<input id="reviewStatus" disabled></label>
      <label class="span-2">Email subject<input id="reviewSubject" required></label>
    </div>
    <label>Email message<textarea id="reviewBody" rows="16" required></textarea></label>
    <p id="reviewSendMessage" class="message"></p>
    <div class="quick-actions"><button type="button" id="saveQuoteDraft" class="btn ghost">Save changes</button><button type="submit" class="btn primary">Approve & Send</button></div>
  </form>`;
  document.body.appendChild(modal);

  let activeQuoteId=null;
  window.openQuoteReview=(id)=>{
    const q=state.quotes.find(x=>x.id===id); if(!q)return;
    const c=customerById(q.customer_id);
    activeQuoteId=id;
    $('#quoteReviewCustomer').innerHTML=`<h4>${esc(customerName(c))}</h4><p class="muted">${esc(c?.email||'No email')} · ${esc([q.vehicle_year,q.vehicle_make,q.vehicle_model].filter(Boolean).join(' ')||'Vehicle not listed')}</p><p>${esc(q.service||'Quote')} ${q.film_package?'· '+esc(q.film_package):''}</p>`;
    $('#reviewAmount').value=Number(q.amount||0);
    $('#reviewStatus').value=(q.status||'draft').replaceAll('_',' ');
    $('#reviewSubject').value=q.email_subject||defaultSubject(q,c);
    $('#reviewBody').value=q.email_body||defaultBody(q,c);
    $('#reviewSendMessage').textContent=q.send_error?`Last send error: ${q.send_error}`:'';
    modal.showModal();
  };

  $('#closeQuoteReview').addEventListener('click',()=>modal.close());

  async function saveReview(showToast=true){
    if(!activeQuoteId)return false;
    const payload={amount:Number($('#reviewAmount').value||0),email_subject:$('#reviewSubject').value.trim(),email_body:$('#reviewBody').value.trim(),status:'pending_review',updated_at:new Date().toISOString()};
    const {error}=await db.from('quotes').update(payload).eq('id',activeQuoteId);
    if(error){toast(error.message);return false;}
    if(showToast)toast('Quote changes saved');
    await loadAll();
    return true;
  }

  $('#saveQuoteDraft').addEventListener('click',async()=>{await saveReview(true)});
  $('#quoteReviewForm').addEventListener('submit',async e=>{
    e.preventDefault();
    $('#reviewSendMessage').textContent='Sending quote…';
    const ok=await saveReview(false); if(!ok)return;
    const {data,error}=await db.functions.invoke('send-quote',{body:{quote_id:activeQuoteId,amount:Number($('#reviewAmount').value||0),email_subject:$('#reviewSubject').value.trim(),email_body:$('#reviewBody').value.trim()}});
    if(error || data?.error){
      const msg=data?.error||error?.message||'Unable to send quote';
      $('#reviewSendMessage').textContent=`Send failed: ${msg}`;
      toast('Quote saved, but email did not send');
      await loadAll();
      return;
    }
    $('#reviewSendMessage').textContent='Quote sent successfully.';
    toast('Quote approved and sent');
    setTimeout(()=>modal.close(),700);
    await loadAll();
  });

  renderQuotes=function(){
    const pending=state.quotes.filter(q=>q.status==='pending_review').length;
    const head=document.querySelector('#quotesView .panel-head h3');
    if(head)head.textContent=pending?`Quotes · ${pending} Pending Review`:'Quotes';
    $('#quotesTable').innerHTML=table(['Customer','Service','Film','Amount','Status','Actions'],state.quotes.map(q=>{
      const c=customerById(q.customer_id);
      const primary=q.status==='pending_review'?`<button class="primary-inline" onclick="openQuoteReview('${q.id}')">Review & Send</button>`:`<button onclick="openQuoteReview('${q.id}')">View / Edit</button>`;
      return [customerName(c),q.service,q.film_package||q.quote_type||'—',money(q.amount),pill(q.status),`<div class="table-actions">${primary}<button onclick="quoteToJob('${q.id}')">Make job</button><button onclick="updateQuoteStatus('${q.id}','declined')">Decline</button></div>`];
    }));
  };
})();
