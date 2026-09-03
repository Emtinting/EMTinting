(()=>{
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=v=>String(v??'—').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function readField(card,label){
    const wanted=String(label).replace(':','').trim().toUpperCase();
    for(const dt of $$('dt',card)){
      const text=dt.textContent.replace(':','').trim().toUpperCase();
      if(text===wanted) return dt.nextElementSibling?.textContent?.trim()||'—';
    }
    return '—';
  }

  function injectStyles(){
    if($('#crmWarrantyV2Styles')) return;
    const style=document.createElement('style');
    style.id='crmWarrantyV2Styles';
    style.textContent=`
      #crmTab_warranty .crm-ewarranty-layout.crm-warranty-v2-layout{display:block!important;max-width:1060px;margin:0 auto}
      #crmTab_warranty .crm-warranty-v2-layout>.crm-ewarranty-left,
      #crmTab_warranty .crm-warranty-v2-layout>.crm-ewarranty-actions{display:none!important}
      .crm-warranty-v2-shell{background:linear-gradient(180deg,#121419,#0c0e11);border:1px solid #292e35;border-radius:12px;padding:18px;box-shadow:0 18px 45px rgba(0,0,0,.22)}
      .crm-warranty-v2-top{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:16px}
      .crm-warranty-v2-title h3{font-size:23px;margin:0 0 5px;color:#fff;letter-spacing:.01em}
      .crm-warranty-v2-title .crm-green{font-size:15px;font-weight:700}
      .crm-warranty-v2-email{background:linear-gradient(180deg,#ff2b31,#d90f15)!important;border:1px solid #ff363b!important;color:#fff!important;padding:12px 18px!important;border-radius:7px!important;font-weight:800!important;cursor:pointer!important;min-width:150px}
      #crmWarrantyCard.crm-warranty-v2-card{border:2px solid #da1118!important;border-radius:12px!important;overflow:hidden!important;background:#090b0d!important;box-shadow:0 12px 32px rgba(0,0,0,.38)!important}
      #crmWarrantyCard.crm-warranty-v2-card:before{background-image:linear-gradient(30deg,transparent 24%,rgba(239,27,32,.07) 25%,transparent 26%),linear-gradient(150deg,transparent 24%,rgba(239,27,32,.045) 25%,transparent 26%)!important;background-size:32px 56px!important}
      .crm-warranty-v2-card .crm-card-head{padding:23px 28px 18px!important;border-bottom:1px solid #a30c11!important}
      .crm-warranty-v2-card .crm-hitek{font-size:44px!important;font-weight:1000!important;line-height:.95;letter-spacing:.03em!important}
      .crm-warranty-v2-card .crm-card-head small{font-size:15px!important;color:#fff!important}
      .crm-warranty-v2-card .crm-lifetime{font-size:17px!important;color:#ff272e!important;padding-top:4px}
      .crm-warranty-v2-card .crm-lifetime small{display:none!important}
      .crm-warranty-v2-card .crm-card-body{grid-template-columns:minmax(0,1.15fr) minmax(260px,.85fr)!important;padding:26px 30px 28px!important;gap:34px!important}
      .crm-warranty-v2-card .crm-card-fields{grid-template-columns:145px 1fr!important;gap:12px 16px!important;font-size:14px!important;align-content:start}
      .crm-warranty-v2-card .crm-card-fields dt{font-weight:900!important;color:#f1f2f4!important}
      .crm-warranty-v2-card .crm-card-fields dd{font-size:14px!important}
      .crm-warranty-v2-card .crm-card-copy{display:flex;flex-direction:column;align-items:center;text-align:center;justify-content:center;border-left:1px solid #777!important;padding:0 0 0 28px!important;color:#e8e9eb!important;line-height:1.5!important}
      .crm-warranty-v2-card .crm-card-copy>strong{display:none}
      .crm-warranty-v2-card .crm-card-copy p{margin:16px 0 0!important;max-width:300px}
      .crm-warranty-v2-shield{width:116px;height:128px;clip-path:polygon(50% 0,92% 18%,88% 72%,50% 100%,12% 72%,8% 18%);background:linear-gradient(160deg,#7d8288,#202328 22%,#0d0f12 65%,#777);padding:4px;box-sizing:border-box;display:grid;place-items:center;margin-bottom:2px}
      .crm-warranty-v2-shield-inner{width:100%;height:100%;clip-path:inherit;background:linear-gradient(180deg,#171a1f,#08090b);display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900}
      .crm-warranty-v2-shield-inner .hitek{font-style:italic;font-size:22px}
      .crm-warranty-v2-shield-inner .life{background:#df1219;color:#fff;font-size:17px;padding:4px 9px;margin:5px -10px 2px;transform:rotate(-3deg)}
      .crm-warranty-v2-shield-inner .war{font-size:12px;letter-spacing:.08em}
      .crm-warranty-v2-nontransfer{color:#ff242a!important;font-weight:800!important;margin-top:10px!important}
      .crm-warranty-v2-card .crm-card-footer{background:linear-gradient(105deg,#861016,#f01820)!important;padding:12px 18px!important;font-size:13px!important;letter-spacing:0!important;display:flex;justify-content:center;align-items:center;gap:22px;flex-wrap:wrap;color:#fff}
      .crm-warranty-v2-card .crm-card-footer span{white-space:nowrap}
      .crm-warranty-v2-card .crm-card-footer .sep{opacity:.45}
      .crm-warranty-v2-coverage{margin-top:16px;background:linear-gradient(180deg,#15181d,#101216);border:1px solid #292e35;border-radius:10px;padding:18px 20px}
      .crm-warranty-v2-coverage h4{color:#ff242a;margin:0 0 14px;font-size:14px}
      .crm-warranty-v2-coverage-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px 28px;color:#f4f5f6}
      .crm-warranty-v2-coverage-grid span:before{content:'✓';display:inline-grid;place-items:center;width:18px;height:18px;border:1px solid #2bd160;color:#2bd160;border-radius:50%;font-size:11px;margin-right:9px}
      .crm-warranty-v2-download{width:100%;margin-top:16px;background:#0d0f12;border:1px solid #888!important;color:#fff!important;border-radius:7px!important;padding:13px 16px!important;font-weight:700;cursor:pointer}
      @media(max-width:800px){
        .crm-warranty-v2-top{flex-direction:column}.crm-warranty-v2-email{width:100%}
        .crm-warranty-v2-card .crm-card-body{grid-template-columns:1fr!important}
        .crm-warranty-v2-card .crm-card-copy{border-left:0!important;border-top:1px solid #666!important;padding:24px 0 0!important}
        .crm-warranty-v2-card .crm-card-fields{grid-template-columns:125px 1fr!important}
        .crm-warranty-v2-coverage-grid{grid-template-columns:1fr}
        .crm-warranty-v2-card .crm-hitek{font-size:36px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function upgradeWarranty(){
    const card=$('#crmWarrantyCard');
    const layout=card?.closest('.crm-ewarranty-layout');
    if(!card||!layout||card.querySelector('#crmWarrantyForm')||card.querySelector('.empty')) return;
    if(card.dataset.v2Ready==='1') return;

    const customer=readField(card,'CUSTOMER');
    const vehicle=readField(card,'VEHICLE');
    const vin=readField(card,'VIN #');
    const film=readField(card,'FILM TYPE');
    const shade=readField(card,'SHADE');
    const install=readField(card,'INSTALL DATE');
    const roll=readField(card,'ROLL #');

    layout.classList.add('crm-warranty-v2-layout');
    card.classList.add('crm-warranty-v2-card');
    card.dataset.v2Ready='1';

    const oldCopy=$('.crm-card-copy',card);
    if(oldCopy){
      oldCopy.innerHTML=`
        <div class="crm-warranty-v2-shield"><div class="crm-warranty-v2-shield-inner"><div class="hitek">HITEK</div><div class="life">LIFETIME</div><div class="war">WARRANTY</div><div style="margin-top:5px">★ ★ ★</div></div></div>
        <p>HITEK window film is warranted against bubbling, cracking, peeling, color fading and delamination for as long as you own the vehicle.</p>
        <p class="crm-warranty-v2-nontransfer">*Warranty is non-transferable.</p>`;
    }

    const head=$('.crm-card-head',card);
    if(head){
      const lt=$('.crm-lifetime',head);
      if(lt) lt.innerHTML='LIFETIME WARRANTY';
    }

    const footer=$('.crm-card-footer',card);
    if(footer) footer.innerHTML=`<span>☎&nbsp; 346.804.9135</span><span class="sep">|</span><span>✉&nbsp; emtinting@yahoo.com</span><span class="sep">|</span><span>⌖&nbsp; Houston, TX</span>`;

    let shell=layout.parentElement?.querySelector('.crm-warranty-v2-shell');
    if(!shell){
      shell=document.createElement('div');
      shell.className='crm-warranty-v2-shell';
      layout.parentNode.insertBefore(shell,layout);
      shell.appendChild(layout);
    }

    if(!$('.crm-warranty-v2-top',shell)){
      const top=document.createElement('div');
      top.className='crm-warranty-v2-top';
      top.innerHTML=`<div class="crm-warranty-v2-title"><h3>HITEK E-WARRANTY</h3><div class="crm-green">Lifetime Warranty</div></div><button type="button" class="crm-warranty-v2-email" id="crmWarrantyEmailV2">✉ &nbsp; Email Warranty</button>`;
      shell.insertBefore(top,layout);
      $('#crmWarrantyEmailV2',top).onclick=()=>{
        const existing=$('[data-warranty-email]',layout);
        if(existing) existing.click();
        else if(typeof toast==='function') toast('Warranty email is still loading. Try again in a second.');
      };
    }

    if(!$('.crm-warranty-v2-coverage',shell)){
      const coverage=document.createElement('div');
      coverage.className='crm-warranty-v2-coverage';
      coverage.innerHTML=`<h4>Warranty Coverage</h4><div class="crm-warranty-v2-coverage-grid"><span>Bubbling</span><span>Color Fading</span><span>Cracking</span><span>Delamination</span><span>Peeling</span></div>`;
      shell.appendChild(coverage);
    }

    if(!$('.crm-warranty-v2-download',shell)){
      const dl=document.createElement('button');
      dl.type='button';
      dl.className='crm-warranty-v2-download';
      dl.textContent='⇩  Download Warranty PDF';
      dl.onclick=()=>{
        const preview=$('[data-warranty-preview]',layout) || $('#crmPrintWarranty',layout);
        if(preview) preview.click();
        else window.print();
      };
      shell.appendChild(dl);
    }

    // Keep parsed values available for any later email/PDF integration.
    card.dataset.customer=customer;
    card.dataset.vehicle=vehicle;
    card.dataset.vin=vin;
    card.dataset.film=film;
    card.dataset.shade=shade;
    card.dataset.installDate=install;
    card.dataset.roll=roll;
  }

  function start(){injectStyles();upgradeWarranty();}
  const observer=new MutationObserver(()=>setTimeout(start,0));
  observer.observe(document.body,{childList:true,subtree:true});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
