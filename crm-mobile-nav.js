(()=>{
 function icon(label,emoji,view,center=false){return '<button type="button" data-em-view="'+view+'" aria-label="'+label+'" class="'+(center?'em-center':'')+'"><span class="em-icon">'+emoji+'</span><span>'+label+'</span></button>'}
 function init(){
  if(document.querySelector('.em-mobile-nav'))return;
  const nav=document.createElement('nav');nav.className='em-mobile-nav';nav.setAttribute('aria-label','CRM quick navigation');
  nav.innerHTML=icon('Home','⌂','dashboard')+icon('Calendar','▣','calendar')+icon('Quote','＋','quotes',true)+icon('Customers','♙','customers')+icon('Appointments','▤','bookings');
  document.body.appendChild(nav);
  nav.addEventListener('click',e=>{
   const b=e.target.closest('[data-em-view]');if(!b)return;
   const view=b.dataset.emView;
   const side=document.querySelector('#nav [data-view="'+view+'"]');
   if(side){side.click()}else if(view==='quotes'){document.querySelector('#quotesView')?.classList.add('active')}
   nav.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));
   window.scrollTo({top:0,behavior:'smooth'});
  });
  const sync=()=>{const active=document.querySelector('#nav [data-view].active')?.dataset.view;nav.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.emView===active))};
  new MutationObserver(sync).observe(document.getElementById('nav'),{attributes:true,subtree:true,attributeFilter:['class']});sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();