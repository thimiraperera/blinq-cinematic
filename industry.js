/* Industry pages (industries/*.html). Loads after common.js ($, $$, menus and popups).
   The trial forms check the email address and go on to BlinQ's pricing page, like the home page (the
   address is not sent or stored: connect the real signup before launch). The "How BlinQ helps" tabs follow
   the ARIA tabs pattern: click, or use the arrow keys, Home and End. */
(function(){
 $$('.in-trial').forEach(form=>{
  const input=form.querySelector('input'),error=form.nextElementSibling;
  form.addEventListener('submit',e=>{
   e.preventDefault();
   if(!input.value.trim()||!input.checkValidity()){error.textContent='Enter your email address to start the trial.';input.focus();return}
   error.textContent='';location.href=form.action;
  });
  input.addEventListener('input',()=>{error.textContent=''});
 });
 // The booking bar's "Start your 7-day free trial" jumps to the hero form; focus it after the jump
 $$('a[href="#trial"]').forEach(a=>a.addEventListener('click',()=>setTimeout(()=>$('#trial-email').focus({preventScroll:true}),400)));

 const tabs=$$('.in-tabs [role="tab"]');
 const select=(tab,focus)=>{
  tabs.forEach(t=>{
   const on=t===tab,panel=$('#'+t.getAttribute('aria-controls'));
   t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;
   panel.hidden=!on;panel.classList.toggle('is-in',on);
  });
  if(focus)tab.focus();
  const strip=tab.parentElement,r=tab.getBoundingClientRect(),box=strip.getBoundingClientRect();
  if(r.left<box.left||r.right>box.right)strip.scrollBy({left:r.left-box.left-24,behavior:'smooth'});
 };
 tabs.forEach((t,i)=>{
  t.addEventListener('click',()=>select(t));
  t.addEventListener('keydown',e=>{
   const n={ArrowRight:i+1,ArrowLeft:i-1,Home:0,End:tabs.length-1}[e.key];
   if(n===undefined)return;
   e.preventDefault();select(tabs[(n+tabs.length)%tabs.length],true);
  });
 });
})();
