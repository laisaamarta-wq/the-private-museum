/* Gallery music: off until the visitor asks for it, then it rises slowly and loops without a seam. */
(function () {
  const PM = window.PM;
  const btn = document.querySelector('.sound');
  if (!btn) return;
  let audio = null, vol = 0, goal = 0, on = false;
  const MAX = 0.5;
  const read = () => { try { return localStorage.getItem('pm-sound') === 'on'; } catch (e) { return false; } };
  const save = (v) => { try { localStorage.setItem('pm-sound', v ? 'on' : 'off'); } catch (e) {} };
  function ensure() {
    if (audio) return audio;
    audio = new Audio('assets/audio/gallery.mp3');
    audio.loop = true; audio.preload = 'auto'; audio.volume = 0;
    return audio;
  }
  function set(v) {
    on = v;
    btn.setAttribute('aria-pressed', String(v));
    btn.classList.toggle('is-on', v);
    btn.querySelector('.sound__label').textContent = v ? 'Sound on' : 'Sound';
    save(v);
    const a = ensure();
    goal = v ? MAX : 0;
    if (v) a.play().catch(() => set(false));
  }
  btn.addEventListener('click', () => set(!on));
  /* a slow, even fade: about 3 s up, 1.5 s down */
  const tick = (t, dt) => {
    if (!audio) return;
    const rate = (goal > vol ? MAX / 3000 : MAX / 1500) * (dt || 16);
    vol = goal > vol ? Math.min(goal, vol + rate) : Math.max(goal, vol - rate);
    audio.volume = vol;
    if (!on && vol <= 0.001 && !audio.paused) audio.pause();
  };
  if (PM.onTick && window.gsap) PM.onTick(tick); else setInterval(() => tick(0, 50), 50);
  /* the visitor chose sound before: start again on their first touch or key, since browsers need a gesture */
  if (read()) {
    btn.classList.add('is-waiting');
    const go = () => { removeEventListener('pointerdown', go); removeEventListener('keydown', go); if (!on) set(true); btn.classList.remove('is-waiting'); };
    addEventListener('pointerdown', go, { once: true });
    addEventListener('keydown', go, { once: true });
  }
  document.addEventListener('visibilitychange', () => { if (!audio || !on) return; if (document.hidden) audio.pause(); else audio.play().catch(() => {}); });
})();
