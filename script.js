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
  var items = Array.prototype.slice.call(track.querySelectorAll('.car-full-item'));
  var scrollbar = document.getElementById('carScrollThumb');
  var scrollbarTrack = scrollbar ? scrollbar.parentElement : null;

  function updateScrollbar(){
    if(!scrollbar || !scrollbarTrack) return;
    var maxScroll = track.scrollWidth - track.clientWidth;
    var progress = maxScroll > 0 ? track.scrollLeft / maxScroll : 0;
    var trackH = scrollbarTrack.clientHeight;
    var thumbH = Math.max(28, trackH / items.length);
    scrollbar.style.height = thumbH + 'px';
    scrollbar.style.top = (progress * (trackH - thumbH)) + 'px';
  }
  var scrollTicking = false;
  track.addEventListener('scroll', function(){
    if(!scrollTicking){
      window.requestAnimationFrame(function(){ updateScrollbar(); scrollTicking = false; });
      scrollTicking = true;
    }
  }, {passive:true});
  window.addEventListener('resize', updateScrollbar);
  updateScrollbar();

  // drag-to-scroll (mouse)
  var isDown = false, startX = 0, startScroll = 0, dragged = false;
  track.addEventListener('mousedown', function(e){
    isDown = true; dragged = false;
    startX = e.pageX; startScroll = track.scrollLeft;
    track.classList.add('dragging');
  });
  window.addEventListener('mousemove', function(e){
    if(!isDown) return;
    var dx = e.pageX - startX;
    if(Math.abs(dx) > 6) dragged = true;
    track.scrollLeft = startScroll - dx;
  });
  window.addEventListener('mouseup', function(){
    isDown = false;
    track.classList.remove('dragging');
  });
  // convert vertical wheel to horizontal scroll
  track.addEventListener('wheel', function(e){
    if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
      track.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, {passive:false});

  // ---------- AUTOPLAY ----------
  var AUTOPLAY_DELAY = 4200;
  var autoplayTimer = null;
  var autoplayPaused = false;

  function itemWidth(){
    var el = track.querySelector('.car-full-item');
    return el ? el.getBoundingClientRect().width : track.clientWidth;
  }
  function currentIndex(){
    var trackLeft = track.getBoundingClientRect().left;
    var closest = 0, closestDist = Infinity;
    items.forEach(function(el, i){
      var dist = Math.abs(el.getBoundingClientRect().left - trackLeft);
      if(dist < closestDist){ closestDist = dist; closest = i; }
    });
    return closest;
  }
  function autoplayTick(){
    if(autoplayPaused || lb.classList.contains('open') || document.hidden) return;
    var idx = currentIndex();
    var nextIdx = (idx + 1) % items.length;
    var target = nextIdx === 0 ? 0 : items[nextIdx].offsetLeft - track.offsetLeft;
    track.scrollTo({left: target, behavior:'smooth'});
  }
  function startAutoplay(){
    stopAutoplay();
    autoplayTimer = window.setInterval(autoplayTick, AUTOPLAY_DELAY);
  }
  function stopAutoplay(){
    if(autoplayTimer){ window.clearInterval(autoplayTimer); autoplayTimer = null; }
  }
  function pauseAutoplayTemporarily(){
    autoplayPaused = true;
    window.clearTimeout(track._resumeTimer);
    track._resumeTimer = window.setTimeout(function(){ autoplayPaused = false; }, 4500);
  }

  track.addEventListener('mouseenter', function(){ autoplayPaused = true; });
  track.addEventListener('mouseleave', function(){ autoplayPaused = false; });
  track.addEventListener('touchstart', pauseAutoplayTemporarily, {passive:true});
  track.addEventListener('mousedown', function(){ autoplayPaused = true; });
  window.addEventListener('mouseup', function(){ if(!track.matches(':hover')) pauseAutoplayTemporarily(); });
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) autoplayPaused = false; });

  var carSection = track.closest('section');
  var autoplayStarted = false;
  var carIO = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting && !autoplayStarted){
        autoplayStarted = true;
        startAutoplay();
      }
    });
  }, {threshold:.3});
  if(carSection) carIO.observe(carSection);

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
    el.addEventListener('click', function(){ if(!dragged) openLightbox(i); });
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