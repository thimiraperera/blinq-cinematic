document.documentElement.classList.add('js');
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
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
 let manual=false,queued=false,near=false;
 const takeControl=()=>{manual=true;track.classList.remove('scroll-driven')};
 const paint=()=>{
  queued=false;
  if(manual||motion.matches)return;
  const bounds=section.getBoundingClientRect();
  const progress=Math.min(1,Math.max(0,(innerHeight-bounds.top)/(innerHeight+bounds.height)));
  track.classList.add('scroll-driven');
  track.scrollLeft=progress*Math.min(420,track.clientWidth*.45);
 };
 const schedule=()=>{if(near&&!queued&&!manual){queued=true;requestAnimationFrame(paint)}};
 new IntersectionObserver(([e])=>{near=e.isIntersecting;schedule()}).observe(section);
 ['prev','next'].forEach((id,i)=>$('#'+id).onclick=()=>{
  const left=track.scrollLeft;
  const stops=cards.map(card=>card.offsetLeft-cards[0].offsetLeft);
  const target=i?stops.find(x=>x>left+2):stops.slice().reverse().find(x=>x<left-2);
  takeControl();
  track.scrollTo({left:target??(i?track.scrollWidth-track.clientWidth:0),behavior:motion.matches?'instant':'smooth'});
 });
 track.addEventListener('pointerdown',takeControl,{passive:true});
 dragRow(track,{stops:()=>cards.map(card=>card.offsetLeft-cards[0].offsetLeft),onGrab:takeControl});
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
 const start=reducedMotion?QUOTES_TOTAL:Math.max(QUOTES_TOTAL-36,10**(String(QUOTES_TOTAL).length-1));
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
/* Focus after the jump to #trial, which would otherwise clear the focus again */
$$('a[href="#trial"]').forEach(a=>a.addEventListener('click',()=>setTimeout(()=>$('#trial-email').focus({preventScroll:true}))));

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
 const dialog=$('#video-dialog'),player=dialog.querySelector('.video-player'),external=dialog.querySelector('.video-external');
 const closeVideo=()=>dialog.close();
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-video],[data-video-src]');
  if(!button)return;
  e.preventDefault();
  const title=button.dataset.videoTitle||button.closest('.suite-item').querySelector('h3').textContent;
  $('#video-title').textContent=title;
  const src=button.dataset.videoSrc;
  if(src){
   // BlinQ's own feature videos are served with the site and play in the browser's player
   const video=document.createElement('video');
   Object.assign(video,{src,controls:true,playsInline:true,preload:'auto'});
   if(button.dataset.videoPoster)video.poster=button.dataset.videoPoster;
   video.setAttribute('aria-label',title);
   player.replaceChildren(video);
  }else{
   const frame=document.createElement('iframe');
   frame.src='https://www.youtube.com/embed/'+encodeURIComponent(button.dataset.video)+'?autoplay=1&rel=0';
   frame.title=title+' | BlinQ video';
   frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
   frame.allowFullscreen=true;
   frame.referrerPolicy='strict-origin-when-cross-origin';
   player.replaceChildren(frame);
   external.href='https://www.youtube.com/watch?v='+encodeURIComponent(button.dataset.video);
  }
  external.hidden=!!src;
  dialog.showModal();document.body.classList.add('modal-open');
  if(src)player.firstChild.play().catch(()=>{}); });
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
 let resumeAt=0,hovered=false,visible=false,last=0,position=0,cycle=0,frame=0;
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
  frame=visible?requestAnimationFrame(tick):0;
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
 dragRow(track,{loop:()=>cycle,step:()=>cards[1].offsetLeft-cards[0].offsetLeft,onGrab:pauseBriefly,onRelease:pauseBriefly});
 new ResizeObserver(measure).observe(track);
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible&&!frame){last=performance.now();frame=requestAnimationFrame(tick)}}).observe(carousel);
 measure();
})();

(() => {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const states=new Map();
  const format=value=>'$'+Math.round(value).toLocaleString('en-AU');
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

/* Carousels you can grab. A row follows the mouse 1:1, resists past either end, and on release
   carries the throw's speed into a spring that settles on the nearest card. Grabbing it again
   mid-glide picks it up from where it is. Touch keeps the browser's own swipe for these rows. */
function swallowClick(el){
 const stop=e=>{e.preventDefault();e.stopPropagation()};
 el.addEventListener('click',stop,true);setTimeout(()=>el.removeEventListener('click',stop,true),40);
}
function dragRow(track,{stops,loop,step,onGrab,onRelease}){
 let drag=null,glide=0,shown=0;
 const max=()=>Math.max(0,track.scrollWidth-track.clientWidth);
 const show=p=>{
  shown=p;
  if(loop){const c=loop();track.scrollLeft=c?((p%c)+c)%c:p;return}
  const inside=Math.min(max(),Math.max(0,p));
  track.scrollLeft=inside;track.style.translate=Math.abs(p-inside)<.5?'':`${(inside-p).toFixed(1)}px 0`;
 };
 const resist=raw=>{
  if(loop)return raw;
  const inside=Math.min(max(),Math.max(0,raw)),over=raw-inside,size=track.clientWidth||1;
  return over?inside+Math.sign(over)*Math.abs(over)*size*.55/(size+.55*Math.abs(over)):raw;
 };
 const stopGlide=()=>{cancelAnimationFrame(glide);glide=0;track.classList.remove('is-gliding')};
 const settle=(from,v)=>{
  const dir=Math.sign(v),fast=Math.abs(v)>350,projected=from+v*.45;
  let target;
  if(loop){
   const size=step();target=Math.round(projected/size)*size;
   if(fast&&(target-from)*dir<=2)target=(dir>0?Math.floor(from/size)+1:Math.ceil(from/size)-1)*size;
  }else{
   const m=max(),list=[...new Set(stops().map(x=>Math.min(m,Math.max(0,x))))];
   target=list.reduce((a,b)=>Math.abs(b-projected)<Math.abs(a-projected)?b:a,list[0]);
   if(fast&&(target-from)*dir<=2){const ahead=list.filter(x=>(x-from)*dir>2).sort((a,b)=>(a-from)*dir-(b-from)*dir)[0];if(ahead!==undefined)target=ahead}
  }
  const w=2*Math.PI/.45,x0=from-target,t0=performance.now();
  track.classList.add('is-gliding');
  const frame=now=>{
   const t=(now-t0)/1000,e=Math.exp(-w*t),x=(x0+(v+w*x0)*t)*e,speed=(v-w*(v+w*x0)*t)*e;
   if((Math.abs(x)<.5&&Math.abs(speed)<20)||t>2){show(target);stopGlide();onRelease&&onRelease();return}
   show(target+x);glide=requestAnimationFrame(frame);
  };
  glide=requestAnimationFrame(frame);
 };
 track.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('input,textarea,select'))return;
  if(glide)stopGlide();else shown=track.scrollLeft;
  drag={x:e.clientX,y:e.clientY,from:shown,id:e.pointerId,moved:false,samples:[]};
 });
 track.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved){
   if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){drag=null;return}
   if(Math.abs(dx)<6)return;
   drag.moved=true;
   track.setPointerCapture(e.pointerId);track.classList.add('is-dragging');
   getSelection()?.removeAllRanges();onGrab&&onGrab();
  }
  show(resist(drag.from-(e.clientX-drag.x)));
  drag.samples.push([e.timeStamp,shown]);
  while(drag.samples.length>2&&e.timeStamp-drag.samples[0][0]>100)drag.samples.shift();
 });
 const release=e=>{
  if(!drag||e.pointerId!==drag.id)return;
  if(drag.moved&&e.type==='pointerup'){show(resist(drag.from-(e.clientX-drag.x)));drag.samples.push([e.timeStamp,shown])}
  const d=drag;drag=null;
  if(!d.moved)return;
  track.classList.remove('is-dragging');swallowClick(track);
  const s=d.samples,a=s[0],b=s[s.length-1];
  const v=e.type==='pointerup'&&s.length>1&&b[0]>a[0]&&e.timeStamp-b[0]<80?Math.max(-6000,Math.min(6000,(b[1]-a[1])/(b[0]-a[0])*1000)):0;
  settle(shown,v);
 };
 track.addEventListener('pointerup',release);track.addEventListener('pointercancel',release);
 track.addEventListener('dragstart',e=>e.preventDefault());
}

/* Hero: swipe or drag sideways to change the photo. Vertical swipes still scroll the page.
   The headline follows the drag a little, then slides out and the next one slides in. */
(function(){
 const hero=$('.hero'),lines=$('.hero-lines'),still=matchMedia('(prefers-reduced-motion: reduce)');
 let drag=null;
 const ignore=e=>e.button!==0||e.target.closest('a,button,input,textarea,select,label,form')||(e.pointerType==='mouse'&&e.target.closest('.hero-copy,.hero-bottom'));
 hero.addEventListener('pointerdown',e=>{if(!ignore(e))drag={x:e.clientX,y:e.clientY,id:e.pointerId,moved:false,samples:[]}});
 hero.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved){
   if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){drag=null;return}
   if(Math.abs(dx)<10)return;
   drag.moved=true;
   hero.setPointerCapture(e.pointerId);hero.classList.add('is-dragging');clearInterval(heroTimer);getSelection()?.removeAllRanges();
  }
  const move=e.clientX-drag.x;
  if(!still.matches){lines.style.transition='none';lines.style.translate=`${(move*.3).toFixed(1)}px 0`;lines.style.opacity=Math.max(.3,1-Math.abs(move)/360).toFixed(3)}
  drag.samples.push([e.timeStamp,e.clientX]);
  while(drag.samples.length>2&&e.timeStamp-drag.samples[0][0]>100)drag.samples.shift();
 });
 const release=e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const d=drag;drag=null;
  if(!d.moved)return;
  hero.classList.remove('is-dragging');swallowClick(hero);
  if(e.type==='pointerup')d.samples.push([e.timeStamp,e.clientX]);
  const move=e.clientX-d.x,s=d.samples,a=s[0],b=s[s.length-1];
  const v=s.length>1&&b[0]>a[0]?(b[1]-a[1])/(b[0]-a[0])*1000:0;
  const swipe=e.type==='pointerup'&&(Math.abs(move)>70||(Math.abs(move)>24&&Math.abs(v)>450));
  if(!swipe){
   lines.style.transition='translate .35s cubic-bezier(.2,.9,.25,1),opacity .3s ease,transform .26s ease';
   lines.style.translate='';lines.style.opacity='';
   setTimeout(()=>{if(!drag)lines.style.transition=''},400);
   startHero();return;
  }
  const out=move<0?-1:1;
  if(!still.matches){lines.style.transition='translate .26s ease,opacity .26s ease';lines.style.translate=`${out*60}px 0`;lines.style.opacity='0'}
  manualHero(heroIndex-out);
  if(still.matches)return;
  setTimeout(()=>{
   lines.style.transition='none';lines.style.translate=`${-out*40}px 0`;void lines.offsetWidth;
   lines.style.transition='translate .5s cubic-bezier(.2,.9,.25,1),opacity .4s ease';lines.style.translate='';lines.style.opacity='';
   setTimeout(()=>{if(!drag)lines.style.transition=''},550);
  },270);
 };
 hero.addEventListener('pointerup',release);hero.addEventListener('pointercancel',release);
 hero.addEventListener('dragstart',e=>{if(drag)e.preventDefault()});
})();

/* Customer logo strip: it drifts on its own, eases to a stop under the mouse, and can be dragged
   or thrown either way with mouse or touch before it drifts on again. */
(function(){
 const view=$('.trust-view'),track=view&&view.querySelector('.trust-track');
 if(!track)return;
 const still=matchMedia('(prefers-reduced-motion: reduce)');
 let offset=0,vel=0,half=0,last=0,frame=0,hovered=false,onScreen=false,drag=null;
 view.classList.add('is-js');
 const drift=()=>still.matches||hovered?0:-half/50;
 const tick=now=>{
  const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
  if(!drag){vel+=(drift()-vel)*(1-Math.exp(-dt/.5));offset+=vel*dt}
  if(half){offset%=half;if(offset>0)offset-=half}
  track.style.transform=`translate3d(${offset.toFixed(2)}px,0,0)`;
  frame=(onScreen&&!document.hidden)||drag?requestAnimationFrame(tick):0;
 };
 const run=()=>{if(!frame){last=performance.now();frame=requestAnimationFrame(tick)}};
 view.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hovered=true});
 view.addEventListener('pointerleave',()=>hovered=false);
 view.addEventListener('pointerdown',e=>{if(e.button===0)drag={x:e.clientX,y:e.clientY,from:offset,id:e.pointerId,moved:false,samples:[]}});
 view.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved){
   if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){drag=null;return}
   if(Math.abs(dx)<6)return;
   drag.moved=true;vel=0;
   view.setPointerCapture(e.pointerId);view.classList.add('is-dragging');
  }
  offset=drag.from+(e.clientX-drag.x);
  drag.samples.push([e.timeStamp,e.clientX]);
  while(drag.samples.length>2&&e.timeStamp-drag.samples[0][0]>100)drag.samples.shift();
  run();
 });
 const release=e=>{
  if(!drag||e.pointerId!==drag.id)return;
  if(drag.moved&&e.type==='pointerup'){offset=drag.from+(e.clientX-drag.x);drag.samples.push([e.timeStamp,e.clientX])}
  const d=drag;drag=null;
  if(!d.moved)return;
  view.classList.remove('is-dragging');
  const s=d.samples,a=s[0],b=s[s.length-1];
  vel=!still.matches&&e.type==='pointerup'&&s.length>1&&b[0]>a[0]&&e.timeStamp-b[0]<80?Math.max(-4000,Math.min(4000,(b[1]-a[1])/(b[0]-a[0])*1000)):0;
  run();
 };
 view.addEventListener('pointerup',release);view.addEventListener('pointercancel',release);
 view.addEventListener('dragstart',e=>e.preventDefault());
 const measure=()=>{half=track.scrollWidth/2};
 new ResizeObserver(measure).observe(track);
 new IntersectionObserver(([e])=>{onScreen=e.isIntersecting;if(onScreen)run()}).observe(view);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)run()});
 measure();vel=drift();run();
})();

/* Five steps: the icons rise in and the connecting lines draw across when the row comes into view */
(function(){
 const steps=$('.friction-steps');if(!steps)return;
 new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){steps.classList.add('in-view');o.disconnect()}}),{threshold:.35}).observe(steps);
})();

/* Blur fade-up: as each piece of content scrolls into view it eases up into focus. Pieces that
   arrive together follow one another in reading order. The hero has its own entrance. Each piece
   arrives through a one-off animation that leaves nothing behind, so hover effects work as before. */
(function(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
 const pieces=['.trust-label','.trust-view',
  '.friction-top>div:first-child>*','.friction-work','.friction-note',
  '.day-head>*','.day-stage','.moment','.day-cta',
  '.suite>.eyebrow','.suite>h2','.suite>p','.suite-grid',
  '.range .section-heading>div>*','.product-track',
  '.mobile-copy>*','.mobile-panel>img','.mobile-foot',
  '.ai-panel>div:first-child>*','.voice-assistant','.ai-concepts>*',
  '.people-wall>*','.people-card',
  '.stories .section-heading>div>*','.testimonial-carousel','.stories-walkthrough',
  '.growth>div:first-child>*','.growth-visual',
  '.plans>:not(.pricing-cards)','.pricing-card',
  '.faq>*',
  '.integration-heading>*','.integration-wall',
  '.blog-head>*','.blog-card','.blog-all',
  '.closing>img','.closing-copy>*','.trial-card',
  'footer>*'];
 const media='.day-stage,.mobile-panel>img,.people-wall>*,.growth-visual,.closing>img';
 const items=[...new Set(pieces.flatMap(sel=>$$(sel)))].filter(el=>!el.closest('dialog,.mega,header,.hero'));
 const io=new IntersectionObserver(entries=>{
  entries.filter(e=>e.isIntersecting).map(e=>e.target)
   .sort((a,b)=>a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1)
   .forEach((el,i)=>{
    io.unobserve(el);
    const start=el.classList.contains('reveal-media')?{opacity:0,transform:'scale(1.04)',filter:'blur(12px)'}:{opacity:0,transform:'translateY(18px)',filter:'blur(8px)'};
    el.animate([start,{opacity:1,transform:'none',filter:'blur(0px)'}],{duration:850,delay:Math.min(i,8)*70,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'});
    el.classList.remove('reveal','reveal-media');
   });
 },{rootMargin:'0px 0px -8% 0px',threshold:.08});
 items.forEach(el=>{el.classList.add('reveal');if(el.matches(media))el.classList.add('reveal-media');io.observe(el)});
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
