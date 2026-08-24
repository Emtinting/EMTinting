const SUPABASE_URL='https://neuginokjfvnkmlzhwoa.supabase.co';
const SUPABASE_KEY='sb_publishable_T-XFCPWnkn_meQPK0AKA6A_hRvfRXGk';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const OWNER_EMAIL='emtinting@yahoo.com';
const state={customers:[],bookings:[],quotes:[],jobs:[],payments:[]};
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(v||0));
const dateFmt=v=>v?new Date(`${v}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—';
const customerName=c=>c?`${c.first_name||''} ${c.last_name||''}`.trim():'Unknown';
const customerById=id=>state.customers.find(c=>c.id===id);
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2400)}
function pill(v){return `<span class="pill ${esc(v)}">${esc(String(v||'').replaceAll('_',' '))}</span>`}
function showAuth(){ $('#authScreen').classList.remove('hidden');$('#app').classList.add('hidden') }
function showApp(){ $('#authScreen').classList.add('hidden');$('#app').classList.remove('hidden') }

async function boot(){
  const {data:{session}}=await db.auth.getSession();
  if(session?.user?.email?.toLowerCase()===OWNER_EMAIL){showApp();await loadAll()}else showAuth();
}

db.auth.onAuthStateChange(async(event,session)=>{
  if(event==='PASSWORD_RECOVERY'){
    showAuth();$('#loginForm').classList.add('hidden');$('#signupForm').classList.add('hidden');$('#recoveryForm').classList.remove('hidden');
    $('#authMessage').textContent='Enter a new password for your CRM.';
  }
  if(event==='SIGNED_IN' && session?.user?.email?.toLowerCase()===OWNER_EMAIL){showApp();await loadAll()}
});

$('#showSignup').addEventListener('click',()=>$('#signupForm').classList.toggle('hidden'));
$('#forgotPassword').addEventListener('click',async()=>{
  $('#authMessage').textContent='Sending password reset...';
  const redirectTo=location.href.split('#')[0].split('?')[0];
  const {error}=await db.auth.resetPasswordForEmail(OWNER_EMAIL,{redirectTo});
  $('#authMessage').textContent=error?error.message:'Password reset email sent.';
});
$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();$('#authMessage').textContent='';
  const email=$('#loginEmail').value.trim().toLowerCase();
  if(email!==OWNER_EMAIL){$('#authMessage').textContent='This CRM is restricted to the EM Tinting owner account.';return}
  const {error}=await db.auth.signInWithPassword({email,password:$('#loginPassword').value});
  if(error)$('#authMessage').textContent=error.message;
});
$('#signupForm').addEventListener('submit',async e=>{
  e.preventDefault();$('#authMessage').textContent='';
  const email=$('#signupEmail').value.trim().toLowerCase();
  if(email!==OWNER_EMAIL){$('#authMessage').textContent='Use the EM Tinting owner email.';return}
  const {data,error}=await db.auth.signUp({email,password:$('#signupPassword').value,options:{emailRedirectTo:location.href.split('#')[0].split('?')[0]}});
  if(error){$('#authMessage').textContent=error.message;return}
  $('#authMessage').textContent=data.session?'Account created. Loading CRM...':'Account created. Check your email to confirm the login.';
});
$('#recoveryForm').addEventListener('submit',async e=>{
  e.preventDefault();const {error}=await db.auth.updateUser({password:$('#recoveryPassword').value});
  if(error){$('#authMessage').textContent=error.message;return}
  $('#authMessage').textContent='Password updated.';$('#recoveryForm').classList.add('hidden');showApp();await loadAll();
});
$('#signOut').addEventListener('click',async()=>{await db.auth.signOut();location.reload()});
$('#refreshBtn').addEventListener('click',loadAll);

$('#nav').addEventListener('click',e=>{
  const b=e.target.closest('[data-view]');if(!b)return;
  document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));$(`#${b.dataset.view}View`).classList.add('active');$('#pageTitle').textContent=b.textContent;
});
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>{$(`#${b.dataset.open}`).showModal()}));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{$(`#${b.dataset.close}`).close()}));

async function loadAll(){
  $('#refreshBtn').textContent='Loading...';
  const [customers,bookings,quotes,jobs,payments]=await Promise.all([
    db.from('customers').select('*').order('created_at',{ascending:false}),
    db.from('bookings').select('*').order('appointment_date',{ascending:true}),
    db.from('quotes').select('*').order('created_at',{ascending:false}),
    db.from('jobs').select('*').order('scheduled_date',{ascending:true}),
    db.from('payments').select('*').order('created_at',{ascending:false})
  ]);
  const err=[customers,bookings,quotes,jobs,payments].find(x=>x.error)?.error;
  if(err){toast(err.message);$('#refreshBtn').textContent='Refresh';return}
  state.customers=customers.data||[];state.bookings=bookings.data||[];state.quotes=quotes.data||[];state.jobs=jobs.data||[];state.payments=payments.data||[];
  renderAll();$('#refreshBtn').textContent='Refresh';
}
function renderAll(){renderDashboard();renderBookings();renderCustomers();renderQuotes();renderJobs();renderPayments();fillCustomerSelects()}
function renderDashboard(){
  const today=new Date().toISOString().slice(0,10);
  const upcoming=state.bookings.filter(b=>b.appointment_date>=today&&!['cancelled','completed'].includes(b.status));
  const openQuotes=state.quotes.filter(q=>['draft','sent'].includes(q.status));
  const openJobs=state.jobs.filter(j=>!['completed','cancelled','no_show'].includes(j.status));
  const revenue=state.payments.filter(p=>p.status==='paid').reduce((n,p)=>n+(p.payment_type==='refund'?-Number(p.amount):Number(p.amount)),0);
  $('#statUpcoming').textContent=upcoming.length;$('#statQuotes').textContent=openQuotes.length;$('#statJobs').textContent=openJobs.length;$('#statRevenue').textContent=money(revenue);
  $('#nextBookings').innerHTML=upcoming.slice(0,6).map(b=>{const c=customerById(b.customer_id);return `<div class="list-item"><div><strong>${esc(customerName(c))}</strong><small>${esc(b.service)} · ${dateFmt(b.appointment_date)} ${esc((b.appointment_time||'').slice(0,5))}</small></div>${pill(b.status)}</div>`}).join('')||'<div class="empty">No upcoming bookings</div>';
  $('#recentCustomers').innerHTML=state.customers.slice(0,6).map(c=>`<div class="list-item"><div><strong>${esc(customerName(c))}</strong><small>${esc(c.phone)}${c.email?' · '+esc(c.email):''}</small></div></div>`).join('')||'<div class="empty">No customers yet</div>';
}
function renderBookings(filter=''){
  let rows=state.bookings;if(filter){const q=filter.toLowerCase();rows=rows.filter(b=>{const c=customerById(b.customer_id);return [customerName(c),c?.phone,b.service,b.vehicle_make,b.vehicle_model,b.tint_package].join(' ').toLowerCase().includes(q)})}
  $('#bookingsTable').innerHTML=table(['Customer','Date','Service','Vehicle','Status','Quote','Actions'],rows.map(b=>{const c=customerById(b.customer_id);const vehicle=[b.vehicle_year,b.vehicle_make,b.vehicle_model].filter(Boolean).join(' ');return [customerName(c),`${dateFmt(b.appointment_date)} ${(b.appointment_time||'').slice(0,5)}`,b.service,vehicle||'—',pill(b.status),b.quoted_price?money(b.quoted_price):'—',`<div class="table-actions"><button onclick="bookingToJob('${b.id}')">Make job</button><button onclick="updateBookingStatus('${b.id}','completed')">Complete</button><button onclick="updateBookingStatus('${b.id}','cancelled')">Cancel</button></div>`] }));
}
function renderCustomers(filter=''){
  let rows=state.customers;if(filter){const q=filter.toLowerCase();rows=rows.filter(c=>[c.first_name,c.last_name,c.phone,c.email].join(' ').toLowerCase().includes(q))}
  $('#customersTable').innerHTML=table(['Customer','Phone','Email','Created'],rows.map(c=>[customerName(c),c.phone,c.email||'—',new Date(c.created_at).toLocaleDateString()]));
}
function renderQuotes(){
  $('#quotesTable').innerHTML=table(['Customer','Service','Amount','Status','Created','Actions'],state.quotes.map(q=>{const c=customerById(q.customer_id);return [customerName(c),q.service,money(q.amount),pill(q.status),new Date(q.created_at).toLocaleDateString(),`<div class="table-actions"><button onclick="updateQuoteStatus('${q.id}','sent')">Sent</button><button onclick="quoteToJob('${q.id}')">Make job</button><button onclick="updateQuoteStatus('${q.id}','declined')">Decline</button></div>`]}));
}
function renderJobs(){
  $('#jobsTable').innerHTML=table(['Customer','Service','Schedule','Total','Status','Actions'],state.jobs.map(j=>{const c=customerById(j.customer_id);return [customerName(c),j.service,`${dateFmt(j.scheduled_date)} ${(j.scheduled_time||'').slice(0,5)}`,money(j.total_amount),pill(j.status),`<div class="table-actions"><button onclick="updateJobStatus('${j.id}','in_progress')">Start</button><button onclick="updateJobStatus('${j.id}','completed')">Complete</button></div>`]}));
}
function renderPayments(){
  $('#paymentsTable').innerHTML=table(['Customer','Amount','Type','Method','Status','Date'],state.payments.map(p=>{const c=customerById(p.customer_id);return [customerName(c),money(p.amount),pill(p.payment_type),(p.method||'—').replaceAll('_',' '),pill(p.status),new Date(p.paid_at||p.created_at).toLocaleDateString()]}));
}
function table(headers,rows){if(!rows.length)return'<div class="empty">Nothing here yet</div>';return `<table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${typeof c==='string'&&c.startsWith('<')?c:esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`}
function fillCustomerSelects(){const options='<option value="">Select customer</option>'+state.customers.map(c=>`<option value="${c.id}">${esc(customerName(c))} · ${esc(c.phone)}</option>`).join('');['quoteCustomer','jobCustomer','paymentCustomer'].forEach(id=>{$(`#${id}`).innerHTML=options})}
$('#bookingSearch').addEventListener('input',e=>renderBookings(e.target.value));$('#customerSearch').addEventListener('input',e=>renderCustomers(e.target.value));

$('#customerForm').addEventListener('submit',async e=>{
  e.preventDefault();const payload={first_name:$('#customerFirst').value.trim(),last_name:$('#customerLast').value.trim(),phone:$('#customerPhone').value.trim(),email:$('#customerEmail').value.trim()||null};
  const {error}=await db.from('customers').insert(payload);if(error)return toast(error.message);$('#customerModal').close();e.target.reset();toast('Customer added');await loadAll();
});
$('#quoteForm').addEventListener('submit',async e=>{
  e.preventDefault();const payload={customer_id:$('#quoteCustomer').value,service:$('#quoteService').value.trim(),film_package:$('#quoteFilm').value.trim()||null,amount:Number($('#quoteAmount').value),notes:$('#quoteNotes').value.trim()||null,status:'draft'};
  const {error}=await db.from('quotes').insert(payload);if(error)return toast(error.message);$('#quoteModal').close();e.target.reset();toast('Quote saved');await loadAll();
});
$('#jobForm').addEventListener('submit',async e=>{
  e.preventDefault();const payload={customer_id:$('#jobCustomer').value,service:$('#jobService').value.trim(),scheduled_date:$('#jobDate').value||null,scheduled_time:$('#jobTime').value||null,total_amount:Number($('#jobTotal').value||0),status:'scheduled'};
  const {error}=await db.from('jobs').insert(payload);if(error)return toast(error.message);$('#jobModal').close();e.target.reset();toast('Job saved');await loadAll();
});
$('#paymentForm').addEventListener('submit',async e=>{
  e.preventDefault();const payload={customer_id:$('#paymentCustomer').value,amount:Number($('#paymentAmount').value),payment_type:$('#paymentType').value,method:$('#paymentMethod').value,status:'paid',paid_at:new Date().toISOString()};
  const {error}=await db.from('payments').insert(payload);if(error)return toast(error.message);$('#paymentModal').close();e.target.reset();toast('Payment added');await loadAll();
});
window.updateBookingStatus=async(id,status)=>{const {error}=await db.from('bookings').update({status,updated_at:new Date().toISOString()}).eq('id',id);if(error)return toast(error.message);toast('Booking updated');await loadAll()};
window.updateQuoteStatus=async(id,status)=>{const {error}=await db.from('quotes').update({status,updated_at:new Date().toISOString()}).eq('id',id);if(error)return toast(error.message);toast('Quote updated');await loadAll()};
window.updateJobStatus=async(id,status)=>{const changes={status,updated_at:new Date().toISOString()};if(status==='completed')changes.completed_at=new Date().toISOString();const {error}=await db.from('jobs').update(changes).eq('id',id);if(error)return toast(error.message);toast('Job updated');await loadAll()};
window.bookingToJob=async id=>{
  const b=state.bookings.find(x=>x.id===id);if(!b)return;const exists=state.jobs.some(j=>j.booking_id===id);if(exists)return toast('This booking already has a job');
  const payload={customer_id:b.customer_id,booking_id:b.id,service:b.service,scheduled_date:b.appointment_date,scheduled_time:b.appointment_time,total_amount:Number(b.quoted_price||0),status:'scheduled',notes:b.notes||null};
  const {error}=await db.from('jobs').insert(payload);if(error)return toast(error.message);toast('Booking converted to job');await loadAll();
};
window.quoteToJob=async id=>{
  const q=state.quotes.find(x=>x.id===id);if(!q)return;const exists=state.jobs.some(j=>j.quote_id===id);if(exists)return toast('This quote already has a job');
  const payload={customer_id:q.customer_id,quote_id:q.id,service:q.service,total_amount:Number(q.amount||0),status:'scheduled',notes:q.notes||null};
  const {error}=await db.from('jobs').insert(payload);if(error)return toast(error.message);await db.from('quotes').update({status:'accepted',updated_at:new Date().toISOString()}).eq('id',id);toast('Quote accepted and job created');await loadAll();
};
boot();