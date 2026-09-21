(()=>{
 const items=[['Home','⌂','dashboard'],['Calendar','▣','calendar'],['Quote','＋','quotes'],['Customers','♙','customers'],['Appointments','▤','bookings']];
 function init(){
  if(document.querySelector('.em-mobile-nav'))return;
  const nav=document.createElement('nav');nav.className='em-mobile-nav';nav.setAttribute('aria-label','CRM quick navigation');
  nav.innerHTML=items.map(([label,ico,view],i)=>'<button type="button" data-em-view="'+view+'" aria-label="'+label+'" class="'+(i===2?'em-center':'')+'"><span class="em-icon">'+ico+'</span><span>'+label+'</span></button>').join('');
  document.body.appendChild(nav);
  nav.addEventListener('click',e=>{
   const b=e.target.closest('button[data-em-view]');if(!b)return;
   const view=b.dataset.emView;
   const side=document.querySelector('#nav button[data-view="'+view+'"]');
   if(side){side.click();}else{
    document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
    document.getElementById(view+'View')?.classList.add('active');
   }
   nav.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));
   window.scrollTo(0,0);
  },{passive:true});
  const sync=()=>{const active=document.querySelector('#nav button[data-view].active')?.dataset.view;nav.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.emView===active))};
  document.getElementById('nav')?.addEventListener('click',()=>requestAnimationFrame(sync),{passive:true});sync();
 }
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();