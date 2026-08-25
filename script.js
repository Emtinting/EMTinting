// EM Tinting — website enhancements

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
    .hero{background:#050505!important;min-height:620px!important;overflow:hidden!important}
    .hero-overlay,.em-hero-slideshow,.em-hero-controls,.em-hero-label,.hero-card{display:none!important}
    .em-date-field{width:100%;display:flex;flex-direction:column;gap:7px}
    .em-date-field input[type="date"]{width:100%;min-height:64px}
    .em-date-label{order:-1;color:#aaa;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;line-height:1.2}
    .em-quote-builder{display:grid;gap:14px;margin-top:4px}
    .em-addon{display:flex;align-items:center;gap:10px;color:#f2f2f2;font-size:14px}
    .em-addon input{width:auto}
    .em-instagram-work{padding:84px max(6vw,28px);background:#090909;border-top:1px solid #242424;border-bottom:1px solid #242424}
    .em-instagram-wrap{max-width:1200px;margin:0 auto}
    .em-instagram-head{display:flex;justify-content:space-between;gap:30px;align-items:end;margin-bottom:28px}
    .em-instagram-head h2{font-size:clamp(38px,5vw,64px);line-height:1;margin:0}
    .em-instagram-head p{color:#999;max-width:470px;margin:0}
    .em-instagram-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
    .em-instagram-card{position:relative;aspect-ratio:1/1;overflow:hidden;background:#151515;border-bottom:3px solid #e21a22}
    .em-instagram-card img{width:100%;height:100%;object-fit:cover;transition:.3s ease}
    .em-instagram-card:hover img{transform:scale(1.04)}
    .em-instagram-card span{position:absolute;left:10px;bottom:10px;background:rgba(0,0,0,.7);padding:6px 8px;font-size:10px;font-weight:800;letter-spacing:.08em}
    .em-instagram-actions{margin-top:24px;display:flex;gap:14px;align-items:center}
    .em-mobile-quote{display:none}
    @media(max-width:800px){
      .em-instagram-grid{grid-template-columns:repeat(2,1fr)}
      .em-instagram-card:nth-child(5){display:none}
      .em-instagram-head{display:block}
      .em-instagram-head p{margin-top:14px}
    }
    @media(max-width:620px){
      body{padding-bottom:82px!important}
      .site-header{height:92px!important;padding:0 30px!important;background:#050505!important;border-bottom:2px solid #d71920!important;gap:16px!important;position:sticky!important;top:0!important}
      .brand{font-size:22px!important;gap:8px!important;white-space:nowrap}
      .brand-em{font-size:23px!important}
      .site-header .btn-small{margin-left:auto!important;min-height:56px!important;height:56px!important;padding:0 22px!important}
      .hero{height:auto!important;min-height:610px!important;padding:54px 28px 72px!important;align-items:flex-start!important}
      .hero h1{font-size:48px!important}
      .mobile-contact-bar{display:none!important}
      .em-mobile-quote{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:9999;height:72px;background:#e21a22;color:white;align-items:center;justify-content:center;font-weight:900;font-size:17px;letter-spacing:.04em;box-shadow:0 -8px 30px rgba(0,0,0,.35)}
      .em-instagram-work{padding:62px 20px}
      .em-instagram-grid{gap:8px}
      .em-instagram-actions{display:grid}
      .em-instagram-actions .btn{width:100%}
    }
  `;
  document.head.appendChild(style);

  if (!document.querySelector('.em-mobile-quote')) {
    const a = document.createElement('a');
    a.className = 'em-mobile-quote';
    a.href = '#book';
    a.textContent = 'GET A QUOTE';
    document.body.appendChild(a);
  }

  if (!document.querySelector('.em-instagram-work')) {
    const section = document.createElement('section');
    section.className = 'em-instagram-work';
    section.id = 'recent-work';
    section.innerHTML = `<div class="em-instagram-wrap"><div class="em-instagram-head"><div><p class="kicker">RECENT WORK</p><h2>See what we’ve been tinting.</h2></div><p>A quick look at recent EM Tinting installs. Tap any photo to open our Instagram and see more finished vehicles, shades and film options.</p></div><div class="em-instagram-grid">${[1,2,3,4,5].map((n,i)=>`<a class="em-instagram-card" href="https://www.instagram.com/em_tinting/" target="_blank" rel="noopener noreferrer"><img src="media/hero-0${n}.jpg" alt="EM Tinting recent window tint installation ${n}" loading="lazy"><span>${i===0?'CERAMIC TINT':i===1?'WINDOW TINT':i===2?'RECENT INSTALL':i===3?'EM TINTING':'HOUSTON TX'}</span></a>`).join('')}</div><div class="em-instagram-actions"><a class="btn" href="https://www.instagram.com/em_tinting/" target="_blank" rel="noopener noreferrer">View More on Instagram</a><span style="color:#888;font-size:13px">@em_tinting</span></div></div>`;
    const booking = document.querySelector('#book');
    if (booking) booking.parentNode.insertBefore(section, booking);
    else document.querySelector('footer')?.before(section);
  }

  const dateInput = document.querySelector('#bookingForm input[name="appointment_date"]');
  if (dateInput && !dateInput.closest('.em-date-field')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'em-date-field';
    const label = document.createElement('span');
    label.className = 'em-date-label';
    label.textContent = 'Appointment date';
    dateInput.parentNode.insertBefore(wrapper, dateInput);
    wrapper.appendChild(dateInput);
    wrapper.appendChild(label);
  }

  const form = document.querySelector('#bookingForm');
  const vehicleType = form?.querySelector('select[name="vehicle_type"]');
  const film = form?.querySelector('select[name="tint_package"]');

  if (vehicleType) {
    vehicleType.innerHTML = '<option value="">Choose vehicle type</option><option>Sedan</option><option>Coupe</option><option>SUV</option><option value="Pickup Truck">Pickup Truck</option>';
    vehicleType.required = true;
  }

  if (film) {
    film.value = '';
    film.removeAttribute('required');
    film.closest('.form-row')?.classList.add('em-no-film-choice');
    film.style.display = 'none';
  }

  if (form && !document.querySelector('#emCoverage')) {
    const builder = document.createElement('div');
    builder.className = 'em-quote-builder';
    builder.innerHTML = '<select id="emCoverage" name="tint_coverage" required><option value="">Choose tint coverage</option><option>Full Vehicle</option><option>Front 2 Doors</option><option>Windshield Only</option></select><label class="em-addon"><input id="emEyebrow" name="eyebrow" type="checkbox" value="yes"><span>Add windshield eyebrow</span></label>';
    const dateRow = dateInput?.closest('.form-row');
    if (dateRow) dateRow.insertAdjacentElement('beforebegin', builder);
    else form.querySelector('textarea[name="notes"]')?.insertAdjacentElement('beforebegin', builder);

    const coverage = document.querySelector('#emCoverage');
    const eyebrow = document.querySelector('#emEyebrow');
    const notes = form.querySelector('textarea[name="notes"]');
    form.addEventListener('submit', () => {
      if (!notes) return;
      const type = vehicleType?.value || '';
      const cov = coverage?.value || '';
      const selection = `Quote request: ${cov} | ${type} | Show all tint film options${eyebrow?.checked?' | Eyebrow requested':''}`.trim();
      if (!notes.value.startsWith('Quote request:')) notes.value = `${selection}\n${notes.value}`.trim();
    }, true);
  }
})();
