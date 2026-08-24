(() => {
  const FILMS = {
    Carbon: {name:'Carbon IR',badge:'Carbon',heat:'62% IR rejection @ 5%',solar:'61% TSER @ 5%',uv:'99% UV rejection',warranty:'Lifetime warranty · Color stable',description:'Nano-carbon technology engineered for strong infrared heat rejection without interfering with electronic signals.',image:'https://hitekfilms.com/wp-content/uploads/2022/05/carbon-IR-1-1024x1024.jpg',source:'https://hitekfilms.com/product/carbon-ir/'},
    'Ceramic IR': {name:'Ceramic IR',badge:'Ceramic',heat:'75% IR rejection @ 5%',solar:'65% TSER @ 5%',uv:'99% UV rejection',warranty:'Lifetime warranty',description:'Carbon-based nano-ceramic film with infrared-rejection technology for increased heat protection, optical clarity, style, and stability.',image:'https://hitekfilms.com/wp-content/uploads/2022/05/Ceramic-IR.png',source:'https://hitekfilms.com/product/ceramic-ir/'},
    'Ceramic Plus': {name:'Ceramic Plus',badge:'Premium Ceramic',heat:'Up to 92% IR rejection',solar:'Up to 69% TSER',uv:'99% UV rejection',warranty:'Lifetime warranty · Color stable',description:'Carbon-infused nano-ceramic technology built for premium infrared heat control, clarity, durability, and no signal interference.',image:'https://hitekfilms.com/wp-content/uploads/2022/05/Ceramic-plus-Carbon-1024x813.png',source:'https://hitekfilms.com/product/ceramic-plus/'}
  };

  const PRICES = {
    'Full Vehicle': {
      Sedan:{Carbon:180,'Ceramic IR':280,'Ceramic Plus':600},
      Coupe:{Carbon:180,'Ceramic IR':280,'Ceramic Plus':600},
      'Pickup Truck':{Carbon:180,'Ceramic IR':280,'Ceramic Plus':600},
      SUV:{Carbon:200,'Ceramic IR':300,'Ceramic Plus':620}
    },
    'Front 2 Doors': {Carbon:100,'Ceramic IR':150,'Ceramic Plus':220},
    'Windshield Only': {'Ceramic Plus':200}
  };

  const vehicleOptions = `<option value="">Choose vehicle type</option><option value="Sedan">Sedan</option><option value="Coupe">Coupe</option><option value="SUV">SUV</option><option value="Pickup Truck">Pickup Truck</option>`;
  const normPhone = v => String(v||'').replace(/\D/g,'');

  function injectVehicleSelectors() {
    const apptModel = document.querySelector('#apptModel');
    if (apptModel && !document.querySelector('#apptVehicleType')) {
      const label = document.createElement('label');
      label.innerHTML = `Vehicle type<select id="apptVehicleType" required>${vehicleOptions}</select>`;
      apptModel.closest('label')?.insertAdjacentElement('afterend', label);
    }

    const quoteForm = document.querySelector('#quoteForm');
    const oldCustomer = document.querySelector('#quoteCustomer');
    if (quoteForm && oldCustomer && !document.querySelector('#quoteCustomerSection')) {
      const oldLabel = oldCustomer.closest('label');
      oldCustomer.required = false;
      oldLabel.style.display = 'none';

      const customerSection = document.createElement('section');
      customerSection.id = 'quoteCustomerSection';
      customerSection.className = 'form-section';
      customerSection.innerHTML = `
        <h4>CUSTOMER</h4>
        <label>Search existing customer
          <input id="quoteCustomerSearch" list="quoteCustomerList" placeholder="Type a name or phone to reuse a saved customer" autocomplete="off">
          <datalist id="quoteCustomerList"></datalist>
        </label>
        <div class="form-grid">
          <label>First name<input id="quoteFirst" required placeholder="Customer first name"></label>
          <label>Last name<input id="quoteLast" placeholder="Customer last name"></label>
          <label>Phone<input id="quotePhone" required type="tel" placeholder="713-555-0000"></label>
          <label>Email<input id="quoteEmail" type="email" placeholder="name@email.com"></label>
        </div>
        <div class="quick-actions"><a id="quoteCall" class="btn ghost" href="#">☎ Call</a><a id="quoteText" class="btn ghost" href="#">💬 Text</a></div>`;
      oldLabel.insertAdjacentElement('afterend', customerSection);

      const serviceLabel = document.querySelector('#quoteService')?.closest('label');
      const vehicleSection = document.createElement('section');
      vehicleSection.id = 'quoteVehicleSection';
      vehicleSection.className = 'form-section';
      vehicleSection.innerHTML = `
        <h4>VEHICLE</h4>
        <div class="form-grid">
          <label>Year<input id="quoteYear" inputmode="numeric" placeholder="2026"></label>
          <label>Make<input id="quoteMake" placeholder="Toyota"></label>
          <label>Model<input id="quoteModel" placeholder="Camry"></label>
          <label>Color<input id="quoteColor" placeholder="Optional"></label>
          <label class="span-2">Vehicle type<select id="quoteVehicleType" required>${vehicleOptions}</select></label>
        </div>`;
      serviceLabel?.insertAdjacentElement('beforebegin', vehicleSection);

      const datalist = document.querySelector('#quoteCustomerList');
      const refreshCustomerList = () => {
        if (!datalist || typeof state === 'undefined') return;
        datalist.innerHTML = state.customers.map(c => `<option value="${customerName(c)} · ${c.phone||''}"></option>`).join('');
      };
      refreshCustomerList();

      const fillExisting = () => {
        if (typeof state === 'undefined') return;
        const q = document.querySelector('#quoteCustomerSearch').value.toLowerCase().trim();
        if (!q) return;
        const c = state.customers.find(x => `${customerName(x)} · ${x.phone||''}`.toLowerCase()===q || normPhone(x.phone)===normPhone(q) || customerName(x).toLowerCase()===q);
        if (!c) return;
        oldCustomer.value = c.id;
        document.querySelector('#quoteFirst').value = c.first_name||'';
        document.querySelector('#quoteLast').value = c.last_name||'';
        document.querySelector('#quotePhone').value = c.phone||'';
        document.querySelector('#quoteEmail').value = c.email||'';
        updateQuotePhoneLinks();
      };
      document.querySelector('#quoteCustomerSearch').addEventListener('change', fillExisting);
      document.querySelector('#quoteCustomerSearch').addEventListener('blur', fillExisting);
      document.querySelector('#quotePhone').addEventListener('input', updateQuotePhoneLinks);
    }

    const quoteVehicleType = document.querySelector('#quoteVehicleType');
    if (quoteVehicleType && !document.querySelector('#quoteCoverage')) {
      const label = document.createElement('label');
      label.innerHTML = `Tint coverage<select id="quoteCoverage" required><option value="">Choose coverage</option><option value="Full Vehicle">Full Vehicle</option><option value="Front 2 Doors">Front 2 Doors Only</option><option value="Windshield Only">Windshield Only</option></select>`;
      document.querySelector('#quoteService')?.closest('label')?.insertAdjacentElement('afterend', label);
    }

    const amount = document.querySelector('#quoteAmount');
    if (amount && !document.querySelector('#quoteEyebrow')) {
      const wrap = document.createElement('label');
      wrap.className = 'checkline';
      wrap.innerHTML = `<input id="quoteEyebrow" type="checkbox"> Add windshield eyebrow (+$40)`;
      amount.closest('label')?.insertAdjacentElement('beforebegin', wrap);
    }

    const apptForm = document.querySelector('#appointmentForm');
    if (apptForm && !apptForm.dataset.vehicleTypeReady) {
      apptForm.dataset.vehicleTypeReady = '1';
      apptForm.addEventListener('submit', () => {
        const type = document.querySelector('#apptVehicleType')?.value;
        const notes = document.querySelector('#apptNotes');
        if (!type || !notes) return;
        const cleaned = notes.value.replace(/^Vehicle type:.*\n?/i, '');
        notes.value = `Vehicle type: ${type}\n${cleaned}`.trim();
      }, true);
    }
  }

  function updateQuotePhoneLinks(){
    const p = document.querySelector('#quotePhone')?.value || '';
    const clean = p.replace(/[^0-9+]/g,'');
    const call = document.querySelector('#quoteCall');
    const text = document.querySelector('#quoteText');
    if(call) call.href = `tel:${clean}`;
    if(text) text.href = `sms:${clean}`;
  }

  function initFilmSelector() {
    injectVehicleSelectors();
    const fieldset = document.querySelector('.film-fieldset');
    const form = document.querySelector('#quoteForm');
    if (!fieldset || !form || fieldset.dataset.hitekReady) return;
    fieldset.dataset.hitekReady = '1';

    let hidden = document.querySelector('#quoteFilm');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.id = 'quoteFilm';
      hidden.name = 'quoteFilmValue';
      form.appendChild(hidden);
    }

    const panel = document.createElement('section');
    panel.id = 'filmInfoPanel';
    panel.className = 'film-info hidden';
    panel.innerHTML = `<img id="filmInfoImage" alt="HITEK film performance specifications" loading="lazy"><div class="film-info-copy"><div class="film-info-heading"><span id="filmInfoBadge"></span><strong id="filmInfoName"></strong></div><p id="filmInfoDescription"></p><div class="film-spec-grid"><div><small>Heat / IR</small><b id="filmInfoHeat"></b></div><div><small>Solar Rejection</small><b id="filmInfoSolar"></b></div><div><small>UV Protection</small><b id="filmInfoUV"></b></div><div><small>Coverage</small><b id="filmInfoWarranty"></b></div></div><a id="filmInfoSource" target="_blank" rel="noopener noreferrer">View HITEK product details</a></div>`;
    fieldset.insertAdjacentElement('afterend', panel);

    const render = (value) => {
      const film = FILMS[value];
      if (!film) return;
      hidden.value = value;
      panel.classList.remove('hidden');
      document.querySelector('#filmInfoImage').src = film.image;
      document.querySelector('#filmInfoBadge').textContent = film.badge;
      document.querySelector('#filmInfoName').textContent = film.name;
      document.querySelector('#filmInfoDescription').textContent = film.description;
      document.querySelector('#filmInfoHeat').textContent = film.heat;
      document.querySelector('#filmInfoSolar').textContent = film.solar;
      document.querySelector('#filmInfoUV').textContent = film.uv;
      document.querySelector('#filmInfoWarranty').textContent = film.warranty;
      document.querySelector('#filmInfoSource').href = film.source;
    };

    function calculateQuote(){
      const type=document.querySelector('#quoteVehicleType')?.value;
      const coverage=document.querySelector('#quoteCoverage')?.value;
      const pkg=hidden.value || document.querySelector('input[name="quoteFilm"]:checked')?.value;
      const eyebrow=document.querySelector('#quoteEyebrow')?.checked;
      const amount=document.querySelector('#quoteAmount');
      if(!amount) return null;
      let base=null;
      if(coverage==='Full Vehicle') base=PRICES[coverage]?.[type]?.[pkg] ?? null;
      if(coverage==='Front 2 Doors') base=PRICES[coverage]?.[pkg] ?? null;
      if(coverage==='Windshield Only') base=PRICES[coverage]?.[pkg] ?? null;
      if(base===null){amount.value='';return null;}
      const total=base+(eyebrow?40:0);
      amount.value=total;
      return {base,total,type,coverage,pkg,eyebrow};
    }

    document.querySelectorAll('input[name="quoteFilm"]').forEach(input => input.addEventListener('change', () => {render(input.value);calculateQuote();}));
    ['quoteVehicleType','quoteCoverage','quoteEyebrow'].forEach(id=>document.querySelector('#'+id)?.addEventListener('change',()=>{
      if(id==='quoteCoverage' && document.querySelector('#quoteCoverage')?.value==='Windshield Only'){
        const plus=document.querySelector('input[name="quoteFilm"][value="Ceramic Plus"]');
        if(plus){plus.checked=true;render('Ceramic Plus');}
      }
      calculateQuote();
    }));

    form.addEventListener('submit', async e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const first=document.querySelector('#quoteFirst')?.value.trim();
      const last=document.querySelector('#quoteLast')?.value.trim()||'';
      const phone=document.querySelector('#quotePhone')?.value.trim();
      const email=document.querySelector('#quoteEmail')?.value.trim()||null;
      if(!first || !phone){toast('Customer name and phone are required');return;}
      const q=calculateQuote();
      const filmValue=hidden.value || document.querySelector('input[name="quoteFilm"]:checked')?.value || null;
      const service=document.querySelector('#quoteService')?.value.trim();
      const amountValue=Number(document.querySelector('#quoteAmount')?.value||0);
      if(!service || !filmValue || !amountValue){toast('Complete the service, film, vehicle type and coverage');return;}

      let customer = typeof state!=='undefined' ? state.customers.find(c => (normPhone(c.phone)&&normPhone(c.phone)===normPhone(phone)) || (email&&c.email&&c.email.toLowerCase()===email.toLowerCase())) : null;
      const customerPayload={first_name:first,last_name:last,phone,email,updated_at:new Date().toISOString()};
      let customerId=customer?.id || null;
      if(customerId){
        const {error}=await db.from('customers').update(customerPayload).eq('id',customerId);
        if(error){toast(error.message);return;}
      }else{
        const {data,error}=await db.from('customers').insert(customerPayload).select('id').single();
        if(error){toast(error.message);return;}
        customerId=data.id;
      }

      const year=document.querySelector('#quoteYear')?.value.trim();
      const make=document.querySelector('#quoteMake')?.value.trim();
      const model=document.querySelector('#quoteModel')?.value.trim();
      const color=document.querySelector('#quoteColor')?.value.trim();
      const type=document.querySelector('#quoteVehicleType')?.value;
      const coverage=document.querySelector('#quoteCoverage')?.value;
      const eyebrow=document.querySelector('#quoteEyebrow')?.checked;
      const userNotes=document.querySelector('#quoteNotes')?.value.trim()||'';
      const detailLines=[
        [year,make,model].filter(Boolean).join(' '),
        type?`Vehicle type: ${type}`:'',
        coverage?`Tint coverage: ${coverage}`:'',
        color?`Color: ${color}`:'',
        eyebrow?'Eyebrow: +$40':'',
        userNotes
      ].filter(Boolean);
      const payload={customer_id:customerId,service,film_package:filmValue,amount:amountValue,notes:detailLines.join('\n')||null,status:'draft'};
      const {error}=await db.from('quotes').insert(payload);
      if(error){toast(error.message);return;}
      document.querySelector('#quoteCustomer').value=customerId;
      document.querySelector('#quoteModal').close();
      form.reset();
      toast('Quote saved and customer linked');
      await loadAll();
    }, true);

    form.addEventListener('reset', () => {
      hidden.value='';panel.classList.add('hidden');
      setTimeout(()=>{
        const a=document.querySelector('#quoteAmount');if(a)a.value='';
        const s=document.querySelector('#quoteCustomerSearch');if(s)s.value='';
        const old=document.querySelector('#quoteCustomer');if(old)old.value='';
        updateQuotePhoneLinks();
      },0);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initFilmSelector);
  else initFilmSelector();
})();