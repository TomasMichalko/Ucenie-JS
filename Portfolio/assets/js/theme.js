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
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    const backBtn = document.getElementById('backToTop');

    // Initialize theme
    const initial = localStorage.getItem(THEME_KEY) || getPreferred();
    applyTheme(initial);
    setToggleState(btn, initial);

    // Toggle handler
    btn && btn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
      setToggleState(btn, next);
    });

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

