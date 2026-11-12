/* EM Tinting shared vehicle selector: NHTSA vPIC + manual fallback. */
(()=>{
'use strict';
const catalog={"Tesla":["Model 3","Model Y","Model S","Model X","Cybertruck"],"Toyota":["Camry","Corolla","Prius","RAV4","Highlander","Grand Highlander","4Runner","Tacoma","Tundra","Sequoia","Sienna","Crown","Land Cruiser","Supra","GR86","Yaris"],"BMW":["2 Series","3 Series","4 Series","5 Series","7 Series","8 Series","X1","X2","X3","X4","X5","X6","X7","XM","Z4","i3","i4","i5","i7","iX","M2","M3","M4","M5","M8"],"Honda":["Accord","Civic","CR-V","HR-V","Pilot","Passport","Odyssey","Ridgeline","Fit"],"Ford":["F-150","F-250","F-350","Ranger","Maverick","Mustang","Mustang Mach-E","Explorer","Expedition","Escape","Bronco","Bronco Sport","Edge","Fusion","Focus"],"Chevrolet":["Silverado 1500","Silverado 2500HD","Colorado","Tahoe","Suburban","Equinox","Traverse","Trax","Blazer","Malibu","Camaro","Corvette","Impala","Cruze"],"GMC":["Sierra 1500","Sierra 2500HD","Yukon","Yukon XL","Terrain","Acadia","Canyon","Hummer EV"],"Mercedes-Benz":["C-Class","E-Class","S-Class","A-Class","CLA","CLS","GLA","GLB","GLC","GLE","GLS","G-Class","EQE","EQS","Sprinter"],"Nissan":["Altima","Sentra","Maxima","Versa","Rogue","Murano","Pathfinder","Armada","Frontier","Titan","Kicks","Z","Leaf"],"Hyundai":["Elantra","Sonata","Accent","Kona","Tucson","Santa Fe","Palisade","Venue","Ioniq 5","Ioniq 6","Santa Cruz"],"Kia":["Forte","K4","K5","Optima","Soul","Seltos","Sportage","Sorento","Telluride","Carnival","EV6","EV9","Rio","Stinger"],"Lexus":["IS","ES","GS","LS","UX","NX","RX","GX","LX","TX","RC","LC","RZ"],"Dodge":["Charger","Challenger","Durango","Journey","Hornet","Grand Caravan"],"Jeep":["Wrangler","Gladiator","Grand Cherokee","Cherokee","Compass","Renegade","Wagoneer","Grand Wagoneer"],"Ram":["1500","2500","3500","ProMaster"],"Volkswagen":["Jetta","Passat","Golf","GTI","Golf R","Tiguan","Atlas","Atlas Cross Sport","Taos","ID.4","Beetle"],"Audi":["A3","A4","A5","A6","A7","A8","Q3","Q5","Q7","Q8","e-tron","RS3","RS5","R8"],"Subaru":["Impreza","Legacy","WRX","BRZ","Crosstrek","Forester","Outback","Ascent","Solterra"],"Mazda":["Mazda3","Mazda6","CX-3","CX-30","CX-5","CX-50","CX-70","CX-90","CX-9","MX-5 Miata"],"Porsche":["911","718 Cayman","718 Boxster","Panamera","Macan","Cayenne","Taycan"],"Cadillac":["CT4","CT5","CT6","XT4","XT5","XT6","Escalade","Lyriq"],"Acura":["Integra","TLX","ILX","MDX","RDX","NSX"],"Infiniti":["Q50","Q60","QX50","QX55","QX60","QX80"],"Volvo":["S60","S90","V60","XC40","XC60","XC90","EX30","EX90"],"Lincoln":["Corsair","Nautilus","Aviator","Navigator","MKZ"],"Buick":["Encore","Encore GX","Envision","Enclave","Envista","Regal"],"Chrysler":["300","Pacifica","Voyager"],"Mitsubishi":["Mirage","Lancer","Outlander","Outlander Sport","Eclipse Cross"],"Land Rover":["Range Rover","Range Rover Sport","Range Rover Evoque","Defender","Discovery","Discovery Sport","Velar"],"Genesis":["G70","G80","G90","GV60","GV70","GV80"],"Rivian":["R1T","R1S"],"Mini":["Cooper","Countryman","Clubman"],"Jaguar":["XE","XF","XJ","F-PACE","E-PACE","F-TYPE"],"Alfa Romeo":["Giulia","Stelvio","Tonale"],"Fiat":["500","500X"],"Polestar":["2","3","4"],"Lucid":["Air","Gravity"]};
const makesFallback=Object.keys(catalog).sort((a,b)=>a.localeCompare(b));
const uniq=arr=>[...new Set(arr.filter(Boolean).map(x=>String(x).trim()))].sort((a,b)=>a.localeCompare(b));
function makes(){return Promise.resolve(makesFallback)}
const opt=(value,label)=>{const o=document.createElement('option');o.value=value;o.textContent=label||value;return o};
function build(ids,key){
 const [year,make,model]=ids.map(id=>document.getElementById(id));if(!year||!make||!model||year.dataset.vehiclePicker)return;
 year.dataset.vehiclePicker='1';
 const container=document.createElement('div');container.className='em-vehicle-picker';container.dataset.picker=key;
 const heading=document.createElement('div');heading.className='em-vehicle-picker-title';heading.textContent='Select your vehicle';
 const fields=document.createElement('div');fields.className='em-vehicle-picker-fields';
 const labels=['Year','Make','Model'];
 const selects=labels.map((label,i)=>{const wrapper=document.createElement('label');wrapper.textContent=label;const select=document.createElement('select');select.setAttribute('aria-label','Vehicle '+label);select.append(opt('',i===0?'Select year':i===1?'Select make':'Select model'));select.disabled=i!==0;wrapper.append(select);fields.append(wrapper);return select});
 const [ys,ms,mods]=selects;
 for(let y=new Date().getFullYear()+1;y>=1900;y--)ys.append(opt(String(y)));
 const manual=document.createElement('button');manual.type='button';manual.className='em-vehicle-manual';manual.textContent='Vehicle not listed? Enter manually';
 const status=document.createElement('small');status.className='em-vehicle-picker-status';status.setAttribute('role','status');
 container.append(heading,fields,manual,status);
 const group=year.closest('.ew-three')||year.closest('.form-grid')||year.parentElement;
 group.parentNode.insertBefore(container,group);
 const original=[year,make,model];const originalsToHide=key==='crm'?original.map(el=>el.closest('label')||el):[group];let manualMode=false,serial=0;
 function dispatch(el,value){if(el.value!==value){el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}}
 function toggleManual(on){manualMode=on;originalsToHide.forEach(el=>el.classList.toggle('em-vehicle-original-hidden',!on));manual.textContent=on?'Use vehicle dropdowns':'Vehicle not listed? Enter manually';status.textContent=on?'Type the vehicle details in the fields below.':'';if(on)year.focus()}
 manual.addEventListener('click',()=>toggleManual(!manualMode));
 async function populateMakes(selected=''){ms.replaceChildren(opt('','Loading makes…'));ms.disabled=true;try{const list=await makes();ms.replaceChildren(opt('','Select make'));list.forEach(v=>ms.append(opt(v)));if(selected&&!list.some(v=>v.toLowerCase()===selected.toLowerCase()))ms.append(opt(selected));if(selected)ms.value=list.find(v=>v.toLowerCase()===selected.toLowerCase())||selected;ms.disabled=false;status.textContent=''}catch(e){ms.replaceChildren(opt('','Select make'));makesFallback.forEach(v=>ms.append(opt(v)));ms.disabled=false;status.textContent='You can enter a vehicle manually if it is missing.'}}
 async function populateModels(selected=''){
  const ticket=++serial;const mk=ms.value,yr=Number(ys.value);
  mods.replaceChildren(opt('','Select model'));mods.disabled=true;
  if(!mk)return;
  mods.replaceChildren(opt('','Loading models…'));
  try{
   const list=uniq(catalog[mk]||[]);if(ticket!==serial)return;
   mods.replaceChildren(opt('','Select model'));
   list.forEach(v=>mods.append(opt(v)));
   if(selected&&!list.some(v=>v.toLowerCase()===selected.toLowerCase()))mods.append(opt(selected));
   if(selected)mods.value=list.find(v=>v.toLowerCase()===selected.toLowerCase())||selected;
   mods.disabled=false;status.textContent=list.length?'':'Model not found. Use manual entry.';
  }catch(e){if(ticket!==serial)return;mods.replaceChildren(opt('','Model list unavailable'));status.textContent='Vehicle lookup unavailable. Use manual entry.'}
 }
 ys.addEventListener('change',async()=>{dispatch(year,ys.value);dispatch(make,'');dispatch(model,'');mods.replaceChildren(opt('','Select model'));mods.disabled=true;if(ys.value)await populateMakes();else{ms.replaceChildren(opt('','Select make'));ms.disabled=true}});
 ms.addEventListener('change',()=>{dispatch(make,ms.value);dispatch(model,'');populateModels()});
 mods.addEventListener('change',()=>dispatch(model,mods.value));
 function sync(){if(manualMode)return;const currentYear=year.value.trim(),currentMake=make.value.trim(),currentModel=model.value.trim();if(currentYear&&ys.value!==currentYear){ys.value=currentYear;if(ys.value)populateMakes(currentMake).then(()=>populateModels(currentModel));else toggleManual(true)}else if(currentMake&&ms.value!==currentMake){populateMakes(currentMake).then(()=>populateModels(currentModel))}else if(currentModel&&mods.value!==currentModel){if([...mods.options].some(x=>x.value===currentModel))mods.value=currentModel}}
 toggleManual(false);
 if(year.value||make.value||model.value)sync();
 // CRM may prefill fields after opening the appointment dialog.
 const dialog=group.closest('dialog');if(dialog){dialog.addEventListener('click',()=>setTimeout(sync,30));new MutationObserver(()=>{if(dialog.open)setTimeout(sync,50)}).observe(dialog,{attributes:true,attributeFilter:['open']})}
 }
 function init(){build(['ewYear','ewMake','ewModel'],'website');build(['apptYear','apptMake','apptModel'],'crm')}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 const observer=new MutationObserver(()=>{if((document.getElementById('ewYear')&&!document.getElementById('ewYear').dataset.vehiclePicker)||(document.getElementById('apptYear')&&!document.getElementById('apptYear').dataset.vehiclePicker))init()});
 observer.observe(document.documentElement,{childList:true,subtree:true});
})();
