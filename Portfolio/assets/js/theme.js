// Shared theme + nav helpers + back-to-top (clean version)
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
      btn.addEventListener('click', (e) => {
        const t = e.target;
        if(!(t instanceof Element)) return;
        const mode = t.getAttribute('data-mode');
        if(mode === 'light' || mode === 'dark'){
          e.preventDefault();
          e.stopPropagation();
          localStorage.setItem(THEME_KEY, mode);
          applyTheme(mode);
          setToggleState(btn, mode);
        }else{
          const current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
          const next = current === 'dark' ? 'light' : 'dark';
          localStorage.setItem(THEME_KEY, next);
          applyTheme(next);
          setToggleState(btn, next);
        }
      }, true);
    }

    // Active nav link
    const nav = document.querySelector('.nav');
    if(nav){
      const links = nav.querySelectorAll('a[href]');
      const path = location.pathname.split('/').pop() || 'index.html';
      links.forEach(a => {
        const href = a.getAttribute('href') || '';
        if(href === path){ a.setAttribute('aria-current', 'page'); }
      });
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
  });
})();

