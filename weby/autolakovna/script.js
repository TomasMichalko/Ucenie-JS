// Rok vo footeri
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu – zavrieť po kliknutí na odkaz
const navToggle = document.getElementById('nav-toggle');
document.querySelectorAll('.nav a').forEach(a => {
  a.addEventListener('click', () => { if (navToggle) navToggle.checked = false; });
});

// LOGO: scroll hore + a11y
const logo = document.getElementById('logo');
function scrollTopSmooth(){ window.scrollTo({ top: 0, behavior: 'smooth' }); }
if (logo){
  logo.addEventListener('click', scrollTopSmooth);
  logo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollTopSmooth(); }
  });
}

// Header zobrazenie
const header = document.getElementById('site-header');
const topZone = document.querySelector('.top-hover-zone');
const backToTopBtn = document.getElementById('backToTop');

function showHeader(){ header.classList.remove('hidden'); }
function hideHeader(){ if (window.scrollY > 0) header.classList.add('hidden'); }

function onScroll(){
  if (window.scrollY <= 0) showHeader(); else hideHeader();
  if (window.scrollY > 300) backToTopBtn.classList.add('show');
  else backToTopBtn.classList.remove('show');
}
window.addEventListener('scroll', onScroll);
onScroll();

if (topZone){
  topZone.addEventListener('mouseenter', showHeader);
  topZone.addEventListener('mouseleave', hideHeader);
}
header.addEventListener('mouseenter', showHeader);
header.addEventListener('mouseleave', hideHeader);

// Späť hore
backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// HERO reveal
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
});

// ==========================
//      GALÉRIA: LIGHTBOX
// ==========================
const lightbox = document.getElementById('lightbox');
if (lightbox){
  const lightboxImg  = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-arrow.prev');
  const nextBtn = document.querySelector('.lightbox-arrow.next');

  // Zoznam obrázkov + index aktuálneho
  const galleryImages = Array.from(document.querySelectorAll('.gallery-media img'));
  let currentIndex = -1;

  function openLightboxAt(index){
    if (!galleryImages.length) return;
    currentIndex = index;
    lightboxImg.src = galleryImages[currentIndex].src;
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // zablokuj scroll v pozadí
  }

  function navigate(delta){
    if (currentIndex < 0) return;
    const len = galleryImages.length;
    currentIndex = (currentIndex + delta + len) % len;
    lightboxImg.src = galleryImages[currentIndex].src;
  }

  function closeLightbox(){
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = "";
    currentIndex = -1;
    document.body.style.overflow = ''; // povoliť scroll späť
  }

  // Otváranie s indexom
  galleryImages.forEach((img, idx) => {
    img.addEventListener('click', () => openLightboxAt(idx));
  });

  // Zatváranie klikom na pozadie / "×"
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightboxClose) closeLightbox();
  });

  // Šípky – tlačidlá
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });

  // Klávesnica: ← → a Esc
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('show')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Swipe (mobil)
  let touchStartX = 0, touchEndX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, {passive:true});
  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const dx = touchEndX - touchStartX;
    if (Math.abs(dx) > 40){ if (dx > 0) navigate(-1); else navigate(1); }
  }, {passive:true});
}

// ==========================
//   KONTAKTNÝ FORMULÁR
// ==========================
const form = document.getElementById('contactForm');
const statusBox = document.getElementById('formStatus');
const sendBtn = document.getElementById('sendBtn');

if (form){
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusBox.textContent = '';
    statusBox.classList.remove('ok', 'err');

    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!email || !message){
      statusBox.textContent = 'Vyplňte e-mail a správu.';
      statusBox.classList.add('err');
      return;
    }

    sendBtn.disabled = true;
    sendBtn.textContent = 'Odosielam…';

    try{
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok){
        statusBox.textContent = data.msg || 'Ďakujeme, správa bola odoslaná.';
        statusBox.classList.add('ok');
        form.reset();
      } else {
        statusBox.textContent = (data && data.msg) ? data.msg : 'Chyba pri odosielaní. Skúste neskôr alebo zavolajte.';
        statusBox.classList.add('err');
      }
    } catch(err){
      statusBox.textContent = 'Chyba pripojenia. Skúste neskôr.';
      statusBox.classList.add('err');
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Odoslať';
    }
  });
}
