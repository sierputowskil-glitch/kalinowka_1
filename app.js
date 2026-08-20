/* =========================================================
   KALINÓWKA — interactions
   ========================================================= */
(function(){
  "use strict";
  const $ = (s,c)=>(c||document).querySelector(s);
  const $$ = (s,c)=>Array.from((c||document).querySelectorAll(s));
  const U = (id,w,q)=>`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w||1200}&q=${q||80}`;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- year ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- HERO slideshow ---------- */
  const heroImgs = [
    {src:'img/f/p27.jpg', alt:'Ceremonia ślubu plenerowego w ogrodzie Kalinówki, białe krzesła i kwiatowa brama'},
    {src:'img/f/p33.jpg', alt:'Para młoda podczas ceremonii w ogrodzie Kalinówki'},
    {src:'img/f/p74.jpg', alt:'Ślub plenerowy na trawniku Kalinówki na tle drewnianego budynku'},
    {src:'img/f/p69.jpg', alt:'Stół Pary Młodej z kwiatową obręczą i lampkami w sali Kalinówki'},
    {src:'img/f/p12.jpg', alt:'Wieczorny stół weselny z girlandą i świecami'}
  ];
  const slidesWrap = $('#heroSlides'), dotsWrap = $('#heroDots');
  heroImgs.forEach((im,i)=>{
    const d=document.createElement('div');
    d.className='hero-slide'+(i===0?' active':'');
    d.style.backgroundImage=`url('${im.src}')`;
    d.setAttribute('role','img'); d.setAttribute('aria-label',im.alt);
    slidesWrap.appendChild(d);
    const b=document.createElement('button');
    b.className=(i===0?'on':''); b.setAttribute('aria-label','Slajd '+(i+1));
    b.addEventListener('click',()=>go(i));
    dotsWrap.appendChild(b);
  });
  // preload
  heroImgs.slice(1).forEach(im=>{const x=new Image();x.src=im.src;});
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
    {p:'p27',cat:'plener',t:'Ceremonia w ogrodzie',r:1.499},
    {p:'p28',cat:'plener',t:'Ślub plenerowy nad rzeką',r:1.499},
    {p:'p74',cat:'plener',t:'Ceremonia na trawniku',r:0.75},
    {p:'p33',cat:'realizacje',t:'Para Młoda w ogrodzie',r:1.499},
    {p:'p07',cat:'ogrod',t:'Krzesła w ogrodzie',r:1.499},
    {p:'p05',cat:'ogrod',t:'Kwiatowa brama ślubna',r:1.499},
    {p:'p31',cat:'ogrod',t:'Budynek Kalinówki',r:0.667},
    {p:'p36',cat:'ogrod',t:'Wejście wieczorem',r:1.499},
    {p:'p02',cat:'ogrod',t:'Ogród z bramą',r:0.945},
    {p:'p19',cat:'ogrod',t:'Strefa relaksu w ogrodzie',r:1.499},
    {p:'p20',cat:'sala',t:'Drewniana sala z arkadą',r:1.499},
    {p:'p64',cat:'sala',t:'Wejście na salę',r:0.75},
    {p:'p16',cat:'sala',t:'Sala pod belkami',r:1.499},
    {p:'p08',cat:'sala',t:'Sala w światłach lampek',r:0.75},
    {p:'p10',cat:'sala',t:'Stoły weselne',r:1.499},
    {p:'p34',cat:'sala',t:'Eleganckie nakrycia',r:0.75},
    {p:'p60',cat:'sala',t:'Sala bankietowa',r:1.333},
    {p:'p66',cat:'sala',t:'Sala dla gości',r:1.535},
    {p:'p72',cat:'sala',t:'Wnętrze sali',r:0.75},
    {p:'p65',cat:'sala',t:'Przyjęcie w sali',r:1.499},
    {p:'p01',cat:'dekoracje',t:'Kompozycja kwiatowa',r:0.75},
    {p:'p12',cat:'dekoracje',t:'Wieczorny stół ze świecami',r:1.499},
    {p:'p15',cat:'dekoracje',t:'Świece i zieleń',r:0.75},
    {p:'p17',cat:'dekoracje',t:'Kwiatowa obręcz',r:0.75},
    {p:'p39',cat:'dekoracje',t:'Napis „Miłość”',r:1.499},
    {p:'p56',cat:'dekoracje',t:'Stół Pary Młodej',r:1.333},
    {p:'p57',cat:'dekoracje',t:'Ścianka kwiatowa',r:0.75},
    {p:'p59',cat:'dekoracje',t:'Nakrycie stołu',r:1.153},
    {p:'p69',cat:'dekoracje',t:'Stół z kwiatową obręczą',r:1.275},
    {p:'p68',cat:'dekoracje',t:'Dekoracje stołu',r:0.932},
    {p:'p75',cat:'dekoracje',t:'Krzesło z kwiatami',r:1.499},
    {p:'p32',cat:'jedzenie',t:'Słodki stół',r:0.75},
    {p:'p70',cat:'jedzenie',t:'Stół z przekąskami',r:1.333},
    {p:'p71',cat:'jedzenie',t:'Bufet weselny',r:1.333}
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
    a.innerHTML=`<img loading="lazy" style="aspect-ratio:${g.r||1.3}" alt="${g.t} — Kalinówka, sala weselna Gdańsk" src="img/t/${g.p}.jpg"><span class="m-cat">${catLabels[g.cat]}</span>`;
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
    lbImg.src=`img/f/${gi.p}.jpg`; lbImg.alt=gi.t; lbCap.textContent=gi.t;
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
  const reviews=[
    {q:'Marzyliśmy o ślubie w ogrodzie i Kalinówka spełniła to w 100%. Ceremonia nad rzeką, światło między drzewami — goście do dziś o tym mówią.',n:'Ania & Marek',d:'Wesele · czerwiec 2024',av:'p33'},
    {q:'Kameralnie, elegancko i z ogromnym sercem. Domowa kuchnia zachwyciła wszystkich, a obsługa zadbała o każdy detal.',n:'Kasia & Tomek',d:'Wesele · wrzesień 2024',av:'p59'},
    {q:'Najpiękniejsze miejsce na ślub plenerowy w Trójmieście. Blisko centrum, a czuliśmy się jak za miastem, w otoczeniu zieleni.',n:'Magda & Paweł',d:'Ślub plenerowy · lipiec 2023',av:'p27'},
    {q:'Plan B okazał się równie piękny jak A — deszcz nas nie wystraszył. Profesjonalizm i spokój gospodarzy to skarb.',n:'Ewa & Krzysztof',d:'Wesele · maj 2024',av:'p69'},
    {q:'Prywatność, natura i klimat, którego nie znaleźliśmy nigdzie indziej. Polecamy każdej parze szukającej czegoś wyjątkowego.',n:'Ola & Bartek',d:'Wesele · sierpień 2023',av:'p74'},
    {q:'Organizacja od A do Z, świetna współpraca z florystką i fotografem. Mogliśmy po prostu cieszyć się swoim dniem.',n:'Natalia & Michał',d:'Wesele · październik 2024',av:'p57'}
  ];
  const track=$('#reviewTrack');
  reviews.forEach(r=>{
    const c=document.createElement('div'); c.className='review-card';
    c.innerHTML=`<div class="stars"><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg></div>
      <p class="quote">„${r.q}”</p>
      <div class="who"><span class="av" style="background-image:url('img/t/${r.av}.jpg')"></span><span><span class="nm">${r.n}</span><br><span class="dt">${r.d}</span></span></div>`;
    track.appendChild(c);
  });
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
  const faqs=[
    ['Ile kosztuje wesele w Gdańsku?','Koszt wesela zależy od liczby gości, wybranego menu i dodatków. W Kalinówce przygotowujemy indywidualną wycenę — wyślij zapytanie z datą i liczbą gości, a przedstawimy wstępną propozycję dopasowaną do Waszych oczekiwań.'],
    ['Ile osób pomieści sala?','Komfortowo organizujemy przyjęcia weselne do około 150 gości. Świetnie sprawdzamy się również przy kameralnych weselach w mniejszym gronie.'],
    ['Czy organizujecie śluby plenerowe?','Tak. Oferujemy ceremonie plenerowe na trawniku oraz na tarasach nad rzeką Strzyżą. W Kalinówce ceremonia w plenerze nie wiąże się z dodatkowymi kosztami.'],
    ['Czy można zorganizować ceremonię i wesele w jednym miejscu?','Oczywiście. Ceremonia odbywa się w ogrodzie lub na tarasie, a przyjęcie tuż obok — bez przejazdów i bez pośpiechu dla Was i Waszych gości.'],
    ['Czy jest parking?','Tak, na terenie obiektu znajduje się wygodny parking dla gości.'],
    ['Jak wygląda menu weselne?','Stawiamy na domową kuchnię — m.in. własnoręcznie przygotowywany makaron, sezonowe dania, desery i ciasta. Menu ustalamy indywidualnie.'],
    ['Czy można ustalić indywidualne menu?','Tak. Każde menu układamy wspólnie z Parą Młodą, uwzględniając preferencje smakowe, diety i pomysły gości.'],
    ['Czy jest plan B przy złej pogodzie?','Tak. W razie niepogody elegancko przenosimy ceremonię i przyjęcie pod dach — bez stresu i bez utraty klimatu.'],
    ['Czy można obejrzeć salę przed rezerwacją?','Zdecydowanie zachęcamy. Umów się na prezentację — oprowadzimy Cię po sali i terenie oraz omówimy szczegóły oferty.'],
    ['Jak zarezerwować termin?','Wyślij zapytanie z datą i liczbą gości. Oddzwonimy z informacją o dostępności, zaprosimy na prezentację i wspólnie zarezerwujemy termin.'],
    ['Czy organizujecie małe, kameralne wesela?','Tak. Kameralny klimat Kalinówki sprawia, że małe wesela wychodzą u nas wyjątkowo pięknie.'],
    ['Czy organizujecie przyjęcia firmowe?','Tak — spotkania firmowe, imprezy integracyjne i eventy biznesowe. Lokalizacja i zaplecze świetnie się do tego nadają.'],
    ['Czy można zorganizować chrzciny lub komunię?','Tak. Chrzty, komunie i inne uroczystości rodzinne organizujemy z domową kuchnią, a przy ładnej pogodzie z ogrodem i tarasami.'],
    ['Gdzie dokładnie znajduje się Kalinówka?','Mieścimy się przy ul. Potokowej 15 f w Gdańsku Matemblewie, w otoczeniu zieleni nad rzeką Strzyżą.'],
    ['Jak daleko jest od centrum Gdańska?','To zaledwie kilka minut od centrum Gdańska, z dogodnym dojazdem z całego Trójmiasta.'],
    ['Czy obiekt znajduje się blisko natury?','Tak — Kalinówka jest otoczona zielenią, ogrodem i tarasami nad rzeką, a mimo to pozostaje blisko miasta.'],
    ['Czy można zrobić sesję zdjęciową na miejscu?','Oczywiście. Ogród, tarasy i nadrzeczna sceneria to wymarzone tło dla sesji ślubnej.'],
    ['Czy są tarasy lub ogród dla gości?','Tak. Goście mają do dyspozycji ogród oraz tarasy nad rzeką Strzyżą.'],
    ['Czy można zorganizować wesele w stylu boho, glamour lub rustykalnym?','Tak. Współpracujemy z dekoratorami i florystami, którzy pomogą zrealizować dowolną stylistykę — od boho i rustykalnego po glamour.'],
    ['Z jakim wyprzedzeniem warto rezerwować termin?','Najlepsze terminy w sezonie rezerwowane są nawet z rocznym lub dłuższym wyprzedzeniem. Im wcześniej się odezwiesz, tym większy wybór dat.']
  ];
  const faqWrap=$('#faqList');
  faqs.forEach(([q,a])=>{
    const item=document.createElement('div'); item.className='faq-item';
    item.innerHTML=`<button class="faq-q" type="button"><span>${q}</span><span class="pm"></span></button><div class="faq-a"><div class="faq-a-inner">${a}</div></div>`;
    faqWrap.appendChild(item);
  });
  faqWrap.addEventListener('click',e=>{
    const btn=e.target.closest('.faq-q'); if(!btn)return;
    const item=btn.parentElement; const ans=item.querySelector('.faq-a');
    const open=item.classList.contains('open');
    if(open){item.classList.remove('open');ans.style.maxHeight=null;}
    else{item.classList.add('open');ans.style.maxHeight=ans.scrollHeight+'px';}
  });
  // FAQ schema
  $('#faq-schema').textContent=JSON.stringify({
    "@context":"https://schema.org","@type":"FAQPage",
    "mainEntity":faqs.map(([q,a])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))
  });

  /* ---------- VIDEO MODAL ---------- */
  const vmodal=$('#vmodal'), vmShow=$('#vmShow');
  const vmImgs=['p27','p33','p28','p39','p12','p69'];
  let vmBuilt=false, vmI=0, vmTimer;
  function buildVm(){
    if(vmBuilt)return; vmBuilt=true;
    vmImgs.forEach((id,i)=>{const s=document.createElement('div');s.className='vslide'+(i===0?' on':'');s.style.backgroundImage=`url('img/f/${id}.jpg')`;vmShow.appendChild(s);});
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
      const field=inp.closest('.field'); let bad=!inp.value.trim();
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
    Object.entries(map).forEach(([k,sel])=>{const src=lead.querySelector(`[name="${k}"]`);const dst=$(sel);if(src&&dst&&src.value)dst.value=src.value;});
    document.getElementById('termin').scrollIntoView({behavior:reduce?'auto':'smooth'});
    setTimeout(()=>submitBooking(true),reduce?0:700);
  });

  // booking form
  const booking=$('#bookingForm'), thanks=$('#bookingThanks');
  liveClear(booking);
  function submitBooking(prefilled){
    if(!validate(booking)){if(!prefilled)booking.querySelector('.invalid')?.scrollIntoView({behavior:'smooth',block:'center'});return;}
    booking.style.display='none'; thanks.classList.add('show');
    thanks.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
  }
  booking.addEventListener('submit',e=>{e.preventDefault();submitBooking(false);});

})();
