/* Calendar-first navigation. No data or authentication changes. */
(()=>{
 let activated=false;
 function start(){
  const app=document.getElementById('app');
  const calendar=document.querySelector('#nav [data-view="calendar"]');
  const calendarView=document.getElementById('calendarView');
  if(!app||app.classList.contains('hidden')||!calendar||!calendarView||activated)return;
  activated=true;
  calendar.click();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
 const obs=new MutationObserver(()=>{if(!activated)start()});
 obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
 setTimeout(start,1000);
})();
