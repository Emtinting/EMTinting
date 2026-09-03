(()=>{
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const hideZeroTotals=()=>{
    qsa('#bookingsTable tbody tr').forEach(row=>{
      const cells=qsa('td',row); if(cells.length<6)return;
      const serviceCell=cells[3];
      serviceCell.innerHTML=serviceCell.innerHTML.replace(/<br><strong>\$0\.00<\/strong>/g,'');
      const status=(cells[4].textContent||'').trim().toLowerCase();
      row.classList.toggle('crm-row-cancelled',status==='cancelled');
    });
  };
  const buttonByText=(actions,text)=>qsa('button,a',actions).find(x=>(x.textContent||'').trim()===text);
  const makeMenuButton=(label,cls)=>{const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=label;return b;};
  function cleanActions(){
    qsa('#bookingsTable tbody tr').forEach(row=>{
      const actions=qs('.table-actions',row); if(!actions||actions.dataset.clean==='1')return;
      const items=qsa('button,a',actions);
      if(!items.length)return;
      const keepLabels=['View Details','Edit Date/Time','Call','Text'];
      const keep=keepLabels.map(l=>buttonByText(actions,l)).filter(Boolean);
      const communicationLabels=['Text confirmation','24h reminder','Text reschedule','Text cancellation','Email confirmation','Email 24h reminder','Email reschedule','Email cancellation'];
      const moreLabels=['Log call (0)','Confirm','Unconfirm','Check-in','Check-out','Make job','Deposit','No-show','Warranty','Review text','Cancel appointment'];
      const comm=items.filter(x=>communicationLabels.includes((x.textContent||'').trim()));
      const more=items.filter(x=>moreLabels.includes((x.textContent||'').trim())||/Log call \(/.test((x.textContent||'').trim()));
      const used=new Set([...keep,...comm,...more]);
      const extras=items.filter(x=>!used.has(x));
      more.push(...extras);
      actions.innerHTML='';
      actions.classList.add('crm-actions-clean');
      keep.forEach(x=>{x.classList.add('crm-action-primary');actions.appendChild(x);});
      if(comm.length){
        const wrap=document.createElement('div');wrap.className='crm-action-menu';
        const trigger=makeMenuButton('Communication ▾','crm-action-primary crm-action-menu-trigger');
        const menu=document.createElement('div');menu.className='crm-action-menu-panel';
        comm.forEach(x=>{x.classList.add('crm-menu-item');menu.appendChild(x);});
        wrap.append(trigger,menu);actions.appendChild(wrap);
        trigger.onclick=e=>{e.stopPropagation();qsa('.crm-action-menu-panel.open').forEach(p=>{if(p!==menu)p.classList.remove('open')});menu.classList.toggle('open');};
      }
      if(more.length){
        const wrap=document.createElement('div');wrap.className='crm-action-menu';
        const trigger=makeMenuButton('•••','crm-action-primary crm-action-more');
        trigger.setAttribute('aria-label','More appointment actions');
        const menu=document.createElement('div');menu.className='crm-action-menu-panel crm-action-menu-right';
        more.forEach(x=>{x.classList.add('crm-menu-item');if((x.textContent||'').toLowerCase().includes('cancel appointment'))x.classList.add('crm-menu-danger');menu.appendChild(x);});
        wrap.append(trigger,menu);actions.appendChild(wrap);
        trigger.onclick=e=>{e.stopPropagation();qsa('.crm-action-menu-panel.open').forEach(p=>{if(p!==menu)p.classList.remove('open')});menu.classList.toggle('open');};
      }
      actions.dataset.clean='1';
    });
    hideZeroTotals();
  }
  document.addEventListener('click',()=>qsa('.crm-action-menu-panel.open').forEach(p=>p.classList.remove('open')));
  const obs=new MutationObserver(()=>cleanActions());
  const start=()=>{const t=qs('#bookingsTable');if(t)obs.observe(t,{childList:true,subtree:true});cleanActions();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,800));else setTimeout(start,800);
})();