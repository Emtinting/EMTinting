// EM Tinting - smooth scrolling and conversion-focused interactions

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", function (event) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

const tintSelect = document.querySelector('select[name="tint_package"]');
if (tintSelect) {
  const wanted = [
    ['Standard Black', 'HITEK Standard Black'],
    ['Carbon IR', 'HITEK Carbon IR'],
    ['Ceramic IR', 'HITEK Ceramic IR']
  ];
  [...tintSelect.options].forEach(option => {
    if (['Ceramic Plus','Ceramic Pro'].includes(option.value) || ['Ceramic Plus','Ceramic Pro'].includes(option.textContent.trim())) option.remove();
  });
  wanted.forEach(([value, label]) => {
    let option = [...tintSelect.options].find(o => o.value === value || o.textContent.trim() === value || o.textContent.trim() === label);
    if (!option) {
      option = document.createElement('option');
      tintSelect.appendChild(option);
    }
    option.value = value;
    option.textContent = label;
  });
}

const bookingSection = document.querySelector('#book');
const servicesSection = document.querySelector('#services');

// Weekly availability CTA - intentionally does not claim a number of openings until CRM availability is connected.
if (servicesSection && !document.querySelector('#availabilityBar')) {
  const bar = document.createElement('section');
  bar.id = 'availabilityBar';
  bar.className = 'availability-bar';
  bar.innerHTML = `<div><span>APPOINTMENTS</span><strong>Check this week's availability</strong></div><a class="btn btn-small" href="#book">Check Availability</a>`;
  servicesSection.parentNode.insertBefore(bar, servicesSection);
}

// Houston heat education / comparison section.
if (bookingSection && !document.querySelector('#houstonHeat')) {
  const heat = document.createElement('section');
  heat.id = 'houstonHeat';
  heat.className = 'section heat-section';
  heat.innerHTML = `
    <div class="section-heading light-heading">
      <div><p class="kicker">BUILT FOR HOUSTON HEAT</p><h2>Choose the protection that fits your drive.</h2></div>
      <p class="section-intro">Darker glass alone does not tell the whole story. Film construction matters when your goal is a cooler, more comfortable cabin.</p>
    </div>
    <div class="heat-grid">
      <article><span>01</span><h3>Standard Black</h3><p>Best for drivers focused on privacy, glare reduction and a clean dark appearance.</p><b>Appearance focused</b></article>
      <article><span>02</span><h3>Carbon IR</h3><p>A step up for drivers who want a clean black finish with improved heat-control performance.</p><b>From $180</b></article>
      <article class="heat-featured"><span>03</span><h3>Ceramic IR</h3><p>Our premium everyday choice for stronger infrared heat control, clarity and Houston comfort.</p><b>From $300</b></article>
    </div>
    <div class="compare-cta"><a class="btn" href="#quickPrice">Get My Price</a><a class="text-link" href="sms:+13468049135?body=Hi%20EM%20Tinting%2C%20I%20need%20help%20choosing%20a%20film.">Help me choose →</a></div>
  `;
  bookingSection.parentNode.insertBefore(heat, bookingSection);
}

// Interactive price selector.
if (bookingSection && !document.querySelector('#quickPrice')) {
  const section = document.createElement('section');
  section.id = 'quickPrice';
  section.className = 'section section-white quick-price-section';
  section.innerHTML = `
    <div class="section-heading">
      <div><p class="kicker dark-kicker">GET MY PRICE</p><h2>Choose your HITEK film.</h2></div>
      <p class="section-intro">Pick a film to see the starting price, then send your vehicle details for an exact quote.</p>
    </div>
    <div class="service-grid quick-price-grid">
      <article class="service-card price-card" data-film="Standard Black"><div><p class="price-label">VALUE OPTION</p><h3>HITEK Standard Black</h3><p>Clean, non-reflective tint for privacy, glare reduction and a factory-style appearance.</p><strong>Contact for pricing</strong></div><button type="button" class="price-select">Select Standard Black</button></article>
      <article class="service-card price-card" data-film="Carbon IR"><div><p class="price-label">POPULAR UPGRADE</p><h3>HITEK Carbon IR</h3><p>Carbon film with improved heat control and a clean black finish.</p><strong>Starting at $180</strong></div><button type="button" class="price-select">Select Carbon IR</button></article>
      <article class="service-card price-card price-featured" data-film="Ceramic IR"><div><p class="price-label">BEST FOR HOUSTON HEAT</p><h3>HITEK Ceramic IR</h3><p>Premium ceramic film for stronger infrared heat control, clarity and comfort.</p><strong>Starting at $300</strong></div><button type="button" class="price-select">Select Ceramic IR</button></article>
    </div>
    <p class="price-disclaimer">Starting prices vary by vehicle size and coverage. Windshield tint is additional. Final pricing is confirmed by EM Tinting.</p>
  `;
  bookingSection.parentNode.insertBefore(section, bookingSection);
  section.querySelectorAll('.price-card').forEach(card => {
    card.querySelector('.price-select').addEventListener('click', () => {
      if (tintSelect) tintSelect.value = card.dataset.film;
      const serviceSelect = document.querySelector('select[name="service"]');
      if (serviceSelect) serviceSelect.value = 'Window Tint';
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// Referral callout. Offer is deliberately non-monetary until the business chooses the exact incentive.
const faq = document.querySelector('.faq');
if (faq && !document.querySelector('#referral')) {
  const referral = document.createElement('section');
  referral.id = 'referral';
  referral.className = 'referral-band';
  referral.innerHTML = `<div><p class="kicker">REFER A FRIEND</p><h2>Love your tint? Send someone our way.</h2><p>Ask EM Tinting about our current customer referral offer when you book.</p></div><a class="btn" href="sms:+13468049135?body=Hi%20EM%20Tinting%2C%20what%20is%20your%20current%20referral%20offer%3F">Ask About Referral Offer</a>`;
  faq.parentNode.insertBefore(referral, faq);
}

// Instagram / recent work placeholder without inventing a social handle.
if (faq && !document.querySelector('#recentWork')) {
  const recent = document.createElement('section');
  recent.id = 'recentWork';
  recent.className = 'section recent-work-section';
  recent.innerHTML = `<div class="section-heading light-heading"><div><p class="kicker">RECENT WORK</p><h2>Follow the latest EM Tinting installs.</h2></div><p class="section-intro">Recent vehicle installs and social updates are coming here next. Until then, text us to see examples of current work on a vehicle like yours.</p></div><a class="btn" href="sms:+13468049135?body=Hi%20EM%20Tinting%2C%20can%20you%20send%20me%20some%20examples%20of%20your%20recent%20work%3F">See Recent Work</a>`;
  faq.parentNode.insertBefore(recent, faq);
}

// Mobile sticky conversion button.
if (!document.querySelector('.sticky-book-now')) {
  const sticky = document.createElement('a');
  sticky.className = 'sticky-book-now';
  sticky.href = '#book';
  sticky.textContent = 'Book Now';
  document.body.appendChild(sticky);
}
