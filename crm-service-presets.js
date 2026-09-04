(()=>{
  const FILMS=['Carbon','Ceramic IR','Ceramic Plus'];
  const SERVICES=['Full Vehicle','Front 2 Doors','Windshield','Rear Half','Sunroof','Tint Removal'];
  const SHADES=['5%','15%','20%','35%','50%','70%','Custom'];
  const VEHICLES=['Sedan','Coupe','SUV','Pickup Truck'];
  const startingPrice=(film,service)=>service==='Full Vehicle'?(film==='Carbon'?180:film==='Ceramic IR'?300:0):0;

  function injectStyles(){
    if(document.getElementById('crmPresetStyles'))return;
    const s=document.createElement('style');s.id='crmPresetStyles';s.textContent=`
      .crm-preset-box{margin:14px 0 18px;padding:15px;border:1px solid #30353d;border-radius:10px;background:#0d0f12}
      .crm-preset-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
      .crm-preset-head strong{font-size:13px;letter-spacing:.04em}.crm-preset-head small{color:#8e96a1}
      .crm-preset-grid{display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:10px;align-items:end}
      .crm-preset-grid label{font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#aeb5be}
      .crm-preset-grid select,.crm-preset-grid input{width:100%;margin-top:6px;background:#111419;border:1px solid #343a43;color:#fff;border-radius:7px;padding:10px}
      .crm-preset-add{min-height:39px}.crm-preset-note{margin:10px 0 0;color:#7f8791;font-size:11px}
      @media(max-width:900px){.crm-preset-grid{grid-template-columns:1fr 1fr}.crm-preset-add{grid-column:1/-1}}
    `;document.head.appendChild(s);
  }

  function optionList(items){return items.map(x=>`<option value="${x}">${x}</option>`).join('')}
  function ensurePresetBox(){
    const serviceLines=document.getElementById('serviceLines');
    if(!serviceLines||document.getElementById('crmPresetBox'))return;
    injectStyles();
    const box=document.createElement('div');box.id='crmPresetBox';box.className='crm-preset-box';
    box.innerHTML=`<div class="crm-preset-head"><strong>QUICK FILM / SERVICE PRESET</strong><small>Internal CRM only</small></div>
      <div class="crm-preset-grid">
        <label>Vehicle Type<select id="crmPresetVehicle">${optionList(VEHICLES)}</select></label>
        <label>Film Package<select id="crmPresetFilm">${optionList(FILMS)}</select></label>
        <label>Service<select id="crmPresetService">${optionList(SERVICES)}</select></label>
        <label>Tint Shade<select id="crmPresetShade"><option value="">Select...</option>${optionList(SHADES)}</select></label>
        <label>Price<input id="crmPresetPrice" type="number" min="0" step="0.01" value="180"></label>
        <button id="crmPresetAdd" type="button" class="btn primary crm-preset-add">+ Add Service</button>
      </div>
      <p class="crm-preset-note">Carbon full vehicle starts at $180 and Ceramic IR full vehicle starts at $300. Other services stay at $0 until you enter the price.</p>`;
    serviceLines.parentNode.insertBefore(box,serviceLines);

    const film=box.querySelector('#crmPresetFilm'),service=box.querySelector('#crmPresetService'),price=box.querySelector('#crmPresetPrice');
    const syncPrice=()=>{price.value=startingPrice(film.value,service.value)};
    film.addEventListener('change',syncPrice);service.addEventListener('change',syncPrice);
    box.querySelector('#crmPresetAdd').addEventListener('click',()=>{
      const vehicle=box.querySelector('#crmPresetVehicle').value;
      const shade=box.querySelector('#crmPresetShade').value;
      const filmName=film.value,serviceName=service.value;
      const amount=Number(price.value||0);
      let description=serviceName;
      if(shade)description+=` · ${shade}`;
      if(vehicle)description+=` · ${vehicle}`;
      if(typeof window.addServiceRow==='function')window.addServiceRow({description,film_package:filmName,quantity:1,unit_price:amount});
      else if(typeof addServiceRow==='function')addServiceRow({description,film_package:filmName,quantity:1,unit_price:amount});
      else return window.toast?.('Service form is still loading');
      const summary=document.getElementById('apptSummary');
      if(summary&&!summary.value)summary.value=`${filmName} - ${serviceName}${shade?` - ${shade}`:''}`;
      window.toast?.(`${filmName} ${serviceName} added`);
    });
  }

  function exposeServiceRow(){
    try{if(typeof addServiceRow==='function'&&!window.addServiceRow)window.addServiceRow=addServiceRow}catch(_){ }
  }
  const start=()=>{exposeServiceRow();ensurePresetBox()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  window.addEventListener('load',start);
})();