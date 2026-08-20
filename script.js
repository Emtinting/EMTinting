// EM Tinting - smooth scrolling and interactive pricing

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
  const optionMap = [
    ['Standard Black', 'HITEK Standard Black'],
    ['Carbon IR', 'HITEK Carbon IR'],
    ['Ceramic IR', 'HITEK Ceramic IR']
  ];

  optionMap.forEach(([value, label]) => {
    if (![...tintSelect.options].some(option => option.value === value)) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      tintSelect.appendChild(option);
    }
  });
}

const bookingSection = document.querySelector('#book');
if (bookingSection && !document.querySelector('#quickPrice')) {
  const section = document.createElement('section');
  section.id = 'quickPrice';
  section.className = 'section section-white quick-price-section';
  section.innerHTML = `
    <div class="section-heading">
      <div>
        <p class="kicker dark-kicker">GET MY PRICE</p>
        <h2>Choose your HITEK film.</h2>
      </div>
      <p class="section-intro">Pick a film to see the starting price, then send your vehicle details for an exact quote.</p>
    </div>
    <div class="service-grid quick-price-grid">
      <article class="service-card price-card" data-film="Standard Black" data-price="">
        <div><h3>HITEK Standard Black</h3><p>Clean, non-reflective entry-level tint with a factory-style appearance.</p><strong>Contact for pricing</strong></div>
      </article>
      <article class="service-card price-card" data-film="Carbon IR" data-price="$180">
        <div><h3>HITEK Carbon IR</h3><p>Carbon film option with improved heat rejection and a clean black finish.</p><strong>Starting at $180</strong></div>
      </article>
      <article class="service-card price-card" data-film="Ceramic IR" data-price="$300">
        <div><h3>HITEK Ceramic IR</h3><p>Premium ceramic option for stronger heat control and everyday comfort.</p><strong>Starting at $300</strong></div>
      </article>
    </div>
    <p class="form-help">Starting prices vary by vehicle size and coverage. Windshield tint is additional.</p>
  `;

  bookingSection.parentNode.insertBefore(section, bookingSection);

  section.querySelectorAll('.price-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      if (tintSelect) tintSelect.value = card.dataset.film;
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}
