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
    .hero{
      background:#050505!important;
      min-height:620px!important;
      overflow:hidden!important;
    }
    .hero-overlay,
    .em-hero-slideshow,
    .em-hero-controls,
    .em-hero-label{
      display:none!important;
    }
    .hero-card{display:none!important;}

    @media (max-width:620px){
      body{padding-bottom:72px!important;}
      .site-header{
        height:92px!important;
        padding:0 30px!important;
        background:#050505!important;
        border-bottom:2px solid #d71920!important;
        gap:16px!important;
        position:sticky!important;
        top:0!important;
      }
      .brand{font-size:22px!important;gap:8px!important;white-space:nowrap;}
      .brand-em{font-size:23px!important;}
      .site-header .btn-small{
        margin-left:auto!important;
        min-height:56px!important;
        height:56px!important;
        padding:0 22px!important;
        border-radius:4px!important;
        font-size:16px!important;
        box-shadow:none!important;
      }
      .em-menu-button{
        display:flex!important;
        width:34px;
        height:50px;
        padding:0;
        border:0;
        background:transparent;
        flex-direction:column;
        justify-content:center;
        gap:6px;
        align-items:center;
      }
      .em-menu-button i{
        width:28px;
        height:3px;
        background:#eee;
        border-radius:3px;
        display:block;
      }
      .hero{
        height:auto!important;
        min-height:610px!important;
        padding:54px 28px 72px!important;
        align-items:flex-start!important;
        background:#050505!important;
      }
      .hero-content{
        width:100%!important;
        max-width:470px!important;
        padding:0!important;
        position:relative!important;
        z-index:2!important;
      }
      .hero .kicker{
        font-size:10px!important;
        line-height:1.3!important;
        letter-spacing:.20em!important;
        white-space:normal!important;
        margin:0 0 28px!important;
        color:#ff3a42!important;
      }
      .hero h1{
        font-size:48px!important;
        line-height:.98!important;
        letter-spacing:-.05em!important;
        margin:0 0 28px!important;
        max-width:430px!important;
      }
      .hero-copy{
        font-size:16px!important;
        line-height:1.52!important;
        max-width:430px!important;
        color:#ededed!important;
      }
      .hero-actions{
        display:flex!important;
        align-items:flex-start!important;
        flex-direction:column!important;
        gap:17px!important;
        margin-top:30px!important;
      }
      .hero-actions .btn{
        height:58px!important;
        min-height:58px!important;
        padding:0 22px!important;
        font-size:15px!important;
        border-radius:4px!important;
        box-shadow:none!important;
      }
      .hero-actions .btn::after{
        content:'→';
        margin-left:10px;
        font-size:20px;
        font-weight:400;
      }
      .hero-actions .text-link{
        font-size:14px!important;
        font-weight:800!important;
        color:#fff!important;
      }
      .mobile-contact-bar{
        height:72px!important;
        grid-template-columns:1fr 1fr 1.35fr!important;
        background:#050505!important;
        border-top:1px solid #292929!important;
        box-shadow:none!important;
      }
      .mobile-contact-bar a{
        font-size:14px!important;
        font-weight:800!important;
        letter-spacing:.025em!important;
        border-right:1px solid #292929!important;
      }
      .mobile-contact-bar a:last-child{background:#ed1c24!important;}
    }

    @media (max-width:430px){
      .site-header{height:82px!important;padding:0 18px!important;gap:10px!important;}
      .brand{font-size:20px!important;}
      .brand-em{font-size:21px!important;}
      .site-header .btn-small{height:50px!important;min-height:50px!important;padding:0 16px!important;font-size:14px!important;}
      .em-menu-button{width:32px!important;}
      .em-menu-button i{width:26px!important;}
      .hero{min-height:570px!important;padding:46px 20px 64px!important;}
      .hero .kicker{font-size:9px!important;margin-bottom:24px!important;}
      .hero h1{font-size:43px!important;margin-bottom:24px!important;max-width:360px!important;}
      .hero-copy{font-size:14px!important;max-width:360px!important;}
      .hero-actions{margin-top:26px!important;}
      .hero-actions .btn{height:54px!important;min-height:54px!important;padding:0 18px!important;font-size:13px!important;}
      .hero-actions .text-link{font-size:12px!important;}
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
})();
