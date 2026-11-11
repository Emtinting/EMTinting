(function(){
const films={
carbon:{name:'HITEK Carbon',price:'$160+',tag:'Classic appearance · Value choice',intro:'A dependable film option for customers who want darker-looking glass, improved privacy and glare reduction at an accessible starting price.',points:['Great for a clean, classic tinted appearance','Helps reduce glare and adds privacy, depending on shade','Best when appearance and budget matter more than maximum heat rejection'],difference:'Carbon is the value option. For stronger infrared heat control, consider Ceramic IR or Ceramic Plus.'},
ir:{name:'HITEK Ceramic IR',price:'$300+',tag:'Ceramic heat control · Everyday comfort',intro:'A ceramic film upgrade designed for better infrared heat management while maintaining a neutral appearance and visibility.',points:['Up to 75% infrared rejection under the referenced film specification','Improved comfort in hot, sunny driving conditions','A balanced choice for performance and price'],difference:'Ceramic IR offers more heat-control performance than basic Carbon. Ceramic Plus is the higher-performance upgrade.'},
plus:{name:'HITEK Ceramic Plus',price:'$450+',tag:'Premium ceramic · Maximum comfort',intro:'Our premium ceramic option for drivers prioritizing heat control, interior comfort and a clean finish.',points:['Up to approximately 90% infrared rejection under referenced specifications','Premium heat-control performance','Ideal for customers who prioritize comfort over the lowest starting price'],difference:'Ceramic Plus is the top-tier choice for maximum heat-control performance in this lineup.'}
};
function init(){
const cards=document.querySelector('.em-option-film');if(!cards||document.getElementById('emFilmDialog'))return;
cards.querySelectorAll('a').forEach((a,i)=>{a.dataset.film=['carbon','ir','plus'][i];a.href='#film-details';a.setAttribute('aria-label','View '+films[a.dataset.film].name+' film details');a.insertAdjacentHTML('beforeend','<span class="em-view-details">VIEW DETAILS +</span>')});
const dialog=document.createElement('dialog');dialog.id='emFilmDialog';dialog.className='em-film-dialog';dialog.setAttribute('aria-labelledby','emFilmTitle');dialog.innerHTML='<div class="em-film-dialog-inner"><button class="em-film-close" type="button" aria-label="Close film details">×</button><p class="em-film-eyebrow">HITEK FILM COLLECTION</p><h2 id="emFilmTitle"></h2><div class="em-film-price"></div><p class="em-film-tag"></p><p class="em-film-intro"></p><h3>What makes it different?</h3><ul class="em-film-points"></ul><p class="em-film-difference"></p><p class="em-film-disclaimer">Starting prices vary by vehicle and coverage. Film performance varies by shade, glass, and testing method. Ask for film-specific warranty and performance details.</p><div class="em-film-actions"><a class="btn em-film-book" href="#book">SELECT THIS FILM & BOOK</a><button type="button" class="em-film-compare">COMPARE ALL FILMS</button></div></div>';document.body.appendChild(dialog);
const close=()=>dialog.close();
dialog.querySelector('.em-film-close').addEventListener('click',close);dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
function openFilm(key){const f=films[key];if(!f)return;dialog.querySelector('#emFilmTitle').textContent=f.name;dialog.querySelector('.em-film-price').textContent='Starting at '+f.price;dialog.querySelector('.em-film-tag').textContent=f.tag;dialog.querySelector('.em-film-intro').textContent=f.intro;dialog.querySelector('.em-film-points').innerHTML=f.points.map(p=>'<li>'+p+'</li>').join('');dialog.querySelector('.em-film-difference').textContent=f.difference;dialog.querySelector('.em-film-book').dataset.film=key;dialog.showModal()}
cards.querySelectorAll('[data-film]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openFilm(a.dataset.film)}));dialog.addEventListener('em:open-film',e=>openFilm(e.detail.key));
dialog.querySelector('.em-film-book').addEventListener('click',()=>{const key=dialog.querySelector('.em-film-book').dataset.film;const form=document.querySelector('#bookingForm');const sel=form?.querySelector('[name="tint_package"]');if(sel){const name=films[key].name;const opt=[...sel.options].find(o=>o.text.toLowerCase().includes(name.replace('HITEK ','').toLowerCase()));if(opt){sel.value=opt.value;sel.dispatchEvent(new Event('change',{bubbles:true}))}}close()});
const compare=document.createElement('section');compare.className='em-film-comparison';compare.id='film-details';compare.innerHTML='<div><p class="em-film-eyebrow">WHICH FILM IS RIGHT FOR YOU?</p><h2>Compare the difference.</h2><p>From budget-friendly privacy to premium ceramic heat control.</p></div><div class="em-film-comparison-grid">'+Object.entries(films).map(([key,f])=>'<article><p>'+f.tag+'</p><h3>'+f.name+'</h3><strong>'+f.price+'</strong><p>'+f.difference+'</p><button type="button" data-compare="'+key+'">VIEW DETAILS →</button></article>').join('')+'</div><p class="em-film-disclaimer">All prices shown are starting prices. Actual pricing depends on vehicle and selected windows.</p>';
cards.insertAdjacentElement('afterend',compare);compare.querySelectorAll('[data-compare]').forEach(b=>b.addEventListener('click',()=>openFilm(b.dataset.compare)));dialog.querySelector('.em-film-compare').addEventListener('click',()=>{close();compare.scrollIntoView({behavior:'smooth'})});
const nav=document.querySelector('.site-header nav');if(nav){const link=nav.querySelector('a[href="#services"]');if(link){link.href='#film-details';link.textContent='FILM OPTIONS'}const filmLink=nav.querySelector('a[href="#film"]');if(filmLink)filmLink.href='#film-packages'}
}
// Use event delegation so clicking a package never navigates to booking before details open.
document.addEventListener('click',function(event){
 const target=event.target.closest('.em-option-film a');
 if(!target)return;
 event.preventDefault();event.stopImmediatePropagation();
 if(!document.getElementById('emFilmDialog'))init();
 const cardList=document.querySelectorAll('.em-option-film a');
 const index=Array.from(cardList).indexOf(target);
 const key=['carbon','ir','plus'][index];
 const details=document.querySelector('#emFilmDialog');
 if(!details)return;
 // Trigger the existing detail-card handler after the dialog has been initialized.
 details.dispatchEvent(new CustomEvent('em:open-film',{detail:{key}}));
},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,50));else setTimeout(init,50);
})();