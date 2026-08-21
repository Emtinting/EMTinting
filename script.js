// EM Tinting — homepage slideshow + mobile presentation

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

  const slides = [
    { src: 'media/hero-01-enhanced.svg', label: 'TESLA MODEL Y', mobilePosition: '96% 53%' },
    { src: 'media/hero-02.jpg', label: 'FORD F-150', mobilePosition: '94% 54%' },
    { src: 'media/hero-03.jpg', label: 'GMC DENALI HD', mobilePosition: '94% 54%' },
    { src: 'media/hero-04.jpg', label: 'CADILLAC ESCALADE', mobilePosition: '94% 54%' },
    { src: 'media/hero-05.jpg', label: 'TESLA MODEL Y', mobilePosition: '94% 54%' }
  ];

  const style = document.createElement('style');
  style.textContent = `
    .hero{background:#050505!important;isolation:isolate}
    .hero-card{display:none!important}
    .em-hero-slideshow{position:absolute;inset:0;z-index:0;overflow:hidden;background:#050505}
    .em-hero-slide{position:absolute;inset:0;background-size:cover;background-position:center;background-repeat:no-repeat;opacity:0;transition:opacity .8s ease;filter:contrast(1.05) saturate(1.04)}
    .em-hero-slide.active{opacity:1}
    .hero-overlay{z-index:1!important;background:linear-gradient(90deg,rgba(0,0,0,.93) 0%,rgba(0,0,0,.73) 31%,rgba(0,0,0,.30) 54%,rgba(0,0,0,.05) 74%,transparent 100%),linear-gradient(0deg,rgba(5,5,5,.56) 0%,rgba(5,5,5,.06) 28%,transparent 58%)!important}
    .em-hero-controls{position:absolute;z-index:6;left:max(5vw,28px);right:max(5vw,28px);bottom:32px;display:flex;justify-content:space-between;align-items:center;pointer-events:none}
    .em-hero-arrow{pointer-events:auto;width:50px;height:50px;border-radius:50%;border:1px solid rgba(255,255,255,.30);background:rgba(0,0,0,.46);color:#fff;font-size:32px;line-height:1;display:grid;place-items:center;cursor:pointer}
    .em-hero-dots{pointer-events:auto;display:flex;gap:10px;align-items:center}
    .em-hero-dot{width:9px;height:9px;padding:0;border:0;border-radius:50%;background:#999;opacity:.9;cursor:pointer}
    .em-hero-dot.active{background:#ed1c24}
    .em-hero-label{position:absolute;z-index:6;right:max(5vw,28px);bottom:92px;color:#c9c9c9;font-size:10px;letter-spacing:.24em;font-style:italic}
    .em-menu-button{display:none}

    @media (max-width:620px){
      body{padding-bottom:72px!important}
      .site-header{height:92px!important;padding:0 30px!important;background:#050505!important;border-bottom:2px solid #d71920!important;gap:16px!important;position:sticky!important;top:0!important}
      .brand{font-size:22px!important;gap:8px!important;white-space:nowrap}
      .brand-em{font-size:23px!important}
      .site-header .btn-small{margin-left:auto!important;min-height:56px!important;height:56px!important;padding:0 22px!important;border-radius:4px!important;font-size:16px!important;box-shadow:none!important}
      .em-menu-button{display:flex!important;width:34px;height:50px;padding:0;border:0;background:transparent;flex-direction:column;justify-content:center;gap:6px;align-items:center}
      .em-menu-button i{width:28px;height:3px;background:#eee;border-radius:3px;display:block}

      .hero{height:760px!important;min-height:760px!important;padding:74px 22px 106px!important;align-items:flex-start!important}
      .hero-content{width:54%!important;max-width:238px!important;padding:0!important;z-index:3!important}
      .hero .kicker{font-size:8px!important;line-height:1.35!important;letter-spacing:.22em!important;white-space:normal!important;margin:0 0 23px!important;color:#ff3a42!important;max-width:225px!important}
      .hero h1{font-size:40px!important;line-height:.98!important;letter-spacing:-.045em!important;margin:0 0 22px!important;max-width:225px!important;font-weight:850!important}
      .hero h1 span{color:#c6c6c6!important}
      .hero-copy{font-size:12px!important;line-height:1.48!important;max-width:220px!important;color:#ededed!important;margin:0!important}
      .hero-actions{display:flex!important;align-items:flex-start!important;flex-direction:column!important;gap:14px!important;margin-top:23px!important}
      .hero-actions .btn{height:52px!important;min-height:52px!important;padding:0 18px!important;font-size:12px!important;border-radius:4px!important;box-shadow:none!important;white-space:nowrap!important}
      .hero-actions .btn::after{content:'→';margin-left:10px;font-size:17px;font-weight:400}
      .hero-actions .text-link{font-size:11px!important;font-weight:800!important;color:#fff!important;white-space:nowrap!important}

      .em-hero-slide{background-size:auto 86%!important;background-position:var(--mobile-position)!important;background-color:#050505!important;filter:contrast(1.08) saturate(1.06)}
      .hero-overlay{background:linear-gradient(90deg,rgba(0,0,0,.96) 0%,rgba(0,0,0,.84) 24%,rgba(0,0,0,.51) 39%,rgba(0,0,0,.12) 53%,rgba(0,0,0,.01) 64%,transparent 100%),linear-gradient(0deg,rgba(5,5,5,.64) 0%,rgba(5,5,5,.08) 22%,transparent 44%)!important}
      .em-hero-controls{left:22px!important;right:22px!important;bottom:62px!important}
      .em-hero-arrow{width:44px!important;height:44px!important;font-size:28px!important;background:rgba(0,0,0,.40)!important}
      .em-hero-dots{position:absolute;left:50%;transform:translateX(-50%);bottom:-7px;gap:12px!important}
      .em-hero-dot{width:9px!important;height:9px!important}
      .em-hero-label{right:22px!important;bottom:21px!important;font-size:8px!important}
      .em-hero-label::after{content:'';display:inline-block;width:42px;height:1px;background:#aaa;margin:0 0 3px 10px}
      .hero::after{height:4px!important;width:31%!important;background:linear-gradient(90deg,#e21a22,transparent)!important}

      .trust-strip{display:grid!important;grid-template-columns:1fr 1fr!important;margin:0!important;max-width:none!important;border:0!important;background:#050505!important}
      .trust-strip span{height:104px!important;padding:0 18px!important;display:flex!important;align-items:center!important;text-align:left!important;border-right:1px solid #292929!important;border-bottom:1px solid #292929!important;color:#ddd!important;font-size:11px!important;line-height:1.18!important;letter-spacing:.045em!important}
      .trust-strip span:nth-child(2n){border-right:0!important}
      .trust-strip span:nth-child(n+3){border-bottom:0!important}
      .mobile-contact-bar{height:72px!important;grid-template-columns:1fr 1fr 1.35fr!important;background:#050505!important;border-top:1px solid #292929!important;box-shadow:none!important}
      .mobile-contact-bar a{font-size:14px!important;font-weight:800!important;letter-spacing:.025em!important;border-right:1px solid #292929!important}
      .mobile-contact-bar a:last-child{background:#ed1c24!important}
    }

    @media (max-width:430px){
      .site-header{height:82px!important;padding:0 18px!important;gap:10px!important}
      .brand{font-size:20px!important}.brand-em{font-size:21px!important}
      .site-header .btn-small{height:50px!important;min-height:50px!important;padding:0 16px!important;font-size:14px!important}
      .em-menu-button{width:32px!important}.em-menu-button i{width:26px!important}
      .hero{height:705px!important;min-height:705px!important;padding:52px 18px 96px!important}
      .hero-content{width:55%!important;max-width:212px!important}
      .hero .kicker{font-size:7px!important;margin-bottom:20px!important;letter-spacing:.21em!important;max-width:205px!important}
      .hero h1{font-size:36px!important;margin-bottom:20px!important;max-width:205px!important;line-height:.98!important}
      .hero-copy{font-size:11px!important;line-height:1.45!important;max-width:200px!important}
      .hero-actions{margin-top:20px!important}
      .hero-actions .btn{height:48px!important;min-height:48px!important;padding:0 15px!important;font-size:11px!important}
      .hero-actions .text-link{font-size:10px!important}
      .em-hero-slide{background-size:auto 84%!important;background-position:97% 52%!important}
      .hero-overlay{background:linear-gradient(90deg,rgba(0,0,0,.97) 0%,rgba(0,0,0,.86) 24%,rgba(0,0,0,.50) 40%,rgba(0,0,0,.10) 54%,rgba(0,0,0,.01) 64%,transparent 100%),linear-gradient(0deg,rgba(5,5,5,.68) 0%,rgba(5,5,5,.08) 22%,transparent 44%)!important}
      .em-hero-controls{left:18px!important;right:18px!important;bottom:57px!important}
      .em-hero-arrow{width:40px!important;height:40px!important;font-size:26px!important}
      .em-hero-label{right:18px!important;bottom:18px!important;font-size:7px!important}
      .trust-strip span{height:94px!important;padding:0 15px!important;font-size:10px!important}
    }
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

  const stage = document.createElement('div');
  stage.className = 'em-hero-slideshow';
  slides.forEach((slide, i) => {
    const panel = document.createElement('div');
    panel.className = 'em-hero-slide' + (i === 0 ? ' active' : '');
    panel.style.backgroundImage = `url("${slide.src}")`;
    panel.style.setProperty('--mobile-position', slide.mobilePosition);
    panel.setAttribute('role', 'img');
    panel.setAttribute('aria-label', `${slide.label} tinted by EM Tinting`);
    stage.appendChild(panel);
  });
  hero.insertBefore(stage, hero.firstChild);

  const label = document.createElement('div');
  label.className = 'em-hero-label';
  label.textContent = slides[0].label;
  hero.appendChild(label);

  const controls = document.createElement('div');
  controls.className = 'em-hero-controls';
  const prev = document.createElement('button');
  prev.className = 'em-hero-arrow';
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous vehicle');
  prev.textContent = '‹';
  const dots = document.createElement('div');
  dots.className = 'em-hero-dots';
  const next = document.createElement('button');
  next.className = 'em-hero-arrow';
  next.type = 'button';
  next.setAttribute('aria-label', 'Next vehicle');
  next.textContent = '›';
  controls.append(prev, dots, next);
  hero.appendChild(controls);

  let current = 0;
  let timer;
  const panels = [...stage.children];

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'em-hero-dot' + (i === 0 ? ' active' : '');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show vehicle ${i + 1}`);
    dots.appendChild(dot);
  });
  const dotEls = [...dots.children];

  function show(index, restartTimer = false) {
    panels[current].classList.remove('active');
    dotEls[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    panels[current].classList.add('active');
    dotEls[current].classList.add('active');
    label.textContent = slides[current].label;
    if (restartTimer) restart();
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => show(current + 1), 5000);
  }

  dotEls.forEach((dot, i) => dot.addEventListener('click', () => show(i, true)));
  prev.addEventListener('click', () => show(current - 1, true));
  next.addEventListener('click', () => show(current + 1, true));
  restart();
})();