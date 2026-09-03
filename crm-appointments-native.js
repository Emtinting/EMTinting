(()=>{
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const PRIMARY=['View Details','Edit Date/Time','Call','Text'];
  const COMM=['Text confirmation','24h reminder','Text reschedule','Text cancellation','Email confirmation','Email 24h reminder','Email reschedule','Email cancellation'];
  const txt=el=>(el.textContent||'').trim();

  function ensureStructure(actions){
    let primary=q('.crm-native-primary',actions), comm=q('.crm-native-comm',actions), more=q('.crm-native-more',actions);
    if(!primary){
      actions.classList.add('crm-native-actions');
      primary=document.createElement('div');primary.className='crm-native-primary';
      comm=document.createElement('details');comm.className='crm-native-menu crm-native-comm';
      comm.innerHTML='<summary>Communication ▾</summary><div class="crm-native-menu-panel"></div>';
      more=document.createElement('details');more.className='crm-native-menu crm-native-more';
      more.innerHTML='<summary>•••</summary><div class="crm-native-menu-panel"></div>';
      actions.append(primary,comm,more);
    }
    return {primary,commPanel:q('.crm-native-menu-panel',comm),morePanel:q('.crm-native-menu-panel',more),comm,more};
  }

  function cleanRow(row){
    const actions=q('.table-actions',row); if(!actions)return;
    const s=ensureStructure(actions);
    const loose=qa(':scope > button,:scope > a',actions);
    loose.forEach(el=>{
      const label=txt(el);
      if(PRIMARY.includes(label)){el.classList.add('crm-native-btn');s.primary.appendChild(el);}
      else if(COMM.includes(label)){el.classList.add('crm-native-menu-item');s.commPanel.appendChild(el);}
      else {el.classList.add('crm-native-menu-item');if(label.toLowerCase().includes('cancel appointment'))el.classList.add('crm-native-danger');s.morePanel.appendChild(el);}
    });
    const ordered=[];PRIMARY.forEach(label=>{const el=qa('button,a',s.primary).find(x=>txt(x)===label);if(el)ordered.push(el)});ordered.forEach(el=>s.primary.appendChild(el));
    s.comm.hidden=!s.commPanel.children.length;s.more.hidden=!s.morePanel.children.length;
    const cells=qa('td',row);if(cells.length>4)row.classList.toggle('crm-native-cancelled',(cells[4].textContent||'').trim().toLowerCase()==='cancelled');
  }
  function cleanAll(){qa('#bookingsTable tbody tr').forEach(cleanRow)}
  let timer;
  function schedule(delay=900){clearTimeout(timer);timer=setTimeout(()=>{cleanAll();setTimeout(cleanAll,900)},delay)}
  document.addEventListener('click',e=>{if(e.target.closest('.crm-native-menu'))return;qa('.crm-native-menu[open]').forEach(d=>d.removeAttribute('open'));});
  document.addEventListener('toggle',e=>{const d=e.target;if(!d.matches?.('.crm-native-menu')||!d.open)return;qa('.crm-native-menu[open]').forEach(x=>{if(x!==d)x.removeAttribute('open')});},true);
  function start(){const table=q('#bookingsTable');if(!table)return;new MutationObserver(()=>schedule(1000)).observe(table,{childList:true});schedule(1400)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();