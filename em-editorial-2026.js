/* Progressive enhancement: preserves existing booking and Supabase integration. */
(function(){
function start(){
const hero=document.querySelector('.hero'),services=document.querySelector('#services');
if(hero&&!document.querySelector('#emEditorial')){
const section=document.createElement('section');section.id='emEditorial';section.className='em-editorial';
section.innerHTML='<div class="em-editorial-inner"><div class="em-editorial-top"><div><p class="eyebrow">HOUSTON AUTOMOTIVE PROTECTION</p><h2>PROTECT EVERY SURFACE.<br><span class="red">DRIVE IN COMFORT.</span></h2></div><div><p>Houston heat, harsh sunlight and daily driving demand dependable protection. Compare premium window tint, paint protection film, ceramic coating and paint correction, installed with care by EM Tinting.</p><div class="em-editorial-actions"><a href="#book">BOOK APPOINTMENT</a><a class="secondary" href="#services">EXPLORE SERVICES</a></div></div></div><div class="em-service-photo-grid">'+[
['WINDOW TINT','Heat, glare and privacy control with HITEK window film.','media/hero-01.jpg'],
['PAINT PROTECTION FILM','Help protect painted surfaces against chips and road debris.','media/hero-02.jpg'],
['CERAMIC COATING','Enhance gloss and simplify routine maintenance.','media/hero-03.jpg'],
['PAINT CORRECTION','Restore paint clarity and reduce visible imperfections.','media/hero-04.jpg']
].map(x=>'<article class="em-photo-card"><img src="'+x[2]+'" alt="EM Tinting vehicle service photo" loading="lazy"><div><h3>'+x[0]+'</h3><p>'+x[1]+'</p><a href="#book">REQUEST A QUOTE ↗</a></div></article>').join('')+'</div></div>';
hero.insertAdjacentElement('afterend',section);
}
const visual=document.querySelector('#emTintVisualizer');if(!visual)return;
const options=visual.querySelector('.em-shade-controls');
if(options&&!options.querySelector('[data-shade="30"]')){const b=document.createElement('button');b.type='button';b.className='em-shade-btn';b.dataset.shade='30';b.innerHTML='<strong>30%</strong><span>FRONT DOOR LOOK</span>';options.appendChild(b);b.addEventListener('click',()=>{const ref=options.querySelector('[data-shade="35"]');ref?.click();visual.querySelectorAll('.bmw-window-mask path').forEach(p=>p.style.fill='rgba(35,42,51,.37)');const label=visual.querySelector('#emShadeLabel'),selected=visual.querySelector('#emShadeSelected');if(label)label.textContent='30% VLT';if(selected)selected.textContent='30% — Medium';const field=document.querySelector('#bookingForm [name="preferred_shade"]');if(field){if(!Array.from(field.options).some(o=>o.value==='30%'))field.add(new Option('30%','30%'));field.value='30%'}options.querySelectorAll('.em-shade-btn').forEach(x=>{const on=x===b;x.classList.toggle('active',on);x.setAttribute('aria-pressed',String(on))});updateGuidance(30);});}
const stage=visual.querySelector('.em-shade-stage');if(stage&&!visual.querySelector('.em-view-switch')){const switcher=document.createElement('div');switcher.className='em-view-switch';switcher.innerHTML='<button type="button" aria-pressed="true" data-view="outside">OUTSIDE LOOKING IN</button><button type="button" aria-pressed="false" data-view="inside">INSIDE LOOKING OUT</button>';stage.before(switcher);switcher.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{switcher.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));stage.classList.toggle('em-inside-view',b.dataset.view==='inside')}));}
if(!visual.querySelector('.em-tint-guidance')){const g=document.createElement('div');g.className='em-tint-guidance';g.id='emTintGuidance';visual.querySelector('.em-shade-ui')?.appendChild(g);}
function updateGuidance(v){const g=document.querySelector('#emTintGuidance');if(!g)return;const warning=v<30;g.classList.toggle('warning',warning);g.innerHTML='<strong>'+(warning?'Check Texas front-door compliance':'Texas tint guidance')+'</strong>Texas front side windows generally require a combined film-and-glass light transmission of at least 25%. '+(warning?'This selected film shade may be too dark for front side windows.':'Film VLT alone does not establish compliance; factory glass affects the final reading.')+' Windshield and other windows have separate rules. Confirm your vehicle and applicable exemptions before installation. <a href="https://www.dps.texas.gov/section/vehicle-inspection/window-tinting-standards" target="_blank" rel="noopener">Texas DPS guidance</a>.';}
options?.addEventListener('click',e=>{const b=e.target.closest('[data-shade]');if(b)setTimeout(()=>updateGuidance(Number(b.dataset.shade)),0)});
updateGuidance(70);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
