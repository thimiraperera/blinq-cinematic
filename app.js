document.documentElement.classList.add('js');
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function closeMenus(){$$('.mega').forEach(x=>x.hidden=true);$$('[data-menu]').forEach(x=>x.setAttribute('aria-expanded','false'));$('#shade').hidden=true;$('#mobile-menu').setAttribute('aria-expanded','false')}
$$('[data-menu]').forEach(b=>b.onclick=()=>{const open=$('#'+b.dataset.menu).hidden;closeMenus();if(open){$('#'+b.dataset.menu).hidden=false;$('#shade').hidden=false;b.setAttribute('aria-expanded','true')}});
$('#mobile-menu').onclick=()=>{const open=$('#solutions').hidden;closeMenus();if(open){$('#solutions').hidden=false;$('#shade').hidden=false;$('#mobile-menu').setAttribute('aria-expanded','true')}};$('#shade').onclick=closeMenus;$$('.mega a').forEach(a=>a.addEventListener('click',closeMenus));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenus()});
const slides=[['scenes/hero-clearer-way.webp','Run your entire window furnishing business.','From one connected platform.','A consultant walking to her van after a customer visit, tablet in hand','78% 22%','89% 50%'],['scenes/hero-on-site.webp','Still typing up quotes at 9pm?','There’s a clearer way to work.','A consultant measuring a window with a laser measure, tablet in hand','70% 24%','81% 50%'],['scenes/hero-customers.webp','Turn every customer appointment','into a sales opportunity.','A consultant laughing with a customer over a fabric sample book','74% 33%','78% 50%']];
let heroIndex=0,heroTimer,heroPaused=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* One layer per slide, so each photo keeps its own slow zoom while it fades over the last one.
   In each slide, the fifth value is where the zoom heads (the person's face), and the sixth is how phones crop to that person. */
const heroLayers=slides.map((s,i)=>{
 let img=i?null:$('#hero-media img');
 if(!img){img=new Image();img.src='assets/'+s[0];img.alt='';$('#hero-media').append(img)}
 img.style.setProperty('--focus',s[4]);img.style.setProperty('--pos',s[5]);
 return img;
});
function showHero(index){
 const next=(index+slides.length)%slides.length;
 if(next===heroIndex)return;
 const old=heroLayers[heroIndex],layer=heroLayers[next],s=slides[next];
 heroIndex=next;
 clearTimeout(old.leaving);old.classList.remove('is-active');old.classList.add('is-leaving');
 old.leaving=setTimeout(()=>old.classList.remove('is-leaving'),1300);
 clearTimeout(layer.leaving);layer.classList.remove('is-leaving');
 void layer.offsetWidth;
 layer.classList.add('is-active');
 old.alt='';layer.alt=s[3];
 const lines=$('.hero-lines');lines.classList.add('is-out');setTimeout(()=>{$('#hero-question').textContent=s[1];$('#hero-title').textContent=s[2];lines.classList.remove('is-out')},260);
 $$('[data-slide]').forEach(x=>{const active=+x.dataset.slide===heroIndex;x.classList.toggle('active',active);x.setAttribute('aria-pressed',active)})
}
function startHero(){clearInterval(heroTimer);if(!heroPaused&&!document.hidden)heroTimer=setInterval(()=>showHero(heroIndex+1),7000)}
function manualHero(i){showHero(i);startHero()}
$$('[data-slide]').forEach(b=>b.onclick=()=>manualHero(+b.dataset.slide));
$('.hero-prev').onclick=()=>manualHero(heroIndex-1);$('.hero-next').onclick=()=>manualHero(heroIndex+1);
function syncPause(){ $('#hero-pause').textContent=heroPaused?'▶':'Ⅱ';$('#hero-pause').setAttribute('aria-label',heroPaused?'Play banner slideshow':'Pause banner slideshow')}
$('#hero-pause').onclick=()=>{heroPaused=!heroPaused;syncPause();startHero()};
$('.hero').addEventListener('mouseenter',()=>clearInterval(heroTimer));$('.hero').addEventListener('mouseleave',startHero);
$('.hero').addEventListener('focusin',()=>clearInterval(heroTimer));$('.hero').addEventListener('focusout',e=>{if(!$('.hero').contains(e.relatedTarget))startHero()});
document.addEventListener('visibilitychange',startHero);syncPause();startHero();

(function(){
 const section=$('#range'),track=$('#product-track'),cards=[...track.children];
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let manual=false,queued=false;
 const takeControl=()=>{manual=true;track.classList.remove('scroll-driven')};
 const paint=()=>{
  queued=false;
  if(manual||motion.matches)return;
  const bounds=section.getBoundingClientRect();
  const progress=Math.min(1,Math.max(0,(innerHeight-bounds.top)/(innerHeight+bounds.height)));
  track.classList.add('scroll-driven');
  track.scrollLeft=progress*Math.min(420,track.clientWidth*.45);
 };
 const schedule=()=>{if(!queued&&!manual){queued=true;requestAnimationFrame(paint)}};
 ['prev','next'].forEach((id,i)=>$('#'+id).onclick=()=>{
  const left=track.scrollLeft;
  const stops=cards.map(card=>card.offsetLeft-cards[0].offsetLeft);
  const target=i?stops.find(x=>x>left+2):stops.slice().reverse().find(x=>x<left-2);
  takeControl();
  track.scrollTo({left:target??(i?track.scrollWidth-track.clientWidth:0),behavior:motion.matches?'instant':'smooth'});
 });
 track.addEventListener('pointerdown',takeControl,{passive:true});
 track.addEventListener('focusin',takeControl);
 track.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY)||e.shiftKey)takeControl()},{passive:true});
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',schedule);
 motion.addEventListener('change',()=>{if(motion.matches)track.classList.remove('scroll-driven');else schedule()});
 paint();
})();
const details={retail:['RetailSelect','Win more jobs. Manage every detail. Grow with confidence.','Manage your enquiries, appointments, quotations, orders and installations without the paperwork holding your business back.',['Manage leads and customer records','Schedule appointments and staff','Create quotations and convert approvals into jobs','Connect supplier purchase orders, invoices and payments']],manufacturing:['ManufactureSelect','More control over production. Less time managing orders.','Connect customer orders, manufacturing schedules and production workflows so your factory operates with greater visibility and coordination.',['Let dealers submit product selections and sizes','Coordinate production and material requirements','Follow work through production and dispatch','Keep dealer invoices connected to the order']],wholesale:['DealerSelect','Make it easier for your dealers to do business with you.','Give your dealer network a connected ordering experience while your team manages incoming orders, fulfilment and customer relationships.',['Give dealers a connected quoting and ordering workflow','Configure products and dealer pricing','Review orders before production and fulfilment','Keep invoices and dealer accounts together']],mobile:['BlinQ mobile app','Turn every customer appointment into a sales opportunity.','Capture measurements, select products, apply your pricing rules and present professional quotations while you are still with the customer.',['Capture measurements and product selections','Attach photos and job information','Create and send customer quotations','Compare the mobile app plan and full platform options']],integrations:['Connected tools','Work with the tools you know.','Explore the available integrations and confirm which options fit your account, region and workflow.',['Accounting: Xero, QuickBooks and MYOB','Payments: Stripe','Scheduling: Google Calendar','Custom connections: BlinQ OpenAPI']],widget:['iWidget','Turn your website into a showroom.','Explore an online product and quoting experience connected to BlinQ.',['Present your products, fabrics and options','Let shoppers enter width and drop','Connect online checkout to your ordering workflow','Discuss website setup and product configuration']],api:['OpenAPI','Build your next connection.','Explore custom integrations using BlinQ’s OpenAPI documentation.',['Review the available API documentation','Scope the information your integration needs','Plan authentication and access','Discuss your integration with the BlinQ team']]};
function showDetail(key){const d=details[key];$('#detail-label').textContent=d[0];$('#detail-title').textContent=d[1];$('#detail-copy').textContent=d[2];$('#detail-list').replaceChildren(...d[3].map(t=>{const li=document.createElement('li');li.textContent=t;return li}));$('#detail-dialog').showModal();document.body.classList.add('modal-open')}
$$('[data-detail]').forEach(b=>b.onclick=()=>showDetail(b.dataset.detail));$('.close').onclick=()=>$('#detail-dialog').close();$('#detail-dialog').addEventListener('close',()=>document.body.classList.remove('modal-open'));$('#detail-dialog').addEventListener('click',e=>{if(e.target===$('#detail-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
$$('[data-growth]').forEach(b=>b.onclick=()=>{const api=b.dataset.growth==='1';$('.growth-visual img').src=api?'assets/scenes/res-schedule.webp':'assets/scenes/growth-online-order.webp';$('.growth-visual img').alt=api?'Window furnishing professionals collaborating':'A couple ordering blinds online at home';$('#growth-title').innerHTML=api?'Your tools.<br>Working together.':'Your products.<br>Ready to order online.';$('#growth-copy').textContent=api?'Connect your workflow with other business tools through BlinQ’s OpenAPI.':'Let customers choose products, enter measurements and order on your website. Bring the details into BlinQ.';$('#growth-learn').textContent=api?'Explore OpenAPI':'Discover iWidget';$('#growth-learn').dataset.detail=api?'api':'widget';$('#growth-caption').textContent=api?'Your tools. Your connections. Your possibilities.':'Your products. Your brand. Your workflow.';$$('[data-growth]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b)})});

/* Flip counter. A fixed number, like blinq.com.au: it counts up on arrival and stops, so it never
   claims to be live. Production should write the real total here, as the main site does. */
const QUOTES_TOTAL=781639;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
(function(){
 const box=$('#quote-flip');if(!box)return;
 const paint=(tile,d)=>{tile.dataset.d=d;tile.innerHTML=`<span class="half top"><span>${d}</span></span><span class="half bottom"><span>${d}</span></span>`};
 const start=reducedMotion?QUOTES_TOTAL:QUOTES_TOTAL-36;
 const tiles=[...String(start)].map(d=>{const t=document.createElement('span');t.className='flip-tile';t.setAttribute('aria-hidden','true');paint(t,d);return t});
 box.replaceChildren(...tiles);
 const flip=(tile,next)=>{
  const cur=tile.dataset.d;if(cur===next)return;
  tile.dataset.d=next;
  tile.querySelectorAll('.flap-out,.flap-in').forEach(x=>x.remove());
  tile.querySelector('.top>span').textContent=next;
  tile.querySelector('.bottom>span').textContent=cur;
  const out=document.createElement('span');out.className='half top flap-out';out.innerHTML=`<span>${cur}</span>`;
  const inn=document.createElement('span');inn.className='half bottom flap-in';inn.innerHTML=`<span>${next}</span>`;
  inn.addEventListener('animationend',()=>{tile.querySelector('.bottom>span').textContent=next;out.remove();inn.remove()},{once:true});
  tile.append(out,inn);
 };
 let n=start;
 const step=()=>{
  if(n>=QUOTES_TOTAL)return;
  n++;[...String(n)].forEach((d,i)=>flip(tiles[i],d));
  const left=QUOTES_TOTAL-n;
  setTimeout(step,left>10?46:46+(10-left)*26);
 };
 if(!reducedMotion)setTimeout(step,650);
})();

/* Trial forms. Template only: the real signup runs on blinq.com.au, so this checks the address and
   goes to its pricing page. The address is not sent or stored. Connect the signup endpoint in production. */
$$('.trial-form').forEach(form=>{
 const input=form.querySelector('input'),error=form.nextElementSibling;
 form.addEventListener('submit',e=>{
  e.preventDefault();
  if(!input.value.trim()||!input.checkValidity()){error.textContent='Enter your email address to start the trial.';input.focus();return}
  error.textContent='';location.href=form.action;
 });
 input.addEventListener('input',()=>{error.textContent=''});
});
$$('a[href="#trial"]').forEach(a=>a.addEventListener('click',()=>$('#trial-email').focus({preventScroll:true})));

/* Sticky bar waits until the hero and its form have scrolled away */
new IntersectionObserver(([e])=>$('.booking-bar').classList.toggle('is-visible',!e.isIntersecting)).observe($('#trial'));

/* One question: strike the steps out when the list comes into view */
(function(){
 const work=$('.friction-work');
 [...work.querySelectorAll('.cut')].forEach((li,i)=>li.style.setProperty('--i',i));
 new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){work.classList.add('in-view');o.disconnect()}}),{threshold:.3}).observe(work);
})();

/* One ordinary Tuesday: the photo holds still while the day scrolls past */
(function(){
 const stage=$('.day-stage'),moments=$$('.moment');
 moments.forEach((m,i)=>{
  const shot=m.querySelector('.moment-shot').cloneNode(true);
  shot.className='stage-shot';stage.append(shot);m.dataset.i=i;
 });
 const shots=[...stage.children];
 const activate=i=>{moments.forEach((m,j)=>m.classList.toggle('is-active',j===i));shots.forEach((s,j)=>s.classList.toggle('is-active',j===i))};
 activate(0);
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)activate(+e.target.dataset.i)}),{rootMargin:'-48% 0px -48% 0px'});
 moments.forEach(m=>io.observe(m));
})();



(function(){
 const assistant=$('.voice-assistant'),toggle=assistant.querySelector('.voice-toggle');
 toggle.addEventListener('click',()=>{
  const paused=assistant.classList.toggle('is-paused');
  toggle.setAttribute('aria-pressed',String(paused));
  toggle.setAttribute('aria-label',paused?'Play assistant animation':'Pause assistant animation');
 });
 new IntersectionObserver(([entry])=>assistant.classList.toggle('is-offscreen',!entry.isIntersecting)).observe(assistant);
})();


(function(){
 const dialog=$('#video-dialog'),player=dialog.querySelector('.video-player');
 const closeVideo=()=>dialog.close();
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-video]');
  if(!button)return;
  e.preventDefault();
  const title=button.dataset.videoTitle||button.closest('.suite-item').querySelector('h3').textContent;
  $('#video-title').textContent=title;
  const frame=document.createElement('iframe');
  frame.src='https://www.youtube.com/embed/'+encodeURIComponent(button.dataset.video)+'?autoplay=1&rel=0';
  frame.title=title+' | BlinQ video';
  frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen=true;
  frame.referrerPolicy='strict-origin-when-cross-origin';
  player.replaceChildren(frame);
  dialog.querySelector('.video-external').href='https://www.youtube.com/watch?v='+encodeURIComponent(button.dataset.video);
  dialog.showModal();document.body.classList.add('modal-open'); });
 dialog.querySelector('.video-close').addEventListener('click',closeVideo);
 dialog.addEventListener('close',()=>{player.replaceChildren();document.body.classList.remove('modal-open')});
 dialog.addEventListener('click',e=>{
  if(e.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeVideo();
 });
})();


(function(){
 const carousel=$('.testimonial-carousel'),track=carousel.querySelector('.testimonial-track');
 const cards=[...track.children];
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let resumeAt=0,hovered=false,visible=false,last=0,position=0,cycle=0;
 cards.forEach(card=>{
  const copy=card.cloneNode(true);copy.setAttribute('aria-hidden','true');
  copy.querySelectorAll('a,button').forEach(el=>el.tabIndex=-1);track.append(copy);
 });
 const measure=()=>{cycle=track.children[cards.length].offsetLeft-track.children[0].offsetLeft;position=track.scrollLeft};
 const tick=now=>{
  const elapsed=Math.min(now-last,50);last=now;
  if(visible&&now>=resumeAt&&!hovered&&!motion.matches&&!document.hidden&&!track.contains(document.activeElement)&&!document.querySelector('dialog[open]')&&cycle){
   position=(position+elapsed*.025)%cycle;track.scrollLeft=position;
  }else position=track.scrollLeft;
  requestAnimationFrame(tick);
 };
 track.addEventListener('scroll',()=>{if(cycle&&track.scrollLeft>=cycle){track.scrollLeft-=cycle;position=track.scrollLeft}},{passive:true});
 track.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hovered=true});
 track.addEventListener('pointerleave',()=>hovered=false);
 const pauseBriefly=()=>{resumeAt=performance.now()+4000};
 track.addEventListener('pointerdown',pauseBriefly,{passive:true});
 track.addEventListener('wheel',pauseBriefly,{passive:true});
 const move=direction=>{
  pauseBriefly();
  const step=cards[1].offsetLeft-cards[0].offsetLeft;
  if(direction<0&&track.scrollLeft<1){track.scrollLeft=cycle-step;return}
  track.scrollBy({left:direction*step,behavior:motion.matches?'instant':'smooth'});
 };
 carousel.querySelector('.testimonial-prev').addEventListener('click',()=>move(-1));
 carousel.querySelector('.testimonial-next').addEventListener('click',()=>move(1));
 new ResizeObserver(measure).observe(track);
 new IntersectionObserver(([entry])=>visible=entry.isIntersecting).observe(carousel);
 measure();requestAnimationFrame(tick);
})();

(() => {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const states=new Map();
  const format=value=>'A$'+Math.round(value).toLocaleString('en-AU');
  const animate=(state,target,from=state.value)=>{
    cancelAnimationFrame(state.frame);
    state.target=target;
    state.accessible.textContent=format(target);
    const finish=()=>{state.value=target;state.price.textContent=format(target)};
    if(motion.matches){finish();return}
    const start=performance.now();
    const tick=now=>{
      const progress=Math.min((now-start)/650,1);
      state.value=from+(target-from)*(1-Math.pow(1-progress,3));
      state.price.textContent=format(state.value);
      if(progress<1)state.frame=requestAnimationFrame(tick);
      else finish();
    };
    state.frame=requestAnimationFrame(tick);
  };
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const state=states.get(entry.target);
    animate(state,state.target,0);
    observer.unobserve(entry.target);
  }),{threshold:.6});
  $$('.pricing-billing').forEach(billing=>{
    const price=billing.querySelector('.pricing-total');
    const target=Number(price.dataset.total);
    const accessible=document.createElement('span');
    accessible.className='sr-only';accessible.textContent=format(target);
    price.setAttribute('aria-hidden','true');price.after(accessible);
    const state={price,accessible,value:target,target,frame:0};
    states.set(billing,state);observer.observe(billing);
    const select=billing.closest('.pricing-card').querySelector('.pricing-users');
    if(!select)return;
    const update=()=>{
      observer.unobserve(billing);
      const option=select.selectedOptions[0];
      billing.querySelector('strong').textContent=option.value;
      animate(state,Number(option.dataset.total));
    };
    select.addEventListener('change',update);
    const option=select.selectedOptions[0];
    billing.querySelector('strong').textContent=option.value;
    state.value=state.target=Number(option.dataset.total);
    price.textContent=accessible.textContent=format(state.target);
  });
  motion.addEventListener('change',()=>{
    if(motion.matches)states.forEach(state=>animate(state,state.target));
  });
})();

(() => {
  const header=document.querySelector('header');
  const updateHeader=()=>header.classList.toggle('is-scrolled',window.scrollY>8);
  window.addEventListener('scroll',updateHeader,{passive:true});
  updateHeader();
})();

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
 const region=()=>{const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';return tz.startsWith('Europe/')?'uk':tz.startsWith('America/')?'us':'au'};
 const open=()=>{
  closeMenus();
  $$('dialog[open]').forEach(d=>{if(d!==dialog)d.close()});
  clearFrame();show(1);label(30);
  dialog.querySelectorAll('.booking-option').forEach(b=>b.classList.toggle('is-suggested',b.dataset.region===region()));
  const call={au:['+61388444864','+61 3 8844 4864'],uk:['+441173257254','+44 117 325 7254'],us:['+13237458257','+1 323 745 8257']}[region()],tel=dialog.querySelector('.booking-call a');
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
 const isSheet=d=>d.id==='booking-dialog'&&phone.matches;
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

/* Email typing hint: while the field is empty and on screen, sample work emails type themselves in
   and delete again, with a caret, so the box clearly reads as an email field. It steps aside the
   moment the visitor clicks in or types, and comes back if they leave it empty. */
(function(){
 const emails=['sarah@yourblindstore.com.au','orders@yourshuttercompany.com','hello@yourcurtainstudio.co.nz','james@yourawnings.co.uk'];
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 $$('input[data-typing-hint]').forEach(input=>{
  const form=input.form,hint=input.parentElement.querySelector('.email-hint'),text=hint.querySelector('.email-hint-text');
  let word=0,chars=0,deleting=false,timer=null,onScreen=false;
  const free=()=>onScreen&&!input.value&&document.activeElement!==input&&!document.hidden;
  const stop=()=>{clearTimeout(timer);timer=null;form.classList.remove('is-hinting')};
  const tick=()=>{
   timer=null;
   if(!free()){stop();return}
   form.classList.add('is-hinting');
   const email=emails[word];let wait;
   hint.classList.remove('is-waiting');
   if(!deleting){
    chars++;
    if(chars>=email.length){deleting=true;hint.classList.add('is-waiting');wait=1900}
    else wait=60+Math.random()*80+('@.'.includes(email[chars-1])?160:0);
   }else{
    chars--;
    if(chars<=0){deleting=false;word=(word+1)%emails.length;hint.classList.add('is-waiting');wait=650}
    else wait=26;
   }
   text.textContent=email.slice(0,chars);
   timer=setTimeout(tick,wait);
  };
  const start=()=>{if(!timer&&free()){hint.classList.add('is-waiting');form.classList.add('is-hinting');timer=setTimeout(tick,500)}};
  new IntersectionObserver(([e])=>{onScreen=e.isIntersecting;onScreen?start():stop()}).observe(input);
  input.addEventListener('focus',stop);
  input.addEventListener('input',()=>{if(input.value)stop()});
  input.addEventListener('blur',()=>{if(!input.value){chars=0;deleting=false;text.textContent='';start()}});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
 });
})();
