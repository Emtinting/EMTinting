(() => {
  const PPF_PACKAGES = [
    'Front Bumper',
    'Partial Front',
    'Full Front',
    'Track Package',
    'Full Vehicle',
    'Custom PPF'
  ];

  function initPPFQuote(){
    const form=document.querySelector('#quoteForm');
    const serviceInput=document.querySelector('#quoteService');
    const filmFieldset=document.querySelector('.film-fieldset');
    if(!form||!serviceInput||form.dataset.ppfReady)return;
    form.dataset.ppfReady='1';

    const typeLabel=document.createElement('label');
    typeLabel.innerHTML=`Quote type<select id="quoteType" required><option value="Window Tint">Window Tint</option><option value="PPF">Paint Protection Film (PPF)</option></select>`;
    serviceInput.closest('label')?.insertAdjacentElement('beforebegin',typeLabel);

    const ppfWrap=document.createElement('section');
    ppfWrap.id='ppfQuoteOptions';
    ppfWrap.className='form-section hidden';
    ppfWrap.innerHTML=`<h4>PPF PACKAGE</h4><label>Coverage<select id="quotePPFPackage"><option value="">Choose PPF package</option>${PPF_PACKAGES.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></label><p class="muted">PPF pricing stays private. Enter the quote amount below until your automatic PPF price list is added.</p>`;
    filmFieldset?.insertAdjacentElement('beforebegin',ppfWrap);

    const quoteType=document.querySelector('#quoteType');
    const ppfPackage=document.querySelector('#quotePPFPackage');
    const amount=document.querySelector('#quoteAmount');

    function sync(){
      const isPPF=quoteType.value==='PPF';
      ppfWrap.classList.toggle('hidden',!isPPF);
      if(ppfPackage)ppfPackage.required=isPPF;
      if(filmFieldset)filmFieldset.style.display=isPPF?'none':'';
      document.querySelector('#filmInfoPanel')?.classList.toggle('hidden',isPPF);
      const coverage=document.querySelector('#quoteCoverage')?.closest('label');
      if(coverage)coverage.style.display=isPPF?'none':'';
      const eyebrow=document.querySelector('#quoteEyebrow')?.closest('label');
      if(eyebrow)eyebrow.style.display=isPPF?'none':'';
      document.querySelectorAll('input[name="quoteFilm"]').forEach(r=>r.required=!isPPF);
      serviceInput.value=isPPF?'Paint Protection Film (PPF)':'Full vehicle tint';
      if(isPPF&&amount)amount.value='';
    }
    quoteType.addEventListener('change',sync);
    sync();

    form.addEventListener('submit',async e=>{
      if(quoteType.value!=='PPF')return;
      e.preventDefault();
      e.stopImmediatePropagation();

      const first=document.querySelector('#quoteFirst')?.value.trim();
      const last=document.querySelector('#quoteLast')?.value.trim()||'';
      const phone=document.querySelector('#quotePhone')?.value.trim();
      const email=document.querySelector('#quoteEmail')?.value.trim()||null;
      const amountValue=Number(amount?.value||0);
      const pkg=ppfPackage?.value;
      if(!first||!phone){toast('Customer name and phone are required');return;}
      if(!pkg||!amountValue){toast('Choose a PPF package and enter the quote amount');return;}

      const norm=v=>String(v||'').replace(/\D/g,'');
      let customer=typeof state!=='undefined'?state.customers.find(c=>(norm(c.phone)&&norm(c.phone)===norm(phone))||(email&&c.email&&c.email.toLowerCase()===email.toLowerCase())):null;
      const customerPayload={first_name:first,last_name:last,phone,email,updated_at:new Date().toISOString()};
      let customerId=customer?.id||null;
      if(customerId){const {error}=await db.from('customers').update(customerPayload).eq('id',customerId);if(error){toast(error.message);return;}}
      else{const {data,error}=await db.from('customers').insert(customerPayload).select('id').single();if(error){toast(error.message);return;}customerId=data.id;}

      const year=document.querySelector('#quoteYear')?.value.trim();
      const make=document.querySelector('#quoteMake')?.value.trim();
      const model=document.querySelector('#quoteModel')?.value.trim();
      const color=document.querySelector('#quoteColor')?.value.trim();
      const vehicleType=document.querySelector('#quoteVehicleType')?.value;
      const userNotes=document.querySelector('#quoteNotes')?.value.trim()||'';
      const notes=[
        [year,make,model].filter(Boolean).join(' '),
        vehicleType?`Vehicle type: ${vehicleType}`:'',
        color?`Color: ${color}`:'',
        `PPF package: ${pkg}`,
        userNotes
      ].filter(Boolean).join('\n');

      const {error}=await db.from('quotes').insert({customer_id:customerId,service:`PPF - ${pkg}`,film_package:null,amount:amountValue,notes,status:'draft'});
      if(error){toast(error.message);return;}
      document.querySelector('#quoteModal').close();
      form.reset();
      quoteType.value='Window Tint';
      sync();
      toast('PPF quote saved and customer linked');
      await loadAll();
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initPPFQuote);else initPPFQuote();
})();