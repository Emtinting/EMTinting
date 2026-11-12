(()=>{
'use strict';
const $=s=>document.querySelector(s);
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const phone=v=>String(v||'').replace(/[^+0-9]/g,'');
const key='em-website-lead-status-v1';
let leads=[],statuses={};
try{statuses=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(e){statuses={}}
const statusFor=x=>statuses[x.id]||'new';
function setStatus(id,value){statuses[id]=value;try{localStorage.setItem(key,JSON.stringify(statuses))}catch(e){}render()}
function ensure(){
 const cal=$('#calendarView');if(!cal)return false;
 if($('#emWebsiteLeads'))return true;
 const panel=document.createElement('section');panel.id='emWebsiteLeads';panel.className='panel';
 cal.insertBefore(panel,cal.firstChild);
 panel.addEventListener('click',event=>{
  const button=event.target.closest('[data-lead-action]');if(!button)return;
  const lead=leads.find(x=>String(x.id)===button.dataset.id);if(!lead)return;
  const action=button.dataset.leadAction;
  if(action==='contact')setStatus(lead.id,'contacted');
  if(action==='dismiss')setStatus(lead.id,'not_interested');
  if(action==='restore')setStatus(lead.id,'new');
  if(action==='book'){
   if(typeof prepareAppointment!=='function')return alert('Appointment form is not ready.');
   prepareAppointment();
   const set=(id,value)=>{const el=$('#'+id);if(el)el.value=value||''};
   set('apptFirst',lead.first_name);set('apptLast',lead.last_name);
   set('apptPhone',lead.phone);set('apptEmail',lead.email);
   set('apptYear',lead.vehicle_year);set('apptMake',lead.vehicle_make);set('apptModel',lead.vehicle_model);
   set('apptDate',lead.appointment_date||new Date().toLocaleDateString('en-CA'));
   set('apptTime',(lead.appointment_time||'18:00').slice(0,5));
   set('apptSummary',[lead.service,lead.tint_package,lead.tint_coverage,lead.preferred_shade].filter(Boolean).join(' · '));
   set('apptNotes','Website lead follow-up. '+(lead.notes||lead.message||''));
   $('#apptPhone')?.dispatchEvent(new Event('input'));
   $('#appointmentModal')?.showModal();
   setStatus(lead.id,'contacted');
  }
 });
 return true;
}
function render(){
 if(!ensure())return;
 const panel=$('#emWebsiteLeads');
 const active=leads.filter(x=>statusFor(x)==='new'&&!x.completed);
 const contacted=leads.filter(x=>statusFor(x)==='contacted'&&!x.completed);
 const done=leads.filter(x=>statusFor(x)==='not_interested'||x.completed);
 const card=x=>{
  const name=[x.first_name,x.last_name].filter(Boolean).join(' ')||'Website visitor';
  const vehicle=[x.vehicle_year,x.vehicle_make,x.vehicle_model].filter(Boolean).join(' ');
  const details=[x.service,x.tint_package,x.tint_coverage,x.preferred_shade].filter(Boolean).join(' · ');
  const p=phone(x.phone);
  const links=[p?'<a href="tel:'+escapeHTML(p)+'">Call</a>':'',p?'<a href="sms:'+escapeHTML(p)+'">Text</a>':'',x.email?'<a href="mailto:'+encodeURIComponent(x.email)+'">Email</a>':''].filter(Boolean).join(' · ');
  const s=statusFor(x);
  return '<article class="em-lead-card"><div class="em-lead-head"><strong>'+escapeHTML(name)+'</strong><span>'+escapeHTML(s==='new'?'New lead':s==='contacted'?'Contacted':x.completed?'Submitted':'Not interested')+'</span></div><div class="em-lead-muted">'+escapeHTML(vehicle||'Vehicle not provided')+' · '+escapeHTML(details||'Website inquiry')+'</div><p>'+escapeHTML(x.notes||x.message||'Requested information through the website')+'</p><div class="em-lead-actions"><div>'+links+'</div><div class="em-lead-buttons">'+(s==='new'?'<button data-lead-action="contact" data-id="'+escapeHTML(x.id)+'">✓ Mark contacted</button>':'')+(s!=='not_interested'&&!x.completed?'<button data-lead-action="book" data-id="'+escapeHTML(x.id)+'">📅 Book</button><button data-lead-action="dismiss" data-id="'+escapeHTML(x.id)+'">Not interested</button>':'<button data-lead-action="restore" data-id="'+escapeHTML(x.id)+'">Restore</button>')+'</div></div></article>';
 };
 panel.innerHTML='<div class="em-lead-title"><div><h3>✉ Website Leads — EM Tinting</h3><p>Quote and booking inquiries from your website. Call or text, then mark contacted or book.</p></div><button id="emRefreshLeads" type="button">Refresh</button></div><p class="em-lead-summary"><strong>'+active.length+'</strong> waiting for a callback · '+contacted.length+' contacted</p>'+ (active.length?active.map(card).join(''):'<div class="em-lead-empty">No new website leads waiting for follow-up.</div>')+'<div class="em-lead-footer"><button id="emShowContacted" type="button">Show contacted ('+contacted.length+')</button><button id="emShowDone" type="button">Done ('+done.length+')</button></div><div id="emLeadExtra" hidden></div><small class="em-lead-note">Lead follow-up statuses are saved in this browser. Completed bookings remain in your appointments.</small>';
 $('#emRefreshLeads').onclick=load;
 $('#emShowContacted').onclick=()=>{const el=$('#emLeadExtra');el.hidden=!el.hidden;el.innerHTML=contacted.length?contacted.map(card).join(''):'<p>No contacted leads.</p>'};
 $('#emShowDone').onclick=()=>{const el=$('#emLeadExtra');el.hidden=!el.hidden;el.innerHTML=done.length?done.map(card).join(''):'<p>No completed or dismissed leads.</p>'};
}
async function load(){
 if(!ensure()||typeof db==='undefined')return;
 const {data:{session}}=await db.auth.getSession();if(!session)return;
 const {data,error}=await db.from('booking_attempts').select('*').order('last_seen_at',{ascending:false}).limit(100);
 if(error){$('#emWebsiteLeads').innerHTML='<p>Unable to load website leads: '+escapeHTML(error.message)+'</p>';return}
 leads=(data||[]).filter(x=>x.phone||x.email);
 render();
}
const style=document.createElement('style');style.textContent=`#emWebsiteLeads{margin-bottom:20px;padding:20px;border:1px solid #444;border-radius:15px;background:#161616;color:#f4f4f4}.em-lead-title,.em-lead-head,.em-lead-actions,.em-lead-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.em-lead-title h3{margin:0 0 5px;font-size:21px}.em-lead-title p,.em-lead-muted,.em-lead-note{color:#aaa}.em-lead-summary{margin:18px 0}.em-lead-card{border:1px solid #8b5d28;background:#241d15;border-radius:13px;padding:16px;margin:12px 0}.em-lead-head strong{font-size:19px}.em-lead-head span{color:#e6b46d}.em-lead-card p{margin:12px 0}.em-lead-actions a{color:#ff8888}.em-lead-buttons{display:flex;gap:7px;flex-wrap:wrap}#emWebsiteLeads button{cursor:pointer;border:1px solid #555;border-radius:9px;background:#2c2c2c;color:white;padding:10px 13px;font:inherit}#emWebsiteLeads button[data-lead-action=contact]{background:#bc2428;border-color:#bc2428}.em-lead-footer{margin-top:15px}.em-lead-empty{padding:20px;color:#aaa;text-align:center}.em-lead-note{display:block;margin-top:12px}@media(max-width:600px){#emWebsiteLeads{padding:13px}.em-lead-actions{align-items:flex-start}.em-lead-buttons{width:100%}}`;document.head.appendChild(style);
function init(){ensure();setTimeout(load,700);$('#refreshBtn')?.addEventListener('click',()=>setTimeout(load,400));db.auth.onAuthStateChange((event)=>{if(event==='SIGNED_IN')setTimeout(load,500)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();