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
    .hero{min-height:720px!important;overflow:hidden!important}
    .em-hero-slideshow,.em-hero-controls,.em-hero-label{display:none!important}
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
    @media(max-width:800px){.em-instagram-grid{grid-template-columns:repeat(2,1fr)}.em-instagram-card:nth-child(5){display:none}.em-instagram-head{display:block}.em-instagram-head p{margin-top:14px}}
    @media(max-width:620px){body{padding-bottom:82px!important}.site-header{height:92px!important;padding:0 30px!important;background:#050505!important;border-bottom:2px solid #d71920!important;gap:16px!important;position:sticky!important;top:0!important}.brand{font-size:22px!important;gap:8px!important;white-space:nowrap}.brand-em{font-size:23px!important}.site-header .btn-small{margin-left:auto!important;min-height:56px!important;height:56px!important;padding:0 22px!important}.hero{height:auto!important;min-height:610px!important;padding:54px 28px 72px!important;align-items:flex-start!important}.hero h1{font-size:48px!important}.mobile-contact-bar{display:none!important}.em-mobile-quote{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:9999;height:72px;background:#e21a22;color:white;align-items:center;justify-content:center;font-weight:900;font-size:17px;letter-spacing:.04em;box-shadow:0 -8px 30px rgba(0,0,0,.35)}.em-instagram-work{padding:62px 20px}.em-instagram-grid{gap:8px}.em-instagram-actions{display:grid}.em-instagram-actions .btn{width:100%}}
  `;
  document.head.appendChild(style);

  if (!document.querySelector('.em-mobile-quote')) { const a=document.createElement('a'); a.className='em-mobile-quote'; a.href='#book'; a.textContent='GET A QUOTE'; document.body.appendChild(a); }
  if (!document.querySelector('.em-instagram-work')) {
    const section=document.createElement('section'); section.className='em-instagram-work'; section.id='recent-work';
    section.innerHTML=`<div class="em-instagram-wrap"><div class="em-instagram-head"><div><p class="kicker">RECENT WORK</p><h2>See what we’ve been tinting.</h2></div><p>A quick look at recent EM Tinting installs. Tap any photo to open our Instagram and see more finished vehicles, shades and film options.</p></div><div class="em-instagram-grid">${[1,2,3,4,5].map((n,i)=>`<a class="em-instagram-card" href="https://www.instagram.com/em_tinting/" target="_blank" rel="noopener noreferrer"><img src="media/hero-0${n}.jpg" alt="EM Tinting recent window tint installation ${n}" loading="lazy"><span>${i===0?'CERAMIC TINT':i===1?'WINDOW TINT':i===2?'RECENT INSTALL':i===3?'EM TINTING':'HOUSTON TX'}</span></a>`).join('')}</div><div class="em-instagram-actions"><a class="btn" href="https://www.instagram.com/em_tinting/" target="_blank" rel="noopener noreferrer">View More on Instagram</a><span style="color:#888;font-size:13px">@em_tinting</span></div></div>`;
    const booking=document.querySelector('#book'); if(booking) booking.parentNode.insertBefore(section,booking); else document.querySelector('footer')?.before(section);
  }
  const dateInput=document.querySelector('#bookingForm input[name="appointment_date"]');
  if(dateInput&&!dateInput.closest('.em-date-field')){const wrapper=document.createElement('div');wrapper.className='em-date-field';const label=document.createElement('span');label.className='em-date-label';label.textContent='Appointment date';dateInput.parentNode.insertBefore(wrapper,dateInput);wrapper.appendChild(dateInput);wrapper.appendChild(label);}
  const form=document.querySelector('#bookingForm'); const vehicleType=form?.querySelector('select[name="vehicle_type"]'); const film=form?.querySelector('select[name="tint_package"]');
  if(vehicleType){vehicleType.innerHTML='<option value="">Choose vehicle type</option><option>Sedan</option><option>Coupe</option><option>SUV</option><option value="Pickup Truck">Pickup Truck</option>';vehicleType.required=true;}
  if(film){film.style.display='block';film.closest('.form-row')?.classList.remove('em-no-film-choice');}
  if(form&&!document.querySelector('#emCoverage')){
    const builder=document.createElement('div');builder.className='em-quote-builder';builder.innerHTML='<select id="emCoverage" name="tint_coverage" required><option value="">Choose tint coverage</option><option>Full Vehicle</option><option>Front 2 Doors</option><option>Windshield Only</option><option>Tint Removal</option></select><label class="em-addon"><input id="emEyebrow" name="eyebrow" type="checkbox" value="yes"><span>Add windshield eyebrow</span></label>';
    const dateRow=dateInput?.closest('.form-row'); if(dateRow) dateRow.insertAdjacentElement('beforebegin',builder); else form.querySelector('textarea[name="notes"]')?.insertAdjacentElement('beforebegin',builder);
    const coverage=document.querySelector('#emCoverage');const eyebrow=document.querySelector('#emEyebrow');const notes=form.querySelector('textarea[name="notes"]');const service=form.querySelector('select[name="service"]');function syncCoverage(){const tint=!service?.value||service.value==='Window Tint'||service.value==='Multiple Services';coverage.required=tint;builder.style.display=tint?'grid':'none';if(!tint){coverage.value='';eyebrow.checked=false;}}service?.addEventListener('change',syncCoverage);syncCoverage();
    form.addEventListener('submit',()=>{if(!notes)return;const type=vehicleType?.value||'';const cov=coverage?.value||'';const selection=`Quote request: ${cov} | ${type} | Show all tint film options${eyebrow?.checked?' | Eyebrow requested':''}`.trim();if(!notes.value.startsWith('Quote request:'))notes.value=`${selection}\
${notes.value}`.trim();},true);
  }
})();

// EM Tinting — single BMW tint visualizer (no legacy toy car)
(() => {
  function initialize(){
    const form=document.getElementById('bookingForm');
    const anchor=document.getElementById('why');
    if(!form||!anchor||document.getElementById('emTintVisualizer'))return;
    const section=document.createElement('section');
    section.id='emTintVisualizer';
    section.className='em-shade-section';
    const options=[[70,'NEARLY CLEAR'],[50,'LIGHT GRAY'],[35,'MEDIUM'],[20,'DARK'],[15,'VERY DARK'],[5,'LIMO DARK']];
    section.innerHTML=`<div class="em-shade-wrap"><div class="em-shade-head"><div><p class="kicker">TINT SHADE VISUALIZER</p><h2>SEE HOW <em>DARK</em> YOU<br>WANT TO GO.</h2></div><p>Compare window tint shades on a BMW coupe. Select a shade to see the difference in appearance and privacy.</p></div><div class="em-shade-ui"><div><div class="em-shade-stage"><div class="bmw-shade-stage"><img class="bmw-shade-image" src="media/red-bmw-m3.webp?v=20261109-original-hd" alt="Red BMW M3 side profile tint preview"><span class="bmw-shade-label" id="emShadeLabel">70% VLT</span><svg class="bmw-window-mask" viewBox="0 0 3300 960" preserveAspectRatio="none" aria-hidden="true"><defs><clipPath id="em-glass-clip"><path d="M775 286 Q785 246 825 220 Q965 149 1115 133 L1394 130 L1394 345 L853 340 Q798 332 775 286 Z"/><path d="M1458 132 Q1640 134 1805 163 Q1960 201 2205 345 L2170 365 L1458 344 Z"/></clipPath></defs><g clip-path="url(#em-glass-clip)"><rect x="740" y="105" width="1300" height="275" class="em-glass-fill"/></g></svg></div></div><div class="em-shade-selected">Selected shade: <strong id="emShadeSelected">70% — Nearly Clear</strong></div><p class="em-shade-note">Illustrative shade comparison. Actual appearance varies by film, glass and lighting.</p></div><div class="em-shade-controls" aria-label="Choose tint shade">${options.map(([v,t])=>`<button type="button" class="em-shade-btn" data-shade="${v}" aria-pressed="false"><strong>${v}%</strong><span>${t}</span></button>`).join('')}</div></div></div>`;
    anchor.parentNode.insertBefore(section,anchor);
    const label=section.querySelector('#emShadeLabel');
    const selected=section.querySelector('#emShadeSelected');
    const glass=section.querySelectorAll('.bmw-window-mask .em-glass-fill');
    const field=form.querySelector('select[name="preferred_shade"]')||form.querySelector('input[name="preferred_shade"]');
    const shades={70:['rgba(194,208,218,.035)','Nearly Clear'],50:['rgba(140,151,162,.22)','Light Gray'],35:['rgba(40,48,58,.32)','Medium'],20:['rgba(10,14,19,.50)','Dark'],15:['rgba(4,7,10,.66)','Very Dark'],5:['rgba(0,0,0,.90)','Limo Dark']};
    function choose(v){
      const d=shades[v];if(!d)return;
      glass.forEach(p=>p.style.fill=d[0]);
      label.textContent=v+'% VLT';
      selected.textContent=v+'% — '+d[1];
      if(field)field.value=v+'%';
      section.querySelectorAll('[data-shade]').forEach(btn=>{const on=Number(btn.dataset.shade)===v;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',String(on))});
    }
    section.querySelectorAll('[data-shade]').forEach(btn=>btn.addEventListener('click',()=>choose(Number(btn.dataset.shade))));
    if(field)field.addEventListener('change',()=>{const v=parseInt(field.value,10);if(shades[v])choose(v)});
    choose(70);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize);else initialize();
})();

// EM Tinting — package finder: public Carbon starting price, ceramic pricing stays internal
(() => {
  const form=document.querySelector('#bookingForm');if(!form||document.querySelector('#emInstantQuote'))return;const service=form.querySelector('select[name="service"]'),vehicle=form.querySelector('select[name="vehicle_type"]'),coverage=document.querySelector('#emCoverage'),eyebrow=document.querySelector('#emEyebrow'),film=form.querySelector('select[name="tint_package"]');if(!service||!vehicle||!coverage)return;
  const style=document.createElement('style');style.textContent=`.em-instant{display:none;margin:4px 0;padding:18px;border:1px solid #333;background:#0c0c0c}.em-instant.show{display:block}.em-instant-head{margin-bottom:13px}.em-instant-head strong{display:block;font-size:19px;color:#fff}.em-instant-head span{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.08em}.em-instant-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.em-instant-card{border:1px solid #2d2d2d;background:#141414;padding:15px;cursor:pointer;color:#fff;text-align:left;font:inherit}.em-instant-card.active{border-color:#e21a22;box-shadow:inset 3px 0 0 #e21a22}.em-instant-card b{display:block;font-size:14px}.em-instant-card strong{display:block;font-size:24px;margin-top:8px}.em-instant-card small{display:block;color:#888;margin-top:6px;line-height:1.35}.em-instant-card .contact-price{font-size:17px}.em-instant-note{font-size:11px;color:#777;margin:12px 0 0}.em-instant-loading{color:#888;font-size:13px}@media(max-width:620px){.em-instant-grid{grid-template-columns:1fr}}`;document.head.appendChild(style);
  const box=document.createElement('div');box.id='emInstantQuote';box.className='em-instant';box.innerHTML='<div class="em-instant-head"><span>Find your tint package</span><strong>Choose the option that fits you.</strong></div><div id="emInstantBody" class="em-instant-loading">Choose Window Tint, vehicle type and coverage to see your options.</div><p class="em-instant-note">Carbon shows a starting estimate. Ceramic IR and Ceramic Plus are personalized to your vehicle and will be quoted by EM Tinting.</p>';
  const dateField=form.querySelector('.em-date-field')||form.querySelector('input[name="appointment_date"]');if(dateField)dateField.insertAdjacentElement('beforebegin',box);else form.querySelector('button[type="submit"]')?.insertAdjacentElement('beforebegin',box);const body=box.querySelector('#emInstantBody');let pricing=[],addon=40,loaded=false,selectedPackage='';const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n||0));
  async function loadPricing(){if(loaded)return;try{const r=await fetch('https://neuginokjfvnkmlzhwoa.supabase.co/functions/v1/public-pricing',{cache:'no-store'});const data=await r.json();if(!r.ok)throw new Error();pricing=data.pricing||[];addon=Number(data.eyebrow_addon||40);loaded=true;render();}catch(e){body.textContent='Package pricing is temporarily unavailable. You can still request a quote.';}}
  function selectPackage(name){selectedPackage=name;if(film){film.style.display='none';film.value=name;}body.querySelectorAll('.em-instant-card').forEach(card=>card.classList.toggle('active',card.dataset.package===name));}
  function render(){const isTint=service.value==='Window Tint';if(!isTint){box.classList.remove('show');return;}box.classList.add('show');if(!vehicle.value||!coverage.value){body.className='em-instant-loading';body.textContent='Choose your vehicle type and tint coverage to see your options.';return;}if(!loaded){body.textContent='Loading package options…';loadPricing();return;}const rows=pricing.filter(x=>x.vehicle_type===vehicle.value&&x.coverage===coverage.value);const carbon=rows.find(x=>x.film_package==='Carbon');const packages=['Carbon','Ceramic IR','Ceramic Plus'];body.className='em-instant-grid';body.innerHTML=packages.map(name=>{const row=rows.find(x=>x.film_package===name);if(name==='Carbon'&&carbon){const total=Number(carbon.price)+(eyebrow?.checked?addon:0);return `<button type="button" class="em-instant-card" data-package="Carbon"><b>HITEK Carbon</b><small>Great everyday tint • Privacy • UV protection</small><strong>Starting at ${money(total)}</strong></button>`;}const tag=name==='Ceramic IR'?'Most Popular • Better heat rejection':'Premium • Maximum heat rejection';return `<button type="button" class="em-instant-card" data-package="${name}"><b>HITEK ${name}</b><small>${tag}</small><strong class="contact-price">Get My Price</strong></button>`;}).join('');body.querySelectorAll('.em-instant-card').forEach(card=>card.addEventListener('click',()=>selectPackage(card.dataset.package)));if(selectedPackage)selectPackage(selectedPackage);}
  [service,vehicle,coverage,eyebrow].forEach(el=>el?.addEventListener('change',render));loadPricing();render();
})();

// EM Tinting — Google review CTA
(() => {
  if(document.querySelector('#emGoogleReview'))return;
  const booking=document.querySelector('#book');
  const footer=document.querySelector('footer');
  if(!booking&&!footer)return;
  const style=document.createElement('style');
  style.textContent=`.em-review-section{padding:58px max(6vw,28px);background:#fff;color:#111;border-top:1px solid #ddd}.em-review-wrap{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:36px}.em-review-copy .stars{font-size:24px;letter-spacing:4px;margin-bottom:8px}.em-review-copy h2{font-size:clamp(30px,4vw,48px);line-height:1;margin:0 0 12px}.em-review-copy p{margin:0;color:#555;max-width:620px}.em-review-btn{display:inline-flex;align-items:center;justify-content:center;min-height:54px;padding:0 22px;background:#e21a22;color:#fff;text-decoration:none;font-weight:900;white-space:nowrap}.em-review-btn:hover{background:#bd1319}@media(max-width:720px){.em-review-section{padding:48px 20px}.em-review-wrap{display:block}.em-review-btn{width:100%;margin-top:22px}}`;
  document.head.appendChild(style);
  const section=document.createElement('section');section.id='emGoogleReview';section.className='em-review-section';
  section.innerHTML=`<div class="em-review-wrap"><div class="em-review-copy"><div class="stars" aria-label="5 stars">★★★★★</div><h2>Happy with your tint?</h2><p>Your feedback helps local drivers find EM Tinting. If we’ve worked on your vehicle, we’d appreciate a quick Google review.</p></div><a class="em-review-btn" href="https://g.page/r/CctrPJPx2tdIEBM/review" target="_blank" rel="noopener noreferrer">Leave Us a Google Review</a></div>`;
  if(footer)footer.parentNode.insertBefore(section,footer);else booking.parentNode.insertBefore(section,booking.nextSibling);
})();

// EM Tinting — booking attempt tracker for CRM
(() => {
  const form=document.querySelector('#bookingForm');
  if(!form||form.dataset.attemptTracking==='1')return;
  form.dataset.attemptTracking='1';
  const endpoint='https://neuginokjfvnkmlzhwoa.supabase.co/rest/v1/booking_attempts?on_conflict=session_id';
  const apiKey='sb_publishable_T-XFCPWnkn_meQPK0AKA6A_hRvfRXGk';
  const storageKey='em_booking_attempt_session';
  let sessionId=sessionStorage.getItem(storageKey);
  if(!sessionId){sessionId=(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`);sessionStorage.setItem(storageKey,sessionId);}
  let lastSnapshot={};
  let timer=null;
  let started=false;
  const val=name=>String(form.elements[name]?.value||'').trim();
  const clip=(value,max=500)=>String(value||'').slice(0,max)||null;
  function snapshot(){
    const data={
      first_name:clip(val('first_name'),80),last_name:clip(val('last_name'),80),phone:clip(val('phone'),40),email:clip(val('email'),160),
      vehicle_year:clip(val('vehicle_year'),10),vehicle_make:clip(val('vehicle_make'),80),vehicle_model:clip(val('vehicle_model'),80),vehicle_type:clip(val('vehicle_type'),60),
      service:clip(val('service'),100),tint_coverage:clip(val('tint_coverage'),100),tint_package:clip(val('tint_package'),100),preferred_shade:clip(val('preferred_shade'),20),
      appointment_date:val('appointment_date')||null,appointment_time:val('appointment_time')||null,
      windshield:Boolean(form.elements.windshield?.checked),eyebrow:Boolean(form.elements.eyebrow?.checked),notes:clip(val('notes'),1000)
    };
    lastSnapshot={...lastSnapshot,...data};
    return data;
  }
  async function send(event,extra={},saved=false){
    const fields=saved?lastSnapshot:snapshot();
    const body={session_id:sessionId,last_seen_at:new Date().toISOString(),updated_at:new Date().toISOString(),last_event:event,page_url:clip(location.href,500),referrer:clip(document.referrer,500),user_agent:clip(navigator.userAgent,500),...fields,...extra};
    try{await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','apikey':apiKey,'Authorization':`Bearer ${apiKey}`,'Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(body),keepalive:true});}catch(_){ }
  }
  function queue(event='editing'){clearTimeout(timer);timer=setTimeout(()=>send(event),700);}
  form.addEventListener('focusin',()=>{if(started)return;started=true;send('started');},{once:true});
  form.addEventListener('input',()=>queue('editing'));
  form.addEventListener('change',()=>queue('editing'));
  form.addEventListener('submit',()=>{clearTimeout(timer);lastSnapshot=snapshot();send('submit_clicked',{},true);},true);
  const status=document.querySelector('#bookingStatus');
  if(status){new MutationObserver(()=>{const text=(status.textContent||'').trim();if(!text)return;if(text.startsWith('Thanks!'))send('completed',{completed:true,error_message:null},true);else if(!text.startsWith('Sending')&&(text.includes('Unable')||text.includes('also call')||text.includes('error')))send('error',{completed:false,error_message:clip(text,500)},true);}).observe(status,{childList:true,subtree:true,characterData:true});}
})();

// EM Tinting — accepted quote -> booking handoff + confirmation
(() => {
  const form=document.querySelector('#bookingForm'); if(!form)return;
  const token=new URLSearchParams(location.search).get('quote'); if(!token)return;
  let hidden=form.querySelector('input[name="quote_token"]'); if(!hidden){hidden=document.createElement('input');hidden.type='hidden';hidden.name='quote_token';form.appendChild(hidden);} hidden.value=token;
  const note=document.createElement('div'); note.className='em-accepted-booking'; note.innerHTML='<strong>✓ Your tint package is selected.</strong><span>Choose your appointment date and time below. Your accepted quote will be attached automatically.</span>';
  form.prepend(note);
  const style=document.createElement('style'); style.textContent='.em-accepted-booking{grid-column:1/-1;background:#101214;border:1px solid #e21a22;border-left:4px solid #e21a22;padding:16px 18px;margin-bottom:10px;display:grid;gap:5px}.em-accepted-booking strong{color:#fff;font-size:17px}.em-accepted-booking span{color:#aaa;font-size:13px}.em-booked-confirm{background:#101214;border:1px solid #333;border-top:4px solid #e21a22;padding:24px;margin-top:14px}.em-booked-confirm h3{font-size:27px;margin:0 0 10px}.em-booked-confirm .em-confirm-row{display:flex;justify-content:space-between;gap:20px;padding:9px 0;border-bottom:1px solid #292929}.em-booked-confirm .em-confirm-row span{color:#999}.em-booked-confirm .em-confirm-row b{color:#fff;text-align:right}'; document.head.appendChild(style);
  form.addEventListener('submit',()=>{hidden.value=token;},true);
  const status=document.querySelector('#bookingStatus');
  if(status){new MutationObserver(()=>{if(!status.textContent.startsWith('Thanks!'))return; const date=form.dataset.lastBookingDate, time=form.dataset.lastBookingTime;}).observe(status,{childList:true,subtree:true});}
})();
