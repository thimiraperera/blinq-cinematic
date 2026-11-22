/* BlinQ Marketplace: marketplace.html (the directory) and business/*.html (profiles).
   Loads after common.js ($, $$, closeMenus and the shared popup motion).
   Directory: search, state, business type and product filters work together, plus sorting;
   marketplace.html?type=retailer (or ?q= / ?state=) arrives already filtered.
   Profile: message, project photos and review popups (samples, so nothing is sent or saved),
   project filters, more reviews, share, today's opening hours and the section tabs. */
(function(){
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const header=$('header');
 const headerHeight=()=>document.documentElement.style.setProperty('--header-h',header.offsetHeight+'px');
 headerHeight();addEventListener('resize',headerHeight);

 /* ---------- Directory ---------- */
 const grid=$('.mk-results .mk-grid');
 if(grid){
  const cards=$$('.mk-results .mk-card'),q=$('#mk-q'),state=$('#mk-state'),sort=$('#mk-sort'),count=$('#mk-count');
  const empty=$('.mk-empty'),clear=$('.mk-clear'),typeBtns=$$('.mk-types button'),tiles=$$('.mk-type-tile'),checks=$$('.mk-products input');
  let type='all';
  const norm=s=>s.toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
  cards.forEach(c=>c.dataset.text=norm(c.textContent+' '+c.dataset.type+' '+c.dataset.state));
  const has=(text,w)=>text.includes(w)||(w.length>3&&w.endsWith('s')&&text.includes(w.slice(0,-1)));
  const apply=()=>{
   const words=norm(q.value).split(' ').filter(Boolean),st=state.value,prods=checks.filter(c=>c.checked).map(c=>c.value);
   let n=0;
   cards.forEach(c=>{
    const show=(type==='all'||c.dataset.type===type)&&(!st||c.dataset.state===st)
     &&prods.every(p=>c.dataset.products.split(' ').includes(p))&&words.every(w=>has(c.dataset.text,w));
    c.hidden=!show;if(show)n++;
   });
   count.textContent=n===1?'1 business':n+' businesses';
   empty.hidden=n>0;
   clear.hidden=!(type!=='all'||st||prods.length||words.length);
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
  const reset=()=>{q.value='';state.value='';checks.forEach(c=>c.checked=false);pick('all');apply()};
  typeBtns.forEach(b=>b.addEventListener('click',()=>{pick(b.dataset.type);apply()}));
  tiles.forEach(b=>b.addEventListener('click',()=>{pick(b.getAttribute('aria-pressed')==='true'?'all':b.dataset.type);apply();toResults()}));
  checks.forEach(c=>c.addEventListener('change',apply));
  q.addEventListener('input',apply);state.addEventListener('change',apply);sort.addEventListener('change',order);
  $('.mk-search').addEventListener('submit',e=>{e.preventDefault();apply();toResults()});
  $$('[data-q]').forEach(b=>b.addEventListener('click',()=>{q.value=b.dataset.q;apply();toResults()}));
  clear.addEventListener('click',reset);$('.mk-clear-all').addEventListener('click',reset);
  const params=new URLSearchParams(location.search);
  if(typeBtns.some(b=>b.dataset.type===params.get('type')))pick(params.get('type'));
  if(params.get('q'))q.value=params.get('q');
  if([...state.options].some(o=>o.value&&o.value===params.get('state')))state.value=params.get('state');
  apply();
 }

 /* ---------- Profile ---------- */
 const dataEl=$('#pf-projects-data');
 if(!dataEl)return;
 const projects=JSON.parse(dataEl.textContent);
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

 // Send a message
 const enq=$('#enquiry-dialog'),enqForm=enq.querySelector('form'),enqDone=enq.querySelector('.contact-done');
 wire(enq);
 const showEnquiry=(product,message)=>{
  enqForm.hidden=false;enqDone.hidden=true;
  if(product!==undefined)enqForm.elements.product.value=[...enqForm.elements.product.options].some(o=>o.value===product)?product:'';
  if(message)enqForm.elements.message.value=message;
  openDialog(enq);enqForm.elements.name.focus();
 };
 document.addEventListener('click',e=>{
  if(!e.target.closest('[data-enquire]')||e.ctrlKey||e.metaKey||e.shiftKey||e.button)return;
  e.preventDefault();showEnquiry();
 });
 enqForm.addEventListener('submit',e=>{
  e.preventDefault();   // sample profile: nothing is sent
  enqForm.reset();enqForm.hidden=true;enqDone.hidden=false;enqDone.querySelector('.booking-finish').focus();
 });

 // A project's photos
 const pj=$('#project-dialog'),pjImg=pj.querySelector('.pj-photo img'),pjIndex=pj.querySelector('.pj-index'),thumbs=pj.querySelector('.pj-thumbs');
 wire(pj);
 let project=null,at=0;
 const showPhoto=i=>{
  const list=project.photos;at=(i+list.length)%list.length;
  pjImg.src=list[at].src;pjImg.alt=list[at].alt;pjIndex.textContent=(at+1)+' of '+list.length;
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
  showEnquiry(p.ask,'Hi, I’d like something like your project “'+p.title+'”. ');
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
