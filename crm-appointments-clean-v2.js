(()=>{
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const COMM=['Text confirmation','24h reminder','Text reschedule','Text cancellation','Email confirmation','Email 24h reminder','Email reschedule','Email cancellation'];
  const KEEP=['View Details','Edit Date/Time','Call','Text'];
  const label=el=>(el.textContent||'').trim();
  const isComm=el=>COMM.includes(label(el));
  const isKeep=el=>KEEP.includes(label(el));
  function closeMenus(except){qa('.crm-safe-menu[open]').forEach(x=>{if(x!==except)x.removeAttribute('open')});}
  function proxy(original){const b=document.createElement('button');b.type='button';b.className='crm-safe-menu-item';b.textContent=label(original);b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();original.click();closeMenus();});return b;}
  function buildMenu(title,items,cls=''){
    const d=document.createElement('details');d.className='crm-safe-menu '+cls;
    const s=document.createElement('summary');s.textContent=title;d.appendChild(s);
    const p=document.createElement('div');p.className='crm-safe-menu-panel';items.forEach(x=>p.appendChild(proxy(x)));d.appendChild(p);
    d.addEventListener('toggle',()=>{if(d.open)closeMenus(d)});return d;
  }
  function enhanceRow(row){
    const actions=q('.table-actions',row);if(!actions)return;
    const originals=qa('button,a',actions).filter(x=>!x.closest('.crm-safe-menu'));
    if(!originals.length)return;
    let shell=q('.crm-safe-actions',actions);
    if(!shell){shell=document.createElement('span');shell.className='crm-safe-actions';actions.appendChild(shell);}
    const signature=originals.map(label).join('|');if(shell.dataset.signature===signature)return;
    shell.dataset.signature=signature;shell.replaceChildren();
    originals.forEach(x=>x.classList.remove('crm-safe-hidden'));
    const keep=originals.filter(isKeep),comm=originals.filter(isComm),more=originals.filter(x=>!isKeep(x)&&!isComm(x));
    originals.forEach(x=>x.classList.add('crm-safe-hidden'));
    keep.forEach(x=>{const c=x.cloneNode(true);c.classList.remove('crm-safe-hidden');c.classList.add('crm-safe-primary');c.removeAttribute('onclick');c.addEventListener('click',e=>{e.preventDefault();x.click();});shell.appendChild(c);});
    if(comm.length)shell.appendChild(buildMenu('Communication ▾',comm));
    if(more.length)shell.appendChild(buildMenu('•••',more,'crm-safe-more'));
    const cells=qa('td',row);if(cells.length>4){const status=(cells[4].textContent||'').trim().toLowerCase();row.classList.toggle('crm-safe-cancelled',status==='cancelled');}
  }
  function run(){qa('#bookingsTable tbody tr').forEach(enhanceRow);}
  let timer=0;function schedule(){clearTimeout(timer);timer=setTimeout(run,60)}
  document.addEventListener('click',e=>{if(!e.target.closest('.crm-safe-menu'))closeMenus();});
  const start=()=>{const t=q('#bookingsTable');if(!t)return;new MutationObserver(schedule).observe(t,{childList:true,subtree:true});run();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,1200));else setTimeout(start,1200);
})();