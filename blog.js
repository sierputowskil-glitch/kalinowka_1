/* Kalinówka — blog/inner pages chrome */
(function(){
  "use strict";
  const $=(s,c)=>(c||document).querySelector(s);
  const $$=(s,c)=>Array.from((c||document).querySelectorAll(s));
  const y=$('#year'); if(y) y.textContent=new Date().getFullYear();

  // mobile drawer
  const drawer=$('#drawer'), burger=$('#burger'), dc=$('#drawerClose');
  if(burger) burger.addEventListener('click',()=>drawer.classList.add('open'));
  if(dc) dc.addEventListener('click',()=>drawer.classList.remove('open'));
  $$('#drawer a').forEach(a=>a.addEventListener('click',()=>drawer&&drawer.classList.remove('open')));

  // offer dropdown
  const offerItem=$('#offerItem'), offerToggle=$('#offerToggle');
  if(offerItem&&offerToggle){
    offerToggle.addEventListener('click',e=>{e.preventDefault();const o=offerItem.classList.toggle('open');offerToggle.setAttribute('aria-expanded',o?'true':'false');});
    document.addEventListener('click',e=>{if(!offerItem.contains(e.target)){offerItem.classList.remove('open');offerToggle.setAttribute('aria-expanded','false');}});
  }

  // nav solidify over dark page hero (mirrors homepage)
  const nav=$('#nav');
  function onScroll(){
    if(!nav)return;
    const y=window.scrollY;
    if(y>40) nav.classList.add('solid'); else nav.classList.remove('solid');
    const ph=document.querySelector('.page-hero');
    const limit=ph?ph.offsetHeight-120:160;
    if(y>limit) nav.classList.remove('over-hero'); else nav.classList.add('over-hero');
  }
  const toTop=$('#toTop');
  function topBtn(){ if(toTop) toTop.classList.toggle('show',window.scrollY>innerHeight*0.6); }
  if(toTop) toTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
  window.addEventListener('scroll',()=>{onScroll();topBtn();},{passive:true}); onScroll(); topBtn();

  // reveal
  function revealCheck(){const vh=innerHeight;let rem=0;$$('.reveal').forEach(el=>{if(el.classList.contains('in'))return;const r=el.getBoundingClientRect();if(r.top<vh*0.92&&r.bottom>0)el.classList.add('in');else rem++;});return rem;}
  window.addEventListener('scroll',revealCheck,{passive:true}); revealCheck();
  const pt=setInterval(()=>{if(revealCheck()===0)clearInterval(pt);},180);
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0.1,rootMargin:'0px 0px -6% 0px'});
    $$('.reveal').forEach(el=>{if(!el.classList.contains('in'))io.observe(el);});
  }
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer)drawer.classList.remove('open');});
})();
