import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.3/+esm';

const SUPABASE_URL='https://neuginokjfvnkmlzhwoa.supabase.co';
const SUPABASE_KEY='sb_publishable_T-XFCPWnkn_meQPK0AKA6A_hRvfRXGk';
const OWNER_EMAIL='emtinting@yahoo.com';
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);

const $=(id)=>document.getElementById(id);
const loginView=$('loginView'), appView=$('appView'), loginForm=$('loginForm'), loginEmail=$('loginEmail'), loginStatus=$('loginStatus');
const bookingRows=$('bookingRows'), searchInput=$('searchInput'), statusFilter=$('statusFilter');
const detailPanel=$('detailPanel');
let bookings=[], customers=new Map(), selectedBooking=null;

function money(v){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(v||0));}
function fmtDate(date,time){if(!date)return '—'; const d=new Date(`${date}T${time||'12:00:00'}`);return d.toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'});}
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function vehicle(b){return [b.vehicle_year,b.vehicle_make,b.vehicle_model].filter(Boolean).join(' ')||'—';}
function customerName(c){return c?[c.first_name,c.last_name].filter(Boolean).join(' '):'Customer';}

async function init(){
  const {data:{session}}=await supabase.auth.getSession();
  renderSession(session);
  supabase.auth.onAuthStateChange((_event,newSession)=>renderSession(newSession));
}

function renderSession(session){
  if(session?.user?.email?.toLowerCase()===OWNER_EMAIL){
    loginView.classList.add('hidden'); appView.classList.remove('hidden'); $('ownerEmail').textContent=session.user.email; loadData();
  }else{
    appView.classList.add('hidden'); loginView.classList.remove('hidden');
  }
}

loginForm.addEventListener('submit',async(e)=>{
  e.preventDefault(); loginStatus.textContent='Sending secure sign-in link…';
  const email=loginEmail.value.trim().toLowerCase();
  if(email!==OWNER_EMAIL){loginStatus.textContent='This CRM is restricted to the EM Tinting business email.';return;}
  const redirectTo=`${location.origin}${location.pathname}`;
  const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:redirectTo}});
  loginStatus.textContent=error?error.message:'Check your email for the secure login link.';
});

$('logoutBtn').addEventListener('click',()=>supabase.auth.signOut());
$('refreshBtn').addEventListener('click',loadData);
searchInput.addEventListener('input',renderRows);
statusFilter.addEventListener('change',renderRows);
$('closeDetail').addEventListener('click',()=>detailPanel.classList.add('hidden'));

async function loadData(){
  bookingRows.innerHTML='<tr><td colspan="7">Loading…</td></tr>';
  const [customerRes,bookingRes]=await Promise.all([
    supabase.from('customers').select('*').order('created_at',{ascending:false}),
    supabase.from('bookings').select('*').order('appointment_date',{ascending:true}).order('appointment_time',{ascending:true})
  ]);
  if(customerRes.error||bookingRes.error){bookingRows.innerHTML=`<tr><td colspan="7" class="empty">${esc(customerRes.error?.message||bookingRes.error?.message||'Unable to load CRM')}</td></tr>`;return;}
  customers=new Map((customerRes.data||[]).map(c=>[c.id,c]));
  bookings=bookingRes.data||[];
  updateStats(); renderRows();
}

function updateStats(){
  const today=new Date();today.setHours(0,0,0,0);
  const upcoming=bookings.filter(b=>new Date(`${b.appointment_date}T00:00:00`)>=today&&!['completed','cancelled'].includes(b.status)).length;
  const newCount=bookings.filter(b=>b.status==='booked').length;
  const completed=bookings.filter(b=>b.status==='completed').length;
  const revenue=bookings.filter(b=>!['cancelled'].includes(b.status)).reduce((sum,b)=>sum+Number(b.quoted_price||0),0);
  $('statUpcoming').textContent=upcoming; $('statNew').textContent=newCount; $('statCompleted').textContent=completed; $('statRevenue').textContent=money(revenue);
}

function renderRows(){
  const q=searchInput.value.trim().toLowerCase(); const filter=statusFilter.value;
  const rows=bookings.filter(b=>{
    const c=customers.get(b.customer_id); const hay=[customerName(c),c?.phone,c?.email,vehicle(b),b.service,b.tint_package].filter(Boolean).join(' ').toLowerCase();
    return (!q||hay.includes(q))&&(!filter||b.status===filter);
  });
  if(!rows.length){bookingRows.innerHTML='<tr><td colspan="7" class="empty">No bookings found.</td></tr>';return;}
  bookingRows.innerHTML=rows.map(b=>{const c=customers.get(b.customer_id);return `<tr><td>${esc(fmtDate(b.appointment_date,b.appointment_time))}</td><td><strong>${esc(customerName(c))}</strong><br><small>${esc(c?.phone||'')}</small></td><td>${esc(vehicle(b))}</td><td>${esc(b.service)}${b.tint_package?`<br><small>${esc(b.tint_package)}</small>`:''}</td><td><span class="badge">${esc((b.status||'booked').replace('_',' '))}</span></td><td>${money(b.quoted_price)}</td><td><button class="row-action" data-id="${b.id}">Open</button></td></tr>`}).join('');
  bookingRows.querySelectorAll('[data-id]').forEach(btn=>btn.addEventListener('click',()=>openDetail(btn.dataset.id)));
}

function openDetail(id){
  selectedBooking=bookings.find(b=>b.id===id); if(!selectedBooking)return;
  const c=customers.get(selectedBooking.customer_id);
  $('detailTitle').textContent=`${customerName(c)} · ${vehicle(selectedBooking)}`;
  $('detailStatus').value=selectedBooking.status||'booked';
  $('detailPrice').value=selectedBooking.quoted_price??'';
  $('detailDeposit').value=selectedBooking.deposit_amount??0;
  $('detailAppointment').value=fmtDate(selectedBooking.appointment_date,selectedBooking.appointment_time);
  $('detailNotes').value=selectedBooking.notes||'';
  $('detailCall').href=c?.phone?`tel:${c.phone}`:'#';
  $('detailText').href=c?.phone?`sms:${c.phone}`:'#';
  $('detailStatusMsg').textContent=''; detailPanel.classList.remove('hidden'); detailPanel.scrollIntoView({behavior:'smooth',block:'start'});
}

$('saveDetail').addEventListener('click',async()=>{
  if(!selectedBooking)return;
  const payload={status:$('detailStatus').value,quoted_price:$('detailPrice').value===''?null:Number($('detailPrice').value),deposit_amount:Number($('detailDeposit').value||0),notes:$('detailNotes').value.trim(),updated_at:new Date().toISOString()};
  $('detailStatusMsg').textContent='Saving…';
  const {error}=await supabase.from('bookings').update(payload).eq('id',selectedBooking.id);
  if(error){$('detailStatusMsg').textContent=error.message;return;}
  Object.assign(selectedBooking,payload); $('detailStatusMsg').textContent='Saved.'; updateStats(); renderRows();
});

init();