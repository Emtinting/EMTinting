(()=>{
  let bookingId=null, checkoutUrl="";
  function install(){
    if(typeof window.openInvoice==="function"&&!window.openInvoice.__stripeWrapped){
      const original=window.openInvoice;
      const wrapped=function(id){bookingId=id;checkoutUrl="";return original.apply(this,arguments)};
      wrapped.__stripeWrapped=true;
      window.openInvoice=wrapped;
      window.openInvoiceForBooking=wrapped;
    }
    const dialog=document.getElementById("invoiceModal");
    if(!dialog||document.getElementById("stripeInvoiceActions"))return;
    const anchor=document.getElementById("invoicePrint");
    if(!anchor)return;
    const holder=document.createElement("div");holder.id="stripeInvoiceActions";holder.style.cssText="margin-top:14px;padding:14px;border:1px solid #ccc;border-radius:10px";
    holder.innerHTML='<button type="button" id="stripeCreateLink" class="btn primary">Create Secure Stripe Payment Link</button><div id="stripeInvoiceResult" style="margin-top:10px;overflow-wrap:anywhere"></div>';
    anchor.parentElement.after(holder);
    document.getElementById("stripeCreateLink").addEventListener("click",async()=>{
      const btn=document.getElementById("stripeCreateLink"),output=document.getElementById("stripeInvoiceResult");
      if(!bookingId){output.textContent="Reopen the appointment invoice and try again.";return}
      const price=Number(document.getElementById("invPrice")?.value||0);
      const discount=Number(document.getElementById("invDiscount")?.value||0);
      const tax=Number(document.getElementById("invTax")?.value||0);
      const paid=Number(document.getElementById("invPaid")?.value||0);
      const balance=Math.round((price-discount+tax-paid)*100);
      if(!Number.isSafeInteger(balance)||balance<50){output.textContent="Balance due must be at least $0.50.";return}
      if(checkoutUrl&&!confirm("Create another payment link? The previous link will remain active."))return;
      btn.disabled=true;btn.textContent="Creating secure link...";
      try{
        const {data,error}=await db.functions.invoke("create-stripe-checkout",{body:{booking_id:bookingId,amount_cents:balance}});
        if(error||!data?.url)throw new Error(data?.error||error?.message||"Unable to create payment link");
        checkoutUrl=data.url;
        output.replaceChildren();
        const p=document.createElement("p");p.textContent="Payment link for "+new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(balance/100)+":";
        const a=document.createElement("a");a.href=checkoutUrl;a.target="_blank";a.rel="noopener noreferrer";a.textContent=checkoutUrl;a.style.overflowWrap="anywhere";
        const email=document.createElement("a");email.className="btn ghost";email.textContent="Email Payment Link";email.style.marginTop="12px";email.style.display="inline-block";
        const recipient=document.getElementById("invEmail")?.value?.trim()||"";
        email.href="mailto:"+encodeURIComponent(recipient)+"?subject="+encodeURIComponent("EM Tinting secure invoice payment")+"&body="+encodeURIComponent("Hello,\n\nYou can securely pay your EM Tinting invoice here:\n"+checkoutUrl+"\n\nThank you,\nEM Tinting");
        output.append(p,a,document.createElement("br"),email);
      }catch(e){output.textContent=e.message||"Unable to create payment link"}finally{btn.disabled=false;btn.textContent="Create Secure Stripe Payment Link"}
    });
  }
  document.addEventListener("DOMContentLoaded",install);install();
  const observer=new MutationObserver(install);observer.observe(document.documentElement,{childList:true,subtree:true});
})();