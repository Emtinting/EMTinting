(() => {
  const FILMS = {
    Carbon: {
      name: 'Carbon IR',
      badge: 'Carbon',
      heat: '62% IR rejection @ 5%',
      solar: '61% TSER @ 5%',
      uv: '99% UV rejection',
      warranty: 'Lifetime warranty · Color stable',
      description: 'Nano-carbon technology engineered for strong infrared heat rejection without interfering with electronic signals.',
      image: 'https://hitekfilms.com/wp-content/uploads/2022/05/carbon-IR-1-1024x1024.jpg',
      source: 'https://hitekfilms.com/product/carbon-ir/'
    },
    'Ceramic IR': {
      name: 'Ceramic IR',
      badge: 'Ceramic',
      heat: '75% IR rejection @ 5%',
      solar: '65% TSER @ 5%',
      uv: '99% UV rejection',
      warranty: 'Lifetime warranty',
      description: 'Carbon-based nano-ceramic film with infrared-rejection technology for increased heat protection, optical clarity, style, and stability.',
      image: 'https://hitekfilms.com/wp-content/uploads/2022/05/Ceramic-IR.png',
      source: 'https://hitekfilms.com/product/ceramic-ir/'
    },
    'Ceramic Plus': {
      name: 'Ceramic Plus',
      badge: 'Premium Ceramic',
      heat: 'Up to 92% IR rejection',
      solar: 'Up to 69% TSER',
      uv: '99% UV rejection',
      warranty: 'Lifetime warranty · Color stable',
      description: 'Carbon-infused nano-ceramic technology built for premium infrared heat control, clarity, durability, and no signal interference.',
      image: 'https://hitekfilms.com/wp-content/uploads/2022/05/Ceramic-plus-Carbon-1024x813.png',
      source: 'https://hitekfilms.com/product/ceramic-plus/'
    }
  };

  function initFilmSelector() {
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
    panel.innerHTML = `
      <img id="filmInfoImage" alt="HITEK film performance specifications" loading="lazy">
      <div class="film-info-copy">
        <div class="film-info-heading"><span id="filmInfoBadge"></span><strong id="filmInfoName"></strong></div>
        <p id="filmInfoDescription"></p>
        <div class="film-spec-grid">
          <div><small>Heat / IR</small><b id="filmInfoHeat"></b></div>
          <div><small>Solar Rejection</small><b id="filmInfoSolar"></b></div>
          <div><small>UV Protection</small><b id="filmInfoUV"></b></div>
          <div><small>Coverage</small><b id="filmInfoWarranty"></b></div>
        </div>
        <a id="filmInfoSource" target="_blank" rel="noopener noreferrer">View HITEK product details</a>
      </div>`;
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

    document.querySelectorAll('input[name="quoteFilm"]').forEach(input => {
      input.addEventListener('change', () => render(input.value));
    });

    form.addEventListener('reset', () => {
      hidden.value = '';
      panel.classList.add('hidden');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initFilmSelector);
  else initFilmSelector();
})();