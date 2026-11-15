/* The Private Museum: one clock, smooth scroll, pointer, shared helpers. */
(function () {
  const html = document.documentElement;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PM = (window.PM = window.PM || {});
  PM.RM = RM;
  PM.IMG_ASPECT = 3840 / 1629;

  /* one clock: everything runs on gsap.ticker */
  const ticks = new Set();
  PM.onTick = (fn) => { ticks.add(fn); return () => ticks.delete(fn); };
  if (window.gsap) {
    gsap.ticker.lagSmoothing(0);
    gsap.ticker.add((time, delta) => { for (const fn of ticks) fn(time, delta); });
  } else {
    html.classList.add('is-ready');
  }

  /* smooth scroll, off under reduced motion */
  if (!RM && window.Lenis && window.gsap) {
    PM.lenis = new Lenis({ lerp: 0.06, wheelMultiplier: 0.9, touchMultiplier: 1.2, virtualScroll: (e) => (PM.onVirtual ? PM.onVirtual(e) : true) });
    PM.onTick((t) => PM.lenis.raf(t * 1000));
  }
  PM.scrollY = () => (PM.lenis ? PM.lenis.scroll : window.scrollY);
  PM.scrollTo = (y, duration = 1.6) => {
    if (PM.lenis) PM.lenis.scrollTo(y, { duration, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
  };

  /* pointer: the visitor's light */
  const P = (PM.pointer = { x: innerWidth / 2, y: innerHeight * 0.5, moved: false, last: 0, touch: !matchMedia('(pointer: fine)').matches });
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    P.x = e.clientX; P.y = e.clientY; P.moved = true; P.last = performance.now();
  }, { passive: true });
  P.idle = () => !P.moved || performance.now() - P.last > 2400;

  /* where a fractional point of a 21:9 photograph lands inside an object-fit: cover box */
  PM.cover = (fx, fy, W, H, aspect = PM.IMG_ASPECT) => {
    const s = Math.max(W / aspect, H);
    const dw = s * aspect, dh = s;
    return [(W - dw) / 2 + fx * dw, (H - dh) / 2 + fy * dh];
  };
  PM.smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  PM.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  PM.lerp = (a, b, t) => a + (b - a) * t;

  /* glints: twinkles placed on the facets found in each photograph */
  PM.glints = (box, pts, W, H, aspect, max = 14) => {
    box.textContent = '';
    if (RM || !pts) return;
    const frag = document.createDocumentFragment();
    pts.slice(0, max).forEach(([fx, fy, w], i) => {
      const [x, y] = PM.cover(fx, fy, W, H, aspect);
      if (x < 0 || y < 0 || x > W || y > H) return;
      const g = document.createElement('span');
      g.className = 'glint';
      g.style.left = x.toFixed(1) + 'px';
      g.style.top = y.toFixed(1) + 'px';
      const r = Math.sin(i * 12.9898) * 43758.5453;
      const f = r - Math.floor(r);
      g.style.setProperty('--d', (4.5 + f * 4).toFixed(2) + 's');
      g.style.setProperty('--delay', (-f * 8).toFixed(2) + 's');
      g.style.setProperty('--s', (0.45 + w * 0.45 * (0.6 + f * 0.6)).toFixed(2));
      frag.appendChild(g);
    });
    box.appendChild(frag);
  };

  /* device neutral copy */
  if (P.touch) document.querySelectorAll('.hint__light').forEach((el) => (el.textContent = 'Your light follows the walk'));
})();
