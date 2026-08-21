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
    { src: 'media/hero-01.jpg', label: 'TESLA MODEL Y', mobilePosition: '94% 54%' },
    { src: 'media/hero-02.jpg', label: 'FORD F-150', mobilePosition: '94% 54%' },
    { src: 'media/hero-03.jpg', label: 'GMC DENALI HD', mobilePosition: '94% 54%' },
    { src: 'media/hero-04.jpg', label: 'CADILLAC ESCALADE', mobilePosition: '94% 54%' },
    { src: 'media/hero-05.jpg', label: 'TESLA MODEL Y', mobilePosition: '94% 54%' }
  ];

  const icons = {
    shield: '<svg viewBox="0 0 32 32"><path d="M16 3 27 7v8c0 7.1-4.5 11.8-11 14-6.5-2.2-11-6.9-11-14V7l11-4Z"/><path d="m11 16 3.2 3.2L21 12.5"/></svg>',
    layers: '<svg viewBox="0 0 32 32"><path d="m16 4 12 7-12 7L4 11l12-7Z"/><path d="m4 16 12 7 12-7M4 21l12 7 12-7"/></svg>',
    pin: '<svg viewBox="0 0 32 32"><path d="M26 13c0 7-10 16-10 16S6 20 6 13a10 10 0 1 1 20 0Z"/><circle cx="16" cy="13" r="3.5"/></svg>',
    calendar: '<svg viewBox="0 0 32 32"><rect x="5" y="7" width="22" height="21" rx="2"/><path d="M10 4v6M22 4v6M5 13h22M10 18h2M15 18h2M20 18h2M10 23h2M15 23h2M20 23h2"/></svg>',
    phone: '<svg viewBox="0 0 32 32"><path d="M10 5 6 8c1 9 9 17 18 18l3-4-6-4-3 3c-4-2-6-4-8-8l3-3-3-5Z"/></svg>',
    chat: '<svg viewBox="0 0 32 32"><path d="M27 15c0 6-5 10-11 10-2 0-4-.4-5.5-1.2L5 27l1.8-5C5.6 20.2 5 18 5 15 5 9 10 5 16 5s11 4 11 10Z"/></svg>',
    quote: '<svg viewBox="0 0 32 32"><rect x="7" y="5" width="18" height="23" rx="2"/><path d="M11 11h10M11 16h10M11 21h6"/></svg>'
  };

  const style = document.createElement('style');
  style.textContent = `
    .hero{background:#050505!important;isolation:isolate}
    .hero-card{display:none!important}
    .em-hero-slideshow{position:absolute;inset:0;z-index:0;overflow:hidden;background:#050505}
    .em-hero-slide{position:absolute;inset:0;background-size:cover;background-position:center;background-repeat:no-repeat;opacity:0;transition:opacity .85s ease;filter:none}
    .em-hero-slide.active{opacity:1}
    .hero-overlay{z-index:1!important;background:linear-gradient(90deg,rgba(0,0,0,.96) 0%,rgba(0,0,0,.82) 34%,rgba(0,0,0,.38) 57%,rgba(0,0,0,.08) 78%,transparent 100%),linear-gradient(0deg,rgba(5,5,5,.78) 0%,rgba(5,5,5,.08) 30%,transparent 58%)!important}
    .em-hero-controls{position:absolute;z-index:6;left:max(5vw,28px);right:max(5vw,28px);bottom:32px;display:flex;justify-content:space-between;align-items:center;pointer-events:none}
    .em-hero-arrow{pointer-events:auto;width:50px;height:50px;border-radius:50%;border:1px solid rgba(255,255,255,.30);background:rgba(0,0,0,.52);color:#fff;font-size:32px;line-height:1;display:grid;place-items:center;cursor:pointer}
    .em-hero-dots{pointer-events:auto;display:flex;gap:10px;align-items:center}
    .em-hero-dot{width:9px;height:9px;padding:0;border:0;border-radius:50%;background:#999;opacity:.9;cursor:pointer}
    .em-hero-dot.active{background:#ed1c24}
    .em-hero-label{position:absolute;z-index:6;right:max(5vw,28px);bottom:92px;color:#c9c9c9;font-size:10px;letter-spacing:.24em;font-style:italic}
    .em-menu-button{display:none}
    .em-trust-icon,.em-contact-icon,.em-trust-chevron{display:none}

    @media (max-width:620px){
      body{padding-bottom:72px!important}
      .site-header{height:92px!important;padding:0 30px!important;background:#050505!important;border-bottom:2px solid #d71920!important;gap:16px!important;position:sticky!important;top:0!important}
      .brand{font-size:22px!important;gap:8px!important;white-space:nowrap}
      .brand-em{font-size:23px!important}
      .site-header .btn-small{margin-left:auto!important;min-height:56px!important;height:56px!important;padding:0 22px!important;border-radius:4px!important;font-size:16px!important;box-shadow:none!important}
      .em-menu-button{display:flex!important;width:34px;height:50px;padding:0;border:0;background:transparent;flex-direction:column;justify-content:center;gap:6px;align-items:center}
      .em-menu-button i{width:28px;height:3px;background:#eee;border-radius:3px;display:block}

      .hero{height:760px!important;min-height:760px!important;padding:76px 24px 106px!important;align-items:flex-start!important}
      .hero-content{width:56%!important;max-width:250px!important;padding:0!important;z-index:3!important}
      .hero .kicker{font-size:8px!important;line-height:1.35!important;letter-spacing:.23em!important;white-space:normal!important;margin:0 0 25px!important;color:#ff3a42!important;max-width:230px!important}
      .hero h1{font-size:42px!important;line-height:.98!important;letter-spacing:-.045em!important;margin:0 0 24px!important;max-width:235px!important;font-weight:850!important}
      .hero h1 span{color:#c6c6c6!important}
      .hero-copy{font-size:13px!important;line-height:1.48!important;max-width:235px!important;color:#ededed!important;margin:0!important}
      .hero-actions{display:flex!important;align-items:flex-start!important;flex-direction:column!important;gap:15px!important;margin-top:25px!important}
      .hero-actions .btn{height:54px!important;min-height:54px!important;padding:0 19px!important;font-size:13px!important;border-radius:4px!important;box-shadow:none!important;white-space:nowrap!important}
      .hero-actions .btn::after{content:'→';margin-left:10px;font-size:18px;font-weight:400}
      .hero-actions .text-link{font-size:12px!important;font-weight:800!important;color:#fff!important;white-space:nowrap!important}

      .em-hero-slide{background-size:auto 78%!important;background-position:var(--mobile-position)!important;background-color:#050505!important}
      .hero-overlay{background:linear-gradient(90deg,rgba(0,0,0,.97) 0%,rgba(0,0,0,.91) 28%,rgba(0,0,0,.68) 43%,rgba(0,0,0,.24) 56%,rgba(0,0,0,.03) 68%,transparent 100%),linear-gradient(0deg,rgba(5,5,5,.82) 0%,rgba(5,5,5,.12) 22%,transparent 45%)!important}
      .em-hero-controls{left:24px!important;right:24px!important;bottom:65px!important}
      .em-hero-arrow{width:46px!important;height:46px!important;font-size:29px!important;background:rgba(0,0,0,.48)!important}
      .em-hero-dots{position:absolute;left:50%;transform:translateX(-50%);bottom:-7px;gap:12px!important}
      .em-hero-dot{width:9px!important;height:9px!important;background:#9c9c9c!important}
      .em-hero-dot.active{background:#ed1c24!important}
      .em-hero-label{right:24px!important;bottom:22px!important;font-size:8px!important;color:#c5c5c5!important}
      .em-hero-label::after{content:'';display:inline-block;width:42px;height:1px;background:#aaa;margin:0 0 3px 10px}
      .hero::after{height:4px!important;width:31%!important;background:linear-gradient(90deg,#e21a22,transparent)!important}

      .trust-strip{display:grid!important;grid-template-columns:1fr 1fr!important;margin:0!important;max-width:none!important;border:0!important;background:#050505!important}
      .trust-strip span{height:111px!important;padding:0 25px!important;display:grid!important;grid-template-columns:42px minmax(0,1fr) 18px!important;align-items:center!important;gap:14px!important;text-align:left!important;border-right:1px solid #292929!important;border-bottom:1px solid #292929!important;color:#ddd!important;font-size:13px!important;line-height:1.18!important;letter-spacing:.045em!important}
      .trust-strip span:nth-child(2n){border-right:0!important}
      .trust-strip span:nth-child(n+3){border-bottom:0!important}
      .em-trust-icon{display:block!important;width:34px;height:34px;color:#ed1c24}
      .em-trust-icon svg,.em-contact-icon svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .em-trust-chevron{display:block!important;font-size:26px;color:#efefef;font-weight:300}
      .hitek-strip{margin-top:0!important}

      .mobile-contact-bar{height:72px!important;grid-template-columns:1fr 1fr 1.35fr!important;background:#050505!important;border-top:1px solid #292929!important;box-shadow:none!important}
      .mobile-contact-bar a{gap:10px!important;font-size:14px!important;font-weight:800!important;letter-spacing:.025em!important;border-right:1px solid #292929!important}
      .mobile-contact-bar a:last-child{background:#ed1c24!important}
      .em-contact-icon{display:block!important;width:24px;height:24px;color:currentColor}
    }

    @media (max-width:430px){
      .site-header{height:82px!important;padding:0 18px!important;gap:10px!important}
      .brand{font-size:20px!important}.brand-em{font-size:21px!important}
      .site-header .btn-small{height:50px!important;min-height:50px!important;padding:0 16px!important;font-size:14px!important}
      .em-menu-button{width:32px!important}.em-menu-button i{width:26px!important}
      .hero{height:705px!important;min-height:705px!important;padding:55px 18px 98px!important}
      .hero-content{width:57%!important;max-width:220px!important}
      .hero .kicker{font-size:7px!important;margin-bottom:21px!important;letter-spacing:.22em!important;max-width:210px!important}
      .hero h1{font-size:37px!important;margin-bottom:21px!important;max-width:210px!important;line-height:.98!important}
      .hero-copy{font-size:11px!important;line-height:1.45!important;max-width:205px!important}
      .hero-actions{margin-top:22px!important}
      .hero-actions .btn{height:50px!important;min-height:50px!important;padding:0 16px!important;font-size:12px!important}
      .hero-actions .text-link{font-size:11px!important}
      .em-hero-slide{background-size:auto 76%!important;background-position:96% 53%!important}
      .hero-overlay{background:linear-gradient(90deg,rgba(0,0,0,.98) 0%,rgba(0,0,0,.92) 27%,rgba(0,0,0,.65) 42%,rgba(0,0,0,.18) 55%,rgba(0,0,0,.02) 65%,transparent 100%),linear-gradient(0deg,rgba(5,5,5,.84) 0%,rgba(5,5,5,.10) 22%,transparent 44%)!important}
      .em-hero-controls{left:18px!important;right:18px!important;bottom:58px!important}
      .em-hero-arrow{width:42px!important;height:42px!important;font-size:27px!important}
      .em-hero-label{right:18px!important;bottom:18px!important;font-size:7px!important}
      .trust-strip span{height:96px!important;padding:0 16px!important;grid-template-columns:34px minmax(0,1fr) 14px!important;gap:10px!important;font-size:11px!important}
      .em-trust-icon{width:28px!important;height:28px!important}
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

  const trustItems = [...document.querySelectorAll('.trust-strip span')];
  const trustIcons = [icons.shield, icons.layers, icons.pin, icons.calendar];
  trustItems.forEach((item, i) => {
    const text = item.textContent.trim();
    item.innerHTML = `<span class="em-trust-icon">${trustIcons[i]}</span><span>${text}</span><span class="em-trust-chevron">›</span>`;
  });

  const contactLinks = [...document.querySelectorAll('.mobile-contact-bar a')];
  const contactIcons = [icons.phone, icons.chat, icons.quote];
  contactLinks.forEach((link, i) => {
    const text = link.textContent.trim();
    link.innerHTML = `<span class="em-contact-icon">${contactIcons[i]}</span><span>${text}</span>`;
  });

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