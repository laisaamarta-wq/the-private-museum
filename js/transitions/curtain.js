/* Between pages the darkness closes on the point you chose, and opens again from the centre. */
(function () {
  const PM = window.PM, html = document.documentElement;
  const c = document.querySelector('.curtain');
  if (!c || !window.gsap) { html.classList.add('is-ready'); return; }
  const st = { hole: 0 };
  const paint = () => c.style.setProperty('--hole', st.hole.toFixed(2) + '%');
  const ready = () => html.classList.add('is-ready');

  function open() {
    html.classList.remove('is-leaving');
    c.style.setProperty('--cx', '50%'); c.style.setProperty('--cy', '50%');
    if (PM.RM) { gsap.fromTo(c, { opacity: 1 }, { opacity: 0, duration: 0.25, onComplete: ready }); return; }
    st.hole = 0; paint();
    gsap.to(st, { hole: 140, duration: 1.05, ease: 'power2.inOut', delay: 0.05, onUpdate: paint, onComplete: ready });
  }
  open();
  setTimeout(ready, 2400);
  addEventListener('pageshow', (e) => { if (e.persisted) { gsap.killTweensOf(st); st.hole = 140; paint(); c.style.opacity = ''; html.classList.remove('is-leaving'); ready(); } });

  /* the same darkness, for jumps inside a page (the wordmark takes you back to the doors) */
  PM.curtain = {
    close(x, y, cb) {
      html.classList.remove('is-ready'); html.classList.add('is-leaving');
      c.style.setProperty('--cx', x.toFixed(1) + '%'); c.style.setProperty('--cy', y.toFixed(1) + '%');
      c.style.opacity = 1; st.hole = 140; paint();
      gsap.to(st, { hole: 0, duration: PM.RM ? 0.01 : 0.7, ease: 'power2.in', onUpdate: paint, onComplete: cb });
    },
    open() { open(); },
  };
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.protocol === 'mailto:') return;
    if (url.pathname === location.pathname && url.hash) return;
    const samePage = url.pathname.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '');
    if (samePage && PM.restart) {
      e.preventDefault();
      PM.curtain.close((e.clientX || innerWidth / 2) / innerWidth * 100, (e.clientY || innerHeight / 2) / innerHeight * 100, PM.restart);
      return;
    }
    e.preventDefault();
    html.classList.add('is-leaving');
    c.style.setProperty('--cx', ((e.clientX || innerWidth / 2) / innerWidth * 100).toFixed(1) + '%');
    c.style.setProperty('--cy', ((e.clientY || innerHeight / 2) / innerHeight * 100).toFixed(1) + '%');
    if (PM.RM) { c.style.opacity = 1; st.hole = 0; paint(); location.href = url.href; return; }
    st.hole = 140; paint(); c.style.opacity = 1;
    gsap.to(st, { hole: 0, duration: 0.6, ease: 'power2.in', onUpdate: paint, onComplete: () => { location.href = url.href; } });
  });
})();
