/* Object pages, catalogue and the closed room. */
(function () {
  const PM = window.PM, G = window.PM_GLINTS || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* hero: darkness with one hole that follows your light; a lamp to switch it all on */
  const hero = $('.ohero__img');
  if (hero) {
    const setLamp = PM.veil($('.veil', hero), hero);
    const g = $('.glints', hero);
    const place = () => {
      if (!g) return;
      const b = hero.getBoundingClientRect();
      const slug = g.dataset.slug;
      const narrow = innerWidth < 900;
      if (!narrow && G[slug]) PM.glints(g, G[slug].macro, b.width, b.height, PM.IMG_ASPECT, 14);
      else g.textContent = '';
    };
    place();
    addEventListener('resize', place);
    hero.classList.add('glints-on');
    const btn = $('.lamp-toggle');
    if (btn) btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      btn.querySelector('span').textContent = on ? 'Switch off the lamp' : 'Switch on the lamp';
      hero.classList.toggle('is-lamp', on);
      setLamp && setLamp(on);
    });
  }

  /* figures that wake when they reach the middle of the screen */
  const wakes = $$('[data-wake]');
  if (wakes.length) {
    if (PM.RM) wakes.forEach((w) => w.classList.add('is-awake'));
    else {
      const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-awake', e.isIntersecting)), { rootMargin: '-30% 0px -30% 0px' });
      wakes.forEach((w) => io.observe(w));
    }
  }

  /* catalogue: each line wakes its own lamp */
  const rows = $$('.crow');
  rows.forEach((row) => {
    const on = () => { rows.forEach((r) => r !== row && r.classList.remove('is-awake')); row.classList.add('is-awake'); };
    row.addEventListener('pointerenter', on);
    row.addEventListener('focusin', on);
    row.addEventListener('pointerleave', () => row.classList.remove('is-awake'));
  });
  if (rows.length && matchMedia('(max-width: 899px)').matches && !PM.RM) {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-awake', e.isIntersecting)), { rootMargin: '-35% 0px -35% 0px' });
    rows.forEach((r) => io.observe(r));
  }
  if (rows.length && PM.RM) rows.forEach((r) => r.classList.add('is-awake'));
})();
