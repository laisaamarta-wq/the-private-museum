/* The walk. One variable, u (time along the walk, in units), drives every layer on desktop.
   Phones and reduced motion get the vertical walk, where lamps wake as each vitrine reaches the centre. */
(function () {
  const PM = window.PM, html = document.documentElement;
  const G = window.PM_GLINTS || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const journey = $('#journey');
  if (!journey) return;

  const rooms = $$('.room', journey).map((el) => ({
    el, slug: el.dataset.slug, fx: +el.dataset.fx, fy: +el.dataset.fy,
    dust: el.dataset.dust.split(',').map(Number), leanAmt: +el.dataset.lean || 0.3,
    plates: $('.room__plates', el), macro: $('.room__macro', el), macroImg: $('.macro__img', el),
    torch: new PM.Torch($('.torch', el)), awake: false, lit: 0,
    gRoom: $('[data-glints="room"]', el), gMacro: $('[data-glints="macro"]', el),
  }));
  const N = rooms.length, LAST = N - 1;
  const words = $$('.roomword', journey), pilasters = $$('.pilaster', journey);
  const doorTorch = new PM.Torch($('.torch--door', journey));
  const proDoor = $('.pro--door'), proGal = $('.pro--gallery');
  const glowEl = $('.pro-glow'), proGalImg = $('.pro--gallery img'), track = $('.track'), intro = $('.intro'), note = $('.gallery-note'), hint = $('.hint');
  const finale = $('.finale'), finPic = $('.finale__pic'), finShade = $('.finale__shade');
  const statusEl = $('.status'), statusText = $('.status__text');
  const rail = $('.rail'), railLinks = $$('.rail a'), railLine = $('.rail__line span');
  const canvas = $('.dust'), ctx = canvas.getContext('2d');
  const NUM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  /* timeline, in units: prologue, then one block of R units per salon, then the rotunda */
  const PRO = 7.4, R = 8.9;
  const WAKE = 0.8, CARD = [1.3, 3.0], LEAN = [2.6, 4.0], MACRO = [3.2, 4.0], CAP = [4.1, 5.7], BACK = [5.6, 6.9], WALK = [6.7, 8.9];
  const S = (k) => PRO + k * R;
  const FIN = S(LAST) + 6.9;
  const TOTAL = FIN + 2.7;
  const DOOR = { x0: 0.395, x1: 0.605, y0: 0.285, y1: 0.78, cx: 0.5, cy: 0.532 };
  const ARCH = { x0: 0.44, x1: 0.56, y0: 0.23, y1: 0.74, cx: 0.5, cy: 0.485 };
  let entryScale = 1;
  const UNIT = 0.32; /* viewport heights of scroll per unit */
  /* resting points: when the visitor stops scrolling near one, the walk settles there */
  const HOLD_LIT = 2.1, HOLD_MACRO = 5.0;
  /* the walk is a sequence of views; each gesture glides to the next one at a calm, fixed pace */
  /* the walk is a sequence of views; each step of scroll (one screen) performs exactly one action:
     doors part, walk into the enfilade, walk into a salon, lean in, walk on to the next salon ... finale.
     Inside each step the action plays in the middle and holds at both ends, so a gesture always lands on a view. */
  const stops = [0, 1.9, 5.0];
  for (let k = 0; k < 7; k++) { stops.push(S(k) + HOLD_LIT, S(k) + HOLD_MACRO); if (k < 6) stops.push(S(k) + 7.75); }
  stops.push(FIN + 2.2);
  const STEP = 1.2; /* viewport heights of scroll per action */
  /* soft in and out at each view, but the scene keeps moving with every bit of scroll (never a dead plateau) */
  const plateau = (f) => { const x = PM.clamp(f, 0, 1); return 0.45 * x + 0.55 * x * x * (3 - 2 * x); };
  const uFromStep = (sp) => {
    const n = stops.length - 1, c = PM.clamp(sp, 0, n), i = Math.min(n - 1, Math.floor(c));
    return stops[i] + (stops[i + 1] - stops[i]) * plateau(c - i);
  };
  const stepY = (i) => top + i * STEP * H;
  const stepOfU = (v) => { let i = 0; stops.forEach((st, j) => { if (Math.abs(st - v) < Math.abs(stops[i] - v)) i = j; }); return i; };

  const desktop = matchMedia('(min-width: 900px)');
  let mode = '';
  let W = 0, H = 0, top = 0, u = 0, target = 0, stepPos = 0, pilW = 0, pilH = 0;

  function layout() {
    W = innerWidth; H = innerHeight;
    const r = Math.min(W, H) * 0.26;
    if (mode === 'journey') {
      journey.style.height = ((stops.length - 1) * STEP * H + H).toFixed(0) + 'px';
      rooms.forEach((rm, k) => {
        rm.el.style.left = (k * W).toFixed(0) + 'px';
        rm.torch.size(W, H, r);
        rm.focal = PM.cover(rm.fx, rm.fy, W, H);
        rm.plates.style.transformOrigin = `${rm.focal[0]}px ${rm.focal[1]}px`;
        PM.glints(rm.gRoom, G[rm.slug] && G[rm.slug].room, W, H, PM.IMG_ASPECT, 14);
        if (PM.narrow()) rm.gMacro.textContent = ''; else PM.glints(rm.gMacro, G[rm.slug] && G[rm.slug].macro, W, H, PM.IMG_ASPECT, 10);
      });
      pilH = H * 1.18; pilW = pilH * (511 / 2600);
      pilasters.forEach((p) => { p.style.width = pilW.toFixed(0) + 'px'; p.style.height = pilH.toFixed(0) + 'px'; });
      doorTorch.size(W, H, r * 1.1);
      const dpr = Math.min(devicePixelRatio || 1, 1.25);
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    } else {
      journey.style.height = '';
      rooms.forEach((rm) => {
        const b = rm.plates.getBoundingClientRect();
        rm.torch.size(b.width, b.height, b.width * 0.36);
        rm.gRoom.textContent = '';
      });
      const db = proDoor.getBoundingClientRect();
      doorTorch.size(db.width, db.height, db.width * 0.4);
    }
    top = journey.getBoundingClientRect().top + PM.scrollY();
  }

  function setMode() {
    const next = !PM.RM ? 'journey' : 'story'; /* the walk runs on phones too */
    if (next === mode) { layout(); return; }
    mode = next;
    html.classList.toggle('mode-journey', mode === 'journey');
    $$('*', journey).forEach((el) => { el.removeAttribute('style'); for (const key of Object.keys(el)) if (key[0] === '_') delete el[key]; });
    rooms.forEach((rm) => { rm.awake = false; rm.el.classList.remove('is-awake', 'card-on', 'cap-on'); });
    layout();
    if (mode === 'story') story();
    else warm();
  }

  /* decode every photograph ahead of time so nothing stalls the walk */
  function warm() {
    const imgs = $$('img', journey);
    imgs.forEach((i) => (i.loading = 'eager'));
    let n = 0;
    const next = () => { if (n >= imgs.length) return; const i = imgs[n++]; (i.decode ? i.decode() : Promise.resolve()).catch(() => {}).then(() => setTimeout(next, 30)); };
    setTimeout(next, 400);
  }

  /* ---------- desktop render ---------- */
  let lastStatus = '', activeK = -2;
  function wake(rm, on) {
    if (rm.awake === on) return;
    rm.awake = on;
    rm.el.classList.toggle('is-awake', on);
  }
  function setStatus(text, on) {
    const key = text + on;
    if (key === lastStatus) return;
    lastStatus = key;
    statusText.textContent = text;
    statusEl.classList.toggle('is-on', on);
  }
  const set = (el, prop, v) => { if (el['_' + prop] !== v) { el['_' + prop] = v; el.style[prop] = v; } };

  function render(t, dt) {
    const y = PM.scrollY();
    stepPos = (y - top) / (STEP * H);
    target = uFromStep(stepPos);
    const k = 1 - Math.pow(1 - 0.065, dt / 16.67);
    u += (target - u) * k;
    if (Math.abs(target - u) < 0.0004) u = target;
    const sm = PM.smooth;

    /* prologue: a dolly through the doors. The doors part, the camera walks through the opening (the door
       photograph grows past the viewer faster than the enfilade behind it, which gives depth), and later walks on
       through the dark marble doorway into the first salon the same way. One clean image per area, never a crossfade. */
    const A = sm(0.3, 1.9, u), B = sm(1.9, 4.6, u), C = sm(5.4, 7.4, u);
    set(glowEl, 'visibility', 'hidden');
    const [dcx, dcy] = PM.cover(DOOR.cx, DOOR.cy, W, H);
    const [dx0, dy0] = PM.cover(DOOR.x0, DOOR.y0, W, H), [dx1, dy1] = PM.cover(DOOR.x1, DOOR.y1, W, H);
    const sD = 1 + 0.08 * A + 3.4 * B * B;
    const half = ((dx1 - dx0) / 2) * A;
    const r = { l: dcx - half * sD, r: dcx + half * sD, t: dcy + (dy0 - dcy) * sD, b: dcy + (dy1 - dcy) * sD };
    const doorGone = r.l <= 0 && r.r >= W && r.t <= 0 && r.b >= H;
    set(proDoor, 'visibility', doorGone ? 'hidden' : '');
    set(proGal, 'visibility', A > 0.001 && C < 1 ? '' : 'hidden');
    if (u < PRO + 0.2) {
      set(proDoor, 'opacity', '1');
      set(proDoor, 'transformOrigin', `${dcx.toFixed(1)}px ${dcy.toFixed(1)}px`);
      set(proDoor, 'transform', `scale(${sD.toFixed(4)})`);
      set(proGal, 'opacity', '1');
      set(proGal, 'clipPath', doorGone ? 'none' : `inset(${Math.max(0, r.t).toFixed(1)}px ${Math.max(0, W - r.r).toFixed(1)}px ${Math.max(0, H - r.b).toFixed(1)}px ${Math.max(0, r.l).toFixed(1)}px)`);
      /* the enfilade: far away behind the doors, arriving at its natural size as you cross the threshold */
      const [gx, gy] = PM.cover(0.5, 0.47, W, H);
      const bE = B * B * (3 - 2 * B);
      let sG = (0.62 + 0.38 * bE) * (1 + 0.05 * sm(4.4, 5.6, u)) * (1 + 1.4 * C * C);
      /* never let the hall behind be smaller than the opening it is seen through (tall phone screens) */
      if (!doorGone) {
        const cl = Math.max(0, r.l), cr = Math.min(W, r.r), ct = Math.max(0, r.t), cb = Math.min(H, r.b);
        const need = Math.max((gx - cl) / Math.max(1, gx), (cr - gx) / Math.max(1, W - gx), (gy - ct) / Math.max(1, gy), (cb - gy) / Math.max(1, H - gy));
        sG = Math.max(sG, need * 1.02);
      }
      const [hx, hy] = PM.cover(0.5, 0.6, W, H);
      const ox = C > 0 ? hx : gx, oy = C > 0 ? hy : gy;
      const tx0 = (dcx - gx) * (1 - bE), ty0 = (dcy - gy) * (1 - bE);
      set(proGalImg, 'transformOrigin', `${ox.toFixed(1)}px ${oy.toFixed(1)}px`);
      set(proGalImg, 'transform', `translate3d(${tx0.toFixed(1)}px,${ty0.toFixed(1)}px,0) scale(${sG.toFixed(4)})`);
      /* the first salon blooms out of the far vitrine of the enfilade: a soft circle of light that widens
         while the camera keeps walking forward. The salon arrives already lit, never as a dark box. */
      const [vx, vy] = PM.cover(0.5, 0.6, W, H);
      const ce = C * C * (3 - 2 * C);
      const rad = ce * Math.hypot(W, H) * 1.15;
      const soft = Math.max(80, rad * 0.45);
      if (C > 0 && C < 1) {
        set(track, 'clipPath', 'none');
        const g = `radial-gradient(circle at ${vx.toFixed(0)}px ${vy.toFixed(0)}px, #000 ${Math.max(0, rad - soft).toFixed(0)}px, transparent ${rad.toFixed(0)}px)`;
        set(track, 'webkitMaskImage', g); set(track, 'maskImage', g);
      } else { set(track, 'webkitMaskImage', 'none'); set(track, 'maskImage', 'none'); set(track, 'clipPath', 'none'); }
      entryScale = 0.82 + 0.18 * ce;
    } else { entryScale = 1; set(track, 'clipPath', 'none'); set(track, 'webkitMaskImage', 'none'); set(track, 'maskImage', 'none'); }
    const io = sm(0.15, 1.2, u);
    set(intro, 'opacity', (1 - io).toFixed(3));
    set(intro, 'transform', `translate3d(0,${(-io * 40).toFixed(1)}px,0)`);
    set(intro, 'visibility', u > 1.3 ? 'hidden' : '');
    note.classList.toggle('is-on', u > 4.3 && u < 5.5);
    hint.classList.toggle('is-off', u > 0.4);

    /* which salon, and the walk between salons */
    const k0 = PM.clamp(Math.floor((u - PRO) / R), 0, LAST);
    const tt = u - S(k0);
    const wl = k0 < LAST ? PM.clamp((tt - WALK[0]) / (WALK[1] - WALK[0]), 0, 1) : 0;
    const walk = wl * wl * wl * (wl * (wl * 6 - 15) + 10); /* smootherstep: a slow start and a long, soft arrival */
    const breath = 1 + 0.035 * Math.sin(Math.PI * wl); /* a slight forward lean while you walk between salons */
    const tx = -(k0 + walk) * W;
    const finT = sm(FIN, FIN + 1.2, u);
    set(track, 'opacity', ((u > 5.4 ? 1 : 0) * (1 - sm(FIN + 0.2, FIN + 1.1, u))).toFixed(3));
    set(track, 'transform', `scale(${breath.toFixed(4)}) translate3d(${tx.toFixed(1)}px,0,0)`);

    rooms.forEach((rm, k) => {
      const left = k * W + tx;
      const onScreen = left > -W * 1.02 && left < W * 1.02;
      set(rm.el, 'visibility', onScreen ? '' : 'hidden');
      const lt = u - S(k);
      const isActive = k === k0;
      const lean = isActive ? sm(LEAN[0], LEAN[1], lt) - sm(BACK[0], BACK[1], lt) : 0;
      /* a salon's lamp stays on behind you until you have left it */
      wake(rm, (k === 0 ? u > 5.4 : u >= PRO - 0.1 && lt > WAKE) && lt < (k === LAST ? 99 : R + 0.4));
      rm.lit += ((rm.awake ? 1 : 0) - rm.lit) * Math.min(1, dt / 1400);
      rm.el.classList.toggle('card-on', isActive && lt > CARD[0] && lt < CARD[1]);
      rm.el.classList.toggle('cap-on', isActive && lt > CAP[0] && lt < CAP[1]);
      if (!onScreen) return;
      const drift = isActive ? 0.06 * sm(WAKE, LEAN[0] + 0.4, lt) * (1 - sm(BACK[0], BACK[1], lt)) : 0;
      const sc = (1 + drift + lean * rm.leanAmt + (k === LAST ? finT * 0.25 : 0)) * (k === 0 ? entryScale : 1);
      set(rm.plates, 'transform', `scale(${sc.toFixed(4)})`);
      const mo = isActive ? sm(MACRO[0], MACRO[1], lt) - sm(BACK[0] - 0.05, BACK[1] - 0.1, lt) : 0;
      /* the close-up opens and closes like an iris around the jewel: a soft-edged circle, never two photos on top of each other */
      set(rm.macro, 'opacity', mo > 0.001 ? '1' : '0');
      const ir = (mo * mo * (3 - 2 * mo)) * 125;
      rm.macro.style.setProperty('--iris', ir.toFixed(2) + '%');
      const ms = `scale(${(1.1 - 0.1 * sm(MACRO[0], BACK[0], lt)).toFixed(4)})`;
      set(rm.macroImg, 'transform', ms); set(rm.gMacro, 'transform', ms);
      rm.macro.classList.toggle('glints-on', mo > 0.5);
      if (!rm.awake || rm.lit < 0.99) {
        const s = sc, [ox, oy] = rm.focal, P = PM.pointer;
        let px, py;
        if (P.idle()) [px, py] = PM.drift(t, ox, oy * 0.98, W * 0.12, H * 0.14);
        else { px = ox + (P.x - left - ox) / s; py = oy + (P.y - oy) / s; }
        rm.torch.place(px, py, 0.1);
      }
    });

    /* gilded pilasters pass in front at the doorways between salons, the next name behind them */
    let pi = 0;
    for (let s = 1; s < N; s++) {
      const seam = s * W + tx;
      if (seam < -W * 0.6 || seam > W * 1.6) continue;
      const px = W / 2 + (seam - W / 2) * 1.55;
      const p = pilasters[pi++];
      if (p) {
        set(p, 'opacity', '1');
        set(p, 'transform', `translate3d(${(px - pilW / 2).toFixed(1)}px,${(-(pilH - H) / 2).toFixed(1)}px,0)`);
      }
    }
    for (; pi < pilasters.length; pi++) set(pilasters[pi], 'opacity', '0');
    words.forEach((w, i) => {
      const s = i + 1;
      const show = k0 === s - 1 ? sm(WALK[0] - 0.1, WALK[0] + 0.45, tt) * (1 - sm(WALK[1] - 0.35, WALK[1], tt)) : 0;
      set(w, 'opacity', (show * 0.92).toFixed(3));
      const wx = s * W + tx;
      set(w, 'transform', `translate3d(${(W / 2 + (wx - W / 2) * 0.6).toFixed(1)}px,0,0) translate(-50%,-50%)`);
    });

    /* the rotunda: every lamp comes up together */
    set(finale, 'visibility', u > FIN - 0.1 ? '' : 'hidden');
    if (u > FIN - 0.1) {
      set(finale, 'opacity', finT.toFixed(3));
      set(finPic, 'transform', `scale(${(1.22 - 0.22 * sm(FIN, FIN + 2.2, u)).toFixed(4)})`);
      set(finShade, 'opacity', (1 - sm(FIN + 0.5, FIN + 2.0, u) * 0.92).toFixed(3));
    }
    finale.classList.toggle('is-on', u > FIN + 1.4);

    /* door torch before the doors open */
    if (u < 2.2) {
      const P = PM.pointer;
      const [cx, cy] = PM.cover(0.5, 0.5, W, H);
      if (P.idle()) doorTorch.place(...PM.drift(t, cx, cy, W * 0.2, H * 0.14), 0.06);
      else doorTorch.place(P.x, P.y, 0.1);
    }

    /* status line and rail */
    let label, lampOn = false, cur = -1;
    if (u < 0.6) label = 'Entrance, the doors are closed';
    else if (u < 4.2) label = 'Entering the house';
    else if (u < PRO) label = 'The enfilade';
    else if (u > FIN + 0.6) { label = 'The rotunda, every lamp lit'; lampOn = true; }
    else { cur = walk > 0.5 ? k0 + 1 : k0; lampOn = rooms[cur].awake; label = `Salon ${NUM[cur]} of VII, ${lampOn ? 'lamp on' : 'lamp off'}`; }
    setStatus(label, lampOn);
    if (cur !== activeK) {
      activeK = cur;
      railLinks.forEach((a, i) => (i === cur ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    }
    railLine.style.scale = `${PM.clamp((u - PRO) / (FIN - PRO), 0, 1).toFixed(4)} 1`;
    rail.classList.toggle('is-hidden', u < 4.3 || u > FIN + 0.4);

    dust(t, k0, tx);
  }

  /* settle: when the wheel stops near a key view (enfilade, lit salon, close-up, finale), glide softly onto it */
  let idleSince = 0, settling = false, restStep = 0;
  function settle() {
    const L = PM.lenis;
    if (!L) return;
    const now = performance.now();
    if (L.isScrolling) { if (!settling) idleSince = now; return; }
    settling = false;
    const near = Math.round(stepPos);
    if (Math.abs(stepPos - near) < 0.015 && near >= 0) restStep = Math.min(near, stops.length - 1);
    if (now - idleSince < 350) return;
    const n = stops.length - 1;
    if (stepPos < -0.02) return;
    if (stepPos > n + 0.02) { restStep = n; return; }
    const base = Math.floor(PM.clamp(stepPos, 0, n)), frac = PM.clamp(stepPos, 0, n) - base;
    const dir = L.direction || 1;
    const best = Math.min(n, dir > 0 ? (frac > 0.18 ? base + 1 : base) : (frac < 0.82 ? base : base + 1));
    if (Math.abs(stepPos - best) < 0.01) { restStep = best; return; }
    settling = true; idleSince = now + 99999;
    L.scrollTo(stepY(best), { duration: 0.9, easing: (x) => 1 - Math.pow(1 - x, 3), onComplete: () => { settling = false; restStep = best; idleSince = performance.now(); } });
  }

  /* stepping: a wheel, swipe or key moves one view forward or back. The glide takes 2.4 to 4.2 seconds with a
     soft ease in and out, whatever the speed of the gesture, so the walk never rushes. */
  let gliding = false, lastWheel = 0, acc = 0, gestureUsed = false;
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const endY = () => stepY(stops.length - 1);
  function nearestStop(v) { let i = 0; stops.forEach((st, j) => { if (Math.abs(st - v) < Math.abs(stops[i] - v)) i = j; }); return i; }
  function glideTo(uTarget, dur) {
    const L = PM.lenis;
    const dist = Math.abs(stepOfU(uTarget) - stepPos);
    const d = dur || PM.clamp(1.2 + dist * 0.5, 1.6, 4);
    gliding = true;
    const goal = stepOfU(uTarget);
    L.scrollTo(stepY(goal), { duration: d, easing: ease, force: true, onComplete: () => { gliding = false; restStep = goal; } });
    setTimeout(() => (gliding = false), d * 1000 + 200);
  }
  function step(dir) {
    const i = nearestStop(target);
    let j = i + dir;
    if (dir > 0 && stops[i] < target - 0.05) j = i + 1;
    if (dir < 0 && stops[i] > target + 0.05) j = i - 1;
    if (j < 0) return;
    if (j >= stops.length) { gliding = true; PM.lenis.scrollTo(endY() + H * 0.6, { duration: 1.8, easing: ease, force: true, onComplete: () => (gliding = false) }); setTimeout(() => (gliding = false), 2000); return; }
    glideTo(stops[j]);
  }
  /* one gesture, one action: the wheel can carry you at most one view past the view you were resting on */
  PM.onVirtual = (e) => {
    return true; /* every wheel movement is followed, nothing is capped */
    if (mode !== 'journey' || !PM.lenis) return true;
    const L = PM.lenis, n = stops.length - 1;
    if (L.scroll > stepY(n) + 2 || (L.scroll >= stepY(n) - 2 && e.deltaY > 0)) return true; /* the footer scrolls normally */
    const hi = stepY(Math.min(n, restStep + 1)), lo = stepY(Math.max(0, restStep - 1));
    const next = L.targetScroll + e.deltaY;
    if (e.deltaY > 0 && next > hi) { if (e.event && e.event.cancelable) e.event.preventDefault(); if (L.targetScroll < hi - 1) L.scrollTo(hi); return false; }
    if (e.deltaY < 0 && next < lo) { if (e.event && e.event.cancelable) e.event.preventDefault(); if (L.targetScroll > lo + 1) L.scrollTo(lo); return false; }
    return true;
  };
  addEventListener('keydown', (e) => {
    if (mode !== 'journey' || e.altKey || e.metaKey || e.ctrlKey || e.target.closest('input, textarea, select')) return;
    const y = PM.scrollY();
    if (y > endY() + 2) return;
    const down = ['ArrowDown', 'PageDown', ' '].includes(e.key) && !e.shiftKey, up = ['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey);
    return;
  });

  /* dust drifting in the beam of the lit salon */
  const motes = Array.from({ length: 90 }, (_, i) => {
    const r = (n) => { const v = Math.sin(i * 91.7 + n * 47.3) * 43758.5453; return v - Math.floor(v); };
    return { o: r(1) * 2 - 1, y: r(2), v: 0.004 + r(3) * 0.01, s: 0.5 + r(4) * 1.4, p: r(5) * 6.28, a: 0.25 + r(6) * 0.75 };
  });
  let dustOn = false;
  function dust(t, k0, tx) {
    const rm = rooms[k0], lt = u - S(k0);
    const amt = u >= PRO ? rm.lit * (1 - PM.smooth(MACRO[0] - 0.4, MACRO[0], lt) + PM.smooth(BACK[0], BACK[1], lt)) * (1 - PM.smooth(FIN, FIN + 0.6, u)) : 0;
    if (amt < 0.01) { if (dustOn) { ctx.clearRect(0, 0, W, H); dustOn = false; } return; }
    dustOn = true;
    ctx.clearRect(0, 0, W, H);
    const cx = k0 * W + tx + rm.focal[0], cy = rm.focal[1];
    const [r, g, b] = rm.dust;
    for (const m of motes) {
      m.y -= m.v * 0.016; if (m.y < 0) m.y += 1;
      const yy = m.y * cy * 1.05;
      const spread = W * 0.04 + (yy / cy) * W * 0.09;
      const xx = cx + m.o * spread + Math.sin(t * 0.35 + m.p) * 6;
      const fall = 1 - Math.abs(m.o);
      const a = amt * m.a * fall * fall * (0.6 + 0.4 * Math.sin(t * 0.9 + m.p)) * 0.6;
      if (a < 0.02) continue;
      ctx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(xx, yy, m.s, 0, 6.283); ctx.fill();
    }
  }

  /* ---------- phone / reduced motion: the vertical walk ---------- */
  let io;
  function story() {
    if (PM.RM) { rooms.forEach((rm) => rm.el.classList.add('is-awake')); finale.classList.add('is-on'); return; }
    io && io.disconnect();
    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.target === finale) { if (e.isIntersecting) finale.classList.add('is-on'); return; }
        const rm = rooms.find((r) => r.el === e.target.closest('.room'));
        if (rm && e.isIntersecting) wake(rm, true);
        else if (rm && e.boundingClientRect.top > 0) wake(rm, false);
      });
    }, { rootMargin: '-35% 0px -35% 0px' });
    rooms.forEach((rm) => io.observe(rm.plates));
    io.observe(finale);
  }
  function storyTick(t) {
    rooms.forEach((rm) => {
      if (rm.awake) return;
      const b = rm.plates.getBoundingClientRect();
      if (b.bottom < 0 || b.top > H) return;
      const [, cy] = PM.cover(rm.fx, rm.fy, b.width, b.height, 0.8);
      rm.torch.place(...PM.drift(t * 1.4, b.width * 0.5, cy, b.width * 0.26, b.height * 0.18), 0.2);
    });
    const db = proDoor.getBoundingClientRect();
    if (db.bottom > 0) doorTorch.place(...PM.drift(t * 1.2, db.width * 0.5, db.height * 0.5, db.width * 0.25, db.height * 0.2), 0.2);
  }

  /* ---------- navigation ---------- */
  function goRoom(k) {
    if (mode === 'journey') glideTo(S(k) + HOLD_LIT);
    else rooms[k].el.scrollIntoView({ behavior: PM.RM ? 'auto' : 'smooth' });
  }
  function goFinale() {
    if (mode === 'journey') glideTo(FIN + 2.2);
    else finale.scrollIntoView({ behavior: PM.RM ? 'auto' : 'smooth' });
  }
  railLinks.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goRoom(+a.dataset.goto); }));
  $$('a[href$="#visit"]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goFinale(); }));
  addEventListener('keydown', (e) => {
    if (mode !== 'journey' || e.altKey || e.metaKey || e.ctrlKey) return;
    if (e.target.closest('input, textarea, select')) return;
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const k = activeK < 0 ? -1 : activeK;
    const next = PM.clamp(k + (e.key === 'ArrowRight' ? 1 : -1), 0, LAST);
    if (next !== k) { e.preventDefault(); goRoom(next); }
  });
  journey.addEventListener('focusin', (e) => {
    if (mode !== 'journey') return;
    const r = e.target.closest('.room');
    if (r && +r.dataset.room !== activeK) goRoom(+r.dataset.room);
    if (e.target.closest('.finale') && u < FIN + 1.4) goFinale();
  });
  if (location.hash) {
    const k = rooms.findIndex((r) => '#' + r.slug === location.hash);
    if (k >= 0) requestAnimationFrame(() => goRoom(k));
    if (location.hash === '#visit') requestAnimationFrame(goFinale);
  }

  /* back to the closed doors, from the very beginning */
  PM.restart = () => {
    if (PM.lenis) PM.lenis.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    u = target = stepPos = 0; restStep = 0; gliding = false;
    rooms.forEach((rm) => { wake(rm, false); rm.lit = 0; rm.el.classList.remove('card-on', 'cap-on'); });
    finale.classList.remove('is-on');
    if (location.hash) history.replaceState(null, '', location.pathname);
    setTimeout(() => PM.curtain && PM.curtain.open(), 120);
  };

  setMode();
  desktop.addEventListener('change', setMode);
  let rz;
  let lastW = innerWidth, lastH = innerHeight;
  addEventListener('resize', () => {
    /* phone toolbars change the height while you scroll: ignore those, or the walk would jump */
    const dw = Math.abs(innerWidth - lastW), dh = Math.abs(innerHeight - lastH);
    if (PM.pointer.touch && dw < 2 && dh < 180) return;
    lastW = innerWidth; lastH = innerHeight;
    clearTimeout(rz); rz = setTimeout(setMode, 120);
  });
  addEventListener('load', layout);
  PM.onTick((t, dt) => (mode === 'journey' ? render(t, dt) : storyTick(t)));
})();
