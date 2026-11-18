/* Shared by every page: helpers, the header and its menus, the booking, contact and industries
   popups, the popup motion, accordions and the footer year. Page-only behaviour lives in app.js
   (home page) and integrations.js (integrations page). */
document.documentElement.classList.add('js');
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
// The footer's copyright year follows the calendar
$$('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
/* The phone menu lists the same links as the desktop menus, so each link is written once */
$$('[data-copy]').forEach(ul=>ul.replaceChildren(...$$(ul.dataset.copy).map(li=>li.cloneNode(true))));
/* Menus fade and slide into place under the header, and back out when they close. Every move
   starts from where the menu is on screen, so quick clicks between menus never jump. */
const menuReduce=matchMedia('(prefers-reduced-motion: reduce)'),menuPhone=matchMedia('(max-width:800px)'),menuMoves=new WeakMap();
const menuIsOpen=m=>!m.hidden&&!m.classList.contains('is-closing');
const menuSurface=m=>menuPhone.matches?m:m.querySelector('.res-panel')||m;
const menuHidden=()=>({opacity:0,transform:menuReduce.matches?'none':'translateY(-10px) scale(.985)'});
const menuNow=el=>{const c=getComputedStyle(el);return {opacity:c.opacity,transform:c.transform}};
function menuMove(el,from,to,time,done){
 menuMoves.get(el)?.cancel();
 const a=el.animate([from,to],{...time,fill:'both'});menuMoves.set(el,a);
 if(done){const finish=()=>{if(menuMoves.get(el)===a){menuMoves.delete(el);a.cancel();done()}};a.finished.then(finish,()=>{});setTimeout(finish,time.duration+400)}
}
function shadeTo(show){
 const shade=$('#shade'),closing=shade.classList.contains('is-closing');
 if(show){
  if(!shade.hidden&&!closing)return;
  const from={opacity:shade.hidden?0:getComputedStyle(shade).opacity};
  shade.hidden=false;shade.classList.remove('is-closing');
  menuMove(shade,from,{opacity:1},{duration:220,easing:'ease'});
 }else if(!shade.hidden&&!closing){
  shade.classList.add('is-closing');
  menuMove(shade,{opacity:getComputedStyle(shade).opacity},{opacity:0},{duration:200,easing:'ease'},()=>{shade.hidden=true;shade.classList.remove('is-closing')});
 }
}
function hideMenu(m,quick){
 if(!menuIsOpen(m))return;
 m.classList.add('is-closing');
 const el=menuSurface(m);
 menuMove(el,menuNow(el),menuHidden(),{duration:quick?120:190,easing:'cubic-bezier(.4,0,1,1)'},()=>{m.hidden=true;m.classList.remove('is-closing')});
}
function showMenu(m){
 const fresh=m.hidden,el=menuSurface(m);
 m.hidden=false;m.classList.remove('is-closing');
 menuMove(el,fresh?menuHidden():menuNow(el),{opacity:1,transform:'none'},{duration:menuReduce.matches?160:320,easing:'cubic-bezier(.2,.9,.25,1)'});
 if(fresh&&el!==m&&!menuReduce.matches)[...el.children].forEach((col,i)=>col.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:360,delay:60+i*45,easing:'cubic-bezier(.2,.9,.25,1)',fill:'backwards'}));
 shadeTo(true);
}
function closeMenus(){
 $$('.mega').forEach(m=>hideMenu(m));
 $$('[data-menu]').forEach(x=>x.setAttribute('aria-expanded','false'));$('#mobile-menu').setAttribute('aria-expanded','false');
 shadeTo(false);
}
function toggleMenu(menu,trigger){
 const opening=!menuIsOpen(menu);
 $$('.mega').forEach(m=>{if(m!==menu)hideMenu(m,true)});
 $$('[data-menu]').forEach(x=>x.setAttribute('aria-expanded','false'));$('#mobile-menu').setAttribute('aria-expanded','false');
 if(opening){showMenu(menu);trigger.setAttribute('aria-expanded','true')}else{hideMenu(menu);shadeTo(false)}
}
$$('[data-menu]').forEach(b=>b.onclick=()=>toggleMenu($('#'+b.dataset.menu),b));
$('#mobile-menu').onclick=()=>toggleMenu($('#solutions'),$('#mobile-menu'));
$('#shade').onclick=closeMenus;$$('.mega a').forEach(a=>a.addEventListener('click',closeMenus));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenus()});

(() => {
  const header=document.querySelector('header');
  const updateHeader=()=>header.classList.toggle('is-scrolled',window.scrollY>8);
  window.addEventListener('scroll',updateHeader,{passive:true});
  updateHeader();
})();

/* The BlinQ office for the visitor's time zone, and its phone number as [dial, display] */
const region=()=>{const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';return tz.startsWith('Europe/')?'uk':tz.startsWith('America/')?'us':'au'};
const officePhone=()=>({au:['+61388444864','+61 3 8844 4864'],uk:['+441173257254','+44 117 325 7254'],us:['+13237458257','+1 323 745 8257']})[region()];

/* Booking popup. BlinQ's Calendly scheduling runs inside it, so bookings land in BlinQ's real
   calendars. Every link to Calendly or the old call-back page opens this popup instead. */
(function(){
 const dialog=$('#booking-dialog');if(!dialog)return;
 const steps=[...dialog.querySelectorAll('.booking-step')],marks=[...dialog.querySelectorAll('.booking-steps li')];
 const box=dialog.querySelector('.booking-frame'),loading=box.querySelector('.booking-loading');
 const show=n=>{
  steps.forEach(s=>s.hidden=+s.dataset.step!==n);
  marks.forEach((m,i)=>{m.classList.toggle('is-current',i===n-1);m.classList.toggle('is-done',i<n-1)});
 };
 const clearFrame=()=>{box.querySelector('iframe')?.remove()};
 const label=(mins,training)=>{dialog.querySelector('.booking-duration').textContent=mins+' minutes';dialog.querySelector('#booking-title').textContent=training?'Book a training session':'Book a personalised demo'};
 const open=()=>{
  closeMenus();
  $$('dialog[open]').forEach(d=>{if(d!==dialog)d.close()});
  clearFrame();show(1);label(30);
  dialog.querySelectorAll('.booking-option').forEach(b=>b.classList.toggle('is-suggested',b.dataset.region===region()));
  const call=officePhone(),tel=dialog.querySelector('.booking-call a');
  tel.href='tel:'+call[0];tel.textContent=call[1];
  dialog.showModal();
  document.body.classList.add('modal-open');
  (dialog.querySelector('.booking-option.is-suggested')||dialog.querySelector('.booking-option')).focus();
 };
 const choose=button=>{
  label(button.dataset.duration,button.dataset.region==='training');
  clearFrame();loading.hidden=false;
  const frame=document.createElement('iframe');
  frame.title='Choose a time with the BlinQ team';
  frame.src='https://calendly.com/blinq/'+button.dataset.slug+'?'+new URLSearchParams({embed_domain:location.host||'blinq.com.au',embed_type:'Inline',hide_gdpr_banner:'1',hide_event_type_details:'1',hide_landing_page_details:'1',primary_color:'de161d',text_color:'0c0c0e',background_color:'ffffff'});
  frame.addEventListener('load',()=>{loading.hidden=true});
  box.append(frame);show(2);
 };
 dialog.querySelectorAll('[data-slug]').forEach(b=>b.addEventListener('click',()=>choose(b)));
 dialog.querySelector('.booking-back').addEventListener('click',()=>{clearFrame();label(30);show(1)});
 dialog.querySelector('.booking-close').addEventListener('click',()=>dialog.close());
 dialog.querySelector('.booking-finish').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{clearFrame();document.body.classList.remove('modal-open')});
 dialog.addEventListener('click',e=>{
  if(e.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();
 });
 addEventListener('message',e=>{if(e.origin==='https://calendly.com'&&e.data&&e.data.event==='calendly.event_scheduled')show(3)});
 document.addEventListener('click',e=>{
  const link=e.target.closest('a[href*="calendly.com/blinq"],a[href*="/call-back/"]');
  if(!link||e.ctrlKey||e.metaKey||e.shiftKey||e.button)return;
  e.preventDefault();open();
 });
})();

/* Contact popup, opened from "Contact us" in the menus. The browser checks the fields before sending.
   shortcut: the message goes out through the visitor's own email app, so nothing is stored here; connect a form endpoint (such as BlinQ's CRM) before launch. */
(function(){
 const dialog=$('#contact-dialog'),form=dialog.querySelector('.contact-form'),done=dialog.querySelector('.contact-done');
 const sent=on=>{form.hidden=on;done.hidden=!on};
 document.addEventListener('click',e=>{
  if(!e.target.closest('[data-contact]')||e.ctrlKey||e.metaKey||e.shiftKey||e.button)return;
  e.preventDefault();closeMenus();
  $$('dialog[open]').forEach(d=>{if(d!==dialog)d.close()});
  const [dial,shown]=officePhone(),tel=dialog.querySelector('.contact-phone');tel.href='tel:'+dial;tel.textContent=shown;
  sent(false);dialog.showModal();document.body.classList.add('modal-open');form.elements.name.focus();
 });
 form.addEventListener('submit',e=>{
  e.preventDefault();
  const f=Object.fromEntries(new FormData(form)),mail=document.createElement('a');
  const from=[f.name,f.email,f.phone,f.company].filter(Boolean).join('\n');
  mail.href='mailto:support@blinq.com.au?subject='+encodeURIComponent(f.topic+': '+f.name)+'&body='+encodeURIComponent(f.message+'\n\n'+from);
  mail.click();form.reset();sent(true);done.querySelector('.booking-finish').focus();
 });
 dialog.querySelector('.booking-close').addEventListener('click',()=>dialog.close());
 done.querySelector('.booking-finish').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));
 dialog.addEventListener('click',e=>{
  if(e.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();
 });
})();

/* Popup motion, shared by every dialog on the page.
   A popup grows out of the spot that was pressed to open it, its content settles in just after,
   and it shrinks back toward that spot when it closes. Every move starts from where the popup is
   on screen right now, so closing it halfway through opening, or reopening it while it closes,
   never jumps. On phones the full-screen booking sheet slides up from the bottom instead. */
(function(){
 if(!window.HTMLDialogElement||!Element.prototype.animate)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),phone=matchMedia('(max-width:860px)');
 const nativeShow=HTMLDialogElement.prototype.showModal,nativeClose=HTMLDialogElement.prototype.close;
 const SHOWN={opacity:1,transform:'none'},live=new WeakMap();
 let press=null;
 addEventListener('pointerdown',e=>{press={x:e.clientX,y:e.clientY,t:performance.now()}},true);
 addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')press=null},true);
 const isSheet=d=>(d.id==='booking-dialog'||d.id==='contact-dialog')&&phone.matches;
 const hidden=d=>reduce.matches?{opacity:0,transform:'none'}:isSheet(d)?{opacity:1,transform:'translateY(100%)'}:{opacity:0,transform:'translateY(10px) scale(.92)'};
 const timing=(d,opening)=>reduce.matches?{duration:opening?200:160,easing:'ease'}
  :opening?{duration:isSheet(d)?520:460,easing:isSheet(d)?'cubic-bezier(.32,.72,0,1)':'cubic-bezier(.2,.9,.25,1)'}
  :{duration:isSheet(d)?300:220,easing:'cubic-bezier(.4,0,.8,.3)'};
 const now=d=>{
  const box=getComputedStyle(d);let shade=NaN;
  try{shade=parseFloat(getComputedStyle(d,'::backdrop').opacity)}catch(e){}
  return {box:{opacity:box.opacity,transform:box.transform},shade};
 };
 const move=(d,from,to,shadeFrom,shadeTo,time)=>{
  (live.get(d)||[]).forEach(a=>a.cancel());
  const anims=[d.animate([from,to],{...time,fill:'both'})];
  try{anims.push(d.animate([{opacity:shadeFrom},{opacity:shadeTo}],{duration:time.duration,easing:'ease',fill:'both',pseudoElement:'::backdrop'}))}catch(e){}
  live.set(d,anims);
  return anims[0];
 };
 const settle=d=>{
  if(reduce.matches)return;
  let parts=[...d.children];
  if(parts.length===1)parts=[...parts[0].children];
  parts.forEach((part,i)=>part.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],
   {duration:420,delay:70+Math.min(i,5)*45,easing:'cubic-bezier(.2,.9,.25,1)',fill:'backwards'}));
 };
 function open(){
  const d=this;
  if(d.open&&!d.classList.contains('is-closing'))return;
  if(d.open){
   const at=now(d);d.classList.remove('is-closing');
   move(d,at.box,SHOWN,isNaN(at.shade)?0:at.shade,1,timing(d,true));
   return;
  }
  nativeShow.call(d);
  d.style.transformOrigin='';
  if(!isSheet(d)){
   const r=d.getBoundingClientRect(),p=press&&performance.now()-press.t<1500?press:null;
   const clamp=(v,size)=>Math.round(Math.min(Math.max(v,-.3*size),1.3*size));
   d.style.transformOrigin=p?`${clamp(p.x-r.left,r.width)}px ${clamp(p.y-r.top,r.height)}px`:'50% 65%';
  }
  move(d,hidden(d),SHOWN,0,1,timing(d,true));
  settle(d);
 }
 function close(value){
  const d=this;
  if(!d.open||d.classList.contains('is-closing'))return;
  const at=now(d);d.classList.add('is-closing');
  const time=timing(d,false),anim=move(d,at.box,hidden(d),isNaN(at.shade)?1:at.shade,0,time);
  const done=()=>{if(d.open&&live.get(d)?.[0]===anim)nativeClose.call(d,value)};
  anim.finished.then(done,()=>{});
  setTimeout(done,time.duration+500);
 }
 $$('dialog').forEach(d=>{
  d.showModal=open;d.close=close;
  d.addEventListener('cancel',e=>{e.preventDefault();d.close()});
  d.addEventListener('close',()=>{(live.get(d)||[]).forEach(a=>a.cancel());live.delete(d);d.classList.remove('is-closing')});
 });
})();

/* Accordions (the FAQ and the plan comparison) open and close smoothly: the height moves between
   the question and the full answer, starting from wherever it is if clicked again mid-way. */
(function(){
 const still=matchMedia('(prefers-reduced-motion: reduce)');
 $$('details').forEach(d=>{
  const summary=d.querySelector(':scope>summary');if(!summary)return;
  let anim=null;
  summary.addEventListener('click',e=>{
   if(still.matches)return;
   e.preventDefault();
   const from=d.getBoundingClientRect().height,c=getComputedStyle(d);
   const closed=summary.offsetHeight+parseFloat(c.paddingTop)+parseFloat(c.paddingBottom)+parseFloat(c.borderTopWidth)+parseFloat(c.borderBottomWidth);
   const opening=!d.open||d.hasAttribute('data-closing');
   anim?.cancel();
   d.toggleAttribute('data-closing',!opening);d.open=true;
   const to=opening?d.offsetHeight:closed;
   d.style.overflow='hidden';
   anim=d.animate({height:[from+'px',to+'px']},{duration:Math.min(520,200+Math.abs(to-from)*.5),easing:'cubic-bezier(.2,.8,.2,1)'});
   anim.onfinish=()=>{anim=null;d.style.overflow='';if(d.hasAttribute('data-closing')){d.removeAttribute('data-closing');d.open=false}};
  });
 });
})();

/* Industries popup: "Other industries" in the Solutions menu (and the phone menu) opens every supported
   industry, the same six A to Z columns as the Industries menu. */
(function(){
 const dialog=$('#industries-dialog'),grid=$('#industries-menu .ind-grid');if(!dialog||!grid)return;
 dialog.querySelector('.ind-slot').replaceWith(grid.cloneNode(true));
 document.addEventListener('click',e=>{
  if(!e.target.closest('[data-industries]')||e.ctrlKey||e.metaKey||e.shiftKey||e.button)return;
  e.preventDefault();closeMenus();
  $$('dialog[open]').forEach(d=>{if(d!==dialog)d.close()});
  dialog.showModal();document.body.classList.add('modal-open');dialog.querySelector('.ind-close').focus();
 });
 dialog.querySelector('.ind-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));
 dialog.addEventListener('click',e=>{
  if(e.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();
 });
})();
