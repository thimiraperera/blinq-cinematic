/* Integrations page only. Loads after common.js ($, $$, menus and popups).
   The search box and the category buttons filter the integration cards together; the "Popular" chips
   fill in the search, and integrations.html?q=xero arrives already searched. */
(function(){
 const q=$('#int-q'),cards=$$('.int-card'),cats=$$('.int-cats button'),count=$('#int-count'),empty=$('.int-empty');
 if(!q||!cards.length)return;
 let cat='all';
 const norm=s=>s.toLowerCase().replace(/\s+/g,' ').trim();
 cards.forEach(c=>c.dataset.text=norm(c.textContent+' '+(c.dataset.keywords||'')));
 const apply=()=>{
  const words=norm(q.value).split(' ').filter(Boolean);let n=0;
  cards.forEach(c=>{
   const show=(cat==='all'||c.dataset.cat===cat)&&words.every(w=>c.dataset.text.includes(w));
   c.hidden=!show;if(show)n++;
  });
  count.textContent=n===1?'1 integration':n+' integrations';
  empty.hidden=n>0;
  if(!n)empty.querySelector('span').textContent=q.value.trim();
 };
 const pick=b=>{cat=b.dataset.cat;cats.forEach(x=>x.setAttribute('aria-pressed',String(x===b)))};
 q.addEventListener('input',apply);
 cats.forEach(b=>b.addEventListener('click',()=>{pick(b);apply()}));
 $$('[data-q]').forEach(b=>b.addEventListener('click',()=>{
  q.value=b.dataset.q;pick(cats[0]);apply();
  $('.int-directory').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 }));
 const pre=new URLSearchParams(location.search).get('q');
 if(pre){q.value=pre;apply()}
})();
