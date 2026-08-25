(()=>{
  function ensurePreviewDialog(){
    let dialog=document.getElementById('crmWarrantyPreviewDialog');
    if(dialog) return dialog;
    dialog=document.createElement('dialog');
    dialog.id='crmWarrantyPreviewDialog';
    dialog.className='modal wide';
    dialog.innerHTML=`<div style="padding:20px"><header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><div><p class="eyebrow">HITEK E-WARRANTY</p><h3 style="margin:0">Warranty Card Preview</h3></div><button type="button" class="x" id="crmWarrantyPreviewClose">×</button></header><div id="crmWarrantyPreviewBody"></div><div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px"><button type="button" class="btn ghost" id="crmWarrantyPreviewBack">Back</button><button type="button" class="btn primary" id="crmWarrantyPreviewPrint">Print Warranty Card</button></div></div>`;
    document.body.appendChild(dialog);
    dialog.querySelector('#crmWarrantyPreviewClose').onclick=()=>dialog.close();
    dialog.querySelector('#crmWarrantyPreviewBack').onclick=()=>dialog.close();
    dialog.querySelector('#crmWarrantyPreviewPrint').onclick=()=>printPreview();
    return dialog;
  }

  function previewWarranty(){
    const source=document.getElementById('crmWarrantyCard');
    if(!source) return typeof toast==='function'?toast('Open an appointment warranty first'):null;
    const form=source.querySelector('#crmWarrantyForm');
    if(form) return typeof toast==='function'?toast('Save the warranty first to preview the finished card'):null;
    if(source.querySelector('.empty')) return typeof toast==='function'?toast('Create a HITEK warranty first'):null;
    const dialog=ensurePreviewDialog();
    const body=dialog.querySelector('#crmWarrantyPreviewBody');
    body.innerHTML=`<div class="crm-ewarranty-card crm-preview-card" style="max-width:900px;margin:0 auto">${source.innerHTML}</div>`;
    dialog.showModal();
  }

  function printPreview(){
    const card=document.querySelector('#crmWarrantyPreviewBody .crm-ewarranty-card');
    if(!card) return;
    const win=window.open('','_blank','width=1000,height=800');
    if(!win) return typeof toast==='function'?toast('Allow pop-ups to print the warranty card'):null;
    const modern=[...document.styleSheets].map(s=>s.href).filter(Boolean).filter(h=>h.includes('crm.css')||h.includes('crm-modern.css')||h.includes('crm-film.css'));
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>HITEK Warranty Card</title>${modern.map(h=>`<link rel="stylesheet" href="${h}">`).join('')}<style>body{background:#fff!important;padding:24px}.crm-ewarranty-card{max-width:900px;margin:0 auto;box-shadow:none}@media print{body{padding:0}.crm-ewarranty-card{border:0}}</style></head><body>${card.outerHTML}<script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`);
    win.document.close();
  }

  function enhance(){
    document.querySelectorAll('.crm-ewarranty-actions').forEach(actions=>{
      if(actions.querySelector('[data-warranty-preview]')) return;
      const print=[...actions.querySelectorAll('button')].find(b=>b.textContent.trim()==='Print');
      if(!print) return;
      const preview=document.createElement('button');
      preview.type='button';
      preview.dataset.warrantyPreview='1';
      preview.textContent='Preview Warranty Card';
      preview.onclick=previewWarranty;
      actions.insertBefore(preview,print);
      print.onclick=previewWarranty;
      print.textContent='Preview / Print';
    });
  }

  const obs=new MutationObserver(()=>enhance());
  obs.observe(document.body,{childList:true,subtree:true});
  enhance();
})();