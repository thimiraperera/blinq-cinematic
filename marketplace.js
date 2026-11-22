/* BlinQ Marketplace: marketplace.html (the directory) and business/*.html (profiles).
   Loads after common.js ($, $$, closeMenus and the shared popup motion).
   Directory: the search panel (suburb, postcode or name; product; service; state), business type chips and
   tiles, and sorting all work together; marketplace.html?type=retailer (or ?q= ?product= ?service= ?state=)
   arrives already filtered.
   Both pages: Request a quote (a sample: nothing is sent). Directory: List your business, which hands the
   details to the visitor's email app like Contact us. Profile: project photos and review popups, project
   filters, more reviews, share, today's opening hours and the section tabs. */
(function(){
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const header=$('header');
 const headerHeight=()=>document.documentElement.style.setProperty('--header-h',header.offsetHeight+'px');
 headerHeight();addEventListener('resize',headerHeight);

 const openDialog=d=>{
  closeMenus();
  $$('dialog[open]').forEach(x=>{if(x!==d)x.close()});
  d.showModal();document.body.classList.add('modal-open');
 };
 const wire=d=>{
  d.querySelectorAll('.booking-close,.booking-finish').forEach(b=>b.addEventListener('click',()=>d.close()));
  d.addEventListener('close',()=>{if(!$('dialog[open]'))document.body.classList.remove('modal-open')});
  d.addEventListener('click',e=>{
   if(e.target!==d)return;
   const r=d.getBoundingClientRect();
   if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();
  });
 };
 const plain=e=>e.ctrlKey||e.metaKey||e.shiftKey||e.button;

 /* ---------- Directory ---------- */
 const grid=$('.mk-results .mk-grid');
 if(grid){
  const cards=$$('.mk-results .mk-card'),q=$('#mk-q'),product=$('#mk-product'),service=$('#mk-service'),state=$('#mk-state');
  const sort=$('#mk-sort'),count=$('#mk-count'),empty=$('.mk-empty'),clear=$('.mk-clear'),typeBtns=$$('.mk-types button'),tiles=$$('.mk-type-tile');
  let type='all';
  const norm=s=>s.toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
  cards.forEach(c=>c.dataset.text=norm(c.textContent+' '+c.dataset.type+' '+c.dataset.state));
  const has=(text,w)=>text.includes(w)||(w.length>3&&w.endsWith('s')&&text.includes(w.slice(0,-1)));
  const apply=()=>{
   const words=norm(q.value).split(' ').filter(Boolean);
   let n=0;
   cards.forEach(c=>{
    const show=(type==='all'||c.dataset.type===type)&&(!state.value||c.dataset.state===state.value)
     &&(!product.value||c.dataset.products.split(' ').includes(product.value))
     &&(!service.value||c.dataset.service===service.value)&&words.every(w=>has(c.dataset.text,w));
    c.hidden=!show;if(show)n++;
   });
   count.textContent=n===1?'1 business':n+' businesses';
   empty.hidden=n>0;
   clear.hidden=!(type!=='all'||state.value||product.value||service.value||words.length);
  };
  const SORTS={
   order:(a,b)=>a.dataset.order-b.dataset.order,
   rating:(a,b)=>b.dataset.rating-a.dataset.rating||b.dataset.reviews-a.dataset.reviews,
   reviews:(a,b)=>b.dataset.reviews-a.dataset.reviews,
   name:(a,b)=>a.dataset.name.localeCompare(b.dataset.name)
  };
  const order=()=>grid.append(...[...cards].sort(SORTS[sort.value]||SORTS.order));
  const pick=t=>{
   type=t;
   typeBtns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.type===t)));
   tiles.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.type===t)));
  };
  const toResults=()=>$('#businesses').scrollIntoView({behavior:reduce.matches?'auto':'smooth'});
  const reset=()=>{q.value='';[product,service,state].forEach(s=>s.value='');pick('all');apply()};
  typeBtns.forEach(b=>b.addEventListener('click',()=>{pick(b.dataset.type);apply()}));
  tiles.forEach(b=>b.addEventListener('click',()=>{pick(b.getAttribute('aria-pressed')==='true'?'all':b.dataset.type);apply();toResults()}));
  q.addEventListener('input',apply);[product,service,state].forEach(s=>s.addEventListener('change',apply));
  sort.addEventListener('change',order);
  $('.mk-filters').addEventListener('submit',e=>{e.preventDefault();apply();count.scrollIntoView({behavior:reduce.matches?'auto':'smooth',block:'center'})});
  clear.addEventListener('click',reset);$('.mk-clear-all').addEventListener('click',reset);
  const params=new URLSearchParams(location.search);
  if(typeBtns.some(b=>b.dataset.type===params.get('type')))pick(params.get('type'));
  if(params.get('q'))q.value=params.get('q');
  for(const [key,box] of [['product',product],['service',service],['state',state]])
   if([...box.options].some(o=>o.value&&o.value===params.get(key)))box.value=params.get(key);
  apply();
 }

 /* ---------- Request a quote (both pages) ---------- */
 const quote=$('#quote-dialog');
 let showQuote=()=>{};
 if(quote){
  const form=quote.querySelector('form'),done=quote.querySelector('.contact-done'),fixed=quote.hasAttribute('data-fixed');
  const title=quote.querySelector('#quote-title'),lead=quote.querySelector('.contact-lead'),who=quote.querySelector('.quote-who');
  const fileName=quote.querySelector('.mk-file-name');
  wire(quote);
  showQuote=({business='',product,message}={})=>{
   form.hidden=false;done.hidden=true;form.reset();fileName.textContent='No file chosen';
   if(!fixed){
    title.textContent=business?'Request a quote from '+business:'Request a quote';
    lead.textContent=business?lead.dataset.one:lead.dataset.general;
    who.textContent=business||'businesses near you';
    form.elements.business.value=business;
   }
   if(product!==undefined)form.elements.product.value=[...form.elements.product.options].some(o=>o.value===product)?product:'';
   if(message)form.elements.message.value=message;
   openDialog(quote);form.elements.request.focus();
  };
  document.addEventListener('click',e=>{
   const b=e.target.closest('[data-quote]');
   if(!b||plain(e))return;
   e.preventDefault();showQuote({business:b.dataset.quote||''});
  });
  form.elements.photo.addEventListener('change',()=>{
   const f=form.elements.photo.files[0];fileName.textContent=f?f.name:'No file chosen';
  });
  form.addEventListener('submit',e=>{
   e.preventDefault();   // sample: nothing is sent, and the file never leaves the device
   form.hidden=true;done.hidden=false;done.querySelector('.booking-finish').focus();
  });
 }

 /* ---------- List your business (directory) ---------- */
 const list=$('#list-dialog');
 if(list){
  const form=list.querySelector('form'),done=list.querySelector('.contact-done');
  wire(list);
  document.addEventListener('click',e=>{
   if(!e.target.closest('[data-list]')||plain(e))return;
   e.preventDefault();form.hidden=false;done.hidden=true;openDialog(list);form.elements.business.focus();
  });
  form.addEventListener('submit',e=>{
   e.preventDefault();
   const f=Object.fromEntries(new FormData(form)),mail=document.createElement('a');
   const lines=[['Business',f.business],['Contact',f.name],['Email',f.email],['Phone',f.phone],['Business type',f.type],['Main service',f.service],
    ['Main products',f.products],['Uses BlinQ',f.blinq],['Areas served',f.areas],['About',f.about]].filter(([,v])=>v).map(([k,v])=>k+': '+v);
   mail.href='mailto:support@blinq.com.au?subject='+encodeURIComponent('Marketplace listing: '+f.business)+'&body='+encodeURIComponent(lines.join('\n'));
   mail.click();form.reset();form.hidden=true;done.hidden=false;done.querySelector('.booking-finish').focus();
  });
 }

 /* ---------- Profile ---------- */
 const dataEl=$('#pf-projects-data');
 if(!dataEl)return;
 const projects=JSON.parse(dataEl.textContent);

 // A project's photos
 const pj=$('#project-dialog'),pjImg=pj.querySelector('.pj-photo img'),pjIndex=pj.querySelector('.pj-index'),thumbs=pj.querySelector('.pj-thumbs');
 wire(pj);
 let project=null,at=0;
 const showPhoto=i=>{
  const ph=project.photos;at=(i+ph.length)%ph.length;
  pjImg.src=ph[at].src;pjImg.alt=ph[at].alt;pjIndex.textContent=(at+1)+' of '+ph.length;
  thumbs.querySelectorAll('button').forEach((t,k)=>t.setAttribute('aria-current',String(k===at)));
 };
 const openProject=n=>{
  project=projects[n];
  pj.querySelector('#pj-title').textContent=project.title;
  pj.querySelector('.pj-suburb').textContent=project.suburb;
  pj.querySelector('.pj-text').textContent=project.text;
  pj.querySelector('.pj-products').replaceChildren(...project.products.map(p=>Object.assign(document.createElement('li'),{textContent:p})));
  thumbs.replaceChildren(...project.photos.map((ph,k)=>{
   const li=document.createElement('li'),b=document.createElement('button'),im=document.createElement('img');
   b.type='button';b.setAttribute('aria-label','Photo '+(k+1));im.src=ph.src;im.alt='';
   b.append(im);b.addEventListener('click',()=>showPhoto(k));li.append(b);return li;
  }));
  showPhoto(0);openDialog(pj);pj.querySelector('.pj-next').focus();
 };
 pj.querySelector('.pj-prev').addEventListener('click',()=>showPhoto(at-1));
 pj.querySelector('.pj-next').addEventListener('click',()=>showPhoto(at+1));
 pj.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')showPhoto(at-1);else if(e.key==='ArrowRight')showPhoto(at+1)});
 pj.querySelector('.pj-ask').addEventListener('click',()=>{
  const p=project;pj.close();
  showQuote({product:p.ask,message:'Hi, I’d like something like your project “'+p.title+'”. '});
 });
 $$('[data-project]').forEach(b=>b.addEventListener('click',()=>openProject(+b.dataset.project)));

 // Project filters
 const chips=$$('.pf-project-filter button'),items=$$('.pf-projects li');
 chips.forEach(b=>b.addEventListener('click',()=>{
  chips.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  items.forEach(li=>li.hidden=b.dataset.cat!=='all'&&!li.dataset.cats.split(' ').includes(b.dataset.cat));
 }));

 // More reviews
 const more=$('.pf-more');
 if(more)more.addEventListener('click',()=>{
  const rest=$$('.pf-review[hidden]');rest.forEach(r=>r.hidden=false);more.hidden=true;
  if(rest[0]){rest[0].tabIndex=-1;rest[0].focus({preventScroll:true})}
 });

 // Write a review
 const rv=$('#review-dialog'),rvForm=rv.querySelector('form'),rvDone=rv.querySelector('.contact-done');
 const stars=[...rv.querySelectorAll('.mk-rate button')],rateField=rv.querySelector('.mk-rate-field'),rateText=rv.querySelector('.mk-rate-text');
 const WORDS=['Choose 1 to 5 stars','Poor','Fair','Good','Very good','Excellent'];
 let rate=0;
 wire(rv);
 const paint=v=>stars.forEach((s,i)=>s.classList.toggle('is-on',i<v));
 const setRate=v=>{
  rate=v;paint(v);rateText.textContent=WORDS[v];rateField.classList.remove('is-missing');
  stars.forEach((s,i)=>{s.setAttribute('aria-checked',String(i===v-1));s.tabIndex=(v?i===v-1:i===0)?0:-1});
 };
 stars.forEach((s,i)=>{
  s.addEventListener('click',()=>setRate(i+1));
  s.addEventListener('mouseenter',()=>paint(i+1));
  s.addEventListener('keydown',e=>{
   const step={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1}[e.key];if(!step)return;
   e.preventDefault();const v=Math.min(5,Math.max(1,(rate||i+1-step)+step));setRate(v);stars[v-1].focus();
  });
 });
 rv.querySelector('.mk-rate').addEventListener('mouseleave',()=>paint(rate));
 $$('[data-review]').forEach(b=>b.addEventListener('click',()=>{rvForm.hidden=false;rvDone.hidden=true;openDialog(rv);(stars[rate-1]||stars[0]).focus()}));
 rvForm.addEventListener('submit',e=>{
  e.preventDefault();   // sample profile: nothing is saved
  if(!rate){rateField.classList.add('is-missing');rateText.textContent='Choose a star rating';stars[0].focus();return}
  if(!rvForm.reportValidity())return;
  rvForm.reset();setRate(0);rvForm.hidden=true;rvDone.hidden=false;rvDone.querySelector('.booking-finish').focus();
 });

 // Share: the phone's share sheet on touch screens, otherwise copy the link
 $$('[data-share]').forEach(b=>b.addEventListener('click',async()=>{
  if(navigator.share&&matchMedia('(pointer:coarse)').matches){try{await navigator.share({title:document.title,url:location.href})}catch(e){}return}
  const label=b.querySelector('span'),was=label.textContent;
  try{await navigator.clipboard.writeText(location.href);label.textContent='Link copied'}catch(e){label.textContent='Copy failed'}
  setTimeout(()=>label.textContent=was,2000);
 }));

 // Today's opening hours
 const today=(new Date().getDay()+6)%7+1;
 $$('.pf-hours [data-day="'+today+'"]').forEach(s=>s.classList.add('is-today'));

 // Section tabs follow the scroll
 const tabs=$$('.pf-tabs a'),strip=$('.pf-tabs-inner'),sections=tabs.map(a=>$(a.getAttribute('href')));
 let ticking=false,current=null;
 const spy=()=>{
  ticking=false;
  const line=header.offsetHeight+$('.pf-tabs').offsetHeight+40;
  let on=null;sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<=line)on=i});
  if(on===current)return;current=on;
  tabs.forEach((a,i)=>a.setAttribute('aria-current',String(i===on)));
  if(on===null)return;
  const r=tabs[on].getBoundingClientRect(),box=strip.getBoundingClientRect();
  if(r.left<box.left||r.right>box.right)strip.scrollBy({left:r.left-box.left-24,behavior:reduce.matches?'auto':'smooth'});
 };
 addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(spy)}},{passive:true});
 spy();
})();
