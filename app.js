document.documentElement.classList.add('js');
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function closeMenus(){$$('.mega').forEach(x=>x.hidden=true);$$('[data-menu]').forEach(x=>x.setAttribute('aria-expanded','false'));$('#shade').hidden=true;$('#mobile-menu').setAttribute('aria-expanded','false')}
$$('[data-menu]').forEach(b=>b.onclick=()=>{const open=$('#'+b.dataset.menu).hidden;closeMenus();if(open){$('#'+b.dataset.menu).hidden=false;$('#shade').hidden=false;b.setAttribute('aria-expanded','true')}});
$('#mobile-menu').onclick=()=>{const open=$('#solutions').hidden;closeMenus();if(open){$('#solutions').hidden=false;$('#shade').hidden=false;$('#mobile-menu').setAttribute('aria-expanded','true')}};$('#shade').onclick=closeMenus;$$('.mega a').forEach(a=>a.addEventListener('click',closeMenus));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenus()});
const slides=[['scenes/hero-clearer-way.webp','Still typing up quotes at 9pm?','There’s a clearer way to work.','A consultant walking to her van after a customer visit, tablet in hand','78% 22%','89% 50%'],['scenes/hero-on-site.webp','Measurements on the back of an envelope?','Great work starts on site.','A consultant measuring a window with a laser measure, tablet in hand','70% 24%','81% 50%'],['scenes/hero-customers.webp','Buried in admin with a customer in front of you?','More time for your customers.','A consultant laughing with a customer over a fabric sample book','74% 33%','78% 50%']];
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
const details={retail:['RetailSelect','Your entire retail workflow.','Bring the everyday work of your window furnishing business into one connected system.',['Manage leads and customer records','Schedule appointments and staff','Create quotations and convert approvals into jobs','Connect supplier purchase orders, invoices and payments']],manufacturing:['ManufactureSelect','From order to production.','Connect your sales and production workflow with the tools your manufacturing team needs.',['Let dealers submit product selections and sizes','Coordinate production and material requirements','Follow work through production and dispatch','Keep dealer invoices connected to the order']],wholesale:['DealerSelect','Connect your dealer network.','Give wholesale operations a connected foundation with BlinQ’s wholesale and dealer tools.',['Give dealers a connected quoting and ordering workflow','Configure products and dealer pricing','Review orders before production and fulfilment','Keep invoices and dealer accounts together']],mobile:['BlinQ mobile app','Your quoting workflow. On site.','Bring your product and customer information to the appointment, with tools to prepare quotes while you are there.',['Capture measurements and product selections','Attach photos and job information','Create and send customer quotations','Compare the mobile app plan and full platform options']],integrations:['Connected tools','Work with the tools you know.','Explore the available integrations and confirm which options fit your account, region and workflow.',['Accounting: Xero, QuickBooks and MYOB','Payments: Stripe','Scheduling: Google Calendar','Custom connections: BlinQ OpenAPI']],widget:['iWidget','Turn your website into a showroom.','Explore an online product and quoting experience connected to BlinQ.',['Present your products, fabrics and options','Let shoppers enter width and drop','Connect online checkout to your ordering workflow','Discuss website setup and product configuration']],api:['OpenAPI','Build your next connection.','Explore custom integrations using BlinQ’s OpenAPI documentation.',['Review the available API documentation','Scope the information your integration needs','Plan authentication and access','Discuss your integration with the BlinQ team']]};
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

/* Scrolling pushes the hero zoom further, and the headline drifts up and fades */
(function(){
 if(reducedMotion)return;
 const wrap=$('.hero-wrap'),media=$('#hero-media'),copy=$('.hero-copy');
 let queued=false;
 const paint=()=>{
  queued=false;
  const p=Math.min(1,Math.max(0,scrollY/(wrap.offsetHeight*.7)));
  media.style.setProperty('--zoom',(1+p*.6).toFixed(4));
  copy.style.opacity=Math.max(0,1-p*1.5).toFixed(3);copy.style.pointerEvents=p>.6?'none':'';
  copy.style.transform=`translateY(${(p*-70).toFixed(1)}px)`;
 };
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(paint)}},{passive:true});
 addEventListener('resize',paint);
 paint();
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
 $$('.suite-play').forEach(button=>button.addEventListener('click',()=>{
  const title=button.closest('.suite-item').querySelector('h3').textContent;
  $('#video-title').textContent=title;
  const frame=document.createElement('iframe');
  frame.src='https://www.youtube.com/embed/'+encodeURIComponent(button.dataset.video)+'?autoplay=1&rel=0';
  frame.title=title+' — BlinQ video';
  frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen=true;
  frame.referrerPolicy='strict-origin-when-cross-origin';
  player.replaceChildren(frame);
  dialog.querySelector('.video-external').href='https://www.youtube.com/watch?v='+encodeURIComponent(button.dataset.video);
  dialog.showModal();document.body.classList.add('modal-open');
 }));
 dialog.querySelector('.video-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{player.replaceChildren();document.body.classList.remove('modal-open')});
 dialog.addEventListener('click',e=>{
  if(e.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();
 });
})();
