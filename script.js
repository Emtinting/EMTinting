// EM Tinting — clean black hero, no slideshow

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (event) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const style = document.createElement('style');
  style.textContent = `.hero{background:#050505!important;min-height:620px!important;overflow:hidden!important}.hero-overlay,.em-hero-slideshow,.em-hero-controls,.em-hero-label,.hero-card{display:none!important}.em-date-field{position:relative;width:100%}.em-date-field input[type="date"]{width:100%}.em-date-placeholder{position:absolute;left:28px;top:50%;transform:translateY(-50%);color:#f2f2f2;pointer-events:none;z-index:2}.em-date-field.has-value .em-date-placeholder,.em-date-field:focus-within .em-date-placeholder{display:none}.em-quote-builder{display:grid;gap:14px;margin-top:4px}.em-addon{display:flex;align-items:center;gap:10px;color:#f2f2f2;font-size:14px}.em-addon input{width:auto}@media(max-width:620px){body{padding-bottom:72px!important}.site-header{height:92px!important;padding:0 30px!important;background:#050505!important;border-bottom:2px solid #d71920!important;gap:16px!important;position:sticky!important;top:0!important}.brand{font-size:22px!important;gap:8px!important;white-space:nowrap}.brand-em{font-size:23px!important}.site-header .btn-small{margin-left:auto!important;min-height:56px!important;height:56px!important;padding:0 22px!important}.hero{height:auto!important;min-height:610px!important;padding:54px 28px 72px!important;align-items:flex-start!important}.hero h1{font-size:48px!important}.mobile-contact-bar{height:72px!important}}`;
  document.head.appendChild(style);

  const dateInput=document.querySelector('#bookingForm input[name="appointment_date"]');
  if(dateInput&&!dateInput.closest('.em-date-field')){
    const w=document.createElement('div');w.className='em-date-field';
    const p=document.createElement('span');p.className='em-date-placeholder';p.textContent='Choose appointment Date';
    dateInput.parentNode.insertBefore(w,dateInput);w.appendChild(dateInput);w.appendChild(p);
    const sync=()=>w.classList.toggle('has-value',Boolean(dateInput.value));
    dateInput.addEventListener('change',sync);dateInput.addEventListener('input',sync);sync();
  }

  const form=document.querySelector('#bookingForm');
  const vehicleType=form?.querySelector('select[name="vehicle_type"]');
  const film=form?.querySelector('select[name="tint_package"]');

  if(vehicleType){
    vehicleType.innerHTML='<option value="">Choose vehicle type</option><option>Sedan</option><option>Coupe</option><option>SUV</option><option value="Pickup Truck">Pickup Truck</option>';
    vehicleType.required=true;
  }

  // Customers no longer choose a film before they understand the differences.
  // Every tint request receives Carbon, Ceramic IR and Ceramic Plus options in the proposal.
  if(film){
    film.value='';
    film.removeAttribute('required');
    film.closest('.form-row')?.classList.add('em-no-film-choice');
    film.style.display='none';
  }

  if(form&&!document.querySelector('#emCoverage')){
    const builder=document.createElement('div');
    builder.className='em-quote-builder';
    builder.innerHTML='<select id="emCoverage" name="tint_coverage" required><option value="">Choose tint coverage</option><option>Full Vehicle</option><option>Front 2 Doors</option><option>Windshield Only</option></select><label class="em-addon"><input id="emEyebrow" name="eyebrow" type="checkbox" value="yes"><span>Add windshield eyebrow</span></label>';
    const dateRow=dateInput?.closest('.form-row');
    if(dateRow) dateRow.insertAdjacentElement('beforebegin',builder); else form.querySelector('textarea[name="notes"]')?.insertAdjacentElement('beforebegin',builder);

    const coverage=document.querySelector('#emCoverage');
    const eyebrow=document.querySelector('#emEyebrow');
    const notes=form.querySelector('textarea[name="notes"]');

    form.addEventListener('submit',()=>{
      if(!notes)return;
      const type=vehicleType?.value||'';
      const cov=coverage?.value||'';
      const selection=`Quote request: ${cov} | ${type} | Show all tint film options${eyebrow?.checked?' | Eyebrow requested':''}`.trim();
      if(!notes.value.startsWith('Quote request:')) notes.value=`${selection}\n${notes.value}`.trim();
    },true);
  }
})();
