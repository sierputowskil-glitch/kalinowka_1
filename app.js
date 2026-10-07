/* =========================================================
   KALINÓWKA — interactions
   ========================================================= */
(function(){
  "use strict";
  const $ = (s,c)=>(c||document).querySelector(s);
  const $$ = (s,c)=>Array.from((c||document).querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- year ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- HERO slideshow ---------- */
  const heroImgs = [
    {src:'/img/f/strefa-relaksu-ogrod-lezaki-kalinowka.webp', alt:'Strefa relaksu w ogrodzie Kalinówki: leżaki, poduszki i trawa pampasowa na trawniku'},
    {src:'/img/f/ceremonia-plenerowa-biale-krzesla-kalinowka.webp', alt:'Ceremonia ślubu plenerowego w ogrodzie Kalinówki: białe krzesła, ślubna brama i drewniany budynek w tle'},
    {src:'/img/f/budynek-kalinowki-wieczorem-kalinowka.webp', alt:'Drewniany budynek Kalinówki wśród lasu o zmierzchu, widok od strony ogrodu'},
    {src:'/img/f/jasna-sala-weselna-okna-kalinowka.webp', alt:'Jasna sala z dużymi oknami i nakrytymi stołami w Kalinówce'},
    {src:'/img/f/przyjecie-w-sali-weselnej-kalinowka.webp', alt:'Nakryte stoły z kwiatowymi dekoracjami w sali Kalinówki'}
  ];
  const slidesWrap = $('#heroSlides'), dotsWrap = $('#heroDots');
  heroImgs.forEach((im,i)=>{
    if(i===0&&slidesWrap.firstElementChild){/* pierwszy slajd jest w HTML (LCP) */}
    else{
    const d=document.createElement('div');
    d.className='hero-slide'+(i===0?' active':'');
    d.style.backgroundImage=`url('${im.src}')`;
    d.setAttribute('role','img'); d.setAttribute('aria-label',im.alt);
    slidesWrap.appendChild(d);
    }
    const b=document.createElement('button');
    b.className=(i===0?'on':''); b.setAttribute('aria-label','Slajd '+(i+1));
    b.addEventListener('click',()=>go(i));
    dotsWrap.appendChild(b);
  });
  // preload
  window.addEventListener('load',()=>setTimeout(()=>heroImgs.slice(1).forEach(im=>{const x=new Image();x.src=im.src;}),1500));
  let hi=0, htimer;
  const slides=$$('.hero-slide',slidesWrap), dots=$$('button',dotsWrap);
  function go(n){
    slides[hi].classList.remove('active'); dots[hi].classList.remove('on');
    hi=(n+slides.length)%slides.length;
    slides[hi].classList.add('active'); dots[hi].classList.add('on');
    restart();
  }
  function next(){go(hi+1);}
  function restart(){clearInterval(htimer); if(!reduce) htimer=setInterval(next,6500);}
  restart();

  /* ---------- NAV scroll state ---------- */
  const nav=$('#nav'), hero=$('#hero'), sticky=$('#stickycta');
  function onScroll(){
    const y=window.scrollY;
    const heroBottom=hero.offsetHeight-90;
    if(y>40) nav.classList.add('solid'); else nav.classList.remove('solid');
    if(y>heroBottom-200) nav.classList.remove('over-hero'); else nav.classList.add('over-hero');
    if(y>window.innerHeight*0.9) sticky.classList.add('show'); else sticky.classList.remove('show');
    document.body.classList.toggle('has-sticky',y>window.innerHeight*0.9);
    const tt=$('#toTop'); if(tt) tt.classList.toggle('show',y>window.innerHeight*0.6);
    revealCheck();
    // parallax
    $$('[data-parallax]').forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.bottom>0 && r.top<window.innerHeight){
        const speed=parseFloat(el.dataset.parallax)||.15;
        const off=(r.top - window.innerHeight/2)*-speed;
        el.style.transform=`translateY(${off}px) scale(1.12)`;
      }
    });
  }
  // reveal-on-view: scroll-driven + polling fallback (robust against missed scroll events / anchor jumps)
  function revealCheck(){
    const vh=window.innerHeight; let remaining=0;
    $$('.reveal').forEach(el=>{
      if(el.classList.contains('in'))return;
      const r=el.getBoundingClientRect();
      if(r.top < vh*0.92 && r.bottom > 0) el.classList.add('in'); else remaining++;
    });
    return remaining;
  }
  const toTop=$('#toTop'); if(toTop) toTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduce?'auto':'smooth'}));
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',()=>{onScroll();},{passive:true});
  onScroll();
  // poll so reveals fire as content enters view even if scroll events are throttled/absent
  const _pt=setInterval(()=>{ if(revealCheck()===0) clearInterval(_pt); },180);
  // IntersectionObserver: primary on-scroll reveal (gold standard for real users)
  if('IntersectionObserver' in window){
    const _io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');_io.unobserve(e.target);}});},{threshold:0.1,rootMargin:'0px 0px -6% 0px'});
    $$('.reveal').forEach(el=>{ if(!el.classList.contains('in')) _io.observe(el); });
  }

  /* ---------- mobile drawer ---------- */
  const drawer=$('#drawer');
  $('#burger').addEventListener('click',()=>drawer.classList.add('open'));
  $('#drawerClose').addEventListener('click',()=>drawer.classList.remove('open'));
  $$('#drawer nav a, #drawer .drawer-cta a').forEach(a=>a.addEventListener('click',()=>drawer.classList.remove('open')));

  /* ---------- nav "Oferta" dropdown (click/touch + a11y) ---------- */
  const offerItem=$('#offerItem'), offerToggle=$('#offerToggle');
  if(offerItem && offerToggle){
    offerToggle.addEventListener('click',(e)=>{
      e.preventDefault();
      const open=offerItem.classList.toggle('open');
      offerToggle.setAttribute('aria-expanded',open?'true':'false');
    });
    document.addEventListener('click',(e)=>{
      if(!offerItem.contains(e.target)){offerItem.classList.remove('open');offerToggle.setAttribute('aria-expanded','false');}
    });
    $$('.nav-drop a',offerItem).forEach(a=>a.addEventListener('click',()=>{offerItem.classList.remove('open');offerToggle.setAttribute('aria-expanded','false');}));
  }

  /* ---------- GALLERY ---------- */
  const gallery=[
    {p:'ceremonia-plenerowa-biale-krzesla-kalinowka',cat:'plener',t:'Ceremonia w ogrodzie',a:'Ceremonia ślubu plenerowego w ogrodzie Kalinówki: białe krzesła, ślubna brama i drewniany budynek w tle',r:1.499},
    {p:'slub-plenerowy-ustawienie-krzesel-kalinowka',cat:'plener',t:'Ślub plenerowy nad rzeką',a:'Krzesła ustawione do ślubu plenerowego na trawniku Kalinówki, w tle ogród i las',r:1.499},
    {p:'slub-plenerowy-trawnik-krzesla-kalinowka',cat:'plener',t:'Ceremonia na trawniku',a:'Ślub plenerowy: rzędy białych krzeseł na trawniku w ogrodzie Kalinówki',r:0.75},
    {p:'para-mloda-ceremonia-ogrod-kalinowka',cat:'realizacje',t:'Para Młoda w ogrodzie',a:'Para Młoda podczas ceremonii ślubnej w ogrodzie Kalinówki, w tle białe krzesła',r:1.499},
    {p:'okragla-brama-slubna-bialeskrzesla-kalinowka',cat:'ogrod',t:'Krzesła w ogrodzie',a:'Białe krzesła i okrągła brama ślubna na trawniku w ogrodzie Kalinówki, ceremonia plenerowa w Gdańsku',r:1.499},
    {p:'budynek-kalinowki-wieczorem-kalinowka',cat:'ogrod',t:'Kwiatowa brama ślubna',a:'Drewniany budynek Kalinówki wśród lasu o zmierzchu, widok od strony ogrodu',r:1.499},
    {p:'budynek-kalinowki-sciezka-kalinowka',cat:'ogrod',t:'Budynek Kalinówki',a:'Drewniany budynek Kalinówki ze szklaną werandą i ścieżką w otoczeniu zieleni',r:0.667},
    {p:'wejscie-taras-wieczorem-kalinowka',cat:'ogrod',t:'Wejście wieczorem',a:'Oświetlone wejście i taras Kalinówki wieczorem, z lampionami',r:1.499},
    {p:'kwiatowa-brama-slubna-ogrod-kalinowka',cat:'ogrod',t:'Ogród z bramą',a:'Kwiatowa brama i krzesła ustawione na trawniku do ceremonii ślubnej w ogrodzie Kalinówki w Gdańsku',r:0.945},
    {p:'strefa-relaksu-ogrod-lezaki-kalinowka',cat:'ogrod',t:'Strefa relaksu w ogrodzie',a:'Strefa relaksu w ogrodzie Kalinówki: leżaki, poduszki i trawa pampasowa na trawniku',r:1.499},
    {p:'jasna-sala-weselna-okna-kalinowka',cat:'sala',t:'Drewniana sala z arkadą',a:'Jasna sala weselna z dużymi oknami i nakrytymi stołami w Kalinówce',r:1.499},
    {p:'wejscie-na-sale-weselna-kalinowka',cat:'sala',t:'Wejście na salę',a:'Widok z wejścia na salę weselną Kalinówki przez drewniane drzwi z zasłonami',r:0.75},
    {p:'sala-kominek-drewniane-belki-kalinowka',cat:'sala',t:'Sala pod belkami',a:'Wnętrze sali Kalinówki z drewnianymi belkami, kominkiem i nakrytym okrągłym stołem',r:1.499},
    {p:'sala-weselna-draperie-girlandy-kalinowka',cat:'sala',t:'Sala w światłach lampek',a:'Sala weselna Kalinówki z białymi draperiami, zielonymi girlandami i okrągłymi stołami',r:0.75},
    {p:'stol-pary-mlodej-girlandy-kalinowka',cat:'sala',t:'Stoły weselne',a:'Stół Pary Młodej ozdobiony zielonymi girlandami w sali weselnej Kalinówki',r:1.499},
    {p:'stol-granatowy-obrus-sala-kalinowka',cat:'sala',t:'Eleganckie nakrycia',a:'Okrągły stół weselny z granatowym obrusem i drewnianymi krzesłami w sali z draperiami',r:0.75},
    {p:'sala-bankietowa-draperie-kalinowka',cat:'sala',t:'Sala bankietowa',a:'Sala bankietowa Kalinówki z nakrytymi stołami pod białymi draperiami',r:1.333},
    {p:'sala-dla-gosci-wysokie-bukiety-kalinowka',cat:'sala',t:'Sala dla gości',a:'Okrągłe stoły dla gości z wysokimi bukietami w sali weselnej Kalinówki',r:1.535},
    {p:'bukiet-kwiatow-na-stole-kalinowka',cat:'sala',t:'Wnętrze sali',a:'Bukiet kolorowych kwiatów na nakrytym stole w sali weselnej Kalinówki',r:0.75},
    {p:'przyjecie-w-sali-weselnej-kalinowka',cat:'sala',t:'Przyjęcie w sali',a:'Nakryte stoły z kwiatowymi dekoracjami w sali weselnej Kalinówki',r:1.499},
    {p:'kompozycja-kwiatowa-stol-weselny-kalinowka',cat:'dekoracje',t:'Kompozycja kwiatowa',a:'Kompozycja z kolorowych kwiatów i świec na stole weselnym przed ścianką z lampkami w sali Kalinówki',r:0.75},
    {p:'bufet-przy-oknach-wieczorem-kalinowka',cat:'dekoracje',t:'Wieczorny stół ze świecami',a:'Bufet z przekąskami i lampkami przy dużych oknach sali weselnej, widok wieczorem',r:1.499},
    {p:'stol-weselny-swiece-zielen-kalinowka',cat:'dekoracje',t:'Świece i zieleń',a:'Nakryty stół weselny ze świecami i wysoką zieloną dekoracją w sali Kalinówki',r:0.75},
    {p:'kwiatowa-obrecz-stol-pary-mlodej-kalinowka',cat:'dekoracje',t:'Kwiatowa obręcz',a:'Kwiatowa obręcz z zieleni za stołem Pary Młodej w sali z białymi draperiami',r:0.75},
    {p:'napis-milosc-wesele-kalinowka',cat:'dekoracje',t:'Napis „Miłość”',a:'Podświetlany napis MIŁOŚĆ na przyjęciu weselnym w Kalinówce',r:1.499},
    {p:'stol-pary-mlodej-kolorowe-kwiaty-kalinowka',cat:'dekoracje',t:'Stół Pary Młodej',a:'Stół Pary Młodej z bukietami kolorowych kwiatów i napisem Zakochani na jasnej ścianie',r:1.333},
    {p:'scianka-kwiatowa-neon-kalinowka',cat:'dekoracje',t:'Ścianka kwiatowa',a:'Kwiatowa ścianka w kształcie obręczy z neonem, dekoracja wesela w Kalinówce',r:0.75},
    {p:'nakrycie-stolu-weselnego-zlote-talerze-kalinowka',cat:'dekoracje',t:'Nakrycie stołu',a:'Nakrycie okrągłego stołu weselnego z różowymi serwetkami, złotymi talerzami i numerem stołu',r:1.153},
    {p:'stol-weselny-zlota-obrecz-kalinowka',cat:'dekoracje',t:'Stół z kwiatową obręczą',a:'Stół weselny przed złotą kwiatową obręczą i ścianką ze światełkami',r:1.275},
    {p:'dekoracja-stolu-roze-suszone-kwiaty-kalinowka',cat:'dekoracje',t:'Dekoracje stołu',a:'Dekoracja stołu weselnego z różami i suszonymi kwiatami, w tle ścianka ze światełkami',r:0.932},
    {p:'krzeslo-slubne-wstazki-zielen-kalinowka',cat:'dekoracje',t:'Krzesło z kwiatami',a:'Krzesło ślubne przystrojone wstążkami i zielonym wiankiem z kwiatami',r:1.499},
    {p:'slodki-stol-ciasta-paczki-kalinowka',cat:'jedzenie',t:'Słodki stół',a:'Słodki stół z ciastami, eklerkami i ścianką z pączkami na przyjęciu w Kalinówce',r:0.75},
    {p:'stol-z-wedlinami-pieczywem-kalinowka',cat:'jedzenie',t:'Stół z przekąskami',a:'Stół z wędlinami, pieczywem i przekąskami w wiejskim stylu na przyjęciu w Kalinówce',r:1.333},
    {p:'bukiety-polnych-kwiatow-sala-kalinowka',cat:'jedzenie',t:'Bufet weselny',a:'Kolorowe bukiety polnych kwiatów na stołach w sali weselnej Kalinówki',r:1.333}
  ];
  const catLabels={all:'Wszystko',sala:'Sala',ogrod:'Ogród',plener:'Śluby plenerowe',dekoracje:'Dekoracje',jedzenie:'Jedzenie',realizacje:'Realizacje'};
  const filterWrap=$('#galleryFilters'), masonry=$('#masonry');
  Object.keys(catLabels).forEach((k,i)=>{
    const b=document.createElement('button');
    b.className='filter-chip'+(k==='all'?' on':''); b.textContent=catLabels[k]; b.dataset.cat=k;
    filterWrap.appendChild(b);
  });
  gallery.forEach((g,i)=>{
    const a=document.createElement('a');
    a.href='#'; a.className='m-item'; a.dataset.cat=g.cat; a.dataset.idx=i;
    a.innerHTML=`<img loading="lazy" style="aspect-ratio:${g.r||1.3}" alt="${g.a||g.t}" src="/img/t/${g.p}.webp"><span class="m-cat">${catLabels[g.cat]}</span>`;
    masonry.appendChild(a);
  });
  filterWrap.addEventListener('click',e=>{
    const b=e.target.closest('.filter-chip'); if(!b)return;
    $$('.filter-chip').forEach(c=>c.classList.remove('on')); b.classList.add('on');
    const cat=b.dataset.cat;
    $$('.m-item').forEach(it=>{
      it.classList.toggle('hide', cat!=='all' && it.dataset.cat!==cat);
    });
  });

  /* ---------- LIGHTBOX ---------- */
  const lb=$('#lightbox'), lbImg=$('#lbImg'), lbCap=$('#lbCaption');
  let curList=[], curIdx=0;
  function visibleItems(){return $$('.m-item').filter(it=>!it.classList.contains('hide'));}
  function openLb(idx){
    curList=visibleItems(); curIdx=idx;
    showLb();
    lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  }
  function showLb(){
    const it=curList[curIdx]; const gi=gallery[+it.dataset.idx];
    lbImg.src=`/img/f/${gi.p}.webp`; lbImg.alt=gi.a||gi.t; lbCap.textContent=gi.t;
  }
  masonry.addEventListener('click',e=>{
    const it=e.target.closest('.m-item'); if(!it)return; e.preventDefault();
    const vis=visibleItems(); openLb(vis.indexOf(it));
  });
  function lbNav(d){curIdx=(curIdx+d+curList.length)%curList.length; showLb();}
  $('#lbNext').addEventListener('click',()=>lbNav(1));
  $('#lbPrev').addEventListener('click',()=>lbNav(-1));
  function closeLb(){lb.classList.remove('open');lb.setAttribute('aria-hidden','true');document.body.style.overflow='';}
  $('#lbClose').addEventListener('click',closeLb);
  lb.addEventListener('click',e=>{if(e.target===lb)closeLb();});

  /* ---------- REVIEWS ---------- */
  const track=$('#reviewTrack');
  const reviews=$$('.review-card',track);
  let rIdx=0;
  function perView(){return window.innerWidth<=640?1:(window.innerWidth<=980?2:3);}
  function reviewMove(){
    const pv=perView(); const max=Math.max(0,reviews.length-pv);
    rIdx=Math.min(rIdx,max);
    const card=$('.review-card'); if(!card)return;
    const step=card.offsetWidth+26;
    track.style.transform=`translateX(${-rIdx*step}px)`;
  }
  $('#revNext').addEventListener('click',()=>{const pv=perView();rIdx=Math.min(rIdx+1,reviews.length-pv);reviewMove();});
  $('#revPrev').addEventListener('click',()=>{rIdx=Math.max(rIdx-1,0);reviewMove();});
  window.addEventListener('resize',reviewMove);
  reviewMove();

  /* ---------- FAQ ---------- */
  const faqWrap=$('#faqList');
  faqWrap.addEventListener('click',e=>{
    const btn=e.target.closest('.faq-q'); if(!btn)return;
    const item=btn.parentElement; const ans=item.querySelector('.faq-a');
    const open=item.classList.contains('open');
    if(open){item.classList.remove('open');ans.style.maxHeight=null;}
    else{item.classList.add('open');ans.style.maxHeight=ans.scrollHeight+'px';}
    btn.setAttribute('aria-expanded',open?'false':'true');
  });

  /* ---------- VIDEO MODAL ---------- */
  const vmodal=$('#vmodal'), vmShow=$('#vmShow');
  const vmImgs=['strefa-relaksu-ogrod-lezaki-kalinowka','ceremonia-plenerowa-biale-krzesla-kalinowka','jasna-sala-weselna-okna-kalinowka','budynek-kalinowki-wieczorem-kalinowka','wejscie-taras-wieczorem-kalinowka','stol-z-wedlinami-pieczywem-kalinowka','slodki-stol-ciasta-paczki-kalinowka'];
  let vmBuilt=false, vmI=0, vmTimer;
  function buildVm(){
    if(vmBuilt)return; vmBuilt=true;
    vmImgs.forEach((id,i)=>{const s=document.createElement('div');s.className='vslide'+(i===0?' on':'');s.style.backgroundImage=`url('/img/f/${id}.webp')`;vmShow.appendChild(s);});
  }
  function openVm(){
    buildVm(); vmodal.classList.add('open'); vmodal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
    const sl=$$('.vslide',vmShow); vmI=0; sl.forEach((s,i)=>s.classList.toggle('on',i===0));
    clearInterval(vmTimer);
    vmTimer=setInterval(()=>{sl[vmI].classList.remove('on');vmI=(vmI+1)%sl.length;sl[vmI].classList.add('on');},3200);
  }
  function closeVm(){vmodal.classList.remove('open');vmodal.setAttribute('aria-hidden','true');document.body.style.overflow='';clearInterval(vmTimer);}
  $('#openFilm').addEventListener('click',openVm);
  $('#openTour').addEventListener('click',openVm);
  $('#vmClose').addEventListener('click',closeVm);
  vmodal.addEventListener('click',e=>{if(e.target===vmodal)closeVm();});

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeLb();closeVm();drawer.classList.remove('open');}
    if(lb.classList.contains('open')){if(e.key==='ArrowRight')lbNav(1);if(e.key==='ArrowLeft')lbNav(-1);}
  });

  /* ---------- FORM VALIDATION ---------- */
  function validate(form){
    let ok=true;
    $$('[required]',form).forEach(inp=>{
      const field=inp.closest('.field'); let bad=inp.type==='checkbox'?!inp.checked:!inp.value.trim();
      if(inp.type==='email' && inp.value.trim()){bad=!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value);}
      field.classList.toggle('invalid',bad); if(bad)ok=false;
    });
    return ok;
  }
  function liveClear(form){
    $$('[required]',form).forEach(inp=>{
      inp.addEventListener('input',()=>{const f=inp.closest('.field');if(f.classList.contains('invalid'))f.classList.remove('invalid');});
      inp.addEventListener('change',()=>{const f=inp.closest('.field');if(f.classList.contains('invalid'))f.classList.remove('invalid');});
    });
  }

  // lead form (hero) -> scroll to full booking and prefill
  const lead=$('#leadForm');
  liveClear(lead);
  lead.addEventListener('submit',e=>{
    e.preventDefault();
    if(!validate(lead))return;
    // prefill booking form
    const map={date:'#b-date',guests:'#b-guests',name:'#b-name',phone:'#b-phone',email:'#b-email'};
    const bc=$('#b-consent'), lc=$('#l-consent'); if(bc&&lc) bc.checked=lc.checked;
    Object.entries(map).forEach(([k,sel])=>{const src=lead.querySelector(`[name="${k}"]`);const dst=$(sel);if(src&&dst&&src.value)dst.value=src.value;});
    document.getElementById('termin').scrollIntoView({behavior:reduce?'auto':'smooth'});
    setTimeout(()=>submitBooking(true),reduce?0:700);
  });

  // booking form
  const booking=$('#bookingForm'), thanks=$('#bookingThanks');
  liveClear(booking);
  // Endpoint formularza (np. Formspree) ustawiany w <meta name="form-endpoint">.
  // Bez endpointu zapytanie otwiera się w programie pocztowym (mailto) - nic nie jest "udawane".
  const ENDPOINT=(document.querySelector('meta[name="form-endpoint"]')||{}).content||'';
  const MAIL='kontakt@kalinowka.com.pl';
  function showError(msg){
    let p=$('.form-error',booking);
    if(!p){p=document.createElement('p');p.className='form-error';p.setAttribute('role','alert');p.style.cssText='color:#8a2b1f;margin:12px 0 0;font-size:15px';booking.appendChild(p);}
    p.textContent=msg;
  }
  function showThanks(){
    if(window.gtag)window.gtag('event','generate_lead',{form:'zapytanie'});
    booking.style.display='none'; thanks.classList.add('show');
    thanks.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
  }
  let tokCache=null;
  async function getToken(){
    if(tokCache&&Date.now()-tokCache.at<6000000)return tokCache.tok;
    try{const r=await fetch(ENDPOINT+'?t=1',{headers:{'Accept':'application/json'}});const j=await r.json();if(j.tok){tokCache={tok:j.tok,at:Date.now()};return j.tok;}}catch(e){}
    return '';
  }
  if(ENDPOINT)getToken();
  async function submitBooking(prefilled){
    if(!validate(booking)){if(!prefilled)booking.querySelector('.invalid')?.scrollIntoView({behavior:'smooth',block:'center'});return;}
    const data=new FormData(booking);
    if(ENDPOINT)data.append('tok',await getToken());
    const btn=$('button[type="submit"]',booking); if(btn)btn.disabled=true;
    try{
      if(ENDPOINT){
        const r=await fetch(ENDPOINT,{method:'POST',body:data,headers:{'Accept':'application/json'}});
        const j=await r.json().catch(()=>({}));
        if(!r.ok||!j.ok){showError(j.error||'Nie udało się wysłać zapytania. Zadzwoń: 501 743 517 lub napisz na '+MAIL+'.');return;}
        showThanks();
      }else{
        const body=['Imię i nazwisko','Telefon','E-mail','Data','Liczba gości','Typ wydarzenia','Wiadomość']
          .map((l,i)=>l+': '+(data.get(['name','phone','email','date','guests','type','message'][i])||'')).join('\n');
        location.href='mailto:'+MAIL+'?subject='+encodeURIComponent('Zapytanie o termin')+'&body='+encodeURIComponent(body);
      }
    }catch(err){
      showError('Nie udało się wysłać zapytania. Zadzwoń: 501 743 517 lub napisz na '+MAIL+'.');
    }finally{if(btn)btn.disabled=false;}
  }
  booking.addEventListener('submit',e=>{e.preventDefault();submitBooking(false);});

})();
