/* Formularze zapytań na podstronach ofertowych (landingach). Wysyłka przez /send.php. */
(function(){
  "use strict";
  var forms = Array.prototype.slice.call(document.querySelectorAll('form.js-landing-form'));
  if(!forms.length) return;

  var meta = document.querySelector('meta[name="form-endpoint"]');
  var ENDPOINT = (meta && meta.content) || '/send.php';
  var MAIL = 'kontakt@kalinowka.com.pl';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var tokCache = null;
  function getToken(){
    if(tokCache && Date.now() - tokCache.at < 6000000) return Promise.resolve(tokCache.tok);
    return fetch(ENDPOINT + '?t=1', {headers: {'Accept': 'application/json'}})
      .then(function(r){ return r.json(); })
      .then(function(j){ if(j && j.tok){ tokCache = {tok: j.tok, at: Date.now()}; return j.tok; } return ''; })
      .catch(function(){ return ''; });
  }
  getToken();

  function validate(form){
    var ok = true;
    Array.prototype.forEach.call(form.querySelectorAll('[required]'), function(inp){
      var field = inp.closest('.field'); if(!field) return;
      var bad = inp.type === 'checkbox' ? !inp.checked : !String(inp.value).trim();
      if(inp.type === 'email' && String(inp.value).trim()) bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value);
      field.classList.toggle('invalid', bad);
      if(bad) ok = false;
    });
    return ok;
  }

  function showError(form, msg){
    var p = form.querySelector('.form-error');
    if(!p){
      p = document.createElement('p'); p.className = 'form-error'; p.setAttribute('role', 'alert');
      p.style.cssText = 'color:#8a2b1f;margin:12px 0 0;font-size:15px';
      form.appendChild(p);
    }
    p.textContent = msg;
  }

  forms.forEach(function(form){
    var wrap = form.closest('.landing-form') || form.parentNode;
    var thanks = wrap.querySelector('.thanks');
    var src = form.querySelector('input[name="source"]');
    if(src && !src.value) src.value = location.pathname;

    Array.prototype.forEach.call(form.querySelectorAll('[required]'), function(inp){
      var clear = function(){ var f = inp.closest('.field'); if(f) f.classList.remove('invalid'); };
      inp.addEventListener('input', clear); inp.addEventListener('change', clear);
    });

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var old = form.querySelector('.form-error'); if(old) old.textContent = '';
      if(!validate(form)){
        var bad = form.querySelector('.invalid');
        if(bad && bad.scrollIntoView) bad.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'center'});
        return;
      }
      var btn = form.querySelector('button[type="submit"]'); if(btn) btn.disabled = true;
      var data = new FormData(form);
      getToken().then(function(tok){
        data.append('tok', tok);
        return fetch(ENDPOINT, {method: 'POST', body: data, headers: {'Accept': 'application/json'}});
      }).then(function(r){
        return r.json().catch(function(){ return {}; }).then(function(j){ return {ok: r.ok && j.ok, error: j.error}; });
      }).then(function(res){
        if(!res.ok){ showError(form, res.error || ('Nie udało się wysłać zapytania. Zadzwoń: 501 743 517 lub napisz na ' + MAIL + '.')); return; }
        if(window.gtag) window.gtag('event', 'generate_lead', {form: 'zapytanie', page: location.pathname});
        form.style.display = 'none';
        if(thanks){ thanks.classList.add('show'); thanks.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'center'}); }
      }).catch(function(){
        showError(form, 'Nie udało się wysłać zapytania. Zadzwoń: 501 743 517 lub napisz na ' + MAIL + '.');
      }).then(function(){ if(btn) btn.disabled = false; });
    });
  });
})();
