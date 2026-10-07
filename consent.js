/* Zgoda na analitykę (Google Analytics 4) — skrypt Google ładuje się dopiero po zgodzie. */
(function(){
  "use strict";
  // Wstaw identyfikator strumienia GA4 (np. 'G-ABC123XYZ'). Puste = brak analityki i brak banera.
  var GA_ID = 'G-ZS6QPXRBFM';
  var KEY = 'kal_consent';
  if(!/^G-[A-Z0-9]{6,}$/.test(GA_ID)) return;

  function read(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
  function write(v){ try{ localStorage.setItem(KEY,v); }catch(e){} }

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});

  var loaded = false;
  function load(){
    if(loaded) return; loaded = true;
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, {allow_google_signals:false, allow_ad_personalization_signals:false});
  }
  function grant(){ gtag('consent','update',{analytics_storage:'granted'}); load(); }
  function clearGa(){
    var host = location.hostname.split('.').slice(-2).join('.');
    document.cookie.split(';').forEach(function(c){
      var n = c.split('=')[0].trim();
      if(n === '_ga' || n.indexOf('_ga_') === 0){
        ['', '; domain=' + host, '; domain=.' + host].forEach(function(d){
          document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  }

  var banner;
  function hide(){ if(banner){ banner.remove(); banner = null; } }
  function choose(v){
    write(v); hide();
    if(v === 'granted') grant(); else { gtag('consent','update',{analytics_storage:'denied'}); clearGa(); }
  }
  function show(){
    if(banner) return;
    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role','dialog');
    banner.setAttribute('aria-label','Ustawienia plików cookies');
    banner.innerHTML =
      '<p><strong>Cookies i analityka</strong><br>Chcemy sprawdzać, jak korzystasz z naszej strony, aby ją ulepszać. Do tego używamy Google Analytics, ale tylko za Twoją zgodą. Wybór możesz zmienić w każdej chwili. <a href="/polityka-prywatnosci/#cookies">Polityka prywatności i cookies</a></p>' +
      '<div class="cookie-actions"><button type="button" class="btn btn-outline" data-c="denied">Odrzucam</button><button type="button" class="btn btn-gold" data-c="granted">Akceptuję</button></div>';
    banner.addEventListener('click',function(e){
      var b = e.target.closest('button[data-c]'); if(b) choose(b.getAttribute('data-c'));
    });
    document.body.appendChild(banner);
  }

  function addFooterLink(){
    var spot = document.querySelector('.footer-bottom span');
    if(!spot || document.querySelector('.js-cookie-settings')) return;
    var a = document.createElement('a');
    a.href = '#'; a.className = 'js-cookie-settings'; a.textContent = 'Ustawienia cookies';
    a.addEventListener('click',function(e){ e.preventDefault(); show(); });
    spot.appendChild(document.createTextNode(' · ')); spot.appendChild(a);
  }

  var saved = read();
  if(saved === 'granted') grant();
  else if(saved !== 'denied') show();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',addFooterLink); else addFooterLink();
})();
