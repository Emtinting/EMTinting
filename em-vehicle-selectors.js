/* EM Tinting shared vehicle selector: NHTSA vPIC + manual fallback. */
(()=>{
'use strict';
const API='https://vpic.nhtsa.dot.gov/api/vehicles/';
const makesFallback=['Acura','Alfa Romeo','Audi','BMW','Buick','Cadillac','Chevrolet','Chrysler','Dodge','Fiat','Ford','Genesis','GMC','Honda','Hyundai','Infiniti','Jaguar','Jeep','Kia','Land Rover','Lexus','Lincoln','Mazda','Mercedes-Benz','Mini','Mitsubishi','Nissan','Porsche','Ram','Rivian','Subaru','Tesla','Toyota','Volkswagen','Volvo'];
let makesPromise=null;
const uniq=arr=>[...new Set(arr.filter(Boolean).map(x=>String(x).trim()))].sort((a,b)=>a.localeCompare(b));
async function request(path){const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8500);try{const res=await fetch(API+path,{signal:controller.signal});if(!res.ok)throw Error('Vehicle database unavailable');const data=await res.json();return data.Results||[]}finally{clearTimeout(timeout)}}
function makes(){if(!makesPromise)makesPromise=request('GetAllMakes?format=json').then(rows=>uniq(rows.map(x=>x.Make_Name))).catch(()=>makesFallback);return makesPromise}
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
 const original=[year,make,model];let manualMode=false,serial=0;
 function dispatch(el,value){if(el.value!==value){el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}}
 function toggleManual(on){manualMode=on;group.classList.toggle('em-vehicle-original-hidden',!on);manual.textContent=on?'Use vehicle dropdowns':'Vehicle not listed? Enter manually';status.textContent=on?'Type the vehicle details in the fields below.':'';if(on)year.focus()}
 manual.addEventListener('click',()=>toggleManual(!manualMode));
 async function populateMakes(selected=''){ms.replaceChildren(opt('','Loading makes…'));ms.disabled=true;try{const list=await makes();ms.replaceChildren(opt('','Select make'));list.forEach(v=>ms.append(opt(v)));if(selected&&!list.some(v=>v.toLowerCase()===selected.toLowerCase()))ms.append(opt(selected));if(selected)ms.value=list.find(v=>v.toLowerCase()===selected.toLowerCase())||selected;ms.disabled=false;status.textContent=''}catch(e){ms.replaceChildren(opt('','Select make'));makesFallback.forEach(v=>ms.append(opt(v)));ms.disabled=false;status.textContent='You can enter a vehicle manually if it is missing.'}}
 async function populateModels(selected=''){
  const ticket=++serial;const mk=ms.value,yr=Number(ys.value);
  mods.replaceChildren(opt('','Select model'));mods.disabled=true;
  if(!mk)return;
  mods.replaceChildren(opt('','Loading models…'));
  try{
   const path=yr>1995?'GetModelsForMakeYear/make/'+encodeURIComponent(mk)+'/modelyear/'+yr+'?format=json':'GetModelsForMake/'+encodeURIComponent(mk)+'?format=json';
   const rows=await request(path);if(ticket!==serial)return;
   const list=uniq(rows.map(x=>x.Model_Name));
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
