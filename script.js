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

  let current = 0;
  let timer;

  const style = document.createElement("style");
  style.textContent = `
    .hero{background:#050505!important;isolation:isolate}
    .hero-card{display:none!important}
    .em-hero-slideshow{position:absolute;inset:0;z-index:0;overflow:hidden}
    .em-hero-slide{position:absolute;inset:0;background-size:cover;background-position:center 56%;opacity:0;transform:scale(1.025);transition:opacity 1s ease,transform 6s ease}
    .em-hero-slide.active{opacity:1;transform:scale(1)}
    .hero-overlay{z-index:1!important;background:linear-gradient(90deg,rgba(0,0,0,.98) 0%,rgba(0,0,0,.88) 34%,rgba(0,0,0,.48) 62%,rgba(0,0,0,.18) 100%),linear-gradient(0deg,rgba(5,5,5,.95) 0%,rgba(5,5,5,.15) 32%,transparent 62%)!important}
    .em-hero-controls{position:absolute;z-index:5;left:max(6vw,28px);right:max(6vw,28px);bottom:34px;display:flex;align-items:center;justify-content:space-between;pointer-events:none}
    .em-hero-arrow{pointer-events:auto;width:46px;height:46px;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:rgba(0,0,0,.45);color:#fff;font-size:28px;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(8px)}
    .em-hero-arrow:hover{border-color:#e21a22;color:#ff3b42}
    .em-hero-dots{pointer-events:auto;display:flex;gap:9px;align-items:center}
    .em-hero-dot{width:9px;height:9px;border-radius:50%;border:0;background:#8a8a8a;padding:0;cursor:pointer;opacity:.75}
    .em-hero-dot.active{background:#e21a22;opacity:1}
    .em-hero-label{position:absolute;z-index:5;right:max(6vw,28px);bottom:94px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#cfcfcf}
    @media(max-width:900px){
      .em-hero-slide{background-position:center 58%}
      .em-hero-controls{left:22px;right:22px;bottom:22px}
      .em-hero-label{right:22px;bottom:84px}
      .hero{min-height:720px!important}
      .hero-content{padding-bottom:70px}
    }
    @media(max-width:620px){
      .hero{min-height:760px!important;padding-top:72px!important}
      .hero-overlay{background:linear-gradient(90deg,rgba(0,0,0,.97),rgba(0,0,0,.78) 58%,rgba(0,0,0,.32)),linear-gradient(0deg,#070707 0%,rgba(7,7,7,.18) 34%,transparent 66%)!important}
      .em-hero-slide{background-position:58% center}
      .em-hero-arrow{width:42px;height:42px;font-size:24px}
      .em-hero-label{font-size:9px;bottom:78px}
    }
  `;
  document.head.appendChild(style);

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
