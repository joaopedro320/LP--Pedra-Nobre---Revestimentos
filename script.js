document.getElementById('year').textContent = new Date().getFullYear();

// Nav scroll state
var nav = document.getElementById('nav');
window.addEventListener('scroll', function(){
  if(window.scrollY > 40){ nav.classList.add('scrolled'); } else { nav.classList.remove('scrolled'); }
}, {passive:true});

// Mobile menu
var burger = document.getElementById('burgerBtn');
var menu = document.getElementById('mobileMenu');
burger.addEventListener('click', function(){ menu.classList.toggle('open'); });
document.querySelectorAll('.mm-link, .mobile-menu .nav-cta').forEach(function(el){
  el.addEventListener('click', function(){ menu.classList.remove('open'); });
});

// Reveal on scroll
var revealEls = document.querySelectorAll('.reveal');
var io = new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(entry.isIntersecting){ entry.target.classList.add('in-view'); io.unobserve(entry.target); }
  });
}, {threshold:.14});
revealEls.forEach(function(el){ io.observe(el); });

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(function(item){
  item.querySelector('.faq-q').addEventListener('click', function(){
    var wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function(o){ o.classList.remove('open'); });
    if(!wasOpen){ item.classList.add('open'); }
  });
});

// GTM click tracking
document.querySelectorAll('[data-track]').forEach(function(el){
  el.addEventListener('click', function(){
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: el.getAttribute('data-track'),
      lead_tag: el.getAttribute('data-tag') || '',
      cta_location: el.getAttribute('data-loc') || ''
    });
  });
});

// Scroll depth tracking (50/75/90%)
(function(){
  var marks = {50:false,75:false,90:false};
  window.addEventListener('scroll', function(){
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    [50,75,90].forEach(function(m){
      if(!marks[m] && scrolled >= m){
        marks[m] = true;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({event:'scroll_depth', scroll_percent:m, lead_tag:'LP Revestimentos'});
      }
    });
  }, {passive:true});
})();

// ---------- CARROSSEL + LIGHTBOX ----------
(function(){
  var track = document.getElementById('carTrack');
  var items = Array.prototype.slice.call(track.querySelectorAll('.car-item'));
  var prevBtn = document.getElementById('carPrev');
  var nextBtn = document.getElementById('carNext');
  var dotsWrap = document.getElementById('carDots');
  var counterCurrent = document.getElementById('carCounterCurrent');
  var counterTotal = document.getElementById('carCounterTotal');

  counterTotal.textContent = String(items.length).padStart(2,'0');
  items.forEach(function(_, i){
    var dot = document.createElement('span');
    if(i === 0) dot.classList.add('active');
    dot.addEventListener('click', function(){
      track.scrollTo({left: items[i].offsetLeft - track.offsetLeft, behavior:'smooth'});
    });
    dotsWrap.appendChild(dot);
  });
  var dots = Array.prototype.slice.call(dotsWrap.children);

  function activeIndexFromScroll(){
    var trackLeft = track.getBoundingClientRect().left;
    var closest = 0, closestDist = Infinity;
    items.forEach(function(el, i){
      var dist = Math.abs(el.getBoundingClientRect().left - trackLeft);
      if(dist < closestDist){ closestDist = dist; closest = i; }
    });
    return closest;
  }
  function updateProgress(){
    var idx = activeIndexFromScroll();
    dots.forEach(function(d,i){ d.classList.toggle('active', i===idx); });
    counterCurrent.textContent = String(idx+1).padStart(2,'0');
  }
  var scrollTicking = false;
  track.addEventListener('scroll', function(){
    if(!scrollTicking){
      window.requestAnimationFrame(function(){ updateProgress(); scrollTicking = false; });
      scrollTicking = true;
    }
  }, {passive:true});

  function scrollAmount(){
    var item = track.querySelector('.car-item');
    return item ? item.getBoundingClientRect().width + 14 : 300;
  }
  prevBtn.addEventListener('click', function(){ track.scrollBy({left:-scrollAmount()*2, behavior:'smooth'}); });
  nextBtn.addEventListener('click', function(){ track.scrollBy({left:scrollAmount()*2, behavior:'smooth'}); });

  // Autoplay sutil do carrossel (pausa ao interagir)
  var autoplayTimer = null;
  var autoplayDelay = 4200;
  function startAutoplay(){
    stopAutoplay();
    autoplayTimer = setInterval(function(){
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      if(atEnd){
        track.scrollTo({left:0, behavior:'smooth'});
      } else {
        track.scrollBy({left:scrollAmount(), behavior:'smooth'});
      }
    }, autoplayDelay);
  }
  function stopAutoplay(){
    if(autoplayTimer){ clearInterval(autoplayTimer); autoplayTimer = null; }
  }
  track.addEventListener('mouseenter', stopAutoplay);
  track.addEventListener('touchstart', stopAutoplay, {passive:true});
  track.addEventListener('mouseleave', startAutoplay);
  prevBtn.addEventListener('click', stopAutoplay);
  nextBtn.addEventListener('click', stopAutoplay);
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    startAutoplay();
  }

  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCounter = document.getElementById('lbCounter');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var current = 0;

  function openLightbox(i){
    current = i;
    render();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({event:'gallery_open', cta_location:'carousel', lead_tag:'LP Revestimentos'});
  }
  function closeLightbox(){
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
  function render(){
    var el = items[current];
    var full = el.getAttribute('data-full') || el.querySelector('img').src;
    var cap = el.getAttribute('data-caption') || '';
    lbImg.src = full;
    lbImg.alt = cap;
    lbCounter.textContent = (String(current+1).padStart(2,'0')) + ' / ' + (String(items.length).padStart(2,'0'));
  }
  function next(){ current = (current+1) % items.length; render(); }
  function prev(){ current = (current-1+items.length) % items.length; render(); }

  items.forEach(function(el, i){
    el.addEventListener('click', function(){ openLightbox(i); });
  });
  lbClose.addEventListener('click', closeLightbox);
  lbNext.addEventListener('click', next);
  lbPrev.addEventListener('click', prev);
  lb.addEventListener('click', function(e){ if(e.target === lb){ closeLightbox(); } });
  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('open')) return;
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowRight') next();
    if(e.key === 'ArrowLeft') prev();
  });
})();

// ---------- FORMULÁRIO DE ORÇAMENTO ----------
(function(){
  // NOTA QH4: cole aqui a URL do seu Web App do Google Apps Script (Extensões > Apps Script > Implantar > Nova implantação > App da Web).
  // Sem essa URL, o formulário ainda funciona e leva pro WhatsApp normalmente — só não grava na planilha.
  var SHEETS_WEBHOOK_URL = "COLE_AQUI_A_URL_DO_APPS_SCRIPT";

  var form = document.getElementById('orcamentoForm');
  var btn = document.getElementById('formSubmitBtn');
  var hint = document.getElementById('formHint');
  var requiredFields = Array.prototype.slice.call(form.querySelectorAll('[data-required="true"]'));

  function checkValid(){
    var allFilled = requiredFields.every(function(f){ return f.value.trim().length > 0; });
    btn.disabled = !allFilled;
    btn.textContent = allFilled ? 'Enviar e falar no WhatsApp' : 'Preencha os campos obrigatórios';
    hint.classList.toggle('ok', allFilled);
    hint.textContent = allFilled ? 'Tudo certo! Ao enviar, o WhatsApp abre com sua conversa pronta.' : 'Nome, WhatsApp, perfil e tipo de projeto são obrigatórios.';
    return allFilled;
  }
  requiredFields.forEach(function(f){
    f.addEventListener('input', checkValid);
    f.addEventListener('change', checkValid);
  });
  checkValid();

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(!checkValid()) return;

    var data = {
      nome: form.nome.value.trim(),
      whatsapp: form.whatsapp.value.trim(),
      perfil: form.perfil.value,
      tipoProjeto: form.tipoProjeto.value,
      cidade: form.cidade.value.trim(),
      mensagem: form.mensagem.value.trim(),
      origem: 'LP Revestimentos'
    };

    // Envia para a planilha (Google Apps Script Web App). Modo no-cors: não bloqueia o fluxo se falhar.
    if(SHEETS_WEBHOOK_URL && SHEETS_WEBHOOK_URL.indexOf('COLE_AQUI') === -1){
      try{
        var params = new URLSearchParams(data);
        fetch(SHEETS_WEBHOOK_URL, { method:'POST', mode:'no-cors', body: params });
      }catch(err){ /* segue o fluxo mesmo se a planilha falhar */ }
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event:'form_submit',
      lead_tag:'orçamento',
      perfil:data.perfil,
      tipo_projeto:data.tipoProjeto,
      cta_location:'orcamento'
    });

    var msg = "Olá, acabei de preencher o formulário e gostaria de mais informações.";
    var waUrl = "https://wa.me/5537998234134?text=" + encodeURIComponent(msg);
    window.open(waUrl, '_blank', 'noopener');

    btn.textContent = 'Enviado! Abrindo WhatsApp…';
  });
})();
// ---------- CONTADOR ANIMADO (stats) ----------
(function(){
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  if(!counters.length) return;
  var done = {};
  var countIo = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting && !done[entry.target]){
        done[entry.target] = true;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1400;
        var start = null;
        function step(ts){
          if(!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if(progress < 1){
            requestAnimationFrame(step);
          } else {
            el.textContent = target + suffix;
          }
        }
        requestAnimationFrame(step);
        countIo.unobserve(el);
      }
    });
  }, {threshold:0.4});
  counters.forEach(function(el){ countIo.observe(el); });
})();
