/* The torch: a soft circle of the lit photograph shown through the lights-off photograph.
   Only transforms move: the torch window one way, the image inside it the other way. */
(function () {
  const PM = window.PM;
  PM.Torch = class {
    constructor(el) {
      this.el = el;
      this.img = el.querySelector('.torch__img');
      this.x = 0; this.y = 0; this.r = 260; this.ready = false;
    }
    size(W, H, r) {
      this.r = r;
      const host = this.el.parentElement;
      host.style.setProperty('--tr2', (r * 2).toFixed(0) + 'px');
      host.style.setProperty('--rw', W.toFixed(0) + 'px');
      host.style.setProperty('--rh', H.toFixed(0) + 'px');
    }
    /* x, y in the host's local (unscaled) coordinates */
    place(x, y, ease = 0.14) {
      if (!this.ready) { this.x = x; this.y = y; this.ready = true; }
      this.x += (x - this.x) * ease;
      this.y += (y - this.y) * ease;
      const tx = this.x - this.r, ty = this.y - this.r;
      this.el.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0)`;
      this.img.style.transform = `translate3d(${(-tx).toFixed(1)}px,${(-ty).toFixed(1)}px,0)`;
    }
  };
  /* the slow drift of an unattended light: a figure of eight around a focal point */
  PM.drift = (t, cx, cy, ax, ay) => [cx + Math.sin(t * 0.33) * ax, cy + Math.sin(t * 0.66 + 1.2) * ay];

  /* a veil of darkness with a hole: used on object pages and the 404 */
  PM.veil = (veil, host) => {
    if (!veil || PM.RM) return;
    let x = 0, y = 0, on = false, init = false;
    PM.onTick((t) => {
      const r = host.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const P = PM.pointer;
      let tx, ty;
      if (P.idle()) [tx, ty] = PM.drift(t, r.width * 0.55, r.height * 0.5, r.width * 0.16, r.height * 0.14);
      else { tx = P.x - r.left; ty = P.y - r.top; }
      if (!init) { x = tx; y = ty; init = true; }
      x += (tx - x) * 0.1; y += (ty - y) * 0.1;
      veil.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%)`;
    });
    return (state) => { on = state; veil.classList.toggle('is-off', on); };
  };
})();
