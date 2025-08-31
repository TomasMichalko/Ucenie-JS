// Shared theme + nav helpers + back-to-top
(function(){
  const html = document.documentElement;
  const THEME_KEY = 'theme'; // 'light' | 'dark'

  function applyTheme(mode){
    if(mode === 'light' || mode === 'dark'){
      html.setAttribute('data-theme', mode);
    }else{
      html.setAttribute('data-theme', 'auto');
    }
  }

  function getPreferred(){
    const saved = localStorage.getItem(THEME_KEY);
    if(saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setToggleState(btn, theme){
    if(!btn) return;
    const isDark = theme === 'dark';
    btn.setAttribute('aria-pressed', String(isDark));
    btn.setAttribute('data-mode', isDark ? 'dark' : 'light');
    const left = btn.querySelector('.toggle-label.left');
    const right = btn.querySelector('.toggle-label.right');
    if(left) left.classList.toggle('active', isDark);
    if(right) right.classList.toggle('active', !isDark);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    const backBtn = document.getElementById('backToTop');

    // Initialize theme
    const initial = localStorage.getItem(THEME_KEY) || getPreferred();
    applyTheme(initial);

    // Build toggle with text labels + moving dot
    if(btn){
      btn.innerHTML = '<span class="toggle-label left" data-mode="dark">Dark</span><span class="toggle-sep"> | </span><span class="toggle-label right" data-mode="light">Light</span><span class="toggle-dot" aria-hidden="true"></span>';
      setToggleState(btn, initial);
      // Capture clicks on labels to set a specific mode and stop generic toggle
      btn.addEventListener('click', (e) => {
        const t = e.target;
        if(!(t instanceof Element)) return;
        const mode = t.getAttribute('data-mode');
        if(mode === 'light' || mode === 'dark'){
          e.preventDefault();
          e.stopPropagation();
          // apply chosen mode
          localStorage.setItem(THEME_KEY, mode);
          applyTheme(mode);
          setToggleState(btn, mode);
        }else{
          // Fallback: toggle when clicking elsewhere in button
          const current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
          const next = current === 'dark' ? 'light' : 'dark';
          localStorage.setItem(THEME_KEY, next);
          applyTheme(next);
          setToggleState(btn, next);
        }
      }, true);
    }

    // Active nav link (safety in case aria-current missing)
    const nav = document.querySelector('.nav');
    if(nav){
      const links = nav.querySelectorAll('a[href]');
      const path = location.pathname.split('/').pop() || 'index.html';
      links.forEach(a => {
        const href = a.getAttribute('href') || '';
        if(href === path){
          a.setAttribute('aria-current', 'page');
        }
      });
      // Ensure Pong link exists in nav
      if(!nav.querySelector('a[href$="pong.html"]')){
        const a = document.createElement('a'); a.href = 'pong.html'; a.textContent = 'Pong'; nav.appendChild(a);
      }
    }

    // Footer year
    const yearEl = document.getElementById('year');
    if(yearEl){ yearEl.textContent = String(new Date().getFullYear()); }

    // Back to top
    const toggleBackVisibility = () => {
      if(!backBtn) return;
      const show = window.scrollY > 300;
      backBtn.toggleAttribute('hidden', !show);
      backBtn.classList.toggle('show', show);
    };
    window.addEventListener('scroll', toggleBackVisibility, {passive:true});
    toggleBackVisibility();
    backBtn && backBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

    // Index page enhancements: hero CTA and contact form
    const isHome = /index\.html$/.test(location.pathname) || location.pathname.endsWith('/') || location.pathname === '';
    if(isHome){
      // Update hero buttons: make Contact scroll, add Snake and Pong buttons if missing
      const heroCta = document.querySelector('.hero .cta');
      if(heroCta){
        const contactBtn = heroCta.querySelector('a.btn.primary');
        if(contactBtn){ contactBtn.setAttribute('href', '#kontakt'); }
        if(!heroCta.querySelector('a[href$="snake.html"]')){
          const snakeBtn = document.createElement('a');
          snakeBtn.className = 'btn ghost';
          snakeBtn.href = 'snake.html';
          snakeBtn.textContent = 'Zahraj si hada';
          heroCta.appendChild(snakeBtn);
        }
        if(!heroCta.querySelector('a[href$="pong.html"]')){
          const pongBtn = document.createElement('a');
          pongBtn.className = 'btn ghost';
          pongBtn.href = 'pong.html';
          pongBtn.textContent = 'Zahraj si pong';
          heroCta.appendChild(pongBtn);
        }
      }

      // Replace contact CTA with a simple form if not present
      const contactSection = document.getElementById('kontakt') || document.querySelector('section[aria-labelledby="contact-title"]');
      if(contactSection){
        contactSection.id = 'kontakt';
        const container = contactSection.querySelector('.container') || contactSection;
        const oldCta = container.querySelector('.cta');
        if(oldCta){ oldCta.remove(); }
        if(!container.querySelector('#contactForm')){
          const form = document.createElement('form');
          form.id = 'contactForm'; form.className = 'task-form'; form.setAttribute('aria-label','Kontaktný formulár');
          form.innerHTML = `
            <input id="contactEmail" name="email" type="email" placeholder="Tvoj e‑mail" aria-label="E‑mail" required />
            <textarea id="contactMessage" name="message" placeholder="Správa" aria-label="Správa" rows="3" style="grid-column: 1 / -1; resize:vertical" required></textarea>
            <button class="btn primary" type="submit">Odoslať</button>
          `;
          container.appendChild(form);
        }
      }

      // Handle contact form submit via mailto
      const contactForm = document.getElementById('contactForm');
      if(contactForm){
        contactForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = /** @type {HTMLInputElement} */(document.getElementById('contactEmail')).value.trim();
          const message = /** @type {HTMLTextAreaElement} */(document.getElementById('contactMessage')).value.trim();
          if(!email || !message) return;
          const to = 'tomasmichalko71@gmail.com';
          const subject = encodeURIComponent('Kontakt z portfólia');
          const body = encodeURIComponent(`Od: ${email}\n\nSpráva:\n${message}`);
          window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
        });
      }
    }
  });
})();
