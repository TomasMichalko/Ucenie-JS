// Cookie Consent + small heading fix
(function(){
  const STORAGE_KEY = 'cookie_consent_v1';
  const ATTR_PREFIX = 'data-consent-';

  function setCookie(name, value, days){
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    const expires = 'expires=' + d.toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + ';' + expires + ';path=/;SameSite=Lax';
  }
  function getCookie(name){
    const cname = name + '=';
    const parts = document.cookie.split(';');
    for(let c of parts){
      c = c.trim();
      if(c.indexOf(cname) === 0){
        try { return decodeURIComponent(c.substring(cname.length)); } catch(e){ return null; }
      }
    }
    return null;
  }

  function loadConsent(){
    try{
      const fromCookie = getCookie(STORAGE_KEY);
      if(fromCookie){ return JSON.parse(fromCookie); }
    }catch(e){}
    try{
      const fromLS = localStorage.getItem(STORAGE_KEY);
      if(fromLS){ return JSON.parse(fromLS); }
    }catch(e){}
    return null;
  }
  function saveConsent(consent){
    const payload = JSON.stringify(consent);
    try{ localStorage.setItem(STORAGE_KEY, payload); }catch(e){}
    setCookie(STORAGE_KEY, payload, 365);
    // reflect as attributes for other scripts
    const html = document.documentElement;
    html.setAttribute(ATTR_PREFIX + 'necessary', 'true');
    html.setAttribute(ATTR_PREFIX + 'analytics', String(!!consent.analytics));
    html.setAttribute(ATTR_PREFIX + 'marketing', String(!!consent.marketing));
    // notify listeners
    document.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: consent }));
  }

  function buildUI(){
    if(document.getElementById('cookieBanner')) return; // already present

    const banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Súhlas so súbormi cookie');
    banner.innerHTML = `
      <div class="cookie-text">
        <strong>Používame súbory cookie</strong>
        <p>Na tejto stránke používame nevyhnutné cookies na správne fungovanie a voliteľné cookies pre analytiku a marketing. Môžete prijať všetko, odmietnuť voliteľné alebo si prispôsobiť nastavenia.</p>
        <a href="#" class="cookie-link" id="cookieMoreInfo">Viac o cookies</a>
      </div>
      <div class="cookie-actions">
        <button type="button" class="btn" id="cookieSettings">Nastavenia</button>
        <button type="button" class="btn" id="cookieReject">Odmietnuť</button>
        <button type="button" class="btn primary" id="cookieAccept">Prijať všetko</button>
      </div>
    `;

    const modalWrap = document.createElement('div');
    modalWrap.id = 'cookieModalWrap';
    modalWrap.className = 'cookie-modal-wrap';
    modalWrap.innerHTML = `
      <div class="cookie-backdrop" data-close></div>
      <div class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookieTitle" aria-describedby="cookieDesc">
        <h2 id="cookieTitle">Nastavenia cookies</h2>
        <p id="cookieDesc">Nevyhnutné cookies sú potrebné na fungovanie webu a zapnuté vždy. Ďalšie môžete povoliť nižšie.</p>
        <form id="cookieForm" class="cookie-form">
          <label class="cookie-row">
            <span>
              <strong>Nevyhnutné</strong>
              <small>Potrebné pre základné fungovanie webu</small>
            </span>
            <input type="checkbox" checked disabled />
          </label>
          <label class="cookie-row">
            <span>
              <strong>Analytické</strong>
              <small>Pomáhajú nám zlepšovať web (napr. anonymná štatistika)</small>
            </span>
            <input id="ccAnalytic" type="checkbox" />
          </label>
          <label class="cookie-row">
            <span>
              <strong>Marketingové</strong>
              <small>Personalizovaný obsah a reklama</small>
            </span>
            <input id="ccMarketing" type="checkbox" />
          </label>
          <div class="cookie-modal-actions">
            <button type="button" class="btn" id="cookieCancel">Zrušiť</button>
            <button type="submit" class="btn primary">Uložiť nastavenia</button>
          </div>
          <details class="cookie-details">
            <summary>Podrobnosti a zásady používania cookies</summary>
            <p>Používame iba nevyhnutné cookies, bez ktorých stránka nefunguje korektne, a voliteľné analytické/marketingové, ktoré budú nastavené len s Vaším súhlasom. Súhlas môžete kedykoľvek zmeniť v pätičke (odkaz „Nastavenia cookies“), alebo zmazaním cookies v prehliadači.</p>
          </details>
        </form>
      </div>
    `;

    document.body.appendChild(banner);
    document.body.appendChild(modalWrap);

    // footer manage link
    const footer = document.querySelector('footer .container') || document.querySelector('footer');
    if(footer && !document.getElementById('cookieManageLink')){
      const sep = document.createTextNode(' ');
      const link = document.createElement('a');
      link.id = 'cookieManageLink';
      link.href = '#';
      link.className = 'cookie-link';
      link.textContent = 'Nastavenia cookies';
      footer.appendChild(sep);
      footer.appendChild(link);
      link.addEventListener('click', (e)=>{ e.preventDefault(); openModal(); });
    }

    // wiring
    const openBtn = banner.querySelector('#cookieSettings');
    const rejectBtn = banner.querySelector('#cookieReject');
    const acceptBtn = banner.querySelector('#cookieAccept');
    const moreInfo = banner.querySelector('#cookieMoreInfo');
    const form = modalWrap.querySelector('#cookieForm');
    const cancelBtn = modalWrap.querySelector('#cookieCancel');
    const backdrop = modalWrap.querySelector('.cookie-backdrop');
    const analytic = modalWrap.querySelector('#ccAnalytic');
    const marketing = modalWrap.querySelector('#ccMarketing');

    function openModal(){ modalWrap.classList.add('open'); }
    function closeModal(){ modalWrap.classList.remove('open'); }
    openBtn.addEventListener('click', openModal);
    cancelBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    moreInfo.addEventListener('click', (e)=>{ e.preventDefault(); openModal(); });

    acceptBtn.addEventListener('click', ()=>{
      saveConsent({ necessary: true, analytics: true, marketing: true, ts: Date.now() });
      banner.remove(); closeModal();
    });
    rejectBtn.addEventListener('click', ()=>{
      saveConsent({ necessary: true, analytics: false, marketing: false, ts: Date.now() });
      banner.remove(); closeModal();
    });
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      saveConsent({ necessary: true, analytics: !!analytic.checked, marketing: !!marketing.checked, ts: Date.now() });
      banner.remove(); closeModal();
    });
    // Pre-fill from stored values if any
    const existing = loadConsent();
    if(existing){
      analytic.checked = !!existing.analytics;
      marketing.checked = !!existing.marketing;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const consent = loadConsent();
    if(consent){
      // Reflect existing choice
      saveConsent(consent);
      return; // do not show banner again
    }
    buildUI();
  });
})();
