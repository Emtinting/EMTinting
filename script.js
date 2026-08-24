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
  style.textContent = `
    .hero{background:#050505!important;min-height:620px!important;overflow:hidden!important;}
    .hero-overlay,.em-hero-slideshow,.em-hero-controls,.em-hero-label{display:none!important;}
    .hero-card{display:none!important;}
    .em-date-field{position:relative;width:100%;}
    .em-date-field input[type="date"]{width:100%;}
    .em-date-placeholder{position:absolute;left:28px;top:50%;transform:translateY(-50%);color:#f2f2f2;font-size:inherit;line-height:1;pointer-events:none;z-index:2;}
    .em-date-field.has-value .em-date-placeholder,.em-date-field:focus-within .em-date-placeholder{display:none;}
    .em-quote-builder{display:grid;gap:14px;margin-top:4px;}
    .em-addon{display:flex;align-items:center;gap:10px;color:#f2f2f2;font-size:14px;}
    .em-addon input{width:auto;}
    .em-estimate{border:1px solid #353535;background:#0d0d0d;padding:16px 18px;border-radius:4px;display:flex;justify-content:space-between;gap:16px;align-items:center;}
    .em-estimate span{color:#aaa;font-size:13px;}
    .em-estimate strong{font-size:24px;color:#fff;}
    .em-estimate small{display:block;color:#888;margin-top:4px;font-size:11px;}

    @media (max-width:620px){
      body{padding-bottom:72px!important;}.site-header{height:92px!important;padding:0 30px!important;background:#050505!important;border-bottom:2px solid #d71920!important;gap:16px!important;position:sticky!important;top:0!important;}.brand{font-size:22px!important;gap:8px!important;white-space:nowrap;}.brand-em{font-size:23px!important;}.site-header .btn-small{margin-left:auto!important;min-height:56px!important;height:56px!important;padding:0 22px!important;border-radius:4px!important;font-size:16px!important;box-shadow:none!important;}.em-menu-button{display:flex!important;width:34px;height:50px;padding:0;border:0;background:transparent;flex-direction:column;justify-content:center;gap:6px;align-items:center;}.em-menu-button i{width:28px;height:3px;background:#eee;border-radius:3px;display:block;}.hero{height:auto!important;min-height:610px!important;padding:54px 28px 72px!important;align-items:flex-start!important;background:#050505!important;}.hero-content{width:100%!important;max-width:470px!important;padding:0!important;position:relative!important;z-index:2!important;}.hero .kicker{font-size:10px!important;line-height:1.3!important;letter-spacing:.20em!important;white-space:normal!important;margin:0 0 28px!important;color:#ff3a42!important;}.hero h1{font-size:48px!important;line-height:.98!important;letter-spacing:-.05em!important;margin:0 0 28px!important;max-width:430px!important;}.hero-copy{font-size:16px!important;line-height:1.52!important;max-width:430px!important;color:#ededed!important;}.hero-actions{display:flex!important;align-items:flex-start!important;flex-direction:column!important;gap:17px!important;margin-top:30px!important;}.hero-actions .btn{height:58px!important;min-height:58px!important;padding:0 22px!important;font-size:15px!important;border-radius:4px!important;box-shadow:none!important;}.hero-actions .btn::after{content:'→';margin-left:10px;font-size:20px;font-weight:400;}.hero-actions .text-link{font-size:14px!important;font-weight:800!important;color:#fff!important;}.mobile-contact-bar{height:72px!important;grid-template-columns:1fr 1fr 1.35fr!important;background:#050505!important;border-top:1px solid #292929!important;box-shadow:none!important;}.mobile-contact-bar a{font-size:14px!important;font-weight:800!important;letter-spacing:.025em!important;border-right:1px solid #292929!important;}.mobile-contact-bar a:last-child{background:#ed1c24!important;}
    }
    @media (max-width:430px){.site-header{height:82px!important;padding:0 18px!important;gap:10px!important;}.brand{font-size:20px!important;}.brand-em{font-size:21px!important;}.site-header .btn-small{height:50px!important;min-height:50px!important;padding:0 16px!important;font-size:14px!important;}.em-menu-button{width:32px!important;}.em-menu-button i{width:26px!important;}.hero{min-height:570px!important;padding:46px 20px 64px!important;}.hero .kicker{font-size:9px!important;margin-bottom:24px!important;}.hero h1{font-size:43px!important;margin-bottom:24px!important;max-width:360px!important;}.hero-copy{font-size:14px!important;max-width:360px!important;}.hero-actions{margin-top:26px!important;}.hero-actions .btn{height:54px!important;min-height:54px!important;padding:0 18px!important;font-size:13px!important;}.hero-actions .text-link{font-size:12px!important;}}
  `;
  document.head.appendChild(style);

  const header = document.querySelector('.site-header');
  if (header && !header.querySelector('.em-menu-button')) {
    const menuButton = document.createElement('button');
    menuButton.className = 'em-menu-button';
    menuButton.type = 'button';
    menuButton.setAttribute('aria-label', 'Menu');
    menuButton.innerHTML = '<i></i><i></i><i></i>';
    header.appendChild(menuButton);
  }

  const dateInput = document.querySelector('#bookingForm input[name="appointment_date"]');
  if (dateInput && !dateInput.closest('.em-date-field')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'em-date-field';
    const placeholder = document.createElement('span');
    placeholder.className = 'em-date-placeholder';
    placeholder.textContent = 'Choose appointment Date';
    dateInput.parentNode.insertBefore(wrapper, dateInput);
    wrapper.appendChild(dateInput);
    wrapper.appendChild(placeholder);
    const syncDatePrompt = () => wrapper.classList.toggle('has-value', Boolean(dateInput.value));
    dateInput.addEventListener('change', syncDatePrompt);
    dateInput.addEventListener('input', syncDatePrompt);
    syncDatePrompt();
  }

  const form = document.querySelector('#bookingForm');
  const vehicleType = form?.querySelector('select[name="vehicle_type"]');
  if (vehicleType) {
    vehicleType.innerHTML = `<option value="">Choose vehicle type</option><option value="Sedan">Sedan</option><option value="Coupe">Coupe</option><option value="SUV">SUV</option><option value="Pickup Truck">Pickup Truck</option>`;
    vehicleType.required = true;
  }

  const film = form?.querySelector('select[name="tint_package"]');
  if (film) {
    film.innerHTML = `<option value="">Choose tint package</option><option value="Carbon">Carbon</option><option value="Ceramic IR">Ceramic IR</option><option value="Ceramic Plus">Ceramic Plus</option>`;
  }

  if (form && film && !document.querySelector('#emCoverage')) {
    const builder = document.createElement('div');
    builder.className = 'em-quote-builder';
    builder.innerHTML = `
      <select id="emCoverage" name="tint_coverage" required>
        <option value="">Choose tint coverage</option>
        <option value="Full Vehicle">Full Vehicle</option>
        <option value="Front 2 Doors">Front 2 Doors Only</option>
        <option value="Windshield Only">Windshield Only</option>
      </select>
      <label class="em-addon"><input id="emEyebrow" name="eyebrow" type="checkbox" value="yes"><span>Add windshield eyebrow (+$40)</span></label>
      <div class="em-estimate"><div><span>Estimated tint price</span><small>Final availability and appointment are confirmed by EM Tinting.</small></div><strong id="emEstimate">—</strong></div>`;
    film.closest('.form-row')?.insertAdjacentElement('afterend', builder);

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
    const coverage = document.querySelector('#emCoverage');
    const eyebrow = document.querySelector('#emEyebrow');
    const estimate = document.querySelector('#emEstimate');
    const notes = form.querySelector('textarea[name="notes"]');

    function calculateQuote(){
      const type = vehicleType?.value;
      const pkg = film.value;
      const cov = coverage.value;
      let base = null;
      if(cov==='Full Vehicle') base = PRICES[cov]?.[type]?.[pkg] ?? null;
      if(cov==='Front 2 Doors') base = PRICES[cov]?.[pkg] ?? null;
      if(cov==='Windshield Only') base = PRICES[cov]?.[pkg] ?? null;
      if(cov==='Windshield Only' && pkg && pkg!=='Ceramic Plus') {
        estimate.textContent = 'Ceramic Plus only';
        return null;
      }
      if(base===null){estimate.textContent='—';return null;}
      const total = base + (eyebrow.checked ? 40 : 0);
      estimate.textContent = `$${total}`;
      return {base,total,type,pkg,cov,eyebrow:eyebrow.checked};
    }
    [vehicleType,film,coverage,eyebrow].forEach(el=>el?.addEventListener('change',calculateQuote));

    form.addEventListener('submit',()=>{
      const q=calculateQuote();
      if(!q || !notes) return;
      const pricing = `Quote selection: ${q.cov} | ${q.type} | ${q.pkg} | Base $${q.base}${q.eyebrow?' | Eyebrow +$40':''} | Estimated total $${q.total}`;
      notes.value = `${pricing}\n${notes.value}`.trim();
    }, true);
  }
})();
