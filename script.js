// EM Tinting - smooth scrolling, hero showcase, and site behavior

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", function (event) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

(() => {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const slides = [
    { src: "media/hero-01.jpg", label: "Tesla Model Y" },
    { src: "media/hero-02.jpg", label: "Ford F-150" },
    { src: "media/hero-03.jpg", label: "GMC Denali HD" },
    { src: "media/hero-04.jpg", label: "Cadillac Escalade" },
    { src: "media/hero-05.jpg", label: "Tesla Model Y" }
  ];

  const icons = {
    shield: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 27 7v8c0 7.1-4.5 11.8-11 14-6.5-2.2-11-6.9-11-14V7l11-4Z"/><path d="m11 16 3.2 3.2L21 12.5"/></svg>',
    layers: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m16 4 12 7-12 7L4 11l12-7Z"/><path d="m4 16 12 7 12-7M4 21l12 7 12-7"/></svg>',
    pin: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M26 13c0 7-10 16-10 16S6 20 6 13a10 10 0 1 1 20 0Z"/><circle cx="16" cy="13" r="3.5"/></svg>',
    calendar: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="7" width="22" height="21" rx="2"/><path d="M10 4v6M22 4v6M5 13h22M10 18h2M15 18h2M20 18h2M10 23h2M15 23h2M20 23h2"/></svg>',
    phone: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10 5 6 8c1 9 9 17 18 18l3-4-6-4-3 3c-4-2-6-4-8-8l3-3-3-5Z"/></svg>',
    chat: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M27 15c0 6-5 10-11 10-2 0-4-.4-5.5-1.2L5 27l1.8-5C5.6 20.2 5 18 5 15 5 9 10 5 16 5s11 4 11 10Z"/></svg>',
    quote: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="7" y="5" width="18" height="23" rx="2"/><path d="M11 11h10M11 16h10M11 21h6M20 3v5"/></svg>'
  };

  const style = document.createElement("style");
  style.textContent = `
    .hero{background:#050505!important;isolation:isolate}
    .hero-card{display:none!important}
    .em-hero-slideshow{position:absolute;inset:0;z-index:0;overflow:hidden;background:#050505}
    .em-hero-slide{position:absolute;inset:0;background-size:cover;background-position:center 55%;background-repeat:no-repeat;opacity:0;transform:none;filter:brightness(1.06) contrast(1.03) saturate(1.03);transition:opacity .8s ease}
    .em-hero-slide.active{opacity:1}
    .hero-overlay{z-index:1!important;background:linear-gradient(90deg,rgba(0,0,0,.92) 0%,rgba(0,0,0,.78) 30%,rgba(0,0,0,.43) 48%,rgba(0,0,0,.09) 72%,rgba(0,0,0,0) 100%),linear-gradient(0deg,rgba(5,5,5,.72) 0%,rgba(5,5,5,.10) 27%,transparent 55%)!important}
    .em-hero-controls{position:absolute;z-index:5;left:max(6vw,28px);right:max(6vw,28px);bottom:34px;display:flex;align-items:center;justify-content:space-between;pointer-events:none}
    .em-hero-arrow{pointer-events:auto;width:46px;height:46px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.42);color:#fff;font-size:28px;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(5px)}
    .em-hero-dots{pointer-events:auto;display:flex;gap:9px;align-items:center}
    .em-hero-dot{width:9px;height:9px;border-radius:50%;border:0;background:#aaa;padding:0;cursor:pointer;opacity:.8}
    .em-hero-dot.active{background:#ed1c24;opacity:1}
    .em-hero-label{position:absolute;z-index:5;right:max(6vw,28px);bottom:94px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#d6d6d6;text-shadow:0 2px 8px rgba(0,0,0,.8)}
    .em-menu-button{display:none}
    .em-trust-icon,.em-contact-icon{display:none}

    @media(max-width:620px){
      body{padding-bottom:72px!important}
      .site-header{height:92px!important;padding:0 30px!important;gap:14px!important;background:#050505!important;border-bottom:2px solid #d71920!important;position:sticky!important}
      .brand{font-size:22px!important;gap:8px!important;white-space:nowrap}
      .brand-em{font-size:23px!important}
      .site-header .btn-small{margin-left:auto;min-height:56px!important;padding:0 21px!important;font-size:16px!important;border-radius:4px!important;box-shadow:none!important}
      .em-menu-button{display:flex;width:38px;height:48px;padding:0;border:0;background:transparent;flex-direction:column;justify-content:center;gap:6px;align-items:center}
      .em-menu-button i{display:block;width:29px;height:3px;background:#eee;border-radius:2px}

      .hero{height:875px!important;min-height:875px!important;padding:72px 33px 118px!important;align-items:flex-start!important}
      .hero-content{width:100%!important;max-width:none!important;padding:0!important;position:relative;z-index:3}
      .hero .kicker{font-size:12px!important;letter-spacing:.17em!important;margin:0 0 34px!important;white-space:nowrap;color:#ff3c43!important}
      .hero h1{font-size:62px!important;line-height:.93!important;letter-spacing:-.055em!important;margin:0 0 34px!important;max-width:570px!important}
      .hero h1 span{color:#c5c5c5!important}
      .hero-copy{font-size:20px!important;line-height:1.55!important;max-width:570px!important;color:#ededed!important;margin:0!important}
      .hero-actions{margin-top:31px!important;gap:17px!important;align-items:flex-start!important;flex-direction:column!important}
      .hero-actions .btn{height:70px!important;min-height:70px!important;padding:0 32px!important;font-size:18px!important;border-radius:4px!important;box-shadow:none!important}
      .hero-actions .btn:after{content:'  →';margin-left:10px;font-size:22px;font-weight:400}
      .hero-actions .text-link{font-size:17px!important;font-weight:800!important}

      .em-hero-slide{background-position:61% center!important;filter:brightness(1.08) contrast(1.03) saturate(1.04)!important}
      .hero-overlay{background:linear-gradient(90deg,rgba(0,0,0,.94) 0%,rgba(0,0,0,.80) 30%,rgba(0,0,0,.48) 52%,rgba(0,0,0,.10) 75%,rgba(0,0,0,.02) 100%),linear-gradient(0deg,rgba(5,5,5,.78) 0%,rgba(5,5,5,.11) 26%,transparent 55%)!important}
      .em-hero-controls{left:33px!important;right:33px!important;bottom:74px!important}
      .em-hero-arrow{width:54px!important;height:54px!important;font-size:33px!important;background:rgba(0,0,0,.42)!important;border-color:rgba(255,255,255,.28)!important}
      .em-hero-dots{gap:14px!important;position:absolute;left:50%;transform:translateX(-50%);bottom:-8px}
      .em-hero-dot{width:11px!important;height:11px!important;background:#aaa!important}
      .em-hero-dot.active{background:#ed1c24!important}
      .em-hero-label{right:35px!important;bottom:29px!important;font-size:10px!important;letter-spacing:.24em!important;color:#c8c8c8!important}
      .em-hero-label:after{content:'';display:inline-block;width:55px;height:1px;background:#aaa;margin:0 0 3px 10px;opacity:.8}
      .hero:after{width:32%!important;height:4px!important}

      .trust-strip{display:grid!important;grid-template-columns:1fr 1fr!important;max-width:none!important;border:0!important;margin:0!important;background:#050505!important}
      .trust-strip span{height:111px!important;padding:0 25px!important;border-right:1px solid #292929!important;border-bottom:1px solid #292929!important;display:grid!important;grid-template-columns:42px 1fr 18px!important;gap:14px!important;align-items:center!important;text-align:left!important;color:#ddd!important;font-size:13px!important;line-height:1.2!important;letter-spacing:.04em!important}
      .trust-strip span:nth-child(2n){border-right:0!important}
      .trust-strip span:nth-child(n+3){border-bottom:0!important}
      .em-trust-icon{display:block;width:33px;height:33px;color:#ef1c24}
      .em-trust-icon svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .em-trust-text{display:block}
      .em-trust-chevron{font-size:25px;color:#eee;font-weight:300}

      .hitek-strip{margin-top:0!important}
      .mobile-contact-bar{height:100px!important;grid-template-columns:1fr 1fr 1.35fr!important;background:#050505!important;border-top:1px solid #262626!important;box-shadow:none!important}
      .mobile-contact-bar a{gap:12px!important;font-size:16px!important;letter-spacing:.03em!important;border-right:1px solid #292929!important}
      .mobile-contact-bar a:last-child{background:#ed1c24!important}
      .em-contact-icon{display:block;width:28px;height:28px;color:currentColor}
      .em-contact-icon svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    }

    @media(max-width:430px){
      .site-header{height:82px!important;padding:0 18px!important;gap:10px!important}
      .brand{font-size:20px!important}.brand-em{font-size:21px!important}
      .site-header .btn-small{min-height:50px!important;padding:0 16px!important;font-size:14px!important}
      .em-menu-button{width:34px}.em-menu-button i{width:27px}
      .hero{height:790px!important;min-height:790px!important;padding:60px 20px 108px!important}
      .hero .kicker{font-size:10px!important;margin-bottom:28px!important}
      .hero h1{font-size:52px!important;margin-bottom:27px!important}
      .hero-copy{font-size:16px!important;max-width:355px!important}
      .hero-actions .btn{height:60px!important;min-height:60px!important;font-size:16px!important;padding:0 24px!important}
      .hero-actions .text-link{font-size:15px!important}
      .em-hero-controls{left:20px!important;right:20px!important;bottom:62px!important}
      .em-hero-arrow{width:46px!important;height:46px!important;font-size:28px!important}
      .em-hero-label{right:20px!important;bottom:22px!important;font-size:8px!important}
      .trust-strip span{height:96px!important;padding:0 16px!important;grid-template-columns:34px 1fr 14px!important;gap:10px!important;font-size:11px!important}
      .em-trust-icon{width:28px;height:28px}
      .mobile-contact-bar{height:72px!important}
      .mobile-contact-bar a{font-size:13px!important;gap:8px!important}
      .em-contact-icon{width:23px;height:23px}
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

  const trust = [...document.querySelectorAll('.trust-strip span')];
  const trustIcons = [icons.shield, icons.layers, icons.pin, icons.calendar];
  trust.forEach((item, i) => {
    const text = item.textContent.trim();
    item.innerHTML = `<span class="em-trust-icon">${trustIcons[i]}</span><span class="em-trust-text">${text}</span><span class="em-trust-chevron">›</span>`;
  });

  const contactLinks = [...document.querySelectorAll('.mobile-contact-bar a')];
  const contactIcons = [icons.phone, icons.chat, icons.quote];
  contactLinks.forEach((link, i) => {
    const text = link.textContent.trim();
    link.innerHTML = `<span class="em-contact-icon">${contactIcons[i]}</span><span>${text}</span>`;
  });

  const stage = document.createElement("div");
  stage.className = "em-hero-slideshow";
  slides.forEach((slide, i) => {
    const panel = document.createElement("div");
    panel.className = "em-hero-slide" + (i === 0 ? " active" : "");
    panel.style.backgroundImage = `url("${slide.src}")`;
    panel.setAttribute("role", "img");
    panel.setAttribute("aria-label", `${slide.label} tinted by EM Tinting`);
    stage.appendChild(panel);
  });
  hero.insertBefore(stage, hero.firstChild);

  const label = document.createElement("div");
  label.className = "em-hero-label";
  label.textContent = slides[0].label;
  hero.appendChild(label);

  const controls = document.createElement("div");
  controls.className = "em-hero-controls";

  const prev = document.createElement("button");
  prev.className = "em-hero-arrow";
  prev.type = "button";
  prev.setAttribute("aria-label", "Previous vehicle");
  prev.innerHTML = "‹";

  const dots = document.createElement("div");
  dots.className = "em-hero-dots";

  const next = document.createElement("button");
  next.className = "em-hero-arrow";
  next.type = "button";
  next.setAttribute("aria-label", "Next vehicle");
  next.innerHTML = "›";

  controls.append(prev, dots, next);
  hero.appendChild(controls);

  const panels = [...stage.children];
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "em-hero-dot" + (i === 0 ? " active" : "");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show vehicle ${i + 1}`);
    dot.addEventListener("click", () => show(i, true));
    dots.appendChild(dot);
  });

  const dotEls = [...dots.children];
  let current = 0;
  let timer;

  function show(index, reset = false) {
    panels[current].classList.remove("active");
    dotEls[current].classList.remove("active");
    current = (index + slides.length) % slides.length;
    panels[current].classList.add("active");
    dotEls[current].classList.add("active");
    label.textContent = slides[current].label;
    if (reset) restart();
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => show(current + 1), 5000);
  }

  prev.addEventListener("click", () => show(current - 1, true));
  next.addEventListener("click", () => show(current + 1, true));
  restart();
})();